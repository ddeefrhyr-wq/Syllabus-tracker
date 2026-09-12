import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Hash,
  GraduationCap,
  Edit3,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  MoreVertical,
  Shield,
  ShieldCheck,
  Info,
  LogOut,
  Image as ImageIcon,
  LogIn,
  User as UserIcon,
  Cloud,
  CloudOff,
  LayoutDashboard,
  X,
  AtSign,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface StudentHeaderProps {
  profile: StudentProfile;
  totalChapters: number;
  completedChapters: number;
  overallPercentage: number;
  activeExamTitle: string;
  activeExamPercentage: number;
  isAdminMode: boolean;
  isCloudSynced?: boolean;
  onEditProfile: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAdminModal: () => void;
  onToggleAdminMode: () => void;
  onOpenResetProgressModal: () => void;
  onOpenAppInfoModal: () => void;
  onOpenSnapshotModal: () => void;
  onOpenCentralAdminHub: () => void;
  onOpenAuthModal: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  profile,
  totalChapters,
  completedChapters,
  overallPercentage,
  activeExamTitle,
  activeExamPercentage,
  isAdminMode,
  isCloudSynced = true,
  onEditProfile,
  onResetData,
  onExportData,
  onImportData,
  onOpenAdminModal,
  onToggleAdminMode,
  onOpenResetProgressModal,
  onOpenAppInfoModal,
  onOpenSnapshotModal,
  onOpenCentralAdminHub,
  onOpenAuthModal,
}) => {
  const { currentUser, userUsername, logout } = useAuth();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showOptionsMenu]);

  const handleAdminOptionClick = () => {
    setShowOptionsMenu(false);
    if (isAdminMode) {
      onToggleAdminMode();
    } else {
      onOpenAdminModal();
    }
  };

  const handleResetProgressClick = () => {
    setShowOptionsMenu(false);
    onOpenResetProgressModal();
  };

  const handleAppInfoClick = () => {
    setShowOptionsMenu(false);
    onOpenAppInfoModal();
  };

  const handleSnapshotClick = () => {
    setShowOptionsMenu(false);
    onOpenSnapshotModal();
  };

  const handleCentralAdminClick = () => {
    setShowOptionsMenu(false);
    onOpenCentralAdminHub();
  };

  const displayName = currentUser?.displayName || profile.full_name;

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs relative">
      {/* Top Application Navigation Bar with Logo Icon */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Study Tracker Logo"
              id="navbar-app-logo"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl shadow-md object-contain shrink-0 ring-1 ring-white/20 hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Study Tracker
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                SSC 2028
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="navbar-app-info-btn"
              onClick={handleAppInfoClick}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="অ্যাপের পরিচিতি ও ব্যবহার নির্দেশিকা"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">অ্যাপ পরিচিতি</span>
            </button>
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>

      {/* Optional top admin bar when active */}
      {isAdminMode && (
        <div
          id="admin-status-bar"
          className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white text-xs px-4 py-2 flex items-center justify-between"
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-300">এডমিন মোড সক্রিয় (Admin Mode Active)</span>
              <span className="hidden md:inline text-indigo-200">
                — আপনি বিষয়, অধ্যায় ও শিক্ষার্থীদের অগ্রগতি পরিচালনা করতে পারবেন।
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="header-open-central-admin-btn"
                onClick={onOpenCentralAdminHub}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>সকল শিক্ষার্থী তালিকা (Admin Hub)</span>
              </button>
              <button
                type="button"
                id="exit-admin-top-btn"
                onClick={onToggleAdminMode}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>স্টুডেন্ট ভিউতে ফিরুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Student Profile Info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shadow-emerald-500/10 shrink-0">
              {displayName
                .split(' ')
                .slice(-2)
                .map((n) => n[0])
                .join('') || 'ST'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{displayName}</span>
                  {userUsername && (
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full font-mono">
                      @{userUsername}
                    </span>
                  )}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  টার্গেট GPA {profile.target_gpa}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  SSC {profile.ssc_batch} ({profile.group})
                </span>

                {isAdminMode && (
                  <span
                    id="admin-mode-pill-badge"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    এডমিন মোড
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  আইডি: <strong className="text-slate-700 font-mono">{currentUser ? currentUser.uid.slice(0, 8) : profile.student_id}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  বর্তমান পরীক্ষা: <strong className="text-slate-800">{activeExamTitle}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  {currentUser ? 'ক্লাউড সিঙ্ক চালু' : 'অফলাইন/গেস্ট মোড'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Active Exam Progress Badge */}
            <div className="bg-slate-50 rounded-xl px-3 py-1.5 sm:py-2 border border-slate-200/80 flex items-center gap-2.5">
              <div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                  পরীক্ষার সিলেবাস
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-none mt-0.5">
                  {activeExamPercentage}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>

            {/* Total Completed Chapters */}
            <div className="bg-slate-50 rounded-xl px-3 py-1.5 sm:py-2 border border-slate-200/80 flex items-center gap-2.5">
              <div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                  সম্পূর্ণ অধ্যায়
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-none mt-0.5">
                  {completedChapters} <span className="text-xs text-slate-400 font-normal">/ {totalChapters}</span>
                </p>
              </div>
            </div>

            {/* Quick Gallery Snapshot Button */}
            <button
              type="button"
              id="gallery-card-snapshot-btn"
              onClick={onOpenSnapshotModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="গ্যালারি কার্ড এক্সপোর্ট (Export Card for Gallery)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">গ্যালারি কার্ড</span>
            </button>

            {/* User Auth state button */}
            {currentUser ? (
              <button
                type="button"
                id="user-logout-btn"
                onClick={() => logout()}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                title={`লগআউট (${currentUser.email || currentUser.displayName})`}
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            ) : (
              <button
                type="button"
                id="open-login-btn"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs shadow-indigo-600/20 cursor-pointer"
                title="লগইন / রেজিস্টার করুন"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন</span>
              </button>
            )}

            {/* Profile edit button */}
            <button
              type="button"
              id="edit-profile-btn"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
              title="প্রোফাইল সম্পাদনা করুন"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">প্রোফাইল</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* THREE-DOT (⋮) OPTIONS MENU */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                id="header-three-dot-menu-btn"
                onClick={() => setShowOptionsMenu((prev) => !prev)}
                className={`inline-flex items-center justify-center p-2 rounded-lg text-slate-700 bg-white border transition-colors shadow-2xs hover:bg-slate-50 cursor-pointer ${
                  showOptionsMenu
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700'
                    : 'border-slate-300'
                }`}
                title="অপশনস মেনু (Options Menu)"
                aria-label="Options Menu"
                aria-expanded={showOptionsMenu}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Hidden File Input for JSON Restore */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportData}
                accept=".json"
                className="hidden"
                id="header-json-file-input"
              />

              {showOptionsMenu && (
                <>
                  {/* Backdrop overlay on mobile: ensures clicks outside close menu cleanly */}
                  <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-150"
                    onClick={() => setShowOptionsMenu(false)}
                    aria-hidden="true"
                  />

                  {/* Dropdown Menu Container: Centered modal on mobile, right-aligned popover on sm+ */}
                  <div
                    id="header-options-dropdown"
                    className="fixed sm:absolute top-1/2 -translate-y-1/2 sm:translate-y-0 sm:top-full left-4 right-4 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 max-h-[88vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <MoreVertical className="w-4 h-4 text-slate-500 shrink-0" />
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          মেনু ও অপশন
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                          v2.4
                        </span>
                        {/* Mobile Close Button */}
                        <button
                          type="button"
                          onClick={() => setShowOptionsMenu(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors sm:hidden cursor-pointer"
                          aria-label="Close menu"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Option 1: Admin View */}
                    <button
                      type="button"
                      id="menu-admin-view-btn"
                      onClick={handleAdminOptionClick}
                      className={`w-full text-left px-4 py-3 text-xs font-medium flex items-center justify-between transition-colors hover:bg-slate-50 active:bg-slate-100 cursor-pointer ${
                        isAdminMode ? 'text-indigo-700 bg-indigo-50/70 border-l-4 border-indigo-600' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isAdminMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isAdminMode ? (
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Shield className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block text-slate-900">Admin View</span>
                          <span className="text-[11px] text-slate-500 block">
                            {isAdminMode ? 'এডমিন মোড টগল করুন' : 'পাসকোড দিয়ে আনলক করুন (1919131514)'}
                          </span>
                        </div>
                      </div>
                      {isAdminMode ? (
                        <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                          লকড 🔒
                        </span>
                      )}
                    </button>

                    {/* Option 1b: Centralized Admin Dashboard (All Students) */}
                    {isAdminMode && (
                      <button
                        type="button"
                        id="menu-central-admin-btn"
                        onClick={handleCentralAdminClick}
                        className="w-full text-left px-4 py-3 text-xs font-medium text-emerald-800 hover:bg-emerald-50/70 active:bg-emerald-100/70 flex items-center justify-between transition-colors cursor-pointer border-t border-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm block text-slate-900">Student Registry & Hub</span>
                            <span className="text-[11px] text-slate-500 block">
                              সকল শিক্ষার্থীর রিয়েল-টাইম ডাটা
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          Open Hub
                        </span>
                      </button>
                    )}

                    {/* Option 2: Gallery Card Export */}
                    <button
                      type="button"
                      id="menu-export-gallery-btn"
                      onClick={handleSnapshotClick}
                      className="w-full text-left px-4 py-3 text-xs font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block text-slate-900">গ্যালারি কার্ড এক্সপোর্ট</span>
                        <span className="text-[11px] text-slate-500 block">
                          ফোনের গ্যালারিতে সেভ করার ছবি কার্ড
                        </span>
                      </div>
                    </button>

                    {/* Option 3: Reset Progress */}
                    <button
                      type="button"
                      id="menu-reset-progress-btn"
                      onClick={handleResetProgressClick}
                      className="w-full text-left px-4 py-3 text-xs font-medium text-slate-800 hover:bg-amber-50/70 active:bg-amber-100/70 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block text-slate-900">Reset Progress</span>
                        <span className="text-[11px] text-slate-500 block">
                          মাইলস্টোন বা সম্পূর্ণ সিলেবাস রিসেট
                        </span>
                      </div>
                    </button>

                    {/* Option 4: App Info */}
                    <button
                      type="button"
                      id="menu-app-info-btn"
                      onClick={handleAppInfoClick}
                      className="w-full text-left px-4 py-3 text-xs font-medium text-slate-800 hover:bg-indigo-50/70 active:bg-indigo-100/70 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block text-slate-900">App Info</span>
                        <span className="text-[11px] text-slate-500 block">
                          SSC 2028 ট্র্যাকার তথ্য ও PWA স্ট্যাটাস
                        </span>
                      </div>
                    </button>

                    {/* Auth action if not logged in */}
                    {!currentUser && (
                      <button
                        type="button"
                        id="menu-login-btn"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-medium text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 flex items-center gap-3 border-t border-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <LogIn className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm block text-indigo-950">ক্লাউড লগইন / সাইন আপ</span>
                          <span className="text-[11px] text-indigo-600/80 block">
                            গুগল, ফেসবুক বা মোবাইল দিয়ে সিঙ্ক
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Backup & Restore JSON Section */}
                    <div className="my-1 border-t border-slate-100" />

                    <div className="px-3 py-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                        ব্যাকআপ ফাইল (JSON)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            onExportData();
                          }}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>ডাউনলোড</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowOptionsMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>রিস্টোর</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
