import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Hourglass, Ticket, Tent, Star } from 'lucide-angular';

@Component({
  selector: 'app-reservation-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reservation-timeline.html',
  styleUrl: './reservation-timeline.css'
})
export class ReservationTimeline implements OnInit {
  @Input() currentStep: number = 2; // 1 = Pending, 2 = Confirmed, 3 = Active, 4 = Completed

  readonly Hourglass = Hourglass;
  readonly Ticket = Ticket;
  readonly Tent = Tent;
  readonly Star = Star;

  steps = [
    { id: 1, label: 'Pending', description: 'Reviewing', icon: this.Hourglass },
    { id: 2, label: 'Confirmed', description: 'Booked', icon: this.Ticket },
    { id: 3, label: 'Active', description: 'On Site', icon: this.Tent },
    { id: 4, label: 'Completed', description: 'Finished', icon: this.Star }
  ];

  constructor() { }

  ngOnInit() { }

  get progressWidth(): string {
    // 0%, 33%, 66%, 100%
    if (this.currentStep <= 1) return '0%';
    if (this.currentStep >= 4) return '100%';
    return `${((this.currentStep - 1) / (this.steps.length - 1)) * 100}%`;
  }
}
