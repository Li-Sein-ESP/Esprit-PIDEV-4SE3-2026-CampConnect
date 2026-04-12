import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-angular';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div [class]="getAlertClasses()">
      <div class="flex-shrink-0 mt-0.5">
        <ng-container [ngSwitch]="variant">
          <lucide-icon *ngSwitchCase="'info'" [img]="InfoIcon" [size]="20" class="text-blue-600"></lucide-icon>
          <lucide-icon *ngSwitchCase="'success'" [img]="CheckCircleIcon" [size]="20" class="text-green-600"></lucide-icon>
          <lucide-icon *ngSwitchCase="'warning'" [img]="AlertCircleIcon" [size]="20" class="text-amber-600"></lucide-icon>
          <lucide-icon *ngSwitchCase="'error'" [img]="XCircleIcon" [size]="20" class="text-red-600"></lucide-icon>
        </ng-container>
      </div>
      <div class="flex-1">
        <h4 *ngIf="title" [class]="'font-semibold mb-1 ' + getTextColor()">
          {{ title }}
        </h4>
        <div [class]="'text-sm ' + getTextColor()">
          <ng-content></ng-content>
        </div>
      </div>
      <button
        *ngIf="onClose.observed"
        (click)="handleClose()"
        class="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
      >
        <lucide-icon [img]="XIcon" [size]="18" [class]="getTextColor()"></lucide-icon>
      </button>
    </div>
  `,
    styles: []
})
export class AlertComponent {
    @Input() variant: AlertVariant = 'info';
    @Input() title?: string;
    @Input() customClass: string = '';
    @Output() onClose = new EventEmitter<void>();

    // Icons
    InfoIcon = Info;
    CheckCircleIcon = CheckCircle;
    AlertCircleIcon = AlertCircle;
    XCircleIcon = XCircle;
    XIcon = X;

    private variants = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
        },
    };

    getAlertClasses(): string {
        const { bg, border } = this.variants[this.variant];
        return `${bg} ${border} border rounded-lg p-4 flex gap-3 ${this.customClass}`;
    }

    getTextColor(): string {
        return this.variants[this.variant].text;
    }

    handleClose(): void {
        this.onClose.emit();
    }
}
