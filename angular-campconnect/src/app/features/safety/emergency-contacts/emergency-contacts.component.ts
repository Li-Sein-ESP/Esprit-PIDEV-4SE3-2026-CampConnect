import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Phone, Flame, Cross, Shield, MapPin, Search } from 'lucide-angular';
import { PublicEmergencyContact } from '../models/safety.model';

@Component({
    selector: 'app-emergency-contacts',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './emergency-contacts.component.html',
    styleUrls: ['./emergency-contacts.component.scss']
})
export class EmergencyContactsComponent implements OnInit {
    PhoneIcon = Phone;
    FlameIcon = Flame;
    CrossIcon = Cross;
    ShieldIcon = Shield;
    MapPinIcon = MapPin;
    SearchIcon = Search;

    selectedRegion = 'All Regions';
    regions: string[] = ['All Regions', 'Yellowstone', 'Yosemite', 'Grand Canyon', 'Zion', 'Glacier'];

    allContacts: PublicEmergencyContact[] = [
        { id: '1', serviceName: 'Yellowstone Emergency Medical Services', phoneNumber: '+1-307-344-7381', region: 'Yellowstone', category: 'medical' },
        { id: '2', serviceName: 'Yosemite Search and Rescue', phoneNumber: '+1-209-379-1992', region: 'Yosemite', category: 'rescue' },
        { id: '3', serviceName: 'Grand Canyon Park Rangers', phoneNumber: '+1-928-638-7805', region: 'Grand Canyon', category: 'ranger' },
        { id: '4', serviceName: 'Zion Regional Fire Department', phoneNumber: '+1-435-772-3256', region: 'Zion', category: 'fire' },
        { id: '5', serviceName: 'Glacier National Park Police', phoneNumber: '+1-406-888-7800', region: 'Glacier', category: 'police' },
        { id: '6', serviceName: 'National Emergency Hotline', phoneNumber: '911', region: 'All Regions', category: 'police' }
    ];

    filteredContacts: PublicEmergencyContact[] = [];

    ngOnInit() {
        this.detectRegion();
        this.filterContacts();
    }

    detectRegion() {
        // Mock auto-detection logic
        this.selectedRegion = 'All Regions';
    }

    filterContacts() {
        if (this.selectedRegion === 'All Regions') {
            this.filteredContacts = [...this.allContacts];
        } else {
            this.filteredContacts = this.allContacts.filter(c =>
                c.region === this.selectedRegion || c.region === 'All Regions'
            );
        }

        // Always put 911 (primary) at the top
        this.filteredContacts.sort((a, b) => {
            if (a.phoneNumber === '911') return -1;
            if (b.phoneNumber === '911') return 1;
            return 0;
        });
    }

    onRegionChange() {
        this.filterContacts();
    }

    getCategoryIcon(category: string) {
        switch (category) {
            case 'fire': return this.FlameIcon;
            case 'medical': return this.CrossIcon;
            case 'police': return this.ShieldIcon;
            case 'rescue': return this.MapPinIcon;
            case 'ranger': return this.MapPinIcon;
            default: return this.PhoneIcon;
        }
    }

    getCategoryColor(category: string) {
        switch (category) {
            case 'fire': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'medical': return 'text-red-600 bg-red-100 border-red-200';
            case 'police': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'rescue': return 'text-purple-600 bg-purple-100 border-purple-200';
            case 'ranger': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    }
}
