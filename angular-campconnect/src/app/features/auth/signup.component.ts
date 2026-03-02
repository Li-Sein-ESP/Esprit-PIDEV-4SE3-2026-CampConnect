import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, User as UserIcon, Tent } from 'lucide-angular';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Visual -->
      <div class="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        <div 
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-br from-[#2F4F3E]/80 via-[#2F4F3E]/60 to-[#1a1f1d]/70"></div>
        
        <div class="relative z-10 flex flex-col justify-between p-12 text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <lucide-icon [img]="TentIcon" [size]="24" class="text-white"></lucide-icon>
            </div>
            <span class="text-2xl font-bold">CampConnect</span>
          </div>

          <div>
            <h2 class="text-4xl font-bold mb-4 text-white">
              Start Your Journey
            </h2>
            <p class="text-xl text-white/90 max-w-md">
              Join thousands of outdoor enthusiasts planning their next adventure.
            </p>
          </div>

          <div class="text-sm text-white/60">
            © 2026 CampConnect. All rights reserved.
          </div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--color-background)]">
        <div class="w-full max-w-md">
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center">
              <lucide-icon [img]="TentIcon" [size]="24" class="text-white"></lucide-icon>
            </div>
            <span class="text-2xl font-bold text-[var(--color-text-heading)]">CampConnect</span>
          </div>

          <div 
            class="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border-light)]"
            style="box-shadow: 0 20px 25px -5px rgba(42, 42, 42, 0.1), 0 8px 10px -6px rgba(42, 42, 42, 0.05)"
          >
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
                Create Account
              </h1>
              <p class="text-[var(--color-text-secondary)]">
                Sign up to start planning your outdoor adventures
              </p>
            </div>

            <form (ngSubmit)="handleSubmit()" class="space-y-5">
              <div>
                <label for="name" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Full Name
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="UserIconRef" [size]="20"></lucide-icon>
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    [(ngModel)]="name"
                    name="name"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="MailIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    [(ngModel)]="email"
                    name="email"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Password
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="LockIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    [(ngModel)]="password"
                    name="password"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div class="flex items-start gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="agreeToTerms"
                  name="agreeToTerms"
                  class="w-4 h-4 mt-1 rounded border-[var(--color-border-medium)] text-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-0"
                  required
                />
                <label class="text-sm text-[var(--color-text-secondary)]">
                  I agree to the <a href="#" class="text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]">Terms of Service</a> and <a href="#" class="text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                class="w-full px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium text-base min-h-[48px]"
              >
                Create Account
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-[var(--color-text-secondary)]">
                Already have an account? 
                <a 
                  routerLink="/login"
                  class="text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-medium transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class SignupComponent {
    TentIcon = Tent;
    MailIcon = Mail;
    LockIcon = Lock;
    UserIconRef = UserIcon;

    name = '';
    email = '';
    password = '';
    agreeToTerms = false;

    constructor(private router: Router) { }

    handleSubmit(): void {
        console.log('Signup attempt:', { name: this.name, email: this.email, password: this.password });
        this.router.navigate(['/dashboard']);
    }
}
