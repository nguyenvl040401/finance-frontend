import dayjs from "dayjs";
import "dayjs/locale/vi";
import api from "../api/axios";

dayjs.locale("vi");

// Mốc bắt đầu thống kê — lấy từ API, cache lại trong session để khỏi gọi nhiều lần
// Mặc định fallback = tháng hiện tại nếu chưa load được từ server
let _statsStart = {
  month: dayjs().month() + 1,
  year: dayjs().year(),
  loaded: false,
};

// Gọi 1 lần khi app khởi động (App.jsx sẽ gọi hàm này sau khi đăng nhập)
export async function loadStatsStart() {
  try {
    const res = await api.get("/app-settings/stats-start");
    _statsStart = { month: res.data.month, year: res.data.year, loaded: true };
  } catch (e) {
    console.error(
      "Không tải được mốc thống kê, dùng mặc định tháng hiện tại.",
      e,
    );
  }
  return _statsStart;
}

// Lấy mốc hiện tại (đồng bộ — dùng sau khi đã loadStatsStart)
export function getStatsStart() {
  return _statsStart;
}

// Lưu mốc mới — gọi từ trang Settings
export async function saveStatsStart(month, year) {
  await api.post("/app-settings/stats-start", { month, year });
  _statsStart = { month, year, loaded: true };
}

// Danh sách tháng từ mốc đã lưu đến hiện tại (mới nhất trước)
export function getRecentMonths() {
  const { month: startMonth, year: startYear } = _statsStart;
  const months = [];
  let cur = dayjs();

  while (
    cur.year() > startYear ||
    (cur.year() === startYear && cur.month() + 1 >= startMonth)
  ) {
    months.push({
      month: cur.month() + 1,
      year: cur.year(),
      label: `T${cur.month() + 1}/${cur.year()}`,
    });
    cur = cur.subtract(1, "month");
  }

  // Luôn có ít nhất tháng hiện tại để tránh dropdown trống
  if (months.length === 0) {
    const now = dayjs();
    months.push({
      month: now.month() + 1,
      year: now.year(),
      label: `T${now.month() + 1}/${now.year()}`,
    });
  }

  return months;
}

// Danh sách năm có dữ liệu (từ năm mốc đến năm hiện tại)
export function getYears() {
  const { year: startYear } = _statsStart;
  const now = dayjs().year();
  const years = [];
  for (let y = now; y >= startYear; y--) years.push(y);
  if (years.length === 0) years.push(now);
  return years;
}

// Tháng và năm hiện tại
export function currentMonthYear() {
  return { month: dayjs().month() + 1, year: dayjs().year() };
}

// Hôm nay dạng YYYY-MM-DD
export function today() {
  return dayjs().format("YYYY-MM-DD");
}

// "15/08/2026"
export function formatDate(date) {
  return dayjs(date).format("DD/MM/YYYY");
}

// "15/08"
export function formatShortDate(date) {
  return dayjs(date).format("DD/MM");
}

// "Tháng 8/2026"
export function formatMonth(month, year) {
  return `Tháng ${month}/${year}`;
}

// Tên thứ: "Thứ 2", "Chủ nhật"
export function getDayName(date) {
  const names = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return names[dayjs(date).day()];
}
