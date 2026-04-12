import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, Users, Calendar, LayoutDashboard, Settings, AlertTriangle, Search, Filter, SlidersHorizontal, ChevronRight, MapPin, BadgeCheck, Clock, Ban } from 'lucide-angular';
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
    AlertTriangle = AlertTriangle;
    SearchIcon = Search;
    FilterIcon = Filter;
    SlidersHorizontalIcon = SlidersHorizontal;
    ChevronRightIcon = ChevronRight;
    MapPinIcon = MapPin;
    BadgeCheckIcon = BadgeCheck;
    ClockIcon = Clock;
    BanIcon = Ban;

    events = signal<Event[]>([]);
    searchTerm = signal<string>('');
    filterType = signal<string>('all');
    users = signal<any[]>([]);

    filteredEvents = computed(() => {
        const term = this.searchTerm().toLowerCase();
        const type = this.filterType();
        
        return this.events().filter(event => {
            const matchesTerm = (event.title?.toLowerCase() || '').includes(term) || 
                               (event.location?.name?.toLowerCase() || '').includes(term) ||
                               (event.categoryName?.toLowerCase() || '').includes(term);
            const matchesType = type === 'all' || event.type?.toLowerCase() === type.toLowerCase();
            return matchesTerm && matchesType;
        });
    });

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

    formErrors: { [key: string]: string } = {};

    feedback = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    // Confirmation Modal State
    showConfirmModal = false;
    confirmTitle = '';
    confirmMessage = '';
    confirmAction: 'delete' | 'save' = 'delete';
    eventToDelete: string | null = null;

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
            totalRevenue: evts.reduce((acc, curr) => acc + ((curr.capacity || 0) * (curr.price || 0)), 0)
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
        if (!this.selectedEvent || !this.assigningUserId) {
            console.warn('Assignment aborted: missing event or target user.');
            return;
        }

        console.log('--- START PARTICIPANT ASSIGNMENT ---');
        console.log('Event:', this.selectedEvent.title);
        console.log('User ID:', this.assigningUserId);
        console.log('Spots:', this.assigningParticipants);

        this.eventService.assignUserToEvent(this.selectedEvent.id, this.assigningUserId, this.assigningParticipants)
            .subscribe({
                next: (reg) => {
                    console.log('SUCCESS: Participant assigned!', reg);
                    this.viewParticipants(this.selectedEvent!);
                    this.loadEvents(); // Refresh registered count
                    this.assigningUserId = '';
                    this.assigningParticipants = 1;
                    
                    this.feedback.set({ message: 'Personnel assigned to mission! 🛡️', type: 'success' });
                    setTimeout(() => this.feedback.set({ message: '', type: null }), 2000);
                },
                error: (err) => {
                    console.error('ASSIGNMENT FAILED:', err);
                    const msg = err.error?.message || 'Assignment failed. Sector communication error.';
                    alert('ASSIGNMENT FAILED: ' + msg);
                    this.feedback.set({ message: msg, type: 'error' });
                }
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
            startDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 90000000).toISOString().slice(0, 16),
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

    eventTypes = [
        { id: 'all', label: 'All' },
        { id: 'workshop', label: 'Workshop' },
        { id: 'expedition', label: 'Expedition' },
        { id: 'guided-hike', label: 'Guided Hike' },
        { id: 'retreat', label: 'Retreat' },
        { id: 'group-camp', label: 'Group Camp' },
        { id: 'certification', label: 'Certification' },
        { id: 'skills-course', label: 'Skills Course' },
        { id: 'training', label: 'Training' },
        { id: 'festival', label: 'Festival' },
        { id: 'meetup', label: 'Meetup' }
    ];

    isDateRangeValid(): boolean {
        if (!this.eventForm.startDate || !this.eventForm.endDate) return true;
        
        const start = new Date(this.eventForm.startDate);
        const end = new Date(this.eventForm.endDate);
        const now = new Date();
        
        // Ensure end date is not in the past
        if (end < now) return false;
        
        // Ensure end date is after start date
        return end > start;
    }

    validateForm(): boolean {
        this.formErrors = {};

        if (!this.eventForm.title || this.eventForm.title.trim().length < 3) {
            this.formErrors['title'] = 'Title is required (min. 3 characters)';
        }
        if (!this.eventForm.description || this.eventForm.description.trim() === '') {
            this.formErrors['description'] = 'Description is required';
        }
        if (this.eventForm.capacity === undefined || this.eventForm.capacity <= 0) {
            this.formErrors['capacity'] = 'Capacity must be greater than 0';
        }
        if (this.eventForm.price === undefined || this.eventForm.price < 0) {
            this.formErrors['price'] = 'Investment cannot be negative';
        }
        if (!this.eventForm.location?.name || this.eventForm.location.name.trim() === '') {
            this.formErrors['locationName'] = 'Deployment site name is required';
        }
        if (!this.isDateRangeValid()) {
            this.formErrors['dates'] = 'Inconsistent Dates: End date must be in the future and after start date.';
        }

        return Object.keys(this.formErrors).length === 0;
    }

    closeForm() {
        this.showForm = false;
        this.editingEvent = null;
        this.formErrors = {};
    }

    saveEvent() {
        this.feedback.set({ message: '', type: null });
        this.formErrors = {};

        if (!this.validateForm()) {
            this.feedback.set({ message: 'Please correct the errors in the form.', type: 'error' });
            return;
        }

        // Show confirmation before saving
        this.confirmAction = 'save';
        this.confirmTitle = this.editingEvent ? 'Confirm Update' : 'Confirm Creation';
        this.confirmMessage = this.editingEvent 
            ? 'Are you sure you want to update this mission\'s specs? This will overwrite the current deployment data.'
            : 'Are you sure you want to deploy this new mission to the field?';
        this.showConfirmModal = true;
    }

    executeSave() {
        console.log('--- START DEPLOYMENT ---');
        console.log('Action:', this.confirmAction);
        this.feedback.set({ message: 'Initiating orbital drop... 🛰️', type: 'success' });
        this.showConfirmModal = false;
        
        const payload = { ...this.eventForm } as any;

        // Map organizer for DTO compatibility
        if (payload.organizer) {
            payload.creatorId = payload.organizer.id;
            payload.creatorName = payload.organizer.name;
        }

        // Normalize Enums
        if (payload.type) payload.type = payload.type.toUpperCase().replace(/-/g, '_');
        if (payload.difficulty) payload.difficulty = payload.difficulty.toUpperCase().replace(/-/g, '_');
        if (payload.status) payload.status = payload.status.toUpperCase();

        // Ensure dates are in the correct format (LocalDateTime ISO)
        if (payload.startDate && !payload.startDate.includes(':00')) {
            payload.startDate = payload.startDate + ':00';
        }
        if (payload.endDate && !payload.endDate.includes(':00')) {
            payload.endDate = payload.endDate + ':00';
        }

        // Calculate Duration if dates exist
        if (payload.startDate && payload.endDate) {
            const start = new Date(payload.startDate).getTime();
            const end = new Date(payload.endDate).getTime();
            payload.duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
        }

        // Scrub Tactical Lists (Remove empty entries)
        const scrub = (arr: any) => Array.isArray(arr) ? arr.map(s => s.trim()).filter(s => s.length > 0) : [];
        payload.whatToExpect = scrub(payload.whatToExpect);
        payload.whatToBring = scrub(payload.whatToBring);
        payload.whatsIncluded = scrub(payload.whatsIncluded);

        // Clean up ID for new missions
        if (!this.editingEvent) {
            delete payload.id;
        }

        console.log('Payload for Backend:', payload);

        const handleError = (err: any) => {
            console.error('CRITICAL FAILURE:', err);
            let errorMsg = 'Deployment Aborted. Server rejected the specs.';

            if (err.status === 0) {
                errorMsg = 'Communication blackout: Could not reach the Command Center (8081). Is the backend operational?';
            } else if (err.error) {
                if (typeof err.error === 'string') {
                    errorMsg = err.error;
                } else if (err.error.errors && typeof err.error.errors === 'object') {
                    this.formErrors = err.error.errors;
                    const firstKey = Object.keys(err.error.errors)[0];
                    errorMsg = `Validation Breach [${firstKey}]: ${err.error.errors[firstKey]}`;
                } else if (err.error.message) {
                    errorMsg = err.error.message;
                }
            }

            this.feedback.set({ message: errorMsg, type: 'error' });
            // Alert as a fallback to ensure user sees the failure
            alert('MISSION FAILED: ' + errorMsg);
        };

        if (this.editingEvent) {
            this.eventService.updateEvent(this.editingEvent.id, payload).subscribe({
                next: (updated) => {
                    this.feedback.set({ message: 'Mission specs updated! 🛠️', type: 'success' });
                    this.loadEvents();
                    setTimeout(() => {
                        this.closeForm();
                        this.feedback.set({ message: '', type: null });
                    }, 2000);
                },
                error: (err) => handleError(err)
            });
        } else {
            this.eventService.createEvent(payload).subscribe({
                next: (created) => {
                    console.log('SUCCESS: Mission deployed!', created);
                    this.feedback.set({ message: 'New mission deployed to the field! 🚀', type: 'success' });
                    
                    // Reset filters to ensure the new event is visible
                    this.searchTerm.set('');
                    this.filterType.set('all');
                    
                    this.loadEvents();
                    
                    setTimeout(() => {
                        this.closeForm();
                        this.feedback.set({ message: '', type: null });
                    }, 2000);
                },
                error: (err) => handleError(err)
            });
        }
    }

    deleteEvent(id: string) {
        if (!id) return;
        this.eventToDelete = id;
        this.confirmAction = 'delete';
        this.confirmTitle = 'Confirm Neutralization';
        this.confirmMessage = 'Are you sure you want to remove this mission from the theater? This action cannot be reversed.';
        this.showConfirmModal = true;
    }

    onConfirm() {
        if (this.confirmAction === 'delete') {
            this.confirmDelete();
        } else {
            this.executeSave();
        }
    }

    private confirmDelete() {
        if (!this.eventToDelete) return;
        const id = this.eventToDelete;
        this.showConfirmModal = false;
        this.eventToDelete = null;

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

    getEventStatus(event: Event) {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        if (event.registered >= event.capacity) return { label: 'FULL', class: 'bg-amber-100 text-amber-700' };
        if (now > end) return { label: 'FINISHED', class: 'bg-gray-100 text-gray-700' };
        if (now >= start && now <= end) return { label: 'ACTIVE', class: 'bg-emerald-100 text-emerald-700' };
        return { label: 'PLANNED', class: 'bg-blue-100 text-blue-700' };
    }

    cancelDelete() {
        this.showConfirmModal = false;
        this.eventToDelete = null;
    }
}
