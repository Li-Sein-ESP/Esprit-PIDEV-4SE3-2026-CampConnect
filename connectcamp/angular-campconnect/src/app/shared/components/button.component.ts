import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'destructive' | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getButtonClasses()"
      [disabled]="disabled"
      [type]="type"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() fullWidth: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() customClass: string = '';

  private baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px]
  `;

  private variants = {
    primary: `
      bg-[var(--color-primary-600)] text-white
      hover:bg-[var(--color-primary-700)]
      focus-visible:ring-[var(--color-primary-500)]
      active:bg-[var(--color-primary-800)]
    `,
    default: `
      bg-[var(--color-primary-600)] text-white
      hover:bg-[var(--color-primary-700)]
      focus-visible:ring-[var(--color-primary-500)]
      active:bg-[var(--color-primary-800)]
    `,
    secondary: `
      bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] border border-[var(--color-border-medium)]
      hover:bg-[var(--color-neutral-200)]
      focus-visible:ring-[var(--color-neutral-400)]
      active:bg-[var(--color-neutral-300)]
    `,
    danger: `
      bg-[var(--color-error-500)] text-white
      hover:bg-[var(--color-error-600)]
      focus-visible:ring-[var(--color-error-500)]
      active:bg-[var(--color-error-700)]
    `,
    destructive: `
      bg-[var(--color-error-500)] text-white
      hover:bg-[var(--color-error-600)]
      focus-visible:ring-[var(--color-error-500)]
      active:bg-[var(--color-error-700)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-primary)]
      hover:bg-[var(--color-neutral-100)]
      focus-visible:ring-[var(--color-neutral-400)]
    `,
    outline: `
      bg-transparent border-2 border-[var(--color-primary-600)] text-[var(--color-primary-600)]
      hover:bg-[var(--color-primary-50)]
      focus-visible:ring-[var(--color-primary-500)]
      active:bg-[var(--color-primary-100)]
    `,
  };

  private sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-2.5 text-base min-h-[44px]',
    lg: 'px-8 py-3 text-lg min-h-[48px]',
  };

  getButtonClasses(): string {
    const widthClass = this.fullWidth ? 'w-full' : '';
    return `${this.baseStyles} ${this.variants[this.variant]} ${this.sizes[this.size]} ${widthClass} ${this.customClass}`;
  }
}
