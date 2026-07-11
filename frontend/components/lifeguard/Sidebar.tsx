'use client';

import { useEffect, useState } from 'react';
import { PageView } from '@/app/page';
import {
  Home,
  MessageSquare,
  LayoutDashboard,
  Hospital,
  Shield,
  Menu,
  X,
  ChevronRight,
  PhoneCall,
  Plus,
  Trash2,
  Stethoscope,
  FileText,
  Camera,
  Microscope,
  Pill,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { listSessions, deleteSession, timeAgo, type ChatSession } from '@/lib/chatHistory';

interface SidebarProps {
  page: PageView;
  setPage: (p: PageView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  chatId: string;
  historyVersion: number;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

const navItems = [
  { id: 'home' as PageView, icon: Home, label: 'Home', desc: 'Overview' },
  { id: 'chat' as PageView, icon: MessageSquare, label: 'AI Agent', desc: 'Analyze & chat' },
  { id: 'dashboard' as PageView, icon: LayoutDashboard, label: 'Dashboard', desc: 'Health records' },
  { id: 'hospitals' as PageView, icon: Hospital, label: 'Hospitals', desc: 'Find nearby' },
];

export default function Sidebar({
  page,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  chatId,
  historyVersion,
  onSelectChat,
  onNewChat,
}: SidebarProps) {
  // Loaded after mount (not during SSR) to avoid hydration mismatches.
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  useEffect(() => {
    setSessions(listSessions());
  }, [historyVersion]);

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(listSessions());
    if (id === chatId) onNewChat();
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden rounded-xl bg-white shadow-md border border-[#E3EAF6] p-2 text-[#2E6BE6]"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-30 top-0 left-0 h-full flex flex-col transition-transform duration-300 ease-in-out',
          'w-64 bg-white border-r border-[#E3EAF6]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E3EAF6]">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E6BE6] to-[#1E4FC0] flex items-center justify-center shadow-md shadow-blue-200">
            <Shield size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[#0F1E40] text-sm leading-tight tracking-tight">
              LifeGuard<span className="text-[#2E6BE6]"> NeXus</span>
            </div>
            <div className="text-xs text-[#8B98B5] font-medium">AI Health Agent</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => { setPage(id); setSidebarOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200',
                page === id
                  ? 'bg-[#EAF1FE] text-[#2E6BE6]'
                  : 'text-[#3D4E73] hover:bg-[#F5F8FE] hover:text-[#0F1E40]'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200',
                  page === id
                    ? 'bg-[#2E6BE6] text-white shadow-md shadow-blue-200'
                    : 'bg-[#F5F8FE] text-[#5B6B8C]'
                )}
              >
                <Icon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-semibold leading-tight', page === id ? 'text-[#1E4FC0]' : 'text-[#26355A]')}>
                  {label}
                </div>
                <div className="text-xs text-[#8B98B5] mt-0.5">{desc}</div>
              </div>
              {page === id && <ChevronRight size={14} className="text-[#2E6BE6] flex-shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Care tools — each opens a fresh AI chat ready for that task */}
        <div className="px-3 pb-3">
          <div className="px-2 mb-2 text-[10px] font-bold text-[#8B98B5] uppercase tracking-widest">
            Care tools
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Stethoscope, label: 'Symptoms' },
              { icon: FileText, label: 'Prescription' },
              { icon: Camera, label: 'Injury photo' },
              { icon: Microscope, label: 'Lab report' },
              { icon: Pill, label: 'Medicine ID' },
              { icon: Hospital, label: 'Hospitals', page: 'hospitals' as PageView },
            ].map(({ icon: Icon, label, page: target }) => (
              <button
                key={label}
                onClick={() => {
                  if (target) {
                    setPage(target);
                    setSidebarOpen(false);
                  } else {
                    onNewChat();
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#F5F8FE] hover:bg-[#EAF1FE] border border-transparent hover:border-[#C9D9F5] text-[#3D4E73] hover:text-[#2E6BE6] transition-colors"
              >
                <Icon size={12} className="flex-shrink-0" />
                <span className="text-[11px] font-semibold truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent chats — device-local history */}
        <div className="flex-1 min-h-0 flex flex-col px-3 pb-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-[#8B98B5] uppercase tracking-widest">
              Recent chats
            </span>
            <button
              onClick={onNewChat}
              title="New chat"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#2E6BE6] hover:text-[#1E4FC0] bg-[#EAF1FE] hover:bg-[#DCE8FC] px-2 py-1 rounded-lg transition-colors"
            >
              <Plus size={11} />
              New
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="px-2 text-xs text-[#B9C6E0] leading-relaxed">
              No conversations yet. Your chats are saved on this device only.
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-none space-y-0.5 pr-0.5">
              {sessions.map(s => {
                const active = page === 'chat' && s.id === chatId;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg transition-colors',
                      active ? 'bg-[#EAF1FE]' : 'hover:bg-[#F5F8FE]'
                    )}
                  >
                    <button
                      onClick={() => onSelectChat(s.id)}
                      className="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 text-left"
                    >
                      <MessageSquare
                        size={13}
                        className={cn('flex-shrink-0', active ? 'text-[#2E6BE6]' : 'text-[#B9C6E0]')}
                      />
                      <span
                        className={cn(
                          'flex-1 min-w-0 truncate text-xs font-medium',
                          active ? 'text-[#1E4FC0]' : 'text-[#3D4E73]'
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="flex-shrink-0 text-[10px] text-[#B9C6E0]">{timeAgo(s.updatedAt)}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      title="Delete chat"
                      className="flex-shrink-0 p-1.5 mr-1 rounded-md text-[#B9C6E0] opacity-0 group-hover:opacity-100 hover:text-[#E05252] hover:bg-[#FDEEEE] transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency card — real, always-true utility */}
        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-[#FDEEEE] to-[#FBF3E4] border border-[#F5CFCF]">
          <div className="flex items-center gap-2 mb-1.5">
            <PhoneCall size={14} className="text-[#E05252]" />
            <span className="text-xs font-bold text-[#A33B3B] uppercase tracking-wide">Emergency</span>
          </div>
          <p className="text-xs text-[#8A5050] leading-relaxed mb-2.5">
            Severe chest pain, breathing trouble, or heavy bleeding? Don&rsquo;t wait for the app.
          </p>
          <a
            href="tel:999"
            className="flex items-center justify-center gap-1.5 w-full bg-[#E05252] hover:bg-[#A33B3B] text-white text-sm font-bold py-2 rounded-xl transition-colors shadow-sm shadow-red-200"
          >
            <PhoneCall size={13} />
            Call 999
          </a>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E3EAF6] px-5 py-3.5">
          <p className="text-[10px] leading-relaxed text-[#8B98B5]">
            AI guidance — not a diagnosis. Always consult a qualified doctor.
          </p>
        </div>
      </aside>
    </>
  );
}
