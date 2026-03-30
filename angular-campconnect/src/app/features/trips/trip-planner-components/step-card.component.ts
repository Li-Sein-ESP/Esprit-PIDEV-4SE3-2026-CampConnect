import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-step-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div [routerLink]="link" 
         class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group h-full">
      <div class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
        <ng-content></ng-content>
      </div>
      <h3 class="text-2xl font-bold text-[#2D4A3E] mb-2 group-hover:text-emerald-700 transition-colors">{{ title }}</h3>
      <p class="text-gray-500 text-sm leading-relaxed">{{ description }}</p>
    </div>
  `,
    styles: []
})
export class StepCardComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() link: any[] | string = [];
}
