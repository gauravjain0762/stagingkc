import { useState, useRef, useEffect } from 'react';
import ImageCropper from './ImageCropper';
import './EducatorEducationManagement.css';

const tabs = ['Published', 'Drafts', 'Under Review', 'Inactive'];
const steps = [
  'Course Details',
  'Modules',
  'Lessons',
  'Quiz',
  'Assessment',
  'Pricing',
  'Access',
  'Preview'
];

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const InactiveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="15" height="16" rx="2" />
    <polygon points="23 7 17 12 23 17 23 7" />
  </svg>
);

const AudioIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DropVideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const DropAudioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const DropImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const DropDocIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const DropDownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const ScissorsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const PlayIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const RotateIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const blankCourse = () => ({
  title: '',
  description: '',
  coverImage: '',
  category: 'Safety & Consent',
  level: 'Beginner',
  format: 'Course',
  modules: [],
  quizQuestions: [
    {
      id: 'q-1',
      question: 'What is the primary factor when assessing consent?',
      options: [
        'Verbal agreement only',
        'Enthusiastic, continuous, and revocable agreement',
        'Prior relationship',
        'Absence of a "no"'
      ],
      correctIndex: 1
    }
  ],
  assessment: {
    enabled: true,
    type: 'Practical Case Study',
    passingScore: '70'
  },
  assessmentQuestions: [
    {
      id: 'aq-1',
      prompt: 'Scenario Analysis: Describe how you would conduct an initial boundary discussion with a partner.',
      type: 'Essay / Written Reflection',
      rubric: 'Must address active consent, risk negotiation, and safety protocols.'
    }
  ],
  pricing: 'Free',
  price: '',
  access: 'All learners'
});

export default function EducatorEducationManagement({
  courses,
  onCoursesChange,
  builderOpen: controlledBuilderOpen,
  onBuilderOpenChange,
  startNewTrigger,
}) {
  const [activeTab, setActiveTab] = useState('Published');
  const [localBuilderOpen, setLocalBuilderOpen] = useState(false);
  const builderOpen = controlledBuilderOpen !== undefined ? controlledBuilderOpen : localBuilderOpen;
  const setBuilderOpen = (val) => {
    setLocalBuilderOpen(val);
    onBuilderOpenChange?.(val);
  };
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(blankCourse());
  const [editingId, setEditingId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [lessonMediaType, setLessonMediaType] = useState('Video');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (startNewTrigger > 0) {
      startNew();
    }
  }, [startNewTrigger]);

  // Hidden File Input Refs
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const downloadInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  // Cover Image State
  const [coverCropFile, setCoverCropFile] = useState(null);

  // Player Element Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Video State & Trimmer
  const [videoFile, setVideoFile] = useState(null);
  const [videoTrim, setVideoTrim] = useState({ start: 0, end: 60, current: 0, isPlayingTrim: false });

  // Audio State & Trimmer
  const [audioFile, setAudioFile] = useState(null);
  const [audioTrim, setAudioTrim] = useState({ start: 0, end: 180, current: 0, isPlayingTrim: false });

  // Image State & Trimmer / Cropper
  const [imageFile, setImageFile] = useState(null);
  const [imageSettings, setImageSettings] = useState({ zoom: 1, rotation: 0, aspect: '16:9' });

  // Document State & Trimmer / Page range
  const [docFile, setDocFile] = useState(null);

  // Download State & Packager
  const [downloadFile, setDownloadFile] = useState(null);

  // Quiz creation state
  const [quizForm, setQuizForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    editingId: null
  });

  // Assessment creation state
  const [assessmentPrompt, setAssessmentPrompt] = useState('');
  const [assessmentType, setAssessmentType] = useState('Essay / Written Reflection');
  const [assessmentRubric, setAssessmentRubric] = useState('');
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);

  const update = values => setCourse(previous => ({ ...previous, ...values }));

  // Cover Image Handlers
  const handleCoverImageSelect = e => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverCropFile(file);
    }
    e.target.value = '';
  };

  const handleCoverCropSave = croppedFile => {
    const reader = new FileReader();
    reader.onload = ev => {
      update({ coverImage: ev.target?.result });
      setCoverCropFile(null);
      setNotice('Course cover image updated.');
      setTimeout(() => setNotice(''), 3000);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleCoverCropSkip = () => {
    if (coverCropFile) {
      const reader = new FileReader();
      reader.onload = ev => {
        update({ coverImage: ev.target?.result });
        setCoverCropFile(null);
        setNotice('Original image set as cover.');
        setTimeout(() => setNotice(''), 3000);
      };
      reader.readAsDataURL(coverCropFile);
    } else {
      setCoverCropFile(null);
    }
  };

  const handleRemoveCoverImage = () => {
    update({ coverImage: '' });
    setNotice('Course cover image removed.');
    setTimeout(() => setNotice(''), 3000);
  };

  const startNew = () => {
    setCourse(blankCourse());
    setEditingId(null);
    setStep(0);
    setError('');
    setActiveModule(0);
    setActiveLesson(0);
    setVideoFile(null);
    setAudioFile(null);
    setImageFile(null);
    setDocFile(null);
    setDownloadFile(null);
    setQuizForm({ question: '', options: ['', '', '', ''], correctIndex: 0, editingId: null });
    setAssessmentPrompt('');
    setAssessmentRubric('');
    setEditingAssessmentId(null);
    setBuilderOpen(true);
  };

  const editDraft = item => {
    setCourse({ ...blankCourse(), ...item });
    setEditingId(item.id);
    setStep(0);
    setError('');
    setActiveModule(0);
    setActiveLesson(0);
    setVideoFile(null);
    setAudioFile(null);
    setImageFile(null);
    setDocFile(null);
    setDownloadFile(null);
    setQuizForm({ question: '', options: ['', '', '', ''], correctIndex: 0, editingId: null });
    setAssessmentPrompt('');
    setAssessmentRubric('');
    setEditingAssessmentId(null);
    setBuilderOpen(true);
  };

  const saveCourse = status => {
    const saved = {
      ...course,
      id: editingId || `educator-course-${Date.now()}`,
      status,
      updated: status === 'Under Review' ? 'Submitted for KC Admin review' : 'Saved as draft',
      learners: course.learners || 0
    };
    onCoursesChange(previous =>
      editingId ? previous.map(item => (item.id === editingId ? saved : item)) : [saved, ...previous]
    );
    setBuilderOpen(false);
    setError('');
    if (status === 'Under Review') setActiveTab('Under Review');
    setNotice(status === 'Under Review' ? 'Course submitted for KC Admin review. It is not public yet.' : 'Course draft saved.');
    window.setTimeout(() => setNotice(''), 4000);
  };

  const submitForReview = () => {
    if (!course.title.trim() || !course.description.trim()) {
      setStep(0);
      setError('Add a course title and description before submitting.');
      return;
    }
    if (!course.modules.length || !course.modules.some(module => module.lessons?.length)) {
      setStep(1);
      setError('Add at least one module and one lesson before submitting.');
      return;
    }
    saveCourse('Under Review');
  };

  const addModule = () => {
    if (!moduleTitle.trim()) return;
    update({ modules: [...course.modules, { title: moduleTitle.trim(), lessons: [] }] });
    setModuleTitle('');
  };

  const getLessonTitle = lesson => (typeof lesson === 'string' ? lesson : lesson?.title || 'Lesson');

  const addLesson = () => {
    if (!lessonTitle.trim() || !course.modules[activeModule]) return;
    const newLessonObj = {
      id: `lesson-${Date.now()}`,
      title: lessonTitle.trim(),
      mediaType: 'Video',
      videoUrl: '',
      audioUrl: '',
      images: [],
      notes: '',
      downloads: []
    };
    const modules = course.modules.map((module, index) =>
      index === activeModule
        ? { ...module, lessons: [...(module.lessons || []), newLessonObj] }
        : module
    );
    update({ modules });
    setActiveLesson((course.modules[activeModule]?.lessons?.length || 0));
    setLessonTitle('');
  };

  // Video Handlers & Trimmer
  const handleVideoSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoFile({ file, url, name: file.name, size: file.size, duration: 60 });
    setVideoTrim({ start: 0, end: 60, current: 0, isPlayingTrim: false });
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.max(1, Math.floor(videoRef.current.duration));
      setVideoFile(prev => prev ? { ...prev, duration: dur } : null);
      setVideoTrim({ start: 0, end: dur, current: 0, isPlayingTrim: false });
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setVideoTrim(prev => {
      if (prev.isPlayingTrim && cur >= prev.end) {
        videoRef.current.pause();
        return { ...prev, current: cur, isPlayingTrim: false };
      }
      return { ...prev, current: cur };
    });
  };

  const handlePlayTrimmedVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = videoTrim.start;
    videoRef.current.play();
    setVideoTrim(prev => ({ ...prev, isPlayingTrim: true }));
  };

  const handleSetVideoStartCurrent = () => {
    if (!videoRef.current) return;
    const cur = Math.min(videoRef.current.currentTime, videoTrim.end - 1);
    setVideoTrim(prev => ({ ...prev, start: Math.max(0, cur) }));
  };

  const handleSetVideoEndCurrent = () => {
    if (!videoRef.current) return;
    const cur = Math.max(videoRef.current.currentTime, videoTrim.start + 1);
    setVideoTrim(prev => ({ ...prev, end: Math.min(videoFile?.duration || 1000, cur) }));
  };

  const attachVideoToLesson = () => {
    if (!videoFile) return;
    const updatedModules = course.modules.map((m, mIdx) => {
      if (mIdx !== activeModule) return m;
      const lessons = (m.lessons || []).map((l, lIdx) => {
        if (lIdx !== activeLesson) return l;
        const lessonObj = typeof l === 'string' ? { title: l } : { ...l };
        return {
          ...lessonObj,
          video: {
            name: videoFile.name,
            url: videoFile.url,
            size: videoFile.size,
            trimStart: videoTrim.start,
            trimEnd: videoTrim.end,
            duration: videoTrim.end - videoTrim.start
          }
        };
      });
      return { ...m, lessons };
    });
    update({ modules: updatedModules });
    setNotice(`Trimmed video (${formatTime(videoTrim.start)} - ${formatTime(videoTrim.end)}) attached to lesson.`);
    setTimeout(() => setNotice(''), 3500);
  };

  // Audio Handlers & Trimmer
  const handleAudioSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioFile({ file, url, name: file.name, size: file.size, duration: 180 });
    setAudioTrim({ start: 0, end: 180, current: 0, isPlayingTrim: false });
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = Math.max(1, Math.floor(audioRef.current.duration));
      setAudioFile(prev => prev ? { ...prev, duration: dur } : null);
      setAudioTrim({ start: 0, end: dur, current: 0, isPlayingTrim: false });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setAudioTrim(prev => {
      if (prev.isPlayingTrim && cur >= prev.end) {
        audioRef.current.pause();
        return { ...prev, current: cur, isPlayingTrim: false };
      }
      return { ...prev, current: cur };
    });
  };

  const handlePlayTrimmedAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = audioTrim.start;
    audioRef.current.play();
    setAudioTrim(prev => ({ ...prev, isPlayingTrim: true }));
  };

  const handleSetAudioStartCurrent = () => {
    if (!audioRef.current) return;
    const cur = Math.min(audioRef.current.currentTime, audioTrim.end - 1);
    setAudioTrim(prev => ({ ...prev, start: Math.max(0, cur) }));
  };

  const handleSetAudioEndCurrent = () => {
    if (!audioRef.current) return;
    const cur = Math.max(audioRef.current.currentTime, audioTrim.start + 1);
    setAudioTrim(prev => ({ ...prev, end: Math.min(audioFile?.duration || 1000, cur) }));
  };

  const attachAudioToLesson = () => {
    if (!audioFile) return;
    const updatedModules = course.modules.map((m, mIdx) => {
      if (mIdx !== activeModule) return m;
      const lessons = (m.lessons || []).map((l, lIdx) => {
        if (lIdx !== activeLesson) return l;
        const lessonObj = typeof l === 'string' ? { title: l } : { ...l };
        return {
          ...lessonObj,
          audio: {
            name: audioFile.name,
            url: audioFile.url,
            size: audioFile.size,
            trimStart: audioTrim.start,
            trimEnd: audioTrim.end,
            duration: audioTrim.end - audioTrim.start
          }
        };
      });
      return { ...m, lessons };
    });
    update({ modules: updatedModules });
    setNotice(`Trimmed audio (${formatTime(audioTrim.start)} - ${formatTime(audioTrim.end)}) attached to lesson.`);
    setTimeout(() => setNotice(''), 3500);
  };

  // Image Handlers & Cropper / Trimmer
  const handleImageSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageFile({ file, url, name: file.name, size: file.size });
    setImageSettings({ zoom: 1, rotation: 0, aspect: '16:9' });
  };

  const attachImageToLesson = () => {
    if (!imageFile) return;
    const updatedModules = course.modules.map((m, mIdx) => {
      if (mIdx !== activeModule) return m;
      const lessons = (m.lessons || []).map((l, lIdx) => {
        if (lIdx !== activeLesson) return l;
        const lessonObj = typeof l === 'string' ? { title: l } : { ...l };
        return {
          ...lessonObj,
          image: {
            name: imageFile.name,
            url: imageFile.url,
            aspect: imageSettings.aspect,
            zoom: imageSettings.zoom,
            rotation: imageSettings.rotation
          }
        };
      });
      return { ...m, lessons };
    });
    update({ modules: updatedModules });
    setNotice(`Cropped image (${imageSettings.aspect}) attached to lesson.`);
    setTimeout(() => setNotice(''), 3500);
  };

  // Document Handlers
  const handleDocSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile({ file, name: file.name, size: file.size, startPage: 1, endPage: 10, mode: 'range', sectionTitle: '' });
  };

  const attachDocToLesson = () => {
    if (!docFile) return;
    const updatedModules = course.modules.map((m, mIdx) => {
      if (mIdx !== activeModule) return m;
      const lessons = (m.lessons || []).map((l, lIdx) => {
        if (lIdx !== activeLesson) return l;
        const lessonObj = typeof l === 'string' ? { title: l } : { ...l };
        return {
          ...lessonObj,
          document: {
            name: docFile.name,
            size: docFile.size,
            mode: docFile.mode,
            range: docFile.mode === 'range' ? `Pages ${docFile.startPage} - ${docFile.endPage}` : 'Full document',
            sectionTitle: docFile.sectionTitle
          }
        };
      });
      return { ...m, lessons };
    });
    update({ modules: updatedModules });
    setNotice(`Document (${docFile.mode === 'range' ? `Pages ${docFile.startPage}-${docFile.endPage}` : 'Full'}) attached to lesson.`);
    setTimeout(() => setNotice(''), 3500);
  };

  // Download Handlers
  const handleDownloadSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDownloadFile({ file, name: file.name, size: file.size, accessRule: 'All learners', label: file.name, notes: '' });
  };

  const attachDownloadToLesson = () => {
    if (!downloadFile) return;
    const updatedModules = course.modules.map((m, mIdx) => {
      if (mIdx !== activeModule) return m;
      const lessons = (m.lessons || []).map((l, lIdx) => {
        if (lIdx !== activeLesson) return l;
        const lessonObj = typeof l === 'string' ? { title: l } : { ...l };
        return {
          ...lessonObj,
          download: {
            name: downloadFile.name,
            size: downloadFile.size,
            label: downloadFile.label || downloadFile.name,
            accessRule: downloadFile.accessRule,
            notes: downloadFile.notes
          }
        };
      });
      return { ...m, lessons };
    });
    update({ modules: updatedModules });
    setNotice(`Downloadable material (${downloadFile.label || downloadFile.name}) attached to lesson.`);
    setTimeout(() => setNotice(''), 3500);
  };

  // Quiz Question Handlers
  const handleSaveQuizQuestion = () => {
    if (!quizForm.question.trim()) {
      setError('Please enter a question text for the quiz.');
      return;
    }
    const filteredOptions = quizForm.options.map((opt, i) => opt.trim() || `Option ${i + 1}`);
    const questions = course.quizQuestions || [];

    if (quizForm.editingId) {
      const updated = questions.map(q =>
        q.id === quizForm.editingId
          ? {
              ...q,
              question: quizForm.question.trim(),
              options: filteredOptions,
              correctIndex: quizForm.correctIndex
            }
          : q
      );
      update({ quizQuestions: updated });
    } else {
      const newQuestion = {
        id: `q-${Date.now()}`,
        question: quizForm.question.trim(),
        options: filteredOptions,
        correctIndex: quizForm.correctIndex
      };
      update({ quizQuestions: [...questions, newQuestion] });
    }

    setQuizForm({ question: '', options: ['', '', '', ''], correctIndex: 0, editingId: null });
    setError('');
  };

  const handleEditQuizQuestion = q => {
    setQuizForm({
      question: q.question,
      options: [...(q.options || ['', '', '', ''])],
      correctIndex: q.correctIndex ?? 0,
      editingId: q.id
    });
  };

  const handleDeleteQuizQuestion = id => {
    update({ quizQuestions: (course.quizQuestions || []).filter(q => q.id !== id) });
    if (quizForm.editingId === id) {
      setQuizForm({ question: '', options: ['', '', '', ''], correctIndex: 0, editingId: null });
    }
  };

  // Assessment Question Handlers
  const handleSaveAssessmentQuestion = () => {
    if (!assessmentPrompt.trim()) {
      setError('Please enter an assessment prompt or task.');
      return;
    }
    const current = course.assessmentQuestions || [];
    if (editingAssessmentId) {
      const updated = current.map(item =>
        item.id === editingAssessmentId
          ? {
              ...item,
              prompt: assessmentPrompt.trim(),
              type: assessmentType,
              rubric: assessmentRubric.trim()
            }
          : item
      );
      update({ assessmentQuestions: updated });
      setEditingAssessmentId(null);
    } else {
      const newItem = {
        id: `aq-${Date.now()}`,
        prompt: assessmentPrompt.trim(),
        type: assessmentType,
        rubric: assessmentRubric.trim()
      };
      update({ assessmentQuestions: [...current, newItem] });
    }
    setAssessmentPrompt('');
    setAssessmentRubric('');
    setError('');
  };

  const handleEditAssessmentQuestion = item => {
    setAssessmentPrompt(item.prompt);
    setAssessmentType(item.type || 'Essay / Written Reflection');
    setAssessmentRubric(item.rubric || '');
    setEditingAssessmentId(item.id);
  };

  const handleDeleteAssessmentQuestion = id => {
    update({ assessmentQuestions: (course.assessmentQuestions || []).filter(item => item.id !== id) });
    if (editingAssessmentId === id) {
      setAssessmentPrompt('');
      setAssessmentRubric('');
      setEditingAssessmentId(null);
    }
  };

  const visibleCourses = courses.filter(item =>
    activeTab === 'Inactive'
      ? item.status === 'Inactive' || item.status === 'Archived'
      : item.status === activeTab
  );
  const activeModuleData = course.modules[activeModule];
  const activeLessonsList = activeModuleData?.lessons || [];
  const selectedLesson = activeLessonsList[activeLesson] || activeLessonsList[0];

  if (builderOpen) {
    return (
      <section className="eem-builder">
        <div className="eem-builder-head">
          <button
            type="button"
            className="eem-back-icon-btn"
            onClick={() => setBuilderOpen(false)}
            aria-label="Back to My Education"
            title="Back to My Education"
          >
            <BackIcon />
          </button>
          <div>
            <span>COURSE BUILDER</span>
            <h3>{editingId ? 'Edit course draft' : 'Create course'}</h3>
            <p>Build the learning structure, review pricing and access, then send it to KC Admin.</p>
          </div>
          <button type="button" className="eem-save-draft" onClick={() => saveCourse('Draft')}>
            Save Draft
          </button>
        </div>

        {/* Stepper with 8 points */}
        <ol className="eem-stepper">
          {steps.map((label, index) => {
            const isDone = step > index;
            const isActive = step === index;
            return (
              <li key={label} className={`${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(index);
                    setError('');
                  }}
                >
                  <span className="eem-step-num">
                    {isDone ? <CheckIcon /> : index + 1}
                  </span>
                  <b>{label}</b>
                </button>
              </li>
            );
          })}
        </ol>

        {error && <div className="eem-error" role="alert">{error}</div>}

        <div className="eem-step-panel">
          {/* STEP 0: COURSE DETAILS */}
          {step === 0 && (
            <>
              <span className="eem-step-kicker">01 · COURSE DETAILS</span>
              <h2>Set up the basics</h2>

              {/* Cover Image Adder */}
              <div className="eem-cover-adder">
                <div className="eem-cover-adder-header">
                  <div>
                    <span className="eem-cover-adder-title">Course Cover Image</span>
                    <p className="eem-cover-adder-sub">Upload a visual cover or banner for your course. Recommended 16:9 or 2:1 ratio.</p>
                  </div>
                  {course.coverImage && (
                    <div className="eem-cover-btn-row">
                      <button
                        type="button"
                        className="eem-cover-action-btn eem-cover-change-btn"
                        onClick={() => coverImageInputRef.current?.click()}
                      >
                        <EditIcon /> Change Cover
                      </button>
                      <button
                        type="button"
                        className="eem-cover-action-btn eem-cover-remove-btn"
                        onClick={handleRemoveCoverImage}
                      >
                        <TrashIcon /> Remove
                      </button>
                    </div>
                  )}
                </div>

                {course.coverImage ? (
                  <div
                    className="eem-cover-preview-card"
                    onClick={() => coverImageInputRef.current?.click()}
                    title="Click to change or re-crop cover image"
                  >
                    <img src={course.coverImage} alt="Course cover banner" className="eem-cover-preview-img" />
                    <div className="eem-cover-preview-overlay">
                      <EditIcon />
                      <span>Change cover image</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="eem-upload-dropzone eem-cover-dropzone"
                    onClick={() => coverImageInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      handleCoverImageSelect({ target: { files: e.dataTransfer.files } });
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && coverImageInputRef.current?.click()}
                  >
                    <span className="eem-drop-icon"><DropImageIcon /></span>
                    <b>Drag & drop course cover image here or click to browse</b>
                    <small>Supports PNG, JPG, WebP · Interactive cropper opens on selection</small>
                    <button
                      type="button"
                      className="eem-cover-browse-btn"
                      onClick={e => {
                        e.stopPropagation();
                        coverImageInputRef.current?.click();
                      }}
                    >
                      Browse Cover Image
                    </button>
                  </div>
                )}

                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleCoverImageSelect}
                />
              </div>

              <div className="eem-fields">
                <label>
                  Course title
                  <input
                    value={course.title}
                    onChange={event => update({ title: event.target.value })}
                    placeholder="e.g. Consent Foundations"
                  />
                </label>
                <label>
                  Category
                  <select
                    value={course.category}
                    onChange={event => update({ category: event.target.value })}
                  >
                    {['Safety & Consent', 'Communication', 'Rope', 'Power Exchange', 'Sensation', 'Other'].map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Level
                  <select
                    value={course.level}
                    onChange={event => update({ level: event.target.value })}
                  >
                    {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Format
                  <select
                    value={course.format}
                    onChange={event => update({ format: event.target.value })}
                  >
                    {['Course', 'Webinar', 'Workshop', 'Recorded class'].map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="eem-wide">
                  Description
                  <textarea
                    rows="4"
                    value={course.description}
                    onChange={event => update({ description: event.target.value })}
                    placeholder="What will learners explore and take away?"
                  />
                </label>
              </div>
            </>
          )}

          {/* STEP 1: MODULES */}
          {step === 1 && (
            <>
              <span className="eem-step-kicker">02 · MODULES</span>
              <h2>Organize the course</h2>
              <p className="eem-help">Modules group related lessons into a clear learning journey.</p>
              <div className="eem-add-row">
                <input
                  value={moduleTitle}
                  onChange={event => setModuleTitle(event.target.value)}
                  onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addModule())}
                  placeholder="Module name, e.g. Foundations"
                />
                <button type="button" onClick={addModule}>＋ Add Module</button>
              </div>
              <div className="eem-structure-list">
                {course.modules.map((module, index) => (
                  <div key={`${module.title}-${index}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <b>{module.title}</b>
                    <small>{module.lessons?.length || 0} lessons</small>
                    <button
                      type="button"
                      onClick={() => update({ modules: course.modules.filter((_, i) => i !== index) })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {!course.modules.length && (
                <div className="eem-empty-inline">No modules yet. Add the first module above.</div>
              )}
            </>
          )}

          {/* STEP 2: LESSONS (WITH MEDIA SUB-TABS & TRIMMERS) */}
          {step === 2 && (
            <>
              <span className="eem-step-kicker">03 · LESSONS</span>
              <h2>Add lessons and media content</h2>
              <p className="eem-help">
                Create lessons inside each module, then attach Video, Audio, Images, Documents, or Downloads with trimming and formatting tools.
              </p>

              {course.modules.length ? (
                <>
                  <label className="eem-module-select">
                    Choose a module
                    <select
                      value={activeModule}
                      onChange={event => {
                        setActiveModule(Number(event.target.value));
                        setActiveLesson(0);
                      }}
                    >
                      {course.modules.map((module, index) => (
                        <option key={`${module.title}-${index}`} value={index}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="eem-add-row">
                    <input
                      value={lessonTitle}
                      onChange={event => setLessonTitle(event.target.value)}
                      onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addLesson())}
                      placeholder="Lesson title, e.g. Understanding Boundaries"
                    />
                    <button type="button" onClick={addLesson}>＋ Add Lesson</button>
                  </div>

                  {/* Lessons list */}
                  <div className="eem-structure-list">
                    {activeLessonsList.map((lesson, index) => {
                      const title = getLessonTitle(lesson);
                      const isSelected = activeLesson === index;
                      const hasVideo = lesson?.video;
                      const hasAudio = lesson?.audio;
                      return (
                        <div
                          key={`${title}-${index}`}
                          className={`eem-lesson-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => setActiveLesson(index)}
                        >
                          <span>{index + 1}</span>
                          <b>{title}</b>
                          {hasVideo && <small className="eem-attached-tag">🎬 Video</small>}
                          {hasAudio && <small className="eem-attached-tag">🎙️ Audio</small>}
                          <small>{isSelected ? 'Active Lesson' : 'Click to edit'}</small>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              const updatedModules = course.modules.map((module, i) =>
                                i === activeModule
                                  ? {
                                      ...module,
                                      lessons: module.lessons.filter((_, lessonIndex) => lessonIndex !== index)
                                    }
                                  : module
                              );
                              update({ modules: updatedModules });
                              if (activeLesson >= index && activeLesson > 0) {
                                setActiveLesson(activeLesson - 1);
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {activeLessonsList.length > 0 && selectedLesson ? (
                    <div className="eem-lesson-media-section">
                      <div className="eem-media-section-head">
                        <div>
                          <span className="eem-mini-kicker">LESSON CONTENT</span>
                          <h4>Media & Resources: {getLessonTitle(selectedLesson)}</h4>
                        </div>
                      </div>

                      {/* 5 Media Sub-Tabs */}
                      <div className="eem-media-tabs">
                        {[
                          { key: 'Video', label: 'Video', icon: <VideoIcon /> },
                          { key: 'Audio', label: 'Audio', icon: <AudioIcon /> },
                          { key: 'Images', label: 'Images', icon: <ImageIcon /> },
                          { key: 'Documents/resources', label: 'Documents/resources', icon: <DocIcon /> },
                          { key: 'Downloads', label: 'Downloads', icon: <DownloadIcon /> }
                        ].map(t => (
                          <button
                            key={t.key}
                            type="button"
                            className={`eem-media-tab-btn ${lessonMediaType === t.key ? 'active' : ''}`}
                            onClick={() => setLessonMediaType(t.key)}
                          >
                            {t.icon}
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Hidden File Inputs */}
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={handleVideoSelect}
                      />
                      <input
                        type="file"
                        ref={audioInputRef}
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={handleAudioSelect}
                      />
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                      />
                      <input
                        type="file"
                        ref={docInputRef}
                        accept=".pdf,.doc,.docx,.epub,.txt"
                        style={{ display: 'none' }}
                        onChange={handleDocSelect}
                      />
                      <input
                        type="file"
                        ref={downloadInputRef}
                        accept="*/*"
                        style={{ display: 'none' }}
                        onChange={handleDownloadSelect}
                      />

                      {/* Media Panels */}
                      <div className="eem-media-panel">
                        {/* 1. VIDEO TAB */}
                        {lessonMediaType === 'Video' && (
                          <div className="eem-media-placeholder-box">
                            <div className="eem-media-placeholder-icon">
                              <VideoIcon />
                            </div>
                            <h5>Video Lesson Creator</h5>
                            <p>Upload a video to trim and optimize, or embed a stream URL for this lesson.</p>

                            <div className="eem-media-form-grid">
                              <label>
                                Video URL / Embed link (optional)
                                <input placeholder="https://vimeo.com/... or https://youtube.com/..." />
                              </label>
                              <label>
                                Duration (MM:SS)
                                <input
                                  value={videoFile ? formatTime(videoTrim.end - videoTrim.start) : ''}
                                  placeholder="e.g. 15:30"
                                  readOnly={!!videoFile}
                                />
                              </label>
                              <label className="eem-wide">
                                Video overview & key takeaways
                                <textarea rows="2" placeholder="Brief bullet points or timestamps for learners..." />
                              </label>
                            </div>

                            {/* Video Trimmer View when video is selected */}
                            {videoFile ? (
                              <div className="eem-trimmer-card">
                                <div className="eem-trimmer-header">
                                  <div className="eem-trimmer-title-group">
                                    <span className="eem-trimmer-badge"><ScissorsIcon /> VIDEO TRIMMER</span>
                                    <h4>{videoFile.name}</h4>
                                  </div>
                                  <span className="eem-file-info-badge">{formatFileSize(videoFile.size)}</span>
                                </div>

                                <video
                                  ref={videoRef}
                                  src={videoFile.url}
                                  onLoadedMetadata={handleVideoLoadedMetadata}
                                  onTimeUpdate={handleVideoTimeUpdate}
                                  controls
                                  className="eem-video-preview"
                                />

                                <div className="eem-trim-readouts">
                                  <div className="eem-readout-pill">
                                    <small>Playhead</small>
                                    <b>{formatTime(videoTrim.current)}</b>
                                  </div>
                                  <div className="eem-readout-pill highlight">
                                    <small>Trim Start</small>
                                    <b>{formatTime(videoTrim.start)}</b>
                                  </div>
                                  <div className="eem-readout-pill highlight">
                                    <small>Trim End</small>
                                    <b>{formatTime(videoTrim.end)}</b>
                                  </div>
                                  <div className="eem-readout-pill success">
                                    <small>Trimmed Length</small>
                                    <b>{formatTime(Math.max(0, videoTrim.end - videoTrim.start))}</b>
                                  </div>
                                </div>

                                <div className="eem-timeline-track-wrap">
                                  <div className="eem-slider-row">
                                    <label>Start: {formatTime(videoTrim.start)}</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max={Math.max(0, videoTrim.end - 1)}
                                      value={videoTrim.start}
                                      onChange={e => setVideoTrim({ ...videoTrim, start: Number(e.target.value) })}
                                      className="eem-range-slider"
                                    />
                                  </div>
                                  <div className="eem-slider-row">
                                    <label>End: {formatTime(videoTrim.end)}</label>
                                    <input
                                      type="range"
                                      min={videoTrim.start + 1}
                                      max={videoFile.duration || 60}
                                      value={videoTrim.end}
                                      onChange={e => setVideoTrim({ ...videoTrim, end: Number(e.target.value) })}
                                      className="eem-range-slider"
                                    />
                                  </div>
                                </div>

                                <div className="eem-trim-quick-btns">
                                  <button type="button" onClick={handleSetVideoStartCurrent}>
                                    <ScissorsIcon /> Set Start ({formatTime(videoTrim.current)})
                                  </button>
                                  <button type="button" onClick={handleSetVideoEndCurrent}>
                                    <ScissorsIcon /> Set End ({formatTime(videoTrim.current)})
                                  </button>
                                  <button type="button" className="eem-trim-play-btn" onClick={handlePlayTrimmedVideo}>
                                    <PlayIcon /> Preview Trim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setVideoTrim({ start: 0, end: videoFile.duration || 60, current: 0, isPlayingTrim: false })}
                                  >
                                    Reset
                                  </button>
                                </div>

                                <div className="eem-trim-actions">
                                  <button type="button" className="eem-apply-trim-btn" onClick={attachVideoToLesson}>
                                    <CheckIcon /> Apply Trim & Save to Lesson
                                  </button>
                                  <button type="button" className="eem-btn-ghost" onClick={() => videoInputRef.current?.click()}>
                                    Replace Video
                                  </button>
                                  <button type="button" className="eem-btn-danger" onClick={() => setVideoFile(null)}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="eem-upload-dropzone"
                                onClick={() => videoInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files?.[0]) {
                                    handleVideoSelect({ target: { files: e.dataTransfer.files } });
                                  }
                                }}
                              >
                                <span className="eem-drop-icon"><DropVideoIcon /></span>
                                <b>Drag & drop video file here or click to browse</b>
                                <small>Supports MP4, WebM, MOV up to 2GB · Automatic video trimmer on selection</small>
                                <button
                                  type="button"
                                  className="eem-upload-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    videoInputRef.current?.click();
                                  }}
                                >
                                  Upload Video File
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. AUDIO TAB */}
                        {lessonMediaType === 'Audio' && (
                          <div className="eem-media-placeholder-box">
                            <div className="eem-media-placeholder-icon">
                              <AudioIcon />
                            </div>
                            <h5>Audio / Podcast Creator</h5>
                            <p>Upload voice recordings, audio guides, or link streaming audio with built-in audio trimming.</p>

                            <div className="eem-media-form-grid">
                              <label>
                                Audio Stream URL (optional)
                                <input placeholder="https://soundcloud.com/... or MP3 audio URL" />
                              </label>
                              <label>
                                Duration
                                <input
                                  value={audioFile ? formatTime(audioTrim.end - audioTrim.start) : ''}
                                  placeholder="e.g. 24:00"
                                  readOnly={!!audioFile}
                                />
                              </label>
                              <label className="eem-wide">
                                Transcript or audio notes
                                <textarea rows="2" placeholder="Add audio transcript, chapter markers, or study tips..." />
                              </label>
                            </div>

                            {/* Audio Trimmer View when audio is selected */}
                            {audioFile ? (
                              <div className="eem-trimmer-card">
                                <div className="eem-trimmer-header">
                                  <div className="eem-trimmer-title-group">
                                    <span className="eem-trimmer-badge"><ScissorsIcon /> AUDIO TRIMMER</span>
                                    <h4>{audioFile.name}</h4>
                                  </div>
                                  <span className="eem-file-info-badge">{formatFileSize(audioFile.size)}</span>
                                </div>

                                <div className="eem-audio-waveform-card">
                                  <div className="eem-waveform-bars">
                                    {Array.from({ length: 28 }).map((_, i) => (
                                      <span
                                        key={i}
                                        style={{ height: `${20 + ((i * 17) % 35)}px` }}
                                        className={(i / 28) * (audioFile.duration || 180) >= audioTrim.start && (i / 28) * (audioFile.duration || 180) <= audioTrim.end ? 'active-bar' : ''}
                                      />
                                    ))}
                                  </div>
                                  <audio
                                    ref={audioRef}
                                    src={audioFile.url}
                                    onLoadedMetadata={handleAudioLoadedMetadata}
                                    onTimeUpdate={handleAudioTimeUpdate}
                                    controls
                                    className="eem-audio-player"
                                  />
                                </div>

                                <div className="eem-trim-readouts">
                                  <div className="eem-readout-pill">
                                    <small>Playhead</small>
                                    <b>{formatTime(audioTrim.current)}</b>
                                  </div>
                                  <div className="eem-readout-pill highlight">
                                    <small>Trim Start</small>
                                    <b>{formatTime(audioTrim.start)}</b>
                                  </div>
                                  <div className="eem-readout-pill highlight">
                                    <small>Trim End</small>
                                    <b>{formatTime(audioTrim.end)}</b>
                                  </div>
                                  <div className="eem-readout-pill success">
                                    <small>Trimmed Length</small>
                                    <b>{formatTime(Math.max(0, audioTrim.end - audioTrim.start))}</b>
                                  </div>
                                </div>

                                <div className="eem-timeline-track-wrap">
                                  <div className="eem-slider-row">
                                    <label>Start: {formatTime(audioTrim.start)}</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max={Math.max(0, audioTrim.end - 1)}
                                      value={audioTrim.start}
                                      onChange={e => setAudioTrim({ ...audioTrim, start: Number(e.target.value) })}
                                      className="eem-range-slider"
                                    />
                                  </div>
                                  <div className="eem-slider-row">
                                    <label>End: {formatTime(audioTrim.end)}</label>
                                    <input
                                      type="range"
                                      min={audioTrim.start + 1}
                                      max={audioFile.duration || 180}
                                      value={audioTrim.end}
                                      onChange={e => setAudioTrim({ ...audioTrim, end: Number(e.target.value) })}
                                      className="eem-range-slider"
                                    />
                                  </div>
                                </div>

                                <div className="eem-trim-quick-btns">
                                  <button type="button" onClick={handleSetAudioStartCurrent}>
                                    <ScissorsIcon /> Set Start ({formatTime(audioTrim.current)})
                                  </button>
                                  <button type="button" onClick={handleSetAudioEndCurrent}>
                                    <ScissorsIcon /> Set End ({formatTime(audioTrim.current)})
                                  </button>
                                  <button type="button" className="eem-trim-play-btn" onClick={handlePlayTrimmedAudio}>
                                    <PlayIcon /> Preview Trim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAudioTrim({ start: 0, end: audioFile.duration || 180, current: 0, isPlayingTrim: false })}
                                  >
                                    Reset
                                  </button>
                                </div>

                                <div className="eem-trim-actions">
                                  <button type="button" className="eem-apply-trim-btn" onClick={attachAudioToLesson}>
                                    <CheckIcon /> Apply Trim & Save to Lesson
                                  </button>
                                  <button type="button" className="eem-btn-ghost" onClick={() => audioInputRef.current?.click()}>
                                    Replace Audio
                                  </button>
                                  <button type="button" className="eem-btn-danger" onClick={() => setAudioFile(null)}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="eem-upload-dropzone"
                                onClick={() => audioInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files?.[0]) {
                                    handleAudioSelect({ target: { files: e.dataTransfer.files } });
                                  }
                                }}
                              >
                                <span className="eem-drop-icon"><DropAudioIcon /></span>
                                <b>Drag & drop audio track here or click to browse</b>
                                <small>Supports MP3, AAC, WAV, FLAC up to 250MB · Interactive audio trimmer on selection</small>
                                <button
                                  type="button"
                                  className="eem-upload-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    audioInputRef.current?.click();
                                  }}
                                >
                                  Upload Audio Track
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. IMAGES TAB */}
                        {lessonMediaType === 'Images' && (
                          <div className="eem-media-placeholder-box">
                            <div className="eem-media-placeholder-icon">
                              <ImageIcon />
                            </div>
                            <h5>Visuals & Slide Gallery</h5>
                            <p>Upload slides or diagrams with crop, zoom, and aspect ratio adjustments.</p>

                            <div className="eem-media-form-grid">
                              <label>
                                Gallery Display Mode
                                <select>
                                  <option>Sequential Slide Deck</option>
                                  <option>Grid Photo Gallery</option>
                                  <option>Infographic Scroll</option>
                                </select>
                              </label>
                              <label>
                                Image Caption / Title
                                <input placeholder="e.g. Figure 1: Safety & Risk Matrix" />
                              </label>
                            </div>

                            {/* Image Cropper / Trimmer View when image is selected */}
                            {imageFile ? (
                              <div className="eem-trimmer-card">
                                <div className="eem-trimmer-header">
                                  <div className="eem-trimmer-title-group">
                                    <span className="eem-trimmer-badge"><ScissorsIcon /> IMAGE CROPPER & TRIMMER</span>
                                    <h4>{imageFile.name}</h4>
                                  </div>
                                  <span className="eem-file-info-badge">{formatFileSize(imageFile.size)}</span>
                                </div>

                                <div className="eem-crop-stage">
                                  <div
                                    className={`eem-crop-viewport aspect-${imageSettings.aspect.replace(':', '-')}`}
                                  >
                                    <img
                                      src={imageFile.url}
                                      alt="Crop preview"
                                      style={{
                                        transform: `scale(${imageSettings.zoom}) rotate(${imageSettings.rotation}deg)`
                                      }}
                                    />
                                    <div className="eem-crop-grid-overlay" />
                                  </div>
                                </div>

                                <div className="eem-crop-controls">
                                  <div className="eem-aspect-selector">
                                    <span className="eem-control-label">Aspect:</span>
                                    {['16:9', '4:3', '1:1', 'Free'].map(ratio => (
                                      <button
                                        key={ratio}
                                        type="button"
                                        className={imageSettings.aspect === ratio ? 'active' : ''}
                                        onClick={() => setImageSettings({ ...imageSettings, aspect: ratio })}
                                      >
                                        {ratio}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="eem-zoom-control">
                                    <span className="eem-control-label">Zoom: {imageSettings.zoom.toFixed(1)}x</span>
                                    <input
                                      type="range"
                                      min="1"
                                      max="3"
                                      step="0.1"
                                      value={imageSettings.zoom}
                                      onChange={e => setImageSettings({ ...imageSettings, zoom: Number(e.target.value) })}
                                      className="eem-range-slider"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    className="eem-btn-ghost"
                                    onClick={() => setImageSettings({ ...imageSettings, rotation: (imageSettings.rotation + 90) % 360 })}
                                  >
                                    <RotateIcon /> Rotate 90°
                                  </button>
                                </div>

                                <div className="eem-trim-actions">
                                  <button type="button" className="eem-apply-trim-btn" onClick={attachImageToLesson}>
                                    <CheckIcon /> Apply Crop & Save to Lesson
                                  </button>
                                  <button type="button" className="eem-btn-ghost" onClick={() => imageInputRef.current?.click()}>
                                    Replace Image
                                  </button>
                                  <button type="button" className="eem-btn-danger" onClick={() => setImageFile(null)}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="eem-upload-dropzone"
                                onClick={() => imageInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files?.[0]) {
                                    handleImageSelect({ target: { files: e.dataTransfer.files } });
                                  }
                                }}
                              >
                                <span className="eem-drop-icon"><DropImageIcon /></span>
                                <b>Drag & drop image slides or photos here</b>
                                <small>Supports PNG, JPG, WebP, SVG up to 50MB · Interactive image cropper on selection</small>
                                <button
                                  type="button"
                                  className="eem-upload-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    imageInputRef.current?.click();
                                  }}
                                >
                                  Upload Images
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. DOCUMENTS TAB */}
                        {lessonMediaType === 'Documents/resources' && (
                          <div className="eem-media-placeholder-box">
                            <div className="eem-media-placeholder-icon">
                              <DocIcon />
                            </div>
                            <h5>Documents & Reading Resources</h5>
                            <p>Provide syllabus PDFs, reading guides, external links, and page range extraction.</p>

                            <div className="eem-media-form-grid">
                              <label>
                                Resource Title
                                <input placeholder="e.g. Consent Negotiation Checklist & Guide" />
                              </label>
                              <label>
                                External Link URL (optional)
                                <input placeholder="https://..." />
                              </label>
                              <label className="eem-wide">
                                In-lesson Reading Notes
                                <textarea rows="2" placeholder="Write or paste reading content, definitions, and citations..." />
                              </label>
                            </div>

                            {/* Document Extractor View when document is selected */}
                            {docFile ? (
                              <div className="eem-trimmer-card">
                                <div className="eem-trimmer-header">
                                  <div className="eem-trimmer-title-group">
                                    <span className="eem-trimmer-badge"><ScissorsIcon /> DOCUMENT EXTRACTOR</span>
                                    <h4>{docFile.name}</h4>
                                  </div>
                                  <span className="eem-file-info-badge">{formatFileSize(docFile.size)}</span>
                                </div>

                                <div className="eem-doc-extract-box">
                                  <div className="eem-mode-selector">
                                    <label className="eem-radio-option">
                                      <input
                                        type="radio"
                                        name="doc-extract-mode"
                                        checked={docFile.mode === 'range'}
                                        onChange={() => setDocFile({ ...docFile, mode: 'range' })}
                                      />
                                      <span>Extract Page Range (Trim PDF)</span>
                                    </label>
                                    <label className="eem-radio-option">
                                      <input
                                        type="radio"
                                        name="doc-extract-mode"
                                        checked={docFile.mode === 'full'}
                                        onChange={() => setDocFile({ ...docFile, mode: 'full' })}
                                      />
                                      <span>Include Complete Document</span>
                                    </label>
                                  </div>

                                  {docFile.mode === 'range' && (
                                    <div className="eem-page-range-inputs">
                                      <label>
                                        Start Page
                                        <input
                                          type="number"
                                          min="1"
                                          value={docFile.startPage || 1}
                                          onChange={e => setDocFile({ ...docFile, startPage: Number(e.target.value) })}
                                        />
                                      </label>
                                      <span className="eem-range-dash">—</span>
                                      <label>
                                        End Page
                                        <input
                                          type="number"
                                          min="1"
                                          value={docFile.endPage || 10}
                                          onChange={e => setDocFile({ ...docFile, endPage: Number(e.target.value) })}
                                        />
                                      </label>
                                    </div>
                                  )}

                                  <label className="eem-doc-chapter-label">
                                    Lesson Chapter / Section Title
                                    <input
                                      value={docFile.sectionTitle || ''}
                                      onChange={e => setDocFile({ ...docFile, sectionTitle: e.target.value })}
                                      placeholder="e.g. Chapter 1: Foundations Handout"
                                    />
                                  </label>
                                </div>

                                <div className="eem-trim-actions">
                                  <button type="button" className="eem-apply-trim-btn" onClick={attachDocToLesson}>
                                    <CheckIcon /> Apply & Attach Document to Lesson
                                  </button>
                                  <button type="button" className="eem-btn-ghost" onClick={() => docInputRef.current?.click()}>
                                    Replace File
                                  </button>
                                  <button type="button" className="eem-btn-danger" onClick={() => setDocFile(null)}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="eem-upload-dropzone"
                                onClick={() => docInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files?.[0]) {
                                    handleDocSelect({ target: { files: e.dataTransfer.files } });
                                  }
                                }}
                              >
                                <span className="eem-drop-icon"><DropDocIcon /></span>
                                <b>Drag & drop PDF / DOCX documents here</b>
                                <small>Supports PDF, DOCX, EPUB · Interactive document page trimmer on selection</small>
                                <button
                                  type="button"
                                  className="eem-upload-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    docInputRef.current?.click();
                                  }}
                                >
                                  Attach Document
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. DOWNLOADS TAB */}
                        {lessonMediaType === 'Downloads' && (
                          <div className="eem-media-placeholder-box">
                            <div className="eem-media-placeholder-icon">
                              <DownloadIcon />
                            </div>
                            <h5>Downloadable Materials & Files</h5>
                            <p>Attach worksheets, printable templates, and offline exercise sheets for learners.</p>

                            <div className="eem-media-form-grid">
                              <label>
                                Downloadable Item Title
                                <input placeholder="e.g. Printable Safety Worksheet (PDF)" />
                              </label>
                              <label>
                                Download Access Rule
                                <select>
                                  <option>Available to all learners</option>
                                  <option>Requires lesson completion</option>
                                  <option>Gold & Platinum members only</option>
                                </select>
                              </label>
                              <label className="eem-wide">
                                File Description & Usage Instructions
                                <textarea rows="2" placeholder="Explain how the learner should use this downloaded material..." />
                              </label>
                            </div>

                            {/* Download Packager View when file is selected */}
                            {downloadFile ? (
                              <div className="eem-trimmer-card">
                                <div className="eem-trimmer-header">
                                  <div className="eem-trimmer-title-group">
                                    <span className="eem-trimmer-badge"><CheckIcon /> DOWNLOAD PACKAGER</span>
                                    <h4>{downloadFile.name}</h4>
                                  </div>
                                  <span className="eem-file-info-badge">{formatFileSize(downloadFile.size)}</span>
                                </div>

                                <div className="eem-download-packager-box">
                                  <label>
                                    Learner Download Label
                                    <input
                                      value={downloadFile.label || ''}
                                      onChange={e => setDownloadFile({ ...downloadFile, label: e.target.value })}
                                      placeholder="e.g. Printable Handout - Consent Framework"
                                    />
                                  </label>

                                  <label>
                                    Access Requirement
                                    <select
                                      value={downloadFile.accessRule || 'All learners'}
                                      onChange={e => setDownloadFile({ ...downloadFile, accessRule: e.target.value })}
                                    >
                                      <option>All learners</option>
                                      <option>Requires lesson completion</option>
                                      <option>Gold & Platinum members only</option>
                                    </select>
                                  </label>
                                </div>

                                <div className="eem-trim-actions">
                                  <button type="button" className="eem-apply-trim-btn" onClick={attachDownloadToLesson}>
                                    <CheckIcon /> Attach Download to Lesson
                                  </button>
                                  <button type="button" className="eem-btn-ghost" onClick={() => downloadInputRef.current?.click()}>
                                    Replace File
                                  </button>
                                  <button type="button" className="eem-btn-danger" onClick={() => setDownloadFile(null)}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="eem-upload-dropzone"
                                onClick={() => downloadInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files?.[0]) {
                                    handleDownloadSelect({ target: { files: e.dataTransfer.files } });
                                  }
                                }}
                              >
                                <span className="eem-drop-icon"><DropDownloadIcon /></span>
                                <b>Drag & drop downloadable packages here</b>
                                <small>Supports ZIP, PDF, XLSX, Templates up to 500MB</small>
                                <button
                                  type="button"
                                  className="eem-upload-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    downloadInputRef.current?.click();
                                  }}
                                >
                                  Upload Downloadable File
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="eem-empty-inline">
                      Add a lesson above to configure video, audio, images, documents, or downloads.
                    </div>
                  )}
                </>
              ) : (
                <div className="eem-empty-inline">Add a module before adding lessons.</div>
              )}
            </>
          )}

          {/* STEP 3: QUIZ (SEPARATED WITH REAL QUESTION ADD, EDIT, DELETE) */}
          {step === 3 && (
            <>
              <span className="eem-step-kicker">04 · QUIZ</span>
              <h2>Course Quiz & Knowledge Checks</h2>
              <p className="eem-help">
                Create interactive multiple-choice questions to reinforce learning and check comprehension.
              </p>

              {/* Quiz Question Creator Form */}
              <div className="eem-quiz-creator-card">
                <div className="eem-quiz-card-head">
                  <h4>{quizForm.editingId ? 'Edit Quiz Question' : 'Add New Quiz Question'}</h4>
                  {quizForm.editingId && (
                    <button
                      type="button"
                      className="eem-btn-ghost"
                      onClick={() =>
                        setQuizForm({ question: '', options: ['', '', '', ''], correctIndex: 0, editingId: null })
                      }
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="eem-fields">
                  <label className="eem-wide">
                    Question Text
                    <input
                      value={quizForm.question}
                      onChange={e => setQuizForm({ ...quizForm, question: e.target.value })}
                      placeholder="e.g. Which of the following is essential before engaging in rope bondage?"
                    />
                  </label>

                  {quizForm.options.map((option, idx) => (
                    <label key={idx} className="eem-option-field">
                      <div className="eem-option-label-row">
                        <span>Option {String.fromCharCode(65 + idx)}</span>
                        <label className="eem-correct-radio">
                          <input
                            type="radio"
                            name="quiz-correct-option"
                            checked={quizForm.correctIndex === idx}
                            onChange={() => setQuizForm({ ...quizForm, correctIndex: idx })}
                          />
                          <span>Correct Answer</span>
                        </label>
                      </div>
                      <input
                        value={option}
                        onChange={e => {
                          const updated = [...quizForm.options];
                          updated[idx] = e.target.value;
                          setQuizForm({ ...quizForm, options: updated });
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + idx)}`}
                      />
                    </label>
                  ))}
                </div>

                <div className="eem-quiz-form-actions">
                  <button type="button" className="eem-save-question-btn" onClick={handleSaveQuizQuestion}>
                    {quizForm.editingId ? 'Save Question Changes' : '＋ Add Question'}
                  </button>
                </div>
              </div>

              {/* Existing Quiz Questions List */}
              <div className="eem-quiz-questions-section">
                <div className="eem-section-subhead">
                  <h4>Quiz Questions ({(course.quizQuestions || []).length})</h4>
                  <small>Questions are presented to learners at the end of the module or course.</small>
                </div>

                {(course.quizQuestions || []).length ? (
                  <div className="eem-quiz-list">
                    {course.quizQuestions.map((q, qIndex) => (
                      <div key={q.id || qIndex} className="eem-quiz-item-card">
                        <div className="eem-quiz-item-head">
                          <div className="eem-quiz-num-badge">Q{qIndex + 1}</div>
                          <div className="eem-quiz-question-title">
                            <h5>{q.question}</h5>
                          </div>
                          <div className="eem-item-action-icons">
                            <button
                              type="button"
                              className="eem-icon-btn eem-edit-icon-btn"
                              title="Edit question"
                              aria-label="Edit question"
                              onClick={() => handleEditQuizQuestion(q)}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="eem-icon-btn eem-delete-icon-btn"
                              title="Delete question"
                              aria-label="Delete question"
                              onClick={() => handleDeleteQuizQuestion(q.id)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>

                        <div className="eem-quiz-options-preview">
                          {(q.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`eem-opt-pill ${q.correctIndex === optIdx ? 'correct' : ''}`}
                            >
                              <span className="eem-opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                              <span className="eem-opt-text">{opt}</span>
                              {q.correctIndex === optIdx && (
                                <span className="eem-correct-tag">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="eem-empty-inline">
                    No quiz questions yet. Use the form above to add your first quiz question.
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 4: ASSESSMENT (SEPARATED WITH PLACEHOLDER BOX) */}
          {step === 4 && (
            <>
              <span className="eem-step-kicker">05 · ASSESSMENT</span>
              <h2>Formal Course Assessment</h2>
              <p className="eem-help">
                Configure formal assessments, essay prompts, case studies, or practical assignments.
              </p>

              <label className="eem-check">
                <input
                  type="checkbox"
                  checked={course.assessment?.enabled ?? true}
                  onChange={event =>
                    update({ assessment: { ...course.assessment, enabled: event.target.checked } })
                  }
                />
                Include a formal assessment requirement for this course
              </label>

              {(course.assessment?.enabled ?? true) && (
                <>
                  <div className="eem-fields">
                    <label>
                      Assessment Evaluation Type
                      <select
                        value={course.assessment?.type || 'Practical Case Study'}
                        onChange={event =>
                          update({ assessment: { ...course.assessment, type: event.target.value } })
                        }
                      >
                        {[
                          'Practical Case Study',
                          'Written Essay & Reflection',
                          'Video / Audio Demonstration',
                          'Scenario-Based Rubric',
                          'Peer-Reviewed Project'
                        ].map(value => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Passing score (%)
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={course.assessment?.passingScore || '70'}
                        onChange={event =>
                          update({ assessment: { ...course.assessment, passingScore: event.target.value } })
                        }
                      />
                    </label>
                  </div>

                  {/* Dedicated Placeholder Box for adding Assessment Questions */}
                  <div className="eem-assessment-placeholder-box">
                    <div className="eem-assessment-box-head">
                      <div className="eem-box-badge">ASSESSMENT CREATOR</div>
                      <h4>{editingAssessmentId ? 'Edit Assessment Question / Task' : 'Add Assessment Question / Assignment Prompt'}</h4>
                      <p>
                        Provide prompt questions, case scenarios, or practical tasks for learners to submit before certification.
                      </p>
                    </div>

                    <div className="eem-fields">
                      <label className="eem-wide">
                        Assessment Question / Assignment Prompt
                        <textarea
                          rows="3"
                          value={assessmentPrompt}
                          onChange={e => setAssessmentPrompt(e.target.value)}
                          placeholder="e.g. Case Study: A scenario is presented where boundaries are unclear. Describe step-by-step how you would pause, negotiate, and ensure informed consent before proceeding."
                        />
                      </label>

                      <label>
                        Question / Task Format
                        <select
                          value={assessmentType}
                          onChange={e => setAssessmentType(e.target.value)}
                        >
                          <option>Essay / Written Reflection</option>
                          <option>Scenario Analysis</option>
                          <option>Practical Demonstration (Upload)</option>
                          <option>Rubric Milestone Check</option>
                        </select>
                      </label>

                      <label>
                        Evaluation Rubric / Key Requirements
                        <input
                          value={assessmentRubric}
                          onChange={e => setAssessmentRubric(e.target.value)}
                          placeholder="e.g. Must mention clear boundary check, safe words, and exit criteria"
                        />
                      </label>
                    </div>

                    <div className="eem-quiz-form-actions">
                      {editingAssessmentId && (
                        <button
                          type="button"
                          className="eem-btn-ghost"
                          onClick={() => {
                            setAssessmentPrompt('');
                            setAssessmentRubric('');
                            setEditingAssessmentId(null);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        className="eem-save-question-btn"
                        onClick={handleSaveAssessmentQuestion}
                      >
                        {editingAssessmentId ? 'Save Assessment Changes' : '＋ Add Assessment Question'}
                      </button>
                    </div>
                  </div>

                  {/* List of Added Assessment Questions */}
                  <div className="eem-assessment-list-section">
                    <div className="eem-section-subhead">
                      <h4>Assessment Questions & Prompts ({(course.assessmentQuestions || []).length})</h4>
                      <small>Educator or admin will review these submissions before awarding completion.</small>
                    </div>

                    {(course.assessmentQuestions || []).length ? (
                      <div className="eem-assessment-list">
                        {course.assessmentQuestions.map((item, idx) => (
                          <div key={item.id || idx} className="eem-assessment-card">
                            <div className="eem-assessment-card-header">
                              <span className="eem-assessment-num">Task #{idx + 1}</span>
                              <span className="eem-assessment-type-tag">{item.type}</span>
                              <div className="eem-item-action-icons">
                                <button
                                  type="button"
                                  className="eem-icon-btn eem-edit-icon-btn"
                                  title="Edit assessment task"
                                  aria-label="Edit assessment task"
                                  onClick={() => handleEditAssessmentQuestion(item)}
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  type="button"
                                  className="eem-icon-btn eem-delete-icon-btn"
                                  title="Delete assessment task"
                                  aria-label="Delete assessment task"
                                  onClick={() => handleDeleteAssessmentQuestion(item.id)}
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                            <p className="eem-assessment-prompt-text">{item.prompt}</p>
                            {item.rubric && (
                              <div className="eem-assessment-rubric-note">
                                <b>Grading Rubric:</b> {item.rubric}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="eem-empty-inline">
                        No assessment questions added yet. Use the box above to add prompts.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 5: PRICING */}
          {step === 5 && (
            <>
              <span className="eem-step-kicker">06 · PRICING</span>
              <h2>Choose how learners access pricing</h2>
              <div className="eem-choice-grid">
                {['Free', 'Paid'].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={course.pricing === value ? 'selected' : ''}
                    onClick={() => update({ pricing: value })}
                  >
                    <b>{value}</b>
                    <small>{value === 'Free' ? 'Available at no cost' : 'Set a one-time course price'}</small>
                  </button>
                ))}
              </div>
              {course.pricing === 'Paid' && (
                <label className="eem-price-field">
                  Price ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={course.price}
                    onChange={event => update({ price: event.target.value })}
                    placeholder="0.00"
                  />
                </label>
              )}
            </>
          )}

          {/* STEP 6: ACCESS */}
          {step === 6 && (
            <>
              <span className="eem-step-kicker">07 · ACCESS</span>
              <h2>Set the learner access rule</h2>
              <p className="eem-help">Membership or purchase requirements can be reviewed with your submission.</p>
              <div className="eem-access-options">
                {[
                  'All learners',
                  'Gold membership',
                  'Platinum membership',
                  'Purchase required',
                  'Educator subscription'
                ].map(value => (
                  <label key={value} className={course.access === value ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="course-access"
                      checked={course.access === value}
                      onChange={() => update({ access: value })}
                    />
                    <span>
                      <b>{value}</b>
                      <small>
                        {value === 'All learners'
                          ? 'No membership restriction'
                          : 'Only eligible learners can start'}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* STEP 7: PREVIEW */}
          {step === 7 && (
            <>
              <span className="eem-step-kicker">08 · PREVIEW</span>
              <h2>Review your course</h2>
              <div className="eem-preview">
                <div
                  className="eem-preview-cover"
                  style={
                    course.coverImage
                      ? {
                          backgroundImage: `url(${course.coverImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: 'transparent'
                        }
                      : {}
                  }
                >
                  {!course.coverImage && course.category}
                </div>
                <div className="eem-preview-content">
                  <div className="eem-preview-badges">
                    <span>{course.format}</span>
                    <span>{course.level}</span>
                    <span>{course.pricing === 'Paid' ? `$${course.price || '0.00'}` : 'Free'}</span>
                  </div>
                  <h3>{course.title || 'Course title'}</h3>
                  <p>{course.description || 'Your course description will appear here.'}</p>
                  <small>
                    {course.access} · {course.modules.length} modules ·{' '}
                    {course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)} lessons ·{' '}
                    {(course.quizQuestions || []).length} quiz questions ·{' '}
                    {(course.assessmentQuestions || []).length} assessment tasks
                  </small>
                </div>
              </div>
              <div className="eem-review-callout">
                <b>After you submit</b>
                <p>
                  Your course will move to <strong>Under Review</strong> for KC Admin moderation. It will not be
                  published or visible to learners until approved.
                </p>
              </div>
            </>
          )}
        </div>

        <footer className="eem-builder-footer">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              setStep(previous => Math.max(0, previous - 1));
              setError('');
            }}
          >
            Previous
          </button>
          <span>Step {step + 1} of {steps.length}</span>
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="eem-next"
              onClick={() => {
                setStep(previous => Math.min(steps.length - 1, previous + 1));
                setError('');
              }}
            >
              Next
            </button>
          ) : (
            <button type="button" className="eem-submit" onClick={submitForReview}>
              Submit for Review
            </button>
          )}
        </footer>

        {/* Cover Image Cropper */}
        {coverCropFile && (
          <ImageCropper
            file={coverCropFile}
            onSave={handleCoverCropSave}
            onSkip={handleCoverCropSkip}
            onCancel={() => setCoverCropFile(null)}
            defaultAspect="landscape"
            cropShape="rect"
          />
        )}

        {notice && (
          <div className="eem-toast" role="status">
            {notice}
            <button type="button" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="eem-management">
      <nav className="eem-tabs">
        {tabs.map(tab => (
          <button
            type="button"
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span>
              {
                courses.filter(item =>
                  tab === 'Inactive'
                    ? item.status === 'Inactive' || item.status === 'Archived'
                    : item.status === tab
                ).length
              }
            </span>
          </button>
        ))}
      </nav>

      {activeTab === 'Under Review' && (
        <div className="eem-review-callout eem-review-inline">
          <b>KC Admin review</b>
          <p>
            Submitted courses stay private while the admin team reviews course structure, content, pricing, and
            access. Approval is required before publishing.
          </p>
        </div>
      )}

      {visibleCourses.length ? (
        <div className="eem-course-list">
          {visibleCourses.map(item => (
            <article className="eem-course-card" key={item.id || item.title}>
              <div className="eem-course-symbol">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }}
                  />
                ) : (
                  (item.category || 'E').slice(0, 1)
                )}
              </div>
              <div className="eem-course-main">
                <div className="eem-course-title-line">
                  <h4>{item.title}</h4>
                  <span className={`eem-status eem-status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>
                </div>
                <div className="eem-course-meta-line">
                  <span className="eem-meta-tag"><span className="eem-meta-lbl">Course:</span> {item.format || 'Course'}</span>
                  <span className="eem-meta-dot">·</span>
                  <span className="eem-meta-tag"><span className="eem-meta-lbl">Course Category:</span> {item.category || 'Safety & Consent'}</span>
                  <span className="eem-meta-dot">·</span>
                  <span className="eem-meta-tag"><span className="eem-meta-lbl">Level:</span> {item.level || 'Beginner'}</span>
                  <span className="eem-meta-dot">·</span>
                  <span className="eem-meta-tag">{item.modules?.length || 0} modules</span>
                </div>
                {item.description && <p className="eem-course-desc">{item.description}</p>}
                <small>{item.updated || 'Course in your educator library'}</small>
              </div>
              <div className="eem-course-actions">
                {item.status === 'Draft' && (
                  <button type="button" onClick={() => editDraft(item)}>
                    Continue editing
                  </button>
                )}
                {item.status === 'Under Review' && <span>Awaiting admin review</span>}
                {item.status === 'Published' && (
                  <div className="eem-action-btn-group">
                    <button
                      type="button"
                      className="eem-icon-btn eem-edit-icon-btn"
                      onClick={() => editDraft(item)}
                      title="Edit course"
                      aria-label="Edit course"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="eem-icon-btn eem-inactive-icon-btn"
                      onClick={() => {
                        onCoursesChange(previous =>
                          previous.map(courseItem =>
                            courseItem === item
                              ? { ...courseItem, status: 'Inactive', updated: 'Moved to inactive' }
                              : courseItem
                          )
                        );
                        setNotice(`"${item.title}" moved to Inactive.`);
                        setTimeout(() => setNotice(''), 3000);
                      }}
                      title="Set course inactive"
                      aria-label="Set course inactive"
                    >
                      <InactiveIcon />
                    </button>
                  </div>
                )}
                {(item.status === 'Inactive' || item.status === 'Archived') && (
                  <div className="eem-action-btn-group">
                    <button
                      type="button"
                      onClick={() => {
                        onCoursesChange(previous =>
                          previous.map(courseItem =>
                            courseItem === item
                              ? { ...courseItem, status: 'Published', updated: 'Reactivated' }
                              : courseItem
                          )
                        );
                        setNotice(`"${item.title}" reactivated to Published.`);
                        setTimeout(() => setNotice(''), 3000);
                      }}
                    >
                      Reactivate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onCoursesChange(previous =>
                          previous.map(courseItem =>
                            courseItem === item
                              ? { ...courseItem, status: 'Draft', updated: 'Restored to drafts' }
                              : courseItem
                          )
                        )
                      }
                    >
                      Move to drafts
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="eem-empty">
          <span>▣</span>
          <b>No {activeTab.toLowerCase()} courses yet</b>
          <p>
            {activeTab === 'Drafts'
              ? 'Save a course draft to continue building it later.'
              : activeTab === 'Under Review'
              ? 'Courses submitted to KC Admin will appear here.'
              : activeTab === 'Inactive' || activeTab === 'Archived'
              ? 'Inactive courses will be kept here.'
              : 'Create your first course to start building education.'}
          </p>
          {activeTab === 'Published' && (
            <button type="button" onClick={startNew}>
              ＋ Create Course
            </button>
          )}
        </div>
      )}

      {notice && (
        <div className="eem-toast" role="status">
          {notice}
          <button type="button" onClick={() => setNotice('')}>
            ×
          </button>
        </div>
      )}
    </section>
  );
}
