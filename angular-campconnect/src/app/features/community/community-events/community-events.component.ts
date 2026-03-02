import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface EventHost {
  id: string;
  name: string;
  avatar: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  host: EventHost;
  attendees: number;
  image: string;
  joined?: boolean;
}

@Component({
  selector: 'app-community-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './community-events.component.html',
  styleUrl: './community-events.component.scss' // Changed to scss to match file rename
})
export class CommunityEventsComponent implements OnInit {

  viewMode: 'grid' | 'list' | 'map' = 'list';
  isCreateModalOpen = false;

  events: CommunityEvent[] = [
    {
      id: 'e1',
      title: 'Sunrise Hike at Mount Tamalpais',
      description: 'Join us for a brisk early morning hike to catch the sunrise. Rated moderate difficulty, bring water and layers.',
      date: 'OCT 12 • 5:00 AM',
      location: 'Marin County, CA',
      host: {
        id: 'sarah-c',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face'
      },
      attendees: 18,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      joined: true
    },
    {
      id: 'e2',
      title: 'Backcountry Gear Swap & Meetup',
      description: 'Looking to upgrade your kit or get rid of old gear? Join our seasonal gear swap. Coffee provided by local roasters!',
      date: 'OCT 18 • 10:00 AM',
      location: 'Golden Gate Park, SF',
      host: {
        id: 'marcus-r',
        name: 'Marcus Rivera',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face'
      },
      attendees: 42,
      image: 'https://images.unsplash.com/photo-1579705745170-4dbb9b6f3c5f?w=800&q=80',
      joined: false
    },
    {
      id: 'e3',
      title: 'Intro to Wilderness First Aid',
      description: 'A 4-hour workshop covering essential first aid skills for hikers and backpackers. Certification included upon completion.',
      date: 'OCT 25 • 9:00 AM',
      location: 'REI Community Room',
      host: {
        id: 'alex-w',
        name: 'Alex Wanderer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face'
      },
      attendees: 12,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      joined: false
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleView(mode: 'grid' | 'list' | 'map') {
    this.viewMode = mode;
  }

  toggleJoin(event: CommunityEvent, e: Event) {
    e.stopPropagation(); // prevent navigation to event details when clicking join button
    event.joined = !event.joined;
    event.attendees += event.joined ? 1 : -1;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }
}
