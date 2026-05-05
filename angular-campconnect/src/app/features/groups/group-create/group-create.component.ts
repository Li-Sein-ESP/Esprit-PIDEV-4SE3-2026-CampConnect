import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  LucideAngularModule,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-angular";
import { GroupService } from "../services/group";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-group-create",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  template: `
    <div class="container py-8 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          (click)="location.back()"
          class="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <lucide-icon
            [img]="ArrowLeftIcon"
            [size]="20"
            class="text-stone-600"
          ></lucide-icon>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Create New Group</h1>
          <p class="text-slate-600 mt-1">
            Set up a new group for your camping adventures
          </p>
        </div>
      </div>

      <!-- Form -->
      <form
        [formGroup]="groupForm"
        (ngSubmit)="submitForm()"
        class="bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <!-- Error Message -->
        <div
          *ngIf="error"
          class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <lucide-icon
            [img]="AlertCircleIcon"
            [size]="20"
            class="text-red-600"
          ></lucide-icon>
          <span class="text-red-700">{{ error }}</span>
        </div>

        <!-- Group Name -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Group Name *</label
          >
          <input
            type="text"
            formControlName="name"
            placeholder="e.g., Summer Camping 2026"
            class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <p
            *ngIf="
              groupForm.get('name')?.hasError('required') &&
              groupForm.get('name')?.touched
            "
            class="text-red-600 text-sm mt-1"
          >
            Group name is required
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Description</label
          >
          <textarea
            formControlName="description"
            placeholder="Describe your group's purpose and goals..."
            rows="4"
            class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          ></textarea>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Primary Location</label
          >
          <input
            type="text"
            formControlName="location"
            placeholder="e.g., Rocky Mountains, Colorado"
            class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- Max Members -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2"
            >Maximum Members</label
          >
          <input
            type="number"
            formControlName="maxMembers"
            min="2"
            placeholder="e.g., 10"
            class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4 justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            (click)="location.back()"
            class="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="!groupForm.valid || isSubmitting"
            class="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <lucide-icon
              *ngIf="!isSubmitting"
              [img]="SaveIcon"
              [size]="18"
            ></lucide-icon>
            <span>{{ isSubmitting ? "Creating..." : "Create Group" }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class GroupCreateComponent implements OnInit {
  groupForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  currentUserId: string | null = null;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;
  readonly AlertCircleIcon = AlertCircle;

  constructor(
    private fb: FormBuilder,
    public location: Location,
    private router: Router,
    private groupService: GroupService,
    private authService: AuthService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?.id || null;
    });
  }

  private initForm(): void {
    this.groupForm = this.fb.group({
      name: ["", [Validators.required]],
      description: [""],
      location: [""],
      maxMembers: [10, [Validators.required, Validators.min(2)]],
    });
  }

  submitForm(): void {
    if (!this.groupForm.valid || !this.currentUserId) {
      this.error = "Please fill all required fields";
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formData = {
      ...this.groupForm.value,
      createdBy: this.currentUserId,
      createdAt: new Date().toISOString(),
    };

    this.groupService.createGroup(formData).subscribe({
      next: (group) => {
        this.isSubmitting = false;
        this.router.navigate(["/groups", group.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || "Failed to create group";
        console.error("Creation error:", err);
      },
    });
  }
}
