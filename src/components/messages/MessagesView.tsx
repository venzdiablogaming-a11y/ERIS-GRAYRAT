/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  UserPlus,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  CalendarCheck,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Info,
  X,
  Briefcase,
  Clock,
  ChevronRight,
  Plus,
  Filter,
  Check,
  Building,
  Compass,
  MessageCircle,
  Inbox,
  User,
  PanelRightClose,
  PanelRightOpen,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Radio,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlumni } from '../../context/AlumniContext';
import { UserProfile, ChatThread, ChatMessage } from '../../types';
import { EventEmailNotificationInbox } from './EventEmailNotificationInbox';
import { UserRoleBadge } from '../common/UserRoleBadge';
import { getUserAvatar, handleUserAvatarError } from '../../lib/defaultImages';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    users,
    chats,
    messages,
    events,
    sendMessage,
    activeChatId,
    setActiveChatId,
    markChatAsRead,
    getOrCreateChat,
    setSelectedUserIdForModal,
    setActiveTab,
    showToast
  } = useAlumni();

  // Top view mode: Active chats vs Event Email Notification Inbox
  const [messageViewMode, setMessageViewMode] = useState<'chats' | 'event_emails'>('chats');

  // Command Center Filter Pill: 'all' | 'direct' | 'events' | 'staff' | 'unread'
  const [activeFilterPill, setActiveFilterPill] = useState<'all' | 'direct' | 'events' | 'staff' | 'unread'>('all');

  // Hero Card Tool: 'spectrum' (messaging distribution) | 'lounges' (event cohorts) | 'directory' (search alumni)
  const [selectedHeroTool, setSelectedHeroTool] = useState<'spectrum' | 'lounges' | 'directory'>('spectrum');

  // Text input in active chat
  const [inputMessage, setInputMessage] = useState('');

  // Search within conversations
  const [chatSearch, setChatSearch] = useState('');

  // Modal & Drawer states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDossierDrawer, setShowDossierDrawer] = useState(true);

  // Directory filter in zero-state
  const [contactDirectorySearch, setContactDirectorySearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'verified' | 'staff' | 'classmates'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active chat object - Isolated to currentUser's conversations
  const activeChat = useMemo(() => {
    if (!activeChatId || !currentUser?.uid) return null;
    const found = chats.find(
      (c) =>
        c.id === activeChatId &&
        (c.memberIds || (c as any).participants || []).includes(currentUser.uid)
    );
    return found || null;
  }, [chats, activeChatId, currentUser?.uid]);

  // Recipient user in 1-on-1 direct chat
  const recipientUser = useMemo(() => {
    if (!activeChat || !currentUser || activeChat.isGroupChat || activeChat.isEventChat) return null;
    const otherId = (activeChat.memberIds || (activeChat as any).participants || []).find(
      (id) => id !== currentUser.uid
    );
    return users.find((u) => u.uid === otherId) || null;
  }, [activeChat, currentUser, users]);

  // Associated event for active event group chat
  const activeEvent = useMemo(() => {
    if (!activeChat?.eventId) return null;
    return events.find((e) => e.id === activeChat.eventId) || null;
  }, [activeChat, events]);

  // Group members profile list
  const activeGroupMembers = useMemo(() => {
    if (!activeChat) return [];
    return (activeChat.memberIds || (activeChat as any).participants || [])
      .map((mId) => users.find((u) => u.uid === mId))
      .filter((u): u is UserProfile => Boolean(u));
  }, [activeChat, users]);

  // Current chat messages
  const activeChatMessages = useMemo(() => {
    if (!activeChat) return [];
    return messages[activeChat.id] || [];
  }, [activeChat, messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  // Mark active chat as read when opened
  useEffect(() => {
    if (activeChat) {
      markChatAsRead(activeChat.id);
    }
  }, [activeChat?.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;
    sendMessage(activeChat.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleInsertQuickReply = (text: string) => {
    setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Filtered chats list based on activeFilterPill & chatSearch
  const filteredChats = useMemo(() => {
    if (!currentUser?.uid) return [];
    return chats.filter((c) => {
      const members = c.memberIds || (c as any).participants || [];
      if (!members.includes(currentUser.uid)) return false;

      const isEventOrGroup = c.isGroupChat || c.isEventChat;
      const unread = c.unreadCount?.[currentUser.uid] || 0;

      // Filter by pill tab
      if (activeFilterPill === 'direct' && isEventOrGroup) return false;
      if (activeFilterPill === 'events' && !isEventOrGroup) return false;
      if (activeFilterPill === 'unread' && unread === 0) return false;
      if (activeFilterPill === 'staff') {
        if (isEventOrGroup) return false;
        const otherId = members.find((id) => id !== currentUser.uid);
        const other = users.find((u) => u.uid === otherId);
        if (!other || !['admin', 'superadmin', 'registrar', 'staff'].includes(other.role)) {
          return false;
        }
      }

      // Filter by search query
      if (!chatSearch.trim()) return true;
      const q = chatSearch.toLowerCase();

      if (isEventOrGroup) {
        return (
          (c.groupName && c.groupName.toLowerCase().includes(q)) ||
          (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
        );
      }

      const otherId = members.find((id) => id !== currentUser.uid);
      const other = users.find((u) => u.uid === otherId);
      if (!other) return false;
      return (
        other.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    });
  }, [chats, users, currentUser, activeFilterPill, chatSearch]);

  // Counts for pills
  const chatCounts = useMemo(() => {
    if (!currentUser) return { all: 0, direct: 0, events: 0, staff: 0, unread: 0 };
    const myChats = chats.filter((c) =>
      (c.memberIds || (c as any).participants || []).includes(currentUser.uid)
    );
    const eventsCount = myChats.filter((c) => c.isGroupChat || c.isEventChat).length;
    const directCount = myChats.filter((c) => !c.isGroupChat && !c.isEventChat).length;
    const unreadCount = myChats.filter((c) => (c.unreadCount?.[currentUser.uid] || 0) > 0).length;
    const staffCount = myChats.filter((c) => {
      if (c.isGroupChat || c.isEventChat) return false;
      const otherId = (c.memberIds || []).find((id) => id !== currentUser.uid);
      const other = users.find((u) => u.uid === otherId);
      return other && ['admin', 'superadmin', 'registrar', 'staff'].includes(other.role);
    }).length;

    return { all: myChats.length, direct: directCount, events: eventsCount, staff: staffCount, unread: unreadCount };
  }, [chats, users, currentUser]);

  const totalUnreadCount = chatCounts.unread;

  // Department / Program communication distribution for Bento Tile 2
  const departmentMeters = useMemo(() => {
    const counts: Record<string, number> = {
      CCS: 0,
      CBA: 0,
      COE: 0,
      CAS: 0,
      CTE: 0
    };

    users.forEach((u) => {
      const course = (u.course || '').toLowerCase();
      if (course.includes('information') || course.includes('computer science') || course.includes('it')) counts.CCS++;
      else if (course.includes('business') || course.includes('accountancy') || course.includes('management')) counts.CBA++;
      else if (course.includes('engineering')) counts.COE++;
      else if (course.includes('psychology') || course.includes('arts') || course.includes('science')) counts.CAS++;
      else if (course.includes('education') || course.includes('teacher')) counts.CTE++;
      else counts.CCS++;
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return [
      { name: 'CCS', fullName: 'Information Technology', count: counts.CCS, value: Math.max(18, Math.round((counts.CCS / maxCount) * 100)) },
      { name: 'CBA', fullName: 'Business Administration', count: counts.CBA, value: Math.max(18, Math.round((counts.CBA / maxCount) * 100)) },
      { name: 'COE', fullName: 'Engineering', count: counts.COE, value: Math.max(18, Math.round((counts.COE / maxCount) * 100)) },
      { name: 'CAS', fullName: 'Arts & Sciences', count: counts.CAS, value: Math.max(18, Math.round((counts.CAS / maxCount) * 100)) },
      { name: 'CTE', fullName: 'Teacher Education', count: counts.CTE, value: Math.max(18, Math.round((counts.CTE / maxCount) * 100)) }
    ];
  }, [users]);

  // Dynamic Spectrum data for hero visualizer
  const messagingSpectrum = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    return days.map((day, idx) => {
      const count = Math.max(1, (chatCounts.all * (idx + 1)) % 7 + 2);
      const segments: ('crimson' | 'muted')[] = [];
      const segCount = Math.min(5, Math.max(1, count));
      for (let i = 0; i < segCount; i++) {
        segments.push(i % 2 === 0 ? 'crimson' : 'muted');
      }
      return {
        label: day,
        count,
        segments,
        activeDot: idx === 6 && totalUnreadCount > 0
      };
    });
  }, [chatCounts, totalUnreadCount]);

  // Directory contacts for Zero-State & New Chat Modal
  const directoryContacts = useMemo(() => {
    if (!currentUser) return [];
    return users
      .filter((u) => u.uid !== currentUser.uid)
      .filter((u) => {
        const q = contactDirectorySearch.toLowerCase().trim();
        const matchesSearch =
          !q ||
          u.name.toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.batch || '').toLowerCase().includes(q) ||
          (u.course || '').toLowerCase().includes(q) ||
          (u.company || '').toLowerCase().includes(q);

        let matchesTab = true;
        if (contactFilter === 'verified') {
          matchesTab = !!(u.isVerified || u.verified);
        } else if (contactFilter === 'staff') {
          matchesTab = ['admin', 'superadmin', 'registrar', 'staff'].includes(u.role);
        } else if (contactFilter === 'classmates') {
          matchesTab = Boolean(currentUser.batch && u.batch === currentUser.batch);
        }

        return matchesSearch && matchesTab;
      });
  }, [users, currentUser, contactDirectorySearch, contactFilter]);

  const handleStartConversationWith = (targetUser: UserProfile) => {
    const threadId = getOrCreateChat(targetUser.uid);
    setActiveChatId(threadId);
    setShowNewChatModal(false);
  };

  return (
    <div className="w-full space-y-6 antialiased">
      {/* ========================================================================= */}
      {/* TOP HEADER SECTION (COMMAND CENTER AESTHETIC)                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-sans">
              Direct Messages
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              St. Cecilia's College • Institutional Peer Communications & Cohort Lounges
            </p>
          </div>

          {/* Metric Pill 1: Active Channels */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block leading-tight font-medium">
                Active Channels
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  {chatCounts.all}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">threads</span>
              </div>
            </div>
          </div>

          {/* Metric Pill 2: Unread Dispatches */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
              totalUnreadCount > 0 ? 'border-amber-300 text-amber-700 bg-amber-50/50' : 'border-stone-300 text-stone-700'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block leading-tight font-medium">
                Unread Messages
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-extrabold tracking-tight ${totalUnreadCount > 0 ? 'text-[#8B181B]' : 'text-stone-900'}`}>
                  {totalUnreadCount}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">requiring review</span>
              </div>
            </div>
          </div>

          {/* Metric Pill 3: Event Cohorts */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-700 shrink-0">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block leading-tight font-medium">
                Event Lounges
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  {chatCounts.events}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">cohorts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills + Action Buttons (Command Center Style) */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center p-1 bg-stone-100/90 rounded-full border border-stone-200 shadow-2xs relative">
            <button
              type="button"
              onClick={() => setActiveFilterPill('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterPill === 'all'
                  ? 'bg-[#8B181B] text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeFilterPill === 'all' ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
              }`}>
                {chatCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill('direct')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterPill === 'direct'
                  ? 'bg-[#8B181B] text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>Direct</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeFilterPill === 'direct' ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
              }`}>
                {chatCounts.direct}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill('events')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterPill === 'events'
                  ? 'bg-[#8B181B] text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>Events</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeFilterPill === 'events' ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
              }`}>
                {chatCounts.events}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill('staff')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterPill === 'staff'
                  ? 'bg-[#8B181B] text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>Staff & Officers</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeFilterPill === 'staff' ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
              }`}>
                {chatCounts.staff}
              </span>
            </button>

            {chatCounts.unread > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilterPill('unread')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilterPill === 'unread'
                    ? 'bg-[#8B181B] text-white shadow-xs font-bold'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-white/50'
                }`}
              >
                <span>Unread</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-extrabold animate-pulse">
                  {chatCounts.unread}
                </span>
              </button>
            )}
          </div>

          {/* Mode Switcher: Chats vs Event Bulletins */}
          <div className="flex items-center p-1 bg-stone-100 rounded-full border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setMessageViewMode('chats')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                messageViewMode === 'chats'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Transmissions
            </button>
            <button
              type="button"
              onClick={() => setMessageViewMode('event_emails')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                messageViewMode === 'event_emails'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Bulletins
            </button>
          </div>

          {/* New Dispatch Action Button */}
          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: EVENT EMAIL BULLETINS                                             */}
      {/* ========================================================================= */}
      {messageViewMode === 'event_emails' ? (
        <div className="bg-white rounded-[32px] border border-stone-200 shadow-2xs overflow-hidden p-6">
          <EventEmailNotificationInbox />
        </div>
      ) : (
        <>
          {/* ===================================================================== */}
          {/* HERO BENTO CARD: COMMUNICATIONS RADAR & COHORT LOUNGES                */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.03)] border border-stone-200/90 transition-all duration-300">
            {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
            <div className="h-1 absolute top-0 left-0 right-0 bg-[#8B181B]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
              {/* Left Sub-Card Details */}
              <div className="space-y-4 max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B181B] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 shadow-2xs">
                    Institutional Exchange
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    Encrypted Peer Dispatch
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    Communications Hub
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Direct communication console connecting verified alumni, campus administrators, and reunion cohorts across graduation batches.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Status Chip 1: Active Conversations */}
                  <div className="bg-stone-50/80 rounded-2xl p-3 flex items-center justify-between border border-stone-200/80 shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-stone-800 block">
                        Verified Network
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {users.filter(u => u.isVerified).length} verified alumni directory
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-[#8B181B]">
                      {chatCounts.all} CHANNELS
                    </span>
                  </div>

                  {/* Status Chip 2: Quick Directory launcher */}
                  <div className="bg-stone-50/80 rounded-2xl p-3 flex items-center justify-between border border-stone-200/80 shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-stone-800 block">
                        Peer Dispatch
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Start transmission with classmate
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewChatModal(true)}
                      className="px-2.5 py-1.5 bg-[#8B181B] hover:bg-[#721316] active:scale-95 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Select Peer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Center / Right: Dynamic Visualizer */}
              <div className="flex-1 flex flex-col items-center lg:items-end justify-center gap-3 pt-4 lg:pt-0">
                <div className="flex items-end justify-center lg:justify-end gap-3 sm:gap-4.5 w-full">
                  {/* Tool 1: Messaging Spectrum */}
                  {selectedHeroTool === 'spectrum' && (
                    <div className="flex items-end gap-2.5 sm:gap-4">
                      {messagingSpectrum.map((bar, idx) => (
                        <div
                          key={idx}
                          title={`${bar.label}: Active exchange volume`}
                          className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        >
                          <div className="flex flex-col-reverse gap-1 items-center p-1 rounded-xl group-hover:bg-stone-50 transition-all">
                            {bar.segments.map((seg, sIdx) => {
                              const isTop = sIdx === bar.segments.length - 1;
                              return (
                                <div
                                  key={sIdx}
                                  className={`w-7 sm:w-8 h-6 sm:h-7 rounded-lg transition-all relative ${
                                    seg === 'crimson'
                                      ? 'bg-[#8B181B] shadow-xs'
                                      : 'bg-stone-200/90 border border-stone-200/60'
                                  }`}
                                >
                                  {isTop && bar.activeDot && (
                                    <span className="absolute -top-1 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-[10px] font-medium text-stone-600 mt-1">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tool 2: Active Lounges */}
                  {selectedHeroTool === 'lounges' && (
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-white/60 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 pb-1 border-b border-stone-100">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#8B181B]" />
                          Event Cohort Lounges
                        </span>
                        <span className="text-[10px] font-mono text-[#8B181B] font-bold">
                          {chatCounts.events} active
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {events.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => {
                              const thread = chats.find(c => c.eventId === ev.id);
                              if (thread) setActiveChatId(thread.id);
                            }}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <span className="text-xs font-semibold text-stone-900 truncate">{ev.title}</span>
                            <span className="text-[10px] font-mono text-stone-400 shrink-0">{ev.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tool 3: Peer Directory Quick View */}
                  {selectedHeroTool === 'directory' && (
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-white/60 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800 pb-1 border-b border-stone-100">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          Directory Quick Connect
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {directoryContacts.length} alumni
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {directoryContacts.slice(0, 3).map((u) => (
                          <div
                            key={u.uid}
                            onClick={() => handleStartConversationWith(u)}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={getUserAvatar(u.profilePictureUrl)}
                                alt={u.name}
                                onError={handleUserAvatarError}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                              <span className="text-xs font-semibold text-stone-900 truncate">{u.name}</span>
                            </div>
                            <span className="text-[10px] text-stone-400 shrink-0">Batch {u.batch || 'Alum'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tool Switcher Rail */}
                  <div className="flex flex-col items-center gap-2 pl-3 border-l border-black/5 ml-2 relative">
                    <button
                      type="button"
                      onClick={() => setSelectedHeroTool('spectrum')}
                      title="Messaging Spectrum"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedHeroTool === 'spectrum'
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedHeroTool('lounges')}
                      title="Event Cohort Lounges"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedHeroTool === 'lounges'
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedHeroTool('directory')}
                      title="Quick Connect Directory"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedHeroTool === 'directory'
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM 3 BENTO TILES (CUSTOM COMMUNICATIONS SUITE)                    */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* BENTO TILE 1: Event Cohort Lounges */}
            <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-stone-900 tracking-tight">
                    Cohort Lounges
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#8B181B]">
                    {chatCounts.events} Live
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">
                  Official event attendee channels
                </p>
              </div>

              <div className="space-y-2 py-3">
                {events.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      const thread = chats.find(c => c.eventId === ev.id);
                      if (thread) setActiveChatId(thread.id);
                      else showToast('Join the event to enter the cohort lounge.', 'info');
                    }}
                    className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200/80 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span className="truncate">{ev.title}</span>
                      <span className="text-[10px] font-mono text-[#8B181B]">RSVP Cohort</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{ev.date}</span>
                      <span>{ev.attendeesCount || 12} Cecilians</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[10px] font-medium">
                  {events.length} reunions scheduled
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="font-bold text-[#8B181B] hover:text-[#721316] text-[11px] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Events Hub</span>
                  <ArrowRight className="w-3 h-3 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* BENTO TILE 2: Department Peer Density Radar */}
            <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-stone-900 tracking-tight">
                    Academic Radar
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800">
                    5 Colleges
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">
                  Alumni peer density across programs
                </p>
              </div>

              <div className="flex items-end justify-between gap-2.5 py-4">
                {departmentMeters.map((m, idx) => (
                  <div
                    key={idx}
                    title={`${m.fullName}: ${m.count} alumni in network`}
                    className="flex flex-col items-center gap-1.5 group/tube cursor-pointer"
                  >
                    <div className="w-8 sm:w-9 h-28 rounded-full bg-stone-100 p-1 flex flex-col justify-end relative overflow-hidden border border-stone-200/60">
                      <div
                        style={{ height: `${m.value}%` }}
                        className="w-full rounded-full bg-[#8B181B] text-white flex items-end justify-center pb-1 transition-all duration-500 shadow-xs"
                      >
                        <span className="text-[10px] font-extrabold font-mono">
                          {m.count}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[10px] font-medium">
                  Network density updated live
                </span>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="font-bold text-[#8B181B] hover:text-[#721316] text-[11px] hover:underline cursor-pointer"
                >
                  Browse Network
                </button>
              </div>
            </div>

            {/* BENTO TILE 3: Dispatch Action Queue */}
            <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-stone-900 tracking-tight">
                    Dispatch Queue
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    totalUnreadCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {totalUnreadCount > 0 ? `${totalUnreadCount} Unread` : 'All read'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">
                  Instant communication triage
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-3.5 my-2 border border-stone-200/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${totalUnreadCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`} />
                    <span>Communications Backlog</span>
                  </span>
                  <span className="font-mono text-[10px] text-stone-500 font-bold">
                    {chatCounts.all} active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilterPill('unread')}
                    className="w-full text-left bg-white hover:bg-stone-100 rounded-xl p-2 border border-stone-200/80 cursor-pointer transition-all hover:shadow-2xs active:scale-95"
                  >
                    <span className="text-stone-400 block text-[9px] font-medium">Unread Dispatches</span>
                    <span className="font-extrabold font-mono text-[#8B181B] text-xs">
                      {totalUnreadCount} pending
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterPill('events')}
                    className="w-full text-left bg-white hover:bg-stone-100 rounded-xl p-2 border border-stone-200/80 cursor-pointer transition-all hover:shadow-2xs active:scale-95"
                  >
                    <span className="text-stone-400 block text-[9px] font-medium">Event Channels</span>
                    <span className="font-extrabold font-mono text-stone-900 text-xs">
                      {chatCounts.events} active
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-medium block">
                    Fast Transmission
                  </span>
                  <span className="text-xs font-bold">Encrypted Cecilian Peer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Dispatch</span>
                  <Send className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* MAIN COMMUNICATIONS DECK (3-COLUMN SPLIT CANVAS)                      */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-[32px] border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col md:flex-row h-[760px]">
            
            {/* LEFT RAIL: CHANNELS STREAM (~340px) */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-stone-200/90 flex flex-col shrink-0 bg-[#FAF9F6]/60 ${
                activeChatId ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Search Bar & Stream Header */}
              <div className="p-3.5 border-b border-stone-200/80 space-y-2.5 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif tracking-tight text-stone-900 uppercase">
                    Dispatch Channels
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 tabular-nums">
                    {filteredChats.length} showing
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search alumni or event cohort..."
                    className="w-full pl-8 pr-7 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#8B181B] transition-colors"
                  />
                  {chatSearch && (
                    <button
                      type="button"
                      onClick={() => setChatSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Feed of Chats */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100/90">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      No matching conversations found for this filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewChatModal(true)}
                      className="px-3.5 py-1.5 bg-[#8B181B] text-white rounded-xl text-xs font-semibold hover:bg-[#721316] transition-colors cursor-pointer"
                    >
                      Start New Conversation
                    </button>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const isSelected = activeChat?.id === chat.id;
                    const unread = currentUser && chat.unreadCount ? chat.unreadCount[currentUser.uid] || 0 : 0;
                    const isEventOrGroup = chat.isGroupChat || chat.isEventChat;

                    if (isEventOrGroup) {
                      return (
                        <div
                          key={chat.id}
                          onClick={() => {
                            setActiveChatId(chat.id);
                            markChatAsRead(chat.id);
                          }}
                          className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FAF6EC] border-l-[3px] border-l-[#8B181B]'
                              : 'hover:bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B181B] via-[#991B1B] to-amber-700 text-white flex items-center justify-center shadow-2xs shrink-0">
                            <CalendarCheck className="w-5 h-5 text-amber-200" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-xs font-bold text-stone-900 truncate">
                                {chat.groupName || 'Event Cohort Lounge'}
                              </h3>
                              <span className="text-[10px] font-mono text-stone-400 tabular-nums shrink-0">
                                {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <p className="text-xs text-stone-500 truncate mt-0.5">
                              {chat.lastMessage || 'Channel established.'}
                            </p>

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-[#8B181B] font-semibold flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{(chat.memberIds || (chat as any).participants || []).length} Attendees</span>
                              </span>
                              {unread > 0 && (
                                <span className="px-1.5 py-0.2 bg-[#8B181B] text-white rounded-full text-[10px] font-bold">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 1-on-1 Direct Alumnus Conversation
                    const otherId = (chat.memberIds || []).find((id) => id !== currentUser?.uid);
                    const other = users.find((u) => u.uid === otherId);

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          markChatAsRead(chat.id);
                        }}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-stone-100/90 border-l-[3px] border-l-[#8B181B]'
                            : 'hover:bg-white'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={getUserAvatar(other?.profilePictureUrl)}
                            alt={other?.name}
                            onError={handleUserAvatarError}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-bold text-stone-900 truncate">
                              {other?.name || 'Cecilian Colleague'}
                            </h3>
                            <span className="text-[10px] font-mono text-stone-400 tabular-nums shrink-0">
                              {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                            {chat.lastMessage || 'Direct connection initiated.'}
                          </p>

                          <div className="flex items-center justify-between mt-1 gap-1">
                            <span className="text-[10px] text-stone-500 truncate">
                              {other?.batch ? `Batch ${other.batch}` : other?.role || 'Alumnus'}
                            </span>
                            {unread > 0 && (
                              <span className="px-1.5 py-0.2 bg-[#8B181B] text-white rounded-full text-[10px] font-bold shrink-0">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="p-3 border-t border-stone-200/80 bg-white">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="w-full py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#8B181B]" />
                  <span>Browse Alumni Directory</span>
                </button>
              </div>
            </div>

            {/* CENTER & RIGHT: ACTIVE CONVERSATION CANVAS OR DIRECTORY DESK */}
            <div className={`flex-1 flex flex-col bg-white min-w-0 ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
              {activeChat ? (
                <>
                  {/* Active Header */}
                  <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border-b border-stone-200/90 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveChatId(null)}
                        className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      {activeChat.isGroupChat || activeChat.isEventChat ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B181B] to-amber-700 text-white flex items-center justify-center shadow-2xs shrink-0">
                          <CalendarCheck className="w-5 h-5 text-amber-200" />
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <img
                            src={getUserAvatar(recipientUser?.profilePictureUrl)}
                            alt={recipientUser?.name}
                            onError={handleUserAvatarError}
                            onClick={() => recipientUser && setSelectedUserIdForModal(recipientUser.uid)}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200 cursor-pointer"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                      )}

                      <div className="min-w-0">
                        {activeChat.isGroupChat || activeChat.isEventChat ? (
                          <>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                                {activeChat.groupName || 'Event Cohort Lounge'}
                              </h2>
                              <span className="text-[10px] font-semibold text-[#8B181B] bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded">
                                Event Cohort
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <Users className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{(activeChat.memberIds || (activeChat as any).participants || []).length} Verified Attendees</span>
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2
                                onClick={() => recipientUser && setSelectedUserIdForModal(recipientUser.uid)}
                                className="text-xs sm:text-sm font-bold text-stone-900 hover:text-[#8B181B] transition-colors cursor-pointer truncate"
                              >
                                {recipientUser?.name}
                              </h2>
                              <UserRoleBadge role={recipientUser?.role} size="xs" />
                            </div>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">
                              {recipientUser?.batch ? `Batch ${recipientUser.batch}` : 'Alumnus'}
                              {recipientUser?.course ? ` · ${recipientUser.course}` : ''}
                              {recipientUser?.company ? ` · ${recipientUser.company}` : ''}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeChat.isGroupChat || activeChat.isEventChat ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowMembersModal(true)}
                            className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-medium text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Users className="w-3.5 h-3.5 text-[#8B181B]" />
                            <span className="hidden sm:inline">Roster</span>
                          </button>
                          {activeEvent && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('events')}
                              className="px-2.5 py-1.5 bg-[#8B181B]/10 hover:bg-[#8B181B]/20 text-[#8B181B] rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Event Hub</span>
                            </button>
                          )}
                        </>
                      ) : (
                        recipientUser && (
                          <button
                            type="button"
                            onClick={() => setSelectedUserIdForModal(recipientUser.uid)}
                            className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-medium text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <User className="w-3.5 h-3.5 text-stone-500" />
                            <span className="hidden sm:inline">Profile</span>
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => setShowDossierDrawer(!showDossierDrawer)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          showDossierDrawer
                            ? 'bg-stone-200 border-stone-300 text-stone-900'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                        title={showDossierDrawer ? 'Hide Dossier Panel' : 'Show Dossier Panel'}
                      >
                        {showDossierDrawer ? (
                          <PanelRightClose className="w-4 h-4" />
                        ) : (
                          <PanelRightOpen className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed + Dossier */}
                  <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F6]/30">
                      {/* Message Bubble Feed */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                        <div className="text-center my-2">
                          <span className="px-3 py-1 bg-stone-100 border border-stone-200/80 rounded-full text-[10px] font-medium text-stone-500">
                            {activeChat.isGroupChat || activeChat.isEventChat
                              ? 'Official Event Cohort Channel · Institutional Governance Active'
                              : 'End-to-End Cecilian Peer Dispatch'}
                          </span>
                        </div>

                        {activeChatMessages.length === 0 ? (
                          <div className="text-center py-16 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                              <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="max-w-xs mx-auto space-y-1">
                              <h3 className="text-xs font-bold text-stone-900">
                                No messages recorded yet
                              </h3>
                              <p className="text-[11px] text-stone-500">
                                Send an institutional greeting or inquiry to initiate exchange.
                              </p>
                            </div>
                          </div>
                        ) : (
                          activeChatMessages.map((msg) => {
                            if (msg.isSystemMessage) {
                              return (
                                <div key={msg.id} className="flex justify-center my-2">
                                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-1.5 shadow-2xs max-w-md text-center">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{msg.text}</span>
                                </div>
                              </div>
                            );
                          }

                          const isMine = msg.senderId === currentUser?.uid;
                          const sender = !isMine ? users.find((u) => u.uid === msg.senderId) : null;

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                            >
                              {!isMine && (
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                  {(activeChat.isGroupChat || activeChat.isEventChat) && (
                                    <>
                                      <img
                                        src={getUserAvatar(msg.senderAvatar || sender?.profilePictureUrl)}
                                        alt={msg.senderName || sender?.name}
                                        onError={handleUserAvatarError}
                                        onClick={() => sender && setSelectedUserIdForModal(sender.uid)}
                                        className="w-4 h-4 rounded-full object-cover cursor-pointer"
                                      />
                                      <span
                                        onClick={() => sender && setSelectedUserIdForModal(sender.uid)}
                                        className="text-[11px] font-bold text-stone-800 hover:text-[#8B181B] cursor-pointer"
                                      >
                                        {msg.senderName || sender?.name || 'Attendee'}
                                      </span>
                                    </>
                                  )}
                                  <UserRoleBadge role={msg.senderRole || sender?.role} size="xs" />
                                </div>
                              )}

                              <div
                                className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                  isMine
                                    ? 'bg-[#8B181B] text-white rounded-br-xs shadow-[0_2px_8px_rgba(139,24,27,0.2)]'
                                    : 'bg-white border border-stone-200/90 text-stone-900 rounded-bl-xs shadow-2xs'
                                }`}
                              >
                                {msg.text}
                              </div>

                              <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1 px-1 font-mono tabular-nums">
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isMine && <CheckCheck className="w-3 h-3 text-stone-400" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Response Prompt Suggestions */}
                    <div className="px-3.5 py-1.5 bg-stone-50 border-t border-stone-200/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Prompt:</span>
                      </span>
                      {[
                        '👋 Greetings fellow Cecilian!',
                        '🎓 Are you attending the next campus homecoming?',
                        '🎉 Congratulations on your career advancement!',
                        '💼 Would love to connect regarding opportunities.'
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleInsertQuickReply(prompt)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-200/80 text-[11px] text-stone-700 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Input Composer Form */}
                    <form
                      onSubmit={handleSend}
                      className="p-3.5 bg-white border-t border-stone-200/90 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                          activeChat.isGroupChat || activeChat.isEventChat
                            ? `Dispatch message to ${activeChat.groupName || 'cohort'}...`
                            : `Dispatch message to ${recipientUser?.name || 'alumnus'}...`
                        }
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#8B181B] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-2.5 bg-[#8B181B] hover:bg-[#721316] disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer"
                        aria-label="Send dispatch"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  {/* Right Dossier Rail (Collapsible) */}
                  {showDossierDrawer && (
                    <div className="hidden lg:flex w-72 border-l border-stone-200/90 bg-[#FAF9F6]/80 flex-col p-4 space-y-4 overflow-y-auto shrink-0">
                      {activeChat.isGroupChat || activeChat.isEventChat ? (
                        <div className="space-y-4">
                          <div className="text-center space-y-2 pb-4 border-b border-stone-200/80">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B181B] to-amber-700 text-white flex items-center justify-center mx-auto shadow-sm">
                              <CalendarCheck className="w-7 h-7 text-amber-200" />
                            </div>
                            <h3 className="text-xs font-bold text-stone-900">
                              {activeChat.groupName || 'Event Cohort'}
                            </h3>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Institutional Group Dispatch
                            </span>
                          </div>

                          {activeEvent && (
                            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                Event Particulars
                              </div>
                              <div className="space-y-1 text-stone-700 text-[11px]">
                                <div><strong>Date:</strong> {activeEvent.date}</div>
                                <div><strong>Venue:</strong> {activeEvent.location || 'SCC Campus'}</div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-900">Attendees</span>
                              <span className="font-mono text-stone-500 text-[10px]">
                                {activeGroupMembers.length} verified
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-64 overflow-y-auto">
                              {activeGroupMembers.map((member) => (
                                <div
                                  key={member.uid}
                                  onClick={() => setSelectedUserIdForModal(member.uid)}
                                  className="p-2 bg-white rounded-lg border border-stone-200/70 hover:border-[#8B181B]/40 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <img
                                    src={getUserAvatar(member.profilePictureUrl)}
                                    alt={member.name}
                                    onError={handleUserAvatarError}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-stone-900 truncate">
                                      {member.name}
                                    </div>
                                    <div className="text-[10px] text-stone-400 truncate">
                                      {member.batch ? `Batch ${member.batch}` : member.role}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        recipientUser && (
                          <div className="space-y-4">
                            <div className="text-center space-y-2 pb-4 border-b border-stone-200/80">
                              <img
                                src={getUserAvatar(recipientUser.profilePictureUrl)}
                                alt={recipientUser.name}
                                onError={handleUserAvatarError}
                                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white shadow-sm"
                              />
                              <div>
                                <h3 className="text-xs font-bold text-stone-900">
                                  {recipientUser.name}
                                </h3>
                                <div className="mt-1">
                                  <UserRoleBadge role={recipientUser.role} size="xs" />
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                Academic Pedigree
                              </div>
                              <div className="space-y-1 text-stone-700 text-[11px]">
                                {recipientUser.batch && (
                                  <div><strong>Batch:</strong> Class of {recipientUser.batch}</div>
                                )}
                                {recipientUser.course && (
                                  <div><strong>Program:</strong> {recipientUser.course}</div>
                                )}
                              </div>
                            </div>

                            {(recipientUser.company || recipientUser.currentPosition) && (
                              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                  Current Career
                                </div>
                                <div className="space-y-1 text-stone-700 text-[11px]">
                                  {recipientUser.currentPosition && (
                                    <div><strong>Role:</strong> {recipientUser.currentPosition}</div>
                                  )}
                                  {recipientUser.company && (
                                    <div><strong>Company:</strong> {recipientUser.company}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedUserIdForModal(recipientUser.uid)}
                              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Inspect Public Profile
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ZERO-STATE: ALUMNI DISPATCH DIRECTORY DESK */
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#FAF9F6]/40">
                <div className="max-w-3xl mx-auto space-y-5">
                  <div className="text-center space-y-1.5 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#8B181B]/10 text-[#8B181B] flex items-center justify-center mx-auto shadow-2xs">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold font-serif text-stone-900">
                      Alumni Communications Desk
                    </h2>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Select an existing conversation on the left rail or initiate a verified dispatch to an alumnus below.
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={contactDirectorySearch}
                          onChange={(e) => setContactDirectorySearch(e.target.value)}
                          placeholder="Search alumni by name, course, batch, or company..."
                          className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#8B181B]"
                        />
                      </div>

                      <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-xl text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setContactFilter('all')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            contactFilter === 'all'
                              ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          All ({users.length - 1})
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactFilter('verified')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            contactFilter === 'verified'
                              ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Verified
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactFilter('staff')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            contactFilter === 'staff'
                              ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Staff & Officers
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Directory Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {directoryContacts.map((contact) => (
                      <div
                        key={contact.uid}
                        className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#8B181B]/40 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getUserAvatar(contact.profilePictureUrl)}
                            alt={contact.name}
                            onError={handleUserAvatarError}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {contact.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">
                              {contact.batch ? `Class of ${contact.batch}` : contact.role}
                              {contact.course ? ` · ${contact.course}` : ''}
                            </p>
                            {contact.company && (
                              <p className="text-[10px] text-stone-400 truncate">
                                {contact.currentPosition ? `${contact.currentPosition} at ` : ''}{contact.company}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <UserRoleBadge role={contact.role} size="xs" />
                          <button
                            type="button"
                            onClick={() => handleStartConversationWith(contact)}
                            className="px-3 py-1 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )}

      {/* ========================================================================= */}
      {/* NEW DISPATCH MODAL                                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B181B]/10 text-[#8B181B] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Initiate Peer Dispatch</h3>
                    <p className="text-[11px] text-stone-500">Select an alumnus to start a direct line</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactDirectorySearch}
                  onChange={(e) => setContactDirectorySearch(e.target.value)}
                  placeholder="Search by name, program, batch..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#8B181B]"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-stone-100">
                {directoryContacts.map((contact) => (
                  <div
                    key={contact.uid}
                    onClick={() => handleStartConversationWith(contact)}
                    className="pt-2 flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getUserAvatar(contact.profilePictureUrl)}
                        alt={contact.name}
                        onError={handleUserAvatarError}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">{contact.name}</div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {contact.batch ? `Batch ${contact.batch}` : contact.role} · {contact.course || 'Cecilian'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-[#8B181B] text-white rounded-lg text-[10px] font-semibold shrink-0 cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* GROUP MEMBERS ROSTER MODAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showMembersModal && activeChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Event Cohort Roster</h3>
                    <p className="text-[11px] text-stone-500">{activeGroupMembers.length} verified attendees</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMembersModal(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {activeGroupMembers.map((member) => (
                  <div
                    key={member.uid}
                    onClick={() => {
                      setSelectedUserIdForModal(member.uid);
                      setShowMembersModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200/80 bg-stone-50 hover:bg-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getUserAvatar(member.profilePictureUrl)}
                        alt={member.name}
                        onError={handleUserAvatarError}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">{member.name}</div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {member.batch ? `Batch ${member.batch}` : member.role} · {member.course || 'Cecilian'}
                        </div>
                      </div>
                    </div>
                    <UserRoleBadge role={member.role} size="xs" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
