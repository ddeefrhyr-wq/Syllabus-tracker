import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppData, StudentProfile, Subject, Chapter, ProgressBreakdown, UserSummaryRecord } from './types';
import { INITIAL_APP_DATA, calculateCompletion } from './data/initialData';
import { StudentHeader } from './components/StudentHeader';
import { ExamFilterBar } from './components/ExamFilterBar';
import { OverallStatsSummary } from './components/OverallStatsSummary';
import { SubjectSection } from './components/SubjectSection';
import { EditProfileModal } from './components/EditProfileModal';
import { AddChapterModal } from './components/AddChapterModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { ChapterNotesModal } from './components/ChapterNotesModal';
import { CustomSyllabusManagerModal } from './components/CustomSyllabusManagerModal';
import { EditChapterModal } from './components/EditChapterModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { ResetProgressModal } from './components/ResetProgressModal';
import { AppInfoModal } from './components/AppInfoModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { UsernameSetupModal } from './components/UsernameSetupModal';
import { ExportSnapshotModal } from './components/ExportSnapshotModal';
import { CentralizedAdminDashboardModal } from './components/CentralizedAdminDashboardModal';
import { useAuth } from './context/AuthContext';
import { db, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from './lib/firebase';
import { BookOpen, Sparkles, CheckCircle2, Award, Cloud } from 'lucide-react';

const STORAGE_KEY = 'ssc_2028_tracker_data_v1';

export default function App() {
  const { currentUser, loading: authLoading, userUsername, needsUsernameSetup } = useAuth();

  // Load initial data from localStorage if available
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.student_profile) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage data', e);
    }
    return INITIAL_APP_DATA;
  });

  // Sync username into student_profile if present
  useEffect(() => {
    if (userUsername && data.student_profile.username !== userUsername) {
      setData((prev) => ({
        ...prev,
        student_profile: {
          ...prev.student_profile,
          username: userUsername,
          full_name: currentUser?.displayName || prev.student_profile.full_name,
        },
      }));
    }
  }, [userUsername, currentUser?.displayName]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }, [data]);

  // Active Exam filter
  const [activeExamId, setActiveExamId] = useState<string>(() => {
    const initial = data.student_profile.active_exam_filter;
    if (initial === 'Annual_Exam') return 'EXAM_ANNUAL';
    return initial || 'EXAM_ANNUAL';
  });

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');

  // Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [targetSubjectForAddChapter, setTargetSubjectForAddChapter] = useState<string | undefined>();
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isCustomManagerOpen, setIsCustomManagerOpen] = useState(false);
  const [editingChapterForNotes, setEditingChapterForNotes] = useState<Chapter | null>(null);
  const [editingChapterForEdit, setEditingChapterForEdit] = useState<Chapter | null>(null);

  // Admin & 3-Dot Options States
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminPasscodeModalOpen, setIsAdminPasscodeModalOpen] = useState<boolean>(false);
  const [isResetProgressModalOpen, setIsResetProgressModalOpen] = useState<boolean>(false);
  const [isAppInfoModalOpen, setIsAppInfoModalOpen] = useState<boolean>(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  // New Feature Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [isCentralAdminOpen, setIsCentralAdminOpen] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Track if incoming cloud sync is updating local state to avoid echo loop
  const isCloudUpdatingRef = useRef(false);

  // Active exam title
  const activeExamTitle = useMemo(() => {
    if (activeExamId === 'ALL') return 'সমগ্র সিলেবাস (All Chapters)';
    const found = data.custom_exam_syllabuses.find((s) => s.exam_id === activeExamId);
    return found ? found.exam_title : 'বার্ষিক পরীক্ষা (Annual Exam)';
  }, [data.custom_exam_syllabuses, activeExamId]);

  // Overall Statistics across all chapters
  const overallStats = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;
    let totalPercentage = 0;

    data.subjects.forEach((subject) => {
      subject.chapters.forEach((ch) => {
        totalChapters++;
        totalPercentage += ch.completion_percentage;
        if (ch.completion_percentage === 100) {
          completedChapters++;
        }
      });
    });

    const overallPercentage = totalChapters > 0 ? Math.round(totalPercentage / totalChapters) : 0;

    // Active exam statistics
    let examTotal = 0;
    let examCompleted = 0;
    let examPercentageTotal = 0;

    data.subjects.forEach((subject) => {
      subject.chapters.forEach((ch) => {
        if (activeExamId === 'ALL' || ch.included_in_exams.includes(activeExamId)) {
          examTotal++;
          examPercentageTotal += ch.completion_percentage;
          if (ch.completion_percentage === 100) {
            examCompleted++;
          }
        }
      });
    });

    const activeExamPercentage = examTotal > 0 ? Math.round(examPercentageTotal / examTotal) : 0;

    return {
      totalChapters,
      completedChapters,
      overallPercentage,
      examTotal,
      examCompleted,
      activeExamPercentage,
    };
  }, [data.subjects, activeExamId]);

  // --- FIREBASE SYNC: LOAD & REAL-TIME LISTENER FOR CURRENT USER ---
  useEffect(() => {
    if (!currentUser) {
      setIsCloudSynced(false);
      return;
    }

    const userDocRef = doc(db, 'userData', currentUser.uid);

    // Set initial listener for user progress data in Firestore
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data();
          if (remote?.resetFlag) {
            // Admin triggered a reset for this student
            handleResetMilestonesOnly();
            return;
          }
          if (remote?.data && !isCloudUpdatingRef.current) {
            setData(remote.data as AppData);
            setIsCloudSynced(true);
          }
        } else {
          // New user first time: upload initial local data to firestore
          setDoc(
            userDocRef,
            {
              data: data,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.error('Error creating initial userData', e));
        }
      },
      (err) => {
        console.warn('Firestore userData subscription notice:', err.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // --- FIREBASE SYNC: SAVE PROGRESS TO FIRESTORE ON DATA CHANGE ---
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(async () => {
      try {
        isCloudUpdatingRef.current = true;

        // 1. Calculate subject percentages map for Admin Hub
        const subjectPercentages: Record<string, { name: string; percentage: number; color?: string }> = {};
        data.subjects.forEach((s) => {
          const total = s.chapters.length;
          const avg =
            total > 0
              ? Math.round(s.chapters.reduce((acc, c) => acc + c.completion_percentage, 0) / total)
              : 0;
          subjectPercentages[s.subject_id] = {
            name: s.subject_name,
            percentage: avg,
            color: s.theme_color,
          };
        });

        // 2. Save full payload to userData collection
        const userDocRef = doc(db, 'userData', currentUser.uid);
        await setDoc(
          userDocRef,
          {
            data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 3. Update public summary record in 'users' collection for Central Admin View
        const userSummaryRef = doc(db, 'users', currentUser.uid);
        const summaryData: UserSummaryRecord = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || data.student_profile.full_name || 'শিক্ষার্থী',
          username: userUsername || data.student_profile.username || undefined,
          email: currentUser.email || undefined,
          phoneNumber: currentUser.phoneNumber || undefined,
          authProvider: currentUser.providerData?.[0]?.providerId || 'password',
          photoURL: currentUser.photoURL || undefined,
          role: isAdminMode ? 'admin' : 'student',
          sscBatch: data.student_profile.ssc_batch,
          group: data.student_profile.group,
          targetGpa: data.student_profile.target_gpa,
          overallPercentage: overallStats.overallPercentage,
          completedChapters: overallStats.completedChapters,
          totalChapters: overallStats.totalChapters,
          subjectPercentages,
          deviceStatus: window.innerWidth < 768 ? 'Mobile PWA' : 'Desktop/Tablet Web',
          lastActive: new Date().toISOString(),
        };

        await setDoc(userSummaryRef, summaryData, { merge: true });
        setIsCloudSynced(true);
      } catch (e) {
        console.error('Error syncing to Firestore:', e);
      } finally {
        isCloudUpdatingRef.current = false;
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [data, currentUser, overallStats, isAdminMode]);

  // Handler: Toggle Milestone
  const handleToggleMilestone = (chapterId: string, milestoneKey: keyof ProgressBreakdown) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        const chapterExists = subject.chapters.some((c) => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          if (ch.chapter_id !== chapterId) return ch;

          const updatedBreakdown = {
            ...ch.progress_breakdown,
            [milestoneKey]: !ch.progress_breakdown[milestoneKey],
          };

          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: calculateCompletion(updatedBreakdown),
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Set all milestones for chapter
  const handleSetAllMilestones = (chapterId: string, value: boolean) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        const chapterExists = subject.chapters.some((c) => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          if (ch.chapter_id !== chapterId) return ch;

          const updatedBreakdown: ProgressBreakdown = {
            board_book_reading: value,
            cq_practice: value,
            mcq_practice: value,
            test_paper_solve: value,
            revision_done: value,
          };

          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: calculateCompletion(updatedBreakdown),
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Batch set all chapters for a subject
  const handleBatchSetSubjectMilestones = (subjectId: string, value: boolean) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        if (subject.subject_id !== subjectId) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          const updatedBreakdown: ProgressBreakdown = {
            board_book_reading: value,
            cq_practice: value,
            mcq_practice: value,
            test_paper_solve: value,
            revision_done: value,
          };

          return {
            ...ch,
            progress_breakdown: updatedBreakdown,
            completion_percentage: calculateCompletion(updatedBreakdown),
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Toggle Exam inclusion for chapter
  const handleToggleExamInclusion = (chapterId: string, examId: string) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        const chapterExists = subject.chapters.some((c) => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          if (ch.chapter_id !== chapterId) return ch;

          const exists = ch.included_in_exams.includes(examId);
          const updatedExams = exists
            ? ch.included_in_exams.filter((id) => id !== examId)
            : [...ch.included_in_exams, examId];

          return {
            ...ch,
            included_in_exams: updatedExams,
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Batch Toggle Exam for whole subject
  const handleBatchToggleSubjectExam = (subjectId: string, examId: string, include: boolean) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        if (subject.subject_id !== subjectId) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          const exists = ch.included_in_exams.includes(examId);
          let updatedExams = [...ch.included_in_exams];

          if (include && !exists) {
            updatedExams.push(examId);
          } else if (!include && exists) {
            updatedExams = updatedExams.filter((id) => id !== examId);
          }

          return {
            ...ch,
            included_in_exams: updatedExams,
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Update Exam Title
  const handleUpdateExamTitle = (examId: string, newTitle: string) => {
    setData((prev) => {
      const updatedSyllabuses = prev.custom_exam_syllabuses.map((s) => {
        if (s.exam_id === examId) {
          return { ...s, exam_title: newTitle };
        }
        return s;
      });

      return {
        ...prev,
        custom_exam_syllabuses: updatedSyllabuses,
      };
    });
  };

  // Handler: Save Student Profile
  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    setData((prev) => ({
      ...prev,
      student_profile: updatedProfile,
    }));
  };

  // Handler: Save Notes for Chapter
  const handleSaveNotes = (chapterId: string, notes: string) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        const chapterExists = subject.chapters.some((c) => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          if (ch.chapter_id !== chapterId) return ch;
          return { ...ch, notes };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Edit Chapter
  const handleSaveChapterEdit = (
    chapterId: string,
    chapterNumber: number,
    chapterTitle: string,
    updatedBreakdown?: ProgressBreakdown,
    updatedExams?: string[]
  ) => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        const chapterExists = subject.chapters.some((c) => c.chapter_id === chapterId);
        if (!chapterExists) return subject;

        const updatedChapters = subject.chapters.map((ch) => {
          if (ch.chapter_id !== chapterId) return ch;
          const breakdown = updatedBreakdown || ch.progress_breakdown;
          const completion = calculateCompletion(breakdown);
          return {
            ...ch,
            chapter_number: chapterNumber,
            chapter_title: chapterTitle,
            progress_breakdown: breakdown,
            completion_percentage: completion,
            included_in_exams: updatedExams || ch.included_in_exams,
          };
        });

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই অধ্যায়টি মুছে ফেলতে চান?')) return;
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        return {
          ...subject,
          chapters: subject.chapters.filter((ch) => ch.chapter_id !== chapterId),
        };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Admin Unlock Success
  const handleAdminUnlockSuccess = () => {
    setIsAdminMode(true);
    setIsAdminPasscodeModalOpen(false);
    if (pendingAdminAction) {
      pendingAdminAction();
      setPendingAdminAction(null);
    } else {
      // Auto open central admin hub upon unlocking
      setIsCentralAdminOpen(true);
    }
  };

  // Handler: Toggle Admin Mode
  const handleToggleAdminMode = () => {
    setIsAdminMode((prev) => !prev);
  };

  // Handler: Admin Gatekeeper
  const handleRequireAdmin = (action: () => void) => {
    if (isAdminMode) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setIsAdminPasscodeModalOpen(true);
    }
  };

  // Handler: Reset Milestones Only
  const handleResetMilestonesOnly = () => {
    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => ({
        ...subject,
        chapters: subject.chapters.map((ch) => ({
          ...ch,
          progress_breakdown: {
            board_book_reading: false,
            cq_practice: false,
            mcq_practice: false,
            test_paper_solve: false,
            revision_done: false,
          },
          completion_percentage: 0,
        })),
      }));
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handler: Master Factory Reset
  const handleMasterReset = () => {
    setData(INITIAL_APP_DATA);
    setActiveExamId('EXAM_ANNUAL');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Handler: Add New Chapter
  const handleAddChapter = (
    subjectId: string,
    chapterNumber: number,
    chapterTitle: string,
    includedExams: string[]
  ) => {
    const newChapter: Chapter = {
      chapter_id: `custom_${Date.now()}`,
      chapter_number: chapterNumber,
      chapter_title: chapterTitle,
      included_in_exams: includedExams,
      progress_breakdown: {
        board_book_reading: false,
        cq_practice: false,
        mcq_practice: false,
        test_paper_solve: false,
        revision_done: false,
      },
      completion_percentage: 0,
    };

    setData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => {
        if (subject.subject_id !== subjectId) return subject;

        const updatedChapters = [...subject.chapters, newChapter].sort(
          (a, b) => a.chapter_number - b.chapter_number
        );

        return {
          ...subject,
          chapters: updatedChapters,
        };
      });

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };

  // Handler: Add New Subject
  const handleAddSubject = (subjectName: string, englishName: string, themeColor: string) => {
    const newSubject: Subject = {
      subject_id: `subj_${Date.now()}`,
      subject_name: subjectName,
      english_name: englishName,
      theme_color: themeColor,
      chapters: [],
    };

    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  // Handler: Export Data as JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SSC_2028_Syllabus_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler: Import Data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.subjects && imported.student_profile) {
          setData(imported);
          alert('ডেটা সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!');
        } else {
          alert('অবৈধ JSON ফাইল ফরম্যাট।');
        }
      } catch (err) {
        alert('ফাইল লোড করতে সমস্যা হয়েছে। দয়া করে সঠিক JSON ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Student Profile Header */}
      <StudentHeader
        profile={data.student_profile}
        totalChapters={overallStats.totalChapters}
        completedChapters={overallStats.completedChapters}
        overallPercentage={overallStats.overallPercentage}
        activeExamTitle={activeExamTitle}
        activeExamPercentage={overallStats.activeExamPercentage}
        isAdminMode={isAdminMode}
        isCloudSynced={isCloudSynced}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onResetData={handleResetMilestonesOnly}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onOpenAdminModal={() => {
          setPendingAdminAction(null);
          setIsAdminPasscodeModalOpen(true);
        }}
        onToggleAdminMode={handleToggleAdminMode}
        onOpenResetProgressModal={() => setIsResetProgressModalOpen(true)}
        onOpenAppInfoModal={() => setIsAppInfoModalOpen(true)}
        onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
        onOpenCentralAdminHub={() => setIsCentralAdminOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Sticky Exam Filter Bar */}
      <ExamFilterBar
        syllabuses={data.custom_exam_syllabuses}
        activeExamId={activeExamId}
        subjects={data.subjects}
        onSelectExam={(examId) => setActiveExamId(examId)}
        onOpenCustomManager={() => setIsCustomManagerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Overall Statistics Banner & Search */}
        <OverallStatsSummary
          activeExamId={activeExamId}
          syllabuses={data.custom_exam_syllabuses}
          subjects={data.subjects}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddSubject={() => handleRequireAdmin(() => setIsAddSubjectOpen(true))}
          isAdminMode={isAdminMode}
        />

        {/* Subjects Sections */}
        <div className="space-y-6">
          {data.subjects.map((subject) => (
            <SubjectSection
              key={subject.subject_id}
              subject={subject}
              activeExamId={activeExamId}
              syllabuses={data.custom_exam_syllabuses}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              isAdminMode={isAdminMode}
              onRequireAdmin={handleRequireAdmin}
              onToggleMilestone={handleToggleMilestone}
              onSetAllMilestones={handleSetAllMilestones}
              onToggleExamInclusion={handleToggleExamInclusion}
              onOpenNotes={(chapter) => setEditingChapterForNotes(chapter)}
              onEditChapter={(chapter) => setEditingChapterForEdit(chapter)}
              onDeleteChapter={handleDeleteChapter}
              onAddChapterToSubject={(subjectId) => {
                setTargetSubjectForAddChapter(subjectId);
                setIsAddChapterOpen(true);
              }}
              onBatchSetSubjectMilestones={handleBatchSetSubjectMilestones}
            />
          ))}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SSC {data.student_profile.ssc_batch} {data.student_profile.group} Group Syllabus & Study Tracker</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Student: <strong className="text-slate-600">{currentUser?.displayName || data.student_profile.full_name}</strong>
            </span>
            <span>•</span>
            <span>
              Target: <strong className="text-emerald-700">GPA {data.student_profile.target_gpa}</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        profile={data.student_profile}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <AddChapterModal
        isOpen={isAddChapterOpen}
        subjects={data.subjects}
        defaultSubjectId={targetSubjectForAddChapter}
        syllabuses={data.custom_exam_syllabuses}
        onClose={() => {
          setIsAddChapterOpen(false);
          setTargetSubjectForAddChapter(undefined);
        }}
        onAdd={handleAddChapter}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <ChapterNotesModal
        isOpen={!!editingChapterForNotes}
        chapter={editingChapterForNotes}
        onClose={() => setEditingChapterForNotes(null)}
        onSaveNotes={handleSaveNotes}
      />

      <EditChapterModal
        isOpen={!!editingChapterForEdit}
        chapter={editingChapterForEdit}
        syllabuses={data.custom_exam_syllabuses}
        onClose={() => setEditingChapterForEdit(null)}
        onSave={handleSaveChapterEdit}
      />

      <CustomSyllabusManagerModal
        isOpen={isCustomManagerOpen}
        syllabuses={data.custom_exam_syllabuses}
        subjects={data.subjects}
        initialExamId={activeExamId}
        onClose={() => setIsCustomManagerOpen(false)}
        onToggleExamInclusion={handleToggleExamInclusion}
        onBatchToggleSubjectExam={handleBatchToggleSubjectExam}
        onUpdateExamTitle={handleUpdateExamTitle}
      />

      <AdminPasscodeModal
        isOpen={isAdminPasscodeModalOpen}
        onClose={() => {
          setIsAdminPasscodeModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={handleAdminUnlockSuccess}
      />

      <ResetProgressModal
        isOpen={isResetProgressModalOpen}
        onClose={() => setIsResetProgressModalOpen(false)}
        onResetMilestonesOnly={handleResetMilestonesOnly}
        onMasterReset={handleMasterReset}
      />

      <AppInfoModal
        isOpen={isAppInfoModalOpen}
        isAdminMode={isAdminMode}
        onClose={() => setIsAppInfoModalOpen(false)}
        onOpenAdminPasscodeModal={() => {
          setIsAppInfoModalOpen(false);
          setIsAdminPasscodeModalOpen(true);
        }}
        onExitAdminMode={() => {
          setIsAdminMode(false);
          setIsAppInfoModalOpen(false);
        }}
      />

      {/* Mandatory Auth Modal when not signed in, or voluntary when clicked */}
      <AuthModal
        isOpen={!currentUser || isAuthModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }}
        isMandatory={!currentUser}
      />

      {/* Mandatory Unique Username Setup Modal if signed in but no username chosen yet */}
      {currentUser && (
        <UsernameSetupModal
          isOpen={needsUsernameSetup}
        />
      )}

      <ExportSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        data={data}
        activeExamTitle={activeExamTitle}
        overallPercentage={overallStats.overallPercentage}
        completedChapters={overallStats.completedChapters}
        totalChapters={overallStats.totalChapters}
      />

      <CentralizedAdminDashboardModal
        isOpen={isCentralAdminOpen}
        onClose={() => setIsCentralAdminOpen(false)}
        subjectsList={data.subjects}
      />

      <OfflineIndicator />
    </div>
  );
}
