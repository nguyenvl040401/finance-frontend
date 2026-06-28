// src/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 text-center card">
          <div className="text-4xl">⚠️</div>
          <div>
            <p className="text-lg font-semibold text-white">Có lỗi xảy ra</p>
            <p className="mt-1 text-sm text-white/50">
              Một phần của app gặp sự cố không mong muốn.
            </p>
          </div>

          {/* Chỉ hiện chi tiết lỗi trong môi trường dev */}
          {import.meta.env.DEV && this.state.error && (
            <div className="p-3 text-left border bg-rose-500/10 border-rose-500/20 rounded-xl">
              <p className="font-mono text-xs break-all text-rose-400">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button onClick={this.handleReset} className="w-full btn-primary">
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-1 text-sm transition-colors text-white/40 hover:text-white/70"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
