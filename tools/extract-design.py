"""Build shared English rule descriptions from the accepted design tables."""
import json
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
techs = []
field = None
fields = ['Propulsion', 'Energy & Weapons', 'Materials', 'Life Sciences', 'Computing', 'Society']
for line in (ROOT/'docs/design/1-research.md').read_text(encoding='utf-8').splitlines():
    if line.startswith('## '):
        field = next((f for f in fields if line.endswith(f)), None)
    match = re.match(r'\| \*\*(\d)\*\* \| (.*) \|', line)
    if match and field:
        for entry in match[2].split(' · '):
            name = re.search(r'\*\*(.*?)\*\*', entry)
            if name:
                title = name[1].rstrip(':')
                techs.append(dict(id=slug(title),name=title,field=field,tier=int(match[1]),cost=[40,80,150,260,420,650,1000,1500][int(match[1])-1],description=re.sub(r'\*\*','',entry).replace(title,'',1).lstrip(': ')))
buildings=[]
in_table=False
for line in (ROOT/'docs/design/2-economy.md').read_text(encoding='utf-8').splitlines():
    if line.startswith('## '): in_table=line.startswith('## 7.')
    if in_table and line.startswith('|'):
        cells=[c.strip() for c in line.strip('|').split('|')]
        if len(cells)==5 and cells[2].isdigit():
            buildings.append(dict(id=slug(cells[0]),name=cells[0],requires=cells[1],cost=int(cells[2]),upkeep=float(cells[3]),description=cells[4]))
result=dict(techs=techs,buildings=buildings)
target=ROOT/'packages/sim/src/rules-data.json'
target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'Extracted {len(techs)} research projects and {len(buildings)} constructible buildings.')
