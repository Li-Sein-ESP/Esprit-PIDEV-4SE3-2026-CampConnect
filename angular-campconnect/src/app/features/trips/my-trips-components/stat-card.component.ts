import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUpIcon, ActivityIcon, GlobeIcon, AwardIcon, CompassIcon, HistoryIcon, MapIcon } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm group hover:border-emerald-200 transition-colors">
      <div class="flex items-center justify-between mb-6">
        <div [class]="'p-3 rounded-xl group-hover:scale-110 transition-transform ' + getIconBg()">
          <lucide-icon [img]="getIcon()" size="24" [class]="getIconColor()"></lucide-icon>
        </div>
        <span [class]="'text-[10px] font-black uppercase tracking-widest ' + getIconColor()">{{ label }}</span>
      </div>
      <div class="text-4xl font-black text-[#2D4A3E]">{{ value }}</div>
      <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{{ getSubLabel() }}</div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = 0;
  @Input() tone: 'default' | 'accent' = 'default';

  getIcon() {
    const l = this.label.toLowerCase();
    if (l.includes('planned') || l.includes('active')) return CompassIcon;
    if (l.includes('completed') || l.includes('expeditions')) return HistoryIcon;
    return MapIcon;
  }

  getIconBg() {
    const l = this.label.toLowerCase();
    if (l.includes('planned') || l.includes('active')) return 'bg-emerald-50';
    if (l.includes('completed') || l.includes('expeditions')) return 'bg-amber-50';
    return 'bg-sky-50';
  }

  getIconColor() {
    const l = this.label.toLowerCase();
    if (l.includes('planned') || l.includes('active')) return 'text-emerald-700';
    if (l.includes('completed') || l.includes('expeditions')) return 'text-amber-700';
    return 'text-sky-700';
  }

  getSubLabel() {
    const l = this.label.toLowerCase();
    if (l.includes('planned')) return 'Trips in Progress';
    if (l.includes('completed')) return 'Successful Journeys';
    return 'Regions Visited';
  }
}
