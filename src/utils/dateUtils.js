import dayjs from "dayjs";
import "dayjs/locale/vi";
import api from "../api/axios";

dayjs.locale("vi");

let _statsStart = {
  month: dayjs().month() + 1,
  year: dayjs().year(),
  loaded: false,
};

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

export function getStatsStart() {
  return _statsStart;
}

export async function saveStatsStart(month, year) {
  await api.post("/app-settings/stats-start", { month, year });
  _statsStart = { month, year, loaded: true };
}

export function getRecentMonths() {
  const { month: startMonth, year: startYear } = _statsStart;
  const months = [];
  let cur = dayjs();

  // FIX: thêm giới hạn tối đa 120 tháng (10 năm) để tránh loop vô hạn
  // nếu startYear lớn hơn năm hiện tại do lỗi dữ liệu
  const MAX_MONTHS = 120;
  let count = 0;

  while (count < MAX_MONTHS) {
    const curMonth = cur.month() + 1;
    const curYear = cur.year();

    // Dừng khi đã vượt qua mốc bắt đầu
    if (curYear < startYear || (curYear === startYear && curMonth < startMonth))
      break;

    months.push({
      month: curMonth,
      year: curYear,
      label: `T${curMonth}/${curYear}`,
    });

    cur = cur.subtract(1, "month");
    count++;
  }

  // Luôn có ít nhất tháng hiện tại
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

export function getYears() {
  const { year: startYear } = _statsStart;
  const now = dayjs().year();

  // FIX: nếu startYear > now (dữ liệu lỗi) thì chỉ trả năm hiện tại
  const from = Math.min(startYear, now);
  const years = [];
  for (let y = now; y >= from; y--) years.push(y);
  if (years.length === 0) years.push(now);
  return years;
}

export function currentMonthYear() {
  return { month: dayjs().month() + 1, year: dayjs().year() };
}

export function today() {
  return dayjs().format("YYYY-MM-DD");
}

export function formatDate(date) {
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatShortDate(date) {
  return dayjs(date).format("DD/MM");
}

export function formatMonth(month, year) {
  return `Tháng ${month}/${year}`;
}

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
