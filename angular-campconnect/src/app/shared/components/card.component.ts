import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getCardClasses()" (click)="handleClick()">
      <ng-content></ng-content>
    </div>
  `,
    styles: []
})
export class CardComponent {
    @Input() variant: 'default' | 'elevated' | 'bordered' | 'interactive' = 'default';
    @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
    @Input() customClass: string = '';
    @Input() onClick?: () => void;

    private baseStyles = 'bg-white rounded-lg transition-all duration-200';

    private variants = {
        default: 'border border-[var(--color-border-light)] shadow-sm',
        elevated: 'shadow-md hover:shadow-lg',
        bordered: 'border-2 border-[var(--color-border-medium)]',
        interactive: `
      border border-[var(--color-border-light)] shadow-sm
      hover:border-[var(--color-primary-300)] hover:shadow-md 
      cursor-pointer
      active:scale-[0.99]
    `,
    };

    private paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    getCardClasses(): string {
        return `${this.baseStyles} ${this.variants[this.variant]} ${this.paddings[this.padding]} ${this.customClass}`;
    }

    handleClick(): void {
        if (this.onClick) {
            this.onClick();
        }
    }
}

@Component({
    selector: 'app-card-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="'mb-4 ' + customClass">
      <ng-content></ng-content>
    </div>
  `,
    styles: []
})
export class CardHeaderComponent {
    @Input() customClass: string = '';
}

@Component({
    selector: 'app-card-title',
    standalone: true,
    imports: [CommonModule],
    template: `
    <h3 [class]="'text-xl font-semibold text-[var(--color-text-primary)] ' + customClass">
      <ng-content></ng-content>
    </h3>
  `,
    styles: []
})
export class CardTitleComponent {
    @Input() customClass: string = '';
}

@Component({
    selector: 'app-card-description',
    standalone: true,
    imports: [CommonModule],
    template: `
    <p [class]="'text-sm text-[var(--color-text-secondary)] mt-1 ' + customClass">
      <ng-content></ng-content>
    </p>
  `,
    styles: []
})
export class CardDescriptionComponent {
    @Input() customClass: string = '';
}

@Component({
    selector: 'app-card-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="customClass">
      <ng-content></ng-content>
    </div>
  `,
    styles: []
})
export class CardContentComponent {
    @Input() customClass: string = '';
}

@Component({
    selector: 'app-card-footer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="'mt-4 pt-4 border-t border-[var(--color-border-light)] ' + customClass">
      <ng-content></ng-content>
    </div>
  `,
    styles: []
})
export class CardFooterComponent {
    @Input() customClass: string = '';
}
