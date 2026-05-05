import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Calendar, Users, Clock, ChevronRight, ArrowRight, MoreHorizontal, Share2, Trash2, Map } from 'lucide-angular';

interface Trip {
  id: string | number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize?: number;
  participants?: number;
  status: "planning" | "upcoming" | "active" | "completed" | "cancelled";
  imageUrl?: string;
  template?: boolean;
}

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <article class="group relative bg-white border border-slate-200 rounded-[40px] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(15,61,46,0.15)] hover:-translate-y-2" *ngIf="trip">
      <div class="flex flex-col md:flex-row min-h-[320px]">
        
        <!-- Image Section -->
        <div class="relative h-72 md:h-auto md:w-[40%] overflow-hidden cursor-pointer" [routerLink]="['/trips', trip.id]">
          <img [src]="trip.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'" 
               class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
               [alt]="trip.name">
          
          <!-- Glass Overlays -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f3d2e]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          <!-- Floating Status Badge -->
          <div class="absolute top-6 left-6">
            <div [class]="'px-4 py-2 rounded-2xl backdrop-blur-xl border border-white/30 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl ' + getStatusColor()">
              {{ trip.status }}
            </div>
          </div>

          <!-- Bottom Left Label -->
          <div class="absolute bottom-8 left-8 text-white">
            <div class="flex items-center gap-2 mb-1">
                <lucide-icon [img]="MapPinIcon" size="14" class="text-emerald-400"></lucide-icon>
                <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{{ trip.destination }}</span>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="flex-1 p-10 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
          <div>
            <div class="flex justify-between items-start mb-6">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">#LOG-0{{ trip.id || 'X' }}</span>
                    <span *ngIf="trip.template" class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-black uppercase tracking-widest">Official Template</span>
                </div>
                <h3 class="text-4xl font-black text-[#0f3d2e] tracking-tight leading-[1.1] group-hover:text-emerald-700 transition-colors">
                  {{ trip.name }}
                </h3>
              </div>
              <div class="flex gap-2">
                <button class="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100">
                    <lucide-icon [img]="Share2Icon" size="18"></lucide-icon>
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-10">
              <div class="space-y-1">
                <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Timeline</div>
                <div class="flex items-center gap-2 text-sm font-black text-[#0f3d2e]">
                  <lucide-icon [img]="CalendarIcon" size="14" class="text-emerald-500"></lucide-icon>
                  {{ (trip.startDate | date:'MMM d') || 'TBD' }} — {{ (trip.endDate | date:'d, y') || 'TBD' }}
                </div>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Squad</div>
                <div class="flex items-center gap-3">
                    <div class="flex -space-x-3">
                        <div *ngFor="let i of [1,2,3]" class="h-8 w-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + i + trip.id" alt="avatar">
                        </div>
                    </div>
                    <span class="text-sm font-black text-[#0f3d2e]">+{{ trip.participants || trip.groupSize || 1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <lucide-icon [img]="ClockIcon" size="14" class="text-emerald-500"></lucide-icon>
                    Last Modified: 2h ago
                </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button [routerLink]="['/trips', trip.id]"
                      class="flex-1 sm:flex-none inline-flex items-center justify-center gap-4 px-10 py-5 bg-[#0f3d2e] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-950/20 group/btn active:scale-95">
                <span>{{ trip.template ? 'Use Template' : (trip.status === 'planning' ? 'Resume Mission' : 'Open Logs') }}</span>
                <lucide-icon [img]="ArrowRightIcon" size="16" class="group-hover/btn:translate-x-2 transition-transform duration-500"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Creative Decor -->
      <div class="absolute -right-12 -bottom-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
    </article>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TripCardComponent {
  @Input() trip!: Trip;
  
  MapPinIcon = MapPin;
  UsersIcon = Users;
  CalendarIcon = Calendar;
  ArrowRightIcon = ArrowRight;
  MoreHorizontalIcon = MoreHorizontal;
  Share2Icon = Share2;
  Trash2Icon = Trash2;
  ClockIcon = Clock;
  MapIcon = Map;

  getStatusColor() {
    switch (this.trip?.status) {
      case 'completed': return 'bg-emerald-600/80';
      case 'active': return 'bg-sky-600/80';
      case 'planning': return 'bg-amber-600/80';
      default: return 'bg-slate-600/80';
    }
  }
}
