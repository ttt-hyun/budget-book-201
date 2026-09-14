export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export const CATEGORY_KEYS = ["fixed", "local"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const parseCategory = (v: unknown): CategoryKey | undefined =>
  CATEGORY_KEYS.includes(v as CategoryKey) ? (v as CategoryKey) : undefined;
