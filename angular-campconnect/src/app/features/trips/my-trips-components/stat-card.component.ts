import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-white bg-white/60 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:bg-white active:scale-95 cursor-default">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{{ label }}</div>
      <div class="text-3xl font-black tracking-tight" [ngClass]="tone === 'accent' ? 'text-amber-600' : 'text-emerald-900'">
        {{ value }}
      </div>
    </div>
  `,
  styles: [`
      :host { display: block; }
    `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() tone: 'default' | 'accent' = 'default';
}
