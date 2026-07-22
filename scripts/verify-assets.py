from pathlib import Path
import re

base = Path("src/data")
for file in ["projects.ts", "disciplines.ts"]:
    text = (base / file).read_text(encoding="utf-8")
    paths = re.findall(r'from "([^"]+)"', text)
    missing = [p for p in paths if not (base / p).resolve().exists()]
    print(file, "imports", len(paths), "missing", len(missing))
    for m in missing[:30]:
        print(" ", m)

for file in ["src/routes/index.tsx", "src/routes/about.tsx"]:
    text = Path(file).read_text(encoding="utf-8")
    paths = re.findall(r'from "([^"]+)"', text)
    missing = [p for p in paths if p.startswith("../assets") and not (Path(file).parent / p).resolve().exists()]
    print(file, "missing", missing)
