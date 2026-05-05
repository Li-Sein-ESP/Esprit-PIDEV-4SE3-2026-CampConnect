import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 text-sm text-slate-700">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <ng-content></ng-content>
      </div>
      <div>
        <div class="text-xs font-medium uppercase tracking-wide text-slate-400">
          {{ label }}
        </div>
        <div class="font-medium text-slate-800">{{ value }}</div>
      </div>
    </div>
  `
})
export class StatItemComponent {
  @Input() label!: string;
  @Input() value!: string;
}
