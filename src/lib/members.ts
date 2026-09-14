export const MEMBERS = ["김은비", "박종훈", "박태현", "안지훈", "지민경"] as const;
export type Member = (typeof MEMBERS)[number];

export const DEFAULT_PAYER: Member = "안지훈";

export const isMember = (v: unknown): v is Member => MEMBERS.includes(v as Member);
