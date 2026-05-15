// src/components/SEO.tsx
//
// 클라이언트 사이드 SPA 내비게이션 시 <title> / meta 태그를 동기화.
// 초기 색인용 정적 주입은 scripts/prerender-meta.ts 에서 담당.
// react-helmet-async 로 중복 태그 없이 교체.

import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Saint-Rémy'
const SITE_URL = 'https://saintremy.kr'
const DEFAULT_IMAGE = `${SITE_URL}/images/social/sunscreen-best-5-social.jpg`
const DEFAULT_DESCRIPTION =
  '매일 쏟아지는 제품의 홍수 속, 진짜 좋은 것만 큐레이션합니다. ' +
  '선물 · 할인 · 스타일 · 뷰티 · 공간 · 주방 · 운동 · 여행 · 가구 · 생활.'

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  path?: string
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  author?: string
  category?: string
}

function absoluteImage(image: string | undefined): string {
  if (!image) return DEFAULT_IMAGE
  if (/^https?:\/\//.test(image)) return image
  return `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  path,
  type = 'website',
  publishedAt,
  updatedAt,
  author = 'Saint-Rémy Editors',
  category,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | 평범한 사물을 깊이 보는 매거진`
  const url = path ? `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}` : SITE_URL
  const fullImage = absoluteImage(image)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ko_KR" />

      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && updatedAt && (
        <meta property="article:modified_time" content={updatedAt} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && category && (
        <meta property="article:section" content={category} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="naverbot" content="index, follow" />
      <meta name="yeti" content="index, follow" />

      {/* JSON-LD Article schema — LLM(ChatGPT·Perplexity·Claude·Gemini) 인용을 위한 GEO 시그널 */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            image: [fullImage],
            datePublished: publishedAt,
            dateModified: updatedAt || publishedAt,
            author: {
              '@type': 'Organization',
              name: author,
              url: SITE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/images/social/saintremy-logo.png`,
              },
            },
            description,
            url,
            articleSection: category,
            inLanguage: 'ko-KR',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': url,
            },
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
