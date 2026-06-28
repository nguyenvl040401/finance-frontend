import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/ui/Modal";
import AmountInput from "../components/ui/AmountInput";
import { formatVND, formatJPY, formatShort } from "../utils/currency";
import { formatDate, today, currentMonthYear } from "../utils/dateUtils";
import { useProfile } from "../context/ProfileContext";
import { CURRENCIES } from "../utils/constants";

export default function Dashboard() {
  const { month, year } = currentMonthYear();
  // #11 #12: lấy profile (tên, avatar, tiền tệ mặc định)
  const { profile } = useProfile();

  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [rate, setRate] = useState(null);
  const [incomeTxs, setIncomeTxs] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [s, b, r, iTxs, cats] = await Promise.all([
        api.get("/reports/summary", { params: { month, year } }),
        api.get("/budgets", { params: { month, year } }),
        api.get("/exchange-rates"),
        api.get("/transactions", {
          params: { month, year, type: "income", per_page: 10 },
        }),
        api.get("/categories"),
      ]);
      setSummary(s.data);
      setBudgets(b.data.data ?? []);
      setRate(r.data);
      setIncomeTxs(iTxs.data.data ?? []);
      setCategories(cats.data);
    } catch (e) {
      console.error(e);
    }
  }, [month, year]);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  if (loading) {
    // Inline skeleton giữ nguyên như code gốc — nhẹ hơn import Skeletons
    return (
      <div className="px-4 pt-5 pb-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-white/[0.06] rounded-lg" />
        <div className="h-56 bg-white/[0.04] rounded-2xl" />
        <div className="h-36 bg-white/[0.04] rounded-2xl" />
        <div className="h-40 bg-white/[0.04] rounded-2xl" />
      </div>
    );
  }

  const walletTotal = summary?.total_income_vnd ?? 0;
  const spent = summary?.total_expense_vnd ?? 0;
  const remaining = walletTotal - spent;
  const spentPct =
    walletTotal > 0
      ? Math.min(100, Math.round((spent / walletTotal) * 100))
      : 0;
  const budgetsWithData = budgets.filter((b) => b.budget);
  const totalAllocated = budgetsWithData.reduce(
    (s, b) => s + (b.budget?.amount ?? 0),
    0,
  );
  const unallocated = walletTotal - totalAllocated;

  // #11: tên hiển thị ở header
  const walletTitle = profile.display_name
    ? `${profile.avatar_emoji} Ví của ${profile.display_name}`
    : "Ví của tôi";

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Tháng {month}/{year}
          </p>
          {/* #11: hiển thị tên + avatar nếu đã cài đặt */}
          <h1 className="text-xl font-bold text-white mt-0.5">{walletTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          {rate && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-right">
              <p className="text-[10px] text-slate-600">Tỷ giá</p>
              <p className="font-mono text-xs text-emerald-400">
                ¥1 = {formatShort(rate.jpy_to_vnd)}₫
              </p>
            </div>
          )}
          <button
            onClick={() => setShowIncomeModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25
                       text-emerald-400 text-xs font-semibold px-3 py-2.5 rounded-xl
                       hover:bg-emerald-500/20 active:scale-95 transition-all duration-150"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Nhập thu
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#111827] border border-white/[0.08] p-5">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none bg-emerald-500/5 blur-2xl" />
        <p className="mb-1 text-xs font-medium text-slate-500">Ví tháng này</p>
        <p className="font-mono text-4xl font-bold tracking-tight text-emerald-400">
          {formatVND(walletTotal)}
        </p>

        {incomeTxs.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {incomeTxs.map((tx) => (
              <span
                key={tx.id}
                className="text-[10px] bg-emerald-500/[0.08] border border-emerald-500/[0.15]
                           text-emerald-400/70 px-2 py-0.5 rounded-full font-mono"
              >
                +{formatShort(tx.amount_vnd)}₫{tx.note ? ` · ${tx.note}` : ""}
              </span>
            ))}
            <button
              onClick={() => setShowIncomeModal(true)}
              className="text-[10px] bg-white/[0.04] border border-white/[0.06] text-slate-500
                         px-2 py-0.5 rounded-full hover:text-slate-300 transition-colors"
            >
              + thêm
            </button>
          </div>
        )}

        <div className="mt-4 mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-500">
              Đã chi {spentPct}%
            </span>
            <span className="text-[11px] text-slate-600">
              Còn {100 - spentPct}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                spentPct >= 100
                  ? "bg-rose-500"
                  : spentPct >= 80
                    ? "bg-amber-400"
                    : "bg-rose-500/80"
              }`}
              style={{ width: `${Math.max(2, spentPct)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div
            className={`border rounded-xl p-3 ${
              remaining >= 0
                ? "bg-emerald-500/[0.08] border-emerald-500/[0.15]"
                : "bg-rose-500/[0.08] border-rose-500/[0.15]"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${remaining >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              <span className="text-[11px] text-slate-400">
                Còn lại trong ví
              </span>
            </div>
            <p
              className={`font-semibold font-mono text-sm ${remaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {formatVND(remaining)}
            </p>
          </div>
          <div className="bg-rose-500/[0.08] border border-rose-500/[0.15] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-[11px] text-slate-400">Đã chi</span>
            </div>
            <p className="font-mono text-sm font-semibold text-rose-400">
              {formatVND(spent)}
            </p>
          </div>
        </div>

        {walletTotal > 0 && (
          <div className="mt-3 flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
              </svg>
              <span className="text-[11px] text-slate-500">
                Chưa phân bổ cho danh mục
              </span>
            </div>
            <span
              className={`text-xs font-mono font-semibold ${
                unallocated > 0
                  ? "text-amber-400"
                  : unallocated < 0
                    ? "text-rose-400"
                    : "text-slate-600"
              }`}
            >
              {formatVND(unallocated)}
            </span>
          </div>
        )}
      </div>

      {/* Phân bổ */}
      {budgetsWithData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">
              Phân bổ tháng này
            </h2>
            <Link
              to="/categories"
              className="text-xs font-medium transition-colors text-emerald-400 hover:text-emerald-300"
            >
              Quản lý
            </Link>
          </div>
          {walletTotal > 0 && (
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-[11px] text-slate-600">
                Tổng đã chia: {formatShort(totalAllocated)}₫
              </span>
              {unallocated > 0 ? (
                <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  Còn {formatShort(unallocated)}₫ chưa chia
                </span>
              ) : unallocated < 0 ? (
                <span className="text-[10px] bg-rose-400/10 text-rose-400 border border-rose-400/20 px-2 py-0.5 rounded-full">
                  Vượt ví {formatShort(Math.abs(unallocated))}₫
                </span>
              ) : (
                <span className="text-[10px] text-slate-600">
                  Đã chia hết ✓
                </span>
              )}
            </div>
          )}
          <div className="space-y-4">
            {budgetsWithData.slice(0, 5).map((item) => (
              <BudgetBar key={item.category.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* #12: truyền defaultCurrency xuống QuickAdd */}
      <QuickAdd
        categories={categories}
        rate={rate}
        onSaved={reload}
        defaultCurrency={profile.default_currency}
      />

      {summary?.expense_by_category?.length > 0 && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-white">
            Chi nhiều nhất
          </h2>
          <div className="space-y-3">
            {summary.expense_by_category.slice(0, 4).map((cat, i) => {
              const pct = spent > 0 ? Math.round((cat.total / spent) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center flex-shrink-0 text-base w-9 h-9 rounded-xl"
                    style={{ backgroundColor: (cat.color ?? "#6B7280") + "20" }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate text-slate-300">
                        {cat.category}
                      </span>
                      <span className="ml-2 font-mono text-xs text-slate-500">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="flex-shrink-0 ml-1 font-mono text-xs font-medium text-rose-400">
                    {formatShort(cat.total)}₫
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">
            Giao dịch gần đây
          </h2>
          <Link
            to="/transactions"
            className="text-xs font-medium transition-colors text-emerald-400 hover:text-emerald-300"
          >
            Xem tất cả
          </Link>
        </div>
        {!summary?.recent_transactions?.length ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-3xl">📭</p>
            <p className="text-sm text-slate-500">
              Chưa có giao dịch trong tháng
            </p>
          </div>
        ) : (
          <div className="-mx-1 space-y-1">
            {summary.recent_transactions.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        title="Nhập thu nhập vào ví"
      >
        <IncomeForm
          categories={categories}
          rate={rate}
          defaultCurrency={profile.default_currency}
          onSaved={() => {
            setShowIncomeModal(false);
            reload();
          }}
        />
      </Modal>
    </div>
  );
}

// #12: nhận defaultCurrency từ profile
function QuickAdd({ categories, rate, onSaved, defaultCurrency }) {
  const [selCat, setSelCat] = useState(null);
  const [amount, setAmount] = useState(0);
  // #12: default từ profile thay vì hardcode "VND"
  const [currency, setCurrency] = useState(defaultCurrency || CURRENCIES.VND);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cập nhật currency khi profile load xong (lần đầu profile có thể chưa sẵn)
  useEffect(() => {
    if (defaultCurrency) setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const topCats = (categories.expense ?? []).slice(0, 6);

  const handleSave = async () => {
    if (!selCat || !amount || amount <= 0) return;
    setSaving(true);
    try {
      await api.post("/transactions", {
        category_id: selCat.id,
        type: "expense",
        amount,
        currency,
        tags: [],
        date: today(),
      });
      setSuccess(true);
      setAmount(0);
      setSelCat(null);
      onSaved();
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          ⚡ Ghi nhanh
        </p>
        {success && (
          <p className="text-xs font-medium text-emerald-400 animate-fade-up">
            ✓ Đã ghi!
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-hide">
        {topCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelCat(selCat?.id === cat.id ? null : cat)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 w-[58px] py-2.5 rounded-xl border transition-all duration-150 ${
              selCat?.id === cat.id
                ? "border-emerald-500/40 bg-emerald-500/[0.08] scale-[1.04]"
                : "border-white/[0.06] hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-[10px] text-slate-500 truncate w-full text-center px-0.5 leading-tight">
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {selCat ? (
        <div className="space-y-2 animate-fade-up">
          <div className="flex items-center gap-2">
            <AmountInput
              value={amount}
              onChange={setAmount}
              currency={currency}
              autoFocus
              onEnter={handleSave}
            />
            <div className="flex bg-[#0d1424] rounded-full p-0.5 border border-white/[0.06] flex-shrink-0">
              {[CURRENCIES.VND, CURRENCIES.JPY].map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    currency === cur
                      ? "bg-emerald-500 text-white"
                      : "text-slate-500"
                  }`}
                >
                  {cur === CURRENCIES.VND ? "₫" : "¥"}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !amount || amount <= 0}
              className="flex-shrink-0 px-4 text-sm font-bold text-white transition-all h-11 bg-emerald-500 rounded-xl disabled:opacity-40 active:scale-95 shadow-income"
            >
              {saving ? "..." : "Ghi"}
            </button>
          </div>
          {rate && amount > 0 && (
            <p className="text-[11px] text-slate-600 pl-1">
              {currency === CURRENCIES.JPY
                ? `≈ ${formatVND(amount * rate.jpy_to_vnd)}`
                : `≈ ${formatJPY(amount * rate.vnd_to_jpy)}`}
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-slate-700 text-center pb-1">
          Chạm vào danh mục bên trên để ghi nhanh
        </p>
      )}
    </div>
  );
}

// #12: nhận defaultCurrency
function IncomeForm({ categories, rate, defaultCurrency, onSaved }) {
  const [catId, setCatId] = useState(categories.income?.[0]?.id ?? "");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(defaultCurrency || CURRENCIES.VND);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultCurrency) setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const preview = () => {
    if (!amount || !rate || amount <= 0) return null;
    return currency === CURRENCIES.JPY
      ? `≈ ${formatVND(amount * rate.jpy_to_vnd)}`
      : `≈ ${formatJPY(amount * rate.vnd_to_jpy)}`;
  };

  const handleSave = async () => {
    if (!catId) return setError("Chọn loại thu nhập.");
    if (!amount || amount <= 0) return setError("Nhập số tiền hợp lệ.");
    setSaving(true);
    setError("");
    try {
      await api.post("/transactions", {
        category_id: catId,
        type: "income",
        amount,
        currency,
        note: note || null,
        tags: [],
        date,
      });
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium text-slate-500">Loại thu nhập</p>
        <div className="grid grid-cols-3 gap-2">
          {(categories.income ?? []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCatId(cat.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                catId === cat.id
                  ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                  : "border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-medium text-slate-500">Số tiền</p>
          <div className="flex bg-[#0d1424] rounded-full p-0.5 border border-white/[0.06]">
            {[CURRENCIES.VND, CURRENCIES.JPY].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  currency === cur
                    ? "bg-emerald-500 text-white"
                    : "text-slate-500"
                }`}
              >
                {cur === CURRENCIES.VND ? "₫ VND" : "¥ JPY"}
              </button>
            ))}
          </div>
        </div>
        <AmountInput value={amount} onChange={setAmount} currency={currency} />
        {preview() && (
          <p className="text-xs text-slate-600 mt-1.5 pl-1">{preview()}</p>
        )}
      </div>

      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">
          Ghi chú <span className="text-slate-700">(tùy chọn)</span>
        </p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='VD: "Lương tháng 8", "Freelance dự án X"...'
          className="input-field"
        />
      </div>

      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">Ngày nhận</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : "💰 Nhập vào ví"}
      </button>
    </div>
  );
}

function BudgetBar({ item }) {
  const pct = item.percentage_used ?? 0;
  const isOver = pct >= 100;
  const isWarn = pct >= 80;
  const barColor = isOver
    ? "bg-rose-500"
    : isWarn
      ? "bg-amber-400"
      : "bg-emerald-500";
  const textColor = isOver
    ? "text-rose-400"
    : isWarn
      ? "text-amber-400"
      : "text-slate-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{item.category.icon}</span>
          <span className="text-xs text-slate-300">{item.category.name}</span>
          {isOver && (
            <span className="text-[10px] text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 rounded-full">
              Vượt hạn
            </span>
          )}
        </div>
        <span className={`text-xs font-mono font-medium ${textColor}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-600">
          Đã chi: {formatVND(item.spent_vnd ?? 0)}
        </span>
        <span className="text-[10px] text-slate-600">
          Hạn mức: {formatVND(item.budget?.amount ?? 0)}
        </span>
      </div>
    </div>
  );
}

function TxRow({ tx }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
      <div
        className="flex items-center justify-center flex-shrink-0 text-base w-9 h-9 rounded-xl"
        style={{ backgroundColor: (tx.category?.color ?? "#6B7280") + "20" }}
      >
        {tx.category?.icon ?? "💳"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {tx.category?.name}
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          {formatDate(tx.date)}
        </p>
      </div>
      <p
        className={`text-sm font-mono font-semibold flex-shrink-0 ${
          tx.type === "income" ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {tx.type === "income" ? "+" : "-"}
        {formatVND(tx.amount_vnd)}
      </p>
    </div>
  );
}
