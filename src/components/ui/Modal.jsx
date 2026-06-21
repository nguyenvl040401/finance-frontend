import React, { useEffect } from "react";
import { createPortal } from "react-dom";

// Modal v7 — FIX DỨT ĐIỂM bằng đơn vị `svh` (small viewport height)
//
// Bối cảnh: v6 dùng `fixed inset-0` nhưng trên một số phiên bản Chrome Android,
// `position: fixed` vẫn được tính theo LAYOUT viewport (kích thước "danh nghĩa"
// bao gồm cả vùng bị thanh địa chỉ che), không phải VISUAL viewport (vùng thực
// sự nhìn thấy) — đây là lý do v6 vẫn chưa đủ để khắc phục triệt để.
//
// GIẢI PHÁP ĐÚNG: CSS có 3 đơn vị viewport hiện đại được thiết kế RIÊNG cho vấn đề này:
//   - `lvh` (large viewport)  = viewport KHI thanh địa chỉ đang ẨN (to nhất)
//   - `svh` (small viewport)  = viewport KHI thanh địa chỉ đang HIỆN (nhỏ nhất, AN TOÀN NHẤT)
//   - `dvh` (dynamic viewport) = tự động chuyển đổi theo trạng thái thực tế (lý tưởng nhất,
//      nhưng một số emulator/trình duyệt cũ chưa hỗ trợ tốt, từng gây lỗi ở bản v1)
//
// Dùng `svh` là lựa chọn AN TOÀN NHẤT: nó luôn giả định trường hợp xấu nhất (thanh địa
// chỉ đang hiện, viewport nhỏ nhất có thể), nên Modal sẽ KHÔNG BAO GIỜ bị tính to hơn
// vùng thực sự nhìn thấy — dù thanh địa chỉ đang ẩn hay hiện, Modal luôn vừa khít,
// nút Lưu luôn nằm trong tầm nhìn ngay từ lần render đầu tiên, không cần JS đo đạc gì cả.
export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    // Overlay dùng 100svh — luôn bằng đúng vùng nhìn thấy NHỎ NHẤT có thể,
    // không bao giờ bị thanh địa chỉ che mất phần dưới
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-end justify-center h-screen p-0 overflow-hidden sm:items-center sm:p-4"
      style={{ height: "100svh" }}
    >
      {/* Backdrop — click để đóng */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Panel chính — max-height: 100% kế thừa từ overlay cha (đã là 100svh an toàn) */}
      <div
        className="relative w-full sm:max-w-md bg-[#111827] border border-white/[0.08]
                   rounded-t-3xl sm:rounded-3xl shadow-2xl
                   flex flex-col"
        style={{ maxHeight: "100%" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center flex-shrink-0 pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header — luôn cố định trên cùng */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500
                       hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content — phần DUY NHẤT cuộn được. min-height: 0 là chìa khóa bắt buộc
            trong flexbox để flex-1 thực sự co lại đúng thay vì tràn ra ngoài cha,
            đảm bảo nút Lưu (luôn ở cuối children) luôn truy cập được bằng cách cuộn
            trong Modal — không phụ thuộc việc trang ngoài Modal đã cuộn hay chưa. */}
        <div
          className="flex-1 px-5 py-4 overflow-y-auto"
          style={{ minHeight: 0 }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
