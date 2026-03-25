import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, Search, Filter, BookOpen, GraduationCap, Users, LayoutDashboard, Calendar, Settings } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { AcademyService } from '../../academy/services/academy.service';
import { Course, Certification } from '../../academy/models/academy.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-academy-governance-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    FormsModule
  ],
  templateUrl: './admin-academy-governance.component.html',
  styles: []
})
export class AdminAcademyGovernanceComponent implements OnInit {
  PlusIcon = Plus;
  PencilIcon = Pencil;
  TrashIcon = Trash2;
  SearchIcon = Search;
  FilterIcon = Filter;
  BookIcon = BookOpen;
  CapIcon = GraduationCap;
  UsersIcon = Users;
  DashboardIcon = LayoutDashboard;
  CalendarIcon = Calendar;
  SettingsIcon = Settings;

  courses = signal<Course[]>([]);
  certifications = signal<Certification[]>([]);
  experts = signal<any[]>([]);

  stats = signal({
    totalCourses: 0,
    totalCerts: 0,
    totalExperts: 0,
    enrolledStudents: 128 // Mock stat for UI
  });
  showForm = false;
  editingCourse: Course | null = null;
  editingCertification: Certification | null = null;
  formType: 'course' | 'certification' = 'course';
  formErrors: { [key: string]: string } = {};
  courseForm: Partial<Course> = {};
  certForm: Partial<Certification> = {};
  successMessage = signal<string | null>(null);
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor(private academyService: AcademyService) { }

  ngOnInit(): void {
    this.loadCourses();
    this.loadExperts();
    this.loadCertifications();
  }

  loadCourses() {
    this.academyService.getCourses().subscribe(courses => {
      this.courses.set(courses);
    });
  }

  loadExperts() {
    this.academyService.getExperts().subscribe(experts => {
      this.experts.set(experts);
    });
  }

  loadCertifications() {
    this.academyService.getCertifications().subscribe(certs => {
      this.certifications.set(certs);
      this.updateStats();
    });
  }

  // This method was not in the original code, but is referenced in the instruction's `saveCourse` next block.
  // Assuming it's a placeholder for loading all relevant data.
  loadData() {
    this.loadCourses();
    this.loadCertifications();
    this.loadExperts();
  }

  updateStats() {
    const courseData = this.courses();
    this.stats.set({
      ...this.stats(),
      totalCourses: courseData.length,
      totalCerts: this.certifications().length,
      totalExperts: this.experts().length,
      enrolledStudents: courseData.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0)
    });
  }

  openAddForm() {
    this.formType = 'course';
    this.editingCourse = null;
    this.courseForm = {
      title: '',
      description: '',
      category: 'survival',
      difficulty: 'beginner',
      duration: 1,
      price: 0,
      tags: [],
      prerequisites: [],
      passingScore: 80,
      imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    };
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.showForm = true;
  }

  openAddCertForm() {
    this.formType = 'certification';
    this.editingCertification = null;
    this.certForm = {
      name: '',
      description: '',
      issuer: 'CampConnect Academy',
      validityPeriod: 12,
      requiredCourseIds: []
    };
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.showForm = true;
  }

  openEditCertForm(cert: Certification) {
    this.formType = 'certification';
    this.editingCertification = cert;
    this.certForm = { ...cert };
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.showForm = true;
  }

  onCourseToggle(courseId: string, event: any) {
    if (!this.certForm.requiredCourseIds) {
      this.certForm.requiredCourseIds = [];
    }

    if (event.target.checked) {
      if (!this.certForm.requiredCourseIds.includes(courseId)) {
        this.certForm.requiredCourseIds.push(courseId);
      }
    } else {
      this.certForm.requiredCourseIds = this.certForm.requiredCourseIds.filter(id => id !== courseId);
    }
  }

  saveCertification() {
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    if (this.editingCertification) {
      this.academyService.updateCertification(this.editingCertification.id, this.certForm as Certification).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set('Certification path refined successfully!');
          this.loadCertifications();
          setTimeout(() => this.closeForm(), 2000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update certification');
        }
      });
    } else {
      this.academyService.createCertification(this.certForm as Certification).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set('New certification path architected!');
          this.loadCertifications();
          setTimeout(() => this.closeForm(), 2000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create certification');
        }
      });
    }
  }

  deleteCertification(id: string) {
    if (confirm('Delete this certification program?')) {
      this.academyService.deleteCertification(id).subscribe({
        next: () => {
          this.successMessage.set('Certification deleted.');
          this.loadCertifications();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => this.errorMessage.set('Failed to delete certification')
      });
    }
  }

  openEditForm(course: Course) {
    this.formType = 'course';
    this.editingCourse = course;
    this.formErrors = {};
    this.courseForm = { ...course };
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingCourse = null;
    this.editingCertification = null;
    this.formErrors = {};
    this.errorMessage.set('');
    this.successMessage.set(null);
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.courseForm.title || this.courseForm.title.trim().length < 3) {
      this.formErrors['title'] = 'Le titre est requis (min. 3 caractères)';
    }

    if (!this.courseForm.description || this.courseForm.description.trim() === '') {
      this.formErrors['description'] = 'La description est requise';
    }

    if (!this.courseForm.imageUrl || this.courseForm.imageUrl.trim() === '') {
      this.formErrors['imageUrl'] = 'Une image est requise';
    }

    if (!this.courseForm.category || this.courseForm.category.trim() === '') {
      this.formErrors['category'] = 'La catégorie est requise';
    }

    if (!this.courseForm.instructorId || this.courseForm.instructorId.trim() === '') {
      this.formErrors['instructorId'] = 'Un instructeur est requis';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  saveCourse() {
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.formErrors = {};

    console.log('Attempting to save course:', this.courseForm);

    if (!this.validateForm()) {
      console.warn('Form validation failed:', this.formErrors);
      this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    this.isSubmitting.set(true); // Set submitting state

    if (this.editingCourse) {
      this.academyService.updateCourse(this.editingCourse.id!, this.courseForm as Course).subscribe({
        next: () => {
          this.isSubmitting.set(false); // Reset submitting state
          this.successMessage.set('Course updated successfully!');
          this.loadCourses();
          setTimeout(() => this.closeForm(), 2000);
        },
        error: (err) => {
          this.isSubmitting.set(false); // Reset submitting state
          this.errorMessage.set(err.error?.message || 'Failed to update course');
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          }
        }
      });
    } else {
      // Precise mapping for Backend (CourseDTO)
      // We send "category" because @JsonProperty("category") is used on categoryName field
      const submission = {
        ...this.courseForm,
        category: this.courseForm.category,
        passingScore: this.courseForm.passingScore || 80
      };

      console.log('Sending submission to backend:', submission);
      this.academyService.createCourse(submission as any).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.successMessage.set('Course created successfully!');
          this.loadData();
          this.closeForm();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Submission error:', err);
          this.errorMessage.set(err.error?.message || 'Validation failed');
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          }
        }
      });
    }
  }

  deleteCourse(id: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.academyService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage.set('Course removed from academy.');
          this.loadCourses();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => this.errorMessage.set('Failed to delete course')
      });
    }
  }
}
