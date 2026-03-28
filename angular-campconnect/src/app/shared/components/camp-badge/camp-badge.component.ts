import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-camp-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="camp-badge" [title]="title + (description ? ': ' + description : '')" [class.locked]="!unlocked" [class.small]="size === 'small'" [class.large]="size === 'large'">
            <div class="icon-container">
                <i *ngIf="icon" [class]="'lucide-' + icon"></i>
                <span *ngIf="!icon">🏆</span>
            </div>
            <div class="badge-tooltip" *ngIf="description">
                <strong>{{ title }}</strong>
                <p>{{ description }}</p>
            </div>
        </div>
    `,
    styles: [`
        .camp-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            cursor: help;
            border: 2px solid #fff;
        }
        .camp-badge.small { width: 24px; height: 24px; font-size: 12px; }
        .camp-badge.large { width: 48px; height: 48px; font-size: 24px; }
        .camp-badge:not(.small):not(.large) { width: 32px; height: 32px; font-size: 16px; }
        
        .camp-badge.locked {
            background: #e5e7eb;
            color: #9ca3af;
            filter: grayscale(100%);
        }
        
        .badge-tooltip {
            display: none;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            width: max-content;
            max-width: 200px;
            z-index: 50;
            margin-bottom: 8px;
            text-align: center;
            pointer-events: none;
        }
        
        .camp-badge:hover .badge-tooltip {
            display: block;
        }
    `]
})
export class CampBadgeComponent {
    @Input() title: string = '';
    @Input() description?: string = '';
    @Input() icon?: string = '';
    @Input() unlocked: boolean = true;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
