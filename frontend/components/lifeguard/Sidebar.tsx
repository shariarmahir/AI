'use client';

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
  Bell,
  Settings,
  LogOut,
  User,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  page: PageView;
  setPage: (p: PageView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const navItems = [
  { id: 'home' as PageView, icon: Home, label: 'Home', desc: 'Overview' },
  { id: 'chat' as PageView, icon: MessageSquare, label: 'AI Agent', desc: 'Analyze & chat' },
  { id: 'dashboard' as PageView, icon: LayoutDashboard, label: 'Dashboard', desc: 'Health records' },
  { id: 'hospitals' as PageView, icon: Hospital, label: 'Hospitals', desc: 'Find nearby' },
];

export default function Sidebar({ page, setPage, sidebarOpen, setSidebarOpen }: SidebarProps) {
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
        <nav className="flex-1 px-3 py-4 space-y-1">
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

        {/* Health status badge */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-[#E9F7F2] to-[#EAF1FE] border border-[#C9D9F5]">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-[#12A17C]" />
            <span className="text-xs font-semibold text-[#12A17C]">Health Status</span>
          </div>
          <div className="text-xs text-[#3D4E73]">All vitals look normal</div>
          <div className="mt-2 h-1.5 rounded-full bg-[#CFEEE1] overflow-hidden">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#12A17C] to-[#2E6BE6]" />
          </div>
        </div>

        {/* Notification */}
        <div className="mx-3 mb-3">
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E3EAF6] text-[#5B6B8C] hover:bg-[#F5F8FE] transition-colors text-sm">
            <Bell size={15} />
            <span className="flex-1 text-left font-medium">Notifications</span>
            <span className="bg-[#E05252] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </div>

        {/* User footer */}
        <div className="border-t border-[#E3EAF6] px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8C3F5] to-[#2E6BE6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#26355A] truncate">Patient</div>
              <div className="text-xs text-[#8B98B5] truncate">patient@email.com</div>
            </div>
            <button className="text-[#8B98B5] hover:text-[#E05252] transition-colors p-1">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
