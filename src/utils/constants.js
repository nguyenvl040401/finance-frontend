// src/utils/constants.js
// Tập trung mọi hằng số toàn app — sửa 1 nơi, đúng hết

// ── Tiền tệ ──────────────────────────────────────────────────────────────────
export const CURRENCIES = {
  VND: "VND",
  JPY: "JPY",
};

export const CURRENCY_SYMBOLS = {
  VND: "₫",
  JPY: "¥",
};

// Label dùng trong toggle button (khớp với UI hiện tại)
export const CURRENCY_LABELS = {
  VND: "₫ VND",
  JPY: "¥ JPY",
};

// Label ngắn dùng trong toggle QuickAdd (khớp Dashboard.jsx)
export const CURRENCY_LABELS_SHORT = {
  VND: "₫",
  JPY: "¥",
};

// ── Loại giao dịch / danh mục ────────────────────────────────────────────────
export const TX_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

// ── Auth ─────────────────────────────────────────────────────────────────────
// Khớp với localStorage.getItem('auth_token') trong axios.js và AuthContext.jsx
export const AUTH_TOKEN_KEY = "auth_token";

// Khớp với PIN_LENGTH = 6 trong PinScreen.jsx
// và validate 'min:6|max:6' sẽ được fix ở AuthController (Bước 2)
export const PIN_LENGTH = 6;

// ── Settings keys — phải khớp với backend bảng settings ──────────────────────
export const SETTINGS_KEYS = {
  PIN_HASH: "pin_hash",
  AUTH_TOKEN: "auth_token",
  STATS_START_MONTH: "stats_start_month",
  STATS_START_YEAR: "stats_start_year",
  DISPLAY_NAME: "display_name",
  AVATAR_EMOJI: "avatar_emoji",
  DEFAULT_CURRENCY: "default_currency",
};

// ── Màu biểu đồ — khớp với C_INCOME / C_EXPENSE trong Reports.jsx ────────────
export const CHART_COLORS = {
  INCOME: "#10B981", // emerald-500
  EXPENSE: "#F43F5E", // rose-500
};

// ── Ngưỡng màu ngân sách — khớp với logic inline ở Dashboard + Categories ────
// pct < BUDGET_WARN  → xanh (emerald)
// pct < BUDGET_OVER  → vàng (amber)
// pct >= BUDGET_OVER → đỏ (rose)
export const BUDGET_THRESHOLDS = {
  WARN: 80,
  OVER: 100,
};

// ── Tỷ giá fallback — khớp với ExchangeRateService.php ──────────────────────
export const FALLBACK_RATE_JPY_TO_VND = 170;

// ── Pagination ───────────────────────────────────────────────────────────────
// Khớp với per_page: 100 trong Transactions.jsx (load hết 1 lần)
export const TX_PER_PAGE = 100;
// Khớp với per_page: 10 khi fetch income tags ở Dashboard
export const INCOME_TAGS_LIMIT = 10;
// Khớp với limit(5) trong ReportController@summary
export const RECENT_TX_LIMIT = 5;
// Khớp với per_page: 50 trong Reports level=day
export const DAY_TX_LIMIT = 50;

// ── Màu palette danh mục — khớp với COLOR_PALETTE trong Categories.jsx ───────
export const CATEGORY_COLORS = [
  "#10B981",
  "#F43F5E",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#F97316",
  "#EAB308",
  "#6B7280",
  "#14B8A6",
  "#84CC16",
  "#A855F7",
  "#EF4444",
  "#0EA5E9",
];

// ── Emoji danh mục — khớp với EMOJI_LIST trong Categories.jsx ────────────────
export const CATEGORY_EMOJIS = [
  "🍜",
  "🍕",
  "🚗",
  "🚌",
  "🏠",
  "🛍️",
  "🎮",
  "💊",
  "📚",
  "💼",
  "🎁",
  "📈",
  "🔧",
  "💵",
  "💰",
  "✈️",
  "🎵",
  "☕",
  "🏋️",
  "🐾",
  "👗",
  "💻",
  "🎓",
  "🏥",
  "🌿",
  "🎯",
  "🍺",
  "🛒",
  "📦",
  "💳",
];

// ── Avatar emoji cho tính năng cá nhân hóa (#11) ─────────────────────────────
export const AVATAR_EMOJIS = [
  "💰",
  "🧑‍💻",
  "👩‍💼",
  "🧑‍🎓",
  "🦊",
  "🐼",
  "🌟",
  "🎯",
  "🚀",
  "💎",
];

// ── Tháng labels — khớp với byMonth trong ReportController + Reports.jsx ─────
export const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];
