import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span [class]="getBadgeClasses()">
      <span
        *ngIf="dot"
        [class]="'w-1.5 h-1.5 rounded-full ' + getDotColor()"
      ></span>
      <ng-content></ng-content>
    </span>
  `,
    styles: []
})
export class BadgeComponent {
    @Input() variant: BadgeVariant = 'default';
    @Input() size: BadgeSize = 'md';
    @Input() dot: boolean = false;
    @Input() customClass: string = '';

    private baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

    private variants = {
        default: 'bg-[var(--color-neutral-100)] text-[var(--color-text-primary)]',
        primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
        success: 'bg-[var(--color-success-100)] text-[var(--color-success-700)]',
        warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]',
        error: 'bg-[var(--color-error-100)] text-[var(--color-error-700)]',
        info: 'bg-[var(--color-info-100)] text-[var(--color-info-600)]',
        outline: 'bg-transparent border border-[var(--color-border-medium)] text-[var(--color-text-secondary)]',
    };

    private sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    private dotColors = {
        default: 'bg-[var(--color-neutral-500)]',
        primary: 'bg-[var(--color-primary-600)]',
        success: 'bg-[var(--color-success-600)]',
        warning: 'bg-[var(--color-warning-600)]',
        error: 'bg-[var(--color-error-600)]',
        info: 'bg-[var(--color-info-600)]',
        outline: 'bg-[var(--color-neutral-500)]',
    };

    getBadgeClasses(): string {
        return `${this.baseStyles} ${this.variants[this.variant]} ${this.sizes[this.size]} ${this.customClass}`;
    }

    getDotColor(): string {
        return this.dotColors[this.variant];
    }
}
