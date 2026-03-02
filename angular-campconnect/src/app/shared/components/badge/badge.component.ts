import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-camp-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './badge.component.html',
    styleUrl: './badge.component.scss'
})
export class CampBadgeComponent implements OnInit {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() icon: string = 'forest';
    @Input() unlocked: boolean = true;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';

    isVisible: boolean = false;

    ngOnInit() {
        setTimeout(() => {
            this.isVisible = true;
        }, 50);
    }

    get sizeClass(): string {
        switch (this.size) {
            case 'small': return 'camp-badge--sm';
            case 'large': return 'camp-badge--lg';
            default: return 'camp-badge--md';
        }
    }

    get themeClass(): string {
        if (!this.unlocked) return 'camp-badge--locked';

        const themeMap: { [key: string]: string } = {
            'tent': 'forest',
            'trail': 'terra',
            'fire': 'amber',
            'moon': 'slate',
            'leaf': 'sage',
            'binoculars': 'teal',
            'mountain': 'stone',
            'group': 'dusk',
            'storm': 'slate',
            'star': 'gold',
            'chef': 'terra',
            'water': 'teal',
            'first-camp': 'forest',
        };
        const theme = themeMap[this.icon] || this.icon;
        return `camp-badge--${theme}`;
    }
}
