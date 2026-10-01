import React, { useState, useEffect, useMemo, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  BookOpen,
  MapPin,
  Briefcase,
  UserCheck,
  Check,
  X,
  ArrowRight,
  MessageSquare,
  Megaphone,
  Compass,
  Building2,
  ChevronRight,
  AlertCircle,
  Bell,
  GraduationCap,
  Radio,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Ticket,
  QrCode,
  Sparkles,
  CheckCircle2,
  Volume2,
  ThumbsUp,
  Heart,
  Share2,
  Image as ImageIcon,
  Award,
  Pin,
  Send,
  Trash2,
  Bookmark,
  Search,
  Filter,
  Flame,
  Plus,
  Camera,
  Upload,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import QRCode from 'qrcode';
import { EventReservation, AlumniEvent, Announcement, Opportunity, InstitutionalFeedPost, FeedComment } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useAlumni } from '../../context/AlumniContext';
import { filterAnnouncementsForUser, calculateProfileCompletion } from '../../services/automationService';
import { getEventReservationStatus } from '../../services/eventReservationService';
import { calculate24HourAlertStatus } from '../../services/eventPushNotificationService';
import { EventAttendance24hBanner } from '../events/EventAttendance24hBanner';
import { validateUploadedFile } from '../../lib/security';
import { getUserAvatar, handleUserAvatarError } from '../../lib/defaultImages';
import { InteractiveHeartReaction, DoubleTapHeartOverlay } from '../common/InteractiveHeartReaction';

const PRESET_CAMPUS_PHOTOS = [
  {
    name: "St. Cecilia's Tower Complex",
    url: '/assets/landing-building-1.jpg',
    desc: 'Modern academic landmark tower'
  },
  {
    name: 'Main Campus Academic Hall',
    url: '/assets/landing-building-2.jpg',
    desc: 'Administration & collegiate classrooms'
  },
  {
    name: 'Courtyard & Student Pavilion',
    url: '/assets/landing-building-3.jpg',
    desc: 'Refurbished open promenade'
  },
  {
    name: "St. Cecilia's College Seal",
    url: '/assets/st-cecilias-college-seal.jpg',
    desc: 'Official Institutional Circular Seal'
  }
];

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends React.Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
  public state: DashboardErrorBoundaryState = { hasError: false };

  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Alumni Hub News Feed recovered from error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            News Feed Display Adjustment
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
            A temporary display adjustment occurred. Click below to restore your alumni news feed.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Reload News Feed
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const DashboardView: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <AlumniNewsFeedView />
    </DashboardErrorBoundary>
  );
};

type FeedFilterType = 'all' | 'announcements' | 'events' | 'posts' | 'opportunities';

interface UnifiedFeedItem {
  id: string;
  type: 'post' | 'announcement' | 'event' | 'opportunity';
  date: Date;
  isPinned?: boolean;
  data: any;
}

const AlumniNewsFeedView: React.FC = () => {
  const {
    currentUser,
    users,
    events,
    reservations,
    announcements,
    opportunities,
    feedPosts,
    addFeedPost,
    toggleHeartFeedPost,
    toggleHeartAnnouncement,
    toggleLikeFeedPost,
    addFeedPostComment,
    deleteFeedPost,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelEventReservation,
    confirmEventAttendance,
    sendTest24HourAlert,
    toggleLikeEvent,
    sendFriendRequest,
    isConnected,
    hasPendingRequestWith,
    setActiveTab,
    getOrCreateChat,
    setSelectedUserIdForModal,
    openEditProfile,
    showToast
  } = useAlumni();

  // Feed Filter & Search
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scc_saved_feed_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [composerType, setComposerType] = useState<'milestone' | 'gallery' | 'announcement'>('milestone');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postMilestoneBadge, setPostMilestoneBadge] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [postTags, setPostTags] = useState('');

  // Comment inputs for posts
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Lightbox & Modals
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState<Announcement | null>(null);
  const [selectedPass, setSelectedPass] = useState<EventReservation | null>(null);
  const [passQrDataUrl, setPassQrDataUrl] = useState<string>('');
  const [reservationToCancel, setReservationToCancel] = useState<EventReservation | null>(null);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  // Acknowledged announcements
  const [acknowledgedAnnouncements, setAcknowledgedAnnouncements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scc_acknowledged_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save bookmarked posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scc_saved_feed_items', JSON.stringify(savedPostIds));
    } catch {}
  }, [savedPostIds]);

  // Generate QR for selected event reservation pass
  useEffect(() => {
    if (selectedPass) {
      QRCode.toDataURL(
        JSON.stringify({
          reservationId: selectedPass.id,
          eventId: selectedPass.eventId,
          name: selectedPass.alumniName,
          seats: selectedPass.totalSeats,
          status: selectedPass.status
        }),
        { width: 240, margin: 2, color: { dark: '#121316', light: '#ffffff' } }
      )
        .then((url) => setPassQrDataUrl(url))
        .catch((err) => console.error('Failed to generate pass QR:', err));
    } else {
      setPassQrDataUrl('');
    }
  }, [selectedPass]);

  // Profile completion status
  const profileCompletion = useMemo(() => {
    if (!currentUser) return { percentage: 100, missingFields: [], isComplete: true };
    return calculateProfileCompletion(currentUser);
  }, [currentUser]);

  // Current user's reservations
  const userReservations = useMemo(() => {
    if (!currentUser) return [];
    return (reservations || []).filter((r) => r.userId === currentUser.uid);
  }, [reservations, currentUser]);

  // Personalized announcements
  const userAnnouncements = useMemo(() => {
    return filterAnnouncementsForUser(announcements, currentUser);
  }, [announcements, currentUser]);

  // Pending incoming friend/connection requests
  const incomingRequests = useMemo(() => {
    return (friendRequests || [])
      .filter((r) => r && r.toUid === currentUser?.uid && r.status === 'pending')
      .map((r) => {
        const sender = (users || []).find((u) => u && u.uid === r.fromUid);
        return { request: r, sender };
      })
      .filter((item) => Boolean(item.sender));
  }, [friendRequests, currentUser, users]);

  // Alumni near you / recommended connections
  const alumniSuggestions = useMemo(() => {
    const allUsers = users || [];
    if (!currentUser) return allUsers.filter((u) => u && u.role === 'alumni').slice(0, 5);
    const userCity = currentUser?.location ? String(currentUser.location).split(',')[0].trim().toLowerCase() : '';
    const sameCity = userCity
      ? allUsers.filter(
          (u) =>
            u &&
            u.uid !== currentUser.uid &&
            u.role === 'alumni' &&
            String(u.location || '').toLowerCase().includes(userCity)
        )
      : [];
    const others = allUsers.filter(
      (u) =>
        u &&
        u.uid !== currentUser.uid &&
        u.role === 'alumni' &&
        (!userCity || !String(u.location || '').toLowerCase().includes(userCity))
    );
    return [...sameCity, ...others].slice(0, 5);
  }, [currentUser, users]);

  // Unified Feed Items Construction (Posts + Announcements + Events + Opportunities)
  const unifiedFeedItems = useMemo<UnifiedFeedItem[]>(() => {
    const items: UnifiedFeedItem[] = [];

    // 1. Alumni Posts & Milestones
    (feedPosts || []).forEach((post) => {
      items.push({
        id: `post-${post.id}`,
        type: 'post',
        date: new Date(post.createdAt || Date.now()),
        isPinned: post.isPinned,
        data: post
      });
    });

    // 2. Official Campus Announcements
    (userAnnouncements || []).forEach((ann) => {
      items.push({
        id: `ann-${ann.id}`,
        type: 'announcement',
        date: new Date(ann.publishedAt || Date.now()),
        isPinned: ann.urgent || ann.pinned,
        data: ann
      });
    });

    // 3. Campus Convocations & Events
    (events || []).forEach((evt) => {
      items.push({
        id: `evt-${evt.id}`,
        type: 'event',
        date: new Date(evt.startDate || Date.now()),
        isPinned: evt.isImportant,
        data: evt
      });
    });

    // 4. Career Opportunities Spotlight
    (opportunities || []).slice(0, 5).forEach((opp) => {
      items.push({
        id: `opp-${opp.id}`,
        type: 'opportunity',
        date: new Date(opp.postedAt || Date.now()),
        isPinned: false,
        data: opp
      });
    });

    // Sort: Pinned items first, then descending chronological order
    return items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.date.getTime() - a.date.getTime();
    });
  }, [feedPosts, userAnnouncements, events, opportunities]);

  // Filtered and Searched Feed
  const filteredFeedItems = useMemo(() => {
    let result = unifiedFeedItems;

    // Filter by tab
    if (activeFilter === 'announcements') {
      result = result.filter((i) => i.type === 'announcement');
    } else if (activeFilter === 'events') {
      result = result.filter((i) => i.type === 'event');
    } else if (activeFilter === 'posts') {
      result = result.filter((i) => i.type === 'post');
    } else if (activeFilter === 'opportunities') {
      result = result.filter((i) => i.type === 'opportunity');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (item.type === 'post') {
          const p = item.data as InstitutionalFeedPost;
          return (
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.authorName.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
            (p.milestoneBadge && p.milestoneBadge.toLowerCase().includes(q))
          );
        }
        if (item.type === 'announcement') {
          const a = item.data as Announcement;
          return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
        }
        if (item.type === 'event') {
          const e = item.data as AlumniEvent;
          return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
        }
        if (item.type === 'opportunity') {
          const o = item.data as Opportunity;
          return o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
        }
        return false;
      });
    }

    return result;
  }, [unifiedFeedItems, activeFilter, searchQuery]);

  // Handlers
  const handleOpenComposer = (type: 'milestone' | 'gallery' | 'announcement') => {
    setComposerType(type);
    if (type === 'milestone') {
      setPostTitle('');
      setPostMilestoneBadge('Career Achievement');
      setPostImageUrl('/assets/st-cecilias-college-seal.jpg');
    } else if (type === 'gallery') {
      setPostTitle('Campus Landmark Update');
      setPostImageUrl('/assets/landing-building-1.jpg');
      setPostMilestoneBadge('');
    } else {
      setPostTitle('Official Institutional Circular');
      setPostMilestoneBadge('');
      setPostImageUrl('');
    }
    setShowComposerModal(true);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showToast('Please provide both a title and text for your update.', 'warning');
      return;
    }

    const tagsArray = postTags
      ? postTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [composerType === 'milestone' ? 'Milestone' : composerType === 'gallery' ? 'Campus Life' : 'Update'];

    const success = addFeedPost({
      postType: composerType,
      title: postTitle.trim(),
      content: postContent.trim(),
      imageUrl: postImageUrl.trim() || undefined,
      milestoneBadge: composerType === 'milestone' ? (postMilestoneBadge.trim() || 'Milestone') : undefined,
      isPinned,
      tags: tagsArray
    });

    if (success) {
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setPostMilestoneBadge('');
      setIsPinned(false);
      setPostTags('');
      setShowComposerModal(false);
      showToast('Post published to alumni news feed!', 'success');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateUploadedFile(file, 'images');
    if (!validation.valid) {
      showToast(validation.error || 'Invalid photo format.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPostImageUrl(event.target?.result as string);
      showToast('Photo attached.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    addFeedPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    showToast('Comment posted.', 'success');
  };

  const handleToggleBookmark = (id: string) => {
    setSavedPostIds((prev) => {
      if (prev.includes(id)) {
        showToast('Removed from saved items', 'info');
        return prev.filter((x) => x !== id);
      }
      showToast('Post saved to your bookmarks!', 'success');
      return [...prev, id];
    });
  };

  const handleAcknowledgeAnnouncement = (id: string) => {
    setAcknowledgedAnnouncements((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('scc_acknowledged_announcements', JSON.stringify(next));
      } catch {}
      showToast(prev.includes(id) ? 'Marked unread' : 'Acknowledged announcement release', 'info');
      return next;
    });
  };

  const handleShare = (title: string, path: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${path}`);
      showToast('Link copied to clipboard!', 'info');
    } else {
      showToast('Shared with alumni network!', 'info');
    }
  };

  // Helper date formatter
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-full pb-12">
      {/* 24-HOUR EMERGENCY / REMINDER BANNER */}
      <div className="mb-4">
        <EventAttendance24hBanner onViewPass={(pass) => setSelectedPass(pass)} />
      </div>

      {/* THREE-COLUMN FACEBOOK-STYLE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT RAIL: ALUMNI IDENTITY CARD & QUICK FEED SHORTCUTS (3 COLS) */}
        {/* ============================================================== */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-20">
          {/* Mini Profile Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden relative">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={getUserAvatar(currentUser?.profilePictureUrl)}
                  alt={currentUser?.name || 'Alumni'}
                  onError={handleUserAvatarError}
                  className="w-12 h-12 rounded-full object-cover border-2 border-stone-100 dark:border-stone-800 shadow-sm"
                />
                {currentUser?.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-stone-900"
                    title="Verified Cecilian Alumnus"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {currentUser?.name || 'Cecilian Alumnus'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {currentUser?.course || 'Graduate Degree'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-[#8B181B] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded border border-rose-200/60 dark:border-rose-900/60">
                    Batch {currentUser?.batch || 'Alumni'}
                  </span>
                  {currentUser?.role !== 'alumni' && (
                    <span className="text-[9px] font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded uppercase">
                      {currentUser?.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CHED Graduate Tracer Study Bar */}
            <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Tracer Record</span>
                <span className="font-bold text-[#8B181B] dark:text-rose-400">
                  {profileCompletion.percentage}%
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-[#8B181B] dark:bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion.percentage}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => openEditProfile()}
                className="mt-2 text-[10px] font-semibold text-[#8B181B] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Update Employment Record</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Feed Filter Shortcuts */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-300 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 stroke-[1.75]" />
                <span>All Updates</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                {unifiedFeedItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('announcements')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'announcements'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-300 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 stroke-[1.75]" />
                <span>Official Bulletins</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#8B181B] dark:text-rose-400 font-bold">
                {userAnnouncements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('events')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'events'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-300 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
                <span>Campus Reunions</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-medium">
                {events.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('posts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'posts'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-300 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 stroke-[1.75]" />
                <span>Peer Milestones</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-medium">
                {feedPosts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('opportunities')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'opportunities'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-300 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 stroke-[1.75]" />
                <span>Career Placements</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 font-medium">
                {opportunities.length}
              </span>
            </button>
          </div>

          {/* Quick Institutional Actions */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-1">
            <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider px-2">
              Your Passes & Vault
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-[#8B181B] dark:text-rose-400 stroke-[1.75]" />
                <span>Digital Alumni ID Card</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('network')}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                <span>Alumni Directory ({users.length})</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[1.75]" />
                <span>Direct Peer Messages</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* CENTER COLUMN: THE MAIN FACEBOOK-STYLE NEWS FEED (6 COLS LG) */}
        {/* ============================================================== */}
        <div className="col-span-1 lg:col-span-9 xl:col-span-6 space-y-4">
          {/* 1. FACEBOOK-STYLE STORIES / HIGHLIGHTS CAROUSEL */}
          <div className="w-full overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-2.5 min-w-max">
              {/* Story 1: Create Story / Post */}
              <div
                onClick={() => handleOpenComposer('milestone')}
                className="group w-28 sm:w-32 h-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer flex flex-col relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="h-28 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
                  <img
                    src={getUserAvatar(currentUser?.profilePictureUrl)}
                    alt={currentUser?.name || 'User'}
                    onError={handleUserAvatarError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#8B181B] text-white flex items-center justify-center ring-4 ring-white dark:ring-stone-900 shadow-md">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 flex items-end justify-center pb-2 px-1 text-center">
                  <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    Share Milestone
                  </span>
                </div>
              </div>

              {/* Story 2: Grand Homecoming 2026 */}
              <div
                onClick={() => setActiveTab('events')}
                className="group w-28 sm:w-32 h-44 rounded-2xl bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80"
                  alt="Homecoming"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white p-0.5 shadow ring-2 ring-[#8B181B]">
                  <img
                    src="/assets/st-cecilias-college-seal.jpg"
                    alt="Seal"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block">DEC 12</span>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2">Grand Alumni Homecoming</p>
                </div>
              </div>

              {/* Story 3: Official Bulletins */}
              <div
                onClick={() => setActiveFilter('announcements')}
                className="group w-28 sm:w-32 h-44 rounded-2xl bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <img
                  src="/assets/landing-building-1.jpg"
                  alt="Campus Tower"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  <Megaphone className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="text-[9px] font-bold text-rose-300 uppercase tracking-wider block">Official</span>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2">Campus Circulars & Memos</p>
                </div>
              </div>

              {/* Story 4: Careers Spotlight */}
              <div
                onClick={() => setActiveTab('opportunities')}
                className="group w-28 sm:w-32 h-44 rounded-2xl bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"
                  alt="Career"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  <Briefcase className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider block">Hiring</span>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2">Lexmark & Corporate Hub</p>
                </div>
              </div>

              {/* Story 5: Campus Heritage */}
              <div
                onClick={() => handleOpenComposer('gallery')}
                className="group w-28 sm:w-32 h-44 rounded-2xl bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <img
                  src="/assets/landing-building-2.jpg"
                  alt="Heritage"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  <Camera className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider block">Gallery</span>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2">Campus Landmarks & Memories</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. "WHAT'S ON YOUR MIND, CECILIAN?" FACEBOOK COMPOSER BOX */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={getUserAvatar(currentUser?.profilePictureUrl)}
                alt={currentUser?.name || 'User'}
                onError={handleUserAvatarError}
                className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
              />
              <button
                type="button"
                onClick={() => handleOpenComposer('milestone')}
                className="flex-1 text-left px-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-750 text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {currentUser?.name
                  ? `What's on your mind, ${currentUser.name.split(' ')[0]}?`
                  : "What's on your mind, Cecilian?"}
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => handleOpenComposer('gallery')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.75]" />
                <span className="hidden sm:inline">Photo / Landmark</span>
                <span className="sm:hidden">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenComposer('milestone')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[1.75]" />
                <span className="hidden sm:inline">Achievement</span>
                <span className="sm:hidden">Milestone</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenComposer('announcement')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-[#8B181B] dark:text-rose-400 stroke-[1.75]" />
                <span className="hidden sm:inline">Official Circular</span>
                <span className="sm:hidden">Notice</span>
              </button>
            </div>
          </div>

          {/* 3. FEED SEARCH & FILTER TABS BAR (MOBILE & DESKTOP) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 stroke-[2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni feed, events, bulletins..."
                className="w-full pl-9 pr-8 py-1.5 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile / Tablet Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {(['all', 'announcements', 'events', 'posts', 'opportunities'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-[#8B181B] text-white shadow-2xs font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-750'
                  }`}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'announcements' && 'Bulletins'}
                  {tab === 'events' && 'Events'}
                  {tab === 'posts' && 'Stories'}
                  {tab === 'opportunities' && 'Jobs'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. PENDING CONNECTION REQUESTS BAR (IF ACTIVE) */}
          {incomingRequests.length > 0 && (
            <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-800 dark:text-amber-400 stroke-[2]" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Connection Requests ({incomingRequests.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('network')}
                  className="text-[11px] font-semibold text-[#8B181B] dark:text-rose-400 hover:underline"
                >
                  Manage all →
                </button>
              </div>

              <div className="space-y-2">
                {incomingRequests.slice(0, 2).map(({ request, sender }) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-3 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getUserAvatar(sender?.profilePictureUrl)}
                        alt={sender?.name || 'Sender'}
                        onError={handleUserAvatarError}
                        className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {sender?.name}
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          Batch {sender?.batch || 'Alumni'} · {sender?.course || 'Graduate'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptFriendRequest(request.id)}
                        className="px-3 py-1 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => declineFriendRequest(request.id)}
                        className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. THE UNIFIED NEWS FEED STREAM */}
          <div className="space-y-4">
            {filteredFeedItems.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                  <Globe className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  No feed updates found
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No releases match "${searchQuery}". Try clearing your search keyword.`
                    : 'Be the first Cecilian to share a campus story, milestone, or announcement!'}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenComposer('milestone')}
                    className="px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                  >
                    Publish First Update
                  </button>
                )}
              </div>
            ) : (
              filteredFeedItems.map((item) => {
                // ==========================================================
                // FEED ITEM TYPE A: ALUMNI SOCIAL & MILESTONE POST
                // ==========================================================
                if (item.type === 'post') {
                  const post = item.data as InstitutionalFeedPost;
                  const isHearted = currentUser ? ((post.hearts || post.likes || []).includes(currentUser.uid)) : false;
                  const heartsCount = (post.hearts || post.likes || []).length;
                  const reactorUids = post.hearts || post.likes || [];
                  const isLiked = isHearted;
                  const isSaved = savedPostIds.includes(post.id);
                  const isAuthorOrAdmin =
                    currentUser &&
                    (currentUser.uid === post.authorId ||
                      currentUser.role === 'admin' ||
                      currentUser.role === 'superadmin');
                  const comments = post.comments || [];
                  const showComments = activeCommentsPostId === post.id;
                  const commentInputVal = commentInputs[post.id] || '';

                  return (
                    <article
                      key={item.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
                    >
                      {/* Post Header */}
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getUserAvatar(post.authorAvatar)}
                            alt={post.authorName}
                            onError={handleUserAvatarError}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0 cursor-pointer"
                            onClick={() => {
                              if (post.authorId) setSelectedUserIdForModal(post.authorId);
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4
                                onClick={() => {
                                  if (post.authorId) setSelectedUserIdForModal(post.authorId);
                                }}
                                className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-[#8B181B] dark:hover:text-rose-400 cursor-pointer truncate"
                              >
                                {post.authorName}
                              </h4>
                              {post.authorRole === 'alumni' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                              {post.milestoneBadge && (
                                <span className="text-[10px] font-bold text-[#8B181B] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/60 px-2 py-0.2 rounded-md">
                                  {post.milestoneBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                              <span>{formatTimeAgo(item.date)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Globe className="w-3 h-3" />
                                Public
                              </span>
                              {post.isPinned && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-[#8B181B] dark:text-rose-400 flex items-center gap-0.5">
                                    <Pin className="w-2.5 h-2.5" />
                                    Pinned
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(post.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSaved
                                ? 'text-[#8B181B] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                            title={isSaved ? 'Bookmarked' : 'Bookmark post'}
                          >
                            <Bookmark className="w-4 h-4 stroke-[1.75]" />
                          </button>
                          {isAuthorOrAdmin && (
                            <button
                              type="button"
                              onClick={() => setPostToDelete({ id: post.id, title: post.title })}
                              className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.75]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3 space-y-2">
                        {post.title && (
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {post.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold text-[#8B181B] dark:text-rose-400 hover:underline cursor-pointer"
                              >
                                #{t.replace(/^#/, '')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Image Media with Double-Tap Heart Reaction */}
                      {post.imageUrl && (
                        <DoubleTapHeartOverlay onTrigger={() => toggleHeartFeedPost(post.id)}>
                          <div
                            onClick={() => setLightboxImage({ url: post.imageUrl!, title: post.title })}
                            className="w-full max-h-[460px] overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer relative group"
                          >
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        </DoubleTapHeartOverlay>
                      )}

                      {/* Engagement Counters Bar */}
                      <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
                        <div className="flex items-center gap-1.5">
                          {heartsCount > 0 && (
                            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                                <Heart className="w-3 h-3 fill-current" />
                              </span>
                              <span className="font-semibold text-stone-800 dark:text-stone-200">
                                {heartsCount}
                              </span>
                              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                                {heartsCount === 1 ? 'heart' : 'hearts'}
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          {comments.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveCommentsPostId((prev) => (prev === post.id ? null : post.id))
                              }
                              className="hover:underline cursor-pointer"
                            >
                              {comments.length} comment{comments.length === 1 ? '' : 's'}
                            </button>
                          )}
                          <span>{(post.sharesCount || 0) + 1} shares</span>
                        </div>
                      </div>

                      {/* Interactive Action Buttons: Heart Reaction, Comment, Share */}
                      <div className="px-2 py-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1.5">
                        <div className="flex-1">
                          <InteractiveHeartReaction
                            isHearted={isHearted}
                            heartsCount={heartsCount}
                            onToggle={() => toggleHeartFeedPost(post.id)}
                            reactorUids={reactorUids}
                            allUsers={users}
                            variant="button"
                            label={isHearted ? 'Hearted' : 'Heart'}
                            className="w-full"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveCommentsPostId((prev) => (prev === post.id ? null : post.id))
                          }
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 stroke-[1.75]" />
                          <span>Comment</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(post.title, `/#feed-${post.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 stroke-[1.75]" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Inline Comments Thread */}
                      {showComments && (
                        <div className="p-4 bg-stone-50/70 dark:bg-stone-850/60 border-t border-stone-100 dark:border-stone-800 space-y-3">
                          {/* Add comment input */}
                          <div className="flex items-center gap-2">
                            <img
                              src={getUserAvatar(currentUser?.profilePictureUrl)}
                              alt="Me"
                              onError={handleUserAvatarError}
                              className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
                            />
                            <div className="flex-1 flex items-center gap-1.5 bg-white dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700 px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-[#8B181B]/20">
                              <input
                                type="text"
                                value={commentInputVal}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendComment(post.id);
                                  }
                                }}
                                placeholder="Write a collegiate comment..."
                                className="flex-1 text-xs bg-transparent text-stone-800 dark:text-stone-100 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendComment(post.id)}
                                disabled={!commentInputVal.trim()}
                                className="p-1 text-[#8B181B] dark:text-rose-400 disabled:opacity-30 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Existing comments list */}
                          {comments.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {comments.map((cmt) => (
                                <div key={cmt.id} className="flex items-start gap-2">
                                  <img
                                    src={getUserAvatar(cmt.authorAvatar)}
                                    alt={cmt.authorName}
                                    onError={handleUserAvatarError}
                                    className="w-6 h-6 rounded-full object-cover border border-stone-200 shrink-0 mt-0.5"
                                  />
                                  <div className="flex-1 bg-white dark:bg-stone-800 p-2 rounded-xl border border-stone-200/70 dark:border-stone-700 text-xs">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-stone-900 dark:text-stone-100">
                                        {cmt.authorName}
                                      </span>
                                      <span className="text-[10px] text-stone-400">
                                        {formatTimeAgo(new Date(cmt.createdAt))}
                                      </span>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 mt-0.5 leading-relaxed">
                                      {cmt.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                }

                // ==========================================================
                // FEED ITEM TYPE B: OFFICIAL CAMPUS ANNOUNCEMENT / BULLETIN
                // ==========================================================
                if (item.type === 'announcement') {
                  const ann = item.data as Announcement;
                  const isUrgent = ann.urgent || ann.important;
                  const isAcked = acknowledgedAnnouncements.includes(ann.id);

                  return (
                    <article
                      key={item.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200 border-l-4 border-l-[#8B181B]"
                    >
                      {/* Official Institutional Header */}
                      <div className="p-4 flex items-start justify-between gap-3 bg-stone-50/50 dark:bg-stone-850/40 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#8B181B] to-amber-600 shadow-sm shrink-0 flex items-center justify-center">
                            <img
                              src="/assets/st-cecilias-college-seal.jpg"
                              alt="SCC Seal"
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                                St. Cecilia's College Official Circular
                              </h4>
                              <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-1.5 py-0.2 rounded uppercase">
                                {ann.category || 'Institutional'}
                              </span>
                              {isUrgent && (
                                <span className="text-[9px] font-bold text-white bg-[#8B181B] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  URGENT
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                              Issued by {ann.authorName || 'Office of Alumni Affairs'} • {formatTimeAgo(item.date)}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 shrink-0">
                          {ann.views || 180} views
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                          {ann.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line line-clamp-4">
                          {ann.content}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-4 py-3 bg-stone-50/50 dark:bg-stone-850/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <InteractiveHeartReaction
                            isHearted={Boolean(currentUser && (ann.hearts || []).includes(currentUser.uid))}
                            heartsCount={(ann.hearts || []).length || ann.likes || 0}
                            onToggle={() => toggleHeartAnnouncement(ann.id)}
                            reactorUids={ann.hearts || []}
                            allUsers={users}
                            size="sm"
                            variant="button"
                            label={currentUser && (ann.hearts || []).includes(currentUser.uid) ? 'Hearted' : 'Heart'}
                          />

                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAnnouncement(ann.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isAcked
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                            <span>{isAcked ? 'Acknowledged' : 'Acknowledge Circular'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(ann.title, `/#announcement-${ann.id}`)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                            title="Share Circular"
                          >
                            <Share2 className="w-4 h-4 stroke-[1.75]" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedAnnouncementModal(ann)}
                          className="text-xs font-semibold text-[#8B181B] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Read Full Release</span>
                          <ChevronRight className="w-3 h-3 stroke-[2]" />
                        </button>
                      </div>
                    </article>
                  );
                }

                // ==========================================================
                // FEED ITEM TYPE C: CAMPUS EVENT / REUNION INVITATION
                // ==========================================================
                if (item.type === 'event') {
                  const evt = item.data as AlumniEvent;
                  const eventDate = new Date(evt.startDate);
                  const isValidDate = !isNaN(eventDate.getTime());
                  const statusObj = getEventReservationStatus(evt);
                  const myReservation = userReservations.find(
                    (r) => r.eventId === evt.id && r.status !== 'cancelled'
                  );
                  const isReserved = Boolean(myReservation);
                  const isLiked = currentUser ? (evt.likes || []).includes(currentUser.uid) : false;

                  return (
                    <article
                      key={item.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
                    >
                      {/* Event Banner & Date badge */}
                      <div className="relative h-44 sm:h-52 w-full bg-stone-900 overflow-hidden">
                        <img
                          src={
                            evt.heroImageUrl ||
                            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80'
                          }
                          alt={evt.title}
                          className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Calendar Block (Classic FB Event Card) */}
                        <div className="absolute top-4 left-4 bg-white dark:bg-stone-900 rounded-xl overflow-hidden shadow-lg border border-stone-200/80 text-center min-w-[52px]">
                          <span className="block bg-[#8B181B] text-white text-[9px] font-bold uppercase tracking-wider py-0.5">
                            {isValidDate ? eventDate.toLocaleString('default', { month: 'short' }) : 'OCT'}
                          </span>
                          <span className="block text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 py-1 font-serif leading-none">
                            {isValidDate ? eventDate.getDate() : '24'}
                          </span>
                        </div>

                        {/* Event Tags */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 shadow backdrop-blur-xs">
                            {evt.isVirtual ? 'Virtual Convocation' : 'Campus Gathering'}
                          </span>
                        </div>

                        {/* Event Title Over Banner */}
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <div className="flex items-center gap-2 text-[11px] text-amber-300 font-semibold mb-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {isValidDate
                                ? eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
                                : 'Scheduled'}
                              {evt.startTime ? ` • ${evt.startTime}` : ''}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-tight drop-shadow">
                            {evt.title}
                          </h3>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                          <MapPin className="w-4 h-4 text-[#8B181B] dark:text-rose-400 shrink-0" />
                          <span className="truncate">{evt.venue || evt.location}</span>
                        </div>

                        {evt.tagline && (
                          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 italic">
                            "{evt.tagline}"
                          </p>
                        )}

                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>

                        {/* Attendance Counter Gauge */}
                        <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200/70 dark:border-stone-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {evt.attendeesCount || 147} Cecilians Registered
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#8B181B] dark:text-rose-400">
                            {statusObj.availableSeats} Seats Open
                          </span>
                        </div>
                      </div>

                      {/* Event Actions Bar */}
                      <div className="px-4 py-3 bg-stone-50/50 dark:bg-stone-850/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <InteractiveHeartReaction
                            isHearted={isLiked}
                            heartsCount={(evt.likes || []).length}
                            onToggle={() => toggleLikeEvent(evt.id)}
                            reactorUids={evt.likes || []}
                            allUsers={users}
                            size="sm"
                            variant="button"
                            label={isLiked ? 'Hearted' : 'Heart'}
                          />

                          <button
                            type="button"
                            onClick={() => handleShare(evt.title, `/#event-${evt.id}`)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {isReserved ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedPass(myReservation!)}
                                className="px-3.5 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>View QR Pass</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setReservationToCancel(myReservation!)}
                                className="px-2.5 py-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold cursor-pointer"
                              >
                                Cancel Seat
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab('events')}
                              className="px-4 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>Reserve Seat / RSVP</span>
                              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }

                // ==========================================================
                // FEED ITEM TYPE D: CAREER OPPORTUNITY SPOTLIGHT
                // ==========================================================
                if (item.type === 'opportunity') {
                  const opp = item.data as Opportunity;

                  return (
                    <article
                      key={item.id}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
                    >
                      <div className="p-4 flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 stroke-[1.75]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                              Corporate Partner Hiring
                            </span>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                              {opp.company}
                            </h4>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500">
                              {opp.location} • {formatTimeAgo(item.date)}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-lg shrink-0">
                          {opp.type}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                          {opp.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                          {opp.description}
                        </p>

                        {opp.skills && opp.skills.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {opp.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 bg-stone-50/50 dark:bg-stone-850/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          {opp.salaryOrStipend || 'Competitive Salary + Benefits'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('opportunities')}
                          className="px-4 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          View Job & Apply
                        </button>
                      </div>
                    </article>
                  );
                }

                return null;
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT RAIL: UPCOMING CONVOCATIONS, ACTIVE MEMOS, PEERS (3 COLS) */}
        {/* ============================================================== */}
        <aside className="hidden xl:flex xl:col-span-3 flex-col gap-4 sticky top-20">
          {/* Widget 1: Upcoming Convocations */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B181B] dark:text-rose-400 stroke-[2]" />
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Upcoming Convocations
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-[10px] font-bold text-[#8B181B] dark:text-rose-400 hover:underline"
              >
                Calendar →
              </button>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 3).map((evt) => {
                const date = new Date(evt.startDate);
                const isValid = !isNaN(date.getTime());
                return (
                  <div
                    key={evt.id}
                    onClick={() => setActiveTab('events')}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold uppercase tracking-wider text-[#8B181B] dark:text-rose-400 leading-none">
                        {isValid ? date.toLocaleString('default', { month: 'short' }) : 'EVT'}
                      </span>
                      <span className="text-xs font-bold leading-tight mt-0.5">
                        {isValid ? date.getDate() : '--'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate hover:text-[#8B181B]">
                        {evt.title}
                      </h5>
                      <p className="text-[10px] text-stone-400 truncate">{evt.venue || evt.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Cecilians in Your Vicinity / Directory */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Recommended Alumni
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('network')}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                All ({users.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {alumniSuggestions.map((alumnus) => {
                const connected = isConnected(alumnus.uid);
                const reqStatus = hasPendingRequestWith(alumnus.uid);

                return (
                  <div key={alumnus.uid} className="flex items-center justify-between gap-2 min-w-0">
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => setSelectedUserIdForModal(alumnus.uid)}
                    >
                      <img
                        src={getUserAvatar(alumnus.profilePictureUrl)}
                        alt={alumnus.name}
                        onError={handleUserAvatarError}
                        className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate hover:text-[#8B181B]">
                          {alumnus.name}
                        </h5>
                        <p className="text-[10px] text-stone-400 truncate">
                          Batch {alumnus.batch || 'Alumni'} · {alumnus.course || 'Graduate'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {connected ? (
                        <button
                          type="button"
                          onClick={() => {
                            getOrCreateChat(alumnus.uid);
                            setActiveTab('messages');
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg cursor-pointer"
                        >
                          Chat
                        </button>
                      ) : reqStatus === 'sent' ? (
                        <span className="text-[10px] text-stone-400 font-semibold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
                          Sent
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendFriendRequest(alumnus.uid)}
                          className="px-2.5 py-0.5 text-[10px] font-semibold text-white bg-[#8B181B] hover:bg-[#721316] rounded-lg shadow-2xs cursor-pointer"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 3: Institutional Governance & Accreditation */}
          <div className="bg-gradient-to-br from-stone-50 via-white to-rose-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/20 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B181B] dark:text-rose-400 stroke-[2]" />
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Institutional Quality
              </span>
              <span className="ml-auto text-[9px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200">
                PACUCOA Level III
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Official alumni advancement system for St. Cecilia's College - Cebu, Inc. Minglanilla campus directory.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Minglanilla, Cebu</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('applet:open-help-modal'))}
                className="font-semibold text-[#8B181B] dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Help & Contacts</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* MODAL: CREATE / PUBLISH POST MODAL */}
      {/* ============================================================== */}
      {showComposerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-[#8B181B] dark:text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Create Cecilian Update
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComposerModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="p-5 overflow-y-auto space-y-4">
              {/* Post Type Selector */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Update Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setComposerType('milestone');
                      setPostMilestoneBadge('Career Achievement');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      composerType === 'milestone'
                        ? 'border-[#8B181B] bg-rose-50/50 dark:bg-rose-950/40 text-[#8B181B] dark:text-rose-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <Award className="w-4 h-4 stroke-[2]" />
                    <span>Milestone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComposerType('gallery');
                      setPostMilestoneBadge('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      composerType === 'gallery'
                        ? 'border-[#8B181B] bg-rose-50/50 dark:bg-rose-950/40 text-[#8B181B] dark:text-rose-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 stroke-[2]" />
                    <span>Campus Memory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComposerType('announcement');
                      setPostMilestoneBadge('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      composerType === 'announcement'
                        ? 'border-[#8B181B] bg-rose-50/50 dark:bg-rose-950/40 text-[#8B181B] dark:text-rose-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 stroke-[2]" />
                    <span>Circular</span>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g., Passed the Licensure Examination, Promoted to Lead Architect..."
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B]"
                />
              </div>

              {/* Milestone Badge Dropdown (if milestone) */}
              {composerType === 'milestone' && (
                <div>
                  <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                    Milestone Tag
                  </label>
                  <select
                    value={postMilestoneBadge}
                    onChange={(e) => setPostMilestoneBadge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                  >
                    <option value="Licensure Passer">Licensure Examination Passer</option>
                    <option value="Career Promotion">Career Promotion / New Role</option>
                    <option value="Excellence Award">Industry / Institutional Award</option>
                    <option value="Graduate Degree">Graduate Degree Completion</option>
                    <option value="Startup Venture">New Company / Venture Launch</option>
                    <option value="Centennial Golden Honor">Centennial Golden Honor</option>
                  </select>
                </div>
              )}

              {/* Body Text */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                  Share Your Story / Description
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Tell your fellow Cecilians about your achievements, memories, or updates..."
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] resize-none"
                />
              </div>

              {/* Campus Photo Presets or Upload */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Attach Campus Photo or Custom Image
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_CAMPUS_PHOTOS.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPostImageUrl(p.url)}
                      className={`h-16 rounded-xl overflow-hidden border-2 cursor-pointer relative group ${
                        postImageUrl === p.url
                          ? 'border-[#8B181B] ring-2 ring-[#8B181B]/20'
                          : 'border-transparent hover:border-stone-300'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      {postImageUrl === p.url && (
                        <div className="absolute inset-0 bg-[#8B181B]/30 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {postImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPostImageUrl('')}
                      className="px-2.5 py-2 text-stone-400 hover:text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="Batch2023, BSIT, CecilianPride"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              {/* Pin post toggle (Admins & Staff) */}
              {currentUser && currentUser.role !== 'alumni' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pinToggle"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-[#8B181B] focus:ring-[#8B181B]"
                  />
                  <label htmlFor="pinToggle" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                    Pin this post to top of news feed
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposerModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B181B] hover:bg-[#721316] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Post to News Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DIGITAL QR PASS FOR RESERVED EVENTS */}
      {/* ============================================================== */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#8B181B] dark:text-rose-400 uppercase tracking-wider block">
                  Digital Event Pass
                </span>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {selectedPass.eventTitle}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 inline-block shadow-2xs">
              {passQrDataUrl ? (
                <img src={passQrDataUrl} alt="Pass QR" className="w-40 h-40 mx-auto" />
              ) : (
                <div className="w-40 h-40 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-stone-400 animate-pulse" />
                </div>
              )}
              <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200 block mt-2">
                {selectedPass.id}
              </span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 rounded-xl p-3 text-xs text-left space-y-1.5 border border-stone-200/80 dark:border-stone-800">
              <div className="flex justify-between">
                <span className="text-stone-400">Attendee:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedPass.alumniName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Seats Reserved:</span>
                <span className="font-bold text-[#8B181B] dark:text-rose-400">{selectedPass.totalSeats} Seat(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Date:</span>
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {new Date(selectedPass.eventDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl"
              >
                Print Pass
              </button>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-5 py-2 bg-[#8B181B] hover:bg-[#721316] text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FULL ANNOUNCEMENT DETAIL VIEW */}
      {/* ============================================================== */}
      {selectedAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3 bg-stone-50/50 dark:bg-stone-850/50">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedAnnouncementModal.urgent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B181B] text-white flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 stroke-[2]" />
                    URGENT
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-[#8B181B] dark:text-rose-400 border border-rose-200 dark:border-rose-900 uppercase">
                  {selectedAnnouncementModal.category || 'Institutional'}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncementModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {selectedAnnouncementModal.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-400 pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {selectedAnnouncementModal.authorName || 'Alumni Affairs Office'}
                </span>
                <span>•</span>
                <span>
                  {selectedAnnouncementModal.publishedAt && !isNaN(new Date(selectedAnnouncementModal.publishedAt).getTime())
                    ? new Date(selectedAnnouncementModal.publishedAt).toLocaleDateString([], { dateStyle: 'medium' })
                    : 'Recent Release'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {selectedAnnouncementModal.content}
              </p>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-850 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedAnnouncementModal(null);
                  setActiveTab('announcements');
                }}
                className="text-xs text-[#8B181B] dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                View in Announcement Board →
              </button>
              <button
                onClick={() => setSelectedAnnouncementModal(null)}
                className="px-4 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: IMAGE LIGHTBOX */}
      {/* ============================================================== */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl mx-auto"
            />
            <div className="mt-2 flex items-center justify-between text-white text-xs px-2">
              <span className="font-semibold truncate">{lightboxImage.title}</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE POST CONFIRMATION */}
      {/* ============================================================== */}
      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => {
          if (!postToDelete) return;
          deleteFeedPost(postToDelete.id);
          setPostToDelete(null);
          showToast('Post removed from news feed.', 'info');
        }}
        title="Delete Post"
        message={`Are you sure you want to delete "${postToDelete?.title || 'this update'}" from the alumni news feed? This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Keep Post"
        variant="danger"
      />

      {/* ============================================================== */}
      {/* MODAL: CANCEL RESERVATION CONFIRMATION */}
      {/* ============================================================== */}
      <ConfirmationModal
        isOpen={!!reservationToCancel}
        onClose={() => setReservationToCancel(null)}
        onConfirm={async () => {
          if (!reservationToCancel) return;
          setIsCancellingReservation(true);
          try {
            await cancelEventReservation(reservationToCancel.id, 'Cancelled via news feed');
            setReservationToCancel(null);
            showToast('Event reservation released.', 'info');
          } finally {
            setIsCancellingReservation(false);
          }
        }}
        title="Cancel Event Reservation"
        message={`Are you sure you want to cancel your seat reservation for "${reservationToCancel?.eventTitle}"? Your ${reservationToCancel?.totalSeats} seat(s) will be released immediately.`}
        confirmLabel={isCancellingReservation ? 'Cancelling...' : 'Cancel Reservation'}
        cancelLabel="Keep Seat"
        variant="danger"
      />
    </div>
  );
};
