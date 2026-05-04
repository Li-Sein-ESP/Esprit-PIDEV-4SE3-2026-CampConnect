import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GearRecommendationWizardComponent } from '../gear-recommendation-wizard/gear-recommendation-wizard.component';

@Component({
  selector: 'app-gear-recommendation-trigger',
  standalone: true,
  imports: [CommonModule, GearRecommendationWizardComponent],
  template: `
    <button class="trigger-btn" (click)="wizardOpen = true">
      <svg class="compass-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <polygon points="12,2 14,10 12,12 10,10" fill="currentColor"/>
        <polygon points="12,22 14,14 12,12 10,14" fill="currentColor" opacity="0.5"/>
      </svg>
      <span class="trigger-label">Plan my trip</span>
    </button>
    <app-gear-recommendation-wizard
      *ngIf="wizardOpen"
      (closed)="wizardOpen = false">
    </app-gear-recommendation-wizard>
  `,
  styles: [`
    .trigger-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #059669;
      color: #fff;
      border: none;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(5, 150, 105, 0.4);
      transition: all 0.2s;
    }

    .trigger-btn:hover {
      background: #047857;
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(5, 150, 105, 0.5);
    }

    .compass-svg {
      width: 20px;
      height: 20px;
    }

    .trigger-label {
      white-space: nowrap;
    }
  `]
})
export class GearRecommendationTriggerComponent {
  wizardOpen = false;
}
