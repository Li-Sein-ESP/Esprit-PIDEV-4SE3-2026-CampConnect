import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, CheckCircle, Clock, X, Search, Filter, MapPin, ChevronRight, AlertCircle } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { CampsiteService } from '../../../core/services/campsite.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-admin-bookings-component',
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
    BadgeComponent
  ],
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css']
})
export class AdminBookingsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly X = X;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly MapPin = MapPin;
  readonly ChevronRight = ChevronRight;
  readonly AlertCircle = AlertCircle;

  reservations: Reservation[] = [];
  campsiteMap: Map<string, any> = new Map();
  userMap: Map<string, string> = new Map();
  isLoading = true;
  filter: 'all' | 'pending' | 'confirmed' | 'cancelled' = 'all';
  searchTerm: string = '';

  statusConfig = {
    [ReservationStatus.PENDING]: { label: 'Pending', variant: 'warning' as const, icon: Clock },
    [ReservationStatus.CONFIRMED]: { label: 'Confirmed', variant: 'success' as const, icon: CheckCircle },
    [ReservationStatus.CANCELLED]: { label: 'Cancelled', variant: 'default' as const, icon: X },
    [ReservationStatus.COMPLETED]: { label: 'Completed', variant: 'primary' as const, icon: CheckCircle },
  };

  constructor(
    private reservationService: ReservationService,
    private campsiteService: CampsiteService,
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.campsiteService.getAllCampsites().subscribe({
      next: (campsites) => {
        campsites.forEach(c => this.campsiteMap.set(c.id, c));
        this.loadReservations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading campsites', err);
        this.loadReservations();
        this.cdr.detectChanges();
      }
    });
  }

  loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data.sort((a, b) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        this.loadUserNames();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredReservations() {
    const currentUser = this.authService.currentUserValue;
    
    return this.reservations.filter(res => {
      // 1. Status Filter
      const matchesTab = this.filter === 'all' || res.status.toLowerCase() === this.filter;
      
      // 2. Ownership Filter: Admin should only see reservations for their own campsites
      const campsite = this.campsiteMap.get(res.targetId);
      const isOwner = campsite && (campsite.creatorUsername === currentUser?.username || !campsite.creatorUsername);
      
      // If we want to allow super-admins to see all, we could check for a specific role
      if (!isOwner) return false;

      // 3. Search Filter
      const campsiteName = campsite ? campsite.name.toLowerCase() : '';
      const matchesSearch = !this.searchTerm || 
        campsiteName.includes(this.searchTerm.toLowerCase()) ||
        res.userId.toLowerCase().includes(this.searchTerm.toLowerCase());
        
      return matchesTab && matchesSearch;
    });
  }

  setFilter(filter: any) {
    this.filter = filter;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  approveReservation(id: string) {
    this.reservationService.confirmReservation(id).subscribe({
      next: () => this.loadReservations(),
      error: (err) => console.error('Error approving reservation', err)
    });
  }

  rejectReservation(id: string) {
    if (confirm('Are you sure you want to reject this reservation?')) {
      this.reservationService.cancelReservation(id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => console.error('Error rejecting reservation', err)
      });
    }
  }

  getCampsiteName(id: string): string {
    return this.campsiteMap.get(id)?.name || 'Unknown Site';
  }

  getCampsiteLocation(id: string): string {
    return this.campsiteMap.get(id)?.location || 'Unknown Location';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  loadUserNames() {
    const userIds = [...new Set(this.reservations.map(r => r.userId))];
    userIds.forEach(id => {
      if (!this.userMap.has(id)) {
        this.userService.getUserById(id).subscribe({
          next: (user) => {
            this.userMap.set(id, user.name || user.username);
            this.cdr.detectChanges();
          },
          error: () => this.userMap.set(id, 'Unknown User')
        });
      }
    });
  }

  getUserName(res: Reservation): string {
    if (res.username) return res.username;
    return this.userMap.get(res.userId) || 'Loading...';
  }
}
