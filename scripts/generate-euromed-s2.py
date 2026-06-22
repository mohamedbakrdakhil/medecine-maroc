#!/usr/bin/env python3
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path("/Users/bakrdakhil/Documents/meddoc/euromed /s2/drive-download-20260617T184801Z-3-001")
REPO = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = REPO / "public/courses/euromed/s2"
CONTENT_ROOT = REPO / "lib/content"

MODULES = [
    ("Anatomie II", "anatomie-2-s2", "anatomieS2Chapters"),
    ("Biophysique ", "biophysique-s2", "biophysiqueS2Chapters"),
    ("Histologie-Embryologie 1", "histologie-embryologie-1-s2", "histologieEmbryologieS2Chapters"),
    ("Histoire de la med et Psycho-Socio", "histoire-psycho-socio-s2", "histoirePsychoSocioS2Chapters"),
    ("Techniques de communication ", "techniques-communication-s2", "techniquesCommunicationS2Chapters"),
    ("-CAHIER D’EXAMENS-", "cahier-examens-s2", "cahierExamensS2Chapters"),
]

def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "support"

def clean_title(value: str) -> str:
    value = Path(value).stem
    value = re.sub(r"[_]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip(" -")

def pdf_pages(path: Path) -> int:
    output = subprocess.check_output(["pdfinfo", str(path)], text=True, stderr=subprocess.DEVNULL)
    for line in output.splitlines():
        if line.startswith("Pages:"):
            return int(line.split(":", 1)[1].strip())
    return 0

def render_pdf(pdf: Path, out_dir: Path) -> int:
    done = out_dir / ".done"
    if done.exists():
        return len(list(out_dir.glob("page-*.jpg")))
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    prefix = out_dir / "page"
    subprocess.check_call([
        "pdftoppm",
        "-jpeg",
        "-r",
        "110",
        "-jpegopt",
        "quality=84",
        str(pdf),
        str(prefix),
    ])
    generated = sorted(out_dir.glob("page-*.jpg"), key=lambda p: int(re.search(r"-(\d+)\.jpg$", p.name).group(1)))
    for index, page in enumerate(generated, 1):
        target = out_dir / f"page-{index:03d}.jpg"
        if page != target:
            page.rename(target)
    done.write_text("ok\n")
    return len(generated)

def chapter_for_pdf(module_dir: Path, module_id: str, pdf: Path):
    rel = pdf.relative_to(module_dir)
    rel_parts = list(rel.parts)
    section_parts = rel_parts[:-1]
    section_slug = "/".join(slugify(part) for part in section_parts)
    title = clean_title(pdf.name)
    chapter_id = slugify("-".join(section_parts + [title]))
    page_dir = PUBLIC_ROOT / module_id / section_slug / f"{slugify(title)}-pages"
    count = render_pdf(pdf, page_dir)
    public_dir = "/" + str(page_dir.relative_to(REPO / "public")).replace("\\", "/")
    pages = [
        {"imageUrl": f"{public_dir}/page-{i:03d}.jpg", "alt": f"{title} - page {i}"}
        for i in range(1, count + 1)
    ]
    professor = " / ".join(section_parts[:2]) if section_parts else "Euromed"
    return {
        "id": chapter_id,
        "title": title,
        "professor": professor or "Euromed",
        "sourcePages": pages,
        "sourcePagesTitle": "Support de cours",
        "sourcePagesSubtitle": f"{count} pages du support original",
        "keyPoints": [],
        "sections": [],
    }

def write_content(module_id: str, export_name: str, chapters: list[dict]):
    target = CONTENT_ROOT / f"euromed-s2-{module_id}.ts"
    data = json.dumps(chapters, ensure_ascii=False, indent=2)
    target.write_text(f"import type {{ Chapter }} from './types'\n\nexport const {export_name}: Chapter[] = {data}\n", encoding="utf-8")

def main():
    summary = {}
    for folder_name, module_id, export_name in MODULES:
        module_dir = ROOT / folder_name
        pdfs = sorted(module_dir.rglob("*.pdf")) if module_dir.exists() else []
        chapters = []
        for pdf in pdfs:
            try:
                chapters.append(chapter_for_pdf(module_dir, module_id, pdf))
            except Exception as exc:
                print(f"SKIP\t{pdf}\t{exc}")
        write_content(module_id, export_name, chapters)
        summary[module_id] = len(chapters)
        print(f"{module_id}: {len(chapters)} supports")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
