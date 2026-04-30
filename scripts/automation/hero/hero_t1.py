"""T1: Side-by-Side 2-Panel 시그니처 hero 합성기.

CLI 사용:
    python3 hero_t1.py \\
        --left  /path/to/product1.jpg \\
        --right /path/to/product2.jpg \\
        --category beauty \\
        --out    /path/to/hero.jpg

rembg(U²-Net)로 배경 제거 → 카테고리 시그니처 팔레트로 좌우 2분할 패널 합성.
"""

import argparse
import io
import os
import sys
from urllib.request import urlopen

from PIL import Image, ImageDraw

try:
    from rembg import remove, new_session
except ImportError:
    print('[error] rembg 미설치. `pip install rembg` 필요.', file=sys.stderr)
    sys.exit(2)

# 사이트 ArticlePage 컨테이너가 aspect-square (1:1) 이라 hero도 정사각으로 맞춤 — 모바일·데스크탑 모두 잘림 없음
W, H = 1200, 1200

# 카테고리 시그니처 팔레트 (panel_left, panel_right, bg_outer)
SIGNATURE_PALETTES = {
    'beauty':    ((244, 218, 130), (214, 184, 145), (88, 67, 38)),    # 옐로/sand/머스타드
    'deal':      ((232, 196, 160), (210, 168, 140), (90, 53, 32)),    # 스칼릿/브라운
    'gift':      ((232, 212, 160), (210, 184, 130), (74, 58, 31)),    # 골드/딥브라운
    'kitchen':   ((200, 212, 160), (172, 188, 138), (58, 74, 40)),    # 올리브
    'living':    ((212, 208, 196), (188, 180, 164), (58, 53, 48)),    # 웜그레이
    'move':      ((160, 180, 212), (130, 150, 188), (31, 58, 90)),    # 네이비
    'furniture': ((220, 200, 178), (190, 168, 142), (74, 53, 36)),    # 테라코타
    'travel':    ((200, 220, 220), (165, 195, 200), (40, 80, 88)),    # 시블루
    'space':     ((215, 205, 188), (188, 175, 155), (62, 50, 40)),    # 토프
    'style':     ((218, 210, 224), (192, 180, 210), (60, 48, 76)),    # 라벤더
    'music':     ((200, 200, 215), (170, 168, 198), (40, 40, 70)),    # 인디고
}

_REMBG_SESSION = None


def rembg_session():
    global _REMBG_SESSION
    if _REMBG_SESSION is None:
        _REMBG_SESSION = new_session('u2net')
    return _REMBG_SESSION


def fetch_image(src: str) -> Image.Image:
    """src가 URL이면 다운로드, 아니면 로컬 파일 open."""
    if src.startswith('http://') or src.startswith('https://'):
        with urlopen(src) as r:
            data = r.read()
        return Image.open(io.BytesIO(data)).convert('RGB')
    return Image.open(src).convert('RGB')


def cutout_with_rembg(im: Image.Image) -> Image.Image:
    """rembg로 배경 제거 → 알파 채널 RGBA 반환. bbox crop."""
    out = remove(im, session=rembg_session())
    if out.mode != 'RGBA':
        out = out.convert('RGBA')
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    return out


def fit_in_panel(panel_box, img, scale=0.85):
    px1, py1, px2, py2 = panel_box
    pw, ph = px2 - px1, py2 - py1
    target_h = int(ph * scale)
    ratio = target_h / img.size[1]
    new_w = int(img.size[0] * ratio)
    new_h = target_h
    if new_w > pw * 0.88:
        new_w = int(pw * 0.88)
        new_h = int(img.size[1] * (new_w / img.size[0]))
    img2 = img.resize((new_w, new_h), Image.LANCZOS)
    cx = px1 + (pw - new_w) // 2
    cy = py1 + (ph - new_h) // 2
    return img2, (cx, cy)


def compose_t1(left_src: str, right_src: str, category: str, out_path: str) -> str:
    # 흰 배경 + 두 제품 좌우 가운데. 패널 분할·컬러 매칭 없음.
    _ = category  # 시그니처 팔레트는 더 이상 사용 안 함 (사용자 피드백)
    canvas = Image.new('RGB', (W, H), (255, 255, 255))
    # 안쪽 마진 — 모바일 viewport에서도 양쪽 안 잘리도록 안전 영역 확보
    safe_margin_x = 80
    safe_margin_y = 100
    left_box = (safe_margin_x, safe_margin_y, W // 2, H - safe_margin_y)
    right_box = (W // 2, safe_margin_y, W - safe_margin_x, H - safe_margin_y)

    print(f'[hero_t1] cutout left  ({left_src[:80]})', file=sys.stderr)
    left_img = cutout_with_rembg(fetch_image(left_src))
    print(f'[hero_t1] cutout right ({right_src[:80]})', file=sys.stderr)
    right_img = cutout_with_rembg(fetch_image(right_src))

    li, lpos = fit_in_panel(left_box, left_img, scale=0.82)
    ri, rpos = fit_in_panel(right_box, right_img, scale=0.82)
    canvas.paste(li, lpos, li)
    canvas.paste(ri, rpos, ri)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path, 'JPEG', quality=88, optimize=True)
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--left',  required=True, help='좌측 제품 이미지 (URL 또는 path)')
    ap.add_argument('--right', required=True, help='우측 제품 이미지 (URL 또는 path)')
    ap.add_argument('--category', default='beauty', choices=list(SIGNATURE_PALETTES.keys()))
    ap.add_argument('--out', required=True, help='출력 hero.jpg path')
    args = ap.parse_args()
    out = compose_t1(args.left, args.right, args.category, args.out)
    print(out)


if __name__ == '__main__':
    main()
