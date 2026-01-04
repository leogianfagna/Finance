export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function monthKey(year, month) {
  return `${year}-${pad2(month)}`;
}

export function getNowYearMonth() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function defaultMonthData(year, month) {
  return {
    month: monthKey(year, month),
    assets: [],
    statement: [],
    totals: { netWorth: 0 },
    meta: { copiedFrom: null, notes: "" },
  };
}

export function computeTotals(data) {
  const assets = Array.isArray(data.assets) ? data.assets : [];
  const netWorth = assets.reduce((sum, a) => sum + (Number(a.total) || 0), 0);

  return {
    ...data,
    totals: {
      ...(data.totals || {}),
      netWorth,
    },
  };
}
