import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeliveryLayoutService {
    private sidebarOpen = new BehaviorSubject<boolean>(false);
    sidebarOpen$ = this.sidebarOpen.asObservable();

    toggleSidebar(): void {
        this.sidebarOpen.next(!this.sidebarOpen.value);
    }

    closeSidebar(): void {
        this.sidebarOpen.next(false);
    }
}
