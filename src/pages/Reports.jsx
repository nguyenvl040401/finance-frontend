import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../api/axios";
import { formatVND, formatShort } from "../utils/currency";
import {
  formatDate,
  formatShortDate,
  getDayName,
  currentMonthYear,
  getYears,
  getStatsStart,
} from "../utils/dateUtils";

const C_INCOME = "#10B981";
const C_EXPENSE = "#F43F5E";

// ─── 3 cấp xem: year → month → day ──────────────────────────────────────────
// year:  BarChart 12 tháng → tap bar → vào month
// month: BarChart từng ngày → tap bar → vào day
// day:   Danh sách giao dịch ngày đó

export default function Reports() {
  const { year: curYear } = currentMonthYear();
  const years = getYears();

  // State máy cấp độ
  const [level, setLevel] = useState("year");
  const [selYear, setSelYear] = useState(curYear);
  const [selMonth, setSelMonth] = useState(null); // số 1-12
  const [selDay, setSelDay] = useState(null); // 'YYYY-MM-DD'

  // Dữ liệu
  const [chartData, setChartData] = useState([]);
  const [dayTxs, setDayTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu theo cấp độ hiện tại
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (level === "year") {
          const res = await api.get("/reports/by-month", {
            params: { year: selYear },
          });
          const data = res.data.data ?? [];
          // Lọc theo mốc thống kê đã lưu trong Settings (không hardcode 2026 nữa)
          const { month: startMonth, year: startYear } = getStatsStart();
          setChartData(
            selYear === startYear
              ? data.filter((_, i) => i >= startMonth - 1) // index 0 = tháng 1
              : selYear > startYear
                ? data // năm sau mốc → hiện đủ 12 tháng
                : [], // năm trước mốc → không hiện gì
          );
        } else if (level === "month") {
          const res = await api.get("/reports/by-day", {
            params: { month: selMonth, year: selYear },
          });
          setChartData(res.data.data ?? []);
        } else if (level === "day") {
          const res = await api.get("/transactions", {
            params: { date: selDay, per_page: 50 },
          });
          setDayTxs(res.data.data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [level, selYear, selMonth, selDay]);

  // Xử lý tap vào cột bar chart → drill down
  const handleBarClick = (data) => {
    if (!data) return;
    if (level === "year") {
      // data.month = "T8", "T9"... → map sang số
      const idx = [
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
      ].indexOf(data.month);
      if (idx !== -1) {
        setSelMonth(idx + 1);
        setLevel("month");
      }
    } else if (level === "month") {
      // data.date = "2026-08-15"
      if (data.date) {
        setSelDay(data.date);
        setLevel("day");
      }
    }
  };

  // Tổng thu/chi từ chartData (không áp dụng cho level=day)
  const totalIncome = chartData.reduce((s, d) => s + (d.income ?? 0), 0);
  const totalExpense = chartData.reduce((s, d) => s + (d.expense ?? 0), 0);
  const balance = totalIncome - totalExpense;

  // Label trục X
  const xKey = level === "year" ? "month" : "date";
  const formatX = (val) => {
    if (level === "year") return val; // "T8", "T9"...
    if (level === "month") return val?.slice(8) ?? val; // "15", "16"...
    return val;
  };

  // Tiêu đề động theo cấp
  const levelTitle = () => {
    if (level === "year") return `Năm ${selYear}`;
    if (level === "month") return `Tháng ${selMonth}/${selYear}`;
    return formatDate(selDay);
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-fade-up">
      {/* Header + nút back */}
      <div className="flex items-center gap-3">
        {level !== "year" && (
          <button
            onClick={() => {
              if (level === "day") setLevel("month");
              if (level === "month") setLevel("year");
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06]
                       hover:bg-white/[0.1] active:scale-90 transition-all flex-shrink-0"
          >
            <svg
              className="w-4 h-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs text-slate-500">
            {level === "year"
              ? "Tap vào tháng để xem chi tiết"
              : level === "month"
                ? "Tap vào ngày để xem giao dịch"
                : "Giao dịch trong ngày"}
          </p>
          <h1 className="text-xl font-bold text-white mt-0.5">
            {levelTitle()}
          </h1>
        </div>

        {/* Chọn năm (chỉ hiện ở cấp year) */}
        {level === "year" && (
          <select
            value={selYear}
            onChange={(e) => setSelYear(Number(e.target.value))}
            className="bg-[#111827] border border-white/[0.06] rounded-xl px-3 py-2
                       text-sm text-white focus:outline-none focus:border-emerald-500/40"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ─── Level: day — Danh sách giao dịch ─── */}
      {level === "day" ? (
        loading ? (
          <Spinner />
        ) : (
          <DayTransactions transactions={dayTxs} date={selDay} />
        )
      ) : (
        /* ─── Level: year / month — Biểu đồ ─── */
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard
              label="Tổng thu"
              value={totalIncome}
              color="text-emerald-400"
              bg="bg-emerald-500/[0.08] border-emerald-500/[0.12]"
            />
            <SummaryCard
              label="Tổng chi"
              value={totalExpense}
              color="text-rose-400"
              bg="bg-rose-500/[0.08] border-rose-500/[0.12]"
            />
            <SummaryCard
              label="Số dư"
              value={Math.abs(balance)}
              color={balance >= 0 ? "text-emerald-400" : "text-rose-400"}
              bg={
                balance >= 0
                  ? "bg-emerald-500/[0.08] border-emerald-500/[0.12]"
                  : "bg-rose-500/[0.08] border-rose-500/[0.12]"
              }
              prefix={balance >= 0 ? "+" : "-"}
            />
          </div>

          {loading ? (
            <Spinner />
          ) : chartData.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-3 text-4xl">📊</p>
              <p className="text-sm text-slate-500">Chưa có dữ liệu</p>
            </div>
          ) : (
            <>
              {/* Bar Chart — clickable */}
              <div className="card">
                <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Thu & Chi
                  {level === "month" && (
                    <span className="ml-1 font-normal normal-case text-slate-700">
                      (tap vào ngày)
                    </span>
                  )}
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
                    barGap={3}
                    onClick={(e) =>
                      e?.activePayload?.[0] &&
                      handleBarClick(e.activePayload[0].payload)
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey={xKey}
                      tickFormatter={formatX}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatShort(v)}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar
                      dataKey="income"
                      name="Thu nhập"
                      fill={C_INCOME}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={20}
                      opacity={0.9}
                      cursor="pointer"
                    />
                    <Bar
                      dataKey="expense"
                      name="Chi tiêu"
                      fill={C_EXPENSE}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={20}
                      opacity={0.9}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Gợi ý tap */}
                {level === "year" && (
                  <p className="text-[10px] text-slate-700 text-center mt-2">
                    ↑ Tap vào tháng để xem từng ngày
                  </p>
                )}
              </div>

              {/* Line Chart — xu hướng */}
              <div className="card">
                <p className="mb-4 text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Xu hướng
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey={xKey}
                      tickFormatter={formatX}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatShort(v)}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke={C_INCOME}
                      strokeWidth={2}
                      dot={{ fill: C_INCOME, r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke={C_EXPENSE}
                      strokeWidth={2}
                      dot={{ fill: C_EXPENSE, r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-500">Thu nhập</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-xs text-slate-500">Chi tiêu</span>
                  </div>
                </div>
              </div>

              {/* Bảng chi tiết */}
              <div className="card">
                <p className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Chi tiết
                </p>
                <div className="-mx-1 space-y-0 overflow-y-auto max-h-56">
                  {[...chartData].reverse().map((row, i) => {
                    const bal = (row.income ?? 0) - (row.expense ?? 0);
                    return (
                      <button
                        key={i}
                        onClick={() => handleBarClick(row)}
                        className="w-full flex items-center gap-2 px-1 py-2.5 border-b border-white/[0.04]
                                   last:border-0 hover:bg-white/[0.03] transition-colors rounded-lg"
                      >
                        <span className="flex-shrink-0 w-10 font-mono text-xs text-left text-slate-600">
                          {formatX(row[xKey])}
                        </span>
                        <span className="flex-1 font-mono text-xs text-right text-emerald-400">
                          +{formatShort(row.income ?? 0)}
                        </span>
                        <span className="flex-1 font-mono text-xs text-right text-rose-400">
                          -{formatShort(row.expense ?? 0)}
                        </span>
                        <span
                          className={`text-xs font-mono flex-1 text-right font-medium ${bal >= 0 ? "text-slate-300" : "text-rose-400"}`}
                        >
                          {bal >= 0 ? "+" : ""}
                          {formatShort(bal)}
                        </span>
                        {level === "month" && (
                          <svg
                            className="flex-shrink-0 w-3 h-3 text-slate-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Danh sách giao dịch trong ngày (level=day) ───────────────────────────────
function DayTransactions({ transactions, date }) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount_vnd, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount_vnd, 0);
  const balance = totalIncome - totalExpense;

  if (!transactions.length) {
    return (
      <div className="py-16 text-center">
        <p className="mb-3 text-4xl">📭</p>
        <p className="text-sm text-slate-500">
          Không có giao dịch nào ngày {formatDate(date)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tổng kết ngày */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard
          label="Thu"
          value={totalIncome}
          color="text-emerald-400"
          bg="bg-emerald-500/[0.08] border-emerald-500/[0.12]"
        />
        <SummaryCard
          label="Chi"
          value={totalExpense}
          color="text-rose-400"
          bg="bg-rose-500/[0.08] border-rose-500/[0.12]"
        />
        <SummaryCard
          label="Số dư"
          value={Math.abs(balance)}
          color={balance >= 0 ? "text-emerald-400" : "text-rose-400"}
          bg={
            balance >= 0
              ? "bg-emerald-500/[0.08] border-emerald-500/[0.12]"
              : "bg-rose-500/[0.08] border-rose-500/[0.12]"
          }
          prefix={balance >= 0 ? "+" : "-"}
        />
      </div>

      {/* Danh sách giao dịch */}
      <div className="card p-0 overflow-hidden divide-y divide-white/[0.04]">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-lg rounded-xl"
              style={{
                backgroundColor: (tx.category?.color ?? "#6B7280") + "20",
              }}
            >
              {tx.category?.icon ?? "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {tx.category?.name}
              </p>
              {tx.note && (
                <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                  {tx.note}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <p
                className={`text-sm font-mono font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatVND(tx.amount_vnd)}
              </p>
              {tx.currency === "JPY" && (
                <p className="text-[10px] text-slate-600 mt-0.5">
                  ¥{tx.amount.toLocaleString("ja-JP")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Components phụ ──────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, bg, prefix = "" }) {
  return (
    <div className={`border rounded-xl p-3 ${bg}`}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className={`text-xs font-semibold font-mono ${color}`}>
        {prefix}
        {formatShort(value)}₫
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
  const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
  const bal = income - expense;

  return (
    <div className="bg-[#1a2535] border border-white/[0.08] rounded-xl p-3 shadow-xl text-xs min-w-[140px]">
      <p className="mb-2 font-medium text-slate-500">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Thu</span>
          </div>
          <span className="font-mono font-semibold text-emerald-400">
            {formatShort(income)}₫
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-slate-400">Chi</span>
          </div>
          <span className="font-mono font-semibold text-rose-400">
            {formatShort(expense)}₫
          </span>
        </div>
        <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <span className="text-slate-500">Số dư</span>
          <span
            className={`font-mono font-bold ${bal >= 0 ? "text-white" : "text-rose-400"}`}
          >
            {bal >= 0 ? "+" : ""}
            {formatShort(bal)}₫
          </span>
        </div>
      </div>
    </div>
  );
}
