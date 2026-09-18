/** 여행 1일차 날짜 (YYYY-MM-DD). 일정이 바뀌면 이 값만 고치면 된다 */
export const TRIP_START = "2026-09-17";

/** 마지막 일차. db.ts 의 LOCAL_DAYS 와 맞춰야 한다 */
const LAST_DAY = 3;

/** 서버 시간대와 무관하게 한국 날짜(YYYY-MM-DD)를 구한다 */
function seoulDate(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * 오늘이 여행 몇 일차인지. 지출 등록 폼의 기본 일차로 쓴다.
 * 여행 전이면 1일차, 여행이 끝난 뒤면 마지막 일차로 맞춘다.
 */
export function currentTripDay(now: Date = new Date()): number {
  const elapsed = Math.floor(
    (Date.parse(`${seoulDate(now)}T00:00:00Z`) - Date.parse(`${TRIP_START}T00:00:00Z`)) / 86_400_000,
  );
  return Math.min(Math.max(elapsed + 1, 1), LAST_DAY);
}
