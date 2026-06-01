import zipfile
import re
from pathlib import Path

path = Path("App Audit and Prompts.docx")
if not path.exists():
    raise FileNotFoundError(path)
with zipfile.ZipFile(path) as z:
    names = [n for n in z.namelist() if n.startswith("word/") and n.endswith(".xml")]
    text = "\n".join(z.read(n).decode("utf-8", errors="ignore") for n in names)
    paras = re.findall(r"<w:t[^>]*>(.*?)</w:t>", text)
    out = "\n".join(paras)
    Path("docx_text.txt").write_text(out, encoding="utf-8")
    print("Saved extracted text to docx_text.txt")
