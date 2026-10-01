import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Clock,
  MapPin,
  Users,
  Heart,
  Edit2,
  Trash2,
  MessageCircle,
  Ticket
} from 'lucide-react';
import { AlumniEvent } from '../../types';
import { ShareButton } from '../common/ShareButton';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { getEventReservationStatus } from '../../services/eventReservationService';
import {
  getEventImage,
  handleEventImageError,
  getUserAvatar,
  handleUserAvatarError
} from '../../lib/defaultImages';

interface EventCardProps {
  event: AlumniEvent;
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onSelect: (event: AlumniEvent) => void;
  onOpenAttendees: (event: AlumniEvent) => void;
  onEdit?: (event: AlumniEvent) => void;
  onDelete?: (eventId: string) => void;
  onToggleLike: (eventId: string) => void;
  onReserve?: (event: AlumniEvent) => void;
  isExpandedThread?: boolean;
  onToggleExpandThread?: (eventId: string) => void;
  enableTilt?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  currentUserId,
  canEdit,
  canDelete,
  onSelect,
  onOpenAttendees,
  onEdit,
  onDelete,
  onToggleLike,
  onReserve,
  onToggleExpandThread,
  enableTilt = true
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Framer Motion 3D Perspective Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 280, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handlePointerEnter = () => {
    if (enableTilt) setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const eventDate = new Date(event.startDate);
  const isLiked = currentUserId ? (event.likes || []).includes(currentUserId) : false;
  const statusInfo = getEventReservationStatus(event);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alumni.stcecilia.edu';
  const shareUrl = `${origin}?tab=events&event=${event.id}`;
  const shareText = `${event.title} — scheduled for ${eventDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} at ${event.location}. Join the St. Cecilia's College Alumni Network!`;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{
          scale: 1.025,
          y: -4,
          transition: { duration: 0.25, ease: 'easeOut' }
        }}
        className="relative bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(139,24,27,0.12),0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300 flex flex-col justify-between h-full group select-none"
      >
        {/* Specular Spotlight Glare Overlay */}
        {enableTilt && isHovered && (
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)`
            }}
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          />
        )}

        {/* 3D Elevated Content Layers */}
        <div style={{ transform: 'translateZ(15px)' }}>
          {/* Card Header Media */}
          <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
            <img
              src={getEventImage(event.heroImageUrl)}
              alt={event.title}
              onError={handleEventImageError}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {/* Registration Status Badge on Media (Floated in 3D) */}
            <div
              style={{ transform: 'translateZ(28px)' }}
              className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10"
            >
              <span
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border backdrop-blur-md shadow-xs ${statusInfo.badgeClass}`}
              >
                {statusInfo.dotEmoji} {statusInfo.label}
              </span>
            </div>

            {/* Date Badge (Floated in 3D) */}
            <div
              style={{ transform: 'translateZ(32px)' }}
              className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md text-center border border-stone-100 z-10"
            >
              <span className="block text-[10px] font-bold text-[#8B181B] uppercase leading-none">
                {eventDate.toLocaleDateString([], { month: 'short' })}
              </span>
              <span className="block text-base font-extrabold text-stone-900 leading-none mt-0.5">
                {eventDate.getDate()}
              </span>
            </div>

            {/* Virtual / Important Tag */}
            <div
              style={{ transform: 'translateZ(24px)' }}
              className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10"
            >
              {event.isVirtual && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
                  Virtual
                </span>
              )}
              {event.isImportant && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/95 text-stone-950 backdrop-blur-xs shadow-xs">
                  Featured Flagship
                </span>
              )}
            </div>

            {/* Edit / Delete Controls */}
            {(canEdit || canDelete) && (
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs rounded-lg p-1 border border-stone-200 z-10"
              >
                {canEdit && onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                    className="p-1 hover:text-blue-600 text-stone-600 rounded cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="p-1 hover:text-red-600 text-stone-600 rounded cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-3">
            <div>
              <div className="text-[11px] font-bold text-[#8B181B] uppercase tracking-wider mb-1">
                {event.type}
              </div>

              <h3
                onClick={() => onSelect(event)}
                className="text-base font-bold text-stone-900 group-hover:text-[#8B181B] cursor-pointer line-clamp-2 leading-snug transition-colors"
              >
                {event.title}
              </h3>
            </div>

            <div className="space-y-1.5 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  {eventDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  • {eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{event.venue || event.location}</span>
              </div>
            </div>

            {/* Seat Capacity Progress & Deadline Ribbon */}
            <div className="p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-stone-700">Seat Capacity</span>
                <span className="font-mono font-bold text-stone-900">
                  {statusInfo.reservedCount} / {statusInfo.totalCapacity} reserved
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    statusInfo.occupancyPercentage >= 100
                      ? 'bg-stone-800'
                      : statusInfo.occupancyPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-[#8B181B]'
                  }`}
                  style={{ width: `${Math.min(statusInfo.occupancyPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                <span>{statusInfo.availableSeats} seats remaining</span>
                <span className="text-red-700 font-semibold">{statusInfo.countdownText}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>

        {/* Footer Controls (Floated in 3D for depth) */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="p-3.5 sm:p-4 bg-stone-50/80 border-t border-stone-100 space-y-2.5 mt-auto"
        >
          <div className="flex items-center justify-between gap-2">
            {onReserve && statusInfo.canReserve ? (
              <button
                type="button"
                onClick={() => onReserve(event)}
                className="w-full py-2 bg-[#8B181B] hover:bg-[#721316] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-300" />
                <span>Reserve Now</span>
              </button>
            ) : onReserve && statusInfo.canJoinWaitlist ? (
              <button
                type="button"
                onClick={() => onReserve(event)}
                className="w-full py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-stone-300" />
                <span>Join Waiting List</span>
              </button>
            ) : (
              <div className="w-full py-1.5 text-center text-xs font-semibold text-stone-400 bg-stone-100 rounded-xl">
                Registration Closed
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 pt-1">
            <button
              type="button"
              onClick={() => onOpenAttendees(event)}
              className="flex items-center gap-2 hover:text-[#8B181B] transition-colors group/att text-left min-h-[32px] cursor-pointer"
              title="Click to view full attendee roster"
            >
              <div className="flex -space-x-1.5 overflow-hidden py-0.5 shrink-0">
                {(event.attendees && event.attendees.length > 0 ? event.attendees.slice(0, 3) : []).map(
                  (att, i) => (
                    <img
                      key={att.uid || i}
                      src={getUserAvatar(att.avatar)}
                      alt={att.name}
                      onError={handleUserAvatarError}
                      className="inline-block h-5 w-5 rounded-full ring-1 ring-white object-cover shadow-2xs bg-stone-200"
                    />
                  )
                )}
              </div>
              <span className="flex items-center gap-1 min-w-0">
                <span className="font-bold text-stone-800 group-hover/att:text-[#8B181B]">
                  {event.attendeesCount}
                </span>
                <span className="text-[11px] text-stone-500">going</span>
              </span>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <ShareButton
                title={event.title}
                text={shareText}
                url={shareUrl}
                variant="icon"
                className="p-1.5 text-stone-500 hover:text-[#8B181B] hover:bg-stone-200/60 rounded-lg min-w-[30px] min-h-[30px] flex items-center justify-center transition-colors cursor-pointer"
              />

              <button
                type="button"
                onClick={() => onToggleLike(event.id)}
                className={`flex items-center gap-1 text-xs transition-colors p-1.5 rounded-lg min-h-[30px] cursor-pointer ${
                  isLiked ? 'text-red-600 font-bold bg-red-50' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
                }`}
                title="Like Event"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                <span>{(event.likes || []).length}</span>
              </button>

              {onToggleExpandThread && (
                <button
                  type="button"
                  onClick={() => onToggleExpandThread(event.id)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors min-h-[30px] cursor-pointer"
                  title="View discussion"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{(event.comments || []).length}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (onDelete) onDelete(event.id);
            setShowDeleteConfirm(false);
          }}
          title="Delete Event"
          message={`Are you sure you want to permanently delete "${event.title}"? This action cannot easily be undone.`}
          confirmLabel="Delete Event"
          cancelLabel="Cancel"
          variant="danger"
        />
      </motion.div>
    </div>
  );
};
