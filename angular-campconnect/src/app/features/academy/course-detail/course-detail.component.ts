import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Play, Clock, BookOpen, Star, CheckCircle, Download, Share2, Award, GraduationCap, ArrowRight, ShieldCheck, Eye, TrendingUp, Info, ListChecks, Tags, FileText, CreditCard, Lock, Printer, X } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { AcademyService } from '../services/academy.service';
import { Course, Video, Certification, UserCertification } from '../models/academy.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './course-detail.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #FDFCF8;
    }
    .hero-gradient {
      background: linear-gradient(180deg, rgba(253, 252, 248, 0) 0%, #FDFCF8 100%);
    }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; margin: 0; padding: 0; }
      
      /* Hide everything except the certificate */
      body > * { display: none !important; }
      
      /* Target the certificate overlay specifically */
      .certificate-overlay { 
          display: block !important; 
          position: fixed !important;
          inset: 0 !important;
          z-index: 9999 !important;
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          height: 100% !important;
          visibility: visible !important;
      }

      .certificate-overlay * { visibility: visible !important; }

      .certificate-paper { 
          display: block !important;
          box-shadow: none !important; 
          border: 15px double #064e3b !important;
          margin: 0 !important;
          width: 297mm !important; /* A4 Landscape width */
          height: 210mm !important; /* A4 Landscape height */
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
      }
      
      /* Hide browser default headers/footers */
      @page {
        size: landscape;
        margin: 0;
      }
    }
    .card-nature {
      border-radius: 24px;
      box-shadow: 0 4px 20px rgba(10, 31, 28, 0.03);
    }
    .sidebar-sticky {
      top: 100px;
    }
    .badge-tag {
      padding: 0.4rem 1rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  courseId: string | null = null;
  course = signal<Course | null>(null);
  lessons = signal<Video[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingExam = signal<boolean>(false);
  isStudyCompleted = signal<boolean>(false);
  toast = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Cert & Exam State
  linkedCertification = signal<Certification | null>(null);
  userCert = signal<UserCertification | null>(null);
  examActive = signal<boolean>(false);
  showResultOverlay = signal<boolean>(false);
  showCertificateOverlay = signal<boolean>(false);
  isClaimingCert = signal<boolean>(false);
  examPassed = signal<boolean>(false);
  certNameInput = signal<string>('');
  currentExamScore = signal<number>(0);
  examQuestions = signal<any[]>([]);
  userAnswers: Record<number, number> = {};

  // Enrichment Data
  learningPoints = [
    'Survival Shelter Construction',
    'Advanced Fire Crafting',
    'Emergency First Aid & Triage',
    'Navigation without GPS/Compasses',
    'Identifying Edible Wild Flora',
    'Ethical Bushcraft & Conservation'
  ];

  faqItems = signal([
    { question: 'Is prior experience required?', answer: 'No, this course is designed for beginners and experts alike, with progressive difficulty.', open: false },
    { question: 'Do I get a digital certificate?', answer: 'Yes, completing all modules and passing the final exam grants an Elite Certification.', open: false },
    { question: 'Is camping gear provided?', answer: 'For on-site workshops, basic gear is provided. For digital courses, we provide a checklist.', open: false }
  ]);

  mockReviews = [
    { name: 'Alex Rivers', rating: 5, date: '2 days ago', text: 'This changed the way I see the outdoors. Highly recommended!', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    { name: 'Jade Sterling', rating: 4, date: '1 week ago', text: 'Great content, specifically the fire building module.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
  ];

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Play = Play;
  readonly Clock = Clock;
  readonly BookOpen = BookOpen;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Share2 = Share2;
  readonly Download = Download;
  readonly Award = Award;
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;
  readonly ShieldCheck = ShieldCheck;
  readonly Eye = Eye;
  readonly TrendingUp = TrendingUp;
  readonly Info = Info;
  readonly ListChecks = ListChecks;
  readonly TagsIcon = Tags;
  readonly FileText = FileText;
  readonly CreditCard = CreditCard;
  readonly Lock = Lock;
  readonly Printer = Printer;
  readonly X = X;

  isEnrolled = signal<boolean>(false); // Persistent enrollment signal
  showPaymentModal = signal<boolean>(false);
  isProcessingPayment = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academyService: AcademyService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        window.scrollTo(0, 0);
        // Check local persistence for enrollment (lifetime access mock)
        const savedEnrollment = localStorage.getItem(`enrolled_${this.courseId}`);
        if (savedEnrollment === 'true') {
          this.isEnrolled.set(true);
        }
        
        this.route.queryParams.subscribe(q => {
          if (q['fastTrack'] === 'true') {
            this.isEnrolled.set(true);
            this.isStudyCompleted.set(true);
          }
        });

        this.loadCourseData(this.courseId);
      }
    });
  }

  loadCourseData(id: string) {
    this.isLoading.set(true);
    this.academyService.getCourseById(id).subscribe({
      next: (courseData) => {
        this.course.set(courseData);
        if (courseData.category) {
          this.loadRelatedVideos(courseData.category);
          this.checkLinkedCertification(id);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching course, attempting to load as standalone certification:', err);
        this.academyService.getCertifications().subscribe({
          next: (certs) => {
            const standaloneCert = certs.find(c => c.id === id);
            if (standaloneCert) {
              const mockCourse: Course = {
                  id: standaloneCert.id,
                  title: standaloneCert.name,
                  description: standaloneCert.description,
                  category: 'Certification',
                  difficulty: 'ALL_LEVELS',
                  duration: 0,
                  enrolledCount: 0,
                  rating: 5.0,
                  reviews: 0,
                  price: 0,
                  imageUrl: standaloneCert.imageUrl || 'assets/images/placeholder-course.jpg',
                  tags: ['STANDALONE_CERTIFICATION'],
                  prerequisites: [],
                  passingScore: 60,
              };
              this.course.set(mockCourse);
              this.linkedCertification.set(standaloneCert);
              this.checkIfUserIsAlreadyCertified(standaloneCert.id);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  checkLinkedCertification(courseId: string) {
    this.academyService.getCertificationByCourseId(courseId).subscribe({
      next: (cert) => {
        this.linkedCertification.set(cert);
        this.checkIfUserIsAlreadyCertified(cert.id);
      },
      error: () => this.linkedCertification.set(null)
    });
  }

  checkIfUserIsAlreadyCertified(certId: string) {
    const userId = localStorage.getItem('userId'); // Simple fallback
    if (!userId) return;

    this.academyService.getUserCertifications(userId).subscribe(certs => {
      const existing = certs.find(c => c.certificationId === certId);
      if (existing) {
        this.userCert.set(existing);
        this.examPassed.set(true);
      }
    });
  }

  loadRelatedVideos(category: string) {
    this.academyService.getVideosByCategory(category).subscribe({
      next: (videos) => {
        this.lessons.set(videos);
      },
      error: (err) => {
        console.error('Error fetching videos:', err);
      }
    });
  }

  onNameChange(event: any) {
    this.certNameInput.set(event.target.value);
  }

  toggleFaq(index: number) {
    const items = [...this.faqItems()];
    items[index].open = !items[index].open;
    this.faqItems.set(items);
  }

  startExam() {
    if (!this.courseId) return;
    const c = this.course();
    if (!c) return;

    if (!this.isStudyCompleted() && !this.examPassed()) {
      alert('Please complete the course study materials first!');
      return;
    }
    
    this.isLoadingExam.set(true);
    this.examActive.set(true);
    this.userAnswers = {};

    // Use AI Generator
    this.academyService.generateAiQuiz(c.title, c.description).subscribe({
      next: (res) => {
        if (res && res.questions) {
          this.examQuestions.set(res.questions);
        } else {
          this.generateFallbackQuestions();
        }
        this.isLoadingExam.set(false);
      },
      error: (err) => {
        console.error('Error generating AI quiz:', err);
        this.generateFallbackQuestions();
        this.isLoadingExam.set(false);
      }
    });
  }

  generateFallbackQuestions() {
    const cat = this.course()?.category || 'General';
    this.examQuestions.set([
      { id: 1, q: `What is the most important rule of ${cat}?`, options: ['Stay Calm', 'Run Fast', 'Build a Fire', 'Find Food'], correct: 0 },
      { id: 2, q: `Which tool is essential for ${cat}?`, options: ['Map & Compass', 'Smartphone', 'Solar Charger', 'Flashlight'], correct: 0 },
      { id: 3, q: `How do you identify a safe site in ${cat}?`, options: ['High Ground', 'Near a River', 'Under thick trees', 'Deep valley'], correct: 0 },
    ]);
  }

  submitExam() {
    let score = 0;
    const questions = this.examQuestions();
    questions.forEach((q, i) => {
      if (this.userAnswers[i] === q.correct) score++;
    });

    const percent = (score / questions.length) * 100;
    this.currentExamScore.set(percent);

    if (percent >= 60) {
      this.examPassed.set(true);
      this.claimCertification();
    } else {
      this.examPassed.set(false);
    }
    this.examActive.set(false);
    this.showResultOverlay.set(true);
  }

  claimCertification() {
    const cert = this.linkedCertification();
    const course = this.course();
    if (!course) return;

    // ── Get the REAL authenticated user ID ──
    // Priority: cc_user (set on login) → userId key → demoUserId → generate one
    let finalUserId = '';
    let displayUsername = this.certNameInput() || 'Elite Camper';
    try {
      const ccUser = JSON.parse(localStorage.getItem('cc_user') || 'null');
      if (ccUser && ccUser.id) {
        finalUserId = ccUser.id;
        displayUsername = this.certNameInput() || ccUser.name || ccUser.username || 'Elite Camper';
        // Persist so other components can find it
        localStorage.setItem('userId', ccUser.id);
        localStorage.setItem('username', displayUsername);
      }
    } catch (e) {}

    if (!finalUserId) {
      finalUserId = localStorage.getItem('userId') || '';
    }
    if (!finalUserId) {
      const demo = localStorage.getItem('demoUserId') || ('demo-user-' + Math.random().toString(36).substr(2, 9));
      localStorage.setItem('demoUserId', demo);
      finalUserId = demo;
    }

    // Certification ID and name
    const certId = cert ? cert.id : 'CERT-' + course.id;
    const certName = cert ? cert.name : course.title + ' Certification';

    const earnedDate = new Date();
    const expiryDate = new Date(earnedDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    const claim: UserCertification = {
      certificationId: certId,
      userId: finalUserId,
      earnedDate: earnedDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: 'ACTIVE',
      certificationName: certName,
      username: displayUsername,
      certificateUrl: ''
    };

    this.isClaimingCert.set(true);
    this.academyService.earnCertification(claim).subscribe({
      next: (res) => {
        this.userCert.set(res);
        this.isClaimingCert.set(false);
        // ── Persist to localStorage so My Badges always shows it ──
        this.saveEarnedCertLocally({ ...claim, id: res.id || (Date.now().toString()) });
      },
      error: () => {
        // Even if backend fails, save locally so the UI shows it
        this.saveEarnedCertLocally({ ...claim, id: Date.now().toString() });
        this.isClaimingCert.set(false);
      }
    });
  }

  private saveEarnedCertLocally(cert: any) {
    try {
      const existing: any[] = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
      // Avoid duplicates by certificationId
      const filtered = existing.filter(c => c.certificationId !== cert.certificationId);
      filtered.push(cert);
      localStorage.setItem('academy_earned_certs', JSON.stringify(filtered));
    } catch (e) {}
  }

  downloadCertificate() {
    this.showCertificateOverlay.set(true);
    this.showResultOverlay.set(false);
  }

  isExporting = signal<boolean>(false);

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  printCertificate() {
    window.print();
    this.showToast('Preparing your official certificate...', 'success');
  }

  getStoredUsername(): string {
    return localStorage.getItem('username') || localStorage.getItem('demoUserId') || 'Elite Camper';
  }

  navigateBack() {
    this.router.navigate(['/academy']);
  }

  enrollInCourse() {
    this.isEnrolled.set(true);
    if (this.courseId) {
      localStorage.setItem(`enrolled_${this.courseId}`, 'true');
    }
    this.showToast('Enrolled successfully! You can now access course materials.', 'success');
  }

  completeStudy() {
    this.isStudyCompleted.set(true);
    // Removed automatic scroll to top to avoid jarring jumps
  }

  playLesson(lessonId: string) {
    if (!lessonId) return;
    this.router.navigate(['/academy/video', lessonId]);
  }

  shareCourse() {
    const c = this.course();
    if (!c) return;
    
    if (navigator.share) {
      navigator.share({
        title: c.title,
        text: `Check out this course on Wilderness Academy: ${c.title}`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  downloadSyllabus() {
    const docUrl = this.course()?.documentUrl;
    if (docUrl) {
      window.open(docUrl, '_blank');
    }
  }

  getDifficultyClass(difficulty: string): string {
    const d = difficulty?.toUpperCase();
    if (d === 'BEGINNER') return 'bg-green-100 text-green-700';
    if (d === 'INTERMEDIATE') return 'bg-amber-100 text-amber-700';
    if (d === 'ADVANCED' || d === 'EXPERT') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  }
}
