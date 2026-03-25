import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, Users, Calendar, LayoutDashboard, Settings } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { EventService } from '../../events/services/event.service';
import { Event, EventRegistration } from '../../events/models/event.model';
import { AcademyService } from '../../academy/services/academy.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-events-management',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        CardComponent,
        CardContentComponent,
        CardHeaderComponent,
        CardTitleComponent,
        FormsModule
    ],
    templateUrl: './admin-events-management.component.html'
})
export class AdminEventsManagementComponent implements OnInit {
    PlusIcon = Plus;
    PencilIcon = Pencil;
    TrashIcon = Trash2;
    UsersIcon = Users;
    CalendarIcon = Calendar;
    DashboardIcon = LayoutDashboard;
    SettingsIcon = Settings;

    events = signal<Event[]>([]);
    users = signal<any[]>([]);

    stats = signal({
        totalEvents: 0,
        totalParticipants: 0,
        availableCapacity: 0,
        totalRevenue: 0
    });
    showForm = false;
    showParticipants = false;
    selectedEvent: Event | null = null;
    participants = signal<EventRegistration[]>([]);

    editingEvent: Event | null = null;
    eventForm: Partial<Event> = {};

    assigningUserId = '';
    assigningParticipants = 1;

    feedback = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    constructor(
        private eventService: EventService,
        private academyService: AcademyService
    ) { }

    ngOnInit(): void {
        this.loadEvents();
        this.loadUsers();
    }

    loadEvents() {
        this.eventService.getEvents().subscribe(events => {
            this.events.set(events);
            this.updateStats();
        });
    }

    updateStats() {
        const evts = this.events();
        this.stats.set({
            totalEvents: evts.length,
            totalParticipants: evts.reduce((acc, curr) => acc + (curr.registered || 0), 0),
            availableCapacity: evts.reduce((acc, curr) => acc + (curr.capacity || 0), 0),
            totalRevenue: evts.reduce((acc, curr) => acc + ((curr.registered || 0) * (curr.price || 0)), 0)
        });
    }

    loadUsers() {
        this.academyService.getExperts().subscribe(users => {
            this.users.set(users);
        });
    }

    viewParticipants(event: Event) {
        this.selectedEvent = event;
        this.eventService.getParticipants(event.id).subscribe(participants => {
            this.participants.set(participants);
            this.showParticipants = true;
        });
    }

    assignUser() {
        if (!this.selectedEvent || !this.assigningUserId) return;

        this.eventService.assignUserToEvent(this.selectedEvent.id, this.assigningUserId, this.assigningParticipants)
            .subscribe(() => {
                this.viewParticipants(this.selectedEvent!);
                this.loadEvents(); // Refresh registered count
                this.assigningUserId = '';
                this.assigningParticipants = 1;
            });
    }

    closeParticipants() {
        this.showParticipants = false;
        this.selectedEvent = null;
    }

    openAddForm() {
        this.editingEvent = null;
        this.eventForm = {
            title: '',
            description: '',
            categoryName: 'General',
            type: 'workshop',
            capacity: 20,
            registered: 0,
            price: 0,
            status: 'upcoming',
            difficulty: 'beginner',
            startDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour ahead
            endDate: new Date(Date.now() + 90000000).toISOString().slice(0, 16), // ~25 hours ahead
            duration: 24,
            imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
            location: { name: '', address: '' },
            organizer: { id: 'admin', name: 'Admin', verified: true },
            tags: [],
            whatToExpect: [],
            whatToBring: [],
            whatsIncluded: [],
            safetyNotes: []
        };
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
        this.editingEvent = null;
    }

    saveEvent() {
        const payload = { ...this.eventForm } as any;

        // Map organizer to creator fields for DTO compatibility
        if (payload.organizer) {
            payload.creatorId = payload.organizer.id;
            payload.creatorName = payload.organizer.name;
            // Jackson ignores 'organizer' due to @JsonIgnoreProperties(ignoreUnknown = true)
        }

        // Normalize Enums for Backend (Standard Spring/Jackson expects UPPER_CASE)
        if (payload.type) payload.type = payload.type.toUpperCase().replace('-', '_');
        if (payload.difficulty) payload.difficulty = payload.difficulty.toUpperCase().replace('-', '_');
        if (payload.status) payload.status = payload.status.toUpperCase();

        // Ensure dates are in the correct format for LocalDateTime (ISO without Z/Offset)
        // input type="datetime-local" gives YYYY-MM-DDTHH:mm
        if (payload.startDate && !payload.startDate.includes(':00')) {
            payload.startDate = payload.startDate + ':00';
        }
        if (payload.endDate && !payload.endDate.includes(':00')) {
            payload.endDate = payload.endDate + ':00';
        }

        // Remove ID for New Creation to avoid backend confusion if it's empty
        if (!this.editingEvent) {
            delete payload.id;
        }

        this.feedback.set({ message: 'Processing mission specs...', type: 'success' });

        const handleError = (err: any) => {
            console.error('Event operation failed:', err);
            let errorMsg = 'Deployment failed. Server rejected the specs.';

            if (err.error) {
                if (typeof err.error === 'string') {
                    errorMsg = err.error;
                } else {
                    // Handle Spring Boot validation errors (Map format from our new Handler)
                    if (err.error.errors && typeof err.error.errors === 'object') {
                        const firstKey = Object.keys(err.error.errors)[0];
                        if (firstKey) {
                            errorMsg = `Validation Error [${firstKey}]: ${err.error.errors[firstKey]}`;
                        }
                    }
                    // Handle direct message or details
                    else if (err.error.details) {
                        errorMsg = err.error.details;
                    }
                    else if (err.error.message) {
                        errorMsg = err.error.message;
                    }
                }
            }

            if (err.status === 400 && errorMsg.includes('future')) {
                errorMsg = 'Validation Error: Event date must be in the future.';
            }

            this.feedback.set({ message: errorMsg, type: 'error' });
        };

        if (this.editingEvent) {
            this.eventService.updateEvent(this.editingEvent.id, payload).subscribe({
                next: () => {
                    this.feedback.set({ message: 'Mission specs updated successfully!', type: 'success' });
                    this.loadEvents();
                    setTimeout(() => {
                        this.closeForm();
                        this.feedback.set({ message: '', type: null });
                    }, 2000);
                },
                error: (err: any) => handleError(err)
            });
        } else {
            this.eventService.createEvent(payload).subscribe({
                next: () => {
                    this.feedback.set({ message: 'New mission deployed to the field!', type: 'success' });
                    this.loadEvents();
                    setTimeout(() => {
                        this.closeForm();
                        this.feedback.set({ message: '', type: null });
                    }, 2000);
                },
                error: (err: any) => handleError(err)
            });
        }
    }

    deleteEvent(id: string) {
        if (!id) return;
        if (confirm('Are you sure you want to delete this event?')) {
            this.feedback.set({ message: 'Neutralizing event...', type: 'success' });
            this.eventService.deleteEvent(id).subscribe({
                next: () => {
                    this.feedback.set({ message: 'Event removed from theater.', type: 'success' });
                    this.loadEvents();
                    setTimeout(() => this.feedback.set({ message: '', type: null }), 2000);
                },
                error: (err: any) => {
                    console.error('Delete failed:', err);
                    this.feedback.set({ message: 'Neutralization failed. Check server logs.', type: 'error' });
                }
            });
        }
    }
}
