#!/usr/bin/env python3.12
"""Saint-Rémy 카드뉴스 후보 큐 → 다크모드 PDF"""
import html
import json
import pathlib
import subprocess
import sys

DATA = pathlib.Path(__file__).with_name("queue_data.json")
OUT_HTML = pathlib.Path(__file__).with_name("queue.html")
OUT_PDF = pathlib.Path("/Users/kimsucheol/Desktop/Saint-Remy_카드뉴스_후보큐.pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page { size: A4; margin: 13mm 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin:0; padding:0; background:#0C0C0D; }
/* 좌우 여백은 body padding으로 — @page 좌우 마진에 의존하면 렌더러에 따라 잘린다 */
body { font-family:'Pretendard','Apple SD Gothic Neo',sans-serif; color:#E8E8E8;
       font-size:9.6pt; line-height:1.62; padding:0 15mm; }
.cover { padding:34mm 0 20mm; border-bottom:1px solid #2A2A2C; margin-bottom:9mm; }
.brand { font-size:8pt; letter-spacing:.30em; color:#8C8C90; text-transform:uppercase; }
.title { font-size:27pt; font-weight:900; letter-spacing:-.02em; margin:7mm 0 4mm; line-height:1.15; }
.sub { font-size:10.5pt; color:#A6A6AA; max-width:150mm; }
.meta { margin-top:8mm; font-size:8.4pt; color:#75757A; }
.rot { margin:7mm 0 0; display:flex; gap:5mm; flex-wrap:wrap; }
.rot div { border:1px solid #2E2E31; border-radius:2px; padding:3mm 4mm; font-size:8.6pt; color:#C8C8CC; }
.rot b { color:#fff; display:block; font-size:9.6pt; margin-bottom:1mm; }
h2.track { font-size:15.5pt; font-weight:900; margin:11mm 0 1.5mm; padding-top:5mm;
           border-top:2px solid #E8E8E8; letter-spacing:-.01em; page-break-after:avoid; }
.tnote { font-size:8.6pt; color:#8C8C90; margin-bottom:6mm; page-break-after:avoid; }
.card { border:1px solid #262629; border-radius:3px; padding:5mm 5.5mm; margin-bottom:4.5mm;
        background:#131315; page-break-inside:avoid; }
.chead { display:flex; align-items:baseline; gap:3mm; margin-bottom:2.5mm; }
.num { font-size:8pt; color:#77777C; font-variant-numeric:tabular-nums; min-width:8mm; }
.topic { font-size:11.4pt; font-weight:700; color:#fff; flex:1; letter-spacing:-.01em; }
.badge { font-size:7.4pt; padding:1mm 2.4mm; border-radius:2px; white-space:nowrap; font-weight:700; }
.b-strong { background:#E8E8E8; color:#0C0C0D; }
.b-mid { background:#3A3A3E; color:#EDEDED; }
.b-weak { background:transparent; color:#8C8C90; border:1px solid #3A3A3E; }
.hook { border-left:2px solid #E8E8E8; padding:2mm 0 2mm 4mm; margin:0 0 3mm;
        font-size:11pt; font-weight:700; color:#fff; white-space:pre-line; line-height:1.42; }
table.kv { width:100%; border-collapse:collapse; }
table.kv td { padding:1.5mm 0; vertical-align:top; border-bottom:1px solid #1E1E21; }
table.kv td.k { width:26mm; color:#85858A; font-size:8.4pt; padding-right:3mm; }
table.kv tr:last-child td { border-bottom:none; }
.src { color:#B8B8BE; font-size:8.8pt; }
.act { color:#fff; }
.warn { color:#C9A227; }
.foot { margin-top:10mm; padding-top:4mm; border-top:1px solid #2A2A2C;
        font-size:8pt; color:#6E6E73; }
"""


def badge(level: str) -> str:
    t = (level or "").strip()
    cls = "b-mid"
    if any(k in t for k in ("강함", "높음")):
        cls = "b-strong"
    elif any(k in t for k in ("약함", "낮음", "반박", "부족")):
        cls = "b-weak"
    return f'<span class="badge {cls}">{html.escape(t)}</span>'


def row(k, v, cls=""):
    if not v:
        return ""
    c = f' class="{cls}"' if cls else ""
    return f'<tr><td class="k">{html.escape(k)}</td><td{c}>{html.escape(str(v))}</td></tr>'


def render(d):
    parts = [f"<style>{CSS}</style>"]
    parts.append(f"""<div class="cover">
<div class="brand">Saint-Rémy · Editorial Pipeline</div>
<div class="title">카드뉴스 후보 큐<br>3트랙 로테이션</div>
<div class="sub">{html.escape(d['subtitle'])}</div>
<div class="rot">
  <div><b>① 삶에 도움되는 정보</b>논문 1차 자료 + 오늘 할 행동</div>
  <div><b>② 트렌드</b>수치와 출처가 붙는 것만</div>
  <div><b>③ 사회소식</b>정부·공공 1차 통계 우선</div>
</div>
<div class="meta">{html.escape(d['meta'])}</div>
</div>""")

    for tr in d["tracks"]:
        parts.append(f'<h2 class="track">{html.escape(tr["name"])}</h2>')
        parts.append(f'<div class="tnote">{html.escape(tr["note"])}</div>')
        for i, c in enumerate(tr["items"], 1):
            parts.append('<div class="card"><div class="chead">'
                         f'<span class="num">{i:02d}</span>'
                         f'<span class="topic">{html.escape(c["topic"])}</span>'
                         f'{badge(c.get("level",""))}</div>')
            hook = c.get("hook", "")
            if hook:
                parts.append(f'<div class="hook">{html.escape(hook)}</div>')
            parts.append("<table class=\"kv\">")
            parts.append(row("근거", c.get("source"), "src"))
            parts.append(row("수치", c.get("numbers"), "src"))
            parts.append(row("한국 자료", c.get("korea"), "src"))
            parts.append(row("행동 / 각도", c.get("action"), "act"))
            parts.append(row("왜 꽂히나", c.get("why")))
            parts.append(row("주의", c.get("caution"), "warn"))
            parts.append(row("발행 시점", c.get("timing")))
            parts.append("</table></div>")

    parts.append(f'<div class="foot">{html.escape(d["footer"])}</div>')
    return "\n".join(parts)


def main():
    d = json.loads(DATA.read_text(encoding="utf-8"))
    OUT_HTML.write_text(render(d), encoding="utf-8")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri()],
                   check=True, capture_output=True, timeout=180)
    n = sum(len(t["items"]) for t in d["tracks"])
    print(f"OK  {OUT_PDF}  ({OUT_PDF.stat().st_size//1024} KB · 후보 {n}개)")


if __name__ == "__main__":
    sys.exit(main())
