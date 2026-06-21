import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatVND, formatJPY } from "../utils/currency";
import { getStatsStart, saveStatsStart } from "../utils/dateUtils";

export default function Settings() {
  const { logout } = useAuth();
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api
      .get("/exchange-rates")
      .then((r) => setRate(r.data))
      .catch(console.error)
      .finally(() => setRateLoading(false));
  }, []);

  const refreshRate = async () => {
    setRefreshing(true);
    try {
      await api.post("/exchange-rates/refresh");
      const r = await api.get("/exchange-rates");
      setRate(r.data);
    } catch {
      alert("Không thể cập nhật tỷ giá.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Đăng xuất khỏi ứng dụng?")) return;
    await logout();
  };

  return (
    <div className="px-4 pt-5 pb-8 space-y-6 animate-fade-up">
      <h1 className="text-xl font-bold text-white">Cài đặt</h1>

      {/* Bảo mật */}
      <section className="space-y-2">
        <p className="section-label">Bảo mật</p>
        <div className="p-0 overflow-hidden card">
          <ChangePinForm />
        </div>
      </section>

      {/* MỚI: Mốc thống kê — cấu hình được, không còn hardcode */}
      <section className="space-y-2">
        <p className="section-label">Thống kê</p>
        <div className="p-0 overflow-hidden card">
          <StatsStartForm />
        </div>
      </section>

      {/* Tỷ giá */}
      <section className="space-y-2">
        <p className="section-label">Tỷ giá tiền tệ</p>
        <div className="space-y-4 card">
          {rateLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
            </div>
          ) : rate ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <RateBox
                  label="1 JPY bằng"
                  value={formatVND(rate.jpy_to_vnd)}
                  unit="₫ VND"
                />
                <RateBox
                  label="1.000 VND bằng"
                  value={(rate.vnd_to_jpy * 1000).toFixed(3)}
                  unit="¥ JPY"
                />
              </div>

              <div className="bg-[#0d1424] rounded-xl p-3.5">
                <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mb-3">
                  Bảng quy đổi nhanh
                </p>
                <div className="space-y-2">
                  {[1000, 5000, 10000, 50000].map((jpy) => (
                    <div
                      key={jpy}
                      className="flex items-center justify-between"
                    >
                      <span className="font-mono text-sm text-slate-500">
                        {formatJPY(jpy)}
                      </span>
                      <div className="flex-1 mx-3 border-t border-dashed border-white/[0.06]" />
                      <span className="font-mono text-sm text-white">
                        {formatVND(jpy * rate.jpy_to_vnd)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-600">
                  {rate.last_updated
                    ? `Cập nhật: ${new Date(rate.last_updated).toLocaleString("vi-VN")}`
                    : "Chưa cập nhật"}
                </p>
                <button
                  onClick={refreshRate}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium
                             hover:text-emerald-300 disabled:opacity-50 transition-colors"
                >
                  <span
                    className={`text-base ${refreshing ? "animate-spin" : ""}`}
                  >
                    ↻
                  </span>
                  {refreshing ? "Đang cập nhật..." : "Làm mới"}
                </button>
              </div>
            </>
          ) : (
            <p className="py-4 text-sm text-center text-slate-500">
              Không thể tải tỷ giá
            </p>
          )}
        </div>
      </section>

      {/* Thông tin ứng dụng */}
      <section className="space-y-2">
        <p className="section-label">Ứng dụng</p>
        <div className="p-0 overflow-hidden card">
          <InfoRow icon="💰" label="Finance Manager" value="v1.0.0" />
          <InfoRow icon="🌐" label="Nguồn tỷ giá" value="open.er-api.com" />
          <InfoRow icon="💱" label="Tiền tệ" value="JPY · VND" />
        </div>
      </section>

      <button onClick={handleLogout} className="btn-danger">
        Đăng xuất
      </button>

      <p className="text-center text-[11px] text-slate-700">
        Dữ liệu được lưu trữ an toàn trên server của bạn
      </p>
    </div>
  );
}

// MỚI: Form cấu hình mốc bắt đầu thống kê — lưu xuống DB qua API, không hardcode nữa
function StatsStartForm() {
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load giá trị hiện tại khi mở rộng form lần đầu
  useEffect(() => {
    const cur = getStatsStart();
    setMonth(cur.month);
    setYear(cur.year);
    setLoaded(true);
  }, []);

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = [2024, 2025, 2026, 2027, 2028];

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      await saveStatsStart(month, year);
      setSuccess("Đã lưu! Tải lại trang để áp dụng cho Báo cáo.");
    } catch (e) {
      alert("Không thể lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  const current = getStatsStart();

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
      >
        <div className="w-9 h-9 bg-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4.5 h-4.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">Mốc bắt đầu thống kê</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Hiện tại: Tháng {current.month}/{current.year}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
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
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/[0.04]">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Trang Báo cáo và các dropdown chọn tháng sẽ chỉ hiển thị dữ liệu từ
            mốc này trở đi.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                Tháng
              </p>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="input-field"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                Năm
              </p>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input-field"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {success && (
            <p className="text-xs font-medium text-emerald-400">{success}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !py-3 text-sm"
          >
            {saving ? "Đang lưu..." : "Lưu mốc thống kê"}
          </button>
        </div>
      )}
    </div>
  );
}

function RateBox({ label, value, unit }) {
  return (
    <div className="bg-[#0d1424] rounded-xl p-3.5 text-center">
      <p className="text-[11px] text-slate-600 mb-1.5">{label}</p>
      <p className="font-mono text-lg font-bold leading-tight text-emerald-400">
        {value}
      </p>
      <p className="text-[10px] text-slate-700 mt-1">{unit}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <span className="flex-shrink-0 w-6 text-lg text-center">{icon}</span>
      <p className="flex-1 text-sm text-slate-300">{label}</p>
      <p className="text-sm text-slate-600">{value}</p>
    </div>
  );
}

function ChangePinForm() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!currentPin || !newPin || !confirmPin)
      return setError("Vui lòng điền đầy đủ.");
    if (newPin.length < 4) return setError("PIN mới phải có ít nhất 4 số.");
    if (newPin !== confirmPin) return setError("PIN xác nhận không khớp.");
    setSaving(true);
    try {
      await api.post("/auth/change-pin", {
        current_pin: currentPin,
        new_pin: newPin,
      });
      setSuccess("Đổi mã PIN thành công!");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => {
        setExpanded(false);
        setSuccess("");
      }, 1500);
    } catch (e) {
      setError(e.response?.data?.message ?? "Đổi PIN thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
      >
        <div className="w-9 h-9 bg-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4.5 h-4.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">Đổi mã PIN</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Thay đổi mã bảo vệ ứng dụng
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
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
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/[0.04]">
          <PinInput
            label="PIN hiện tại"
            value={currentPin}
            onChange={setCurrentPin}
            placeholder="Nhập PIN hiện tại"
          />
          <PinInput
            label="PIN mới"
            value={newPin}
            onChange={setNewPin}
            placeholder="Tối thiểu 4 số"
          />
          <PinInput
            label="Xác nhận PIN mới"
            value={confirmPin}
            onChange={setConfirmPin}
            placeholder="Nhập lại PIN mới"
          />

          {error && (
            <p className="text-xs font-medium text-rose-400">{error}</p>
          )}
          {success && (
            <p className="text-xs font-medium text-emerald-400">{success}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary !py-3 text-sm"
          >
            {saving ? "Đang lưu..." : "Xác nhận đổi PIN"}
          </button>
        </div>
      )}
    </div>
  );
}

function PinInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 font-medium mb-1.5">{label}</p>
      <input
        type="password"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        maxLength={8}
        className="input-field font-mono tracking-[0.3em] text-sm"
      />
    </div>
  );
}
