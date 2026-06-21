/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Nền tối sâu hơn — cảm giác premium hơn
        bg: {
          base: "#080e1a", // Nền chính
          card: "#111827", // Card
          elevated: "#1a2535", // Card nổi / selected
          input: "#0d1424", // Input field
          overlay: "#0a1120", // Modal backdrop
        },
        // Màu thu nhập — emerald tinh tế
        income: {
          DEFAULT: "#10B981",
          light: "#d1fae5",
          dark: "#059669",
          muted: "rgba(16,185,129,0.12)",
          border: "rgba(16,185,129,0.25)",
        },
        // Màu chi tiêu — rose
        expense: {
          DEFAULT: "#F43F5E",
          light: "#ffe4e6",
          dark: "#e11d48",
          muted: "rgba(244,63,94,0.12)",
          border: "rgba(244,63,94,0.25)",
        },
        // Màu cảnh báo ngân sách — amber
        budget: {
          DEFAULT: "#F59E0B",
          light: "#fef3c7",
          dark: "#d97706",
          muted: "rgba(245,158,11,0.12)",
        },
        // Border tinh tế
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          subtle: "rgba(255,255,255,0.04)",
          focus: "rgba(16,185,129,0.4)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
      boxShadow: {
        income: "0 4px 24px rgba(16,185,129,0.3)",
        expense: "0 4px 24px rgba(244,63,94,0.3)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        modal: "0 25px 50px rgba(0,0,0,0.6)",
        "glow-income": "0 0 30px rgba(16,185,129,0.2)",
      },
      backgroundImage: {
        "gradient-income": "linear-gradient(135deg, #10B981, #059669)",
        "gradient-expense": "linear-gradient(135deg, #F43F5E, #e11d48)",
        "gradient-card": "linear-gradient(135deg, #111827, #1a2535)",
        "gradient-hero": "linear-gradient(135deg, #0d1f35, #111827)",
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease-out",
        "spin-slow": "spin 2s linear infinite",
        "pulse-dot": "pulse-dot 0.8s ease-in-out",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
