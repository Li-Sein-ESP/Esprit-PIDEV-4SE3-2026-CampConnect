import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-angular';
import { ToastService, Toast } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div
        *ngFor="let toast of toasts"
        class="flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in"
        [ngClass]="{
          'bg-green-50 border border-green-200': toast.type === 'success',
          'bg-red-50 border border-red-200': toast.type === 'error',
          'bg-amber-50 border border-amber-200': toast.type === 'warning',
          'bg-blue-50 border border-blue-200': toast.type === 'info'
        }"
      >
        <lucide-icon
          [name]="getIcon(toast.type)"
          class="w-5 h-5 flex-shrink-0"
          [ngClass]="{
            'text-green-600': toast.type === 'success',
            'text-red-600': toast.type === 'error',
            'text-amber-600': toast.type === 'warning',
            'text-blue-600': toast.type === 'info'
          }"
        ></lucide-icon>
        <p
          class="flex-1 text-sm font-medium"
          [ngClass]="{
            'text-green-900': toast.type === 'success',
            'text-red-900': toast.type === 'error',
            'text-amber-900': toast.type === 'warning',
            'text-blue-900': toast.type === 'info'
          }"
        >
          {{ toast.message }}
        </p>
        <button
          (click)="remove(toast.id)"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
          [ngClass]="{
            'text-green-600': toast.type === 'success',
            'text-red-600': toast.type === 'error',
            'text-amber-600': toast.type === 'warning',
            'text-blue-600': toast.type === 'info'
          }"
        >
          <lucide-icon [name]="X" class="w-4 h-4"></lucide-icon>
        </button>
      </div>
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription?: Subscription;

    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly AlertTriangle = AlertTriangle;
    readonly Info = Info;
    readonly X = X;

    constructor(private toastService: ToastService) { }

    ngOnInit() {
        this.subscription = this.toastService.getToasts().subscribe(
            toasts => this.toasts = toasts
        );
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    remove(id: string) {
        this.toastService.remove(id);
    }

    getIcon(type: Toast['type']) {
        const icons = {
            success: this.CheckCircle,
            error: this.XCircle,
            warning: this.AlertTriangle,
            info: this.Info
        };
        return icons[type];
    }
}
