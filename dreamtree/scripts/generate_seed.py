#!/usr/bin/env python3
"""Generate proper SQL seed data from CSV files."""

import csv
import os

def escape_sql(value):
    """Escape single quotes for SQL."""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return '1' if value else '0'
    if isinstance(value, str):
        if value.lower() == 'true':
            return '1'
        if value.lower() == 'false':
            return '0'
        if value == '' or value.lower() == 'null':
            return 'NULL'
        # Escape single quotes
        escaped = value.replace("'", "''")
        return f"'{escaped}'"
    return str(value)

def generate_content_blocks(csv_path, output):
    """Generate INSERT statements for content_blocks."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        output.write("-- content_blocks\n")
        for row in reader:
            id_val = escape_sql(row.get('id', ''))
            content_type = escape_sql(row.get('content_type', ''))
            content = escape_sql(row.get('content', ''))
            version = row.get('version', '1')
            version = '1' if not version or version == '' else version
            is_active = row.get('is_active', 'True')
            is_active = '1' if is_active.lower() == 'true' else '0'

            if id_val != 'NULL':
                output.write(f"INSERT INTO content_blocks (id, content_type, content, version, is_active) VALUES ({id_val}, {content_type}, {content}, {version}, {is_active});\n")

def generate_prompts(csv_path, output):
    """Generate INSERT statements for prompts."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        output.write("\n-- prompts\n")
        for row in reader:
            id_val = escape_sql(row.get('id', ''))
            # prompt_text is NOT NULL, use empty string if missing
            prompt_text_raw = row.get('prompt_text', '')
            if not prompt_text_raw or prompt_text_raw.lower() == 'null':
                prompt_text = "''"
            else:
                prompt_text = escape_sql(prompt_text_raw)
            input_type = escape_sql(row.get('input_type', ''))
            input_config = escape_sql(row.get('input_config', ''))
            version = row.get('version', '1')
            version = '1' if not version or version == '' else version
            is_active = row.get('is_active', 'True')
            is_active = '1' if is_active.lower() == 'true' else '0'

            if id_val != 'NULL':
                output.write(f"INSERT INTO prompts (id, prompt_text, input_type, input_config, version, is_active) VALUES ({id_val}, {prompt_text}, {input_type}, {input_config}, {version}, {is_active});\n")

def generate_tools(csv_path, output):
    """Generate INSERT statements for tools."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        output.write("\n-- tools\n")
        for row in reader:
            id_val = escape_sql(row.get('id', ''))
            name = escape_sql(row.get('name', ''))
            description = escape_sql(row.get('description', ''))
            instructions = escape_sql(row.get('instructions', ''))
            has_reminder = '1' if row.get('has_reminder', '').lower() == 'true' else '0'
            reminder_freq = escape_sql(row.get('reminder_frequency', ''))
            version = row.get('version', '1')
            version = '1' if not version or version == '' else version
            is_active = row.get('is_active', 'True')
            is_active = '1' if is_active.lower() == 'true' else '0'

            if id_val != 'NULL':
                output.write(f"INSERT INTO tools (id, name, description, instructions, has_reminder, reminder_frequency, version, is_active) VALUES ({id_val}, {name}, {description}, {instructions}, {has_reminder}, {reminder_freq}, {version}, {is_active});\n")

def generate_stem(csv_path, output):
    """Generate INSERT statements for stem."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        output.write("\n-- stem\n")
        for row in reader:
            id_val = escape_sql(row.get('id', ''))
            part = row.get('part', '0')
            module = row.get('module', '0')
            exercise = row.get('exercise', '0')
            activity = row.get('activity', '0')
            sequence = row.get('sequence', '0')
            block_type = escape_sql(row.get('block_type', ''))
            content_id = row.get('content_id', '')
            content_id = 'NULL' if not content_id else content_id
            connection_id = row.get('connection_id', '')
            connection_id = 'NULL' if not connection_id else connection_id

            if id_val != 'NULL':
                output.write(f"INSERT INTO stem (id, part, module, exercise, activity, sequence, block_type, content_id, connection_id) VALUES ({id_val}, {part}, {module}, {exercise}, {activity}, {sequence}, {block_type}, {content_id}, {connection_id});\n")

def generate_connections(csv_path, output):
    """Generate INSERT statements for connections."""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        output.write("\n-- connections\n")
        for row in reader:
            id_val = escape_sql(row.get('id', ''))
            name = escape_sql(row.get('name', ''))
            source_data_object = escape_sql(row.get('source_data_object', ''))
            target_exercise = escape_sql(row.get('target_exercise', ''))
            method = escape_sql(row.get('method', ''))
            params = escape_sql(row.get('params', ''))
            version = row.get('version', '1')
            version = '1' if not version or version == '' else version
            is_active = row.get('is_active', 'True')
            is_active = '1' if is_active.lower() == 'true' else '0'

            if id_val != 'NULL':
                output.write(f"INSERT INTO connections (id, name, source_data_object, target_exercise, method, params, version, is_active) VALUES ({id_val}, {name}, {source_data_object}, {target_exercise}, {method}, {params}, {version}, {is_active});\n")

def main():
    base_path = r"C:\dreamtree\planning\tables"
    output_path = r"C:\dreamtree\dreamtree\migrations\seed_content.sql"

    with open(output_path, 'w', encoding='utf-8') as output:
        output.write("-- DreamTree Content Seed Data\n")
        output.write("-- Generated by generate_seed.py\n\n")

        # Generate in order of dependencies
        tools_csv = os.path.join(base_path, "tools.csv")
        if os.path.exists(tools_csv):
            generate_tools(tools_csv, output)

        content_csv = os.path.join(base_path, "content_blocks_UPDATED.csv")
        if os.path.exists(content_csv):
            generate_content_blocks(content_csv, output)

        prompts_csv = os.path.join(base_path, "prompts.csv")
        if os.path.exists(prompts_csv):
            generate_prompts(prompts_csv, output)

        # Skip connections - CSV schema doesn't match DB schema
        # connections_csv = os.path.join(base_path, "connections_UPDATED.csv")
        # if os.path.exists(connections_csv):
        #     generate_connections(connections_csv, output)

        stem_csv = os.path.join(base_path, "stem_UPDATED.csv")
        if os.path.exists(stem_csv):
            generate_stem(stem_csv, output)

    print(f"Generated: {output_path}")

if __name__ == "__main__":
    main()
