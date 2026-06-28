import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import Modal from "../components/ui/Modal";
import AmountInput from "../components/ui/AmountInput";
import { formatVND } from "../utils/currency";
import { currentMonthYear } from "../utils/dateUtils";
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "../utils/constants";

export default function Categories() {
  const { month, year } = currentMonthYear();

  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState("expense");
  const [loading, setLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetTarget, setBudgetTarget] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([
        api.get("/categories"),
        api.get("/budgets", { params: { month, year } }),
      ]);
      setCategories(c.data);
      setBudgets(b.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getBudget = (catId) => budgets.find((b) => b.category?.id === catId);
  const openAdd = () => {
    setEditingCat(null);
    setCatModal(true);
  };
  const openEdit = (cat) => {
    setEditingCat(cat);
    setCatModal(true);
  };
  const openBudget = (cat) => {
    setBudgetTarget(cat);
    setBudgetModal(true);
  };

  const deleteCat = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadAll();
    } catch (e) {
      alert(e.response?.data?.message ?? "Không thể xóa.");
    }
  };

  const deleteBudget = async (budgetId) => {
    // FIX: thêm confirm trước khi xóa ngân sách — nhất quán với deleteCat
    if (!confirm("Xóa ngân sách này?")) return;
    await api.delete(`/budgets/${budgetId}`);
    loadAll();
  };

  const catList = categories[activeTab] ?? [];

  return (
    <div className="px-4 pt-5 pb-6 space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Danh mục</h1>
        <button
          onClick={openAdd}
          className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center
                     shadow-[0_4px_12px_rgba(16,185,129,0.35)] active:scale-90 transition-all"
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

      <div className="tab-bar">
        {[
          ["expense", "Chi tiêu"],
          ["income", "Thu nhập"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            className={`tab-item ${activeTab === val ? "tab-item-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "expense" &&
        budgets.filter((b) => b.budget).length > 0 && (
          <BudgetSummary budgets={budgets} />
        )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {catList.map((cat) => {
            const budget = getBudget(cat.id);
            return (
              <CategoryCard
                key={cat.id}
                cat={cat}
                budget={budget}
                activeTab={activeTab}
                onEdit={() => openEdit(cat)}
                onDelete={() => deleteCat(cat.id)}
                onBudget={() => openBudget(cat)}
                onDeleteBudget={() => deleteBudget(budget?.budget?.id)}
              />
            );
          })}
        </div>
      )}

      <Modal
        isOpen={catModal}
        onClose={() => setCatModal(false)}
        title={editingCat ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <CategoryForm
          initialData={editingCat}
          defaultType={activeTab}
          onSaved={() => {
            setCatModal(false);
            loadAll();
          }}
        />
      </Modal>

      <Modal
        isOpen={budgetModal}
        onClose={() => setBudgetModal(false)}
        title={`Ngân sách — ${budgetTarget?.name}`}
      >
        <BudgetForm
          category={budgetTarget}
          month={month}
          year={year}
          existing={budgetTarget ? getBudget(budgetTarget.id)?.budget : null}
          onSaved={() => {
            setBudgetModal(false);
            setBudgetTarget(null);
            loadAll();
          }}
        />
      </Modal>
    </div>
  );
}

function BudgetSummary({ budgets }) {
  const withData = budgets.filter((b) => b.budget);
  const total = withData.reduce((s, b) => s + (b.budget?.amount ?? 0), 0);
  const spent = withData.reduce((s, b) => s + (b.spent_vnd ?? 0), 0);
  const remain = total - spent;
  const pct = total > 0 ? Math.round((spent / total) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-[#0d1f35] to-[#111827] border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400">
          Tổng ngân sách tháng
        </p>
        <span
          className={`text-xs font-semibold ${pct >= 100 ? "text-rose-400" : pct >= 80 ? "text-amber-400" : "text-emerald-400"}`}
        >
          {pct}% đã dùng
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] text-slate-600 mb-0.5">Hạn mức</p>
          <p className="font-mono text-sm font-semibold text-white">
            {formatVND(total)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-600 mb-0.5">Còn lại</p>
          <p
            className={`text-sm font-semibold font-mono ${remain >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {formatVND(remain)}
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function CategoryCard({
  cat,
  budget,
  activeTab,
  onEdit,
  onDelete,
  onBudget,
  onDeleteBudget,
}) {
  const pct = budget?.percentage_used ?? 0;
  const isOver = pct >= 100;
  const isWarn = pct >= 80;
  const spent = budget?.spent_vnd ?? 0;
  const limit = budget?.budget?.amount ?? 0;

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center flex-shrink-0 text-xl w-11 h-11 rounded-xl"
          style={{ backgroundColor: cat.color + "20" }}
        >
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{cat.name}</p>
            {cat.is_default && (
              <span className="text-[10px] text-slate-600 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded-full">
                mặc định
              </span>
            )}
            {isOver && (
              <span className="text-[10px] text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 rounded-full">
                Vượt hạn
              </span>
            )}
          </div>
          {budget ? (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span
                className={`text-[11px] font-medium ${isOver ? "text-rose-400" : "text-slate-300"}`}
              >
                Đã chi {formatVND(spent)}
              </span>
              <span className="text-[11px] text-slate-700">/</span>
              <span className="text-[11px] text-slate-500">
                hạn mức {formatVND(limit)}
              </span>
            </div>
          ) : (
            activeTab === "expense" && (
              <p className="text-[11px] text-slate-700 mt-0.5">
                Chưa đặt ngân sách
              </p>
            )
          )}
        </div>

        <div className="flex items-center flex-shrink-0 gap-1">
          {activeTab === "expense" && (
            <button
              onClick={onBudget}
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10"
              title="Đặt ngân sách"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}
          {!cat.is_default && (
            <>
              <button
                onClick={onEdit}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600
                           hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </>
          )}
          {budget && activeTab === "expense" && (
            <button
              onClick={onDeleteBudget}
              className="flex items-center justify-center w-8 h-8 text-lg leading-none transition-colors rounded-lg text-slate-700 hover:text-rose-400"
              title="Xóa ngân sách"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {budget && budget.percentage_used !== null && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isOver ? "bg-rose-500" : isWarn ? "bg-amber-400" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-600">
              Còn lại: {formatVND(budget.remaining_vnd ?? 0)}
            </span>
            <span
              className={`text-[10px] font-medium ${isOver ? "text-rose-400" : isWarn ? "text-amber-400" : "text-slate-500"}`}
            >
              {pct}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryForm({ initialData, defaultType, onSaved }) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "📦");
  const [type, setType] = useState(initialData?.type ?? defaultType);
  const [color, setColor] = useState(initialData?.color ?? "#10B981");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Vui lòng nhập tên.");
    setSaving(true);
    setError("");
    try {
      if (initialData)
        await api.put(`/categories/${initialData.id}`, {
          name,
          icon,
          type,
          color,
        });
      else await api.post("/categories", { name, icon, type, color });
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {!initialData && (
        <div className="tab-bar">
          {[
            ["expense", "Chi tiêu"],
            ["income", "Thu nhập"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setType(val)}
              className={`tab-item ${type === val ? "tab-item-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Tên danh mục</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên..."
          className="input-field"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">
          Icon — <span className="text-xl">{icon}</span>
        </p>
        <div className="grid grid-cols-10 gap-1.5 bg-[#0d1424] rounded-xl p-2">
          {CATEGORY_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setIcon(e)}
              className={`aspect-square flex items-center justify-center text-lg rounded-lg transition-all duration-150 ${
                icon === e
                  ? "bg-emerald-500/20 ring-1 ring-emerald-500/40 scale-110"
                  : "hover:bg-white/[0.06]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Màu sắc</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-xl transition-all duration-150 ${
                color === c
                  ? "scale-125 ring-2 ring-white/60 ring-offset-1 ring-offset-[#111827]"
                  : "hover:scale-110 opacity-80"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button onClick={handleSubmit} disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm danh mục"}
      </button>
    </div>
  );
}

function BudgetForm({ category, month, year, existing, onSaved }) {
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [currency, setCurrency] = useState(existing?.currency ?? "VND");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || amount <= 0)
      return setError("Vui lòng nhập số tiền hợp lệ.");
    setSaving(true);
    setError("");
    try {
      await api.post("/budgets", {
        category_id: category.id,
        amount,
        currency,
        month,
        year,
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
      <p className="text-sm text-slate-400">
        Hạn mức chi tiêu cho{" "}
        <strong className="text-white">{category?.name}</strong> tháng {month}/
        {year}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500">Đơn vị:</p>
        <div className="flex bg-[#0d1424] rounded-full p-0.5 border border-white/[0.06]">
          {["VND", "JPY"].map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                currency === cur
                  ? "bg-emerald-500 text-white"
                  : "text-slate-500"
              }`}
            >
              {cur === "VND" ? "₫ VND" : "¥ JPY"}
            </button>
          ))}
        </div>
      </div>
      <AmountInput value={amount} onChange={setAmount} currency={currency} />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button onClick={handleSubmit} disabled={saving} className="btn-primary">
        {saving
          ? "Đang lưu..."
          : existing
            ? "Cập nhật ngân sách"
            : "Đặt ngân sách"}
      </button>
    </div>
  );
}
