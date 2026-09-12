import React, { useState, useEffect } from 'react';
import { UserSummaryRecord, Subject } from '../types';
import { db, collection, onSnapshot, query, orderBy, doc, deleteDoc, setDoc } from '../lib/firebase';
import {
  ShieldCheck,
  Users,
  Search,
  RotateCcw,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  Smartphone,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface CentralizedAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectsList: Subject[];
}

export const CentralizedAdminDashboardModal: React.FC<CentralizedAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  subjectsList,
}) => {
  const [users, setUsers] = useState<UserSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSummaryRecord | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to real-time users collection
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('lastActive', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedUsers: UserSummaryRecord[] = [];
        snapshot.forEach((docSnap) => {
          fetchedUsers.push(docSnap.data() as UserSummaryRecord);
        });
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore users fetch error:', error);
        // Fallback demo users if Firestore rules or offline
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
      (u.sscBatch && u.sscBatch.toLowerCase().includes(q))
    );
  });

  // Reset a specific student's progress to 0%
  const handleResetStudentProgress = async (student: UserSummaryRecord) => {
    if (!window.confirm(`আপনি কি শিক্ষার্থী "${student.displayName}"-এর সিলেবাস অগ্রগতি ০% এ রিসেট করতে চান?`)) {
      return;
    }

    try {
      // 1. Reset user summary
      const userRef = doc(db, 'users', student.uid);
      const resetSubjectPercentages: Record<string, { name: string; percentage: number; color?: string }> = {};
      Object.keys(student.subjectPercentages || {}).forEach((key) => {
        resetSubjectPercentages[key] = {
          ...student.subjectPercentages[key],
          percentage: 0,
        };
      });

      await setDoc(
        userRef,
        {
          overallPercentage: 0,
          completedChapters: 0,
          subjectPercentages: resetSubjectPercentages,
          lastActive: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Also reset in userData collection if present
      const userDataRef = doc(db, 'userData', student.uid);
      // Attempt merge reset
      await setDoc(
        userDataRef,
        {
          updatedAt: new Date().toISOString(),
          resetFlag: true,
        },
        { merge: true }
      );

      showToast(`শিক্ষার্থী ${student.displayName}-এর সিলেবাস অগ্রগতি সফলভাবে রিসেট করা হয়েছে!`);
      if (selectedUser?.uid === student.uid) {
        setSelectedUser({
          ...student,
          overallPercentage: 0,
          completedChapters: 0,
          subjectPercentages: resetSubjectPercentages,
        });
      }
    } catch (err) {
      console.error('Failed to reset student progress:', err);
      showToast('অগ্রগতি রিসেট করা সম্ভব হয়নি। নেটওয়ার্ক ও পারমিশন পরীক্ষা করুন।', 'error');
    }
  };

  // Delete student profile
  const handleDeleteStudent = async (student: UserSummaryRecord) => {
    if (!window.confirm(`সতর্কতা: শিক্ষার্থী "${student.displayName}"-কে ডাটাবেস থেকে মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', student.uid));
      await deleteDoc(doc(db, 'userData', student.uid));
      showToast(`শিক্ষার্থী ${student.displayName} মুছে ফেলা হয়েছে।`);
      if (selectedUser?.uid === student.uid) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to delete student:', err);
      showToast('শিক্ষার্থী মুছতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  return (
    <div
      id="central-admin-dashboard-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="central-admin-dashboard-modal"
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">সেন্ট্রালাইজড এডমিন ড্যাশবোর্ড (Central Admin Hub)</h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-semibold">
                  LIVE REAL-TIME
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                সকল নিবন্ধিত শিক্ষার্থীর রিয়েল-টাইম সিলেবাস ট্র্যাকিং ও অগ্রগতি মনিটরিং
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications Toast */}
        {notification && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Action / Search Bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="admin-search-students"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষার্থীর নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-medium">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>মোট শিক্ষার্থী: <strong>{users.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Main Content: Split View on Large Screens */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Student List / Table */}
          <div className="lg:col-span-7 xl:col-span-8 overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs">ফায়ারবেস ক্লাউড থেকে শিক্ষার্থী তালিকা লোড হচ্ছে...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">কোন শিক্ষার্থী পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">
                  ব্যবহারকারীরা Gmail, Facebook বা ইমেইলে লগইন করলে এখানে তালিকাভুক্ত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredUsers.map((student) => {
                  const isSelected = selectedUser?.uid === student.uid;
                  const formattedDate = student.lastActive
                    ? new Date(student.lastActive).toLocaleDateString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'অজানা';

                  return (
                    <div
                      key={student.uid}
                      onClick={() => setSelectedUser(student)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Left Student Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {student.displayName.slice(0, 2).toUpperCase() || 'ST'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                              {student.displayName}
                            </h4>
                            {student.role === 'admin' && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                এডমিন
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                            {student.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {student.email}
                              </span>
                            )}
                            {student.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {student.phoneNumber}
                              </span>
                            )}
                            {student.authProvider && (
                              <span className="text-[10px] uppercase font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {student.authProvider}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Overall Progress Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-600">
                            {student.overallPercentage}%
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {student.completedChapters || 0}/{student.totalChapters || 46} অধ্যায়
                          </p>
                        </div>

                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${student.overallPercentage}%` }}
                          />
                        </div>

                        <div className="text-right text-[10px] text-slate-400 min-w-16">
                          <p>সক্রিয়:</p>
                          <p className="font-medium text-slate-600">{formattedDate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Student Detailed Inspection & Actions */}
          <div className="lg:col-span-5 xl:col-span-4 bg-slate-50/50 p-5 sm:p-6 overflow-y-auto">
            {selectedUser ? (
              <div className="space-y-5">
                {/* Profile Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      শিক্ষার্থীর তথ্য
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Award className="w-3 h-3" />
                      টার্গেট GPA {selectedUser.targetGpa || '5.00'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.displayName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    SSC ব্যাচ: <strong>{selectedUser.sscBatch || '2028'}</strong> | বিভাগ:{' '}
                    <strong>{selectedUser.group || 'বিজ্ঞান (Science)'}</strong>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">যোগাযোগ / আইডি:</span>
                      <span className="font-mono text-slate-700">{selectedUser.email || selectedUser.phoneNumber || selectedUser.uid.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ডিভাইস / প্ল্যাটফর্ম:</span>
                      <span className="text-slate-700">{selectedUser.deviceStatus || 'PWA (Mobile / Web)'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">সর্বশেষ সিনক্রোনাইজেশন:</span>
                      <span className="text-slate-700">
                        {new Date(selectedUser.lastActive).toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject-Wise Percentage Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      বিষয়ভিত্তিক অগ্রগতি (Subject-wise %)
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {selectedUser.overallPercentage}% সামগ্রিক
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {subjectsList.map((sub) => {
                      const subjectData = selectedUser.subjectPercentages?.[sub.subject_id] || {
                        name: sub.subject_name,
                        percentage: 0,
                      };
                      return (
                        <div key={sub.subject_id} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-700">{sub.subject_name}</span>
                            <span className="font-bold text-slate-900">{subjectData.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${subjectData.percentage}%`,
                                backgroundColor: sub.theme_color || '#4f46e5',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Management Controls */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    এডমিন অ্যাকশন (Admin Actions)
                  </span>

                  <button
                    type="button"
                    onClick={() => handleResetStudentProgress(selectedUser)}
                    className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>এই শিক্ষার্থীর সিলেবাস অগ্রগতি রিসেট করুন (Reset Progress)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(selectedUser)}
                    className="w-full py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>শিক্ষার্থীর প্রোফাইল মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Sliders className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">কোন শিক্ষার্থী নির্বাচিত নেই</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  বাম পাশের তালিকা থেকে যেকোনো শিক্ষার্থীর কার্ডে ক্লিক করে বিস্তারিত বিষয়ভিত্তিক রিপোর্ট ও এডমিন অ্যাকশন দেখুন।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>SSC 2028 Centralized Syllabus Admin Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
