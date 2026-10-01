import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { EventReservation, AlumniEvent } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { calculate24HourAlertStatus } from '../../services/eventPushNotificationService';

interface EventAttendance24hBannerProps {
  onViewPass?: (reservation: EventReservation) => void;
}

export const EventAttendance24hBanner: React.FC<EventAttendance24hBannerProps> = ({ onViewPass }) => {
  const {
    currentUser,
    reservations,
    events,
    confirmEventAttendance,
    cancelEventReservation,
    pushPermissionStatus,
    requestBrowserPushPermission,
    sendTest24HourAlert,
    setActiveTab
  } = useAlumni();

  const [dismissedReservationIds, setDismissedReservationIds] = useState<string[]>([]);
  const [reservationToRelease, setReservationToRelease] = useState<EventReservation | null>(null);

  if (!currentUser) return null;

  // Filter confirmed reservations for current user within 24-hour window
  const active24hReservations = (reservations || [])
    .filter((r) => r.userId === currentUser.uid && r.status === 'confirmed')
    .filter((r) => !dismissedReservationIds.includes(r.id))
    .map((r) => {
      const event = events.find((e) => e.id === r.eventId);
      const startDate = event?.startDate || r.eventDate;
      const status24h = calculate24HourAlertStatus(startDate);
      return { reservation: r, event, status24h };
    })
    .filter(({ status24h }) => status24h.isWithin24HourWindow);

  if (active24hReservations.length === 0) return null;

  const topAlert = active24hReservations[0];
  const { reservation, event, status24h } = topAlert;
  const isConfirmed = Boolean(reservation.attendanceConfirmed);

  const handleDismiss = () => {
    setDismissedReservationIds((prev) => [...prev, reservation.id]);
  };

  const handleConfirmAttendance = () => {
    confirmEventAttendance(reservation.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        className="w-full bg-gradient-to-r from-red-950 via-[#8B181B] to-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(139,24,27,0.25)] border border-red-800/80 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="w-5 h-5 text-amber-300 animate-pulse stroke-[2.2]" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-2xs">
                  Event in {Math.max(1, status24h.hoursUntilEvent)} Hours
                </span>
                <span className="text-red-200">·</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/15 text-red-100">
                  {reservation.id}
                </span>
                <span className="text-red-200">·</span>
                <span className="text-red-100">
                  {reservation.totalSeats} Reserved Seat{reservation.totalSeats > 1 ? 's' : ''}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {reservation.eventTitle}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-red-100/90">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tomorrow at {status24h.formattedEventTime.split(',')[1] || status24h.formattedEventTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span className="truncate max-w-[220px] sm:max-w-xs">{reservation.eventVenue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {isConfirmed ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 text-white rounded-xl text-xs font-bold border border-emerald-400/40 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Attendance Confirmed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAttendance}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer"
                title="Confirm you will attend to guarantee high venue turnout"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                <span>I Will Attend</span>
              </button>
            )}

            {onViewPass && (
              <button
                type="button"
                onClick={() => onViewPass(reservation)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all active:scale-98 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Gate Pass</span>
              </button>
            )}

            {pushPermissionStatus === 'default' && (
              <button
                type="button"
                onClick={requestBrowserPushPermission}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Enable OS push notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enable Browser Push</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => sendTest24HourAlert(reservation)}
              className="p-2 bg-white/10 hover:bg-white/20 text-red-200 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Test 24-hour push alert & chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {!isConfirmed && (
              <button
                type="button"
                onClick={() => setReservationToRelease(reservation)}
                className="px-2.5 py-2 text-red-300 hover:text-white hover:bg-red-900/40 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Cannot attend? Release seat to waitlist"
              >
                Release Seat
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Seat Release Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(reservationToRelease)}
        onClose={() => setReservationToRelease(null)}
        onConfirm={async () => {
          if (reservationToRelease) {
            await cancelEventReservation(reservationToRelease.id, 'Released via 24h attendance notice');
          }
          setReservationToRelease(null);
        }}
        title="Release Reserved Seat"
        message={`Are you unable to attend "${reservationToRelease?.eventTitle}" tomorrow? Releasing your ${reservationToRelease?.totalSeats} reserved seat(s) allows waiting Cecilian alumni to attend.`}
        confirmLabel="Release Seat to Waitlist"
        cancelLabel="Keep Reservation"
        variant="warning"
      />
    </>
  );
};
