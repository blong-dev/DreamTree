/**
 * DreamTree Database Seed Script
 *
 * Imports CSV data from planning/tables into the D1 database.
 *
 * Usage:
 *   npx wrangler d1 execute dreamtree-db --local --file=./migrations/0001_initial.sql
 *   npx tsx seed/import-csv.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to planning tables
const TABLES_DIR = join(__dirname, '../../planning/tables');

interface CsvRow {
  [key: string]: string;
}

function parseCSV(content: string): CsvRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

function escapeSQL(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }
  // Handle boolean strings
  if (value === 'True' || value === 'true') return '1';
  if (value === 'False' || value === 'false') return '0';

  // Escape single quotes
  return `'${value.replace(/'/g, "''")}'`;
}

function generateInsertSQL(tableName: string, rows: CsvRow[]): string {
  if (rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const statements: string[] = [];

  for (const row of rows) {
    const values = columns.map(col => escapeSQL(row[col]));
    statements.push(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`
    );
  }

  return statements.join('\n');
}

// Define table mappings (CSV filename -> table name)
const TABLE_MAPPINGS: Record<string, string> = {
  'personality_types.csv': 'personality_types',
  'competencies.csv': 'competencies',
  'competency_levels.csv': 'competency_levels',
  'skills_master.csv': 'skills',
  'tools.csv': 'tools',
  'content_blocks_UPDATED.csv': 'content_blocks',
  'prompts.csv': 'prompts',
  'connections_UPDATED.csv': 'connections',
  'stem_UPDATED.csv': 'stem',
  'data_objects.csv': 'data_objects',
  'ongoing_practices.csv': 'ongoing_practices',
  'sources.csv': 'references',
};

// Order matters for foreign keys
const IMPORT_ORDER = [
  'personality_types.csv',
  'competencies.csv',
  'competency_levels.csv',
  'skills_master.csv',
  'tools.csv',
  'content_blocks_UPDATED.csv',
  'prompts.csv',
  'connections_UPDATED.csv',
  'stem_UPDATED.csv',
  'data_objects.csv',
  'ongoing_practices.csv',
  'sources.csv',
];

async function main() {
  console.log('DreamTree Database Seed Script\n');
  console.log('Generating SQL insert statements from CSV files...\n');

  let allSQL = '-- DreamTree Seed Data\n-- Generated: ' + new Date().toISOString() + '\n\n';

  for (const csvFile of IMPORT_ORDER) {
    const tableName = TABLE_MAPPINGS[csvFile];
    if (!tableName) {
      console.log(`⚠️  Skipping ${csvFile} (no table mapping)`);
      continue;
    }

    const csvPath = join(TABLES_DIR, csvFile);

    try {
      const content = readFileSync(csvPath, 'utf-8');
      const rows = parseCSV(content);

      if (rows.length === 0) {
        console.log(`⚠️  ${csvFile} is empty, skipping`);
        continue;
      }

      const sql = generateInsertSQL(tableName, rows);
      allSQL += `-- ${csvFile} -> ${tableName} (${rows.length} rows)\n`;
      allSQL += sql + '\n\n';

      console.log(`✅ ${csvFile} -> ${tableName}: ${rows.length} rows`);
    } catch (err) {
      console.log(`❌ Error reading ${csvFile}:`, (err as Error).message);
    }
  }

  // Write combined SQL file
  const outputPath = join(__dirname, '../migrations/0002_seed_data.sql');
  const fs = await import('fs');
  fs.writeFileSync(outputPath, allSQL);

  console.log(`\n✅ Generated: migrations/0002_seed_data.sql`);
  console.log('\nTo apply the seed data locally, run:');
  console.log('  npx wrangler d1 execute dreamtree-db --local --file=./migrations/0002_seed_data.sql');
}

main().catch(console.error);
