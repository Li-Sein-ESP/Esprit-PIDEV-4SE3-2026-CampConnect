import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus, Thermometer, Cloud, CloudRain, Users, Calendar, Leaf, Info, AlertTriangle } from 'lucide-angular';
import { DynamicPricingService, PricingFactors } from '../../../core/services/dynamic-pricing.service';

@Component({
  selector: 'app-dynamic-price',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
           [class.bg-emerald-50]="pricing?.priceDirection === 'DOWN'"
           [class.bg-red-50]="pricing?.priceDirection === 'UP'"
           [class.bg-gray-50]="pricing?.priceDirection === 'STABLE' || !pricing">
        <span class="text-sm font-bold uppercase tracking-wide text-gray-500">Dynamic Price</span>
        <div *ngIf="pricing" class="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
             [class.bg-emerald-100]="pricing.priceDirection === 'DOWN'"
             [class.text-emerald-700]="pricing.priceDirection === 'DOWN'"
             [class.bg-red-100]="pricing.priceDirection === 'UP'"
             [class.text-red-700]="pricing.priceDirection === 'UP'"
             [class.bg-gray-200]="pricing.priceDirection === 'STABLE'"
             [class.text-gray-600]="pricing.priceDirection === 'STABLE'">
          <lucide-icon [name]="pricing.priceDirection === 'UP' ? TrendingUp : pricing.priceDirection === 'DOWN' ? TrendingDown : Minus" class="w-3.5 h-3.5"></lucide-icon>
          {{ pricing.priceDirection === 'UP' ? 'Demand High' : pricing.priceDirection === 'DOWN' ? 'Best Deal' : 'Stable' }}
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="px-5 py-6 text-center text-gray-400 text-sm">
        <div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Calculating live price...
      </div>

      <!-- Pricing Content -->
      <div *ngIf="!isLoading && pricing" class="px-5 py-4 space-y-4">

        <!-- Price Display -->
        <div class="flex items-end justify-between">
          <div>
            <div class="text-3xl font-extrabold text-gray-900">
              {{ pricing.dynamicPrice | number:'1.2-2' }}
              <span class="text-base font-bold text-gray-500">TND</span>
            </div>
            <div class="text-xs text-gray-400 mt-0.5">/ night · updated live</div>
          </div>
          <div *ngIf="pricing.savingsOrSurcharge !== 0" class="text-right">
            <div class="text-sm font-bold"
                 [class.text-emerald-600]="pricing.savingsOrSurcharge < 0"
                 [class.text-red-500]="pricing.savingsOrSurcharge > 0">
              {{ pricing.savingsOrSurcharge > 0 ? '+' : '' }}{{ pricing.savingsOrSurcharge | number:'1.2-2' }} TND
            </div>
            <div class="text-xs text-gray-400">vs base price</div>
          </div>
        </div>

        <!-- Factors Breakdown -->
        <div class="space-y-2.5 pt-2 border-t border-gray-100">
          <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Price Factors</div>

          <!-- Occupancy -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <lucide-icon [name]="Users" class="w-4 h-4 text-blue-500"></lucide-icon>
              <span>Occupancy</span>
              <span class="text-xs text-gray-400">({{ (pricing.occupancyRate * 100) | number:'1.0-0' }}%)</span>
            </div>
            <span class="font-bold text-xs px-2 py-0.5 rounded-full"
                  [class.bg-red-100]="pricing.occupancyMultiplier > 1.1"
                  [class.text-red-700]="pricing.occupancyMultiplier > 1.1"
                  [class.bg-emerald-100]="pricing.occupancyMultiplier < 0.95"
                  [class.text-emerald-700]="pricing.occupancyMultiplier < 0.95"
                  [class.bg-gray-100]="pricing.occupancyMultiplier >= 0.95 && pricing.occupancyMultiplier <= 1.1"
                  [class.text-gray-600]="pricing.occupancyMultiplier >= 0.95 && pricing.occupancyMultiplier <= 1.1">
              ×{{ pricing.occupancyMultiplier | number:'1.2-2' }}
            </span>
          </div>

          <!-- Season -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <lucide-icon [name]="Calendar" class="w-4 h-4 text-purple-500"></lucide-icon>
              <span>{{ pricing.seasonLabel }}</span>
            </div>
            <span class="font-bold text-xs px-2 py-0.5 rounded-full"
                  [class.bg-red-100]="pricing.seasonMultiplier > 1.1"
                  [class.text-red-700]="pricing.seasonMultiplier > 1.1"
                  [class.bg-emerald-100]="pricing.seasonMultiplier < 0.95"
                  [class.text-emerald-700]="pricing.seasonMultiplier < 0.95"
                  [class.bg-gray-100]="pricing.seasonMultiplier >= 0.95 && pricing.seasonMultiplier <= 1.1"
                  [class.text-gray-600]="pricing.seasonMultiplier >= 0.95 && pricing.seasonMultiplier <= 1.1">
              ×{{ pricing.seasonMultiplier | number:'1.2-2' }}
            </span>
          </div>

          <!-- Weather -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <lucide-icon [name]="pricing.precipitation > 5 ? CloudRain : pricing.temperatureMax > 35 ? Thermometer : Cloud"
                class="w-4 h-4 text-sky-500"></lucide-icon>
              <span>Weather</span>
              <span class="text-xs text-gray-400">({{ pricing.temperatureMax | number:'1.0-0' }}°C)</span>
            </div>
            <span class="font-bold text-xs px-2 py-0.5 rounded-full"
                  [class.bg-red-100]="pricing.weatherMultiplier > 1.1"
                  [class.text-red-700]="pricing.weatherMultiplier > 1.1"
                  [class.bg-emerald-100]="pricing.weatherMultiplier < 0.95"
                  [class.text-emerald-700]="pricing.weatherMultiplier < 0.95"
                  [class.bg-gray-100]="pricing.weatherMultiplier >= 0.95 && pricing.weatherMultiplier <= 1.1"
                  [class.text-gray-600]="pricing.weatherMultiplier >= 0.95 && pricing.weatherMultiplier <= 1.1">
              ×{{ pricing.weatherMultiplier | number:'1.2-2' }}
            </span>
          </div>

          <!-- Environmental -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <lucide-icon [name]="pricing.activeEnvironmentalRules > 0 ? AlertTriangle : Leaf"
                class="w-4 h-4"
                [class.text-orange-500]="pricing.activeEnvironmentalRules > 0"
                [class.text-emerald-500]="pricing.activeEnvironmentalRules === 0"></lucide-icon>
              <span>Env. Rules</span>
              <span *ngIf="pricing.activeEnvironmentalRules > 0" class="text-xs text-gray-400">({{ pricing.activeEnvironmentalRules }} active)</span>
            </div>
            <span class="font-bold text-xs px-2 py-0.5 rounded-full"
                  [class.bg-emerald-100]="pricing.environmentalMultiplier < 0.95"
                  [class.text-emerald-700]="pricing.environmentalMultiplier < 0.95"
                  [class.bg-gray-100]="pricing.environmentalMultiplier >= 0.95"
                  [class.text-gray-600]="pricing.environmentalMultiplier >= 0.95">
              ×{{ pricing.environmentalMultiplier | number:'1.2-2' }}
            </span>
          </div>
        </div>

        <!-- Transparency Note -->
        <div class="flex items-start gap-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
          <lucide-icon [name]="Info" class="w-3.5 h-3.5 shrink-0 mt-0.5"></lucide-icon>
          <span>Price calculated live from demand, season, weather & environmental data. Base: {{ pricing.basePrice }} TND/night.</span>
        </div>
      </div>

      <!-- Error / No Data -->
      <div *ngIf="!isLoading && !pricing" class="px-5 py-4 text-sm text-gray-400 text-center">
        Live pricing unavailable. Showing base price.
      </div>
    </div>
  `
})
export class DynamicPriceComponent implements OnInit {
  @Input() campsiteId!: string;

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly Thermometer = Thermometer;
  readonly Cloud = Cloud;
  readonly CloudRain = CloudRain;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly Leaf = Leaf;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;

  pricing: PricingFactors | null = null;
  isLoading = true;

  constructor(private pricingService: DynamicPricingService) {}

  ngOnInit(): void {
    if (!this.campsiteId) { this.isLoading = false; return; }
    this.pricingService.getPricingFactors(this.campsiteId).subscribe(data => {
      this.pricing = data;
      this.isLoading = false;
    });
  }
}
