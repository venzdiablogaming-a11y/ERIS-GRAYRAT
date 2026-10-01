/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlumniProvider, useAlumni, STORAGE_KEYS } from './context/AlumniContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { NetworkView } from './components/network/NetworkView';
import { MessagesView } from './components/messages/MessagesView';
import { EventsView } from './components/events/EventsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { EmployerDashboardView } from './components/opportunities/EmployerDashboardView';
import { AdminWorkspaceLayout } from './components/admin/AdminWorkspaceLayout';
import { AlumniWorkspaceLayout } from './components/alumni/AlumniWorkspaceLayout';
import { isAdministrativeOrStaffRole } from './types';
import { PublicProfileModal } from './components/profile/PublicProfileModal';
import { FirstTimeProfileSetupModal } from './components/profile/FirstTimeProfileSetupModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/landing/LandingPage';
import { ToastContainer } from './components/common/ToastContainer';
import { VerificationGate } from './components/common/VerificationGate';
import { CecilianLoader } from './components/common/CecilianLoader';
import { CampusGalleryModal } from './components/gallery/CampusGalleryModal';
import { GraduationCap, LogIn, UserPlus, Globe } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    authReady,
    logout,
    activeChatId,
    isEditProfileModalOpen,
    closeEditProfile
  } = useAlumni();
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'auth'>(() => {
    try {
      const savedSession =
        localStorage.getItem(STORAGE_KEYS.USER_ID) ||
        localStorage.getItem('alumni_auth_session_real_v1');
      const savedView = localStorage.getItem(STORAGE_KEYS.VIEW);
      if (savedSession) {
        return savedView === 'landing' ? 'landing' : 'portal';
      }
      return savedView === 'landing' ? 'landing' : 'auth';
    } catch {
      return 'auth';
    }
  });
  const [authViewMode, setAuthViewMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'alumni' | 'employer'>('alumni');
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);

  // Global click anywhere listener: If anything is hovering in the UI, clicking anywhere causes it to vanish
  React.useEffect(() => {
    const handleGlobalClickDismiss = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not force blur if the user is interacting with form controls or interactive buttons
      if (target && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
        return;
      }
      // Blur active element to clear any CSS focus/hover states on neutral surfaces
      if (document.activeElement && document.activeElement instanceof HTMLElement && !document.activeElement.closest('input, textarea, select')) {
        document.activeElement.blur();
      }
      // Dispatch dismiss-hover for all custom hover cards, tooltips, and popovers
      window.dispatchEvent(new CustomEvent('applet:dismiss-hover', { detail: { target: e.target } }));
    };

    window.addEventListener('pointerdown', handleGlobalClickDismiss);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalClickDismiss);
    };
  }, []);

  // Sync currentView changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, currentView);
    } catch {}
  }, [currentView]);

  // Synchronize view state with user authentication status & verification enforcement
  React.useEffect(() => {
    if (currentUser) {
      // Strict Verification Enforcement: Do not let unverified accounts access the portal
      const isAlumniVerified = !!(currentUser.isVerified || currentUser.verified || currentUser.verificationStatus === 'verified');
      if (currentUser.role === 'alumni' && !isAlumniVerified) {
        logout();
        setCurrentView('auth');
        return;
      }
      if (currentUser.role === 'employer' && (!currentUser.isVerified || currentUser.employerVerificationStatus === 'rejected')) {
        logout();
        setCurrentView('auth');
        return;
      }
      if (currentView === 'auth') {
        setCurrentView('portal');
      }
    } else {
      const hasStoredSession =
        typeof window !== 'undefined' &&
        (!!localStorage.getItem(STORAGE_KEYS.USER_ID) ||
         !!localStorage.getItem('alumni_auth_session_real_v1'));
      if (!hasStoredSession && currentView === 'portal') {
        setCurrentView('auth');
      }
    }
  }, [currentUser, currentView, logout]);

  React.useEffect(() => {
    // Prioritize Profile Setup on first-time login
    if (
      currentUser &&
      currentUser.role === 'alumni' &&
      (!currentUser.isProfileSetupCompleted || !currentUser.currentPosition || !currentUser.company)
    ) {
      const dismissed = sessionStorage.getItem(`dismissed_setup_${currentUser.uid}`);
      if (!dismissed) {
        setShowProfileSetupModal(true);
      }
    }
  }, [currentUser]);

  const handleLoginSuccess = (_role?: string) => {
    setCurrentView('portal');
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, 'portal');
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, 'dashboard');
    } catch {}
    // User requested: Always direct to home (dashboard) on login
    setActiveTab('dashboard');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Protected Member Portal View Check
  const hasStoredSession =
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(STORAGE_KEYS.USER_ID) ||
     !!localStorage.getItem('alumni_auth_session_real_v1'));

  if (!currentUser && hasStoredSession && !authReady) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <CecilianLoader text="Restoring your Cecilian session..." />
      </div>
    );
  }

  // Animate view transitions (landing, auth, portal)
  return (
    <AnimatePresence mode="wait">
      {/* Landing page view */}
      {currentView === 'landing' && (
        <motion.div
          key="view-landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <LandingPage
            onNavigateToAuth={(mode, role = 'alumni') => {
              setAuthViewMode(mode);
              setAuthRole(role);
              setCurrentView('auth');
            }}
          />
        </motion.div>
      )}

      {/* Authentication page view */}
      {currentView === 'auth' && (
        <motion.div
          key="view-auth"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <AuthPage
            initialMode={authViewMode}
            initialRole={authRole}
            onLoginSuccess={handleLoginSuccess}
            onBackToApp={() => {
              if (currentUser) {
                handleLoginSuccess(currentUser.role);
              } else {
                setCurrentView('landing');
              }
            }}
          />
        </motion.div>
      )}

      {/* Authenticated Member Portal View or Fallback to Auth */}
      {currentView === 'portal' && (!currentUser ? (
        <motion.div
          key="view-auth-fallback"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <AuthPage
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onBackToApp={() => setCurrentView('landing')}
          />
        </motion.div>
      ) : isAdministrativeOrStaffRole(currentUser.role) ? (
        /* Reference-Inspired Administrative Management & Dashboard Workspace (Admin, Registrar, Employer, Staff, Moderator, Super Admin) */
        <motion.div
          key="view-portal-admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-h-screen bg-[#F9FAFB] dark:bg-[#121316] flex flex-col font-sans text-stone-900 dark:text-stone-100 antialiased selection:bg-[#8B181B] selection:text-white"
        >
          <AdminWorkspaceLayout
            onOpenAuth={(mode) => {
              setAuthViewMode(mode);
              setCurrentView('auth');
            }}
            onGoToLanding={() => setCurrentView('landing')}
          />

          {/* Public Profile Modal (Available anywhere in the app) */}
          <PublicProfileModal />

          {/* Global Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={closeEditProfile}
          />
        </motion.div>
      ) : (
        /* Redesigned Alumni Workspace - Matches Admin Workspace Specification */
        <motion.div
          key="view-portal-alumni"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-h-screen bg-[#F9FAFB] dark:bg-[#121316] flex flex-col font-sans text-stone-900 dark:text-stone-100 antialiased selection:bg-[#8B181B] selection:text-white"
        >
          <AlumniWorkspaceLayout
            onOpenAuth={(mode) => {
              setAuthViewMode(mode);
              setCurrentView('auth');
            }}
            onGoToLanding={() => setCurrentView('landing')}
          />

          {/* Public Profile Modal (Available anywhere in the app) */}
          <PublicProfileModal />

          {/* Global Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={closeEditProfile}
          />

          {/* Priority First-Time Profile Setup Modal */}
          <FirstTimeProfileSetupModal
            isOpen={showProfileSetupModal}
            onClose={() => {
              setShowProfileSetupModal(false);
              if (currentUser) {
                sessionStorage.setItem(`dismissed_setup_${currentUser.uid}`, 'true');
              }
            }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AlumniProvider>
      <AppContent />
      <ToastContainer />
    </AlumniProvider>
  );
}
