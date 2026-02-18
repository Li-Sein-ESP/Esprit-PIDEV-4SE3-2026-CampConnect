import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts$ = new BehaviorSubject<Toast[]>([]);
    private idCounter = 0;

    getToasts(): Observable<Toast[]> {
        return this.toasts$.asObservable();
    }

    show(type: Toast['type'], message: string, duration: number = 5000) {
        const id = `toast-${++this.idCounter}`;
        const toast: Toast = { id, type, message, duration };

        const currentToasts = this.toasts$.value;
        this.toasts$.next([...currentToasts, toast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration?: number) {
        this.show('success', message, duration);
    }

    error(message: string, duration?: number) {
        this.show('error', message, duration);
    }

    warning(message: string, duration?: number) {
        this.show('warning', message, duration);
    }

    info(message: string, duration?: number) {
        this.show('info', message, duration);
    }

    remove(id: string) {
        const currentToasts = this.toasts$.value;
        this.toasts$.next(currentToasts.filter(t => t.id !== id));
    }
}
