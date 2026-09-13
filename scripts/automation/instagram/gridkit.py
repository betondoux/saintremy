"""카드뉴스(4:5)와 릴스커버(9:16)의 글자를 프로필 그리드에서 픽셀 단위로 일치시킨다.

★인스타 프로필 그리드 타일 = 3:4 (1080×1440). 포맷이 뭐든 전부 이 타일로 잘려서 나란히 놓인다.

    카드뉴스 4:5  1080×1350 → 좌우 각 34px 잘림.  보이는 창 1012×1350
    릴스커버 9:16 1080×1920 → 상하 각 240px 잘림. 보이는 창 1080×1440

보이는 창이 1012 와 1080 으로 다르다. 같은 타일에 들어가려고 서로 다른 배율로 줄어들기
때문에, 그리드에서 같은 크기로 보이게 하려면 **릴스 폰트를 카드보다 1080/1012 = 6.7% 키워야**
한다. 그래서 설계는 전부 '타일 기준 비율'(SPEC)로 하고, 포맷별 픽셀은 여기서 환산한다.

★릴스 좌여백은 이중 제약이다. 그리드 정렬값이 폰 플레이어 좌우 잘림 118px 보다 커야 한다.
  SPEC["MARGIN_X"] >= 0.109 를 지키면 릴스 121px · 카드 147px 로 둘 다 산다.

★키커는 브랜드명만 쓴다. '인물다큐' 같은 카테고리 라벨을 붙이지 않는다 (2026-09-14 확정).

사용:
    python3 gridkit.py --photo hero.jpg --l1 "몬주익 언덕이" --l2 "아니었다" --out-dir ./out
    python3 gridkit.py --photo-card a.jpg --photo-reel b.jpg --l1 "..." --l2 "..." --out-dir ./out

--out-dir 에 card.jpg · reel.jpg 와, 그리드에서 어떻게 보이는지 확인하는
tile_card.jpg · tile_reel.jpg · grid_proof.jpg 가 같이 떨어진다.
"""
import argparse
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

FONT = "/Users/kimsucheol/Library/Fonts/Pretendard-%s.otf"

# 캔버스w, 캔버스h, 보이는 창 원점x, 원점y, 창w, 창h
WIN = {
    "card": (1080, 1350, 34, 0, 1012, 1350),
    "reel": (1080, 1920, 0, 240, 1080, 1440),
}

# 타일 기준 설계값 — x·글자크기는 타일 폭 대비, y는 타일 높이 대비
SPEC = {
    "MARGIN_X": 0.112,      # 0.109 아래로 내리지 마라 (릴스 폰 잘림 118px)
    "KICKER_SIZE": 0.034,
    "KICKER_TOP": 0.640,
    "HEAD_SIZE": 0.058,
    "HEAD_TOP": 0.694,
    "LINE_GAP": 0.052,
    "GRAD_TOP": 0.50,       # 흰 글자 가독용 하단 그라디언트 시작점
    "GRAD_ALPHA": 210,
    "GRAD_EXP": 1.5,
}


def metrics(kind):
    """포맷별 실제 픽셀값. 카드와 릴스의 숫자가 다른 게 정상이다."""
    _, _, ox, oy, tw, th = WIN[kind]
    s = SPEC
    return {
        "margin_x": round(ox + s["MARGIN_X"] * tw),
        "kicker_size": round(s["KICKER_SIZE"] * tw),
        "kicker_y": round(oy + s["KICKER_TOP"] * th),
        "head_size": round(s["HEAD_SIZE"] * tw),
        "head_y": round(oy + s["HEAD_TOP"] * th),
        "line_gap": round(s["LINE_GAP"] * th),
    }


def _cover(photo, W, H):
    im = Image.open(photo).convert("RGB")
    k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    left, top = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((left, top, left + W, top + H))


def build(kind, photo, kicker, lines, out, contrast=1.08):
    W, H, ox, oy, tw, th = WIN[kind]
    m = metrics(kind)
    im = ImageEnhance.Contrast(_cover(photo, W, H)).enhance(contrast)

    gy = round(oy + SPEC["GRAD_TOP"] * th)
    gh = H - gy
    ramp = (np.linspace(0, 1, gh) ** SPEC["GRAD_EXP"] * SPEC["GRAD_ALPHA"]).astype(np.uint8)
    im.paste(Image.new("RGB", (W, gh), (0, 0, 0)), (0, gy),
             Image.fromarray(np.repeat(ramp[:, None], W, axis=1), mode="L"))

    d = ImageDraw.Draw(im)
    fk = ImageFont.truetype(FONT % "Regular", m["kicker_size"])
    fh = ImageFont.truetype(FONT % "SemiBold", m["head_size"])
    d.text((m["margin_x"], m["kicker_y"]), kicker, font=fk, fill=(255, 255, 255))
    for i, ln in enumerate(lines):
        d.text((m["margin_x"], m["head_y"] + i * m["line_gap"]), ln, font=fh, fill=(255, 255, 255))

    over = [ln for ln in lines if m["margin_x"] + d.textlength(ln, font=fh) > W - m["margin_x"]]
    im.save(out, quality=95, subsampling=0)
    return m, over


def tile(kind, src, out, size=(540, 720)):
    """그리드에서 실제로 보이는 3:4 창만 잘라낸다."""
    _, _, ox, oy, tw, th = WIN[kind]
    Image.open(src).crop((ox, oy, ox + tw, oy + th)).resize(size, Image.LANCZOS).save(out, quality=95)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--photo", help="두 포맷에 같은 사진을 쓸 때")
    p.add_argument("--photo-card")
    p.add_argument("--photo-reel")
    p.add_argument("--kicker", default="minor paradise")
    p.add_argument("--l1", required=True, help="헤드라인 1줄")
    p.add_argument("--l2", default="", help="헤드라인 2줄")
    p.add_argument("--out-dir", required=True)
    a = p.parse_args()

    pc = a.photo_card or a.photo
    pr = a.photo_reel or a.photo
    if not pc or not pr:
        p.error("--photo 또는 --photo-card/--photo-reel 이 필요하다")

    out = pathlib.Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    lines = [x for x in (a.l1, a.l2) if x]

    for kind, photo in (("card", pc), ("reel", pr)):
        m, over = build(kind, photo, a.kicker, lines, out / f"{kind}.jpg")
        tile(kind, out / f"{kind}.jpg", out / f"tile_{kind}.jpg")
        tag = "카드 4:5 " if kind == "card" else "릴스 9:16"
        print(f"{tag} 좌여백 {m['margin_x']:>3} · 키커 {m['kicker_size']} · "
              f"헤드 {m['head_size']} · 헤드y {m['head_y']}")
        for ln in over:
            print(f"  ⚠️  우여백 침범 — 문구를 줄여라: {ln}")

    a_, b_ = Image.open(out / "tile_card.jpg"), Image.open(out / "tile_reel.jpg")
    proof = Image.new("RGB", (a_.width * 3, a_.height))
    for i, t in enumerate((a_, b_, a_)):
        proof.paste(t, (i * a_.width, 0))
    proof.save(out / "grid_proof.jpg", quality=95)
    print(f"\n{out}/grid_proof.jpg — 왼쪽 카드 · 가운데 릴스. 키커와 헤드라인이 같은 높이면 정상.")


if __name__ == "__main__":
    main()
