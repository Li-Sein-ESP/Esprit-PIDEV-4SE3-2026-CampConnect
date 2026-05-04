<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../shared/components/card.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, Calendar, MapPin, Users, DollarSign, Plus } from 'lucide-angular';
import { TripService } from './services/trip.service';

@Component({
  selector: 'app-plan-trip',
=======
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
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
    LucideAngularModule
  ],
  template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Plan Your Trip
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Create a detailed itinerary for your next outdoor adventure
        </p>
      </div>

      <!-- Trip Planning Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <app-card variant="default" padding="lg">
            <form (ngSubmit)="handleSubmit()" class="space-y-6">
              <!-- Trip Name -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  [(ngModel)]="tripName"
                  name="tripName"
                  placeholder="e.g., Summer Yosemite Adventure"
                  class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  required
                />
              </div>

              <!-- Destination -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Destination
                </label>
                <app-dropdown
                  [options]="destinationOptions"
                  [(ngModel)]="destination"
                  name="destination"
                  placeholder="Select a destination"
                ></app-dropdown>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="startDate"
                    name="startDate"
                    class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="endDate"
                    name="endDate"
                    class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <!-- Group Size -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Group Size
                </label>
                <input
                  type="number"
                  [(ngModel)]="groupSize"
                  name="groupSize"
                  min="1"
                  max="20"
                  placeholder="Number of people"
                  class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  required
                />
              </div>

              <!-- Budget -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Estimated Budget (per person)
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="DollarSignIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    type="number"
                    [(ngModel)]="budget"
                    name="budget"
                    min="0"
                    placeholder="0.00"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Trip Notes
                </label>
                <textarea
                  [(ngModel)]="notes"
                  name="notes"
                  rows="4"
                  placeholder="Add any special requirements, activities, or notes..."
                  class="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-3">
                <button
                  type="submit"
                  class="flex-1 px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
                >
                  Create Trip Plan
                </button>
                <button
                  type="button"
                  (click)="router.navigate(['/trips'])"
                  class="px-6 py-3 bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] border border-[var(--color-border-medium)] rounded-lg hover:bg-[var(--color-neutral-200)] transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </app-card>
        </div>

        <!-- Sidebar - Quick Tips -->
        <div class="lg:col-span-1">
          <app-card variant="default" padding="md">
            <app-card-header>
              <app-card-title>Planning Tips</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CalendarIcon" [size]="16" class="text-[var(--color-primary-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Book Early</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Popular campsites fill up months in advance</div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-success-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="MapPinIcon" [size]="16" class="text-[var(--color-success-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Check Permits</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Some areas require special permits</div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-accent-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="UsersIcon" [size]="16" class="text-[var(--color-accent-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Group Size</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Most sites have group size limits</div>
                  </div>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <!-- Popular Destinations -->
          <app-card variant="default" padding="md" customClass="mt-6">
            <app-card-header>
              <app-card-title>Popular Destinations</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-2">
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Yosemite National Park
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Grand Canyon
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Yellowstone
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Zion National Park
                </button>
              </div>
            </app-card-content>
          </app-card>
=======
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-neutral-50)] pb-20">
      <!-- Premium Hero Header -->
      <section class="bg-slate-900 pt-32 pb-20 px-6 relative overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&q=80"
            class="w-full h-full object-cover opacity-30 scale-110 blur-sm"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"
          ></div>
        </div>

        <div class="container relative z-10">
          <div
            class="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            <h1
              class="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
            >
              Plan Your <span class="text-emerald-400">Next Mission</span>
            </h1>
            <p
              class="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed"
            >
              Configure your expedition parameters and let our tactical planning
              system generate your optimal wilderness itinerary.
            </p>
          </div>
        </div>
      </section>

      <!-- Futurist Stepper -->
      <div class="container -mt-12 relative z-20 px-6 mb-16">
        <div
          class="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-white shadow-2xl shadow-black/5 max-w-5xl mx-auto flex items-center justify-between gap-4"
        >
          <div
            *ngFor="let step of [1, 2, 3, 4, 5]; let last = last"
            class="flex items-center gap-4 flex-1 last:flex-none"
          >
            <div class="flex items-center gap-3">
              <div
                [ngClass]="
                  currentStep >= step
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                "
                class="w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 scale-100 group-hover:scale-110"
              >
                <lucide-icon
                  *ngIf="currentStep > step"
                  [img]="CheckIcon"
                  [size]="20"
                ></lucide-icon>
                <span *ngIf="currentStep <= step">{{ step }}</span>
              </div>
              <div class="hidden md:block">
                <p
                  class="text-[10px] font-black uppercase tracking-widest leading-none mb-1"
                  [ngClass]="
                    currentStep >= step ? 'text-emerald-600' : 'text-slate-400'
                  "
                >
                  Phase 0{{ step }}
                </p>
                <p class="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {{ getStepLabel(step) }}
                </p>
              </div>
            </div>
            <div
              *ngIf="!last"
              class="flex-1 h-[2px] rounded-full hidden lg:block"
              [ngClass]="currentStep > step ? 'bg-emerald-600' : 'bg-slate-100'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Config Console -->
      <div class="container px-6">
        <div class="max-w-5xl mx-auto">
          <!-- PHASE 1: LOGISTICS -->
          <div
            *ngIf="currentStep === 1"
            class="animate-in fade-in slide-in-from-right-8 duration-500 bg-white rounded-[40px] p-8 lg:p-16 border border-white shadow-xl"
          >
            <div class="flex items-end justify-between mb-12">
              <div class="max-w-xl">
                <span
                  class="text-emerald-600 font-black text-xs uppercase tracking-widest mb-2 block"
                  >Configuration 01</span
                >
                <h2 class="text-4xl font-black text-slate-900 leading-tight">
                  Expedition <span class="text-emerald-600">Fundamentals</span>
                </h2>
              </div>
              <div class="hidden lg:block w-32 h-[1px] bg-slate-100 mb-4"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div class="space-y-8">
                <div class="group">
                  <label
                    class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                    >Mission Title</label
                  >
                  <div class="relative h-16">
                    <lucide-icon
                      [img]="TentIcon"
                      [size]="18"
                      class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
                    ></lucide-icon>
                    <input
                      type="text"
                      [(ngModel)]="tripModel.title"
                      placeholder="e.g., North Shore High Intensity"
                      class="w-full h-full pl-16 pr-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500/30 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="group">
                    <label
                      class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                      >Deployment</label
                    >
                    <div class="relative h-14">
                      <input
                        type="date"
                        [(ngModel)]="tripModel.startDate"
                        class="w-full h-full px-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/30 rounded-xl font-bold transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div class="group">
                    <label
                      class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                      >Extraction</label
                    >
                    <div class="relative h-14">
                      <input
                        type="date"
                        [(ngModel)]="tripModel.endDate"
                        class="w-full h-full px-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/30 rounded-xl font-bold transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-8">
                <div class="group">
                  <label
                    class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                    >Group Capacity</label
                  >
                  <div class="relative h-16">
                    <lucide-icon
                      [img]="UsersIcon"
                      [size]="18"
                      class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
                    ></lucide-icon>
                    <input
                      type="number"
                      [(ngModel)]="tripModel.participants"
                      class="w-full h-full pl-16 pr-6 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500/30 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                    >Mission briefing</label
                  >
                  <textarea
                    [(ngModel)]="tripModel.description"
                    rows="5"
                    placeholder="Operational details/notes..."
                    class="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500/30 rounded-3xl font-bold transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- PHASE 2: PARAMETERS -->
          <div
            *ngIf="currentStep === 2"
            class="animate-in fade-in slide-in-from-right-8 duration-500 bg-white rounded-[40px] p-8 lg:p-16 border border-white shadow-xl"
          >
            <div class="mb-12">
              <span
                class="text-emerald-600 font-black text-xs uppercase tracking-widest mb-2 block"
                >Configuration 02</span
              >
              <h2 class="text-4xl font-black text-slate-900 mb-8">
                Adventure <span class="text-emerald-600">Thresholds</span>
              </h2>
            </div>

            <div class="space-y-12">
              <!-- Adventure Level -->
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"
                  >Operational Difficulty</label
                >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    *ngFor="let level of adventureLevels"
                    (click)="tripModel.adventureLevel = level.value"
                    class="relative group cursor-pointer overflow-hidden rounded-3xl p-6 border-2 transition-all duration-300"
                    [ngClass]="
                      tripModel.adventureLevel === level.value
                        ? 'border-emerald-500 bg-emerald-50 scale-100 shadow-xl'
                        : 'border-slate-100 bg-slate-50 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                    "
                  >
                    <div class="flex flex-col gap-2">
                      <span class="text-sm font-black text-slate-900">{{
                        level.label
                      }}</span>
                      <span class="text-xs text-slate-500 leading-relaxed">{{
                        level.desc
                      }}</span>
                    </div>
                    <div
                      *ngIf="tripModel.adventureLevel === level.value"
                      class="absolute -right-2 -bottom-2 opacity-10"
                    >
                      <lucide-icon
                        [img]="CheckIcon"
                        [size]="80"
                        class="text-emerald-600"
                      ></lucide-icon>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comfort Level (Added to fix validation) -->
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"
                  >Base Comfort Parameters</label
                >
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    *ngFor="let level of comfortLevelsEnum"
                    (click)="tripModel.comfortLevel = level.value"
                    class="relative group cursor-pointer overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 text-center"
                    [ngClass]="
                      tripModel.comfortLevel === level.value
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                    "
                  >
                    <p
                      class="text-[10px] font-black text-slate-900 uppercase tracking-widest"
                    >
                      {{ level.label }}
                    </p>
                    <p class="text-[9px] text-slate-400 mt-1 uppercase">
                      {{ level.desc }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Activities -->
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"
                  >Specific Directives</label
                >
                <div class="flex flex-wrap gap-3">
                  <button
                    *ngFor="let act of allActivities"
                    (click)="toggleActivity(act)"
                    class="px-6 py-3 rounded-full text-sm font-bold transition-all border-2"
                    [ngClass]="
                      isActivitySelected(act)
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-300'
                    "
                  >
                    {{ act }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- PHASE 3: AI CAMPSITE INTELLIGENCE -->
          <div
            *ngIf="currentStep === 3"
            class="animate-in fade-in slide-in-from-right-8 duration-500 bg-white rounded-[40px] p-8 lg:p-14 border border-white shadow-xl"
          >
            <div class="mb-10">
              <span class="text-emerald-600 font-black text-xs uppercase tracking-widest mb-2 block">Configuration 03</span>
              <h2 class="text-4xl font-black text-slate-900 leading-tight">
                AI Campsite <span class="text-emerald-600">Intelligence</span>
              </h2>
              <p class="text-slate-400 text-sm font-medium mt-3 max-w-xl">Our model scores Tunisian camping regions by environmental suitability for your travel dates — then surfaces the top-matching campsites within those regions.</p>
            </div>

            <!-- Mode Toggle -->
            <div class="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit mb-8">
              <button
                (click)="aiViewMode = 'ai'"
                class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                [ngClass]="aiViewMode === 'ai' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'"
              >✦ AI Picks</button>
              <button
                (click)="aiViewMode = 'browse'"
                class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                [ngClass]="aiViewMode === 'browse' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'"
              >Browse All</button>
            </div>

            <!-- AI VIEW -->
            <div *ngIf="aiViewMode === 'ai'">

            <!-- AI Thinking Panel - Friendly Design -->
            <div class="bg-white rounded-[28px] p-8 mb-8 border-2 border-slate-100">
              <!-- Header -->
              <div class="flex items-start justify-between mb-7">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-100 flex-shrink-0">
                    <span class="text-white font-black text-xs tracking-widest">AI</span>
                  </div>
                  <div>
                    <h3 class="font-black text-slate-900 text-sm leading-tight">Finding your best matches</h3>
                    <p class="text-slate-400 text-[11px] mt-0.5">Analyzing your preferences &amp; available campsites</p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 mt-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style="animation-delay:0.25s"></span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style="animation-delay:0.5s"></span>
                </div>
              </div>

              <!-- Processing steps -->
              <div class="space-y-4 pl-1">
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 0.15s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 0.65s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Reading your trip details</span>
                </div>
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 0.55s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 1.05s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Searching through available campsites</span>
                </div>
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 0.95s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 1.45s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Checking the weather for your dates</span>
                </div>
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 1.35s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 1.85s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Checking what works best for your group</span>
                </div>
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 1.75s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 2.25s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Calculating the best matches for you</span>
                </div>
                <div class="flex items-center gap-3 ai-line" style="animation-delay: 2.15s">
                  <span class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="ai-check text-emerald-500 text-[8px] font-black" style="animation-delay: 2.65s">✓</span>
                  </span>
                  <span class="text-slate-600 text-sm">Preparing your top picks</span>
                </div>
              </div>

              <!-- Analysis Complete -->
              <div class="mt-6 pt-5 border-t border-slate-100 ai-complete" style="animation-delay: 3.0s">
                <div class="inline-flex items-center gap-2.5 bg-emerald-50 rounded-full px-5 py-2.5">
                  <span class="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-[9px] font-black">✓</span>
                  </span>
                  <span class="font-black text-emerald-700 text-sm">Analysis complete</span>
                  <span class="text-emerald-500 text-[11px]">· 3 Tunisian campsites matched for {{ tripMonth }}</span>
                </div>
              </div>
            </div>

            <!-- Recommendations: fade in after thinking completes -->
            <div class="ai-recommendations">

            <!-- Section label -->
            <div class="mb-5">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranked by Regional Suitability — Select Your Campsite</h3>
            </div>

            <!-- Campsite Cards Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

              <!-- Card 1: Ain Draham -->
              <div
                (click)="tripModel.selectedCampsiteIndex = 0"
                class="relative cursor-pointer rounded-[28px] border-2 transition-all duration-300 overflow-hidden"
                [ngClass]="tripModel.selectedCampsiteIndex === 0
                  ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                  : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md'"
              >
                <div *ngIf="tripModel.selectedCampsiteIndex === 0" class="absolute top-3 right-3 z-10">
                  <span class="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-emerald-200">✦ Selected</span>
                </div>
                <div class="h-40 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">#1</div>
                    <div class="min-w-0">
                      <p class="font-black text-slate-900 text-sm leading-tight">Ain Draham Forest Camp</p>
                      <p class="text-slate-500 text-[10px] mt-0.5 font-semibold">Kroumirie Mountains, Jendouba</p>
                      <p class="text-slate-400 text-[9px]">Forest · 900m altitude</p>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Score</span>
                      <span class="font-black text-emerald-600 text-base leading-none">94<span class="text-[10px] text-slate-400 font-bold">/100</span></span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full w-[94%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full ai-bar" style="animation-delay: 3.5s"></div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      <span class="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0"></span>Highly Recommended
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Family Friendly</span>
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Water Access</span>
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Guided Hikes</span>
                  </div>
                  <div class="mb-3">
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Best Activity</span>
                    <p class="text-[10px] text-emerald-600 font-bold mt-0.5">Forest Hiking & Wildlife</p>
                  </div>
                  <div class="bg-emerald-50 rounded-xl p-3">
                    <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">✦ Regional Insight · {{ tripMonth }}</p>
                    <p class="text-[10px] text-emerald-800 font-medium leading-snug">Cork oak forests at peak — mild 16–22°C, rich birdlife, trails dry after seasonal rains.</p>
                  </div>
                </div>
              </div>

              <!-- Card 2: Djebel Chambi -->
              <div
                (click)="tripModel.selectedCampsiteIndex = 1"
                class="relative cursor-pointer rounded-[28px] border-2 transition-all duration-300 overflow-hidden"
                [ngClass]="tripModel.selectedCampsiteIndex === 1
                  ? 'border-amber-400 shadow-xl shadow-amber-100'
                  : 'border-slate-100 bg-white hover:border-amber-200 hover:shadow-md'"
              >
                <div *ngIf="tripModel.selectedCampsiteIndex === 1" class="absolute top-3 right-3 z-10">
                  <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-amber-200">✦ Selected</span>
                </div>
                <div class="h-40 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">#2</div>
                    <div class="min-w-0">
                      <p class="font-black text-slate-900 text-sm leading-tight">Djebel Chambi Base Camp</p>
                      <p class="text-slate-500 text-[10px] mt-0.5 font-semibold">Chambi National Park, Kasserine</p>
                      <p class="text-slate-400 text-[9px]">Mountain · 1,200m altitude</p>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Score</span>
                      <span class="font-black text-amber-500 text-base leading-none">81<span class="text-[10px] text-slate-400 font-bold">/100</span></span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full w-[81%] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full ai-bar" style="animation-delay: 3.6s"></div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <span class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      <span class="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0"></span>Good Match
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Summit Views</span>
                    <span class="text-[9px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-md border border-amber-200">⚠ No Electricity</span>
                  </div>
                  <div class="mb-3">
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Best Activity</span>
                    <p class="text-[10px] text-amber-600 font-bold mt-0.5">Summit Trekking</p>
                  </div>
                  <div class="bg-amber-50 rounded-xl p-3">
                    <p class="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">✦ Regional Insight · {{ tripMonth }}</p>
                    <p class="text-[10px] text-amber-800 font-medium leading-snug">Snowmelt trails clearing — dramatic summit views, low UV vs peak summer, optimal trekking window.</p>
                  </div>
                </div>
              </div>

              <!-- Card 3: Tabarka -->
              <div
                (click)="tripModel.selectedCampsiteIndex = 2"
                class="relative cursor-pointer rounded-[28px] border-2 transition-all duration-300 overflow-hidden"
                [ngClass]="tripModel.selectedCampsiteIndex === 2
                  ? 'border-slate-400 shadow-xl shadow-slate-200'
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'"
              >
                <div *ngIf="tripModel.selectedCampsiteIndex === 2" class="absolute top-3 right-3 z-10">
                  <span class="bg-slate-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">✦ Selected</span>
                </div>
                <div class="h-40 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-400 text-white flex items-center justify-center font-black text-[10px] flex-shrink-0">#3</div>
                    <div class="min-w-0">
                      <p class="font-black text-slate-900 text-sm leading-tight">Tabarka Grove Camp</p>
                      <p class="text-slate-500 text-[10px] mt-0.5 font-semibold">Northwest Coast, Tabarka</p>
                      <p class="text-slate-400 text-[9px]">Coastal Forest · 40m altitude</p>
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Score</span>
                      <span class="font-black text-slate-500 text-base leading-none">73<span class="text-[10px] text-slate-400 font-bold">/100</span></span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full w-[73%] bg-gradient-to-r from-slate-300 to-slate-400 rounded-full ai-bar" style="animation-delay: 3.7s"></div>
                    </div>
                  </div>
                  <div class="mb-3">
                    <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      <span class="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0"></span>Average Match
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Electricity</span>
                    <span class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">✓ Beach Access</span>
                  </div>
                  <div class="mb-3">
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Best Activity</span>
                    <p class="text-[10px] text-slate-600 font-bold mt-0.5">Photography & Snorkeling</p>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">✦ Regional Insight · {{ tripMonth }}</p>
                    <p class="text-[10px] text-slate-700 font-medium leading-snug">Mediterranean spring peak — coral reefs accessible, full forest canopy, minimal tourist crowds.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confidence Breakdown -->
            <div class="bg-slate-50 rounded-[28px] p-8 border border-slate-100">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-400 text-[9px] font-mono font-black">AI</span>
                </div>
                <div>
                  <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regional Compatibility Breakdown</h4>
                  <p class="text-[9px] text-slate-400 font-mono mt-0.5">Environmental &amp; preference factors · {{ tripMonth }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weather Compatibility</span>
                    <span class="text-[10px] font-black text-emerald-600 font-mono">96%</span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full w-[96%] bg-emerald-500 rounded-full ai-bar" style="animation-delay: 3.8s"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Family Suitability</span>
                    <span class="text-[10px] font-black text-emerald-600 font-mono">91%</span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full w-[91%] bg-emerald-500 rounded-full ai-bar" style="animation-delay: 4.0s"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety Score</span>
                    <span class="text-[10px] font-black text-emerald-600 font-mono">89%</span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full w-[89%] bg-emerald-500 rounded-full ai-bar" style="animation-delay: 4.2s"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Environmental Rating</span>
                    <span class="text-[10px] font-black text-emerald-600 font-mono">87%</span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full w-[87%] bg-emerald-500 rounded-full ai-bar" style="animation-delay: 4.4s"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Booking Demand</span>
                    <span class="text-[10px] font-black text-amber-500 font-mono">72%</span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full w-[72%] bg-amber-400 rounded-full ai-bar" style="animation-delay: 4.6s"></div>
                  </div>
                </div>
              </div>
            </div>

            </div><!-- /ai-recommendations -->
            </div><!-- /ai-view -->

            <!-- BROWSE VIEW -->
            <div *ngIf="aiViewMode === 'browse'" class="animate-in fade-in duration-300">
              <!-- Search bar -->
              <div class="relative mb-7">
                <lucide-icon [img]="CompassIcon" [size]="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></lucide-icon>
                <input
                  type="text"
                  [(ngModel)]="campsiteSearch"
                  placeholder="Search by name, type or activity..."
                  class="w-full h-14 pl-14 pr-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl font-bold transition-all outline-none text-sm"
                />
                <span *ngIf="campsiteSearch" (click)="campsiteSearch = ''" class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</span>
              </div>

              <!-- Results count -->
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                {{ filteredCampsites.length }} campsite{{ filteredCampsites.length !== 1 ? 's' : '' }} available
              </p>

              <!-- Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div
                  *ngFor="let camp of filteredCampsites"
                  (click)="tripModel.selectedCampsiteIndex = camp.id"
                  class="relative cursor-pointer rounded-[24px] border-2 transition-all duration-300 overflow-hidden bg-white"
                  [ngClass]="tripModel.selectedCampsiteIndex === camp.id
                    ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                    : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'"
                >
                  <!-- Selected badge -->
                  <div *ngIf="tripModel.selectedCampsiteIndex === camp.id" class="absolute top-3 right-3 z-10">
                    <span class="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">✦ Selected</span>
                  </div>
                  <!-- AI Pick badge -->
                  <div *ngIf="camp.aiPick && tripModel.selectedCampsiteIndex !== camp.id" class="absolute top-3 left-3 z-10">
                    <span class="bg-slate-900 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">✦ AI Pick</span>
                  </div>
                  <!-- Image -->
                  <div class="h-44 overflow-hidden">
                    <img [src]="camp.image" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <!-- Content -->
                  <div class="p-5">
                    <div class="flex items-start justify-between mb-2">
                      <div class="min-w-0 pr-2">
                        <p class="font-black text-slate-900 text-sm leading-tight">{{ camp.name }}</p>
                        <p class="text-slate-500 text-[10px] mt-0.5 font-semibold">{{ camp.region }}</p>
                        <p class="text-slate-400 text-[9px]">{{ camp.type }} · {{ camp.altitude }}</p>
                      </div>
                      <span class="font-black text-sm leading-none flex-shrink-0"
                        [ngClass]="camp.score >= 85 ? 'text-emerald-600' : camp.score >= 70 ? 'text-amber-500' : 'text-slate-400'">
                        {{ camp.score }}<span class="text-[9px] text-slate-400 font-bold">/100</span>
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-1 mb-3">
                      <span *ngFor="let tag of camp.tags" class="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">{{ tag }}</span>
                    </div>
                    <div class="pt-3 border-t border-slate-100 mb-3">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Best For</p>
                      <p class="text-[10px] text-emerald-600 font-bold mt-0.5">{{ camp.activity }}</p>
                    </div>
                    <div class="bg-emerald-50 rounded-xl p-2.5">
                      <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">✦ Regional Insight</p>
                      <p class="text-[10px] text-emerald-800 font-medium leading-snug">{{ camp.whyRegion }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div *ngIf="filteredCampsites.length === 0" class="text-center py-20">
                <p class="text-slate-400 font-bold text-sm">No campsites match "{{ campsiteSearch }}"</p>
                <button (click)="campsiteSearch = ''" class="mt-3 text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Clear search</button>
              </div>
            </div><!-- /browse-view -->
          </div>

          <!-- PHASE 4: LOGISTICS (TRANSPORT) -->
          <div
            *ngIf="currentStep === 4"
            class="animate-in fade-in slide-in-from-right-8 duration-500 bg-white rounded-[40px] p-8 lg:p-16 border border-white shadow-xl"
          >
            <div class="mb-12">
              <span
                class="text-emerald-600 font-black text-xs uppercase tracking-widest mb-2 block"
                >Configuration 04</span
              >
              <h2 class="text-4xl font-black text-slate-900 mb-8">
                Fleet <span class="text-emerald-600">Selection</span>
              </h2>
            </div>

            <div class="space-y-4">
              <div
                *ngFor="let opt of transportOptions"
                (click)="tripModel.selectedTransportId = opt.id"
                class="group relative flex items-center justify-between p-6 rounded-[32px] border-2 transition-all cursor-pointer overflow-hidden"
                [ngClass]="
                  tripModel.selectedTransportId === opt.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                "
              >
                <div class="flex items-center gap-6 relative z-10">
                  <div class="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                    <img
                      [src]="
                        opt.imageUrl ||
                        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'
                      "
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4
                      class="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tighter"
                    >
                      {{ opt.mode }}
                    </h4>
                    <p class="text-xs text-slate-500 font-medium">
                      Provider: {{ opt.provider || "Hertz Global" }}
                    </p>
                  </div>
                </div>
                <div class="text-right relative z-10">
                  <p
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
                  >
                    Estimated Cost
                  </p>
                  <p class="text-2xl font-black text-emerald-600">
                    {{ opt.price }} TND
                  </p>
                </div>
                <!-- Selected Glow -->
                <div
                  *ngIf="tripModel.selectedTransportId === opt.id"
                  class="absolute inset-0 bg-emerald-500/5 animate-pulse"
                ></div>
              </div>
            </div>
          </div>

          <!-- PHASE 5: THE DOSSIER -->
          <div
            *ngIf="currentStep === 5"
            class="animate-in fade-in slide-in-from-bottom-8 duration-700 px-4 md:px-0"
          >
            <div
              class="bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl shadow-indigo-900/40 relative"
            >
              <!-- Dossier Header -->
              <div class="h-64 relative">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80"
                  class="w-full h-full object-cover opacity-60"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"
                ></div>
                <div class="absolute bottom-8 left-12">
                  <span
                    class="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest mb-3 inline-block"
                    >Manifest Finalized</span
                  >
                  <h2 class="text-5xl font-black text-white tracking-tighter">
                    {{ tripModel.title }}
                  </h2>
                </div>
              </div>

              <div class="p-12 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Main Stats -->
                <div class="lg:col-span-2 space-y-10">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div
                      class="p-6 rounded-3xl bg-white/5 border border-white/10"
                    >
                      <p
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                      >
                        Duration
                      </p>
                      <p class="text-xl font-bold text-white">
                        {{ calculateDuration() }} Days
                      </p>
                    </div>
                    <div
                      *ngIf="getSelectedTransport() as t"
                      class="p-6 rounded-3xl bg-white/5 border border-white/10"
                    >
                      <p
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                      >
                        Transport
                      </p>
                      <p class="text-xl font-bold text-white">{{ t.mode }}</p>
                    </div>
                    <div
                      class="p-6 rounded-3xl bg-white/5 border border-white/10 text-center"
                    >
                      <p
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                      >
                        Squad
                      </p>
                      <lucide-icon
                        [img]="UsersIcon"
                        [size]="16"
                        class="text-emerald-500 inline-block mb-1"
                      ></lucide-icon>
                      <p class="text-xl font-bold text-white">
                        {{ tripModel.participants }}
                      </p>
                    </div>
                    <div
                      class="p-6 rounded-3xl bg-white/5 border border-white/10"
                    >
                      <p
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                      >
                        Level
                      </p>
                      <p class="text-xl font-bold text-emerald-400 capitalize">
                        {{ tripModel.adventureLevel }}
                      </p>
                    </div>
                    <div
                      class="p-6 rounded-3xl bg-white/5 border border-white/10"
                    >
                      <p
                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                      >
                        Comfort
                      </p>
                      <p class="text-xl font-bold text-teal-400 capitalize">
                        {{ tripModel.comfortLevel }}
                      </p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h4
                      class="text-xs font-black text-slate-400 uppercase tracking-widest"
                    >
                      Selected Directives
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      <span
                        *ngFor="let act of tripModel.activities"
                        class="px-6 py-2 rounded-2xl bg-slate-800 text-white text-sm font-bold border border-slate-700"
                      >
                        {{ act }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex gap-6"
                  >
                    <div
                      class="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 animate-pulse"
                    >
                      <lucide-icon
                        [img]="CheckIcon"
                        [size]="20"
                        class="text-white"
                      ></lucide-icon>
                    </div>
                    <p
                      class="text-emerald-400 text-sm font-medium leading-relaxed italic"
                    >
                      "Our tactical AI will generate a terrain-specific
                      itinerary based on your
                      {{ tripModel.adventureLevel }} intensity levels. Prepare
                      for deployment."
                    </p>
                  </div>
                </div>

                <!-- Aside / Location -->
                <div class="space-y-8">
                  <div
                    class="rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 h-64 relative group"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&q=80"
                      class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div class="absolute inset-0 bg-slate-900/40"></div>
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <lucide-icon
                        [img]="MapPinIcon"
                        [size]="32"
                        class="text-emerald-500 mb-4"
                      ></lucide-icon>
                      <h5 class="text-white font-black text-lg leading-tight">
                        {{ selectedCampsiteName }}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interaction Console (Bottom Bar) -->
          <div
            class="mt-8 flex justify-between items-center bg-white/50 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-lg max-w-5xl mx-auto w-full"
          >
            <button
              (click)="prevStep()"
              [disabled]="currentStep === 1"
              class="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-0"
            >
              Return
            </button>

            <button
              *ngIf="currentStep < 5"
              (click)="nextStep()"
              [disabled]="!canContinue()"
              class="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
            >
              Proceed Phase
              <lucide-icon [img]="ArrowRightIcon" [size]="16"></lucide-icon>
            </button>

            <button
              *ngIf="currentStep === 5"
              (click)="generateTrip()"
              [disabled]="isGenerating"
              class="h-14 px-12 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-2xl shadow-emerald-900/40 transition-all active:scale-95 flex items-center gap-3 overflow-hidden relative"
            >
              <span *ngIf="!isGenerating" class="relative z-10"
                >Authorize Deployment</span
              >
              <span
                *ngIf="isGenerating"
                class="flex items-center gap-3 relative z-10 transition-all"
              >
                <div
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
                Processing...
              </span>
              <div
                *ngIf="isGenerating"
                class="absolute inset-0 bg-white/20 animate-pulse"
              ></div>
            </button>
          </div>
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        </div>
      </div>
    </div>
  `,
<<<<<<< HEAD
  styles: []
})
export class PlanTripComponent {
=======
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }

      /* AI thinking line: slides in from left */
      .ai-line {
        opacity: 0;
        transform: translateX(-10px);
        animation: aiLineIn 0.35s ease-out both;
      }

      /* AI checkmark: fades in */
      .ai-check {
        opacity: 0;
        animation: aiFadeIn 0.25s ease-out both;
      }

      /* Analysis complete banner */
      .ai-complete {
        opacity: 0;
        animation: aiFadeIn 0.5s ease-out both;
      }

      /* Score / confidence bars: scale from left */
      .ai-bar {
        transform-origin: left center;
        transform: scaleX(0);
        animation: aiBarGrow 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
      }

      @keyframes aiLineIn {
        from { opacity: 0; transform: translateX(-10px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      @keyframes aiFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      @keyframes aiBarGrow {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }

      /* Campsite cards: hidden until thinking sequence finishes */
      .ai-recommendations {
        opacity: 0;
        animation: aiFadeIn 0.8s ease-out both;
        animation-delay: 3.5s;
      }
    `,
  ],
})
export class PlanTripComponent implements OnInit {
  // Icons
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  DollarSignIcon = DollarSign;
  PlusIcon = Plus;
<<<<<<< HEAD

  tripName = '';
  destination = '';
  startDate = '';
  endDate = '';
  groupSize = 1;
  budget = 0;
  notes = '';

  destinationOptions: DropdownOption[] = [
    { label: 'Yosemite National Park', value: 'yosemite' },
    { label: 'Grand Canyon National Park', value: 'grand-canyon' },
    { label: 'Yellowstone National Park', value: 'yellowstone' },
    { label: 'Zion National Park', value: 'zion' },
    { label: 'Rocky Mountain National Park', value: 'rocky-mountain' },
    { label: 'Glacier National Park', value: 'glacier' },
  ];

  constructor(public router: Router, private tripService: TripService) { }

  handleSubmit(): void {
    const tripData = {
      name: this.tripName,
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      participants: this.groupSize,
      budget: this.budget,
      notes: this.notes
    };
    
    this.tripService.createTrip(tripData).subscribe({
      next: () => this.router.navigate(['/trips']),
      error: () => this.router.navigate(['/trips'])
    });
  }
=======
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
  isGenerating = false; // Alias for template
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
    selectedCampsiteIndex: 0,
    template: false,
    itineraryIds: [] as string[],
    imageUrl: "",
    userId: "",
  };

  aiViewMode: 'ai' | 'browse' = 'ai';
  campsiteSearch = '';

  allCampsites = [
    { id: 0, name: 'Ain Draham Forest Camp', region: 'Kroumirie Mountains, Jendouba', type: 'Forest', altitude: '900m', score: 94, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600', tags: ['Family Friendly', 'Water Access', 'Guided Hikes'], activity: 'Forest Hiking & Wildlife', whyRegion: 'Cork oak forests at peak — mild 16–22°C, rich birdlife, trails dry after seasonal rains.', aiPick: true },
    { id: 1, name: 'Djebel Chambi Base Camp', region: 'Chambi National Park, Kasserine', type: 'Mountain', altitude: '1,200m', score: 81, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600', tags: ['Summit Views', 'No Electricity'], activity: 'Summit Trekking', whyRegion: 'Snowmelt trails clearing — dramatic summit views, low UV vs peak summer, optimal trekking window.', aiPick: true },
    { id: 2, name: 'Tabarka Grove Camp', region: 'Northwest Coast, Tabarka', type: 'Coastal Forest', altitude: '40m', score: 73, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', tags: ['Electricity', 'Beach Access'], activity: 'Photography & Snorkeling', whyRegion: 'Mediterranean spring peak — coral reefs accessible, full forest canopy, minimal tourist crowds.', aiPick: true },
    { id: 3, name: 'Ichkeul Lake Camp', region: 'Ichkeul National Park, Bizerte', type: 'Lakeside', altitude: '25m', score: 77, image: 'https://images.unsplash.com/photo-1439792675105-701e6a4ab6f0?auto=format&fit=crop&q=80&w=600', tags: ['Family Friendly', 'Birdwatching', 'Water Access'], activity: 'Birdwatching & Nature Walks', whyRegion: 'UNESCO wetlands at spring maximum — migratory bird peak, water levels optimal, exceptional biodiversity.', aiPick: false },
    { id: 4, name: 'Cap Bon Coastal Retreat', region: 'Cap Bon Peninsula, Nabeul', type: 'Coastal', altitude: '30m', score: 68, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=600', tags: ['Electricity', 'Beach Access', 'Toilets'], activity: 'Photography & Swimming', whyRegion: 'Pre-summer coastal calm — warm sea (20°C), minimal crowds, golden light ideal for photography.', aiPick: false },
    { id: 5, name: 'Zaghouan Mountain Camp', region: 'Zaghouan Mountain, Zaghouan', type: 'Mountain', altitude: '750m', score: 71, image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=600', tags: ['Water Source', 'Roman Ruins Nearby'], activity: 'Hiking & Historical Sites', whyRegion: 'Spring wildflowers in bloom, Roman temple accessible, mountain streams flowing — peak landscape season.', aiPick: false },
    { id: 6, name: 'Chott el Djerid Desert Camp', region: 'Tozeur Desert, Tozeur', type: 'Desert', altitude: '20m', score: 62, image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=600', tags: ['Stargazing', 'Guided Tours'], activity: 'Stargazing & Desert Walks', whyRegion: 'Manageable desert temps (28–32°C), salt flats reflective at dawn, near-zero light pollution for stargazing.', aiPick: false },
    { id: 7, name: 'Kesra Highland Camp', region: 'Kesra Plateau, Siliana', type: 'Highland', altitude: '1,000m', score: 65, image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=600', tags: ['Ancient Ruins', 'Remote', 'Water Source'], activity: 'Cultural Trekking & Photography', whyRegion: 'Berber highland in spring bloom — ancient terraces uncrowded, wildflowers, cool mountain air.', aiPick: false },
  ];

  get filteredCampsites() {
    const q = this.campsiteSearch.toLowerCase();
    if (!q) return this.allCampsites;
    return this.allCampsites.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.activity.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  get tripMonth(): string {
    if (!this.tripModel.startDate) return 'your travel dates';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[new Date(this.tripModel.startDate).getMonth()] ?? 'your travel dates';
  }

  get selectedCampsiteName(): string {
    return this.allCampsites[this.tripModel.selectedCampsiteIndex]?.name ?? '';
  }
  editingTripId: string | null = null;

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
    private location: Location,
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
        this.editingTripId = tripId;
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
            this.tripModel.itineraryIds = data.itineraryIds || [];
            this.tripModel.imageUrl = data.imageUrl || "";
            
            const currentUserId = this.authService.currentUserValue?.id;
            const tripOwnerId = data.userId || data.createdBy || data.creatorId;

            // CRITICAL FIX: If user is customizing a template or someone else's trip
            if (data.template === true || (tripOwnerId && tripOwnerId !== currentUserId)) {
              console.log("[PlanTrip] Template customization detected - Forking trip to current user");
              this.editingTripId = null; // Create new instead of updating source
              this.tripModel.template = false; 
              this.tripModel.userId = currentUserId || "";
            } else {
              this.tripModel.template = data.template || false;
              this.tripModel.userId = tripOwnerId || "";
            }

            if (data.transportIds && data.transportIds.length)
              this.tripModel.selectedTransportId = data.transportIds[0];
          },
          error: (err) => console.error("Failed to load trip for editing", err),
        });
      }
    });
  }

  nextStep(): void {
    // Reload transports if they failed to load on init (now entering step 4)
    if (
      this.currentStep === 3 &&
      this.transportOptions.length === 0 &&
      !this.isLoadingTransports
    ) {
      this.loadTransportOptions();
    }
    if (this.currentStep < 5) {
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
          this.tripModel.startDate &&
          this.tripModel.endDate &&
          Number(this.tripModel.participants) >= 1 &&
          this.tripModel.endDate >= this.tripModel.startDate
        );
      case 2:
        return !!(this.tripModel.adventureLevel && this.tripModel.comfortLevel);
      case 3:
        return this.tripModel.selectedCampsiteIndex >= 0;
      case 4:
        return !!this.tripModel.selectedTransportId;
      default:
        return true;
    }
  }

  getTodayString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  canContinue(): boolean {
    return this.isStepValid();
  }

  generateTrip(): void {
    this.isGenerating = true;
    this.handleSubmit();
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
      3: "AI Recon",
      4: "Transport",
      5: "Review",
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
    return ((this.currentStep - 1) / 4) * 100;
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
        userId: userSnapshot.id, // Always enforce current user as the owner for new/customized trips
        comfortLevel: this.tripModel.comfortLevel,
        activities: this.tripModel.activities,
        transportIds: [this.tripModel.selectedTransportId],
        itineraryIds: this.tripModel.itineraryIds,
        template: false, // Ensure user-created trips are NEVER saved as templates
        imageUrl: this.editingTripId && this.tripModel.imageUrl ? this.tripModel.imageUrl : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80",
      };

      const save$ = this.editingTripId
        ? this.tripService.updateTrip(this.editingTripId, tripDto)
        : this.tripService.createTrip(
            tripDto,
            this.authService.currentUserValue?.id,
          );

      save$.subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.isGenerating = false;
          console.log("Saved trip:", response);
          this.router.navigate(["/trips", response.id]);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          this.isGenerating = false;
          console.error("Failed to save trip", err);
          alert(
            "Failed to save trip. " + (err.error?.message || err.message || ""),
          );
        },
      });
    } catch (e) {
      this.isSubmitting = false;
      this.isGenerating = false;
      alert("An error occurred formatting the trip data.");
      console.error(e);
    }
  }
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
