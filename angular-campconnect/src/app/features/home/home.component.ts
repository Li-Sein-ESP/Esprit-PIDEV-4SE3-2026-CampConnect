import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="overflow-hidden">
      <!-- Hero Section -->
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--color-background)]">
        <!-- Textured background layer -->
        <div class="absolute inset-0 opacity-[0.03]" [ngStyle]="{
          'background-image': 'repeating-linear-gradient(0deg, var(--color-primary-600) 0px, var(--color-primary-600) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--color-primary-600) 0px, var(--color-primary-600) 1px, transparent 1px, transparent 40px)'
        }"></div>

        <div class="container relative z-10 py-20">
          <div class="max-w-4xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-full px-4 py-2 mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-primary-600)]">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="text-sm font-medium text-[var(--color-text-secondary)]">
                Smart Outdoor Planning
              </span>
            </div>

            <!-- Heading -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-[var(--color-text-heading)]">
              Plan Your Next Camping Trip 
              <span class="text-[var(--color-primary-600)]">With Confidence</span>
            </h1>
            
            <!-- Description -->
            <p class="text-lg md:text-xl mb-10 text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Real campsite information, weather forecasts, gear planning, and safety compliance — everything you need in one place.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-12">
              <button class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium">
                Start Planning a Trip
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
              <button class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-light)] rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors font-medium">
                Browse Campsites
              </button>
            </div>

            <!-- Trust Indicators -->
            <div class="flex flex-wrap gap-6 text-sm text-[var(--color-text-tertiary)]">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-success-600)]">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
                Safety Verified
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-success-600)]">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
                Leave No Trace
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-success-600)]">
                  <circle cx="12" cy="8" r="6"></circle>
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
                Expert Guidance
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-20 bg-[var(--color-surface)]">
        <div class="container">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
            <div>
              <div class="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)] mb-2">2,500+</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Verified Campsites</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)] mb-2">100K+</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Trips Planned</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)] mb-2">500+</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Expert Guides</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)] mb-2">50K+</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Active Campers</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-[var(--color-primary-900)] text-white py-12">
        <div class="container">
          <div class="text-center text-sm text-gray-400">
            © 2026 CampConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  `,
    styles: []
})
export class HomeComponent {
    constructor(private router: Router) { }
}
