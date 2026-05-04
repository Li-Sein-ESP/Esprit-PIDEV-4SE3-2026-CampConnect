import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { AcademyService } from '../../academy/services/academy.service';
import { EventService } from '../../events/services/event.service';
import { signal, OnInit } from '@angular/core';
import { Plus, BookOpen, Calendar, Users, Activity, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  PlusIcon = Plus;
  BookIcon = BookOpen;
  CalendarIcon = Calendar;
  UsersIcon = Users;
  ActivityIcon = Activity;
  TrendingIcon = TrendingUp;

  stats = signal({
    totalEvents: 0,
    totalCourses: 0,
    totalParticipants: 0,
    activeAcademyCerts: 0
  });

  recentActivities = signal<any[]>([]);

  constructor(
    private academyService: AcademyService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.loadStats();
    this.loadRecentActivity();
  }

  loadStats() {
    this.eventService.getEvents().subscribe(events => {
      this.stats.update(s => ({
        ...s,
        totalEvents: events.length,
        totalParticipants: events.reduce((acc, curr) => acc + (curr.registered || 0), 0)
      }));
    });

    this.academyService.getCourses().subscribe(courses => {
      this.stats.update(s => ({ ...s, totalCourses: courses.length }));
    });

    this.academyService.getCertifications().subscribe(certs => {
      this.stats.update(s => ({ ...s, activeAcademyCerts: certs.length }));
    });
  }

  loadRecentActivity() {
    // Mocking recent activity for the UI demo
    this.recentActivities.set([
      { type: 'event', title: 'New Event Created', time: '2 hours ago', icon: this.CalendarIcon },
      { type: 'course', title: 'Wilderness Survival Updated', time: '5 hours ago', icon: this.BookIcon },
      { type: 'user', title: 'New Participant Joined Expedition', time: 'Yesterday', icon: this.UsersIcon }
    ]);
  }
}
