import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onClick.emit()"
      [class]="'whitespace-nowrap rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ' + 
               (active ? 
                'bg-[#2D4A3E] text-white shadow-lg shadow-emerald-900/10' : 
                'bg-white text-slate-400 hover:text-[#2D4A3E] border border-slate-200 hover:border-[#2D4A3E]')">
      {{ label }}
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
  `]
})
export class FilterChipComponent {
  @Input() label: string = '';
  @Input() active: boolean = false;
  @Output() onClick = new EventEmitter<void>();
}
