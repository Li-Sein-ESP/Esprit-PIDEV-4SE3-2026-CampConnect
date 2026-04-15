import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DeliveryApiService, DeliveryResponse, DeliveryStatus } from '../services/delivery-api.service';
import { Subject, interval, EMPTY } from 'rxjs';
import { takeUntil, switchMap, startWith, retry, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-delivery-tracking',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delivery-tracking.component.html',
    styleUrls: ['./delivery-tracking.component.scss']
})
export class DeliveryTrackingComponent implements OnInit, OnDestroy {
    orderId: string = '';
    isMapHidden = false;
    private destroy$ = new Subject<void>();
    private stopPolling$ = new Subject<void>();
    private errorCount = 0;
    private readonly MAX_ERRORS = 3;

    // ETA countdown
    etaHours = 0;
    etaMinutes = 23;
    etaSeconds = 47;
    etaInterval: any;

    delivery: any = {
        id: '',
        status: 'PENDING',
        estimatedArrival: 'Calculating...',
        distance: 0,
        weight: 0,
        vehicleType: 'System Assigning',
        provider: {
            name: 'Awaiting Driver',
            rating: 5.0
        },
        items: [],
        timeline: []
    };

    isVisible = false;
    loadingError: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private deliveryApi: DeliveryApiService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        // Handle route param changes with proper cleanup
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            switchMap(params => {
                // Reset error state on new order
                this.loadingError = null;
                this.errorCount = 0;
                
                // Clear previous polling
                this.stopPolling$.next();
                
                this.orderId = params.get('orderId') || 'CC-48291';
                this.delivery.id = this.orderId;

                // Poll every 15 seconds with automatic error handling
                if (isPlatformBrowser(this.platformId)) {
                    return interval(15000).pipe(
                        startWith(0), // Load immediately
                        takeUntil(this.stopPolling$),
                        switchMap(() => this.deliveryApi.getById(this.orderId)),
                        retry({
                            count: 2,
                            delay: 3000
                        }),
                        catchError(err => {
                            this.errorCount++;
                            console.error(`Failed to load delivery status (attempt ${this.errorCount}):`, err);
                            
                            // Stop polling after too many errors
                            if (this.errorCount >= this.MAX_ERRORS) {
                                this.loadingError = 'Unable to load delivery status. Please refresh the page.';
                                this.stopPolling$.next();
                                return EMPTY;
                            }
                            
                            return EMPTY;
                        })
                    );
                }
                
                // Fallback for non-browser platforms
                return this.deliveryApi.getById(this.orderId);
            })
        ).subscribe({
            next: (data: DeliveryResponse) => {
                this.errorCount = 0; // Reset error count on success
                this.delivery.id = data.id;
                this.delivery.status = data.status;
                this.delivery.provider.name = data.driverName || 'Dispatch';
                this.delivery.items = [
                    { name: 'Ordered Gear', detail: 'Refer to your portal for full manifest', category: 'bag' }
                ];

                this.updateTimeline(data);

                // Stop polling when delivered
                if (data.status === 'DELIVERED') {
                    this.etaHours = 0;
                    this.etaMinutes = 0;
                    this.etaSeconds = 0;
                    if (this.etaInterval) clearInterval(this.etaInterval);
                    this.stopPolling$.next();
                }
            },
            error: (err) => {
                console.error('Failed to load delivery tracking:', err);
                this.loadingError = 'Failed to load delivery information.';
            }
        });

        if (isPlatformBrowser(this.platformId)) {
            this.startCountdown();
            // small delay to trigger CSS entry animations
            setTimeout(() => {
                this.isVisible = true;
            }, 50);
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopPolling$.next();
        this.stopPolling$.complete();
        
        if (this.etaInterval) {
            clearInterval(this.etaInterval);
        }
    }


    updateTimeline(data: DeliveryResponse) {
        const statuses = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
        let currentIndex = statuses.indexOf(data.status);
        if (currentIndex === -1) currentIndex = 0; // Handle PENDING same as CREATED for now

        this.delivery.timeline = [
            { label: 'Confirmed', time: 'Done', completed: currentIndex >= 0 },
            { label: 'Assigned', time: currentIndex >= 1 ? 'Done' : 'Pending', completed: currentIndex >= 1 },
            { label: 'Picked Up', time: currentIndex >= 2 ? 'Done' : 'Pending', completed: currentIndex >= 2 },
            { label: 'On the Way', time: currentIndex >= 3 ? 'Now' : 'Upcoming', completed: currentIndex >= 3 },
            { label: 'Delivered', time: data.status === 'DELIVERED' ? 'Complete' : 'Pending', completed: data.status === 'DELIVERED' }
        ];
    }

    startCountdown() {
        this.etaInterval = setInterval(() => {
            if (this.etaSeconds > 0) {
                this.etaSeconds--;
            } else {
                this.etaSeconds = 59;
                if (this.etaMinutes > 0) {
                    this.etaMinutes--;
                } else {
                    if (this.etaHours > 0) {
                        this.etaHours--;
                        this.etaMinutes = 59;
                    } else {
                        // Reached zero but let's just cycle it for aesthetics
                        this.etaMinutes = 23;
                    }
                }
            }
        }, 1000);
    }

    toggleMap() {
        this.isMapHidden = !this.isMapHidden;
    }

    padZero(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    get progressWidth(): string {
        const totalSteps = this.delivery.timeline.length;
        let completedSteps = 0;

        // Check if it's the active step (first uncompleted step)
        let activeFound = false;

        for (const step of this.delivery.timeline) {
            if (step.completed) {
                completedSteps++;
            } else if (!activeFound) {
                // Active step gets partial progress (e.g. halfway to next step)
                completedSteps += 0.5;
                activeFound = true;
            }
        }

        return ((completedSteps / (totalSteps - 1)) * 100) + '%';
    }
}
