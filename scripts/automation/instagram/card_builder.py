"""Saint Rémy 인스타 카드뉴스 빌더 (Wirecutter 톤).

1080×1080 정사각 슬라이드 9장(HERO 제외) 자동 생성.
- 배경: cream #F7F5F1
- 폰트: MaruBuri-Bold (제목, Noto Serif KR fallback) + NanumGothic (본문, Pretendard fallback)
- 액센트: signal red #C4361C
- 슬라이드 타입: hook · info · table · insight · sources · cta

CLI 사용:
    python3 card_builder.py --config <config.json> --out <dir>
"""
import argparse
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# 디자인 토큰
W = H = 1080
MARGIN = 110
BG = (247, 245, 241)         # cream
INK_900 = (10, 10, 11)
INK_700 = (42, 39, 36)
INK_500 = (74, 70, 66)
INK_300 = (180, 175, 168)
SIGNAL = (196, 54, 28)        # signal red
RULE = (224, 220, 212)

FONT_HOME = Path.home() / 'Library' / 'Fonts'
# Pretendard — 한국에서 가장 모던한 산세리프
F_TITLE = str(FONT_HOME / 'Pretendard-ExtraBold.otf')
F_TITLE_LIGHT = str(FONT_HOME / 'Pretendard-SemiBold.otf')
F_BODY = str(FONT_HOME / 'Pretendard-Regular.otf')
F_BODY_BOLD = str(FONT_HOME / 'Pretendard-Bold.otf')
F_DISPLAY = str(FONT_HOME / 'Pretendard-Black.otf')


def font(path: str, size: int):
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def text_size(draw, text, fnt):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap(text, fnt, max_w, draw):
    words = text.split(' ')
    lines, cur = [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        tw, _ = text_size(draw, test, fnt)
        if tw <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_header(draw, page_num, total, kicker):
    """상단 라벨: 카테고리 KICKER (좌) · 페이지 (우)"""
    f = font(F_BODY_BOLD, 22)
    draw.text((MARGIN, MARGIN), kicker.upper(), fill=SIGNAL, font=f)
    page = f'{page_num:02d} / {total:02d}'
    pw, _ = text_size(draw, page, f)
    draw.text((W - MARGIN - pw, MARGIN), page, fill=INK_500, font=f)
    # 헤더 아래 얇은 라인
    y_line = MARGIN + 35
    draw.line([(MARGIN, y_line), (W - MARGIN, y_line)], fill=RULE, width=1)


def draw_footer(draw):
    """하단: 도메인 + 인스타 핸들"""
    f = font(F_BODY_BOLD, 20)
    y = H - MARGIN - 5
    draw.line([(MARGIN, y - 30), (W - MARGIN, y - 30)], fill=RULE, width=1)
    draw.text((MARGIN, y), 'saintremy.kr', fill=INK_700, font=f)
    handle = '@saintremy.kr'
    hw, _ = text_size(draw, handle, f)
    draw.text((W - MARGIN - hw, y), handle, fill=INK_500, font=f)


def draw_text_block(draw, x, y, text, fnt, color, max_w, line_height=1.45, max_lines=None):
    """줄바꿈 텍스트 블록 그리고 다음 y 반환"""
    lines = wrap(text, fnt, max_w, draw)
    if max_lines:
        lines = lines[:max_lines]
    _, lh = text_size(draw, 'Ag한', fnt)
    actual_lh = int(lh * line_height)
    for i, ln in enumerate(lines):
        draw.text((x, y + i * actual_lh), ln, fill=color, font=fnt)
    return y + len(lines) * actual_lh


def render_hook(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    photo_path = slide.get('photo')
    has_photo = bool(photo_path and os.path.exists(photo_path))

    if has_photo:
        photo = Image.open(photo_path).convert('RGB')
        photo = crop_cover(photo, W, H)
        img.paste(photo, (0, 0))
        # 전체 약간 어둡게 + 하단 강한 그래디언트 (텍스트 가독성)
        base = img.convert('RGBA')
        base = Image.alpha_composite(base, Image.new('RGBA', (W, H), (0, 0, 0, 90)))
        grad = make_gradient_rgba(W, 720, 0, 215, gamma=1.5)
        base.paste(grad, (0, H - 720), grad)
        img = base.convert('RGB')

    d = ImageDraw.Draw(img)

    # 헤더
    f_kick = font(F_BODY_BOLD, 22)
    kicker = slide.get('kicker', 'F&B 경영').upper()
    page_str = f'{page:02d} / {total:02d}'
    if has_photo:
        kw, _ = text_size(d, kicker, f_kick)
        d.rectangle((MARGIN, MARGIN - 8, MARGIN + kw + 28, MARGIN + 30), fill=SIGNAL)
        d.text((MARGIN + 14, MARGIN), kicker, fill=(255, 255, 255), font=f_kick)
        pw, _ = text_size(d, page_str, f_kick)
        d.text((W - MARGIN - pw, MARGIN), page_str, fill=(255, 255, 255), font=f_kick)
    else:
        draw_header(d, page, total, slide.get('kicker', 'F&B 경영'))

    # 큰 통계 (옵션) — 사진 모드면 생략하거나 작게 처리
    stat = slide.get('stat')
    stat_label = slide.get('stat_label', '')

    # 후킹 타이틀: title_lines가 있으면 명시 줄바꿈, 없으면 wrap
    f_hook = font(F_TITLE, 56 if has_photo else 50)
    if slide.get('title_lines'):
        title_lines = slide['title_lines']
    else:
        title_lines = wrap(slide.get('title', ''), f_hook, W - MARGIN * 2 - (60 if has_photo else 0), d)
    _, lh = text_size(d, 'Ag한', f_hook)
    line_h = int(lh * 1.35)
    block_h = len(title_lines) * line_h

    if has_photo:
        # 사진 모드: 통계 생략, 하단 정렬
        y = H - MARGIN - 80 - block_h
        title_color = (255, 255, 255)
        # 작은 부제 (stat_label만 사용 — sub 라벨로)
        sub = slide.get('sub') or stat_label
        if sub:
            f_sub = font(F_BODY_BOLD, 24)
            sub_w, sub_h = text_size(d, sub, f_sub)
            d.text((MARGIN, y - sub_h - 18), sub, fill=(255, 200, 195), font=f_sub)
        for ln in title_lines:
            d.text((MARGIN, y), ln, fill=title_color, font=f_hook)
            y += line_h
    else:
        # 텍스트 모드 (cream): 가운데 정렬 + 큰 통계
        y = 240
        if stat:
            f_stat = font(F_DISPLAY, 200)
            sw, sh = text_size(d, stat, f_stat)
            d.text(((W - sw) // 2, y), stat, fill=SIGNAL, font=f_stat)
            y += int(200 * 1.05) + 30
            if stat_label:
                f_lbl = font(F_BODY_BOLD, 26)
                lw, _ = text_size(d, stat_label, f_lbl)
                d.text(((W - lw) // 2, y), stat_label, fill=INK_700, font=f_lbl)
                y += 80
        if not stat:
            y = (H - block_h) // 2 - 50
        for ln in title_lines:
            tw, _ = text_size(d, ln, f_hook)
            d.text(((W - tw) // 2, y), ln, fill=INK_900, font=f_hook)
            y += line_h

    # 푸터
    if has_photo:
        f_dom = font(F_BODY_BOLD, 18)
        d.text((MARGIN, H - MARGIN - 8), 'saintremy.kr', fill=(255, 255, 255), font=f_dom)
        handle = '@saintremy.kr'
        hw, _ = text_size(d, handle, f_dom)
        d.text((W - MARGIN - hw, H - MARGIN - 8), handle, fill=(255, 255, 255), font=f_dom)
    else:
        draw_footer(d)
    return img


def render_info(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_header(d, page, total, slide.get('kicker', ''))

    y = 180
    # 작은 라벨 (회사명 등)
    if slide.get('label'):
        f_lbl = font(F_BODY_BOLD, 22)
        d.text((MARGIN, y), slide['label'].upper(), fill=SIGNAL, font=f_lbl)
        y += 40
    # 제목
    f_title = font(F_TITLE, 56)
    y = draw_text_block(d, MARGIN, y, slide['title'], f_title, INK_900, W - MARGIN * 2, 1.25)
    y += 30
    # 본문
    if slide.get('body'):
        f_body = font(F_BODY, 28)
        y = draw_text_block(d, MARGIN, y, slide['body'], f_body, INK_700, W - MARGIN * 2, 1.55)
        y += 35
    # 통계 박스 (옵션)
    if slide.get('stats'):
        box_y = y
        box_h = 60 + 70 * len(slide['stats'])
        d.rectangle((MARGIN, box_y, W - MARGIN, box_y + box_h),
                    outline=INK_900, width=2)
        bx = MARGIN + 30
        by = box_y + 30
        f_k = font(F_BODY_BOLD, 22)
        f_v = font(F_DISPLAY, 40)
        for st in slide['stats']:
            d.text((bx, by), st['label'], fill=INK_500, font=f_k)
            vw, _ = text_size(d, st['value'], f_v)
            d.text((W - MARGIN - 30 - vw, by - 8), st['value'],
                   fill=SIGNAL if st.get('accent') else INK_900, font=f_v)
            by += 70

    draw_footer(d)
    return img


def render_table(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_header(d, page, total, slide.get('kicker', ''))

    # 제목
    f_title = font(F_TITLE, 50)
    y = draw_text_block(d, MARGIN, 180, slide['title'], f_title, INK_900, W - MARGIN * 2, 1.2)
    y += 50
    # 표
    cols = slide['columns']  # ['', '스타벅스', '메가', '컴포즈']
    rows = slide['rows']     # [{'label': '매장 수', 'values': ['2,131', '3,325', '2,649']}]
    n_cols = len(cols)
    table_w = W - MARGIN * 2
    col_w = table_w // n_cols
    row_h = 70
    f_h = font(F_BODY_BOLD, 24)
    f_label = font(F_BODY_BOLD, 24)
    f_v = font(F_BODY_BOLD, 26)

    # 헤더
    for i, c in enumerate(cols):
        x = MARGIN + i * col_w
        cw, ch = text_size(d, c, f_h)
        d.text((x + (col_w - cw) // 2, y + 12), c,
               fill=SIGNAL if i > 0 else INK_500, font=f_h)
    y += row_h
    d.line([(MARGIN, y), (W - MARGIN, y)], fill=INK_900, width=2)
    # 행
    for r_idx, row in enumerate(rows):
        # row label (왼쪽 칸)
        x = MARGIN
        d.text((x + 20, y + 18), row['label'], fill=INK_700, font=f_label)
        # 값
        for i, v in enumerate(row['values']):
            x = MARGIN + (i + 1) * col_w
            vw, _ = text_size(d, v, f_v)
            d.text((x + (col_w - vw) // 2, y + 16), v,
                   fill=INK_900, font=f_v)
        y += row_h
        d.line([(MARGIN, y), (W - MARGIN, y)], fill=RULE, width=1)

    # 캡션
    if slide.get('caption'):
        f_cap = font(F_BODY, 20)
        y += 25
        draw_text_block(d, MARGIN, y, slide['caption'], f_cap, INK_500, W - MARGIN * 2, 1.5)

    draw_footer(d)
    return img


def render_insight(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_header(d, page, total, slide.get('kicker', 'INSIGHT'))

    # 큰 따옴표
    f_quote = font(F_DISPLAY, 200)
    d.text((MARGIN, MARGIN + 80), '"', fill=SIGNAL, font=f_quote)

    # 본문 인용
    f_body = font(F_TITLE, 44)
    y = 360
    y = draw_text_block(d, MARGIN, y, slide['quote'], f_body, INK_900, W - MARGIN * 2, 1.4)
    y += 40

    # 출처
    if slide.get('attribution'):
        f_attr = font(F_BODY_BOLD, 24)
        d.text((MARGIN, y), '— ' + slide['attribution'], fill=INK_500, font=f_attr)

    draw_footer(d)
    return img


def render_sources(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_header(d, page, total, '출처')

    f_title = font(F_TITLE, 50)
    draw_text_block(d, MARGIN, 180, slide.get('title', '1차 자료'),
                    f_title, INK_900, W - MARGIN * 2, 1.2)

    y = 290
    f_body = font(F_BODY, 26)
    f_url = font(F_BODY_BOLD, 22)
    for src in slide.get('items', [])[:6]:
        # 점 + 제목
        d.ellipse((MARGIN, y + 8, MARGIN + 12, y + 20), fill=SIGNAL)
        y_after = draw_text_block(d, MARGIN + 30, y, src['title'],
                                  f_body, INK_900, W - MARGIN * 2 - 30, 1.45)
        if src.get('source'):
            d.text((MARGIN + 30, y_after + 5), src['source'],
                   fill=INK_500, font=f_url)
            y_after += 35
        y = y_after + 25

    draw_footer(d)
    return img


def render_cta(slide, page, total):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_header(d, page, total, slide.get('kicker', 'MORE'))

    has_text = bool(slide.get('headline') or slide.get('body'))
    url = slide.get('url', 'saintremy.kr')

    if has_text:
        f_big = font(F_TITLE, 56)
        y = 280
        if slide.get('headline'):
            y = draw_text_block(d, MARGIN, y, slide['headline'], f_big, INK_900, W - MARGIN * 2, 1.3)
            y += 50
        if slide.get('body'):
            f_body = font(F_BODY, 28)
            y = draw_text_block(d, MARGIN, y, slide['body'], f_body, INK_700, W - MARGIN * 2, 1.55)
            y += 50
        box_h = 100
        box_y = y
        d.rectangle((MARGIN, box_y, W - MARGIN, box_y + box_h), outline=SIGNAL, width=3)
        f_url = font(F_BODY_BOLD, 30)
        uw, uh = text_size(d, url, f_url)
        d.text(((W - uw) // 2, box_y + (box_h - uh) // 2 - 4), url, fill=SIGNAL, font=f_url)
    else:
        # 미니멀: saintremy.kr 박스 가운데
        box_h = 150
        box_y = (H - box_h) // 2 - 30
        d.rectangle((MARGIN, box_y, W - MARGIN, box_y + box_h), outline=SIGNAL, width=4)
        f_url = font(F_TITLE, 72)
        uw, uh = text_size(d, url, f_url)
        d.text(((W - uw) // 2, box_y + (box_h - uh) // 2 - 12), url, fill=SIGNAL, font=f_url)

        sub = slide.get('subline', '프로필 링크')
        f_sub = font(F_BODY_BOLD, 22)
        sw, _ = text_size(d, sub, f_sub)
        d.text(((W - sw) // 2, box_y + box_h + 36), sub, fill=INK_500, font=f_sub)

    draw_footer(d)
    return img


def crop_cover(im, target_w, target_h):
    """object-fit:cover 크롭 + 리사이즈."""
    sw, sh = im.size
    src_ratio = sw / sh
    tgt_ratio = target_w / target_h
    if src_ratio > tgt_ratio:
        new_w = int(sh * tgt_ratio)
        left = (sw - new_w) // 2
        im = im.crop((left, 0, left + new_w, sh))
    else:
        new_h = int(sw / tgt_ratio)
        # 인물·제품은 상단 1/3 지점 위주 크롭이 자연
        top = max(0, (sh - new_h) // 3)
        im = im.crop((0, top, sw, top + new_h))
    return im.resize((target_w, target_h), Image.LANCZOS)


def make_gradient_rgba(width, height, top_alpha=0, bottom_alpha=220, gamma=1.6):
    grad = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for i in range(height):
        a = int(top_alpha + (bottom_alpha - top_alpha) * (i / max(1, height - 1)) ** gamma)
        gd.line([(0, i), (width, i)], fill=(0, 0, 0, a))
    return grad


def render_photo(slide, page, total):
    """풀컷 사진 + 하단 그래디언트 + 흰 캡션."""
    img = Image.new('RGB', (W, H), BG)
    photo_path = slide.get('photo')
    if photo_path and os.path.exists(photo_path):
        photo = Image.open(photo_path).convert('RGB')
        photo = crop_cover(photo, W, H)
        img.paste(photo, (0, 0))

    base = img.convert('RGBA')
    grad_h = 460
    grad = make_gradient_rgba(W, grad_h, 0, 230, gamma=1.7)
    base.paste(grad, (0, H - grad_h), grad)
    img = base.convert('RGB')

    d = ImageDraw.Draw(img)

    # 상단 KICKER (왼쪽, signal 박스) + 페이지 (오른쪽, 흰 텍스트)
    f_kick = font(F_BODY_BOLD, 22)
    if slide.get('kicker'):
        kicker = slide['kicker'].upper()
        kw, _ = text_size(d, kicker, f_kick)
        d.rectangle((MARGIN, MARGIN - 8, MARGIN + kw + 28, MARGIN + 30), fill=SIGNAL)
        d.text((MARGIN + 14, MARGIN), kicker, fill=(255, 255, 255), font=f_kick)
    page_str = f'{page:02d} / {total:02d}'
    pw, _ = text_size(d, page_str, f_kick)
    d.text((W - MARGIN - pw, MARGIN), page_str, fill=(255, 255, 255), font=f_kick)

    # 캡션 (하단, 흰색)
    if slide.get('caption'):
        f_cap = font(F_TITLE, 40)
        cap_lines = wrap(slide['caption'], f_cap, W - MARGIN * 2, d)
        _, lh = text_size(d, 'Ag한', f_cap)
        actual_lh = int(lh * 1.32)
        # 하단에서 70px 위로 배치
        cap_y = H - MARGIN - 60 - len(cap_lines) * actual_lh
        for ln in cap_lines:
            d.text((MARGIN, cap_y), ln, fill=(255, 255, 255), font=f_cap)
            cap_y += actual_lh

    # 출처 + 도메인 (하단)
    f_meta = font(F_BODY_BOLD, 18)
    d.text((MARGIN, H - MARGIN - 8), 'saintremy.kr', fill=(255, 255, 255), font=f_meta)
    if slide.get('credit'):
        cw, _ = text_size(d, slide['credit'], f_meta)
        d.text((W - MARGIN - cw, H - MARGIN - 8), slide['credit'], fill=(255, 255, 255), font=f_meta)

    return img


def render_info_with_photo(slide, page, total):
    """위 사진 540px + 아래 cream 텍스트 540px 분할."""
    img = Image.new('RGB', (W, H), BG)
    photo_path = slide.get('photo')
    photo_h = 540
    if photo_path and os.path.exists(photo_path):
        photo = Image.open(photo_path).convert('RGB')
        photo = crop_cover(photo, W, photo_h)
        img.paste(photo, (0, 0))

    d = ImageDraw.Draw(img)

    # KICKER 박스 (좌상)
    f_kick = font(F_BODY_BOLD, 22)
    if slide.get('kicker'):
        kicker = slide['kicker'].upper()
        kw, _ = text_size(d, kicker, f_kick)
        d.rectangle((MARGIN, MARGIN - 8, MARGIN + kw + 28, MARGIN + 30), fill=SIGNAL)
        d.text((MARGIN + 14, MARGIN), kicker, fill=(255, 255, 255), font=f_kick)
    # 페이지 (우상, 흰 텍스트)
    page_str = f'{page:02d} / {total:02d}'
    pw, _ = text_size(d, page_str, f_kick)
    d.text((W - MARGIN - pw, MARGIN), page_str, fill=(255, 255, 255), font=f_kick)

    # 사진 출처 (사진 우하단)
    if slide.get('credit'):
        f_cr = font(F_BODY, 16)
        cw, ch = text_size(d, slide['credit'], f_cr)
        # 어두운 반투명 박스 위 흰 글자
        base = img.convert('RGBA')
        cred_box = Image.new('RGBA', (cw + 16, ch + 14), (0, 0, 0, 140))
        base.paste(cred_box, (W - MARGIN - cw - 16, photo_h - ch - 22), cred_box)
        img = base.convert('RGB')
        d = ImageDraw.Draw(img)
        d.text((W - MARGIN - cw - 8, photo_h - ch - 16), slide['credit'], fill=(255, 255, 255), font=f_cr)

    # 아래 텍스트 영역
    y = photo_h + 50
    if slide.get('label'):
        f_lbl = font(F_BODY_BOLD, 22)
        d.text((MARGIN, y), slide['label'].upper(), fill=SIGNAL, font=f_lbl)
        y += 38
    f_title = font(F_TITLE, 42)
    y = draw_text_block(d, MARGIN, y, slide['title'], f_title, INK_900, W - MARGIN * 2, 1.22)
    y += 20
    if slide.get('body'):
        f_body = font(F_BODY, 24)
        y = draw_text_block(d, MARGIN, y, slide['body'], f_body, INK_700,
                            W - MARGIN * 2, 1.5, max_lines=6)

    # 푸터
    f_dom = font(F_BODY_BOLD, 18)
    d.text((MARGIN, H - MARGIN - 10), 'saintremy.kr', fill=INK_700, font=f_dom)
    handle = '@saintremy.kr'
    hw, _ = text_size(d, handle, f_dom)
    d.text((W - MARGIN - hw, H - MARGIN - 10), handle, fill=INK_500, font=f_dom)
    return img


RENDERERS = {
    'hook': render_hook,
    'info': render_info,
    'table': render_table,
    'insight': render_insight,
    'sources': render_sources,
    'cta': render_cta,
    'photo': render_photo,
    'info_with_photo': render_info_with_photo,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--config', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    with open(args.config, 'r', encoding='utf-8') as f:
        config = json.load(f)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    slides = config['slides']
    total = len(slides)  # hook이 01부터 시작 (HERO 분리 X)

    for i, sl in enumerate(slides):
        page = i + 1
        kind = sl.get('type')
        renderer = RENDERERS.get(kind)
        if not renderer:
            print(f'⚠️ unknown type: {kind}')
            continue
        img = renderer(sl, page, total)
        path = out_dir / f'{page:02d}-{kind}.jpg'
        img.save(path, 'JPEG', quality=92, optimize=True)
        print(f'✓ {path.name}')

    print(f'\n슬라이드 {len(slides)}장 생성 → {out_dir}')


if __name__ == '__main__':
    main()
