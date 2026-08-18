#!/usr/bin/env python3.12
"""Saint-Rémy 소재 레이더 — 검증된 RSS 피드만 모아둔 레지스트리.

웹검색 할당량과 무관하게 돈다(URL 직접 요청이라). 2026-08-18 전수 테스트 통과분.

  python3.12 feeds.py            # 한국 관련만 (기본)
  python3.12 feeds.py --all      # 전체
  python3.12 feeds.py --group 해외매거진
"""
import argparse, html, json, re, sys, urllib.request
import xml.etree.ElementTree as ET

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}
ATOM = "{http://www.w3.org/2005/Atom}"

# 죽은 피드는 넣지 않는다. 아래는 전부 응답 확인된 것.
# (404 확인분: JoongAng Daily, Hankyoreh EN, 미주중앙일보, Vogue Business, W, Air Mail, Nikkei Asia)
FEEDS = {
    "한국영문": {
        "KoreaHerald":  "https://www.koreaherald.com/rss/newsAll",
        "KoreaTimes":   "https://www.koreatimes.co.kr/www/rss/nation.xml",
        "Yonhap EN":    "https://en.yna.co.kr/RSS/news.xml",
        "KED Global":   "https://www.kedglobal.com/rss/news.xml",
        "ChosunBiz":    "https://biz.chosun.com/arc/outboundfeeds/rss/?outputType=xml",
        "Chosun":       "https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml",
    },
    "한국보는외국": {
        "Rest of World": "https://restofworld.org/feed/latest/",
        "The Diplomat":  "https://thediplomat.com/feed/",
        "SCMP Asia":     "https://www.scmp.com/rss/4/feed",
        "Sixth Tone":    "https://www.sixthtone.com/rss",
        "Korea Pro":     "https://koreapro.org/feed/",
    },
    "디자인건축": {
        "Dezeen":       "https://www.dezeen.com/feed/",
        "Dezeen Korea": "https://www.dezeen.com/tag/south-korea/feed/",
        "Designboom":   "https://www.designboom.com/feed/",
        "ArchDaily":    "https://www.archdaily.com/rss/",
        "Colossal":     "https://www.thisiscolossal.com/feed/",
        "Wallpaper":    "https://www.wallpaper.com/feeds/all",
        "Monocle":      "https://monocle.com/rss/",
    },
    "해외매거진": {
        "NYT Magazine":  "https://rss.nytimes.com/services/xml/rss/nyt/Magazine.xml",
        "NYT Style":     "https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
        "NYT Business":  "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "NYT Health":    "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
        "NYT Food":      "https://rss.nytimes.com/services/xml/rss/nyt/DiningandWine.xml",
        "NYT T Mag":     "https://rss.nytimes.com/services/xml/rss/nyt/tmagazine.xml",
        "New Yorker":    "https://www.newyorker.com/feed/everything/rss",
        "Atlantic":      "https://www.theatlantic.com/feed/all/",
        "Economist":     "https://www.economist.com/latest/rss.xml",
        "WSJ Life":      "https://feeds.content.dowjones.io/public/rss/RSSLifestyle",
        "FT Life&Arts":  "https://www.ft.com/life-arts?format=rss",
        "Guardian Life": "https://www.theguardian.com/lifeandstyle/rss",
        # 패션지는 연예·제품이 8할이라 아래 둘만 쓸 만하다
        "Business of Fashion": "https://www.businessoffashion.com/feed/",
        "Robb Report":   "https://robbreport.com/feed/",
        "GQ":            "https://www.gq.com/feed/rss",
        "Bon Appetit":   "https://www.bonappetit.com/feed/rss",
        "Eater":         "https://www.eater.com/rss/index.xml",
        "Atlas Obscura": "https://www.atlasobscura.com/feeds/latest",
    },
}

KR = re.compile(r"korea|seoul|busan|jeju|k-pop|kpop|hangul|samsung|hyundai|kimchi|한국|서울", re.I)
# 정치·군사·북핵은 Saint-Rémy 소재가 아니다
SKIP = re.compile(r"missile|nuclear|troops|Kim Jong|defector|Pyongyang|sanction|"
                  r"military exercise|파병|北", re.I)


def clean(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def pull(url, limit=40):
    raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read().lstrip()
    if b"<?xml" in raw[:200]:
        raw = raw[raw.find(b"<?xml"):]
    root = ET.fromstring(raw)
    items = root.findall(".//item") or root.findall(f".//{ATOM}entry")
    out = []
    for it in items[:limit]:
        t = it.find("title") if it.find("title") is not None else it.find(f"{ATOM}title")
        d = it.find("description") if it.find("description") is not None else it.find(f"{ATOM}summary")
        li = it.find("link")
        link = (li.text if li is not None and li.text else (li.get("href") if li is not None else "")) or ""
        out.append((clean(t.text) if t is not None else "",
                    clean(d.text)[:170] if d is not None and d.text else "", link))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="한국 필터 없이 전부")
    ap.add_argument("--group", help=f"그룹 하나만: {', '.join(FEEDS)}")
    a = ap.parse_args()

    groups = {a.group: FEEDS[a.group]} if a.group else FEEDS
    for gname, feeds in groups.items():
        print(f"\n{'='*76}\n■ {gname}\n{'='*76}")
        for name, url in feeds.items():
            try:
                rows = pull(url)
            except Exception as e:
                print(f"  [죽음] {name}: {type(e).__name__}")
                continue
            hits = [r for r in rows
                    if not SKIP.search(r[0] + r[1]) and (a.all or KR.search(r[0] + r[1]))]
            if not hits:
                continue
            print(f"\n── {name} ({len(hits)}건)")
            for t, d, l in hits[:10]:
                print(f"· {t}")
                if d:
                    print(f"    {d[:130]}")
                if l:
                    print(f"    {l}")


if __name__ == "__main__":
    main()
