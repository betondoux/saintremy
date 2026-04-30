// /admin/* catch-all (Cloudflare Pages Function)
//
// _redirects 의 `/admin/*` 룰이 catch-all `/* /index.html` 에 가려지는
// 이슈를 우회. /admin/* 모든 경로를 admin SPA 쉘로 리라이트.
//
// 정적 자산(/admin/assets/*, /admin/*.css, /admin/*.js, /admin/*.svg 등)은
// next() 로 통과시켜 정적 핸들러가 직접 서빙하게 함.

interface PagesEnv {
  ASSETS: { fetch: (request: Request | string | URL) => Promise<Response> }
}

const STATIC_PATTERN = /\.(?:js|css|svg|png|jpg|jpeg|webp|ico|map|json|woff2?|ttf)$/

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const url = new URL(context.request.url)

  // 1. 정적 자산은 그대로 통과 (/admin/assets/*.js, *.css, ...)
  if (url.pathname.startsWith('/admin/assets/') || STATIC_PATTERN.test(url.pathname)) {
    return context.next()
  }

  // 2. 그 외 모든 /admin/* → admin SPA 쉘 서빙
  const shellUrl = new URL('/admin/index.html', context.request.url)
  const response = await context.env.ASSETS.fetch(shellUrl)
  // 클라이언트 라우터가 URL을 그대로 보도록 200 + 동일 본문
  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
