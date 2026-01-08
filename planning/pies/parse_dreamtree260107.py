#!/usr/bin/env python3
"""
DreamTree Content Parser
Parses the edited content file into normalized CSV tables:
- stem.csv
- content_blocks.csv
- prompts.csv
- connections.csv (templates - will need manual refinement)
"""

import re
import csv
import json
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

# Starting IDs
STEM_ID_START = 100000
CONTENT_ID_START = 100000
PROMPT_ID_START = 100000
CONNECTION_ID_START = 100000

# Tool name to ID mapping (from existing tools.csv)
TOOL_MAP = {
    'list_builder': 100000,
    'list builder': 100000,
    'soared_form': 100001,
    'soared tool': 100001,
    'skill_tagger': 100002,
    'ranking_grid': 100003,
    'rankinggrid_tool': 100003,
    'mbti_selector': 100004,
    'budget_calculator': 100005,
    'flow_tracker': 100006,
    'life_dashboard': 100007,
    'mindset_profiles': 100008,
    'failure_reframer': 100009,
    'idea_tree': 100010,
    'job_combiner': 100011,
    'career_timeline': 100012,
    'career_assessment': 100013,
    'job_analyzer': 100014,
    'credential_writer': 100015,
    'resume_builder': 100016,
    'company_tracker': 100017,
    'company_researcher': 100018,
    'research_tracker': 100019,
    'contact_tracker': 100020,
    'networking_tracker': 100021,
    'outreach_tracker': 100022,
    'meeting_prep': 100023,
    'meeting_notes': 100024,
    'referral_tracker': 100025,
    'opportunity_tracker': 100026,
    'bucketing_tool': 100027,
    'competency_assessment': 100028,
}

# Basic input types (not tools)
INPUT_TYPES = {
    'textarea': 'textarea',
    'text_input': 'text_input',
    'text input': 'text_input',
    'slider': 'slider',
    'checkbox': 'checkbox',
    'radio': 'radio',
}

@dataclass
class ParseState:
    part: int = 0
    module: int = 0
    exercise: int = 0
    activity: int = 0
    sequence: int = 0
    
    stem_id: int = STEM_ID_START
    content_id: int = CONTENT_ID_START
    prompt_id: int = PROMPT_ID_START
    connection_id: int = CONNECTION_ID_START
    
    stem_rows: List[Dict] = field(default_factory=list)
    content_rows: List[Dict] = field(default_factory=list)
    prompt_rows: List[Dict] = field(default_factory=list)
    connection_rows: List[Dict] = field(default_factory=list)
    
    # Track for connection building
    pending_connections: List[str] = field(default_factory=list)


def is_part_header(line: str) -> Optional[int]:
    """Check if line is a Part header, return part number."""
    match = re.match(r'^Part\s+(\d+):', line.strip(), re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None


def is_module_header(line: str) -> Optional[int]:
    """Check if line is a Module header, return module number."""
    match = re.match(r'^Module\s+(\d+)\s*[–-]', line.strip(), re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None


def is_exercise_start(line: str) -> Optional[int]:
    """Check if line starts a numbered exercise (1. 2. etc)."""
    match = re.match(r'^(\d+)\.\s+', line.strip())
    if match:
        return int(match.group(1))
    return None


def is_activity_start(line: str) -> Optional[str]:
    """Check if line starts a lettered activity (a) b) etc)."""
    match = re.match(r'^([a-z])\)\s+', line.strip())
    if match:
        return match.group(1)
    return None


def extract_tool_or_input(line: str) -> Optional[Dict]:
    """
    Extract {tool} or {input} pattern from line.
    Returns dict with type info or None.
    """
    match = re.match(r'^\s*\{([^}]+)\}\s*$', line.strip())
    if not match:
        return None
    
    content = match.group(1).strip().lower()
    
    # Check if it's a basic input type
    for input_key, input_type in INPUT_TYPES.items():
        if content == input_key:
            return {'type': 'input', 'input_type': input_type, 'config': None}
        if content.startswith(input_key + ' '):
            # Has config like "slider 1-10" or "slider from E to I"
            config_str = content[len(input_key):].strip()
            return {'type': 'input', 'input_type': input_type, 'config': config_str}
    
    # Check if it's a known tool
    for tool_key, tool_id in TOOL_MAP.items():
        if content == tool_key or content.startswith(tool_key + ' '):
            return {'type': 'tool', 'tool_id': tool_id, 'tool_name': tool_key}
    
    # Otherwise it's a connection instruction
    return {'type': 'connection', 'instruction': match.group(1).strip()}


def classify_content_type(line: str, state: ParseState) -> str:
    """Classify a content line as heading, instruction, or note."""
    stripped = line.strip()
    
    # Long lines are never headings
    if len(stripped) > 100:
        return 'instruction'
    
    # Check for section headers
    if is_part_header(stripped):
        return 'heading'
    if is_module_header(stripped):
        return 'heading'
    
    # Known short headings
    known_headings = [
        'Overview', 'Skills and Talents', 'Knowledges', 'Environment', 
        'People', 'Compensation', 'Family', 'Community', 'World', 'Self',
        'Sharpening', 'Grittiness', 'Mindfulness', 'Routine',
        'How You Are', 'Your Values', 'Work', 'Life', 'Alignment',
        "Creator's Mentality", 'Action Triggers', 'Reframing Failure',
        'New Growth', 'Reading the Leaves', 'Making Choices',
        'Framework', 'Support', 'Unknowns',
        'Choosing Your Level', 'Persuasive Story Telling', 'Drafting Your Story',
        'Memorable Past', 'Recent Past', 'Present',
        'Previous Employment', 'Self Identification Basics',
        'IF YOU HAVE A PARTNER', 'Take Yourself Seriously',
    ]
    if stripped in known_headings:
        return 'heading'
    
    # Roman numeral sections
    if re.match(r'^[IVX]+\s+', stripped):
        return 'heading'
    
    # Table of Contents is a special heading
    if stripped == 'Table of Contents' or stripped.startswith('Table of Contents'):
        return 'heading'
    
    # Everything else is instruction
    return 'instruction'


def parse_slider_config(config_str: str) -> Dict:
    """Parse slider configuration string into JSON config."""
    if not config_str:
        return {}
    
    # "1-10" or "1-5"
    range_match = re.match(r'(\d+)-(\d+)', config_str)
    if range_match:
        return {'min': int(range_match.group(1)), 'max': int(range_match.group(2))}
    
    # "from E to I"
    label_match = re.match(r'from\s+(\w+)\s+to\s+(\w+)', config_str, re.IGNORECASE)
    if label_match:
        return {'labels': [label_match.group(1), label_match.group(2)]}
    
    return {'raw': config_str}


def add_content_block(state: ParseState, content: str, content_type: str):
    """Add a content block and corresponding stem row."""
    state.content_rows.append({
        'id': state.content_id,
        'content_type': content_type,
        'content': content,
        'version': 1,
        'is_active': True
    })
    
    state.sequence += 1
    state.stem_rows.append({
        'id': state.stem_id,
        'part': state.part,
        'module': state.module,
        'exercise': state.exercise,
        'activity': state.activity,
        'sequence': state.sequence,
        'block_type': 'content',
        'content_id': state.content_id,
        'connection_id': ''
    })
    
    state.stem_id += 1
    state.content_id += 1


def add_prompt(state: ParseState, prompt_text: str, input_type: str, input_config: Optional[str]):
    """Add a prompt and corresponding stem row."""
    config_json = ''
    if input_config:
        if input_type == 'slider':
            config_json = json.dumps(parse_slider_config(input_config))
        else:
            config_json = json.dumps({'raw': input_config})
    
    state.prompt_rows.append({
        'id': state.prompt_id,
        'prompt_text': prompt_text,
        'input_type': input_type,
        'input_config': config_json,
        'version': 1,
        'is_active': True
    })
    
    state.sequence += 1
    
    # Check if there are pending connections
    connection_id = ''
    if state.pending_connections:
        connection_id = state.connection_id
        state.connection_rows.append({
            'id': state.connection_id,
            'name': f'connection_{state.connection_id}',
            'method': 'custom',
            'params': json.dumps({'instructions': state.pending_connections}),
            'implementation_notes': 'Auto-generated - needs refinement'
        })
        state.connection_id += 1
        state.pending_connections = []
    
    state.stem_rows.append({
        'id': state.stem_id,
        'part': state.part,
        'module': state.module,
        'exercise': state.exercise,
        'activity': state.activity,
        'sequence': state.sequence,
        'block_type': 'prompt',
        'content_id': state.prompt_id,
        'connection_id': connection_id
    })
    
    state.stem_id += 1
    state.prompt_id += 1


def add_tool(state: ParseState, tool_id: int):
    """Add a tool reference to stem."""
    state.sequence += 1
    
    # Check if there are pending connections
    connection_id = ''
    if state.pending_connections:
        connection_id = state.connection_id
        state.connection_rows.append({
            'id': state.connection_id,
            'name': f'connection_{state.connection_id}',
            'method': 'custom',
            'params': json.dumps({'instructions': state.pending_connections}),
            'implementation_notes': 'Auto-generated - needs refinement'
        })
        state.connection_id += 1
        state.pending_connections = []
    
    state.stem_rows.append({
        'id': state.stem_id,
        'part': state.part,
        'module': state.module,
        'exercise': state.exercise,
        'activity': state.activity,
        'sequence': state.sequence,
        'block_type': 'tool',
        'content_id': tool_id,
        'connection_id': connection_id
    })
    
    state.stem_id += 1


def parse_content_file(filepath: str) -> ParseState:
    """Parse the content file and return populated state."""
    state = ParseState()
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    i = 0
    last_text_line = None  # Track the last non-tool/input line for prompt text
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            i += 1
            continue
        
        # Skip the first line (file title)
        if i == 0 and 'Roots&Trunk' in stripped:
            i += 1
            continue
        
        # Skip references section at the end
        if stripped == '---' or stripped == '## References':
            break
        
        # Handle Part headers
        part_num = is_part_header(stripped)
        if part_num:
            state.part = part_num
            state.module = 0
            state.exercise = 0
            state.activity = 0
            
            # Collect part header (may be multiple lines)
            header_lines = [stripped]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('Table of Contents'):
                header_lines.append(lines[i].strip())
                i += 1
            
            add_content_block(state, '\n'.join(header_lines), 'heading')
            last_text_line = None
            continue
        
        # Handle Table of Contents - collect as single block
        # TOC continues until we hit TWO blank lines or a blank followed by a long paragraph
        if stripped == 'Table of Contents':
            toc_lines = [stripped]
            i += 1
            blank_count = 0
            # Collect TOC lines - stop when we see content that's clearly not TOC
            while i < len(lines):
                current_line = lines[i]
                current = current_line.strip()
                
                if not current:  # Empty line
                    blank_count += 1
                    if blank_count >= 2:
                        # Two consecutive blanks - end of TOC
                        break
                    i += 1
                    continue
                
                # If we had a blank and now see a long line, it's content, not TOC
                if blank_count >= 1 and len(current) > 100:
                    break
                
                blank_count = 0
                toc_lines.append(current)
                i += 1
            
            add_content_block(state, '\n'.join(toc_lines), 'heading')
            last_text_line = None
            continue
        
        # Handle Module headers
        module_num = is_module_header(stripped)
        if module_num:
            state.module = module_num
            state.exercise = 0
            state.activity = 0
            add_content_block(state, stripped, 'heading')
            last_text_line = None
            i += 1
            continue
        
        # Handle exercise starts (numbered: 1. 2. etc)
        exercise_num = is_exercise_start(stripped)
        if exercise_num:
            state.exercise = exercise_num
            state.activity = 0
            add_content_block(state, stripped, 'instruction')
            last_text_line = stripped
            i += 1
            continue
        
        # Handle activity starts (lettered: a) b) etc)
        activity_letter = is_activity_start(stripped)
        if activity_letter:
            state.activity = ord(activity_letter) - ord('a') + 1
            
            # Check if this line IS a tool/input reference like "a) {2a-2i select 3}"
            # Extract just the part after the letter
            after_letter = re.sub(r'^[a-z]\)\s*', '', stripped)
            tool_info = extract_tool_or_input(after_letter) if after_letter.startswith('{') else None
            
            if tool_info:
                if tool_info['type'] == 'connection':
                    state.pending_connections.append(tool_info['instruction'])
                elif tool_info['type'] == 'input':
                    add_prompt(state, activity_letter + ')', tool_info['input_type'], tool_info.get('config'))
                elif tool_info['type'] == 'tool':
                    add_tool(state, tool_info['tool_id'])
                last_text_line = None
            else:
                # Regular activity text - it's instruction, could be followed by input
                add_content_block(state, stripped, 'instruction')
                last_text_line = stripped
            i += 1
            continue
        
        # Check for {tool} or {input} patterns
        tool_info = extract_tool_or_input(stripped)
        if tool_info:
            if tool_info['type'] == 'connection':
                state.pending_connections.append(tool_info['instruction'])
            elif tool_info['type'] == 'input':
                # Use the last text line as prompt text
                prompt_text = last_text_line if last_text_line else ''
                add_prompt(state, prompt_text, tool_info['input_type'], tool_info.get('config'))
                last_text_line = None  # Consumed
            elif tool_info['type'] == 'tool':
                add_tool(state, tool_info['tool_id'])
            i += 1
            continue
        
        # Regular content line
        content_type = classify_content_type(stripped, state)
        add_content_block(state, stripped, content_type)
        last_text_line = stripped
        i += 1
    
    return state


def write_csvs(state: ParseState, output_dir: str):
    """Write the parsed data to CSV files."""
    
    # stem.csv
    with open(f'{output_dir}/stem.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'part', 'module', 'exercise', 'activity', 
                                                'sequence', 'block_type', 'content_id', 'connection_id'])
        writer.writeheader()
        writer.writerows(state.stem_rows)
    
    # content_blocks.csv
    with open(f'{output_dir}/content_blocks.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'content_type', 'content', 'version', 'is_active'])
        writer.writeheader()
        writer.writerows(state.content_rows)
    
    # prompts.csv
    with open(f'{output_dir}/prompts.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'prompt_text', 'input_type', 'input_config', 
                                                'version', 'is_active'])
        writer.writeheader()
        writer.writerows(state.prompt_rows)
    
    # connections.csv
    with open(f'{output_dir}/connections.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'name', 'method', 'params', 'implementation_notes'])
        writer.writeheader()
        writer.writerows(state.connection_rows)


def main():
    import sys
    
    input_file = '/mnt/user-data/uploads/Roots_TrunkContentEdited_Sourced.txt'
    output_dir = '/home/claude/dreamtree_csvs'
    
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Parsing {input_file}...")
    state = parse_content_file(input_file)
    
    print(f"Writing CSVs to {output_dir}...")
    write_csvs(state, output_dir)
    
    print(f"\nStats:")
    print(f"  Stem rows: {len(state.stem_rows)}")
    print(f"  Content blocks: {len(state.content_rows)}")
    print(f"  Prompts: {len(state.prompt_rows)}")
    print(f"  Connections: {len(state.connection_rows)}")


if __name__ == '__main__':
    main()
