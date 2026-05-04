import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
    LucideAngularModule,
    Phone, CheckCircle2, Info, Bell, MapPin, Clock, Mail, User, UserPlus, Edit2, ArrowLeft, X
} from 'lucide-angular';

interface Contact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email: string;
    isPrimary?: boolean;
}

interface Trip {
    id: string;
    name: string;
    location: string;
    time: string;
    status: 'checked-in' | 'pending';
    lastCheckedIn?: string;
}

@Component({
    selector: 'app-trip-checkin',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './trip-checkin.component.html'
})
export class TripCheckinComponent {
    readonly PhoneIcon = Phone;
    readonly CheckCircle2Icon = CheckCircle2;
    readonly InfoIcon = Info;
    readonly BellIcon = Bell;
    readonly MapPinIcon = MapPin;
    readonly ClockIcon = Clock;
    readonly MailIcon = Mail;
    readonly UserIcon = User;
    readonly UserPlusIcon = UserPlus;
    readonly Edit2Icon = Edit2;
    readonly ArrowLeftIcon = ArrowLeft;
    readonly XIcon = X;

    contacts: Contact[] = [
        {
            id: '1',
            name: 'Jennifer Chen',
            relationship: 'Spouse',
            phone: '(555) 123-4567',
            email: 'jennifer.chen@email.com',
            isPrimary: true
        },
        {
            id: '2',
            name: 'Michael Chen',
            relationship: 'Brother',
            phone: '(555) 987-6543',
            email: 'michael.chen@email.com'
        }
    ];

    trips: Trip[] = [
        {
            id: '1',
            name: 'Rocky Mountain Spring Adventure',
            location: 'Bear Lake Trailhead',
            time: 'Today, 6:00 PM',
            status: 'checked-in',
            lastCheckedIn: 'Just now'
        },
        {
            id: '2',
            name: 'Rocky Mountain Spring Adventure',
            location: 'Bear Lake Trailhead',
            time: 'Yesterday, 6:00 PM',
            status: 'checked-in',
            lastCheckedIn: 'Yesterday, 5:47 PM'
        },
        {
            id: '3',
            name: 'Yosemite Family Camping',
            location: 'Half Dome Trailhead',
            time: 'Feb 10, 7:00 PM',
            status: 'pending'
        }
    ];

    notificationSettings = [
        { label: 'Check-in reminders', checked: true },
        { label: 'Emergency alerts', checked: true },
        { label: 'Contact notifications', checked: true }
    ];

    checkInNow(tripId: string) {
        const trip = this.trips.find(t => t.id === tripId);
        if (trip) {
            trip.status = 'checked-in';
            trip.lastCheckedIn = 'Just now';
        }
    }

    // Add Contact Modal
    showAddContactModal = false;
    newContact = { name: '', relationship: '', phone: '', email: '' };

    openAddContactModal() { this.showAddContactModal = true; }
    closeAddContactModal() {
        this.showAddContactModal = false;
        this.newContact = { name: '', relationship: '', phone: '', email: '' };
    }
    submitNewContact() {
        if (this.newContact.name && this.newContact.relationship && this.newContact.phone && this.newContact.email) {
            this.contacts.push({
                id: String(this.contacts.length + 1),
                name: this.newContact.name,
                relationship: this.newContact.relationship,
                phone: this.newContact.phone,
                email: this.newContact.email
            });
            this.closeAddContactModal();
        }
    }
}
