/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Saint-Rémy — Editorial Classic (The Strategist inspired)
        cream: {
          50: '#FAF7F0',
          100: '#F5F0E8',
          200: '#EDE6D9',
          300: '#E0D6C2',
        },
        ink: {
          // 메인 사이트 (cream 톤) 기존 팔레트
          900: '#0A0A0B',
          700: '#2A2724',
          500: '#4A4642',
          400: '#6B6560',
          // /admin 다크 대시보드용 추가 음영 (Studio 통합 — 메인 사이트는 사용 안 함)
          800: '#111111',
          600: '#262626',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#f5f5f5',
        },
        signal: {
          DEFAULT: '#C4361C',
          dark: '#9B2A13',
        },
        warming: {
          DEFAULT: '#E8C547',
          dark: '#C9A834',
        },
        stone: '#8A8580',
        // /admin 대시보드 전용 — Studio 골드 액센트 + 신호 색
        accent: {
          DEFAULT: '#D4A574',
          500: '#D4A574',
          600: '#B88A5C',
        },
        ok: '#22c55e',
        warn: '#f59e0b',
        err: '#ef4444',
      },
      fontFamily: {
        // Display (headlines): Playfair Display for English, Noto Serif KR for Korean
        //   — 영문은 이탤릭 세리프, 한글은 명조 (에디토리얼 권위)
        display: [
          '"Playfair Display"',
          '"Noto Serif KR"',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        serif: [
          '"Playfair Display"',
          '"Noto Serif KR"',
          'Georgia',
          'serif',
        ],
        // Sans (body): Inter for English, Spoqa Han Sans Neo for Korean
        //   — 깔끔한 고딕 조합으로 긴 본문 가독성
        sans: [
          '"Inter"',
          '"Spoqa Han Sans Neo"',
          '"Noto Sans KR"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // Mono (meta labels): JetBrains Mono
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        // Korean-only serif (한글 전용 명조, 영문 섞일 때 쓰지 말 것)
        'ko-serif': ['"Noto Serif KR"', 'serif'],
        // Korean-only sans (한글 전용 고딕)
        'ko-sans': ['"Spoqa Han Sans Neo"', '"Noto Sans KR"', 'sans-serif'],
      },
      letterSpacing: {
        brutal: '-0.02em',
        editorial: '-0.01em',
        wide: '0.08em',
      },
    },
  },
  plugins: [],
}
