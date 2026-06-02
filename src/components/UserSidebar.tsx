import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckCircle, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  Bell, 
  AppWindow, 
  Calendar, 
  Settings, 
  Clock 
} from 'lucide-react';

interface SidebarTab {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  badge?: string;
}

interface UserSidebarProps {
  currentUser: any;
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  logout: () => void;
  isApproved: boolean;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  currentUser,
  activeSubTab,
  setActiveSubTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  logout,
  isApproved
}) => {
  const sidebarTabs: SidebarTab[] = [
    { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', subtitle: 'Overview & Status', icon: LayoutDashboard },
    { id: 'notices', label: 'ঘোষণা ও নোটিশ বোর্ড', subtitle: 'Notice Board', icon: Bell },
    { id: 'apply', label: 'আবেদনপত্র সমূহ (Apply)', subtitle: 'Apply Form Panel', icon: AppWindow },
    { id: 'certificate', label: 'স্মারক প্রশংসাপত্র', subtitle: 'Digital Certificate', icon: Award, badge: isApproved ? 'Approved' : 'Pending' },
    { id: 'events', label: 'শ্রেণীভিত্তিক কর্মসূচী', subtitle: 'Jubilee Events', icon: Calendar },
    { id: 'profile', label: 'প্রোফাইল সম্পাদন', subtitle: 'Settings & Photo', icon: Settings },
  ];

  const renderTabButton = (tab: SidebarTab, isMobile: boolean = false) => {
    const Icon = tab.icon;
    const isActive = activeSubTab === tab.id;
    return (
      <button
        key={tab.id}
        id={`${isMobile ? 'user-mob' : 'sidebar'}-subtab-btn-${tab.id}`}
        onClick={() => {
          setActiveSubTab(tab.id);
          if (isMobile) setMobileSidebarOpen(false);
        }}
        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
          isActive 
            ? 'bg-primary text-white font-bold shadow-md shadow-primary/10' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
          <div className="leading-none text-left">
            <span className="text-xs font-semibold block">{tab.label}</span>
            <span className={`text-[9px] font-mono block mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-400 font-medium'}`}>{tab.subtitle}</span>
          </div>
        </div>
        {tab.id === 'certificate' && tab.badge && (
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
            isApproved 
              ? (isActive ? 'bg-white text-green-700' : 'bg-green-100 text-green-800') 
              : (isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800')
          }`}>
            {tab.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <aside id="user-desktop-sidebar" className="hidden lg:flex w-72 shrink-0 flex-col bg-white rounded-2xl border border-gray-150 p-6 shadow-sm sticky top-24 space-y-7 group">
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-gray-100">
          <div className="relative">
            <img
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
              alt="Profile Avatar"
              className="h-20 w-20 rounded-full object-cover border-4 border-secondary/50 shadow-md transform group-hover:scale-105 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {isApproved ? (
              <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Member">
                <CheckCircle className="h-3 w-3" />
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verification Pending">
                <Clock className="h-3 w-3" />
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-gray-900 tracking-tight leading-short">{currentUser.name}</h4>
            <p className="text-[11px] font-semibold text-gray-400 font-mono">SSC Batch {currentUser.batch}</p>
            <div className="inline-flex items-center space-x-1 mt-1 bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase">
              <span>{currentUser.role} Panel</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 font-sans">
          {sidebarTabs.map(tab => renderTabButton(tab))}
        </nav>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <button 
            id="sidebar-btn-logout"
            onClick={logout}
            className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition flex items-center space-x-3 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span>লগ আউট (Sign Out)</span>
          </button>
        </div>
      </aside>

      <div id="user-mobile-header" className="lg:hidden w-full bg-white rounded-xl border border-gray-150 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="user-mobile-sidebar-toggle"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
            title="Open Navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs text-gray-400 font-mono block">আমার ড্যাশবোর্ড / {activeSubTab.toUpperCase()}</span>
            <strong className="text-sm font-bold text-gray-800 block">
              {sidebarTabs.find(t => t.id === activeSubTab)?.label || activeSubTab}
            </strong>
          </div>
        </div>
        
        <img
          src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover border border-secondary shadow-sm"
        />
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative flex flex-col w-80 max-w-[85vw] bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center space-x-1.5 text-primary">
                  <Award className="h-5 w-5 text-secondary" />
                  <span className="font-display font-medium text-sm">মেম্বারশিপ মেনু (Menu)</span>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-bold"
                >
                  X
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 py-4">
                <img
                  src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover border-2 border-secondary/50"
                />
                <div>
                  <h5 className="font-bold text-gray-900 text-sm leading-none">{currentUser.name}</h5>
                  <span className="text-[10px] text-gray-400 font-mono">SSC Batch {currentUser.batch}</span>
                </div>
              </div>

              <nav className="space-y-1.5 flex-1">
                {sidebarTabs.map(tab => renderTabButton(tab, true))}
              </nav>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition flex items-center space-x-3 font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>লগ আউট (Sign Out)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
