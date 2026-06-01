/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User as UserIcon, Menu, X, Shield, Award, Calendar, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openLoginModal }) => {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: ' হোম (Home)' },
    { id: 'gallery', label: 'ফটো গ্যালারি (Gallery)' },
    { id: 'committee', label: 'কমিটি (Committee)' },
  ];

  if (currentUser) {
    navItems.push({ id: 'user-dash', label: 'আমার ড্যাশবোর্ড (My Panel)' });
    if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') {
      navItems.push({ id: 'admin-dash', label: 'অ্যাডমিন ডেস্ক (Admin Desk)' });
    }
  }

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-none w-full px-4 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('home')}>
            <div className="bg-secondary p-2.5 rounded-full flex items-center justify-center shadow-lg border border-white/20">
              <Award className="h-7 w-7 text-primary" strokeWidth={2} />
            </div>
            <div>
              <span className="font-display font-semibold text-lg sm:text-xl tracking-tight block">
                জনকল্যাণ মডেল হাই স্কুল
              </span>
              <span className="text-xs sm:text-sm text-secondary font-mono tracking-widest block font-medium">
                GOLDEN JUBILEE 2026 (৫০ বছর পূর্তি)
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  currentTab === item.id
                    ? 'bg-secondary text-primary font-bold shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Toggles */}
          <div className="hidden lg:flex items-center space-x-3">
            
            {currentUser ? (
              <div className="flex items-center space-x-3.5 border-l border-white/20 pl-4">
                <div className="flex items-center space-x-2">
                  <img
                    id="profile-avatar"
                    src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover border border-secondary shadow-sm"
                  />
                  <div className="text-left leading-tight">
                    <div className="text-sm font-semibold max-w-[120px] truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-secondary font-mono tracking-wider font-medium">{currentUser.role}</div>
                  </div>
                </div>
                <button
                  id="btn-logout"
                  onClick={logout}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                  title="লগ আউট"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-login-trigger"
                onClick={openLoginModal}
                className="bg-secondary text-primary font-bold px-5 py-2.5 rounded-md hover:bg-yellow-400 transition flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>লগইন (Login)</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              id="mobile-menu-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-white/10 focus:outline-none transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-primary/95 border-t border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-mob-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-md text-base font-medium transitionInside text-white ${
                    currentTab === item.id ? 'bg-secondary text-primary font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {currentUser ? (
                <div className="pt-4 pb-2 border-t border-white/20 mt-4 px-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt="avatar"
                      className="h-10 w-10 rounded-full border border-secondary"
                    />
                    <div>
                      <div className="text-base font-medium text-white">{currentUser.name}</div>
                      <div className="text-xs text-secondary font-mono">{currentUser.role}</div>
                    </div>
                  </div>
                  <button
                    id="mobile-btn-logout"
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 bg-white/15 hover:bg-white/20 text-white font-medium py-2.5 rounded-md transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>লগআউট (Logout)</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/15 mt-4 px-3">
                  <button
                    id="mobile-btn-login"
                    onClick={() => {
                      openLoginModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-secondary text-primary font-bold py-2.5 rounded-md transition"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>লগইন করুন (Login)</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
