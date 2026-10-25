"""Instagram Login 토큰(IGAA…) 60일 만료 방지 — .env 의 UB_IG_ACCESS_TOKEN 을 갱신해 덮어쓴다.

토큰이 24시간 이상 지났고 아직 살아 있을 때만 갱신된다(만료되면 대시보드에서 재발급).
launchd com.user.ig_token_refresh 가 주 1회 돌린다.
"""
import os
import re
import sys

import requests

ENV = os.path.expanduser("~/Desktop/saintremy/.env")
KEYS = ["UB_IG_ACCESS_TOKEN", "ARENA_IG_ACCESS_TOKEN"]


ENV2 = os.path.expanduser("~/.config/orumak/ig.env")  # launchd 는 ~/Desktop(iCloud) 못 읽음 → 사본도 같이 갱신(1026)


def main():
    try:
        s = open(ENV).read()
    except OSError:
        s = open(ENV2).read()
    for key in KEYS:
        m = re.search(rf"^{key}=(.+)$", s, re.M)
        if not m:
            continue
        r = requests.get("https://graph.instagram.com/refresh_access_token",
                         params={"grant_type": "ig_refresh_token", "access_token": m.group(1).strip()},
                         timeout=30)
        j = r.json()
        if "access_token" not in j:
            print(f"❌ {key} 갱신 실패: {j}", file=sys.stderr)
            continue
        s = s.replace(m.group(0), f"{key}={j['access_token']}")
        print(f"✅ {key} 갱신 · 남은 {j.get('expires_in', 0) // 86400}일")
    for p in (ENV, ENV2):
        try:
            if p == ENV2:
                keep = [l for l in s.splitlines() if l.split("=", 1)[0] in KEYS + ["ARENA_IG_USER_ID", "UB_IG_USER_ID"]]
                open(p, "w").write("\n".join(keep) + "\n"); os.chmod(p, 0o600)
            else:
                open(p, "w").write(s)
        except OSError as e:
            print(f"⚠️ {p} 쓰기 실패: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
