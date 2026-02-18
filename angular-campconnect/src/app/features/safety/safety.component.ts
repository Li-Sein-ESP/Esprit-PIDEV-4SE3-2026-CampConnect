import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Phone, Shield, Cloud, Wind, Droplets, AlertTriangle, MapPin } from 'lucide-angular';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card.component';
import { AlertComponent } from '../../shared/components/alert.component';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    AlertComponent
  ],
  template: `
  <div class="min-h-screen bg-[var(--color-background)] pb-12">
    <div class="bg-gradient-to-br from-red-600 to-orange-600 text-white py-16">
      <div class="container">
        <div class="max-w-3xl">
          <h1 class="mb-4 text-white"> Safety & Emergency Information </h1>
            <p class="text-xl text-white/90">
              Stay safe in the wilderness. Essential guidelines, emergency contacts, and real-time alerts.
            </p>
        </div>
      </div>
    </div>

    <div class="container py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <app-alert type="warning">
            <strong>Weather Alert: </strong> Severe thunderstorms expected in the Sierra Nevada region. Avoid high elevations.
          </app-alert>

          <app-card variant="elevated">
            <app-card-header>
              <app-card-title customClass="flex items-center gap-2">
                <lucide-icon [img]="Shield" class="w-5 h-5"></lucide-icon>
                Essential Safety Guidelines
              </app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div *ngFor="let guideline of guidelines">
                  <h6 class="mb-2">{{ guideline.title }}</h6>
                  <p class="text-sm text-[var(--color-text-secondary)]">{{ guideline.description }}</p>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <app-card variant="elevated">
            <app-card-header>
              <app-card-title customClass="flex items-center gap-2">
                <lucide-icon [img]="Cloud" class="w-5 h-5"></lucide-icon>
                Weather Conditions
              </app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-[var(--color-neutral-50)] rounded-lg">
                  <lucide-icon [img]="Cloud" class="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)]"></lucide-icon>
                  <div class="text-2xl font-bold">72°F</div>
                  <div class="text-sm text-[var(--color-text-tertiary)]">Partly Cloudy</div>
                </div>
                <div class="text-center p-4 bg-[var(--color-neutral-50)] rounded-lg">
                  <lucide-icon [img]="Wind" class="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)]"></lucide-icon>
                  <div class="text-2xl font-bold">12 mph</div>
                  <div class="text-sm text-[var(--color-text-tertiary)]">Wind Speed</div>
                </div>
                <div class="text-center p-4 bg-[var(--color-neutral-50)] rounded-lg">
                  <lucide-icon [img]="Droplets" class="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)]"></lucide-icon>
                  <div class="text-2xl font-bold">45%</div>
                  <div class="text-sm text-[var(--color-text-tertiary)]">Humidity</div>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <div class="lg:col-span-1">
          <app-card variant="elevated" customClass="bg-red-50 border-red-200">
            <app-card-header>
              <app-card-title customClass="flex items-center gap-2 text-red-900">
                <lucide-icon [img]="Phone" class="w-5 h-5"></lucide-icon>
                Emergency Contacts
              </app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div *ngFor="let contact of emergencyContacts">
                  <div class="font-medium text-red-900">{{ contact.name }}</div>
                  <div class="text-sm text-red-700">{{ contact.number }}</div>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </div>
    </div>
  </div>
    `,
  styles: [`
    :host {
  display: block;
}
`]
})
export class SafetyComponent {
  readonly AlertTriangle = AlertTriangle;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Shield = Shield;
  readonly Cloud = Cloud;
  readonly Wind = Wind;
  readonly Droplets = Droplets;

  guidelines = [
    {
      title: 'Always Tell Someone Your Plans',
      description: 'Share your itinerary, expected return time, and emergency contacts with a trusted person before heading out.'
    },
    {
      title: 'Check Weather Conditions',
      description: 'Monitor weather forecasts and be prepared to change plans if conditions become dangerous.'
    },
    {
      title: 'Carry Essential Safety Gear',
      description: 'First aid kit, emergency shelter, fire starter, navigation tools, and extra food/water are must-haves.'
    },
    {
      title: 'Know Your Limits',
      description: 'Choose trails and activities appropriate for your fitness level and experience.'
    }
  ];

  emergencyContacts = [
    { name: 'Emergency Services', number: '911' },
    { name: 'Park Rangers', number: '1-800-RANGERS' },
    { name: 'Search & Rescue', number: '1-800-SAR-HELP' },
    { name: 'Poison Control', number: '1-800-222-1222' }
  ];
}
