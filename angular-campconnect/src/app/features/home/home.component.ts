import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    features = [
        {
            title: 'Find Perfect Campsites',
            description: 'Discover verified campsites with real weather data, amenities, and user reviews.',
            icon: '🌲',
            link: '/campsites'
        },
        {
            title: 'Rent Premium Gear',
            description: 'Don\'t have gear? Rent high-quality equipment from our trusted marketplace.',
            icon: '⛺',
            link: '/marketplace'
        },
        {
            title: 'Plan Your Trip',
            description: 'Create detailed itineraries, pack lists, and coordinate with friends.',
            icon: '🗺️',
            link: '/plan-trip'
        }
    ];

    popularCampsites = [
        { name: 'Yosemite Valley', location: 'California, USA', image: 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600&q=80', rating: 4.9 },
        { name: 'Lake Tahoe', location: 'Nevada, USA', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80', rating: 4.8 },
        { name: 'Banff National Park', location: 'Alberta, Canada', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', rating: 5.0 }
    ];

    constructor() { }
}
