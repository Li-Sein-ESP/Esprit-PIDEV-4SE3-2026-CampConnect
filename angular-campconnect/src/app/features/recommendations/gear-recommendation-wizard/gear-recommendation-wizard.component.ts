import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GearRecommendationService } from '../../../core/services/gear-recommendation.service';
import { CartApiService } from '../../gear/services/cart-api.service';
import {
  GearRecommendationRequest,
  GearCategoryResult,
  GearCategoryRecommendation,
  GearRecommendationResult,
  GearSuggestion,
  RecommendedGearGroup
} from '../../../core/models/gear-recommendation.models';
import { CartRequest } from '../../gear/models/cart.model';

@Component({
  selector: 'app-gear-recommendation-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gear-recommendation-wizard.component.html',
  styleUrls: ['./gear-recommendation-wizard.component.scss']
})
export class GearRecommendationWizardComponent {
  @Output() closed = new EventEmitter<void>();

  // Steps: 1=form, 2=loading, 3=category checklist, 4=marketplace items
  currentStep = 1;
  loading = false;
  itemsLoading = false;
  errorMessage: string | null = null;

  // Step 1 form
  destination = '';
  startDate = '';
  endDate = '';
  groupSize = 2;
  budget: number | null = null;
  activity = 'hiking';
  experienceLevel = 'beginner';

  // Step 3 — category results from ML
  categoryResult: GearCategoryResult | null = null;

  // Step 4 — marketplace items
  itemsResult: GearRecommendationResult | null = null;
  addedToCart: Set<string> = new Set();
  budgetUsed = 0;

  // Saved payload for phase 2
  private savedPayload: GearRecommendationRequest | null = null;

  destinations = [
    'Ain Draham', 'Zaghouan', 'Jugurtha Plateau', 'Chambi Mountain', 'Kesra', 'Bargou',
    'Siliana Forest', 'Makthar', 'Le Kef', 'Bou Hedma', 'Orbata Mountain',
    'Feija National Park', 'Bellif Forest', 'Tabarka Forest', 'Nefza Forest', 'Sejnane',
    'Kroumirie Forest', 'Beja Forest', 'Jendouba Forest',
    'Djerba', 'Hammamet', 'Sousse Beach', 'Bizerte Beach', 'Tabarka Beach', 'Kelibia',
    'Nabeul Beach', 'Zarzis', 'Mahdia Beach', 'Sfax Coast', 'Ghar El Melh',
    'Douz', 'Ksar Ghilane', 'Tozeur', 'Nefta', 'Chott El Jerid', 'Matmata',
    'Tataouine', 'Remada', 'Borj El Khadra', 'Kebili', 'Medenine Oasis',
    'Ichkeul Lake', 'Bizerte Lake', 'Tunis Lake', 'Remel Lake', 'Sidi Salem Dam',
    'Nebhana Dam', 'Sejnane Dam'
  ];

  activities = [
    'hiking', 'survival', 'relaxing', 'photography', 'fishing',
    'cycling', 'birdwatching', 'stargazing', 'cultural_tour', 'watersports'
  ];

  experienceLevels = ['beginner', 'intermediate', 'expert'];

  terrainIcons: Record<string, string> = {
    mountain: '\u{1F3D4}\uFE0F',
    forest: '\u{1F332}',
    beach: '\u{1F3D6}\uFE0F',
    desert: '\u{1F3DC}\uFE0F',
    lake: '\u{1F3DE}\uFE0F'
  };

  constructor(
    private recService: GearRecommendationService,
    private cartApi: CartApiService
  ) {}

  get essentials(): GearCategoryRecommendation[] {
    return this.categoryResult?.recommendations.filter(r => r.priority === 'essential') || [];
  }

  get recommended(): GearCategoryRecommendation[] {
    return this.categoryResult?.recommendations.filter(r => r.priority === 'recommended') || [];
  }

  get optional(): GearCategoryRecommendation[] {
    return this.categoryResult?.recommendations.filter(r => r.priority === 'optional') || [];
  }

  get budgetRemaining(): number | null {
    if (this.budget == null) return null;
    return Math.max(0, this.budget - this.budgetUsed);
  }

  get essentialGroup(): RecommendedGearGroup | undefined {
    return this.itemsResult?.groups.find(g => g.priority === 'essential');
  }

  close(): void {
    this.closed.emit();
  }

  submitForm(): void {
    if (!this.destination || !this.startDate || !this.endDate) {
      this.errorMessage = 'Please fill in destination, start date, and end date.';
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    if (end <= start) {
      this.errorMessage = 'End date must be after start date.';
      return;
    }

    this.errorMessage = null;
    this.currentStep = 2;
    this.loading = true;

    const month = start.getMonth() + 1;
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    this.savedPayload = {
      destination: this.destination,
      month,
      durationDays,
      groupSize: this.groupSize,
      activity: this.activity,
      experienceLevel: this.experienceLevel,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget ?? undefined
    };

    // Phase 1: get category recommendations from ML
    this.recService.getCategories(this.savedPayload).subscribe({
      next: (res) => {
        this.categoryResult = res;
        this.loading = false;
        this.currentStep = 3;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || err?.error?.message || err?.message || 'Failed to get recommendations. Please try again.';
        this.currentStep = 1;
      }
    });
  }

  /** Phase 2: camper wants to browse actual items from the marketplace */
  browseItems(): void {
    if (!this.savedPayload) return;
    this.itemsLoading = true;
    this.currentStep = 4;

    this.recService.getMatchingItems(this.savedPayload).subscribe({
      next: (res) => {
        this.itemsResult = res;
        this.itemsLoading = false;
      },
      error: (err) => {
        this.itemsLoading = false;
        this.errorMessage = err?.error?.error || 'Failed to load matching items.';
      }
    });
  }

  backToChecklist(): void {
    this.currentStep = 3;
    this.itemsResult = null;
    this.errorMessage = null;
  }

  addToCart(item: GearSuggestion): void {
    if (this.addedToCart.has(item.gearId)) return;

    const request: CartRequest = {
      gearId: item.gearId,
      itemType: 'RENT',
      quantity: 1,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.cartApi.addToCart(request).subscribe({
      next: () => {
        this.addedToCart.add(item.gearId);
        this.budgetUsed += item.pricePerDay * this.getDurationDays();
      },
      error: () => {}
    });
  }

  addAllEssential(): void {
    const essentials = this.essentialGroup;
    if (!essentials) return;
    essentials.items.forEach(item => {
      if (!this.addedToCart.has(item.gearId) && item.availableForDates) {
        this.addToCart(item);
      }
    });
  }

  addFullKit(): void {
    if (!this.itemsResult) return;
    for (const group of this.itemsResult.groups) {
      for (const item of group.items) {
        if (!this.addedToCart.has(item.gearId) && item.availableForDates) {
          this.addToCart(item);
        }
      }
    }
  }

  startOver(): void {
    this.currentStep = 1;
    this.categoryResult = null;
    this.itemsResult = null;
    this.errorMessage = null;
    this.addedToCart.clear();
    this.budgetUsed = 0;
    this.savedPayload = null;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      tent: '\u{26FA}',
      sleeping_bag: '\u{1F6CF}\uFE0F',
      backpack: '\u{1F392}',
      stove: '\u{1F525}',
      first_aid_kit: '\u{1FA79}',
      rain_jacket: '\u{1F9E5}',
      lantern: '\u{1F4A1}',
      cooler: '\u{1F9CA}',
      hammock: '\u{1FA78}',
      trekking_pole: '\u{1F9AF}'
    };
    return icons[category] || '\u{1F3D5}\uFE0F';
  }

  formatCategory(category: string): string {
    return category.replace(/_/g, ' ');
  }

  private getDurationDays(): number {
    if (!this.startDate || !this.endDate) return 1;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
