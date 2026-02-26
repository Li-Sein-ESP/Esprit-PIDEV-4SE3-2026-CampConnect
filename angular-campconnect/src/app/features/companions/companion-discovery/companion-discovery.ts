import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Target, MapPin, Send, CheckCircle, Clock, X } from 'lucide-angular';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { RadarChart } from '../../../shared/components/radar-chart/radar-chart';
import { ConnectionRequestService } from '../services/connection-request.service';
import { ConnectionStatus } from '../models/companion.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-companion-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CardComponent, CardContentComponent, BadgeComponent, RadarChart],
  templateUrl: './companion-discovery.html',
  styleUrl: './companion-discovery.css'
})
export class CompanionDiscovery implements OnDestroy {
  readonly Target = Target;
  readonly MapPin = MapPin;
  readonly Send = Send;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly X = X;

  potentialMatches = [
    {
      id: "u1",
      name: "Sarah Jenkins",
      age: 26,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      location: "Boulder, CO",
      bio: "Trail runner and weekend climber. I prefer going fast and light.",
      campingStyle: "Backpacking",
      experienceLevel: "Expert",
      matchScore: 92,
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
      stats: [9, 3, 9, 8, 2]
    },
    {
      id: "u2",
      name: "Marcus Thorne",
      age: 31,
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
      location: "Seattle, WA",
      bio: "Vanlife enthusiast crossing off national parks. I have a whole kitchen in my trunk.",
      campingStyle: "Vanlife",
      experienceLevel: "Intermediate",
      matchScore: 65,
      imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800",
      stats: [4, 7, 5, 6, 5]
    },
    {
      id: "u3",
      name: "Elena Rodriguez",
      age: 29,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      location: "Austin, TX",
      bio: "Looking for chill campfire vibes and easy day hikes. Wine usually included.",
      campingStyle: "Car Camping",
      experienceLevel: "Beginner",
      matchScore: 88,
      imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
      stats: [2, 8, 3, 5, 7]
    }
  ];

  selectedCompanion: any = null;
  requestMessage = '';
  toastMessage = '';
  toastVisible = false;
  requestStatuses: Record<string, ConnectionStatus | null> = {};
  private subs: Subscription[] = [];

  constructor(private connectionService: ConnectionRequestService) {
    // Subscribe to status of each potential match
    this.potentialMatches.forEach(m => {
      const sub = this.connectionService.getStatusTo(m.id).subscribe(status => {
        this.requestStatuses[m.id] = status;
      });
      this.subs.push(sub);
    });
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  openMatchRadar(companion: any) {
    this.selectedCompanion = companion;
    this.requestMessage = '';
  }

  closeRadar() {
    this.selectedCompanion = null;
  }

  getStatusForSelected(): ConnectionStatus | null {
    return this.selectedCompanion ? (this.requestStatuses[this.selectedCompanion.id] ?? null) : null;
  }

  canSend(): boolean {
    const status = this.getStatusForSelected();
    return status === null || status === 'declined' || status === 'cancelled';
  }

  sendRequest() {
    if (!this.selectedCompanion || !this.canSend()) return;
    this.connectionService.sendRequest({
      toUserId: this.selectedCompanion.id,
      toUserName: this.selectedCompanion.name,
      toUserAvatar: this.selectedCompanion.avatar,
      campingStyle: this.selectedCompanion.campingStyle,
      experienceLevel: this.selectedCompanion.experienceLevel,
      matchScore: this.selectedCompanion.matchScore,
      message: this.requestMessage || undefined,
    });
    this.showToast(`Connection request sent to ${this.selectedCompanion.name}! 🎉`);
    this.closeRadar();
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}
