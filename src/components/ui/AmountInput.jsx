import React from "react";
import {
  formatAmountInput,
  parseFormattedNumber,
} from "../../utils/numberInput";

// Ô nhập số tiền dùng chung — tự format khi gõ (100000 → 100.000)
// Có 2 nút +/- nhỏ để tăng giảm theo bước (step) — không bắt buộc dùng
// value: số thuần (number) — không phải chuỗi đã format
// onChange: nhận về số thuần (number)
export default function AmountInput({
  value,
  onChange,
  currency = "VND",
  placeholder,
  step, // Bước tăng/giảm khi bấm nút — mặc định 10.000 VND hoặc 1.000 JPY
  autoFocus = false,
  onEnter,
}) {
  const displayValue = value ? formatAmountInput(String(value), currency) : "";
  const actualStep = step ?? (currency === "JPY" ? 1000 : 10000);

  const handleInput = (e) => {
    const parsed = parseFormattedNumber(e.target.value);
    onChange(parsed);
  };

  const handleStep = (direction) => {
    const current = value || 0;
    const next = Math.max(0, current + direction * actualStep);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Nút giảm — nhỏ gọn, không chiếm nhiều chỗ */}
      <button
        type="button"
        onClick={() => handleStep(-1)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                   bg-white/[0.04] border border-white/[0.06] text-slate-500
                   hover:bg-white/[0.08] hover:text-white active:scale-90 transition-all duration-100"
        tabIndex={-1}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>

      {/* Input chính — hiển thị số đã format */}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        placeholder={placeholder ?? (currency === "VND" ? "0" : "0")}
        autoFocus={autoFocus}
        className="flex-1 min-w-0 font-mono text-xl text-center input-field"
      />

      {/* Nút tăng */}
      <button
        type="button"
        onClick={() => handleStep(1)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                   bg-white/[0.04] border border-white/[0.06] text-slate-500
                   hover:bg-white/[0.08] hover:text-white active:scale-90 transition-all duration-100"
        tabIndex={-1}
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
      </button>
    </div>
  );
}
