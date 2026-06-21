// Tiện ích định dạng tiền tệ
// VND dùng dấu CHẤM phân cách nghìn: 100.000 ₫
// JPY dùng dấu PHẨY phân cách nghìn: ¥10,000

export function formatVND(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
  // Kết quả: "100.000 ₫"
}

export function formatJPY(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
  // Kết quả: "¥10,000"
}

// Tự chọn format theo loại tiền
export function formatAmount(amount, currency) {
  return currency === "JPY" ? formatJPY(amount) : formatVND(amount);
}

// Rút gọn cho biểu đồ: 1.500.000 → "1,5M" | 500.000 → "500K"
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

// Dùng cho tooltip Recharts
export function formatChartVND(value) {
  return formatShort(value) + " ₫";
}

// Màu theo % ngân sách đã dùng
export function budgetColor(pct) {
  if (pct >= 100) return "#F43F5E";
  if (pct >= 80) return "#F59E0B";
  return "#10B981";
}
