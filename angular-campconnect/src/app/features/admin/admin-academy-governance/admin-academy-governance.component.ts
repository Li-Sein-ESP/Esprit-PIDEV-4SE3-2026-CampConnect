import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, Search, Filter, BookOpen, GraduationCap, Users, LayoutDashboard, Calendar, Settings, BadgeCheck, AlertTriangle, TrendingUp, UploadCloud, Loader2 } from 'lucide-angular';
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
  BadgeCheckIcon = BadgeCheck;
  AlertTriangle = AlertTriangle;
  TrendingUpIcon = TrendingUp;
  UploadIcon = UploadCloud;
  LoaderIcon = Loader2;
  isUploadingImage = signal<boolean>(false);
  isUploadingPdf = signal<boolean>(false);
  courses = signal<Course[]>([]);
  certifications = signal<Certification[]>([]);
  experts = signal<any[]>([]);

  searchTerm = signal<string>('');
  filterDifficulty = signal<string>('all');

  filteredCourses = computed(() => {
    let list = this.courses();
    const search = this.searchTerm().toLowerCase();
    const dif = this.filterDifficulty().toLowerCase();
    
    if (search) {
      list = list.filter(c => 
        c.title.toLowerCase().includes(search) || 
        c.description.toLowerCase().includes(search) || 
        (c.instructorName || '').toLowerCase().includes(search)
      );
    }
    if (dif !== 'all') {
      list = list.filter(c => (c.difficulty || 'Expert').toLowerCase() === dif);
    }
    return list;
  });

  filteredCertifications = computed(() => {
    let list = this.certifications();
    const search = this.searchTerm().toLowerCase();
    
    if (search) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(search) || 
        (c.description || '').toLowerCase().includes(search) || 
        c.issuer.toLowerCase().includes(search)
      );
    }
    return list;
  });

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

  // Confirmation Modal State
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: 'delete' | 'save' = 'delete';
  itemToDelete: string | null = null;
  actionTarget: 'course' | 'cert' = 'course';

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
      imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      documentUrl: ''
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

  onFileSelected(event: any, type: 'image' | 'pdf') {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      this.isUploadingImage.set(true);
    } else {
      this.isUploadingPdf.set(true);
    }

    this.academyService.uploadFile(file).subscribe({
      next: (response) => {
        if (type === 'image') {
          this.courseForm.imageUrl = response.url;
          this.isUploadingImage.set(false);
        } else {
          this.courseForm.documentUrl = response.url;
          this.isUploadingPdf.set(false);
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.errorMessage.set(`Failed to upload ${type}.`);
        if (type === 'image') {
          this.isUploadingImage.set(false);
        } else {
          this.isUploadingPdf.set(false);
        }
      }
    });
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

  validateCertForm(): boolean {
    this.formErrors = {};

    if (!this.certForm.name || this.certForm.name.trim().length < 3) {
      this.formErrors['name'] = 'Certification name is required (min. 3 characters)';
    }

    if (!this.certForm.issuer || this.certForm.issuer.trim() === '') {
      this.formErrors['issuer'] = 'Issuer is required';
    }

    if (!this.certForm.validityPeriod || this.certForm.validityPeriod <= 0) {
      this.formErrors['validityPeriod'] = 'Validity period must be positive';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  saveCertification() {
    this.successMessage.set(null);
    this.errorMessage.set('');
    this.formErrors = {};

    if (!this.validateCertForm()) {
      this.errorMessage.set('Please correct the errors in the form.');
      return;
    }
    
    // Show confirmation before saving
    this.actionTarget = 'cert';
    this.confirmAction = 'save';
    this.confirmTitle = this.editingCertification ? 'Confirm Update' : 'Confirm Creation';
    this.confirmMessage = this.editingCertification 
        ? 'Are you sure you want to refine this certification path? This will overwrite its current specs.'
        : 'Are you sure you want to author this new certification path?';
    this.showConfirmModal = true;
  }

  executeCertificationSave() {
    this.isSubmitting.set(true);
    this.showConfirmModal = false;

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
    if (!id) return;
    this.itemToDelete = id;
    this.actionTarget = 'cert';
    this.confirmAction = 'delete';
    this.confirmTitle = 'Confirm Deletion';
    this.confirmMessage = 'Are you sure you want to delete this certification program? This action cannot be reversed.';
    this.showConfirmModal = true;
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
      this.formErrors['title'] = 'Title is required (min. 3 characters)';
    }

    if (!this.courseForm.description || this.courseForm.description.trim() === '') {
      this.formErrors['description'] = 'Description is required';
    }

    if (!this.courseForm.imageUrl || this.courseForm.imageUrl.trim() === '') {
      this.formErrors['imageUrl'] = 'An image is required';
    }

    if (!this.courseForm.category || this.courseForm.category.trim() === '') {
      this.formErrors['category'] = 'Category is required';
    }

    if (!this.courseForm.instructorId || this.courseForm.instructorId.trim() === '') {
      this.formErrors['instructorId'] = 'An instructor is required';
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
      this.errorMessage.set('Please correct the errors in the form.');
      return;
    }

    this.actionTarget = 'course';
    this.confirmAction = 'save';
    this.confirmTitle = this.editingCourse ? 'Confirm Update' : 'Confirm Creation';
    this.confirmMessage = this.editingCourse 
        ? 'Are you sure you want to update this course details? This will overwrite the current program data.'
        : 'Are you sure you want to deploy this new course?';
    this.showConfirmModal = true;
  }

  executeCourseSave() {
    this.isSubmitting.set(true); // Set submitting state
    this.showConfirmModal = false;

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
    if (!id) return;
    this.itemToDelete = id;
    this.actionTarget = 'course';
    this.confirmAction = 'delete';
    this.confirmTitle = 'Confirm Deletion';
    this.confirmMessage = 'Are you sure you want to remove this course from the academy? This action cannot be reversed.';
    this.showConfirmModal = true;
  }

  onConfirm() {
    if (this.confirmAction === 'delete') {
      this.confirmDelete();
    } else {
      if (this.actionTarget === 'course') {
        this.executeCourseSave();
      } else {
        this.executeCertificationSave();
      }
    }
  }

  private confirmDelete() {
    if (!this.itemToDelete) return;
    const id = this.itemToDelete;
    this.showConfirmModal = false;
    this.itemToDelete = null;

    if (this.actionTarget === 'course') {
      this.academyService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage.set('Course removed from academy.');
          this.loadCourses();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => this.errorMessage.set('Failed to delete course')
      });
    } else {
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

  cancelDelete() {
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }
}
