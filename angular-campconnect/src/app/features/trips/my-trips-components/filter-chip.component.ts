import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-filter-chip',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      type="button"
      (click)="onClick.emit()"
      class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
      [ngClass]="active ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
    >
      {{ label }}
    </button>
  `,
    styles: []
})
export class FilterChipComponent {
    @Input() label: string = '';
    @Input() active: boolean = false;
    @Output() onClick = new EventEmitter<void>();
}
