import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "../../shared/components/card.component";
import {
  DropdownComponent,
  DropdownOption,
} from "../../shared/components/dropdown.component";
import {
  LucideAngularModule,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Bike,
  Car,
  Bus,
  Train,
  Camera,
  Compass,
  Coffee,
  Tent,
  Waves,
  Trees,
  Clock,
  AlertCircle,
  Share2,
} from "lucide-angular";
import { TripService } from "./services/trip.service";
import { AuthService } from "../../core/services/auth.service";
import { TransportationService } from "../transportation/services/transportation.service";
import { TransportRoute } from "../transportation/models/transportation.model";

@Component({
  selector: "app-plan-trip",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DropdownComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-10 text-center lg:text-left">
        <h1 class="text-4xl font-bold text-[var(--color-primary-900)] mb-3">
          Create New Trip
        </h1>
        <p class="text-lg text-[var(--color-text-secondary)]">
          Let's plan your perfect camping adventure in just a few steps
        </p>
      </div>

      <!-- Stepper Progress -->
      <div class="mb-12 max-w-4xl mx-auto px-4">
        <div class="relative flex justify-between items-center">
          <!-- Step 1 -->
          <div class="flex flex-col items-center relative z-10 w-1/4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              [ngClass]="getStepClass(1)"
            >
              <lucide-icon
                *ngIf="currentStep <= 1"
                [img]="InfoIcon"
                [size]="20"
              ></lucide-icon>
              <lucide-icon
                *ngIf="currentStep > 1"
                [img]="CheckIcon"
                [size]="20"
              ></lucide-icon>
            </div>
            <div class="mt-3 text-center">
              <span
                class="block text-xs font-bold uppercase tracking-wider"
                [ngClass]="
                  currentStep >= 1
                    ? 'text-[var(--color-primary-600)]'
                    : 'text-[var(--color-text-tertiary)]'
                "
                >Basic Info</span
              >
              <span
                class="text-[10px] text-[var(--color-text-secondary)] hidden md:block"
                >Trip essentials</span
              >
            </div>
          </div>

          <!-- Connecting Line -->
          <div
            class="absolute left-[12.5%] right-[12.5%] top-[24px] h-[3px] bg-[var(--color-neutral-200)] -z-0"
          >
            <div
              class="h-full bg-[var(--color-primary-500)] transition-all duration-500"
              [style.width.%]="getProgressBarWidth()"
            ></div>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-center relative z-10 w-1/4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              [ngClass]="getStepClass(2)"
            >
              <span *ngIf="currentStep <= 2">2</span>
              <lucide-icon
                *ngIf="currentStep > 2"
                [img]="CheckIcon"
                [size]="20"
              ></lucide-icon>
            </div>
            <div class="mt-3 text-center">
              <span
                class="block text-xs font-bold uppercase tracking-wider"
                [ngClass]="
                  currentStep >= 2
                    ? 'text-[var(--color-primary-600)]'
                    : 'text-[var(--color-text-tertiary)]'
                "
                >Preferences</span
              >
              <span
                class="text-[10px] text-[var(--color-text-secondary)] hidden md:block"
                >Customize your experience</span
              >
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-center relative z-10 w-1/4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              [ngClass]="getStepClass(3)"
            >
              <span *ngIf="currentStep <= 3">3</span>
              <lucide-icon
                *ngIf="currentStep > 3"
                [img]="CheckIcon"
                [size]="20"
              ></lucide-icon>
            </div>
            <div class="mt-3 text-center">
              <span
                class="block text-xs font-bold uppercase tracking-wider"
                [ngClass]="
                  currentStep >= 3
                    ? 'text-[var(--color-primary-600)]'
                    : 'text-[var(--color-text-tertiary)]'
                "
                >Transportation</span
              >
              <span
                class="text-[10px] text-[var(--color-text-secondary)] hidden md:block"
                >Select how to get there</span
              >
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col items-center relative z-10 w-1/4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              [ngClass]="getStepClass(4)"
            >
              <span *ngIf="currentStep <= 4">4</span>
              <lucide-icon
                *ngIf="currentStep > 4"
                [img]="CheckIcon"
                [size]="20"
              ></lucide-icon>
            </div>
            <div class="mt-3 text-center">
              <span
                class="block text-xs font-bold uppercase tracking-wider"
                [ngClass]="
                  currentStep === 4
                    ? 'text-[var(--color-primary-600)]'
                    : 'text-[var(--color-text-tertiary)]'
                "
                >Review & Generate</span
              >
              <span
                class="text-[10px] text-[var(--color-text-secondary)] hidden md:block"
                >Finalize your plan</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form Area -->
      <div
        class="max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-5 duration-500"
      >
        <app-card
          variant="elevated"
          padding="none"
          customClass="overflow-hidden border-0 shadow-xl rounded-2xl"
        >
          <app-card-content customClass="p-0">
            <!-- STEP 1: BASIC INFO -->
            <div *ngIf="currentStep === 1" class="p-8 lg:p-12 space-y-8">
              <div class="border-b border-[var(--color-neutral-100)] pb-6 mb-8">
                <h2 class="text-2xl font-bold text-[var(--color-primary-800)]">
                  Basic Trip Information
                </h2>
                <p class="text-[var(--color-text-secondary)] mt-1">
                  Tell us about your trip destination and timing
                </p>
              </div>

              <div class="space-y-6">
                <!-- Trip Name -->
                <div>
                  <label
                    class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                    >Trip Name</label
                  >
                  <div class="relative group">
                    <div
                      class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary-500)] transition-colors"
                    >
                      <lucide-icon [img]="TentIcon" [size]="20"></lucide-icon>
                    </div>
                    <input
                      type="text"
                      [(ngModel)]="tripModel.title"
                      placeholder="e.g., Yosemite Summer Adventure"
                      class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-100)] transition-all outline-none"
                    />
                  </div>
                </div>

                <!-- Destination -->
                <div>
                  <label
                    class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                    >Destination</label
                  >
                  <div class="relative group">
                    <div
                      class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary-500)] transition-colors"
                    >
                      <lucide-icon [img]="MapPinIcon" [size]="20"></lucide-icon>
                    </div>
                    <input
                      type="text"
                      [(ngModel)]="tripModel.destinationName"
                      placeholder="e.g., Yosemite National Park, CA"
                      class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-100)] transition-all outline-none"
                    />
                  </div>
                  <p
                    class="mt-2 text-[10px] text-[var(--color-text-tertiary)] italic"
                  >
                    Specific campsite or general area
                  </p>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                      >Start Date</label
                    >
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary-500)] transition-colors"
                      >
                        <lucide-icon
                          [img]="CalendarIcon"
                          [size]="20"
                        ></lucide-icon>
                      </div>
                      <input
                        type="date"
                        [(ngModel)]="tripModel.startDate"
                        [min]="getTodayString()"
                        class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                      >End Date</label
                    >
                    <div class="relative group">
                      <div
                        class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary-500)] transition-colors"
                      >
                        <lucide-icon
                          [img]="CalendarIcon"
                          [size]="20"
                        ></lucide-icon>
                      </div>
                      <input
                        type="date"
                        [(ngModel)]="tripModel.endDate"
                        [min]="tripModel.startDate || getTodayString()"
                        class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <!-- Group Size -->
                <div>
                  <label
                    class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                    >Group Size</label
                  >
                  <div class="relative group">
                    <div
                      class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-primary-500)] transition-colors"
                    >
                      <lucide-icon [img]="UsersIcon" [size]="20"></lucide-icon>
                    </div>
                    <input
                      type="number"
                      [(ngModel)]="tripModel.participants"
                      min="1"
                      class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] transition-all outline-none"
                    />
                  </div>
                  <p class="mt-2 text-[10px] text-[var(--color-text-tertiary)]">
                    Including yourself — minimum 1 person
                  </p>
                </div>

                <!-- Description -->
                <div>
                  <label
                    class="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
                    >Description</label
                  >
                  <textarea
                    [(ngModel)]="tripModel.description"
                    rows="5"
                    placeholder="Tell us about your trip..."
                    class="w-full px-4 py-3.5 rounded-xl bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-[var(--color-primary-500)] transition-all outline-none resize-none"
                  ></textarea>
                </div>

                <!-- Validation Errors for Step 1 -->
                <div
                  *ngIf="currentStep === 1 && getStep1Errors().length > 0"
                  class="p-4 mt-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex flex-col gap-2"
                >
                  <div
                    *ngFor="let err of getStep1Errors()"
                    class="flex items-center gap-2"
                  >
                    <lucide-icon
                      [img]="AlertCircleIcon"
                      [size]="16"
                      class="flex-shrink-0"
                    ></lucide-icon>
                    <span>{{ err }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: PREFERENCES -->
            <div *ngIf="currentStep === 2" class="p-8 lg:p-12 space-y-10">
              <div class="border-b border-[var(--color-neutral-100)] pb-6 mb-8">
                <h2 class="text-2xl font-bold text-[var(--color-primary-800)]">
                  Customize Your Experience
                </h2>
                <p class="text-[var(--color-text-secondary)] mt-1">
                  Help us tailor the perfect trip plan for you
                </p>
              </div>

              <!-- Adventure Level -->
              <div class="space-y-4">
                <label
                  class="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider"
                  >Adventure Level</label
                >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    *ngFor="let level of adventureLevels"
                    (click)="tripModel.adventureLevel = level.value"
                    class="p-4 rounded-xl border-2 transition-all cursor-pointer group"
                    [ngClass]="
                      tripModel.adventureLevel === level.value
                        ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-500)] ring-4 ring-[var(--color-primary-100)]'
                        : 'bg-white border-[var(--color-neutral-100)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-neutral-50)]'
                    "
                  >
                    <div class="flex flex-col gap-1">
                      <span
                        class="font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary-700)]"
                        >{{ level.label }}</span
                      >
                      <span
                        class="text-xs text-[var(--color-text-secondary)]"
                        >{{ level.desc }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comfort Level -->
              <div class="space-y-4">
                <label
                  class="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider"
                  >Comfort Level</label
                >
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    *ngFor="let comfort of comfortLevelsEnum"
                    (click)="tripModel.comfortLevel = comfort.value"
                    class="p-4 rounded-xl border-2 transition-all cursor-pointer text-center"
                    [ngClass]="
                      tripModel.comfortLevel === comfort.value
                        ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-500)]'
                        : 'bg-white border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]'
                    "
                  >
                    <div class="flex flex-col gap-1">
                      <span class="font-bold text-sm">{{ comfort.label }}</span>
                      <span
                        class="text-[10px] text-[var(--color-text-secondary)]"
                        >{{ comfort.desc }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activities -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <label
                    class="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider"
                    >Activities & Interests</label
                  >
                  <span
                    class="text-[10px] px-2 py-1 bg-[var(--color-neutral-100)] rounded-full text-[var(--color-text-secondary)]"
                    >Select all that apply</span
                  >
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    *ngFor="let activity of allActivities"
                    (click)="toggleActivity(activity)"
                    class="flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer"
                    [ngClass]="
                      isActivitySelected(activity)
                        ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-500)]'
                        : 'bg-white border-[var(--color-neutral-100)]'
                    "
                  >
                    <span class="text-sm font-medium">{{ activity }}</span>
                    <lucide-icon
                      *ngIf="isActivitySelected(activity)"
                      [img]="CheckIcon"
                      [size]="16"
                      class="text-[var(--color-primary-600)]"
                    ></lucide-icon>
                    <div
                      *ngIf="!isActivitySelected(activity)"
                      class="w-4 h-4 rounded-md border-2 border-[var(--color-neutral-200)]"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: TRANSPORTATION -->
            <div *ngIf="currentStep === 3" class="p-8 lg:p-12 space-y-10">
              <div class="border-b border-[var(--color-neutral-100)] pb-6 mb-8">
                <h2 class="text-2xl font-bold text-[var(--color-primary-800)]">
                  Select Transportation
                </h2>
                <p class="text-[var(--color-text-secondary)] mt-1">
                  Choose how you will reach your destination
                </p>
              </div>

              <!-- Loading state -->
              <div
                *ngIf="isLoadingTransports"
                class="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  class="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin"
                ></div>
                <p class="text-[var(--color-text-secondary)] text-sm">
                  Loading available transports...
                </p>
              </div>

              <!-- Empty state -->
              <div
                *ngIf="!isLoadingTransports && transportOptions.length === 0"
                class="flex flex-col items-center justify-center py-16 gap-3 text-center"
              >
                <lucide-icon
                  [img]="InfoIcon"
                  [size]="40"
                  class="text-[var(--color-text-tertiary)]"
                ></lucide-icon>
                <p class="text-lg font-bold text-[var(--color-text-heading)]">
                  No transports available
                </p>
                <p class="text-sm text-[var(--color-text-secondary)]">
                  The admin has not added any transport options yet. Please
                  check back later.
                </p>
              </div>

              <div
                *ngIf="!isLoadingTransports && transportOptions.length > 0"
                class="space-y-3"
              >
                <div
                  *ngFor="let option of transportOptions"
                  (click)="tripModel.selectedTransportId = option.id"
                  class="flex items-center justify-between p-4 px-6 rounded-2xl border-2 transition-all cursor-pointer bg-white group"
                  [ngClass]="
                    tripModel.selectedTransportId === option.id
                      ? 'border-[var(--color-primary-500)] ring-4 ring-[var(--color-primary-100)]'
                      : 'border-[var(--color-neutral-100)] hover:border-[var(--color-primary-200)]'
                  "
                >
                  <div class="flex items-center gap-4">
                    <!-- Transport image or icon -->
                    <div
                      class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--color-neutral-100)] shadow-sm"
                    >
                      <img
                        *ngIf="option.imageUrl"
                        [src]="option.imageUrl"
                        class="w-full h-full object-cover"
                        [alt]="option.mode"
                      />
                      <div
                        *ngIf="!option.imageUrl"
                        class="w-full h-full flex items-center justify-center"
                        [ngClass]="
                          tripModel.selectedTransportId === option.id
                            ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                            : 'bg-[var(--color-neutral-50)] text-[var(--color-text-tertiary)]'
                        "
                      >
                        <lucide-icon
                          [img]="getTransportIcon(option.mode)"
                          [size]="28"
                        ></lucide-icon>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span
                          class="font-bold text-base uppercase tracking-tight text-[var(--color-text-heading)]"
                          >{{ option.mode }}</span
                        >
                        <span class="text-xs text-[var(--color-text-secondary)]"
                          >by {{ option.provider || "Private Provider" }}</span
                        >
                      </div>
                      <div
                        class="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mt-1"
                      >
                        <lucide-icon
                          [img]="ClockIcon"
                          [size]="14"
                        ></lucide-icon>
                        <span>{{ option.duration }} mins</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-6">
                    <div class="text-right">
                      <span
                        class="block font-black text-lg text-[var(--color-success-700)]"
                        >{{ option.price }} TND</span
                      >
                    </div>
                    <div
                      class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center"
                      [ngClass]="
                        tripModel.selectedTransportId === option.id
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                          : 'border-[var(--color-neutral-300)]'
                      "
                    >
                      <lucide-icon
                        *ngIf="tripModel.selectedTransportId === option.id"
                        [img]="CheckIcon"
                        [size]="14"
                        class="text-white"
                      ></lucide-icon>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="p-4 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex gap-4"
              >
                <lucide-icon
                  [img]="InfoIcon"
                  [size]="20"
                  class="text-[var(--color-primary-600)] mt-0.5"
                ></lucide-icon>
                <p
                  class="text-[11px] text-[var(--color-primary-800)] leading-relaxed"
                >
                  The estimated costs and durations are subject to real-time
                  availability and season variance. Final booking will happen
                  after trip generation.
                </p>
              </div>
            </div>

            <!-- STEP 4: REVIEW -->
            <div *ngIf="currentStep === 4" class="p-8 lg:p-12 space-y-10">
              <div class="border-b border-[var(--color-neutral-100)] pb-6 mb-8">
                <h2 class="text-2xl font-bold text-[var(--color-primary-800)]">
                  Review Your Trip Plan
                </h2>
                <p class="text-[var(--color-text-secondary)] mt-1">
                  Confirm your details before we generate your personalized
                  itinerary
                </p>
              </div>

              <div
                class="rounded-3xl bg-[var(--color-success-50)]/50 border border-[var(--color-success-100)] p-8 space-y-8"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3
                      class="text-3xl font-black text-[var(--color-primary-900)]"
                    >
                      {{ tripModel.title }}
                    </h3>
                    <div
                      class="flex items-center gap-2 mt-2 font-medium text-[var(--color-accent-700)]"
                    >
                      <lucide-icon [img]="MapPinIcon" [size]="16"></lucide-icon>
                      <span>{{ tripModel.destinationName }}</span>
                    </div>
                  </div>
                  <div
                    class="px-4 py-2 bg-white rounded-2xl shadow-sm text-sm font-bold border border-[var(--color-success-200)] text-[var(--color-primary-800)]"
                  >
                    {{ calculateDuration() }} days
                  </div>
                </div>

                <div
                  class="grid grid-cols-2 gap-8 border-y border-[var(--color-success-200)] py-6"
                >
                  <div class="space-y-4">
                    <div class="flex flex-col gap-1">
                      <span
                        class="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]"
                        >Dates</span
                      >
                      <div
                        class="flex items-center gap-2 text-sm font-semibold"
                      >
                        <lucide-icon
                          [img]="CalendarIcon"
                          [size]="16"
                          class="text-[var(--color-primary-500)]"
                        ></lucide-icon>
                        <span
                          >{{ tripModel.startDate | date: "yyyy-MM-dd" }} —
                          {{ tripModel.endDate | date: "yyyy-MM-dd" }}</span
                        >
                      </div>
                    </div>
                    <div class="flex flex-col gap-1">
                      <span
                        class="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]"
                        >Adventure Level</span
                      >
                      <div
                        class="flex items-center gap-2 text-sm font-semibold"
                      >
                        <lucide-icon
                          [img]="CompassIcon"
                          [size]="16"
                          class="text-[var(--color-primary-500)]"
                        ></lucide-icon>
                        <span class="capitalize">{{
                          tripModel.adventureLevel.toLowerCase()
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="flex flex-col gap-1">
                      <span
                        class="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]"
                        >Group Size</span
                      >
                      <div
                        class="flex items-center gap-2 text-sm font-semibold"
                      >
                        <lucide-icon
                          [img]="UsersIcon"
                          [size]="16"
                          class="text-[var(--color-primary-500)]"
                        ></lucide-icon>
                        <span>{{ tripModel.participants }} people</span>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1">
                      <span
                        class="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]"
                        >Transportation</span
                      >
                      <div
                        class="flex items-center gap-2 text-sm font-semibold"
                      >
                        <lucide-icon
                          [img]="getTransportIcon(getSelectedTransport()?.mode)"
                          [size]="16"
                          class="text-[var(--color-primary-500)]"
                        ></lucide-icon>
                        <span
                          >{{ getSelectedTransport()?.mode || "None" }} by
                          {{
                            getSelectedTransport()?.provider || "Hertz"
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    class="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]"
                    >Activities to Include</span
                  >
                  <div class="flex flex-wrap gap-2 mt-3">
                    <span
                      *ngFor="let act of tripModel.activities"
                      class="px-4 py-1.5 bg-[var(--color-success-100)] text-[var(--color-success-800)] rounded-full text-xs font-bold"
                    >
                      {{ act }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="p-6 rounded-3xl border-2 border-dashed border-[var(--color-primary-200)] bg-[var(--color-primary-50)]/30 flex items-start gap-5"
              >
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                  <lucide-icon
                    [img]="PlusIcon"
                    [size]="20"
                    class="text-[var(--color-accent-500)]"
                  ></lucide-icon>
                </div>
                <div>
                  <h4 class="font-bold text-[var(--color-primary-900)]">
                    AI-Powered Trip Planning
                  </h4>
                  <p
                    class="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed"
                  >
                    Our intelligent system will use these preferences to
                    generate a fully customized experience, including:
                    <span class="flex gap-4 mt-2 font-medium">
                      <span>• Day-by-day itinerary</span>
                      <span>• Personalized packing list</span>
                    </span>
                    <span class="flex gap-4 mt-1 font-medium">
                      <span>• Budget estimation</span>
                      <span>• Nearby points of interest</span>
                    </span>
                  </p>
                </div>
              </div>

              <button
                (click)="handleSubmit()"
                [disabled]="isSubmitting"
                class="w-full py-5 rounded-2xl bg-[var(--color-primary-900)] text-white text-lg font-black hover:bg-[var(--color-primary-800)] shadow-lg shadow-[var(--color-primary-200)] group relative overflow-hidden transition-all"
              >
                <div
                  class="relative z-10 flex items-center justify-center gap-3"
                >
                  <lucide-icon
                    [img]="CompassIcon"
                    [size]="24"
                    class="animate-pulse"
                  ></lucide-icon>
                  <span>{{
                    isSubmitting
                      ? "Generating Your Plan..."
                      : "Generate My Trip Plan"
                  }}</span>
                </div>
                <div
                  class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/20 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                ></div>
              </button>
            </div>
          </app-card-content>
        </app-card>

        <!-- Navigation Buttons -->
        <div class="mt-8 flex justify-between items-center px-4">
          <button
            *ngIf="currentStep > 1"
            (click)="prevStep()"
            class="flex items-center gap-2 text-[var(--color-text-secondary)] font-bold hover:text-[var(--color-primary-700)] transition-colors py-2"
          >
            ← Back to {{ getStepLabel(currentStep - 1) }}
          </button>
          <div *ngIf="currentStep === 1">
            <button
              (click)="goBack()"
              class="flex items-center gap-2 text-[var(--color-text-tertiary)] font-bold hover:text-red-500 transition-colors py-2"
            >
              ← Cancel & Go Back
            </button>
          </div>

          <button
            *ngIf="currentStep < 4"
            (click)="nextStep()"
            [disabled]="!isStepValid()"
            class="flex items-center gap-3 px-8 py-3.5 bg-[var(--color-primary-900)] text-white rounded-2xl font-black hover:bg-[var(--color-primary-800)] hover:scale-105 transition-all shadow-md shadow-[var(--color-primary-100)] disabled:opacity-50 disabled:scale-100"
          >
            Next Step
            <lucide-icon [img]="ArrowRightIcon" [size]="18"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    `,
  ],
})
export class PlanTripComponent implements OnInit {
  // Icons
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  DollarSignIcon = DollarSign;
  PlusIcon = Plus;
  ArrowLeftIcon = ArrowLeft;
  ArrowRightIcon = ArrowRight;
  CheckIcon = Check;
  InfoIcon = Info;
  CompassIcon = Compass;
  ClockIcon = Clock;
  TentIcon = Tent;
  AlertCircleIcon = AlertCircle;
  Share2Icon = Share2;

  currentStep = 1;
  isSubmitting = false;
  isLoadingTransports = false;

  tripModel = {
    title: "",
    destinationName: "",
    startDate: "",
    endDate: "",
    participants: 1,
    description: "",
    adventureLevel: "",
    comfortLevel: "",
    budget: 0,
    activities: [] as string[],
    selectedTransportId: "",
  };

  adventureLevels = [
    { label: "Easy", value: "EASY", desc: "Light hiking, accessible trails" },
    { label: "Moderate", value: "MODERATE", desc: "Some challenging terrain" },
    {
      label: "Challenging",
      value: "HARD",
      desc: "Strenuous activities, backcountry",
    },
  ];

  comfortLevelsEnum = [
    { label: "Minimal", value: "MINIMAL", desc: "Backpacking essentials" },
    { label: "Basic", value: "BASIC", desc: "Tent camping basics" },
    { label: "Comfortable", value: "COMFORTABLE", desc: "Full gear, setup" },
    { label: "Luxury", value: "LUXURY", desc: "Glamping with amenities" },
  ];

  allActivities = [
    "Hiking",
    "Camping",
    "Photography",
    "Outdoor Cooking",
    "Campfire",
    "Wildlife Watching",
    "Fishing",
    "Rock Climbing",
    "Nature Walks",
  ];

  transportOptions: any[] = [];

  constructor(
    public router: Router,
    private tripService: TripService,
    private authService: AuthService,
    private transportationService: TransportationService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    // Pre-load transports immediately so step 3 is always ready
    this.loadTransportOptions();
    // If a tripId query param exists, load trip for editing
    this.route.queryParamMap.subscribe((params) => {
      const tripId = params.get("tripId");
      if (tripId) {
        this.tripService.getTripById(tripId).subscribe({
          next: (data: any) => {
            this.tripModel.title = data.title || data.name || "";
            this.tripModel.destinationName =
              typeof data.destination === "string"
                ? data.destination
                : data.destination?.address || "";
            this.tripModel.startDate = data.startDate
              ? new Date(data.startDate).toISOString().split("T")[0]
              : "";
            this.tripModel.endDate = data.endDate
              ? new Date(data.endDate).toISOString().split("T")[0]
              : "";
            this.tripModel.participants = data.participants || 1;
            this.tripModel.description = data.description || "";
            this.tripModel.adventureLevel =
              (data.difficulty || "").toUpperCase() || "";
            this.tripModel.comfortLevel =
              (data.comfortLevel || "").toUpperCase() || "";
            this.tripModel.activities = data.activities || [];
            if (data.transportIds && data.transportIds.length)
              this.tripModel.selectedTransportId = data.transportIds[0];
          },
          error: (err) => console.error("Failed to load trip for editing", err),
        });
      }
    });
  }

  nextStep(): void {
    // Reload transports if they failed to load on init
    if (
      this.currentStep === 2 &&
      this.transportOptions.length === 0 &&
      !this.isLoadingTransports
    ) {
      this.loadTransportOptions();
    }
    if (this.currentStep < 4) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(
          this.tripModel.title &&
          this.tripModel.title.length >= 3 &&
          this.tripModel.destinationName &&
          this.tripModel.startDate &&
          this.tripModel.endDate &&
          this.tripModel.participants >= 1 &&
          this.getStep1Errors().length === 0
        );
      case 2:
        return !!(this.tripModel.adventureLevel && this.tripModel.comfortLevel);
      case 3:
        return !!this.tripModel.selectedTransportId;
      default:
        return true;
    }
  }

  getTodayString(): string {
    return new Date().toISOString().split("T")[0];
  }

  getStep1Errors(): string[] {
    const errors: string[] = [];
    if (this.currentStep !== 1) return errors;

    if (this.tripModel.title && this.tripModel.title.length < 3) {
      errors.push("Trip name must be at least 3 characters.");
    }
    if (
      this.tripModel.participants != null &&
      this.tripModel.participants < 1
    ) {
      errors.push("Group size must be at least 1 person.");
    }

    if (this.tripModel.startDate) {
      const todayStr = this.getTodayString();
      if (this.tripModel.startDate < todayStr) {
        errors.push("Start date cannot be in the past.");
      }
    }

    if (this.tripModel.startDate && this.tripModel.endDate) {
      if (this.tripModel.endDate < this.tripModel.startDate) {
        errors.push("End date cannot be before start date.");
      }
    }

    return errors;
  }

  getStepLabel(step: number): string {
    const labels: any = {
      1: "Basic Info",
      2: "Preferences",
      3: "Transportation",
      4: "Review",
    };
    return labels[step] || "";
  }

  getStepClass(step: number): string {
    if (this.currentStep === step)
      return "bg-[var(--color-primary-600)] text-white shadow-lg shadow-[var(--color-primary-200)]";
    if (this.currentStep > step)
      return "bg-[var(--color-primary-500)] text-white";
    return "bg-[var(--color-neutral-100)] text-[var(--color-text-tertiary)] border-2 border-[var(--color-neutral-200)]";
  }

  getProgressBarWidth(): number {
    return ((this.currentStep - 1) / 3) * 100;
  }

  toggleActivity(activity: string): void {
    const index = this.tripModel.activities.indexOf(activity);
    if (index > -1) {
      this.tripModel.activities.splice(index, 1);
    } else {
      this.tripModel.activities.push(activity);
    }
  }

  isActivitySelected(activity: string): boolean {
    return this.tripModel.activities.includes(activity);
  }

  loadTransportOptions(): void {
    this.isLoadingTransports = true;
    this.transportOptions = [];
    this.transportationService.getAllTransports().subscribe({
      next: (data: any[]) => {
        // Map backend fields: backend uses 'cost', template uses 'price'
        this.transportOptions = data.map((t) => ({
          id: t.id,
          mode: t.mode,
          provider: t.provider,
          duration: t.duration,
          price: t.cost,
          imageUrl: t.imageUrl || null,
        }));
        this.isLoadingTransports = false;
      },
      error: (err: any) => {
        console.error("Failed to load transports from backend", err);
        this.isLoadingTransports = false;
      },
    });
  }

  getTransportIcon(mode: string): any {
    switch (mode?.toUpperCase()) {
      case "CAR":
        return Car;
      case "BUS":
        return Bus;
      case "TRAIN":
        return Train;
      case "BIKE":
        return Bike;
      case "SHARED_RIDE":
        return Share2;
      default:
        return Car;
    }
  }

  getSelectedTransport(): any {
    return this.transportOptions.find(
      (o) => o.id === this.tripModel.selectedTransportId,
    );
  }

  calculateDuration(): number {
    if (!this.tripModel.startDate || !this.tripModel.endDate) return 1;
    const start = new Date(this.tripModel.startDate);
    const end = new Date(this.tripModel.endDate);
    return Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  handleSubmit(): void {
    const userSnapshot = this.authService.currentUserValue;
    if (!userSnapshot) {
      alert("You must be logged in to create a trip plan!");
      return;
    }

    this.isSubmitting = true;

    try {
      const tripDto = {
        title: this.tripModel.title,
        destination: {
          address: this.tripModel.destinationName,
          latitude: 0,
          longitude: 0,
        },
        startDate: new Date(this.tripModel.startDate).toISOString(),
        endDate: new Date(this.tripModel.endDate).toISOString(),
        difficulty: this.tripModel.adventureLevel,
        totalBudget:
          (this.getSelectedTransport()?.price || 0) *
          this.tripModel.participants,
        status: "PLANNED",
        participants: this.tripModel.participants,
        userId: userSnapshot.id,
        comfortLevel: this.tripModel.comfortLevel,
        activities: this.tripModel.activities,
        transportIds: [this.tripModel.selectedTransportId],
        imageUrl:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80",
      };

      this.tripService.createTrip(tripDto).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          console.log("Created trip:", response);
          this.router.navigate(["/trips", response.id]);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error("Failed to create trip", err);
          alert(
            "Failed to create trip. " +
              (err.error?.message || err.message || ""),
          );
        },
      });
    } catch (e) {
      this.isSubmitting = false;
      alert("An error occurred formatting the trip data.");
      console.error(e);
    }
  }
}
