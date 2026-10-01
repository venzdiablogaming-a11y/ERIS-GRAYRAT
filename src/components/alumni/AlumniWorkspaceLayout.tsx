/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  Briefcase,
  ImageIcon,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Search,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ShieldCheck,
  Loader2,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlumni } from '../../context/AlumniContext';
import { useTheme } from '../../lib/theme';
import { DashboardView } from '../dashboard/DashboardView';
import { NetworkView } from '../network/NetworkView';
import { MessagesView } from '../messages/MessagesView';
import { EventsView } from '../events/EventsView';
import { AnnouncementsView } from '../announcements/AnnouncementsView';
import { OpportunitiesView } from '../opportunities/OpportunitiesView';
import { ProfileView } from '../profile/ProfileView';
import { SettingsView } from '../settings/SettingsView';
import { CampusGalleryModal } from '../gallery/CampusGalleryModal';
import { DigitalAlumniCard } from '../profile/DigitalAlumniCard';
import { VerificationGate } from '../common/VerificationGate';
import { getUserAvatar, handleUserAvatarError } from '../../lib/defaultImages';
import { exportAlumniRosterCsv } from '../../services/adminExportService';

export type AlumniModuleId =
  | 'dashboard'
  | 'network'
  | 'messages'
  | 'events'
  | 'announcements'
  | 'opportunities'
  | 'gallery'
  | 'profile'
  | 'settings';

interface AlumniWorkspaceLayoutProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onGoToLanding?: () => void;
}

export const AlumniWorkspaceLayout: React.FC<AlumniWorkspaceLayoutProps> = ({
  onOpenAuth,
  onGoToLanding
}) => {
  const {
    currentUser,
    users,
    activeTab,
    setActiveTab,
    chats,
    events,
    announcements,
    opportunities,
    syncAllDataToCloud,
    isFirestoreSyncing,
    logout,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    showToast
  } = useAlumni();

  const { isDark, toggleTheme } = useTheme();

  // Active module synced with context activeTab
  const currentModule = useMemo<AlumniModuleId>(() => {
    const validModules: AlumniModuleId[] = [
      'dashboard',
      'network',
      'messages',
      'events',
      'announcements',
      'opportunities',
      'gallery',
      'profile',
      'settings'
    ];
    if (validModules.includes(activeTab as AlumniModuleId)) {
      return activeTab as AlumniModuleId;
    }
    return 'dashboard';
  }, [activeTab]);

  const handleSelectModule = (mod: AlumniModuleId) => {
    setActiveTab(mod as any);
  };

  // Sidebar collapse state with persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cecilian_alumni_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cecilian_alumni_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Modals state
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDigitalPassModal, setShowDigitalPassModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Unread messages count
  const unreadMessagesCount = useMemo(() => {
    if (!currentUser || !chats) return 0;
    return chats.reduce((acc, chat) => {
      if (!chat || !chat.unreadCount) return acc;
      return acc + (chat.unreadCount[currentUser.uid] || 0);
    }, 0);
  }, [chats, currentUser]);

  // Active opportunities count
  const activeJobsCount = useMemo(() => {
    return (opportunities || []).filter((o) => o.status === 'active' || o.approvalStatus === 'approved').length;
  }, [opportunities]);

  // Upcoming events count
  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return (events || []).filter((e) => new Date(e.startDate || e.endDate || 0) >= now).length;
  }, [events]);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K jumps to directory search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleSelectModule('network');
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 120);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation sections structure
  const navSections = [
    {
      heading: 'Community & Network',
      items: [
        {
          id: 'dashboard' as AlumniModuleId,
          label: 'Alumni Hub',
          shortLabel: 'Hub',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'network' as AlumniModuleId,
          label: 'Alumni Directory & Network',
          shortLabel: 'Directory',
          icon: Users,
          badge: users.length > 0 ? users.length : null,
          badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-200'
        },
        {
          id: 'messages' as AlumniModuleId,
          label: 'Peer Messages',
          shortLabel: 'Messages',
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
          badgeColor: 'bg-rose-500 text-white font-bold'
        }
      ]
    },
    {
      heading: 'Campus Engagement',
      items: [
        {
          id: 'events' as AlumniModuleId,
          label: 'Campus Reunions & Assemblies',
          shortLabel: 'Reunions',
          icon: Calendar,
          badge: upcomingEventsCount > 0 ? upcomingEventsCount : null,
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-200'
        },
        {
          id: 'announcements' as AlumniModuleId,
          label: 'Institutional Bulletins',
          shortLabel: 'Bulletins',
          icon: Megaphone,
          badge: announcements.length > 0 ? announcements.length : null,
          badgeColor: 'bg-purple-100 text-purple-900 border border-purple-200'
        },
        {
          id: 'gallery' as AlumniModuleId,
          label: 'Campus Heritage Gallery',
          shortLabel: 'Gallery',
          icon: ImageIcon,
          badge: null
        }
      ]
    },
    {
      heading: 'Career Advancement',
      items: [
        {
          id: 'opportunities' as AlumniModuleId,
          label: 'Career Placements & Jobs',
          shortLabel: 'Opportunities',
          icon: Briefcase,
          badge: activeJobsCount > 0 ? activeJobsCount : null,
          badgeColor: 'bg-sky-100 text-sky-900 border border-sky-200'
        }
      ]
    },
    {
      heading: 'Membership & Credentials',
      items: [
        {
          id: 'profile' as AlumniModuleId,
          label: 'My Alumni Profile & Card',
          shortLabel: 'Profile',
          icon: UserIcon,
          badge: null
        },
        {
          id: 'settings' as AlumniModuleId,
          label: 'Account & Privacy Settings',
          shortLabel: 'Settings',
          icon: SettingsIcon,
          badge: null
        }
      ]
    }
  ];

  // Current module label for breadcrumbs
  const currentSectionName = useMemo(() => {
    for (const sec of navSections) {
      const match = sec.items.find((item) => item.id === currentModule);
      if (match) return match.label;
    }
    return 'Alumni Hub';
  }, [currentModule]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#121316] flex flex-col font-sans text-stone-900 dark:text-stone-100 antialiased selection:bg-[#8B181B] selection:text-white">
      {/* ========================================================
          ALUMNI TOP BAR (Matching Admin Workspace Specification)
          ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800 shadow-2xs">
        {/* Institutional St. Cecilia Crimson Accent Line */}
        <div className="h-[2px] w-full bg-[#8B181B] absolute bottom-0 left-0 right-0 pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Institutional Brand Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setShowMobileNav(true)}
              className="lg:hidden p-2 -ml-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Open alumni navigation drawer"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>

            <div
              onClick={() => handleSelectModule('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src="/assets/cecilians-seal.jpg"
                alt="St. Cecilia's College Official Seal"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-stone-200/80 dark:border-stone-700 shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight font-sans">
                    St. Cecilia's College
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-[#8B181B] dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                    Alumni Hub
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium -mt-0.5">
                  Official Global Alumni Network • Class of {currentUser?.batch || '2023'}
                </p>
              </div>
            </div>
          </div>

          {/* Zone 2: Breadcrumbs & Quick Search Omnibar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-4">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium shrink-0">
              <span className="text-stone-400 dark:text-stone-500">Alumni</span>
              <span>/</span>
              <span className="text-stone-900 dark:text-stone-100 font-semibold">{currentSectionName}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSelectModule('network');
                setTimeout(() => {
                  const input = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
                  if (input) input.focus();
                }, 100);
              }}
              className="flex-1 flex items-center justify-between px-3.5 py-1.5 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl border border-stone-200 dark:border-stone-700 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 stroke-[1.75]" />
                <span className="text-stone-400 dark:text-stone-500">Search alumni roster, events, jobs...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-stone-700 text-stone-500 dark:text-stone-300 border border-stone-200 dark:border-stone-600 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Zone 3: Quick Digital Pass, Live Sync, Dark/Light, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Digital Pass Quick Launch Button */}
            <button
              type="button"
              onClick={() => setShowDigitalPassModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Open Digital Alumni ID Card Pass"
            >
              <QrCode className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">My Alumni Pass</span>
            </button>

            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={() => syncAllDataToCloud()}
              disabled={isFirestoreSyncing}
              title="Synchronize database with Firestore cloud"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 border border-stone-200 dark:border-stone-700"
            >
              <Loader2 className={`w-3.5 h-3.5 ${isFirestoreSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{isFirestoreSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            {/* Direct Messages Quick Link */}
            <button
              type="button"
              onClick={() => handleSelectModule('messages')}
              className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 shadow-2xs"
              title="Peer Messages"
            >
              <MessageSquare className="w-4 h-4 stroke-[1.75]" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Universal Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 shadow-2xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[1.75]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300 stroke-[1.75]" />
              )}
            </button>

            {/* Alumnus Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <img
                  src={getUserAvatar(currentUser?.profilePictureUrl)}
                  onError={handleUserAvatarError}
                  alt={currentUser?.name || 'Alumnus'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-700 shadow-2xs"
                />
              </button>

              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{currentUser?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                        Verified Alumnus
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                        {currentUser?.studentId || 'SCC-ALUM'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleSelectModule('profile')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 stroke-[1.75]" />
                      <span>My Alumni Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDigitalPassModal(true)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <QrCode className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 stroke-[1.75]" />
                      <span>Digital Alumni Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectModule('settings')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 stroke-[1.75]" />
                      <span>Account Settings</span>
                    </button>
                    <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        if (onOpenAuth) onOpenAuth('login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN WORKSPACE LAYOUT (Collegiate Left Sidebar + Viewport)
          ======================================================== */}
      <div className="flex-1 flex w-full items-start">
        {/* ======================================================
            DESKTOP ALUMNI SIDEBAR
            ====================================================== */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 sticky top-16 self-start h-[calc(100dvh-4rem)] border-r border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-200 z-30 ${
            isSidebarCollapsed ? 'w-[72px]' : 'w-64 xl:w-72'
          }`}
        >
          {/* Header of Sidebar: Role Context Box */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B181B] dark:text-rose-400 block">
                  Cecilian Alumnus
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block truncate">
                  {currentUser?.course || 'Information Technology'}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0 ml-auto"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 block pb-1">
                    {section.heading}
                  </span>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === 'gallery') {
                          setShowGalleryModal(true);
                        } else {
                          handleSelectModule(item.id);
                        }
                      }}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#8B181B] dark:bg-[#8B181B] text-white shadow-xs font-bold'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums font-mono ${
                            item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer of Sidebar: Quick Alumni Pass & User Identity */}
          <div className="p-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setShowDigitalPassModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2]" />
                <span>Show Alumni Pass</span>
              </button>
            )}

            <div
              onClick={() => handleSelectModule('profile')}
              className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <img
                src={getUserAvatar(currentUser?.profilePictureUrl)}
                onError={handleUserAvatarError}
                alt={currentUser?.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
              />
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 capitalize truncate">
                    Class of {currentUser?.batch || '2023'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ======================================================
            MOBILE NAVIGATION DRAWER
            ====================================================== */}
        <AnimatePresence>
          {showMobileNav && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileNav(false)}
                className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-stone-900 z-50 lg:hidden flex flex-col shadow-2xl border-r border-stone-200 dark:border-stone-800"
              >
                <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/assets/cecilians-seal.jpg"
                      alt="St. Cecilia's Seal"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100">St. Cecilia's College</div>
                      <div className="text-[10px] font-bold text-[#8B181B] dark:text-rose-400 uppercase">Alumni Portal</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileNav(false)}
                    className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.75]" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {navSections.map((sec, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 block pb-1">
                        {sec.heading}
                      </span>
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentModule === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (item.id === 'gallery') {
                                setShowGalleryModal(true);
                              } else {
                                handleSelectModule(item.id);
                              }
                              setShowMobileNav(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                              isActive
                                ? 'bg-[#8B181B] dark:bg-[#8B181B] text-white font-bold'
                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 stroke-[1.75]" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== null && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      if (onOpenAuth) onOpenAuth('login');
                    }}
                    className="w-full py-2 px-3 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.75]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ======================================================
            PRIMARY ALUMNI CONTENT VIEWPORT
            ====================================================== */}
        <main className="flex-1 min-w-0 w-full max-w-full px-3 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto animate-in fade-in duration-200">
            {/* MODULE: Dashboard Overview (Alumni Hub) */}
            {currentModule === 'dashboard' && <DashboardView />}

            {/* MODULE: Alumni Directory & Network */}
            {currentModule === 'network' && (
              <VerificationGate routeName="Alumni Directory & Networking">
                <NetworkView />
              </VerificationGate>
            )}

            {/* MODULE: Direct Peer Messaging */}
            {currentModule === 'messages' && (
              <VerificationGate routeName="Direct Peer Messaging">
                <MessagesView />
              </VerificationGate>
            )}

            {/* MODULE: Campus Reunions & Events */}
            {currentModule === 'events' && (
              <VerificationGate routeName="Campus Reunions & Official Events">
                <EventsView />
              </VerificationGate>
            )}

            {/* MODULE: Institutional Bulletins */}
            {currentModule === 'announcements' && (
              <VerificationGate routeName="Institutional Announcements">
                <AnnouncementsView />
              </VerificationGate>
            )}

            {/* MODULE: Career Opportunities & Jobs */}
            {currentModule === 'opportunities' && (
              <VerificationGate routeName="Career Opportunities & Job Board">
                <OpportunitiesView />
              </VerificationGate>
            )}

            {/* MODULE: Profile & Card */}
            {currentModule === 'profile' && <ProfileView />}

            {/* MODULE: Account Settings */}
            {currentModule === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Digital Alumni Pass Modal */}
      {showDigitalPassModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowDigitalPassModal(false)}
        >
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setShowDigitalPassModal(false)}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DigitalAlumniCard />
          </div>
        </div>
      )}

      {/* Campus Heritage Gallery Modal */}
      <CampusGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
      />
    </div>
  );
};
