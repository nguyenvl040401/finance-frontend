import axios from "axios";

// Tạo instance axios với cấu hình mặc định
//
// FIX QUAN TRỌNG: baseURL trước đây hardcode 'http://127.0.0.1:8000/api'.
// Trên DESKTOP, 127.0.0.1 = chính máy tính đó → đúng vào Laravel local → hoạt động.
// Trên MOBILE (truy cập qua http://192.168.x.x:5173), trình duyệt điện thoại hiểu
// 127.0.0.1 là CHÍNH NÓ (điện thoại), không phải máy tính → request gọi vào hư không,
// không hề đi qua Vite proxy → toàn bộ API call từ mobile thất bại (kể cả /auth/verify),
// khiến PIN đúng vẫn báo sai vì thực chất request chưa từng tới được backend thật.
//
// CÁCH SỬA: dùng đường dẫn TƯƠNG ĐỐI '/api' thay vì URL tuyệt đối.
// Khi dùng path tương đối, trình duyệt (dù desktop hay mobile) sẽ tự gọi
// '/api/...' trên ĐÚNG domain đang mở (localhost:5173 hoặc 192.168.x.x:5173),
// và Vite dev server sẽ áp dụng proxy cấu hình trong vite.config.js để forward
// đúng request đó về 127.0.0.1:8000 ở phía MÁY CHỦ (nơi Vite đang chạy),
// không phải phía trình duyệt — nên hoạt động đúng trên mọi thiết bị truy cập.
const api = axios.create({
  // Ưu tiên VITE_API_URL nếu có cấu hình rõ ràng (vd: khi deploy production lên Vercel,
  // trỏ thẳng tới domain Railway thật). Khi dev local, dùng '/api' tương đối để đi qua proxy.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000, // Timeout 15 giây
});

// Interceptor REQUEST: tự động đính kèm Bearer token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor RESPONSE: xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc sai → xóa token và reload để về màn hình PIN
      localStorage.removeItem("auth_token");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default api;
