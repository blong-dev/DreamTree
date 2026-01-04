#!/usr/bin/env python3
"""
DreamTree Master CSV Parser

Takes the master CSV and breaks it into normalized tables:
- stem.csv (structural skeleton - the baseline sequence)
- content_blocks.csv (instructions, headings, notes)
- prompts.csv (user input requests)
- tools.csv (interactive components)
- connections.csv (data flow relationships)
- data_objects.csv (key data entities from Excel)
- ongoing_practices.csv (recurring activities from Excel)

Also ingests the Connections Map Excel for complete connection data.
"""

import csv
import json
import re
import pandas as pd
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional, Dict, List, Any


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class ContentBlock:
    id: int
    content_type: str  # 'heading', 'instruction', 'note'
    content: str
    version: int = 1
    is_active: bool = True


@dataclass
class Prompt:
    id: int
    prompt_text: str
    input_type: str  # 'textarea', 'slider', 'checkbox', etc.
    input_config: Optional[str] = None  # JSON string
    version: int = 1
    is_active: bool = True


@dataclass
class Tool:
    id: int
    name: str
    description: str = ""
    instructions: str = ""
    has_reminder: bool = False
    reminder_frequency: Optional[str] = None
    version: int = 1
    is_active: bool = True


@dataclass
class Stem:
    id: int
    part: int
    module: int
    exercise: int
    activity: int
    sequence: int
    block_type: str  # 'content', 'prompt', 'tool'
    content_id: int  # FK to content_blocks, prompts, or tools
    connection_id: Optional[int] = None  # FK to connections


@dataclass
class Connection:
    id: int
    source_block_id: Optional[int] = None
    target_block_id: Optional[int] = None
    source_location: str = ""
    target_location: str = ""
    connection_type: str = ""
    data_object: str = ""
    source_tool_id: Optional[int] = None
    transform: Optional[str] = None
    implementation_notes: str = ""


@dataclass
class DataObject:
    id: int
    name: str
    created_in: str  # Activity/Exercise reference
    reused_in: str  # Comma-separated list of activities
    data_type: str  # Schema hint
    implementation_notes: str = ""


@dataclass
class OngoingPractice:
    id: int
    name: str
    established_in: str  # Exercise reference
    used_by: str  # Where it's referenced
    frequency: str  # Daily, Weekly, etc.
    purpose: str = ""


# =============================================================================
# Parser Class
# =============================================================================

class DreamTreeParser:
    def __init__(self, master_csv_path: str, connections_xlsx_path: str):
        self.master_csv_path = master_csv_path
        self.connections_xlsx_path = connections_xlsx_path
        
        # Output collections
        self.content_blocks: List[ContentBlock] = []
        self.prompts: List[Prompt] = []
        self.tools: List[Tool] = []
        self.stem: List[Stem] = []
        self.connections: List[Connection] = []
        self.data_objects: List[DataObject] = []
        self.ongoing_practices: List[OngoingPractice] = []
        
        # ID counters (start at 100000 for 6+ digit IDs)
        self.content_id_counter = 99999
        self.prompt_id_counter = 99999
        self.tool_id_counter = 99999
        self.stem_id_counter = 99999
        self.connection_id_counter = 99999
        self.data_object_id_counter = 99999
        self.ongoing_practice_id_counter = 99999
        self.sequence_counter = 0  # For stem ordering
        
        # Lookup maps
        self.tool_name_to_id: Dict[str, int] = {}
        self.connection_code_to_id: Dict[str, int] = {}
        self.stem_by_location: Dict[str, List[int]] = {}  # "part.module.exercise.activity" -> [block_ids]
    
    def parse(self):
        """Main parsing workflow."""
        print("Loading connections from Excel...")
        self._load_connections_from_excel()
        
        print("Loading data objects from Excel...")
        self._load_data_objects_from_excel()
        
        print("Loading ongoing practices from Excel...")
        self._load_ongoing_practices_from_excel()
        
        print("Parsing master CSV...")
        self._parse_master_csv()
        
        print("Resolving connection block references...")
        self._resolve_connection_references()
        
        print(f"\nParsing complete:")
        print(f"  - {len(self.stem)} stem blocks")
        print(f"  - {len(self.content_blocks)} content blocks")
        print(f"  - {len(self.prompts)} prompts")
        print(f"  - {len(self.tools)} tools")
        print(f"  - {len(self.connections)} connections")
        print(f"  - {len(self.data_objects)} data objects")
        print(f"  - {len(self.ongoing_practices)} ongoing practices")
    
    def _load_connections_from_excel(self):
        """Load connections from the Excel Connections Map."""
        try:
            df = pd.read_excel(self.connections_xlsx_path, sheet_name='Connections Map')
        except Exception as e:
            print(f"Warning: Could not load Connections Map: {e}")
            return
        
        for _, row in df.iterrows():
            conn_code = str(row.get('Connection ID', '')).strip()
            if not conn_code:
                continue
            
            self.connection_id_counter += 1
            
            # Map connection type to our format
            conn_type_raw = str(row.get('Connection Type', '')).lower()
            conn_type = self._normalize_connection_type(conn_type_raw)
            
            conn = Connection(
                id=self.connection_id_counter,
                source_location=str(row.get('Source Activity', '')),
                target_location=str(row.get('Target Activity', '')),
                connection_type=conn_type,
                data_object=str(row.get('Data Being Referenced', '')),
                implementation_notes=str(row.get('Implementation Notes', ''))
            )
            
            self.connections.append(conn)
            self.connection_code_to_id[conn_code] = conn.id
    
    def _normalize_connection_type(self, raw_type: str) -> str:
        """Normalize connection type strings."""
        raw_type = raw_type.lower().strip()
        if 'backward' in raw_type:
            return 'backward'
        elif 'forward' in raw_type:
            return 'forward'
        elif 'internal' in raw_type:
            return 'internal'
        elif 'resource' in raw_type:
            return 'resource'
        elif 'framework' in raw_type:
            return 'framework'
        else:
            return raw_type
    
    def _load_data_objects_from_excel(self):
        """Load data objects from the Excel Key Data Objects sheet."""
        try:
            df = pd.read_excel(self.connections_xlsx_path, sheet_name='Key Data Objects')
        except Exception as e:
            print(f"Warning: Could not load Key Data Objects: {e}")
            return
        
        for _, row in df.iterrows():
            name = str(row.get('Data Object', '')).strip()
            if not name or name == 'nan':
                continue
            
            self.data_object_id_counter += 1
            
            obj = DataObject(
                id=self.data_object_id_counter,
                name=name,
                created_in=str(row.get('Created In', '')).strip(),
                reused_in=str(row.get('Reused In (Activities)', '')).strip(),
                data_type=str(row.get('Data Type', '')).strip(),
                implementation_notes=str(row.get('App Implementation Notes', '')).strip()
            )
            self.data_objects.append(obj)
    
    def _load_ongoing_practices_from_excel(self):
        """Load ongoing practices from the Excel Ongoing Practices sheet."""
        try:
            df = pd.read_excel(self.connections_xlsx_path, sheet_name='Ongoing Practices')
        except Exception as e:
            print(f"Warning: Could not load Ongoing Practices: {e}")
            return
        
        for _, row in df.iterrows():
            name = str(row.get('Practice', '')).strip()
            if not name or name == 'nan':
                continue
            
            self.ongoing_practice_id_counter += 1
            
            practice = OngoingPractice(
                id=self.ongoing_practice_id_counter,
                name=name,
                established_in=str(row.get('Established In', '')).strip(),
                used_by=str(row.get('Used By', '')).strip(),
                frequency=str(row.get('Frequency', '')).strip(),
                purpose=str(row.get('Purpose', '')).strip()
            )
            self.ongoing_practices.append(practice)
    
    def _parse_master_csv(self):
        """Parse the master CSV into normalized tables."""
        df = pd.read_csv(self.master_csv_path)
        
        for _, row in df.iterrows():
            block_type = str(row.get('block_type', '')).strip()
            
            if block_type == 'content':
                content_id = self._create_content_block(row)
                self._create_stem_block(row, 'content', content_id)
            
            elif block_type == 'prompt':
                prompt_id = self._create_prompt(row)
                self._create_stem_block(row, 'prompt', prompt_id)
            
            elif block_type == 'tool':
                # If tool block has content text, create a content_block for it first
                content_text = str(row.get('content', '')).strip()
                if content_text and content_text != 'nan':
                    content_id = self._create_content_block_direct('instruction', content_text)
                    self._create_stem_block(row, 'content', content_id)
                
                # Then create the tool block
                tool_id = self._get_or_create_tool(row)
                self._create_stem_block(row, 'tool', tool_id)
    
    def _create_content_block(self, row) -> int:
        """Create a content block and return its ID."""
        self.content_id_counter += 1
        
        content_type = str(row.get('content_type', 'instruction')).strip()
        if not content_type or content_type == 'nan':
            content_type = 'instruction'
        
        content = str(row.get('content', '')).strip()
        
        block = ContentBlock(
            id=self.content_id_counter,
            content_type=content_type,
            content=content
        )
        self.content_blocks.append(block)
        return block.id
    
    def _create_content_block_direct(self, content_type: str, content: str) -> int:
        """Create a content block directly with provided values and return its ID."""
        self.content_id_counter += 1
        
        block = ContentBlock(
            id=self.content_id_counter,
            content_type=content_type,
            content=content
        )
        self.content_blocks.append(block)
        return block.id
    
    def _create_prompt(self, row) -> int:
        """Create a prompt and return its ID."""
        self.prompt_id_counter += 1
        
        prompt_text = str(row.get('content', '')).strip()
        input_type = str(row.get('input_type', 'textarea')).strip()
        if not input_type or input_type == 'nan':
            input_type = 'textarea'
        
        # Build input_config from connection if present
        input_config = None
        conn_id = str(row.get('connection_id', '')).strip()
        if conn_id and conn_id != 'nan' and conn_id != 'PREV':
            input_config = json.dumps({"connection_ref": conn_id})
        
        prompt = Prompt(
            id=self.prompt_id_counter,
            prompt_text=prompt_text,
            input_type=input_type,
            input_config=input_config
        )
        self.prompts.append(prompt)
        return prompt.id
    
    def _get_or_create_tool(self, row) -> int:
        """Get existing tool ID or create new tool."""
        tool_id_raw = str(row.get('tool_id', '')).strip()
        
        # Handle connection IDs that got put in tool_id column
        if tool_id_raw.startswith('C0') or tool_id_raw == 'PREV':
            tool_id_raw = 'generic_tool'
        
        if not tool_id_raw or tool_id_raw == 'nan':
            tool_id_raw = 'generic_tool'
        
        # Check if tool already exists
        if tool_id_raw in self.tool_name_to_id:
            return self.tool_name_to_id[tool_id_raw]
        
        # Create new tool
        self.tool_id_counter += 1
        
        # Determine if this is a reminder-type tool
        has_reminder = tool_id_raw in ['flow_tracker', 'mindfulness_tracker', 'skill_sharpening']
        reminder_freq = 'daily' if has_reminder else None
        
        tool = Tool(
            id=self.tool_id_counter,
            name=tool_id_raw,
            description=self._get_tool_description(tool_id_raw),
            instructions=self._get_tool_instructions(tool_id_raw),
            has_reminder=has_reminder,
            reminder_frequency=reminder_freq
        )
        self.tools.append(tool)
        self.tool_name_to_id[tool_id_raw] = tool.id
        return tool.id
    
    def _get_tool_description(self, tool_name: str) -> str:
        """Return a description for known tools."""
        descriptions = {
            'ranking_grid': 'Drag-and-drop grid for ranking items 1-10',
            'soared_form': 'Structured form for SOARED story framework (Situation, Obstacle, Action, Result, Evaluation, Discovery)',
            'flow_tracker': 'Daily tracker for energy and focus levels on activities',
            'list_builder': 'Dynamic list builder with add/remove functionality',
            'mbti_selector': '4-letter personality type selector',
            'skill_tagger': 'Tag and categorize skills from stories',
            'budget_calculator': 'Monthly/annual budget calculator with BATNA',
            'idea_tree': 'Visual brainstorming tree structure',
            'career_timeline': '5-year career timeline planner',
            'career_assessment': 'Career option scoring and comparison',
            'failure_reframer': 'Tool for reframing failures as learning opportunities',
            'life_dashboard': 'Dashboard for rating life areas (work, play, love, health)',
            'mindset_profiles': 'Display mindset profile information',
            'credential_writer': 'Rewrite credentials using employer language',
            'resume_builder': 'Structured resume building tool',
            'job_analyzer': 'Analyze job descriptions for keywords',
            'company_researcher': 'Company research template',
            'company_tracker': 'Track target companies',
            'contact_tracker': 'Track networking contacts',
            'outreach_tracker': 'Track outreach attempts and responses',
            'research_tracker': 'Track research progress',
            'networking_tracker': 'Track networking activities',
            'meeting_prep': 'Meeting preparation template',
            'meeting_notes': 'Meeting notes template',
            'referral_tracker': 'Track referrals received',
            'opportunity_tracker': 'Track job opportunities',
            'job_combiner': 'Combine ideas into potential job descriptions',
        }
        return descriptions.get(tool_name, '')
    
    def _get_tool_instructions(self, tool_name: str) -> str:
        """Return instructions for known tools."""
        instructions = {
            'ranking_grid': 'Compare items pairwise to establish priority order from 1-10.',
            'soared_form': 'Fill in each field: Situation, Obstacle, Action, Result, Evaluation, Discovery.',
            'flow_tracker': 'Rate each activity on energy (-2 to +2) and focus level. Mark high-flow activities.',
            'list_builder': 'Add items to your list. You can reorder, edit, or remove items.',
            'mbti_selector': 'Enter your 4-letter personality code from 16personalities.com.',
            'skill_tagger': 'Tag skills mentioned in your stories. Use the Skills Library for reference.',
            'budget_calculator': 'Enter your monthly expenses to calculate annual needs and minimum hourly rate.',
            'idea_tree': 'Start with a central word and branch out with related ideas and possibilities.',
            'career_timeline': 'Plot key milestones for the next 5 years including work and life events.',
            'career_assessment': 'Score this career option on coherence, work needs, life needs, and unknowns.',
            'failure_reframer': 'Describe a failure, then reframe it as a learning opportunity.',
            'life_dashboard': 'Rate each life area (work, play, love, health) from 1-10 and add notes.',
            'mindset_profiles': 'Review the five designer mindsets and select characters that represent each.',
            'credential_writer': 'Rewrite your experience using keywords and language from job descriptions.',
            'resume_builder': 'Build your resume section by section using your prepared content.',
            'job_analyzer': 'Paste job descriptions to extract keywords, requirements, and patterns.',
            'company_researcher': 'Research and document key information about target companies.',
            'company_tracker': 'Maintain your list of target companies with status and notes.',
            'contact_tracker': 'Track contacts at each company with relationship status.',
            'outreach_tracker': 'Log outreach attempts, responses, and follow-up actions.',
            'research_tracker': 'Track your research progress across companies.',
            'networking_tracker': 'Log daily networking activities and connection requests.',
            'meeting_prep': 'Prepare for meetings with research, questions, and talking points.',
            'meeting_notes': 'Capture key points, action items, and follow-ups from meetings.',
            'referral_tracker': 'Track referrals received and their outcomes.',
            'opportunity_tracker': 'Track job opportunities through the application pipeline.',
            'job_combiner': 'Combine elements from your idea trees into potential job descriptions.',
        }
        return instructions.get(tool_name, '')
    
    def _create_stem_block(self, row, block_type: str, content_id: int):
        """Create a stem block."""
        self.stem_id_counter += 1
        self.sequence_counter += 1
        
        # Parse location
        part = int(row.get('part', 0))
        module = int(row.get('module', 0))
        exercise = int(row.get('exercise', 0))
        activity = int(row.get('activity', 0))
        
        # Resolve connection ID
        conn_id_raw = str(row.get('connection_id', '')).strip()
        connection_id = None
        
        if conn_id_raw and conn_id_raw != 'nan':
            if conn_id_raw == 'PREV':
                # PREV means "use data from the previous block"
                # We'll create a special connection for this
                connection_id = self._get_or_create_prev_connection()
            elif conn_id_raw in self.connection_code_to_id:
                connection_id = self.connection_code_to_id[conn_id_raw]
            else:
                # Connection code not found in Excel - create new connection
                connection_id = self._create_missing_connection(conn_id_raw)
        
        block = Stem(
            id=self.stem_id_counter,
            part=part,
            module=module,
            exercise=exercise,
            activity=activity,
            sequence=self.sequence_counter,
            block_type=block_type,
            content_id=content_id,
            connection_id=connection_id
        )
        self.stem.append(block)
        
        # Track for connection resolution
        location_key = f"{part}.{module}.{exercise}.{activity}"
        if location_key not in self.stem_by_location:
            self.stem_by_location[location_key] = []
        self.stem_by_location[location_key].append(block.id)
    
    def _get_or_create_prev_connection(self) -> int:
        """Get or create the special PREV connection."""
        if 'PREV' in self.connection_code_to_id:
            return self.connection_code_to_id['PREV']
        
        self.connection_id_counter += 1
        conn = Connection(
            id=self.connection_id_counter,
            source_location='Previous block',
            target_location='Current block',
            connection_type='internal',
            data_object='Output from previous tool/prompt',
            implementation_notes='PREV - uses output from immediately preceding block'
        )
        self.connections.append(conn)
        self.connection_code_to_id['PREV'] = conn.id
        return conn.id
    
    def _create_missing_connection(self, conn_code: str) -> int:
        """Create a connection for codes found in CSV but not in Excel."""
        self.connection_id_counter += 1
        conn = Connection(
            id=self.connection_id_counter,
            connection_type='unknown',
            data_object=f'Referenced as {conn_code}',
            implementation_notes=f'Connection {conn_code} found in CSV but not in Excel Connections Map'
        )
        self.connections.append(conn)
        self.connection_code_to_id[conn_code] = conn.id
        return conn.id
    
    def _resolve_connection_references(self):
        """Try to resolve source/target block IDs for connections."""
        # This is a best-effort attempt to link connections to actual blocks
        # based on location strings like "Activity 1.1.1c"
        
        for conn in self.connections:
            # Try to parse source location
            source_loc = self._parse_location_string(conn.source_location)
            if source_loc:
                key = f"{source_loc[0]}.{source_loc[1]}.{source_loc[2]}.{source_loc[3]}"
                if key in self.stem_by_location:
                    # Take the first block at this location
                    conn.source_block_id = self.stem_by_location[key][0]
            
            # Try to parse target location
            target_loc = self._parse_location_string(conn.target_location)
            if target_loc:
                key = f"{target_loc[0]}.{target_loc[1]}.{target_loc[2]}.{target_loc[3]}"
                if key in self.stem_by_location:
                    conn.target_block_id = self.stem_by_location[key][0]
    
    def _parse_location_string(self, loc_str: str) -> Optional[tuple]:
        """Parse location strings like 'Activity 1.1.1c' into (part, module, exercise, activity)."""
        if not loc_str or loc_str == 'nan':
            return None
        
        # Try to match "Activity X.Y.Za"
        match = re.search(r'(\d+)\.(\d+)\.(\d+)([a-z])?', loc_str)
        if match:
            part = int(match.group(1))
            module = int(match.group(2))
            exercise = int(match.group(3))
            activity = ord(match.group(4)) - ord('a') + 1 if match.group(4) else 0
            return (part, module, exercise, activity)
        
        # Try to match "Module X.Y"
        match = re.search(r'Module\s+(\d+)\.(\d+)', loc_str)
        if match:
            return (int(match.group(1)), int(match.group(2)), 0, 0)
        
        # Try to match "Exercise X.Y.Z"
        match = re.search(r'Exercise\s+(\d+)\.(\d+)\.(\d+)', loc_str)
        if match:
            return (int(match.group(1)), int(match.group(2)), int(match.group(3)), 0)
        
        return None
    
    def write_csv(self, output_dir: str):
        """Write all tables to CSV files."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Stem (structural skeleton)
        self._write_table(
            output_path / 'stem.csv',
            self.stem,
            ['id', 'part', 'module', 'exercise', 'activity', 'sequence', 'block_type', 'content_id', 'connection_id']
        )
        
        # Content blocks
        self._write_table(
            output_path / 'content_blocks.csv',
            self.content_blocks,
            ['id', 'content_type', 'content', 'version', 'is_active']
        )
        
        # Prompts
        self._write_table(
            output_path / 'prompts.csv',
            self.prompts,
            ['id', 'prompt_text', 'input_type', 'input_config', 'version', 'is_active']
        )
        
        # Tools
        self._write_table(
            output_path / 'tools.csv',
            self.tools,
            ['id', 'name', 'description', 'instructions', 'has_reminder', 'reminder_frequency', 'version', 'is_active']
        )
        
        # Connections
        self._write_table(
            output_path / 'connections.csv',
            self.connections,
            ['id', 'source_block_id', 'target_block_id', 'source_location', 'target_location', 
             'connection_type', 'data_object', 'source_tool_id', 'transform', 'implementation_notes']
        )
        
        # Data Objects
        self._write_table(
            output_path / 'data_objects.csv',
            self.data_objects,
            ['id', 'name', 'created_in', 'reused_in', 'data_type', 'implementation_notes']
        )
        
        # Ongoing Practices
        self._write_table(
            output_path / 'ongoing_practices.csv',
            self.ongoing_practices,
            ['id', 'name', 'established_in', 'used_by', 'frequency', 'purpose']
        )
        
        print(f"\nFiles written to {output_path}/")
        for f in ['stem.csv', 'content_blocks.csv', 'prompts.csv', 'tools.csv', 
                  'connections.csv', 'data_objects.csv', 'ongoing_practices.csv']:
            print(f"  - {f}")
    
    def _write_table(self, filepath: Path, data: list, columns: list):
        """Write a list of dataclasses to CSV."""
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=columns)
            writer.writeheader()
            for item in data:
                row = asdict(item)
                # Filter to only requested columns
                row = {k: v for k, v in row.items() if k in columns}
                writer.writerow(row)


# =============================================================================
# Main
# =============================================================================

if __name__ == '__main__':
    import sys
    
    # Default paths
    master_csv = '/mnt/user-data/uploads/dreamtree_master_complete.csv'
    connections_xlsx = '/mnt/user-data/uploads/DreamTree_Connections_Map.xlsx'
    output_dir = '/home/claude/output_tables'
    
    # Allow command line override
    if len(sys.argv) > 1:
        master_csv = sys.argv[1]
    if len(sys.argv) > 2:
        connections_xlsx = sys.argv[2]
    if len(sys.argv) > 3:
        output_dir = sys.argv[3]
    
    parser = DreamTreeParser(master_csv, connections_xlsx)
    parser.parse()
    parser.write_csv(output_dir)
