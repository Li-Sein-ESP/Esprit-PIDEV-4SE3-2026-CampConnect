import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fidelity-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Main Card -->
    <div class="relative w-full max-w-md overflow-hidden rounded-2xl shadow-xl transition-all duration-500"
         [ngClass]="getCardClasses()">
      
      <!-- Card Background Effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay"></div>
      <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
      
      <div class="relative p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-widest text-white/80">CampConnect</h3>
            <p class="text-2xl font-black text-white">{{ tier }} MEMBER</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span class="text-xl">🏆</span>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="mb-4">
          <div class="flex justify-between text-xs font-bold text-white mb-2">
            <span>Total Spend: {{ totalSpent | number:'1.2-2' }} TND</span>
            <span *ngIf="tier !== 'PLATINUM'">Next Tier: {{ nextTierThreshold }} TND</span>
          </div>
          
          <div class="h-3 w-full bg-black/20 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                 [style.width.%]="progressPercentage"></div>
          </div>
          
          <p class="mt-2 text-right text-xs font-bold text-white/90">
            <ng-container *ngIf="tier === 'PLATINUM'">
              Max tier reached
            </ng-container>
            <ng-container *ngIf="tier !== 'PLATINUM'">
              {{ remainingToNextTier | number:'1.2-2' }} TND to go
            </ng-container>
          </p>
        </div>

        <!-- Perks Section -->
        <div class="mt-6 pt-4 border-t border-white/20">
          <p class="text-xs font-bold text-white mb-2 uppercase tracking-wide">Current Perks:</p>
          <ul class="text-sm text-white/90 space-y-1">
            <li class="flex items-center gap-2">
              <span class="text-emerald-300">✓</span> {{ getDiscountText() }} Discount
            </li>
            <li *ngIf="tier === 'GOLD' || tier === 'PLATINUM'" class="flex items-center gap-2">
              <span class="text-emerald-300">✓</span> ✨ Free Delivery Unlocked
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Upgrade Modal Overlay -->
    <div *ngIf="showUpgradeModal" 
         class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-500">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
             [ngClass]="getCardClasses()">
          <span class="text-4xl">🎉</span>
        </div>
        
        <h2 class="text-3xl font-black text-slate-900 mb-2">Level Up!</h2>
        <p class="text-slate-500 mb-6">You've unlocked the <strong [ngClass]="getTextClasses()">{{ tier }}</strong> tier.</p>
        
        <div class="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Perks Unlocked:</p>
          <ul class="text-sm font-medium text-slate-700 space-y-2">
            <li>• {{ getDiscountText() }} on all rentals</li>
            <li *ngIf="tier === 'GOLD' || tier === 'PLATINUM'">• Free delivery on all orders</li>
          </ul>
        </div>

        <button (click)="dismissModal()" 
                class="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors">
          Awesome!
        </button>
      </div>
    </div>
  `
})
export class FidelityCardComponent implements OnInit, OnChanges {
  @Input() tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'BRONZE';
  @Input() totalSpent: number = 0;

  nextTierThreshold: number | null = null;
  progressPercentage: number = 0;
  remainingToNextTier: number = 0;

  showUpgradeModal = false;
  private autoDismissTimeout: any;

  private tierValues: Record<string, number> = {
    'BRONZE': 1,
    'SILVER': 2,
    'GOLD': 3,
    'PLATINUM': 4
  };

  ngOnInit() {
    this.calculateProgress();
    this.checkUpgrade();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tier'] || changes['totalSpent']) {
      this.calculateProgress();
      
      // If tier changes while component is active
      if (changes['tier'] && !changes['tier'].firstChange) {
        this.checkUpgrade();
      }
    }
  }

  calculateProgress() {
    if (this.tier === 'PLATINUM') {
      this.nextTierThreshold = null;
      this.progressPercentage = 100;
      this.remainingToNextTier = 0;
      return;
    }

    if (this.tier === 'BRONZE') this.nextTierThreshold = 500;
    else if (this.tier === 'SILVER') this.nextTierThreshold = 1000;
    else if (this.tier === 'GOLD') this.nextTierThreshold = 2000;

    if (this.nextTierThreshold) {
      this.remainingToNextTier = Math.max(0, this.nextTierThreshold - this.totalSpent);
      this.progressPercentage = Math.min(100, (this.totalSpent / this.nextTierThreshold) * 100);
    }
  }

  checkUpgrade() {
    const lastTierStr = localStorage.getItem('campconnect_last_tier') || 'BRONZE';
    const lastTierVal = this.tierValues[lastTierStr] || 1;
    const currentTierVal = this.tierValues[this.tier] || 1;

    if (currentTierVal > lastTierVal) {
      // Trigger Upgrade
      this.showUpgradeModal = true;
      
      // Auto dismiss after 3 seconds
      if (this.autoDismissTimeout) clearTimeout(this.autoDismissTimeout);
      this.autoDismissTimeout = setTimeout(() => {
        this.dismissModal();
      }, 3000);
    } else {
      // Just keep it synced
      localStorage.setItem('campconnect_last_tier', this.tier);
    }
  }

  dismissModal() {
    this.showUpgradeModal = false;
    localStorage.setItem('campconnect_last_tier', this.tier);
    if (this.autoDismissTimeout) {
      clearTimeout(this.autoDismissTimeout);
    }
  }

  getCardClasses(): string {
    switch (this.tier) {
      case 'BRONZE': return 'bg-amber-700';
      case 'SILVER': return 'bg-slate-400';
      case 'GOLD': return 'bg-yellow-500';
      case 'PLATINUM': return 'bg-slate-900';
      default: return 'bg-amber-700';
    }
  }

  getTextClasses(): string {
    switch (this.tier) {
      case 'BRONZE': return 'text-amber-700';
      case 'SILVER': return 'text-slate-400';
      case 'GOLD': return 'text-yellow-500';
      case 'PLATINUM': return 'text-slate-900';
      default: return 'text-amber-700';
    }
  }

  getDiscountText(): string {
    switch (this.tier) {
      case 'BRONZE': return '0%';
      case 'SILVER': return '5%';
      case 'GOLD': return '10%';
      case 'PLATINUM': return '15%';
      default: return '0%';
    }
  }
}
