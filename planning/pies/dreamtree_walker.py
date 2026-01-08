"""
DreamTree Content Walker
========================
Helper functions for exploring the content flow in a notebook.

Usage:
    from dreamtree_walker import ContentWalker
    walker = ContentWalker('/path/to/csv/folder')
    
    # Show specific sequences
    walker.show(1, 13)  # Part 1 intro
    
    # Walk interactively
    walker.walk()  # starts at 1, press Enter to advance
    
    # Jump around
    walker.goto(100)  # jump to sequence 100
    walker.next(5)    # show next 5
    
    # Find things
    walker.find_tools()           # list all tool appearances
    walker.find_prompts()         # list all prompts
    walker.find_by_location(1, 1) # find all content in Part 1, Module 1
    walker.search("SOARED")       # search content text
"""

import csv
from pathlib import Path
from typing import Optional
from dataclasses import dataclass


@dataclass
class ContentBlock:
    id: str
    content_type: str
    content: str


@dataclass
class Prompt:
    id: str
    prompt_text: str
    input_type: str
    input_config: str


@dataclass
class Tool:
    id: str
    name: str
    description: str
    instructions: str
    has_reminder: bool
    reminder_frequency: str


@dataclass
class StemRow:
    id: str
    part: int
    module: int
    exercise: int
    activity: int
    sequence: int
    block_type: str
    content_id: str
    connection_id: str
    
    @property
    def location(self) -> str:
        return f"P{self.part}.M{self.module}.E{self.exercise}.A{self.activity}"
    
    @property
    def location_short(self) -> str:
        if self.module == 0:
            return f"Part {self.part} Intro"
        elif self.exercise == 0:
            return f"Module {self.part}.{self.module} Intro"
        elif self.activity == 0:
            return f"Exercise {self.part}.{self.module}.{self.exercise} Intro"
        else:
            activity_letter = chr(96 + self.activity)  # 1->a, 2->b, etc.
            return f"Activity {self.part}.{self.module}.{self.exercise}{activity_letter}"


class ContentWalker:
    def __init__(self, csv_folder: str):
        self.csv_folder = Path(csv_folder)
        self.stem: list[StemRow] = []
        self.content_blocks: dict[str, ContentBlock] = {}
        self.prompts: dict[str, Prompt] = {}
        self.tools: dict[str, Tool] = {}
        self.connections: dict[str, dict] = {}
        self.position = 1
        
        self._load_data()
    
    def _load_data(self):
        # Load stem
        with open(self.csv_folder / 'stem.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.stem.append(StemRow(
                    id=row['id'],
                    part=int(row['part']),
                    module=int(row['module']),
                    exercise=int(row['exercise']),
                    activity=int(row['activity']),
                    sequence=int(row['sequence']),
                    block_type=row['block_type'],
                    content_id=row['content_id'],
                    connection_id=row.get('connection_id', '')
                ))
        
        # Load content_blocks
        with open(self.csv_folder / 'content_blocks.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.content_blocks[row['id']] = ContentBlock(
                    id=row['id'],
                    content_type=row['content_type'],
                    content=row['content']
                )
        
        # Load prompts
        with open(self.csv_folder / 'prompts.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.prompts[row['id']] = Prompt(
                    id=row['id'],
                    prompt_text=row['prompt_text'],
                    input_type=row['input_type'],
                    input_config=row.get('input_config', '')
                )
        
        # Load tools
        with open(self.csv_folder / 'tools.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.tools[row['id']] = Tool(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    instructions=row['instructions'],
                    has_reminder=row.get('has_reminder', 'False').lower() == 'true',
                    reminder_frequency=row.get('reminder_frequency', '')
                )
        
        # Load connections
        with open(self.csv_folder / 'connections.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.connections[row['id']] = row
        
        print(f"Loaded: {len(self.stem)} stem rows, {len(self.content_blocks)} content blocks, "
              f"{len(self.prompts)} prompts, {len(self.tools)} tools, {len(self.connections)} connections")
    
    def _get_stem_by_seq(self, seq: int) -> Optional[StemRow]:
        for row in self.stem:
            if row.sequence == seq:
                return row
        return None
    
    def _format_block(self, stem: StemRow, verbose: bool = True) -> str:
        lines = []
        
        # Header
        header = f"[{stem.sequence}] {stem.location_short}"
        if stem.connection_id:
            lines.append(f"{header} 🔗")
        else:
            lines.append(header)
        
        lines.append("─" * 60)
        
        # Content based on type
        if stem.block_type == 'content':
            cb = self.content_blocks.get(stem.content_id)
            if cb:
                lines.append(f"📄 {cb.content_type.upper()}")
                lines.append("")
                lines.append(cb.content)
            else:
                lines.append(f"⚠️  Missing content_block: {stem.content_id}")
        
        elif stem.block_type == 'prompt':
            p = self.prompts.get(stem.content_id)
            if p:
                lines.append(f"❓ PROMPT ({p.input_type})")
                lines.append("")
                lines.append(p.prompt_text)
                if verbose and p.input_config:
                    lines.append("")
                    lines.append(f"Config: {p.input_config}")
            else:
                lines.append(f"⚠️  Missing prompt: {stem.content_id}")
        
        elif stem.block_type == 'tool':
            t = self.tools.get(stem.content_id)
            if t:
                reminder_info = f" (reminder: {t.reminder_frequency})" if t.has_reminder else ""
                lines.append(f"🔧 TOOL: {t.name}{reminder_info}")
                lines.append("")
                lines.append(f"Description: {t.description}")
                lines.append("")
                lines.append(f"Instructions: {t.instructions}")
            else:
                lines.append(f"⚠️  Missing tool: {stem.content_id}")
        
        # Connection info
        if stem.connection_id and stem.connection_id in self.connections:
            conn = self.connections[stem.connection_id]
            lines.append("")
            lines.append(f"🔗 Connection: {conn.get('connection_type', '?')} → {conn.get('target_location', '?')}")
            if verbose and conn.get('data_object'):
                lines.append(f"   Data: {conn['data_object']}")
        
        return "\n".join(lines)
    
    def show(self, start: int, end: Optional[int] = None, verbose: bool = True):
        """Show content for sequence range."""
        if end is None:
            end = start
        
        for seq in range(start, end + 1):
            stem = self._get_stem_by_seq(seq)
            if stem:
                print(self._format_block(stem, verbose))
                print()
    
    def walk(self, start: int = None):
        """Interactive walk through content. Press Enter to advance, 'q' to quit, number to jump."""
        if start is not None:
            self.position = start
        
        print("Walking content. Enter=next, number=jump, q=quit, b=back")
        print()
        
        while True:
            stem = self._get_stem_by_seq(self.position)
            if not stem:
                print(f"No content at sequence {self.position}")
                break
            
            print(self._format_block(stem))
            print()
            
            try:
                cmd = input(f"[{self.position}/{len(self.stem)}] > ").strip().lower()
            except EOFError:
                break
            
            if cmd == 'q':
                break
            elif cmd == 'b':
                self.position = max(1, self.position - 1)
            elif cmd == '':
                self.position += 1
            elif cmd.isdigit():
                self.position = int(cmd)
            else:
                print(f"Unknown command: {cmd}")
    
    def goto(self, seq: int):
        """Jump to a sequence and show it."""
        self.position = seq
        self.show(seq)
    
    def next(self, count: int = 1):
        """Show next N items from current position."""
        self.show(self.position, self.position + count - 1)
        self.position += count
    
    def find_tools(self) -> list[tuple[int, str, str]]:
        """List all tool appearances: (sequence, location, tool_name)"""
        results = []
        for stem in self.stem:
            if stem.block_type == 'tool':
                tool = self.tools.get(stem.content_id)
                name = tool.name if tool else f"unknown:{stem.content_id}"
                results.append((stem.sequence, stem.location_short, name))
        
        print(f"Found {len(results)} tool references:\n")
        for seq, loc, name in results:
            print(f"  [{seq:4d}] {loc:40s} → {name}")
        
        return results
    
    def find_prompts(self) -> list[tuple[int, str, str]]:
        """List all prompts: (sequence, location, input_type)"""
        results = []
        for stem in self.stem:
            if stem.block_type == 'prompt':
                prompt = self.prompts.get(stem.content_id)
                input_type = prompt.input_type if prompt else "unknown"
                text_preview = (prompt.prompt_text[:50] + "...") if prompt and len(prompt.prompt_text) > 50 else (prompt.prompt_text if prompt else "")
                results.append((stem.sequence, stem.location_short, input_type, text_preview))
        
        print(f"Found {len(results)} prompts:\n")
        for seq, loc, itype, preview in results:
            print(f"  [{seq:4d}] {loc:40s} ({itype:10s}) {preview}")
        
        return results
    
    def find_by_location(self, part: int, module: int = None, exercise: int = None):
        """Find all content at a location."""
        results = []
        for stem in self.stem:
            if stem.part != part:
                continue
            if module is not None and stem.module != module:
                continue
            if exercise is not None and stem.exercise != exercise:
                continue
            results.append(stem)
        
        print(f"Found {len(results)} items:\n")
        for stem in results:
            print(f"  [{stem.sequence:4d}] {stem.location_short:40s} ({stem.block_type})")
        
        return results
    
    def search(self, query: str, case_sensitive: bool = False):
        """Search all content for a string."""
        if not case_sensitive:
            query = query.lower()
        
        results = []
        
        for stem in self.stem:
            text = ""
            source = ""
            
            if stem.block_type == 'content':
                cb = self.content_blocks.get(stem.content_id)
                if cb:
                    text = cb.content
                    source = f"content ({cb.content_type})"
            elif stem.block_type == 'prompt':
                p = self.prompts.get(stem.content_id)
                if p:
                    text = p.prompt_text
                    source = f"prompt ({p.input_type})"
            elif stem.block_type == 'tool':
                t = self.tools.get(stem.content_id)
                if t:
                    text = f"{t.name} {t.description} {t.instructions}"
                    source = f"tool ({t.name})"
            
            search_text = text if case_sensitive else text.lower()
            if query in search_text:
                results.append((stem.sequence, stem.location_short, source, text[:100]))
        
        print(f"Found {len(results)} matches for '{query}':\n")
        for seq, loc, source, preview in results:
            print(f"  [{seq:4d}] {loc:40s} ({source})")
            print(f"         {preview}...")
            print()
        
        return results
    
    def stats(self):
        """Show content statistics."""
        # Count by block type
        type_counts = {'content': 0, 'prompt': 0, 'tool': 0}
        for stem in self.stem:
            type_counts[stem.block_type] = type_counts.get(stem.block_type, 0) + 1
        
        # Count by content_type
        content_type_counts = {}
        for stem in self.stem:
            if stem.block_type == 'content':
                cb = self.content_blocks.get(stem.content_id)
                if cb:
                    content_type_counts[cb.content_type] = content_type_counts.get(cb.content_type, 0) + 1
        
        # Count by part
        part_counts = {1: 0, 2: 0, 3: 0}
        for stem in self.stem:
            part_counts[stem.part] = part_counts.get(stem.part, 0) + 1
        
        # Count prompts by input_type
        input_type_counts = {}
        for stem in self.stem:
            if stem.block_type == 'prompt':
                p = self.prompts.get(stem.content_id)
                if p:
                    input_type_counts[p.input_type] = input_type_counts.get(p.input_type, 0) + 1
        
        print("DreamTree Content Statistics")
        print("=" * 40)
        print(f"\nTotal stem rows: {len(self.stem)}")
        print(f"\nBy block type:")
        for t, c in type_counts.items():
            print(f"  {t:12s}: {c:4d}")
        
        print(f"\nContent blocks by type:")
        for t, c in sorted(content_type_counts.items(), key=lambda x: -x[1]):
            print(f"  {t:12s}: {c:4d}")
        
        print(f"\nBy part:")
        for p, c in part_counts.items():
            print(f"  Part {p}:      {c:4d}")
        
        print(f"\nPrompts by input type:")
        for t, c in sorted(input_type_counts.items(), key=lambda x: -x[1]):
            print(f"  {t:12s}: {c:4d}")
    
    def outline(self, part: int = None):
        """Show structural outline of content."""
        current_location = None
        
        for stem in self.stem:
            if part is not None and stem.part != part:
                continue
            
            loc = (stem.part, stem.module, stem.exercise)
            if loc != current_location:
                current_location = loc
                indent = "  " * (1 if stem.module > 0 else 0)
                indent += "  " * (1 if stem.exercise > 0 else 0)
                
                if stem.exercise == 0 and stem.module == 0:
                    print(f"\nPart {stem.part}")
                elif stem.exercise == 0:
                    print(f"{indent}Module {stem.part}.{stem.module}")
                else:
                    print(f"{indent}Exercise {stem.part}.{stem.module}.{stem.exercise} (seq {stem.sequence})")


# For quick notebook usage
def load(csv_folder: str = '.') -> ContentWalker:
    """Quick loader for notebook use."""
    return ContentWalker(csv_folder)


if __name__ == "__main__":
    import sys
    folder = sys.argv[1] if len(sys.argv) > 1 else '.'
    walker = ContentWalker(folder)
    walker.stats()