import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/ui/Modal";
import AmountInput from "../components/ui/AmountInput";
import { formatVND, formatJPY, formatAmount } from "../utils/currency";
import {
  formatDate,
  today,
  currentMonthYear,
  getRecentMonths,
} from "../utils/dateUtils";

export default function Transactions() {
  const { month: curMonth, year: curYear } = currentMonthYear();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [filterMonth, setFilterMonth] = useState(curMonth);
  const [filterYear, setFilterYear] = useState(curYear);
  const [filterType, setFilterType] = useState("all");

  const months = getRecentMonths();

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions", {
        params: {
          month: filterMonth,
          year: filterYear,
          type: filterType !== "all" ? filterType : undefined,
          per_page: 100,
        },
      });
      setTransactions(res.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterType]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/exchange-rates")]).then(
      ([c, r]) => {
        setCategories(c.data);
        setRate(r.data);
      },
    );
  }, []);

  const grouped = groupByDate(transactions);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount_vnd, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount_vnd, 0);

  // Mặc định mở modal luôn ở tab Chi tiêu — thu nhập đã có chỗ riêng ở Dashboard
  const openAdd = () => {
    setEditingTx(null);
    setShowModal(true);
  };
  const openEdit = (tx) => {
    setEditingTx(tx);
    setShowModal(true);
  };
  const handleSaved = () => {
    setShowModal(false);
    loadTransactions();
  };
  const handleDelete = async (id) => {
    if (!confirm("Xóa giao dịch này?")) return;
    await api.delete(`/transactions/${id}`);
    loadTransactions();
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Giao dịch</h1>
        <button
          onClick={openAdd}
          className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center
                     shadow-[0_4px_12px_rgba(16,185,129,0.35)] active:scale-90 transition-all duration-150"
        >
          <svg
            className="w-5 h-5 text-white"
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
        </button>
      </div>

      {/* Gợi ý nhập thu nhập — link sang Dashboard nếu cần */}
      <Link
        to="/"
        className="flex items-center gap-2.5 bg-emerald-500/[0.06] border border-emerald-500/[0.15]
                   rounded-xl px-3.5 py-2.5 hover:bg-emerald-500/[0.1] transition-colors"
      >
        <span className="text-base">💰</span>
        <p className="flex-1 text-xs text-slate-400">
          Muốn nhập{" "}
          <span className="font-medium text-emerald-400">thu nhập</span> vào ví?
          Vào Tổng quan
        </p>
        <svg
          className="w-3.5 h-3.5 text-slate-600 flex-shrink-0"
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
      </Link>

      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={`${filterMonth}-${filterYear}`}
          onChange={(e) => {
            const [m, y] = e.target.value.split("-");
            setFilterMonth(Number(m));
            setFilterYear(Number(y));
          }}
          className="flex-1 bg-[#111827] border border-white/[0.06] rounded-xl px-3 py-2.5
                     text-sm text-white focus:outline-none focus:border-emerald-500/40 appearance-none"
        >
          {months.map((m) => (
            <option key={m.label} value={`${m.month}-${m.year}`}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="flex bg-[#111827] border border-white/[0.06] rounded-xl overflow-hidden">
          {[
            ["all", "Tất cả"],
            ["income", "Thu"],
            ["expense", "Chi"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterType(val)}
              className={`px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                filterType === val
                  ? val === "income"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : val === "expense"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-white/[0.08] text-white"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-500/[0.08] border border-emerald-500/[0.12] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-1">Tổng thu</p>
          <p className="font-mono text-sm font-semibold text-emerald-400">
            {formatVND(totalIncome)}
          </p>
        </div>
        <div className="bg-rose-500/[0.08] border border-rose-500/[0.12] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-1">Tổng chi</p>
          <p className="font-mono text-sm font-semibold text-rose-400">
            {formatVND(totalExpense)}
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-3 text-4xl">📭</p>
          <p className="mb-4 text-sm text-slate-500">Không có giao dịch nào</p>
          <button
            onClick={openAdd}
            className="text-sm font-medium transition-colors text-emerald-400 hover:text-emerald-300"
          >
            + Thêm giao dịch
          </button>
        </div>
      ) : (
        grouped.map(({ date, items, dayTotal }) => (
          <div key={date} className="space-y-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {formatDate(date)}
              </span>
              <span
                className={`text-xs font-mono font-medium ${dayTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {dayTotal >= 0 ? "+" : ""}
                {formatVND(dayTotal)}
              </span>
            </div>

            <div className="card p-0 overflow-hidden divide-y divide-white/[0.04]">
              {items.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => openEdit(tx)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03]
                             active:bg-white/[0.05] transition-colors text-left"
                >
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
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {tx.note && (
                        <p className="text-[11px] text-slate-600 truncate max-w-[130px]">
                          {tx.note}
                        </p>
                      )}
                      {tx.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-white/[0.06] text-slate-500 px-1.5 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-sm font-mono font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatAmount(tx.amount, tx.currency)}
                    </p>
                    {tx.currency === "JPY" && (
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        ≈ {formatVND(tx.amount_vnd)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTx ? "Sửa giao dịch" : "Thêm chi tiêu"}
      >
        <TransactionForm
          initialData={editingTx}
          categories={categories}
          rate={rate}
          onSaved={handleSaved}
          onDelete={
            editingTx
              ? () => {
                  handleDelete(editingTx.id);
                  setShowModal(false);
                }
              : null
          }
        />
      </Modal>
    </div>
  );
}

// Form thêm/sửa giao dịch — mặc định Chi tiêu, vẫn cho phép chọn Thu nhập nếu cần sửa
function TransactionForm({ initialData, categories, rate, onSaved, onDelete }) {
  const [type, setType] = useState(initialData?.type ?? "expense");
  const [categoryId, setCatId] = useState(initialData?.category?.id ?? "");
  const [amount, setAmount] = useState(initialData?.amount ?? 0);
  const [currency, setCurrency] = useState(initialData?.currency ?? "VND");
  const [note, setNote] = useState(initialData?.note ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [date, setDate] = useState(initialData?.date ?? today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const catList = categories[type] ?? [];

  const previewConverted = () => {
    if (!amount || !rate) return null;
    if (amount <= 0) return null;
    if (currency === "JPY") return `≈ ${formatVND(amount * rate.jpy_to_vnd)}`;
    return `≈ ${formatJPY(amount * rate.vnd_to_jpy)}`;
  };

  const handleTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (tag && !tags.includes(tag)) setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) return setError("Vui lòng chọn danh mục.");
    if (!amount || amount <= 0)
      return setError("Vui lòng nhập số tiền hợp lệ.");

    // FIX: nếu người dùng gõ tag xong rồi bấm Lưu NGAY (không nhấn Enter trước),
    // chữ đang gõ dở trong ô tag sẽ bị mất vì chưa kịp đưa vào mảng `tags`.
    // Gom luôn tag đang gõ dở (nếu có) vào đây trước khi gửi lên server.
    const pendingTag = tagInput.trim().replace(/,/g, "");
    const finalTags =
      pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : tags;

    setSaving(true);
    setError("");
    try {
      const payload = {
        category_id: categoryId,
        type,
        amount,
        currency,
        note: note || null,
        tags: finalTags,
        date,
      };
      if (initialData)
        await api.put(`/transactions/${initialData.id}`, payload);
      else await api.post("/transactions", payload);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab thu/chi — chỉ hiện khi đang SỬA giao dịch thu nhập cũ */}
      {(initialData?.type === "income" || type === "income") && (
        <div className="flex bg-[#0d1424] rounded-xl p-1 gap-1">
          {[
            ["expense", "Chi tiêu"],
            ["income", "Thu nhập"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => {
                setType(val);
                setCatId("");
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                type === val
                  ? val === "income"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                  : "text-slate-600 hover:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Chọn danh mục */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">Danh mục</p>
        <div className="grid grid-cols-4 gap-2">
          {catList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCatId(cat.id)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-150 ${
                categoryId === cat.id
                  ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] text-slate-500 text-center leading-tight line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Số tiền */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-medium text-slate-500">Số tiền</p>
          <div className="flex bg-[#0d1424] rounded-full p-0.5 border border-white/[0.06]">
            {["VND", "JPY"].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 ${
                  currency === cur
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {cur === "VND" ? "₫ VND" : "¥ JPY"}
              </button>
            ))}
          </div>
        </div>
        <AmountInput value={amount} onChange={setAmount} currency={currency} />
        {previewConverted() && (
          <p className="text-xs text-slate-600 mt-1.5 pl-1">
            {previewConverted()}
          </p>
        )}
      </div>

      {/* Ngày */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">Ngày</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Ghi chú */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">Ghi chú</p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thêm ghi chú..."
          className="input-field"
        />
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5">
          Tags <span className="text-slate-700">(Enter để thêm)</span>
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-white/[0.06] text-slate-300 text-xs px-2.5 py-1 rounded-full"
              >
                #{tag}
                <button
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="text-slate-600 hover:text-white ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKey}
          placeholder="Thêm tag..."
          className="text-sm input-field"
        />
      </div>

      {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-3 text-sm font-semibold transition-all duration-150 border rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 active:scale-95"
          >
            Xóa
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 btn-primary"
        >
          {saving ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm chi tiêu"}
        </button>
      </div>
    </div>
  );
}

function groupByDate(transactions) {
  const map = {};
  transactions.forEach((tx) => {
    const d = tx.date;
    if (!map[d]) map[d] = { date: d, items: [], dayTotal: 0 };
    map[d].items.push(tx);
    map[d].dayTotal += tx.type === "income" ? tx.amount_vnd : -tx.amount_vnd;
  });
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}
