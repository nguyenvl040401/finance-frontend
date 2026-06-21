import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cấu hình Vite - build tool cho React
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true → cho phép truy cập từ thiết bị khác trong cùng mạng LAN (điện thoại, máy tính bảng...)
    // Sau khi chạy `npm run dev`, terminal sẽ hiện thêm dòng "Network: http://192.168.x.x:5173"
    // Mở đúng địa chỉ đó trên trình duyệt điện thoại (cùng WiFi với máy tính) để test cảm ứng thật
    host: true,
    // Proxy API trong môi trường dev để tránh lỗi CORS
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})