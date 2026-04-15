import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Play, Clock, BookOpen, Star, CheckCircle, Download, Share2, Award, GraduationCap, ArrowRight, ShieldCheck, Eye, TrendingUp, Info, ListChecks, Tags, FileText } from 'lucide-angular';
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
  
  // Cert & Exam State
  linkedCertification = signal<Certification | null>(null);
  userCert = signal<UserCertification | null>(null);
  examActive = signal<boolean>(false);
  examPassed = signal<boolean>(false);
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

  isEnrolled: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academyService: AcademyService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
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
        console.error('Error fetching course:', err);
        this.isLoading.set(false);
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

  toggleFaq(index: number) {
    const items = [...this.faqItems()];
    items[index].open = !items[index].open;
    this.faqItems.set(items);
  }

  startExam() {
    this.generateMockQuestions();
    this.examActive.set(true);
    this.userAnswers = {};
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  generateMockQuestions() {
    const cat = this.course()?.category || 'General';
    this.examQuestions.set([
      { id: 1, q: `What is the first rule of ${cat}?`, options: ['Stay Calm', 'Run Fast', 'Build a Fire', 'Find Food'], correct: 0 },
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

    if (percent >= (this.course()?.passingScore || 80)) {
      this.examPassed.set(true);
      this.claimCertification();
    } else {
      this.examPassed.set(false);
    }
    this.examActive.set(false);
  }

  claimCertification() {
    const cert = this.linkedCertification();
    const userId = localStorage.getItem('userId');
    if (!cert || !userId) return;

    const claim: UserCertification = {
      certificationId: cert.id,
      userId: userId,
      earnedDate: new Date().toISOString(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      status: 'ACTIVE',
      certificationName: cert.name,
      username: localStorage.getItem('username') || 'Camper',
      certificateUrl: '' 
    };

    this.academyService.earnCertification(claim).subscribe(res => {
      this.userCert.set(res);
    });
  }

  downloadCertificate() {
    const cert = this.userCert();
    if (cert) {
      this.router.navigate(['/academy/certificate', cert.certificationId]);
    }
  }

  navigateBack() {
    this.router.navigate(['/academy']);
  }

  enrollInCourse() {
    this.isEnrolled = true;
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
