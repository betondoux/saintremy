// 쿠팡 카테고리 ID — Saint-Rémy 카테고리 매핑

export type SaintremyCategory =
  | 'gift'
  | 'deal'
  | 'style'
  | 'beauty'
  | 'space'
  | 'kitchen'
  | 'move'
  | 'travel'
  | 'furniture'
  | 'living'
  | 'music'

export interface CoupangCategorySpec {
  id: number
  label: string
}

// 쿠팡 1차 카테고리 ID (공식)
export const COUPANG_CATEGORIES: Record<string, CoupangCategorySpec> = {
  womensFashion:    { id: 1001, label: '여성패션' },
  mensFashion:      { id: 1002, label: '남성패션' },
  beauty:           { id: 1010, label: '뷰티' },
  babyKids:         { id: 1011, label: '출산/유아동' },
  food:             { id: 1012, label: '식품' },
  kitchen:          { id: 1013, label: '주방용품' },
  living:           { id: 1014, label: '생활용품' },
  homeInterior:     { id: 1015, label: '홈인테리어' },
  appliances:       { id: 1016, label: '가전디지털' },
  sportsLeisure:    { id: 1017, label: '스포츠/레저' },
  car:              { id: 1018, label: '자동차용품' },
  books:            { id: 1019, label: '도서/음반/DVD' },
  toys:             { id: 1020, label: '완구/취미' },
  office:           { id: 1021, label: '문구/오피스' },
  health:           { id: 1024, label: '헬스/건강식품' },
  domesticTravel:   { id: 1025, label: '국내여행' },
  overseasTravel:   { id: 1026, label: '해외여행' },
  pets:             { id: 1029, label: '반려동물용품' },
  kidsFashion:      { id: 1030, label: '유아동패션' },
}

// Saint-Rémy 카테고리 → 쿠팡 카테고리 ID 1개 이상
export const SAINTREMY_TO_COUPANG: Record<SaintremyCategory, number[]> = {
  beauty:    [COUPANG_CATEGORIES.beauty.id],
  kitchen:   [COUPANG_CATEGORIES.kitchen.id],
  living:    [COUPANG_CATEGORIES.living.id, COUPANG_CATEGORIES.health.id],
  furniture: [COUPANG_CATEGORIES.homeInterior.id],
  style:     [COUPANG_CATEGORIES.womensFashion.id, COUPANG_CATEGORIES.mensFashion.id],
  move:      [COUPANG_CATEGORIES.sportsLeisure.id],
  travel:    [COUPANG_CATEGORIES.domesticTravel.id, COUPANG_CATEGORIES.overseasTravel.id],
  space:     [COUPANG_CATEGORIES.homeInterior.id],
  gift:      [
    COUPANG_CATEGORIES.beauty.id,
    COUPANG_CATEGORIES.health.id,
    COUPANG_CATEGORIES.food.id,
    COUPANG_CATEGORIES.kitchen.id,
  ],
  deal:      [], // goldbox만 사용 (전체 핫딜)
  music:     [COUPANG_CATEGORIES.appliances.id], // 음향 기기 = 가전
}
