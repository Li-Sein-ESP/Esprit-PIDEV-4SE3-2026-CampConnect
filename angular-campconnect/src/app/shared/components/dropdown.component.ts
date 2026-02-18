import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

export interface DropdownOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-dropdown',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true
        }
    ],
    template: `
    <div class="w-full">
      <label
        *ngIf="label"
        class="block mb-2 font-medium text-[var(--color-text-primary)]"
      >
        {{ label }}
      </label>
      <div class="relative">
        <button
          type="button"
          (click)="toggleDropdown()"
          [disabled]="disabled"
          [class]="getButtonClasses()"
        >
          <span [class]="selectedOption ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'">
            {{ selectedOption ? selectedOption.label : placeholder }}
          </span>
          <lucide-icon
            [img]="ChevronDownIcon"
            [size]="20"
            [class]="'text-[var(--color-text-tertiary)] transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')"
          ></lucide-icon>
        </button>

        <div
          *ngIf="isOpen"
          class="absolute z-50 w-full mt-2 bg-white border border-[var(--color-border-light)] rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          <button
            *ngFor="let option of options"
            type="button"
            (click)="selectOption(option.value)"
            [class]="getOptionClasses(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <p
        *ngIf="error"
        class="mt-1.5 text-sm text-[var(--color-error-500)]"
      >
        {{ error }}
      </p>
    </div>
  `,
    styles: []
})
export class DropdownComponent implements ControlValueAccessor {
    @Input() label?: string;
    @Input() options: DropdownOption[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() error?: string;
    @Input() disabled: boolean = false;
    @Output() valueChange = new EventEmitter<string>();

    ChevronDownIcon = ChevronDown;
    isOpen: boolean = false;
    value: string = '';
    selectedOption?: DropdownOption;

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    constructor(private elementRef: ElementRef) { }

    @HostListener('document:mousedown', ['$event'])
    onClickOutside(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    ngOnChanges(): void {
        this.updateSelectedOption();
    }

    writeValue(value: string): void {
        this.value = value || '';
        this.updateSelectedOption();
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

    toggleDropdown(): void {
        if (!this.disabled) {
            this.isOpen = !this.isOpen;
        }
    }

    selectOption(optionValue: string): void {
        this.value = optionValue;
        this.updateSelectedOption();
        this.onChange(this.value);
        this.valueChange.emit(this.value);
        this.isOpen = false;
        this.onTouched();
    }

    private updateSelectedOption(): void {
        this.selectedOption = this.options.find(opt => opt.value === this.value);
    }

    getButtonClasses(): string {
        const baseClasses = `
      w-full px-4 py-2.5 rounded-lg
      bg-white border-2
      text-left flex items-center justify-between
      focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)]
      disabled:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed
      transition-all duration-200
    `;
        const borderClass = this.error ? 'border-[var(--color-error-500)]' : 'border-[var(--color-border-light)]';
        return `${baseClasses} ${borderClass}`;
    }

    getOptionClasses(optionValue: string): string {
        const baseClasses = `
      w-full px-4 py-2.5 text-left
      hover:bg-[var(--color-primary-50)]
      transition-colors duration-150
    `;
        const selectedClass = optionValue === this.value
            ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
            : 'text-[var(--color-text-primary)]';
        return `${baseClasses} ${selectedClass}`;
    }
}
