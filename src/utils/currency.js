// src/utils/currency.js
import { BUDGET_THRESHOLDS, CHART_COLORS } from "./constants";

export function formatVND(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatJPY(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmount(amount, currency) {
  return currency === "JPY" ? formatJPY(amount) : formatVND(amount);
}

export function formatShort(amount) {
  if (!amount && amount !== 0) return "0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return sign + (abs / 1_000_000_000).toFixed(1) + "B";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(0) + "K";
  return sign + abs.toString();
}

export function formatChartVND(value) {
  return formatShort(value) + " ₫";
}

// FIX: dùng BUDGET_THRESHOLDS từ constants thay vì hardcode 80/100
// Nhất quán với Dashboard.jsx và Categories.jsx
export function budgetColor(pct) {
  if (pct >= BUDGET_THRESHOLDS.OVER) return CHART_COLORS.EXPENSE; // '#F43F5E'
  if (pct >= BUDGET_THRESHOLDS.WARN) return "#F59E0B"; // amber
  return CHART_COLORS.INCOME; // '#10B981'
}

// Trả về Tailwind class thay vì hex — dùng để thay thế logic inline lặp lại
// ở BudgetBar (Dashboard) và CategoryCard (Categories)
export function budgetColorClass(pct) {
  if (pct >= BUDGET_THRESHOLDS.OVER) return "text-rose-400";
  if (pct >= BUDGET_THRESHOLDS.WARN) return "text-amber-400";
  return "text-slate-400";
}

export function budgetBarClass(pct) {
  if (pct >= BUDGET_THRESHOLDS.OVER) return "bg-rose-500";
  if (pct >= BUDGET_THRESHOLDS.WARN) return "bg-amber-400";
  return "bg-emerald-500";
}
