import csv
import re

def parse_dreamtree(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    rows = []
    sequence = 0
    
    # Current hierarchy state
    current_part = 0
    current_module = 0
    current_exercise = 0
    current_activity = 0
    
    # Skip table of contents (lines before "# Part 1: Roots")
    start_index = 0
    for i, line in enumerate(lines):
        if line.strip() == '# Part 1: Roots':
            start_index = i
            break
    
    # Buffer for accumulating content
    buffer = []
    in_table = False
    table_buffer = []
    
    def flush_buffer():
        nonlocal sequence, buffer
        if buffer:
            text = '\n'.join(buffer).strip()
            if text:
                sequence += 1
                rows.append([current_part, current_module, current_exercise, current_activity, sequence, text])
            buffer = []
    
    def flush_table():
        nonlocal sequence, table_buffer, in_table
        if table_buffer:
            text = '\n'.join(table_buffer).strip()
            if text:
                sequence += 1
                rows.append([current_part, current_module, current_exercise, current_activity, sequence, text])
            table_buffer = []
        in_table = False
    
    i = start_index
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip dividers
        if stripped == '---':
            flush_buffer()
            flush_table()
            i += 1
            continue
        
        # Skip empty lines (but handle them properly for paragraph detection)
        if not stripped:
            # If we're in a table, continue
            if in_table:
                i += 1
                continue
            # If buffer has content, it might be end of paragraph
            if buffer:
                flush_buffer()
            i += 1
            continue
        
        # Check for table start (line starts with |)
        if stripped.startswith('|'):
            flush_buffer()
            if not in_table:
                in_table = True
                table_buffer = []
            table_buffer.append(line)
            i += 1
            continue
        else:
            # If we were in a table and now we're not, flush the table
            if in_table:
                flush_table()
        
        # Check for Part header (# Part X: or just # Part X)
        part_match = re.match(r'^#\s+Part\s+(\d+)', stripped)
        if part_match:
            flush_buffer()
            current_part = int(part_match.group(1))
            current_module = 0
            current_exercise = 0
            current_activity = 0
            # Extract the header text
            header_text = re.sub(r'^#\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for Module header (## Module X.Y:)
        module_match = re.match(r'^##\s+Module\s+(\d+)\.(\d+)', stripped)
        if module_match:
            flush_buffer()
            current_part = int(module_match.group(1))
            current_module = int(module_match.group(2))
            current_exercise = 0
            current_activity = 0
            header_text = re.sub(r'^##\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for Exercise header (### Exercise X.Y.Z:)
        exercise_match = re.match(r'^###\s+Exercise\s+(\d+)\.(\d+)\.(\d+)', stripped)
        if exercise_match:
            flush_buffer()
            current_part = int(exercise_match.group(1))
            current_module = int(exercise_match.group(2))
            current_exercise = int(exercise_match.group(3))
            current_activity = 0
            header_text = re.sub(r'^###\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for Activity header (#### Activity X.Y.Za:)
        activity_match = re.match(r'^####\s+Activity\s+(\d+)\.(\d+)\.(\d+)([a-z])', stripped)
        if activity_match:
            flush_buffer()
            current_part = int(activity_match.group(1))
            current_module = int(activity_match.group(2))
            current_exercise = int(activity_match.group(3))
            # Convert letter to number (a=1, b=2, etc.)
            current_activity = ord(activity_match.group(4)) - ord('a') + 1
            header_text = re.sub(r'^####\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for other ## headers (like "## Overview", "## Understanding Your Foundation", etc.)
        if stripped.startswith('## ') and not module_match:
            flush_buffer()
            current_exercise = 0
            current_activity = 0
            header_text = re.sub(r'^##\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for other ### headers (like "### Module Overview", "### Skills and Talents", etc.)
        if stripped.startswith('### ') and not exercise_match:
            flush_buffer()
            current_activity = 0
            header_text = re.sub(r'^###\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for other #### headers
        if stripped.startswith('#### ') and not activity_match:
            flush_buffer()
            header_text = re.sub(r'^####\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, header_text])
            i += 1
            continue
        
        # Check for bullet points (- item or * item)
        if re.match(r'^[-*]\s+', stripped):
            flush_buffer()
            # This is a bullet point - gets its own row
            bullet_text = re.sub(r'^[-*]\s+', '', stripped)
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, '- ' + bullet_text])
            i += 1
            continue
        
        # Check for numbered list items
        if re.match(r'^\d+[\.\)]\s+', stripped):
            flush_buffer()
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, stripped])
            i += 1
            continue
        
        # Check for lettered list items (a), b), etc.)
        if re.match(r'^[a-z][\.\)]\s+', stripped):
            flush_buffer()
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, stripped])
            i += 1
            continue
        
        # Check for checkbox items
        if re.match(r'^- \[[ x]\]', stripped):
            flush_buffer()
            sequence += 1
            rows.append([current_part, current_module, current_exercise, current_activity, sequence, stripped])
            i += 1
            continue
        
        # Regular content - add to buffer
        buffer.append(line)
        i += 1
    
    # Flush any remaining content
    flush_buffer()
    flush_table()
    
    return rows

def write_csv(rows, output_path):
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['part', 'module', 'exercise', 'activity', 'sequence', 'content'])
        for row in rows:
            # Replace newlines with <br> in content column
            row[5] = row[5].replace('\n', '<br>')
            writer.writerow(row)

if __name__ == '__main__':
    input_file = '/mnt/user-data/uploads/DreamTreeContentREWRITE.md'
    output_file = '/home/claude/dreamtree_content.csv'
    
    rows = parse_dreamtree(input_file)
    write_csv(rows, output_file)
    
    print(f"Generated {len(rows)} rows")
    print("First 10 rows:")
    for row in rows[:10]:
        print(row)
