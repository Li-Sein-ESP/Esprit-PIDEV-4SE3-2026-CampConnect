import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-wave-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => WaveInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="wave-group" [class.has-error]="hasError">
      <input 
        [type]="type" 
        [placeholder]="placeholder || label"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="input wave-input">
      <span class="bar"></span>
      <label class="label">
        <span class="label-char" *ngFor="let char of characters; let i = index" [style.--index]="i">{{ char === ' ' ? '&nbsp;' : char }}</span>
      </label>
      <div class="icon-container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
    styleUrls: ['./wave-input.component.scss']
})
export class WaveInputComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() hasError: boolean = false;

    value: string = '';

    get characters(): string[] {
        return this.label.split('');
    }

    onChange: any = () => { };
    onTouch: any = () => { };

    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this.value = val;
        this.onChange(val);
    }

    onBlur() {
        this.onTouch();
    }

    writeValue(value: any): void {
        this.value = value || '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
}
