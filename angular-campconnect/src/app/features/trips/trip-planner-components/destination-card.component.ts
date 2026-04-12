import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group h-full flex flex-col">
      <div class="relative h-44 shrink-0 z-0">
        <img [src]="image" [alt]="title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0" />
        <div class="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold z-10 shadow-sm">
          <ng-content select="[tagIcon]"></ng-content> {{ tagLabel }}
        </div>
      </div>
      <div class="p-6 flex flex-col flex-grow relative bg-white z-10">
        <h3 class="text-2xl font-bold text-[#2D4A3E] mb-1">{{ title }}</h3>
        <div class="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon> {{ location }}
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-8 flex-grow">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Season</p>
            <p class="text-sm font-medium text-[#2D3A3A]">{{ season }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Price/Night</p>
            <p class="text-sm font-medium text-[#2D3A3A]">{{ price }}</p>
          </div>
        </div>

        <div>
          <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="getDiffColors(difficulty)">
            {{ difficulty }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DestinationCardComponent {
  MapPinIcon = MapPin;

  @Input() image: string = '';
  @Input() title: string = '';
  @Input() location: string = '';
  @Input() season: string = '';
  @Input() price: string = '';
  @Input() difficulty: 'Easy' | 'Moderate' | 'Advanced' = 'Easy';
  @Input() tagLabel: string = '';

  getDiffColors(difficulty: string): string {
    const diffMap: Record<string, string> = {
      'Easy': 'bg-emerald-50 text-emerald-700',
      'Moderate': 'bg-orange-50 text-orange-700',
      'Advanced': 'bg-rose-50 text-rose-700'
    };
    return diffMap[difficulty] || diffMap['Easy'];
  }
}
