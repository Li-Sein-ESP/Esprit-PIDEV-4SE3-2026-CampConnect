import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TrustScoreComponent — displays a user's trust score as a badge/pill.
 * Stub implementation; extend with real scoring logic as needed.
 */
@Component({
    selector: 'app-trust-score',
    standalone: true,
    imports: [CommonModule],
    template: `
        <span *ngIf="score != null"
            [class]="getClass()"
            [title]="'Trust Score: ' + score">
            {{ score }}
        </span>
    `,
    styles: [`
        .trust-high  { display:inline-flex; align-items:center; padding:2px 8px; border-radius:9999px; font-size:0.75rem; font-weight:600; background:#d1fae5; color:#065f46; }
        .trust-mid   { display:inline-flex; align-items:center; padding:2px 8px; border-radius:9999px; font-size:0.75rem; font-weight:600; background:#fef3c7; color:#92400e; }
        .trust-new   { display:inline-flex; align-items:center; padding:2px 8px; border-radius:9999px; font-size:0.75rem; font-weight:600; background:#f3f4f6; color:#6b7280; }
    `]
})
export class TrustScoreComponent {
    @Input() score: number | null = null;

    getClass(): string {
        if (this.score == null) return 'trust-new';
        if (this.score >= 80) return 'trust-high';
        if (this.score >= 50) return 'trust-mid';
        return 'trust-new';
    }
}
