# Saint-Rémy Pages Functions

Cloudflare Pages의 `functions/` 폴더는 자동으로 Pages Functions로 배포됩니다.
이 폴더에 있는 모든 `.ts` 파일은 각각 엔드포인트가 됩니다.

## 엔드포인트

| 경로 | 역할 |
|---|---|
| `GET /go/:slug/:partner?pid=xxx` | 어필리에이트 클릭 기록 + 302 리다이렉트 |
| `POST /api/events` | 클라이언트 tracker가 보내는 pageview/dwell 이벤트 |
| `OPTIONS /api/events` | CORS preflight |

## 바인딩

- `DB` — D1 database `saintremy-analytics`
- `IP_SALT` — IP 해싱용 salt (vars)

## 로컬 테스트

```bash
npm run build              # dist 생성 (Notion fetch 포함)
wrangler pages dev dist    # 로컬 Pages 서버 (Functions 자동 로드)
```

## 주의

- `_utils.ts`처럼 **`_` 로 시작하는 파일은 라우트가 아닌 공용 모듈**로 취급.
- D1 바인딩은 `wrangler.toml` 또는 Cloudflare 대시보드의 Pages > Settings > Functions > D1 bindings 에서 설정.
