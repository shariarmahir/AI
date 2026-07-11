'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/lifeguard/Sidebar';
import LandingPage from '@/components/lifeguard/LandingPage';
import ChatPage from '@/components/lifeguard/ChatPage';
import DashboardPage from '@/components/lifeguard/DashboardPage';
import dynamic from 'next/dynamic';
import { newSessionId } from '@/lib/chatHistory';
const HospitalsPage = dynamic(() => import('@/components/lifeguard/HospitalsPageComponent'));

export type PageView = 'home' | 'chat' | 'dashboard' | 'hospitals';

export default function Home() {
  const [page, setPage] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Active chat session + a version counter so the sidebar re-reads history
  // from localStorage whenever the chat saves.
  const [chatId, setChatId] = useState<string>(() => newSessionId());
  const [historyVersion, setHistoryVersion] = useState(0);

  const bumpHistory = useCallback(() => setHistoryVersion(v => v + 1), []);

  const openChat = useCallback((id: string) => {
    setChatId(id);
    setPage('chat');
    setSidebarOpen(false);
  }, []);

  const newChat = useCallback(() => {
    setChatId(newSessionId());
    setPage('chat');
    setSidebarOpen(false);
  }, []);

  // Landing page is full-bleed — no sidebar chrome until the user enters the app.
  if (page === 'home') {
    return <LandingPage setPage={setPage} />;
  }

  return (
    <div className="flex h-screen bg-[#F5F8FE] overflow-hidden">
      <Sidebar
        page={page}
        setPage={setPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatId={chatId}
        historyVersion={historyVersion}
        onSelectChat={openChat}
        onNewChat={newChat}
      />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="flex-1 overflow-y-auto scrollbar-none relative">
        {/* Keyed by session id: switching chats remounts with that session's history */}
        {page === 'chat' && (
          <ChatPage
            key={chatId}
            chatId={chatId}
            onHistoryChange={bumpHistory}
            setSidebarOpen={setSidebarOpen}
          />
        )}
        {page === 'dashboard' && <DashboardPage setPage={setPage} onSelectChat={openChat} />}
        {page === 'hospitals' && <HospitalsPage />}
      </main>
    </div>
  );
}
