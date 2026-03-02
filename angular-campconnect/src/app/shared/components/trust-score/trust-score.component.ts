import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-trust-score',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './trust-score.component.html',
    styleUrl: './trust-score.component.scss'
})
export class TrustScoreComponent implements OnInit, OnChanges {
    @Input() score: number = 0;
    @Input() variant: 'default' | 'small' | 'admin' = 'default';

    level: number = 1;
    levelLabel: string = 'Newcomer';
    isAnimating: boolean = false;
    circumference: number = 2 * Math.PI * 52; // r=52 in SVG
    dashArray: string = `0 ${this.circumference}`;

    ngOnInit() {
        this.updateBadge();
        // Trigger animation slightly after load if default or admin
        setTimeout(() => {
            this.isAnimating = true;
        }, 100);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['score']) {
            this.updateBadge();
        }
    }

    updateBadge() {
        this.calculateLevel();
        // Set dash array for progress
        const dashLen = (this.score / 100) * this.circumference;
        // Use timeout to ensure CSS transition triggers if it was 0
        setTimeout(() => {
            this.dashArray = `${dashLen} ${this.circumference - dashLen}`;
        }, 50);
    }

    calculateLevel() {
        if (this.score <= 20) {
            this.level = 1;
            this.levelLabel = 'Newcomer';
        } else if (this.score <= 40) {
            this.level = 2;
            this.levelLabel = 'Explorer';
        } else if (this.score <= 60) {
            this.level = 3;
            this.levelLabel = 'Trailblazer';
        } else if (this.score <= 80) {
            this.level = 4;
            this.levelLabel = 'Ranger';
        } else {
            this.level = 5;
            this.levelLabel = 'Summit Guide'; // or 'Summit' for admin but we can let CSS handle it or just use one
            if (this.variant === 'admin') this.levelLabel = 'Summit';
        }
    }

    // Helper getters for CSS classes
    get badgeClasses() {
        return {
            'trust-badge': true,
            [`trust-badge--level-${this.level}`]: true,
            'trust-badge--small': this.variant === 'small',
            'trust-badge--admin': this.variant === 'admin'
        };
    }
}
