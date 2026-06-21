// Tiện ích format số khi NGƯỜI DÙNG ĐANG GÕ vào ô input
// Khác với currency.js (chỉ dùng để HIỂN THỊ số đã có sẵn)

// Bỏ hết ký tự không phải số (giữ lại số nguyên dương)
export function stripNonDigits(str) {
  return str.replace(/[^\d]/g, "");
}

// Format số có dấu chấm phân cách nghìn khi đang gõ — dùng cho VND
// "10000000" → "10.000.000"
export function formatVNDInput(raw) {
  const digits = stripNonDigits(raw);
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

// Format số có dấu phẩy phân cách nghìn khi đang gõ — dùng cho JPY
// "10000" → "10,000"
export function formatJPYInput(raw) {
  const digits = stripNonDigits(raw);
  if (!digits) return "";
  return new Intl.NumberFormat("en-US").format(Number(digits));
}

// Chuyển chuỗi đã format ngược lại thành số thuần để gửi lên API
// "10.000.000" hoặc "10,000,000" → 10000000
export function parseFormattedNumber(formatted) {
  const digits = stripNonDigits(formatted);
  return digits ? Number(digits) : 0;
}

// Format theo loại tiền tệ đang chọn (dùng chung cho mọi input)
export function formatAmountInput(raw, currency) {
  return currency === "JPY" ? formatJPYInput(raw) : formatVNDInput(raw);
}
