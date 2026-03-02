import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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

    // ETA countdown
    etaHours = 0;
    etaMinutes = 23;
    etaSeconds = 47;
    etaInterval: any;

    delivery = {
        id: '',
        status: 'ON_THE_WAY',
        estimatedArrival: '2:45 PM today',
        distance: 12.6,
        weight: 18.4,
        vehicleType: 'Van',
        provider: {
            name: 'Marcus Rivera',
            rating: 4.8
        },
        items: [
            { name: 'Alpine Pro 4-Season Tent', detail: '4-person · Waterproof', category: 'tent' },
            { name: 'ThermaRest Sleeping Bag', detail: '-15°C rated · Mummy style', category: 'bag' },
            { name: 'Osprey 65L Backpack', detail: 'Adjustable frame · Rain cover', category: 'pack' },
            { name: 'Portable Camp Stove + Kit', detail: '2-burner · Fuel included', category: 'stove' }
        ],
        timeline: [
            { label: 'Confirmed', time: '1:02 PM', completed: true },
            { label: 'Preparing', time: '1:18 PM', completed: true },
            { label: 'Picked Up', time: '1:35 PM', completed: true },
            { label: 'On the Way', time: 'Now', completed: false },
            { label: 'Delivered', time: '~2:45 PM', completed: false }
        ]
    };

    isVisible = false;

    constructor(
        private route: ActivatedRoute,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.orderId = params.get('orderId') || 'CC-48291';
            this.delivery.id = this.orderId;
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
        if (this.etaInterval) {
            clearInterval(this.etaInterval);
        }
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
