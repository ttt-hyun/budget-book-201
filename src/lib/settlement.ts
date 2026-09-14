import { MEMBERS, type Member } from "./members";

type Splittable = { amount: number; payers: Member[]; users: Member[] };

export type PersonBalance = {
  name: Member;
  paid: number; // 부담한 금액 (부담자끼리 N등분)
  used: number; // 이용한 금액 (이용자끼리 N등분)
  net: number; // + 받을 돈 / - 보낼 돈
};

export type Transfer = { from: Member; to: Member; amount: number };

export function calcBalances(expenses: Splittable[]): PersonBalance[] {
  const paid = new Map<Member, number>(MEMBERS.map((m) => [m, 0]));
  const used = new Map<Member, number>(MEMBERS.map((m) => [m, 0]));

  for (const e of expenses) {
    for (const p of e.payers) paid.set(p, paid.get(p)! + e.amount / e.payers.length);
    for (const u of e.users) used.set(u, used.get(u)! + e.amount / e.users.length);
  }

  return MEMBERS.map((name) => {
    const p = Math.round(paid.get(name)!);
    const u = Math.round(used.get(name)!);
    return { name, paid: p, used: u, net: p - u };
  });
}

/** 보낼 사람 → 받을 사람 송금 목록 (큰 금액끼리 먼저 매칭해 송금 횟수를 줄임) */
export function calcTransfers(balances: PersonBalance[]): Transfer[] {
  const creditors = balances.filter((b) => b.net > 0).map((b) => ({ name: b.name, left: b.net }));
  const debtors = balances.filter((b) => b.net < 0).map((b) => ({ name: b.name, left: -b.net }));
  creditors.sort((a, b) => b.left - a.left);
  debtors.sort((a, b) => b.left - a.left);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].left, creditors[j].left);
    if (amount > 0) transfers.push({ from: debtors[i].name, to: creditors[j].name, amount });
    debtors[i].left -= amount;
    creditors[j].left -= amount;
    if (debtors[i].left === 0) i++;
    if (creditors[j].left === 0) j++;
  }
  return transfers;
}
