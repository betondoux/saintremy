"""Saint Rémy 매거진 톤 카드뉴스 빌더 (RITUAL · PEOPLE 시리즈용).

1080x1350 4:5 슬라이드. 풀블리드 사진 + 다크 그라디언트 + 좌측 정렬 큰 타이틀.
사진 없으면 다크 그라디언트 단색 배경으로 시안.

CLI:
    python3 card_builder_magazine.py --config <config.json> --out <dir>
"""
import argparse
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
MARGIN = 100  # 인스타 그리드 3:4 크롭(좌우 34px씩) 안전 + 위아래 여유

INK_WHITE = (255, 255, 255)
INK_DIM = (215, 215, 215)
INK_META = (165, 165, 165)
INK_DARK_TOP = (10, 10, 12)
INK_DARK_BOT = (28, 26, 32)

FONT_HOME = Path.home() / 'Library' / 'Fonts'
F_BLACK = str(FONT_HOME / 'Pretendard-Black.otf')
F_EXTRA = str(FONT_HOME / 'Pretendard-ExtraBold.otf')
F_BOLD = str(FONT_HOME / 'Pretendard-Bold.otf')
F_SEMI = str(FONT_HOME / 'Pretendard-SemiBold.otf')
F_REG = str(FONT_HOME / 'Pretendard-Regular.otf')


def font(path, size):
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def tsize(draw, text, fnt):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap(text, fnt, max_w, draw):
    if '\n' in text:
        out = []
        for p in text.split('\n'):
            out.extend(wrap(p, fnt, max_w, draw))
        return out
    words = text.split(' ')
    lines, cur = [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if tsize(draw, test, fnt)[0] <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def crop_cover(img, tw, th, anchor_x=0.5, anchor_y=0.5):
    """4:5로 크롭. anchor=0.0이면 위/왼쪽, 1.0이면 아래/오른쪽 유지."""
    sw, sh = img.size
    sr, tr = sw / sh, tw / th
    if sr > tr:
        nw = int(sh * tr)
        x = int((sw - nw) * anchor_x)
        img = img.crop((x, 0, x + nw, sh))
    else:
        nh = int(sw / tr)
        y = int((sh - nh) * anchor_y)
        img = img.crop((0, y, sw, y + nh))
    return img.resize((tw, th), Image.LANCZOS)


def vgradient(width, height, top_a, bot_a, gamma=1.6):
    g = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    px = g.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        a = int(top_a + (bot_a - top_a) * (t ** gamma))
        for x in range(width):
            px[x, y] = (0, 0, 0, a)
    return g


def dark_bg():
    img = Image.new('RGB', (W, H), INK_DARK_TOP)
    px = img.load()
    for y in range(H):
        t = y / H
        r = int(INK_DARK_TOP[0] + (INK_DARK_BOT[0] - INK_DARK_TOP[0]) * t)
        g = int(INK_DARK_TOP[1] + (INK_DARK_BOT[1] - INK_DARK_TOP[1]) * t)
        b = int(INK_DARK_TOP[2] + (INK_DARK_BOT[2] - INK_DARK_TOP[2]) * t)
        for x in range(W):
            px[x, y] = (r, g, b)
    return img


def load_bg(slide):
    p = slide.get('photo')
    if p and os.path.exists(p):
        img = Image.open(p).convert('RGB')
        ax = slide.get('photo_anchor_x', 0.5)
        ay = slide.get('photo_anchor_y', 0.5)
        return crop_cover(img, W, H, anchor_x=ax, anchor_y=ay)
    return dark_bg()


def draw_masthead(d, kicker, series):
    f = font(F_SEMI, 22)
    if kicker:
        d.text((MARGIN, MARGIN), kicker.upper(), fill=INK_WHITE, font=f)
    if series:
        sw, _ = tsize(d, series.upper(), f)
        d.text((W - MARGIN - sw, MARGIN), series.upper(), fill=INK_WHITE, font=f)


def render_hook(slide):
    """bicnic 스타일 — 풀블리드 사진 + 좌하단 큰 흰 박스 타이틀 + 작은 라벨."""
    base = load_bg(slide).convert('RGBA')
    # 상단 매우 약한 그라디언트 (마스트헤드만 가독)
    base.alpha_composite(vgradient(W, 200, top_a=110, bot_a=0, gamma=1.5), (0, 0))
    # 하단 진한 그라디언트 (텍스트 영역)
    base.alpha_composite(vgradient(W, 740, top_a=0, bot_a=215, gamma=1.5), (0, H - 740))
    d = ImageDraw.Draw(base)
    draw_masthead(d, slide.get('kicker', ''), slide.get('series', ''))

    title_lines = slide.get('title_lines', [])
    sub = slide.get('sub', '')
    label = slide.get('label', '')

    f_hook = font(F_BLACK, 70)
    f_sub = font(F_REG, 26)
    f_label = font(F_SEMI, 24)

    pad_x, pad_y = 22, 14
    _, lh_t = tsize(d, 'Ag한', f_hook)
    box_h = lh_t + pad_y * 2

    sub_lines = wrap(sub, f_sub, W - MARGIN * 2, d) if sub else []
    sub_h = len(sub_lines) * 40 + (16 if sub_lines else 0)

    title_h = len(title_lines) * box_h + max(len(title_lines) - 1, 0) * 14
    label_h = 44 if label else 0

    y_bottom = H - MARGIN - 20
    y = y_bottom - sub_h - title_h - label_h

    if label:
        d.text((MARGIN, y), label.upper(), fill=INK_WHITE, font=f_label)
        y += label_h

    for ln in title_lines:
        tw, _ = tsize(d, ln, f_hook)
        box_w = tw + pad_x * 2
        d.rectangle((MARGIN, y, MARGIN + box_w, y + box_h), fill=INK_WHITE)
        d.text((MARGIN + pad_x, y + pad_y - 6), ln, fill=(15, 15, 15), font=f_hook)
        y += box_h + 14

    if sub_lines:
        y += 8
        for ln in sub_lines:
            d.text((MARGIN, y), ln, fill=INK_WHITE, font=f_sub)
            y += 40

    return base.convert('RGB')


def render_info(slide):
    base = load_bg(slide).convert('RGBA')
    base.alpha_composite(vgradient(W, H, top_a=195, bot_a=110, gamma=1.3), (0, 0))
    d = ImageDraw.Draw(base)
    draw_masthead(d, slide.get('kicker', ''), slide.get('series', ''))

    intro = slide.get('intro', '')
    body_bold = slide.get('body_bold', '')
    outro = slide.get('outro', '')

    f_intro = font(F_REG, 30)
    f_bold = font(F_EXTRA, 40)
    f_outro = font(F_REG, 28)

    blocks = []
    if intro:
        lines = wrap(intro, f_intro, W - MARGIN * 2, d)
        blocks.append(('intro', lines, f_intro, INK_WHITE, 46))
    if body_bold:
        lines = wrap(body_bold, f_bold, W - MARGIN * 2, d)
        blocks.append(('bold', lines, f_bold, INK_WHITE, 58))
    if outro:
        lines = wrap(outro, f_outro, W - MARGIN * 2, d)
        blocks.append(('outro', lines, f_outro, INK_DIM, 42))

    gap = 36
    total = sum(len(lines) * lh for _, lines, _, _, lh in blocks)
    total += gap * max(len(blocks) - 1, 0)
    y = (H - total) // 2 - 40

    for i, (_, lines, f, color, lh) in enumerate(blocks):
        for ln in lines:
            tw, _ = tsize(d, ln, f)
            d.text(((W - tw) // 2, y), ln, fill=color, font=f)
            y += lh
        if i < len(blocks) - 1:
            y += gap

    return base.convert('RGB')


def render_insight(slide):
    base = dark_bg().convert('RGBA')
    d = ImageDraw.Draw(base)
    draw_masthead(d, slide.get('kicker', 'INSIGHT'), slide.get('series', ''))

    f_qmark = font(F_BLACK, 220)
    d.text((MARGIN - 12, MARGIN + 60), '"', fill=INK_WHITE, font=f_qmark)

    f_quote = font(F_EXTRA, 50)
    quote = slide.get('quote', '')
    lines = wrap(quote, f_quote, W - MARGIN * 2, d)
    y = MARGIN + 320
    for ln in lines:
        d.text((MARGIN, y), ln, fill=INK_WHITE, font=f_quote)
        y += 72

    y += 50
    f_attr = font(F_REG, 26)
    d.text((MARGIN, y), '— ' + slide.get('attribution', ''), fill=INK_META, font=f_attr)
    return base.convert('RGB')


def render_sources(slide):
    base = dark_bg().convert('RGBA')
    d = ImageDraw.Draw(base)
    draw_masthead(d, 'SOURCES', slide.get('series', ''))

    f_title = font(F_EXTRA, 56)
    d.text((MARGIN, MARGIN + 80), slide.get('title', '1차 자료'), fill=INK_WHITE, font=f_title)

    y = MARGIN + 220
    f_body = font(F_SEMI, 26)
    f_meta = font(F_REG, 22)
    for src in slide.get('sources', []):
        d.ellipse((MARGIN, y + 12, MARGIN + 10, y + 22), fill=INK_WHITE)
        lines = wrap(src.get('title', ''), f_body, W - MARGIN * 2 - 30, d)
        for ln in lines:
            d.text((MARGIN + 30, y), ln, fill=INK_WHITE, font=f_body)
            y += 38
        meta = src.get('source', '')
        if meta:
            d.text((MARGIN + 30, y + 2), meta, fill=INK_META, font=f_meta)
            y += 34
        y += 22
    return base.convert('RGB')


def render_cta(slide):
    base = dark_bg().convert('RGBA')
    d = ImageDraw.Draw(base)
    draw_masthead(d, slide.get('kicker', 'MORE'), slide.get('series', ''))

    f_url = font(F_BLACK, 96)
    url = slide.get('url', 'saintremy.kr')
    uw, uh = tsize(d, url, f_url)
    d.text(((W - uw) // 2, (H - uh) // 2 - 60), url, fill=INK_WHITE, font=f_url)

    f_sub = font(F_REG, 30)
    sub = slide.get('subline', '프로필 링크')
    sw, _ = tsize(d, sub, f_sub)
    d.text(((W - sw) // 2, (H - uh) // 2 + 70), sub, fill=INK_DIM, font=f_sub)

    f_foot = font(F_SEMI, 20)
    foot = (slide.get('series') or 'SAINT-RÉMY · SPORTS CULTURE').upper()
    fw, _ = tsize(d, foot, f_foot)
    d.text(((W - fw) // 2, H - MARGIN - 30), foot, fill=INK_META, font=f_foot)
    return base.convert('RGB')


def render_essay(slide):
    """bicnic 스타일 — 풀블리드 사진 + 흰 박스 제목(검은 글씨) + 흰 본문 풀어쓰기.
    제목·본문 블록이 카드 하단에 정렬되고 위쪽 사진은 그대로 살아남.
    """
    base = load_bg(slide).convert('RGBA')
    # 전체 약한 다크 오버레이 (사진 톤 다운)
    base.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, 55)), (0, 0))
    # 상단 그라디언트 (마스트헤드 가독)
    base.alpha_composite(vgradient(W, 260, top_a=150, bot_a=0, gamma=1.4), (0, 0))

    d_meta = ImageDraw.Draw(base)
    draw_masthead(d_meta, slide.get('kicker', ''), slide.get('series', ''))

    f_title = font(F_BLACK, 52)
    f_lead = font(F_BOLD, 38)
    f_body = font(F_REG, 34)
    f_credit = font(F_REG, 18)

    title = slide.get('title', '')
    lead = slide.get('lead', '')
    body = slide.get('body', '')
    credit = slide.get('credit', '')

    pad_x, pad_y = 20, 12
    _, lh_t = tsize(d_meta, 'Ag한', f_title)
    box_h = lh_t + pad_y * 2

    title_lines = wrap(title, f_title, W - MARGIN * 2 - pad_x * 2, d_meta) if title else []
    title_block_h = len(title_lines) * box_h + max(len(title_lines) - 1, 0) * 12

    lead_lines = wrap(lead, f_lead, W - MARGIN * 2, d_meta) if lead else []
    lead_block_h = len(lead_lines) * 54 + (30 if lead_lines else 0)

    body_lines = wrap(body, f_body, W - MARGIN * 2, d_meta) if body else []
    body_block_h = len(body_lines) * 50 + (26 if body_lines else 0)

    text_block_h = title_block_h + lead_block_h + body_block_h
    y_top = H - MARGIN - 30 - text_block_h
    y_top = max(y_top, 280)

    grad_top = max(y_top - 150, 200)
    grad_h = H - grad_top
    base.alpha_composite(vgradient(W, grad_h, top_a=0, bot_a=235, gamma=1.25), (0, grad_top))

    d = ImageDraw.Draw(base)
    y = y_top

    for ln in title_lines:
        tw, _ = tsize(d, ln, f_title)
        box_w = tw + pad_x * 2
        d.rectangle((MARGIN, y, MARGIN + box_w, y + box_h), fill=INK_WHITE)
        d.text((MARGIN + pad_x, y + pad_y - 4), ln, fill=(15, 15, 15), font=f_title)
        y += box_h + 12

    if lead_lines:
        y += 22
        for ln in lead_lines:
            d.text((MARGIN, y), ln, fill=INK_WHITE, font=f_lead)
            y += 50

    if body_lines:
        y += 20
        for ln in body_lines:
            d.text((MARGIN, y), ln, fill=INK_WHITE, font=f_body)
            y += 50

    if credit:
        cw, _ = tsize(d, credit, f_credit)
        d.text((W - MARGIN - cw, H - MARGIN - 8), credit, fill=INK_DIM, font=f_credit)

    return base.convert('RGB')


def render_closing(slide):
    """마무리 한 장 — 가운데 정렬 인용 + 출처 + saintremy.kr."""
    base = dark_bg().convert('RGBA')
    d = ImageDraw.Draw(base)
    draw_masthead(d, slide.get('kicker', 'CLOSING'), slide.get('series', ''))

    f_qmark = font(F_BLACK, 140)
    qw, _ = tsize(d, '"', f_qmark)
    d.text(((W - qw) // 2, MARGIN + 60), '"', fill=INK_WHITE, font=f_qmark)

    f_quote = font(F_EXTRA, 46)
    f_attr = font(F_REG, 24)
    quote = slide.get('quote', '')
    quote_lines = wrap(quote, f_quote, W - MARGIN * 2, d)
    y = MARGIN + 240
    for ln in quote_lines:
        tw, _ = tsize(d, ln, f_quote)
        d.text(((W - tw) // 2, y), ln, fill=INK_WHITE, font=f_quote)
        y += 64
    y += 20
    attr = '— ' + slide.get('attribution', '')
    aw, _ = tsize(d, attr, f_attr)
    d.text(((W - aw) // 2, y), attr, fill=INK_META, font=f_attr)

    y_url = H - MARGIN - 160
    f_url = font(F_BLACK, 64)
    url = slide.get('url', 'saintremy.kr')
    uw, _ = tsize(d, url, f_url)
    d.text(((W - uw) // 2, y_url), url, fill=INK_WHITE, font=f_url)
    f_sub = font(F_REG, 24)
    sub = slide.get('subline', '프로필 링크 · 풀 본문')
    sw, _ = tsize(d, sub, f_sub)
    d.text(((W - sw) // 2, y_url + 80), sub, fill=INK_DIM, font=f_sub)

    sources_list = slide.get('sources', [])
    n = len(sources_list)
    f_src_lbl = font(F_SEMI, 20)
    f_src_title = font(F_SEMI, 22)
    f_src_meta = font(F_REG, 19)
    block_h = 30 + 30 + n * 52
    y_src = (H - block_h) // 2 + 80
    line_w = 280
    line_x = (W - line_w) // 2
    d.line([(line_x, y_src - 24), (line_x + line_w, y_src - 24)], fill=(80, 80, 80), width=1)
    lw, _ = tsize(d, 'SOURCES', f_src_lbl)
    d.text(((W - lw) // 2, y_src - 8), 'SOURCES', fill=INK_DIM, font=f_src_lbl)
    sy = y_src + 36
    for s in sources_list:
        title = s.get('title', '')
        meta = s.get('source', '')
        tw, _ = tsize(d, title, f_src_title)
        d.text(((W - tw) // 2, sy), title, fill=INK_WHITE, font=f_src_title)
        sy += 26
        if meta:
            mw, _ = tsize(d, meta, f_src_meta)
            d.text(((W - mw) // 2, sy), meta, fill=INK_META, font=f_src_meta)
        sy += 26

    return base.convert('RGB')


RENDERS = {
    'hook': render_hook,
    'info': render_info,
    'essay': render_essay,
    'insight': render_insight,
    'sources': render_sources,
    'cta': render_cta,
    'closing': render_closing,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--config', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    with open(args.config) as f:
        cfg = json.load(f)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    series = cfg.get('series', '')
    for i, slide in enumerate(cfg['slides'], 1):
        t = slide['type']
        if t not in RENDERS:
            print(f'skip {i:02d} type={t}')
            continue
        slide.setdefault('series', series)
        img = RENDERS[t](slide)
        out = out_dir / f'{i:02d}-{t}.jpg'
        img.save(out, 'JPEG', quality=92)
        print(f'  {out.name}')

    print(f'\n[done] {len(cfg["slides"])} slides → {out_dir}')


if __name__ == '__main__':
    main()
