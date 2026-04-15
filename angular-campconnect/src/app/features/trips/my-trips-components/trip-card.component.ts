import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Calendar, Users, Clock, ChevronRight } from 'lucide-angular';

export interface TripData {
  id: string | number;
  title: string;
  location: string;
  governorate: string;
  status: "planned" | "draft" | "completed";
  imageUrl: string;
  startDate: string;
  endDate: string;
  durationLabel: string;
  groupSize: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  difficultyTone: "green" | "amber" | "red";
  totalCost: string;
  timelineLabel: string;
}

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <article class="flex flex-col rounded-3xl border border-white bg-white/70 backdrop-blur-md shadow-sm transition-all hover:shadow-lg hover:border-emerald-100 md:flex-row group overflow-hidden" *ngIf="trip">
      <!-- Image Section -->
      <div class="relative w-full overflow-hidden md:w-72 cursor-pointer" [routerLink]="['/trips', trip.id]">
        <img [src]="trip.imageUrl" [alt]="trip.title" class="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110 md:h-full" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
        <span
          class="absolute left-4 top-4 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
          [ngClass]="statusClasses"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Content Section -->
      <div class="flex flex-1 flex-col justify-between p-8">
        <div>
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div [routerLink]="['/trips', trip.id]" class="cursor-pointer space-y-2">
              <h2 class="text-2xl font-extrabold text-emerald-950 leading-tight group-hover:text-emerald-800 transition-colors">{{ trip.title }}</h2>
              <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <lucide-icon [img]="MapPinIcon" size="14" class="text-emerald-600"></lucide-icon>
                <span>{{ trip.location }}, {{ trip.governorate }}</span>
              </div>
            </div>

            <div class="text-left md:text-right">
              <div class="text-2xl font-black text-emerald-900 tracking-tight">{{ trip.totalCost }}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Budget</div>
            </div>
          </div>

          <!-- Trip Metadata Grid -->
          <div class="mt-8 grid gap-6 grid-cols-2 md:grid-cols-3">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-xl bg-slate-50 text-slate-400">
                <lucide-icon [img]="CalendarIcon" size="18"></lucide-icon>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dates</div>
                <div class="text-xs font-bold text-slate-800">{{ trip.startDate }} - {{ trip.endDate }}</div>
                <div class="text-[10px] font-bold text-emerald-600">{{ trip.durationLabel }}</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-xl bg-slate-50 text-slate-400">
                <lucide-icon [img]="UsersIcon" size="18"></lucide-icon>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Group</div>
                <div class="text-xs font-bold text-slate-800">{{ trip.groupSize }} Explorers</div>
                <div class="text-[10px] font-bold text-slate-500">Shared Activity</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-xl bg-slate-50 text-slate-400">
                <lucide-icon [img]="ClockIcon" size="18"></lucide-icon>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Terrain</div>
                <div class="text-xs font-bold" [ngClass]="difficultyClasses">{{ trip.difficulty }}</div>
                <div class="text-[10px] font-bold text-slate-500">Level</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 md:flex-row md:items-center">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
             <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span class="text-[11px] font-bold text-emerald-800 tracking-wide">{{ trip.timelineLabel }}</span>
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <button *ngIf="isDraft" [routerLink]="['/trips', trip.id]" 
                class="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 shadow-md shadow-emerald-900/10 transition-all active:scale-95">
              <span>Continue Planning</span>
              <lucide-icon [img]="ChevronRightIcon" size="16"></lucide-icon>
            </button>
            <button *ngIf="!isDraft" [routerLink]="['/trips', trip.id]" 
                class="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
              <span>View Itinerary</span>
              <lucide-icon [img]="ChevronRightIcon" size="16" class="text-slate-400"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TripCardComponent {
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly UsersIcon = Users;
  readonly ClockIcon = Clock;
  readonly ChevronRightIcon = ChevronRight;

  @Input() trip!: TripData;

  get isDraft(): boolean {
    return this.trip?.status === 'draft';
  }

  get statusLabel(): string {
    if (!this.trip) return '';
    if (this.trip.status === 'planned') return 'Planned';
    if (this.trip.status === 'draft') return 'Draft';
    return 'Completed';
  }

  get statusClasses(): string {
    if (!this.trip) return '';
    switch (this.trip.status) {
      case 'planned': return 'bg-emerald-100 text-emerald-900';
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'completed': return 'bg-emerald-50 text-emerald-800';
      default: return '';
    }
  }

  get difficultyClasses(): string {
    if (!this.trip) return '';
    switch (this.trip.difficultyTone) {
      case 'green': return 'text-emerald-700';
      case 'amber': return 'text-amber-700';
      case 'red': return 'text-red-600';
      default: return '';
    }
  }
}
