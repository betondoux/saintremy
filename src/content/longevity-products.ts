// 저속노화 상품 큐레이션 (2026-05-26~).
// 매거진 톤 — "별점·TOP 10" 금지. 각 상품 = 한 사람의 longevity 변수에 직결되는 도구.
// 어필리에이트 링크는 사용자가 직접 채워넣는 placeholder. 초기엔 무링크 표시만.

export type LongevityTrack = 'move' | 'eat' | 'sleep' | 'mind' | 'track' | 'skin'

export interface LongevityProduct {
  id: string
  track: LongevityTrack
  name: string                  // 상품 정식 이름
  brand: string                 // 브랜드/판매처
  priceLabel: string            // 가격대 (정확한 가격 X — "₩89,000" 또는 "₩30~50만대")
  oneLine: string               // 매거진 톤 한 줄 — 왜 저속노화에 좋은가
  rationale?: string            // 짧은 보강 설명 (1~2 문장)
  source?: string               // 의학 근거 (Peter Attia · PNAS 2004 식)
  imageUrl?: string             // 상품 이미지 (없으면 단색 박스)
  purchaseUrl?: string          // 어필리에이트/구매 링크 (없으면 #)
}

export const LONGEVITY_PRODUCTS: LongevityProduct[] = [
  // ─────────────── MOVE — 운동 ───────────────
  {
    id: 'kettlebell-16kg',
    track: 'move',
    name: '케틀벨 16kg',
    brand: 'PROIRON · 또는 유사 한국 브랜드',
    priceLabel: '₩45,000~70,000',
    oneLine: 'Farmer\'s Walk · Goblet Squat · Swing — 단 한 가지 도구로 5가지 운동.',
    rationale: '50세 이후 1순위 운동은 근력. 케틀벨 16kg 하나로 전신 복합 운동이 모두 가능하다. Peter Attia가 Outlive 7장에서 추천하는 가장 단순한 단일 도구.',
    source: 'Peter Attia · Outlive · 2023',
  },
  {
    id: 'grip-strengthener',
    track: 'move',
    name: 'Captains of Crush 그립퍼',
    brand: 'IronMind',
    priceLabel: '₩35,000',
    oneLine: '악력 — 50세 이후 독립적 사망률 예측 변수.',
    rationale: 'Lancet PURE 연구(14만 명) — 손의 힘이 약할수록 전체 사망률 상승. 매일 데드행 30초 + 그립퍼 3세트면 회복 시작.',
    source: 'Leong et al. · Lancet · 2015',
  },
  {
    id: 'jump-rope-rx',
    track: 'move',
    name: 'RX Smart Gear 점핑로프',
    brand: 'RX Smart Gear',
    priceLabel: '₩55,000~80,000',
    oneLine: '한 평짜리 Zone 2 카디오 — 비 오는 날의 답.',
    rationale: '집 안 1m 공간에서 15분이면 Zone 2 심박 도달. 무릎 충격은 러닝의 1/7. CrossFit 코치들이 가장 자주 쓰는 단순 도구.',
  },
  {
    id: 'foam-roller-trigger',
    track: 'move',
    name: 'TriggerPoint GRID 폼롤러',
    brand: 'TriggerPoint',
    priceLabel: '₩65,000',
    oneLine: '회복 — 운동만큼 중요한 변수.',
    rationale: '근육 회복이 안 되면 다음 운동의 강도가 떨어진다. 매일 잠 전 10분 폼롤러가 NSAID(소염제) 의존도를 낮춘다.',
  },
  {
    id: 'garmin-forerunner-165',
    track: 'move',
    name: 'Garmin Forerunner 165',
    brand: 'Garmin',
    priceLabel: '₩340,000',
    oneLine: 'Zone 2 심박 측정 — 옆 사람과 노래 가능성 대신 숫자로.',
    rationale: 'Zone 2 강도(최대 심박의 60~70%)를 정확히 측정. Apple Watch보다 GPS 정확도가 높고 배터리 11일. Peter Attia 본인이 쓰는 모델.',
  },

  // ─────────────── EAT — 식단 ───────────────
  {
    id: 'greek-yogurt-emil',
    track: 'eat',
    name: '매일 그릭요거트 플레인 400g',
    brand: '매일유업',
    priceLabel: '₩4,900',
    oneLine: '한 컵에 단백질 18g — 한국 마트에서 가장 빠른 30g.',
    rationale: '체중 1kg당 1.6g 단백질 룰의 한국식 입구. 무가당이라 혈당 부담 없음. 아침 한 컵 + 견과 + 계란 1개 = 30g 도달.',
    source: 'Attia · Outlive · 7장',
  },
  {
    id: 'myprotein-impact-whey',
    track: 'eat',
    name: 'Impact Whey Protein 1kg',
    brand: 'Myprotein',
    priceLabel: '₩39,000~55,000',
    oneLine: '한 스쿱에 단백질 21g — 가성비 1위.',
    rationale: '60세 이후 근육 손실 막는 가장 단순한 카드. 운동 후 30분 안에 한 스쿱 + 우유 200ml. 한국에서 가장 자주 팔리는 단백질 브랜드.',
  },
  {
    id: 'olive-oil-evoo-evoo',
    track: 'eat',
    name: 'Olio Verde EVOO 500ml',
    brand: 'Olio Verde (시칠리아)',
    priceLabel: '₩42,000',
    oneLine: 'Sardinia 100세 마을이 매일 한 숟가락 — 단일 식물성 지방의 정점.',
    rationale: '엑스트라 버진 올리브유의 폴리페놀이 텔로미어 보호와 연관 (PREDIMED RCT, NEJM 2018). 발연점 낮으니 *조리 후 뿌리는 용도*로.',
    source: 'PREDIMED · NEJM · 2018',
  },
  {
    id: 'natto-takano',
    track: 'eat',
    name: '낫토 3팩 (소포장)',
    brand: 'Takano Foods · 풀무원',
    priceLabel: '₩4,000~6,000 / 3팩',
    oneLine: 'Okinawa 600년의 단백질 + 비타민 K2.',
    rationale: '한 팩에 단백질 8g + 발효 비타민 K2 (혈관·뼈 건강). 청국장 한국 버전이라 보면 됨. 아침 한 팩이면 발효식품 + 단백질 두 마리.',
  },
  {
    id: 'mixed-nuts-trader-joes',
    track: 'eat',
    name: '믹스넛 호두·아몬드·캐슈 1kg',
    brand: '서울장수 · 한국 견과 브랜드',
    priceLabel: '₩18,000~25,000',
    oneLine: 'Blue Zones 5개 마을이 매일 한 줌.',
    rationale: 'PREDIMED RCT — 견과 매일 30g(한 줌) 섭취군의 심혈관 사건 28% 감소. 가공 안 된 짠맛 0 무첨가가 핵심.',
    source: 'Estruch et al. · NEJM · 2013',
  },

  // ─────────────── SLEEP — 수면 ───────────────
  {
    id: 'muji-buckwheat-pillow',
    track: 'sleep',
    name: '메밀 베개',
    brand: 'MUJI · 또는 한국 메밀 베개',
    priceLabel: '₩35,000~60,000',
    oneLine: '목 정렬 — N3 깊은 잠의 출발점.',
    rationale: '높이·강도 조절 가능. 목 정렬이 어긋나면 코골이·무호흡으로 N3 깊은 잠을 깨운다. 매트리스보다 베개가 잠의 질 변수.',
  },
  {
    id: 'blue-light-glasses-felixgray',
    track: 'sleep',
    name: 'Blue Light Blocking 안경',
    brand: 'Felix Gray · 또는 한국 글래스올',
    priceLabel: '₩45,000~120,000',
    oneLine: '저녁 8시 이후 — 멜라토닌의 한 시간.',
    rationale: 'Harvard Health 2018 — 저녁 블루라이트 노출이 멜라토닌 분비를 90분 지연. 잠 1시간 전부터 착용으로 N3 회복.',
    source: 'Harvard Health · 2018',
  },
  {
    id: 'blackout-curtain-ikea',
    track: 'sleep',
    name: '암막 커튼 (블라이초셀)',
    brand: 'IKEA · 또는 한샘',
    priceLabel: '₩50,000~120,000',
    oneLine: '침실 조도 0 lux — 멜라토닌의 단단한 환경.',
    rationale: '도시의 가로등·아침 햇빛이 잠 질을 직접 깎는다. 100% 차광이 N3 수면 시간을 평균 22분 늘림 (Sleep 2020).',
  },
  {
    id: 'xiaomi-thermo-hygrometer',
    track: 'sleep',
    name: '샤오미 온습도계 (Mijia)',
    brand: 'Xiaomi',
    priceLabel: '₩15,000~25,000',
    oneLine: '침실 18~19°C / 습도 50~60% — Stanford의 단단한 숫자.',
    rationale: 'Matthew Walker(UC Berkeley 수면학자)가 *Why We Sleep* 에서 가장 강조하는 변수. 측정 안 하면 시작 안 된다.',
    source: 'Walker · Why We Sleep · 2017',
  },
  {
    id: 'white-noise-marpac',
    track: 'sleep',
    name: 'Yogasleep Dohm 백색소음기',
    brand: 'Yogasleep (옛 Marpac)',
    priceLabel: '₩95,000',
    oneLine: '도시 소음 마스킹 — 잠 중간에 깨지 않는 단순 도구.',
    rationale: '에어컨 모터 소리. 50년째 변하지 않은 디자인. NYT Wirecutter 10년 연속 1위.',
  },

  // ─────────────── MIND — 정신 ───────────────
  {
    id: 'calm-1year',
    track: 'mind',
    name: 'Calm 명상 앱 1년 구독',
    brand: 'Calm',
    priceLabel: '₩89,000 / 년',
    oneLine: '하루 10분 — 텔로미어 복원 효소 30% 상승 (PNAS 2011).',
    rationale: '명상 앱 5개 비교 (Calm/Headspace/Insight Timer/Sam Harris/10%) 중 한국어 콘텐츠 + 수면 스토리 강점.',
    source: 'Jacobs et al. · Psychoneuroendocrinology · 2011',
  },
  {
    id: 'waking-up-sam-harris',
    track: 'mind',
    name: 'Waking Up 명상 앱',
    brand: 'Sam Harris',
    priceLabel: '$99 / 년',
    oneLine: '신경과학자 + 철학자의 명상 — Sam Harris 본인이 진행.',
    rationale: '종교 없는 명상의 정점. 한국어 X. 영어 OK이고 더 깊은 longform 강의 원하면 1순위.',
  },
  {
    id: 'sony-wh-1000xm5',
    track: 'mind',
    name: 'Sony WH-1000XM5 노이즈캔슬링',
    brand: 'Sony',
    priceLabel: '₩400,000',
    oneLine: '도시의 외부 자극을 끄는 단순 도구.',
    rationale: '코르티솔 측정 연구 — 도시 소음(차·말소리)이 만성적으로 코르티솔을 올린다. 통근 길의 한 시간이 텔로미어를 깎는 자리.',
  },
  {
    id: 'hobonichi-techo',
    track: 'mind',
    name: 'Hobonichi Techo A6 다이어리',
    brand: 'Hobonichi (일본)',
    priceLabel: '₩45,000~55,000',
    oneLine: '하루 5분 일기 — 코르티솔의 단순 의학.',
    rationale: 'JAMA 2018 — 표현적 글쓰기 8주 후 우울 점수 30% 감소. Tomoe River 종이 (얇은데 안 비침).',
    source: 'Smyth et al. · JAMA · 1999',
  },
  {
    id: 'muji-aroma-diffuser',
    track: 'mind',
    name: '아로마 디퓨저 — Lavender',
    brand: 'MUJI',
    priceLabel: '₩45,000 + 오일 ₩15,000',
    oneLine: '잠 1시간 전 라벤더 — Cortisol 진정의 한 시간.',
    rationale: 'Lillehei et al. 2014 RCT — 라벤더 inhalation이 수면 질(PSQI) 점수 평균 22% 개선.',
  },

  // ─────────────── TRACK — 측정 ───────────────
  {
    id: 'whoop-40',
    track: 'track',
    name: "샤오미 스마트밴드10",
    brand: "Xiaomi · Mi Band 10",
    priceLabel: "₩59,500",
    oneLine: 'HRV · Recovery · Strain — 매일 신체 상태를 점수화.',
    rationale: '저속노화 매거진의 *킬러 디바이스*. Bryan Johnson · Peter Attia가 모두 착용. HRV(심박 변이도) 추적이 가장 정밀.',
    purchaseUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7233291&pageKey=8976377333&itemId=26276994465&vendorItemId=92786901920&traceid=V0-153-aa36a10649bf3243&requestid=20260527084337299036729569&token=31850C%7CGM",
    imageUrl: "/images/shop/whoop-40.jpg",
  },
  {
    id: 'oura-ring-gen3',
    track: 'track',
    name: 'Oura Ring Gen 3',
    brand: 'Oura',
    priceLabel: '₩450,000 + $5.99 / 월',
    oneLine: '잠 측정의 정점 — 4단계 수면 정확도가 임상 PSG에 가장 가깝다.',
    rationale: 'JAMA Network Open 2020 — Oura의 N3 수면 측정이 임상 PSG와 0.94 상관관계. 손가락 반지라 잠잘 때 거슬리지 않음.',
    source: 'Roomkham et al. · JAMA Netw Open · 2020',
  },
  {
    id: 'apple-watch-10',
    track: 'track',
    name: 'Apple Watch Series 10',
    brand: 'Apple',
    priceLabel: '₩600,000',
    oneLine: '심전도 · 심박 · VO2max 추정 — 매일의 longevity 데이터.',
    rationale: 'ECG로 심방세동 조기 발견. iPhone 사용자라면 데이터 통합 가장 단순. Whoop·Oura와 비교 시 *측정 정확도는 낮지만 매일 데이터 접근성 1위*.',
  },
  {
    id: 'withings-body-plus',
    track: 'track',
    name: 'Withings Body+ 체중·체성분계',
    brand: 'Withings',
    priceLabel: '₩140,000',
    oneLine: '체중 + 근육량 + 체지방률 — 단백질 룰의 측정 도구.',
    rationale: '근육량을 매주 추적해야 단백질 1.6g/kg 룰이 작동 중인지 알 수 있다. 매일 같은 시간(아침 화장실 후) 측정 룰.',
  },
  {
    id: 'omron-hem-7156',
    track: 'track',
    name: 'Omron HEM-7156 혈압계',
    brand: 'Omron',
    priceLabel: '₩90,000',
    oneLine: '50세 이후 1순위 단일 측정 — 5분짜리 생명 데이터.',
    rationale: '고혈압 환자의 50%가 자기 혈압을 모른다 (KDCA 2022). 매주 한 번 아침에 측정 → 평균값을 의사에게.',
  },
  // ─────────────── SKIN — 피부 노화 (AGAINST N°001) ───────────────
  {
    id: 'tinted-sunscreen-iron-oxide',
    track: 'skin',
    name: "자외선+블루라이트차단 / 블루반 선크림(다이나믹+퓨어) 2종 Set, SPF50+ PA++++",
    brand: "블루반 (쿠팡)",
    priceLabel: "₩46,000",
    oneLine: '블루라이트(HEV)까지 가리는 색조 자외선 차단제 — 일반 SPF가 못 막는 자리.',
    rationale: 'iron oxide 함유 — 자외선 + 가시광선(블루라이트)을 둘 다 차단. 모니터 9시간 시대의 새 표준. 22명 in vivo 실험에서 HEV가 UVA1과 동등한 피부 손상을 일으킨다는 사실(J Invest Dermatol 2010) 이후, 미국·유럽 피부과의 새 권장 제품군.',
    source: 'Mahmoud · J Invest Dermatol · 2010',
    purchaseUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7233291&pageKey=7894376110&itemId=21620995687&vendorItemId=88672062854&traceid=V0-153-6a5d2580f60be69f&clickBeacon=a4d7b7a0-595c-11f1-a312-286b93553882%7E3&requestid=20260527084306188293889796&token=31850C%7CMIXED",
    imageUrl: "/images/shop/tinted-sunscreen-iron-oxide.jpg",
  },
  {
    id: 'silk-pillowcase-mommesilk',
    track: 'skin',
    name: "22무미 양면 실크 베갯잇 100% 실크",
    brand: "쿠팡 셀러 · 22 momme",
    priceLabel: "₩38,200",
    oneLine: '면 베갯잇의 마찰을 30% 줄여 수면 주름의 깊이를 막는 단일 도구.',
    rationale: '4,510명 분석 — 옆자세로 자는 사람의 한쪽 얼굴 주름이 반대편보다 28% 깊다(Aesthetic Surg J 2016). 등을 대고 자는 게 정답이지만 어려운 자리. 실크 베갯잇이 마찰을 30% 감소시켜 차선책이 된다(J Cosmet Dermatol 2019). 22-momme(중량) 이상이 의학적 권장.',
    source: 'Anson · Aesthetic Surg J · 2016',
    purchaseUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7233291&pageKey=8742882655&itemId=25408373508&vendorItemId=92401838730&traceid=V0-153-ac354f19cc6320f5&clickBeacon=a9849de0-595c-11f1-b36e-063caf4b9a56%7E3&requestid=20260527084314013216149582&token=31850C%7CMIXED",
    imageUrl: "/images/shop/silk-pillowcase-mommesilk.jpg",
  },
  {
    id: 'probiotics-lacto-bifido',
    track: 'skin',
    name: "락토핏 정품 골드 80포",
    brand: "종근당건강 · 락토핏",
    priceLabel: "₩18,500",
    oneLine: '8주 RCT — 피부 hydration 17%·탄력 13% 상승의 단일 변수.',
    rationale: '장-피부 축(Gut-Skin Axis) — 장내 다양성이 피부 염증·여드름·홍반·노화를 직접 결정한다(Salem · Front Microbiol 2018). 락토바실러스 + 비피도박테리움 다균주 + 일일 10조 CFU 이상이 권장. 8주 RCT에서 피부 수분·탄력·TEWL 모두 유의미한 개선(Negari · Biomed Pharmacother 2021).',
    source: 'Salem · Front Microbiol · 2018',
    purchaseUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7233291&pageKey=7912980024&itemId=21718136299&vendorItemId=88767406057&traceid=V0-153-b6b33d67e6bfbd54&requestid=20260527084321758238494873&token=31850C%7CMIXED",
    imageUrl: "/images/shop/probiotics-lacto-bifido.jpg",
  },
  {
    id: 'humidifier-balmuda',
    track: 'skin',
    name: "돌아라 4L 대용량 가습기 USB 듀얼분무 무드등",
    brand: "돌아라 (쿠팡)",
    priceLabel: "₩19,800",
    oneLine: '겨울 사무실 습도 25% → 45%로 올리는 단일 도구.',
    rationale: '한국 겨울 사무실 평균 습도 22~28%(산업안전보건연구원 2022) — 의학적 임계선(30%) 아래. 습도 30% 미만이면 경피수분손실(TEWL)이 25% 증가하고 피부 장벽이 약화된다(JEADV 2016). 가습기 한 대로 침실·사무실 한 곳을 30~50% 사이에 유지.',
    source: 'Engebretsen · JEADV · 2016',
    purchaseUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7233291&pageKey=9069129911&itemId=26633531627&vendorItemId=95371220322&traceid=V0-153-fa7e57dbc871e107&requestid=20260527084329606294336065&token=31850C%7CMIXED",
    imageUrl: "/images/shop/humidifier-balmuda.jpg",
  },
  {
    id: 'freestyle-libre-3',
    track: 'track',
    name: 'FreeStyle Libre 3 (CGM 14일 패치)',
    brand: 'Abbott',
    priceLabel: '₩70,000 / 패치 (2주)',
    oneLine: '연속혈당 측정 — 어떤 음식이 내 인슐린을 올리는지 본다.',
    rationale: 'Peter Attia · Levels Health 의 핵심 도구. 2주만 써도 자기 식단의 *진짜 효과*를 본다. 한국에선 처방 없이 약국 직접 구매.',
    source: 'Attia · Outlive · 2023',
  },
]

// ─────────────── 헬퍼 ───────────────
export const PRODUCT_TRACK_META: Record<
  LongevityTrack,
  { title: string; subtitle: string; intro: string }
> = {
  skin: {
    title: 'SKIN · 피부 노화',
    subtitle: '블루라이트·수면·습도·장-피부·ALDH2',
    intro: '피부 노화의 80%는 환경이 결정한다. 진료실의 첫 줄(자외선·금연·잠·수분·미세먼지) 너머에 박혀 있는 다섯 변수 — 그것을 매일 통제하는 도구들.',
  },
  move: {
    title: 'MOVE · 운동',
    subtitle: 'Zone 2 · 근력 · VO2max',
    intro: '50세 이후 1순위 사망률 예측 변수는 심폐 체력. 그 변수를 매일 움직이게 만드는 단 하나의 도구를 고른다.',
  },
  eat: {
    title: 'EAT · 식단',
    subtitle: '단백질 · 발효 · 한 끼 30g',
    intro: '한 끼 단백질 30g — 한국인 평균(60~70g/일)의 1.5배. 그 30g을 마트에서 가장 단순히 채우는 5가지.',
  },
  sleep: {
    title: 'SLEEP · 수면',
    subtitle: '7~8시간 · 깊은 잠 · 환경',
    intro: '잠은 시간이 아니라 *질*. N3 깊은 잠을 깨우는 환경 — 온도·암막·소음 마스킹 — 의 단순 도구들.',
  },
  mind: {
    title: 'MIND · 정신',
    subtitle: '호흡 10분 · 텔로미어 · 코르티솔',
    intro: '매일 10분의 호흡이 세포 안의 시계를 늦춘다. 명상 앱 + 노이즈캔슬링 + 일기 — 코르티솔의 단순 의학.',
  },
  track: {
    title: 'TRACK · 측정',
    subtitle: 'HRV · VO2max · 혈당 · 매일 데이터',
    intro: '저속노화는 측정하지 않으면 늦춰지지 않는다. Bryan Johnson은 매일 75개 변수를 측정한다. 그 시작점 6가지.',
  },
}

export function getProductsByTrack(track: LongevityTrack): LongevityProduct[] {
  return LONGEVITY_PRODUCTS.filter((p) => p.track === track)
}

export function getProductById(id: string): LongevityProduct | undefined {
  return LONGEVITY_PRODUCTS.find((p) => p.id === id)
}
