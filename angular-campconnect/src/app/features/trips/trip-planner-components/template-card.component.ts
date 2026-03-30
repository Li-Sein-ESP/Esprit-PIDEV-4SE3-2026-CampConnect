import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, MapPin, Compass, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group h-full flex flex-col">
      <div class="absolute top-8 right-8 text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
        {{ difficulty }}
      </div>
      <div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-8 text-gray-600">
        <ng-content></ng-content>
      </div>
      <h3 class="text-xl font-bold text-[#2D4A3E] mb-4 leading-tight">{{ title }}</h3>
      
      <div class="space-y-2 mb-12 flex-grow">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <lucide-icon [img]="CalendarIcon" class="w-4 h-4"></lucide-icon> <span>{{ days }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon> <span>{{ location }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <lucide-icon [img]="CompassIcon" class="w-4 h-4"></lucide-icon> <span>{{ terrain }}</span>
        </div>
      </div>

      <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-400">Est. Cost</p>
          <p class="font-bold text-[#2D4A3E]">{{ cost }}</p>
        </div>
        <button class="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
          Use Template <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class TemplateCardComponent {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  CompassIcon = Compass;
  ChevronRightIcon = ChevronRight;

  @Input() difficulty: string = '';
  @Input() title: string = '';
  @Input() days: string = '';
  @Input() location: string = '';
  @Input() terrain: string = '';
  @Input() cost: string = '';
}
