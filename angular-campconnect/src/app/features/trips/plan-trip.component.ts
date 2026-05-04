import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";

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
            *ngFor="let step of [1, 2, 3, 4]; let last = last"
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

                <div class="group">
                  <label
                    class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1"
                    >Arrival Zone</label
                  >
                  <div class="relative h-16">
                    <lucide-icon
                      [img]="MapPinIcon"
                      [size]="18"
                      class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
                    ></lucide-icon>
                    <input
                      type="text"
                      [(ngModel)]="tripModel.destinationName"
                      placeholder="Search campsites or regions..."
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

          <!-- PHASE 3: LOGISTICS (TRANSPORT) -->
          <div
            *ngIf="currentStep === 3"
            class="animate-in fade-in slide-in-from-right-8 duration-500 bg-white rounded-[40px] p-8 lg:p-16 border border-white shadow-xl"
          >
            <div class="mb-12">
              <span
                class="text-emerald-600 font-black text-xs uppercase tracking-widest mb-2 block"
                >Configuration 03</span
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

          <!-- PHASE 4: THE DOSSIER -->
          <div
            *ngIf="currentStep === 4"
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
                        {{ tripModel.destinationName }}
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
              *ngIf="currentStep < 4"
              (click)="nextStep()"
              [disabled]="!canContinue()"
              class="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
            >
              Proceed Phase
              <lucide-icon [img]="ArrowRightIcon" [size]="16"></lucide-icon>
            </button>

            <button
              *ngIf="currentStep === 4"
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
    template: false,
    itineraryIds: [] as string[],
    imageUrl: "",
    userId: "",
  };
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
}
