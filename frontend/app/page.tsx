'use client';

import { useState } from 'react';
import Sidebar from '@/components/lifeguard/Sidebar';
import LandingPage from '@/components/lifeguard/LandingPage';
import ChatPage from '@/components/lifeguard/ChatPage';
import DashboardPage from '@/components/lifeguard/DashboardPage';
import dynamic from 'next/dynamic';
const HospitalsPage = dynamic(() => import('@/components/lifeguard/HospitalsPageComponent'));

export type PageView = 'home' | 'chat' | 'dashboard' | 'hospitals';

export default function Home() {
  const [page, setPage] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F5F8FE] overflow-hidden">
      <Sidebar
        page={page}
        setPage={setPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="flex-1 overflow-y-auto scrollbar-none relative">
        {page === 'home' && <LandingPage setPage={setPage} />}
        {page === 'chat' && <ChatPage setSidebarOpen={setSidebarOpen} />}
        {page === 'dashboard' && <DashboardPage />}
        {page === 'hospitals' && <HospitalsPage />}
      </main>
    </div>
  );
}
