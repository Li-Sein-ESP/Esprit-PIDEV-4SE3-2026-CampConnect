import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

      <!-- ✨ Companion Matching Feature Section -->
      <section class="py-16 relative overflow-hidden">
        <!-- Radial gradient background -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 60% 50%, rgba(34,197,94,0.08) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(16,185,129,0.06) 0%, transparent 50%), var(--color-background)"></div>
        <div class="container relative z-10">
          <div class="max-w-5xl mx-auto">
            <div class="grid md:grid-cols-2 gap-10 items-center">
              <!-- Left: Text -->
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-500 text-xs font-semibold mb-4">
                  <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style="animation: ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  NEW — AI-Powered Companion Matching
                </div>
                <h2 class="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)] mb-4 leading-tight">
                  Find Your Perfect
                  <span style="background: linear-gradient(135deg, #22c55e, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Camping Partner</span>
                </h2>
                <p class="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                  Our smart matching system pairs you with campers who share your style, pace, and passion. See your compatibility radar, send connection requests, and plan trips together.
                </p>
                <ul class="space-y-2.5 mb-8">
                  <li class="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                    <svg class="text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Compatibility Radar with match score
                  </li>
                  <li class="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                    <svg class="text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Filter by camping style, experience &amp; pace
                  </li>
                  <li class="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                    <svg class="text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Send &amp; manage connection requests
                  </li>
                </ul>
                <a routerLink="/companions" class="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg" style="background: linear-gradient(135deg, #22c55e, #10b981); box-shadow: 0 4px 20px rgba(34,197,94,0.35);">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Find My Companions
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>

              <!-- Right: Preview Cards -->
              <div class="relative">
                <!-- Glow backdrop -->
                <div class="absolute inset-0 rounded-2xl" style="background: radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%); filter: blur(20px);"></div>
                <div class="relative space-y-3">
                  <!-- Match card 1 -->
                  <div class="rounded-2xl p-4 flex items-center gap-4 border" style="background: var(--color-surface); border-color: rgba(34,197,94,0.2); backdrop-filter: blur(10px);">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style="background: linear-gradient(135deg, #22c55e, #16a34a);">S</div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-[var(--color-text-heading)] text-sm">Sophie M.</div>
                      <div class="text-xs text-[var(--color-text-tertiary)]">Hiking · Intermediate · Social</div>
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-lg font-bold" style="color: #22c55e;">94%</span>
                      <span class="text-xs text-[var(--color-text-tertiary)]">match</span>
                    </div>
                  </div>
                  <!-- Match card 2 -->
                  <div class="rounded-2xl p-4 flex items-center gap-4 border" style="background: var(--color-surface); border-color: rgba(34,197,94,0.15); backdrop-filter: blur(10px);">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style="background: linear-gradient(135deg, #10b981, #059669);">A</div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-[var(--color-text-heading)] text-sm">Alex K.</div>
                      <div class="text-xs text-[var(--color-text-tertiary)]">Backpacking · Expert · Solo-friendly</div>
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-lg font-bold" style="color: #10b981;">87%</span>
                      <span class="text-xs text-[var(--color-text-tertiary)]">match</span>
                    </div>
                  </div>
                  <!-- Match card 3 -->
                  <div class="rounded-2xl p-4 flex items-center gap-4 border" style="background: var(--color-surface); border-color: rgba(34,197,94,0.1); backdrop-filter: blur(10px);">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style="background: linear-gradient(135deg, #34d399, #22c55e);">R</div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-[var(--color-text-heading)] text-sm">Rania B.</div>
                      <div class="text-xs text-[var(--color-text-tertiary)]">Car Camping · Beginner · Family</div>
                    </div>
                    <div class="flex flex-col items-center">
                      <span class="text-lg font-bold" style="color: #22c55e;">82%</span>
                      <span class="text-xs text-[var(--color-text-tertiary)]">match</span>
                    </div>
                  </div>
                  <!-- CTA inline -->
                  <a routerLink="/companions" class="block text-center text-xs font-medium py-2 rounded-xl border transition-colors" style="border-color: rgba(34,197,94,0.3); color: #22c55e;" onmouseover="this.style.background='rgba(34,197,94,0.08)'" onmouseout="this.style.background='transparent'">
                    See all matches →
                  </a>
                </div>
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
