import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Target, MapPin, Send, CheckCircle, Clock, X, Tent } from 'lucide-angular';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { RadarChart } from '../../../shared/components/radar-chart/radar-chart';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { TripIntentService } from '../../trip-intents/services/trip-intent.service';
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';
import { TripIntent, CampingStyle, ExperienceLevel, TripIntentStatus } from '../../trip-intents/models/trip-intent.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-companion-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CardComponent, CardContentComponent, BadgeComponent, RadarChart],
  templateUrl: './companion-discovery.html',
  styleUrl: './companion-discovery.css'
})
export class CompanionDiscovery implements OnInit, OnDestroy {
  readonly Target = Target;
  readonly MapPin = MapPin;
  readonly Send = Send;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly XList = X;
  readonly Tent = Tent;

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
  myTripIntents: TripIntent[] = [];
  selectedTripIntentId: string = '';
  requestMessage = '';
  toastMessage = '';
  toastVisible = false;

  requestStatuses: Record<string, string | null> = {};
  private subs: Subscription[] = [];

  constructor(
    private inviteService: GroupInviteService,
    private tripIntentService: TripIntentService,
    private groupService: GroupService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      const userId = user?.id;
      if (userId) {
        this.tripIntentService.getIntentsByCreator(userId).subscribe({
          next: (intents: TripIntent[]) => {
            this.myTripIntents = intents.filter(i => i.status === TripIntentStatus.OPEN as any);
            if (this.myTripIntents.length > 0) {
              this.selectedTripIntentId = this.myTripIntents[0].id;
            }
          },
          error: () => this.handleIntentError()
        });
      } else {
        this.handleIntentError();
      }
    });
  }

  private handleIntentError() {
    this.myTripIntents = [
      {
        id: 'mock-trip-1',
        creatorUserId: 'me',
        title: 'Expédition Atlas Nature',
        dateFrom: '2026-05-15',
        dateTo: '2026-05-20',
        budgetMax: 2500,
        campingStyle: CampingStyle.BACKPACKING,
        experienceLevel: ExperienceLevel.ADVANCED,
        preferredZone: 'Haut Atlas',
        status: TripIntentStatus.OPEN,
        createdAt: new Date().toISOString()
      }
    ];
    if (this.myTripIntents.length > 0) {
      this.selectedTripIntentId = this.myTripIntents[0].id;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  openMatchRadar(companion: any) {
    this.selectedCompanion = companion;
    this.requestMessage = '';
  }

  closeRadar() {
    this.selectedCompanion = null;
  }

  getStatusForSelected(): string | null {
    return this.selectedCompanion ? (this.requestStatuses[this.selectedCompanion.id] ?? null) : null;
  }

  canSend(): boolean {
    const status = this.getStatusForSelected();
    return status === null || status === 'DECLINED' || status === 'CANCELLED';
  }

  sendRequest() {
    if (!this.selectedCompanion || !this.canSend() || !this.selectedTripIntentId) {
      if (!this.selectedTripIntentId) {
        this.showToast('Veuillez créer d\'abord un projet de voyage !');
      }
      return;
    }

    this.authService.getCurrentUser().subscribe(user => {
      const myId = user?.id;
      if (!myId) return;

      this.groupService.getMyGroups(myId).subscribe({
        next: (groups) => {
          const matchedGroup = groups.find(g => g.tripId === this.selectedTripIntentId);
          const groupId = matchedGroup ? matchedGroup.id : undefined;

          this.inviteService.sendInvite({
            tripIntentId: this.selectedTripIntentId,
            groupId: groupId, // Attach the retrieved group ID
            toUserId: this.selectedCompanion.id,
            message: this.requestMessage || undefined,
            fromUserId: myId
          } as any).subscribe({
            next: () => {
              this.requestStatuses[this.selectedCompanion.id] = 'PENDING';
              this.showToast(`Invitation envoyée à ${this.selectedCompanion.name} ! 🎉`);
              this.closeRadar();
            },
            error: (err: any) => {
              console.error('Error sending invite', err);
              this.showToast('Erreur lors de l\'envoi.');
            }
          });
        },
        error: () => {
          this.showToast('Erreur lors de la récupération du groupe.');
        }
      });
    });
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}
