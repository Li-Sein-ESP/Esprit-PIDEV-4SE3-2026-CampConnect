import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start h-full">
      <div class="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center" [ngClass]="iconBg">
        <ng-content></ng-content>
      </div>
      <div class="flex flex-col h-full">
        <h3 class="text-xl font-bold text-[#2D4A3E] mb-2">{{ title }}</h3>
        <p class="text-gray-500 text-sm mb-6 leading-relaxed flex-grow">
          {{ description }}
        </p>
        <div>
            <button (click)="onAction.emit()" class="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            {{ btnText }} <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
            </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResourceCardComponent {
  ChevronRightIcon = ChevronRight;

  @Input() iconBg: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() btnText: string = '';

  @Output() onAction = new EventEmitter<void>();
}
