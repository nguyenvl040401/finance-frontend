import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

// Layout chính — chứa nội dung trang (Outlet) và bottom navigation
export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col max-w-md mx-auto relative">
      {/* Nội dung trang — có padding dưới để không bị bottom nav che */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Thanh điều hướng cố định ở dưới cùng */}
      <BottomNav />
    </div>
  )
}

