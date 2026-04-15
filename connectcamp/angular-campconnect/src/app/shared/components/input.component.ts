import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    template: `
    <div class="w-full">
      <label
        *ngIf="label"
        [for]="inputId"
        class="block mb-2 text-sm font-medium text-[var(--color-text-primary)]"
      >
        {{ label }}
      </label>
      <div class="relative">
        <div
          *ngIf="leftIcon"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        >
          <ng-content select="[leftIcon]"></ng-content>
        </div>
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [class]="getInputClasses()"
        />
        <div
          *ngIf="rightIcon"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        >
          <ng-content select="[rightIcon]"></ng-content>
        </div>
      </div>
      <p
        *ngIf="error"
        class="mt-2 text-sm text-[var(--color-error-500)] flex items-center gap-1"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </p>
      <p
        *ngIf="helperText && !error"
        class="mt-2 text-sm text-[var(--color-text-tertiary)]"
      >
        {{ helperText }}
      </p>
    </div>
  `,
    styles: []
})
export class InputComponent implements ControlValueAccessor {
    @Input() label?: string;
    @Input() error?: string;
    @Input() helperText?: string;
    @Input() leftIcon: boolean = false;
    @Input() rightIcon: boolean = false;
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() customClass: string = '';
    @Input() id?: string;

    value: string = '';
    inputId: string = '';

    private onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    ngOnInit() {
        this.inputId = this.id || this.label?.toLowerCase().replace(/\s+/g, '-') || `input-${Math.random().toString(36).substr(2, 9)}`;
    }

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
        this.onChange(this.value);
    }

    getInputClasses(): string {
        const baseClasses = `
      w-full px-4 py-2.5 rounded-lg
      min-h-[44px]
      bg-white border-2
      text-[var(--color-text-primary)]
      placeholder:text-[var(--color-text-tertiary)]
      focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)]
      disabled:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed
      transition-all duration-200
    `;

        const borderClass = this.error ? 'border-[var(--color-error-500)]' : 'border-[var(--color-border-light)]';
        const leftPadding = this.leftIcon ? 'pl-10' : '';
        const rightPadding = this.rightIcon ? 'pr-10' : '';

        return `${baseClasses} ${borderClass} ${leftPadding} ${rightPadding} ${this.customClass}`;
    }
}
