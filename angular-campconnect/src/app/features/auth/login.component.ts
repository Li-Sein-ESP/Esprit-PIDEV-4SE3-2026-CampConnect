import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

import { LucideAngularModule, Mail, Lock, Eye, EyeOff, Tent } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Immersive Outdoor Visual -->
      <div class="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        <!-- Background Image -->
        <div 
          class="absolute inset-0 bg-cover bg-center"
          style="background-image: url('https://images.unsplash.com/photo-1536003033612-307626513587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')"
        ></div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#2F4F3E]/80 via-[#2F4F3E]/60 to-[#1a1f1d]/70"></div>
        
        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 text-white">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <lucide-icon [img]="TentIcon" [size]="24" class="text-white"></lucide-icon>
            </div>
            <span class="text-2xl font-bold">CampConnect</span>
          </div>

          <!-- Quote -->
          <div>
            <h2 class="text-4xl font-bold mb-4 text-white">
              Your Adventure Awaits
            </h2>
            <p class="text-xl text-white/90 max-w-md">
              Connect with nature, discover hidden campsites, and build memories that last a lifetime.
            </p>
          </div>

          <!-- Footer -->
          <div class="text-sm text-white/60">
            © 2026 CampConnect. All rights reserved.
          </div>
        </div>
      </div>

      <!-- Right Side - Authentication Card -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--color-background)]">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center">
              <lucide-icon [img]="TentIcon" [size]="24" class="text-white"></lucide-icon>
            </div>
            <span class="text-2xl font-bold text-[var(--color-text-heading)]">CampConnect</span>
          </div>

          <!-- Authentication Card -->
          <div 
            class="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border-light)]"
            style="box-shadow: 0 20px 25px -5px rgba(42, 42, 42, 0.1), 0 8px 10px -6px rgba(42, 42, 42, 0.05)"
          >
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
                Welcome Back
              </h1>
              <p class="text-[var(--color-text-secondary)]">
                Sign in to continue your outdoor adventure
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage }}
            </div>

            <!-- Form -->
            <form (ngSubmit)="handleSubmit()" class="space-y-5">
              <!-- Email Input -->
              <div>
                <label 
                  for="email" 
                  class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                >
                  Username
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="MailIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="username"
                    [(ngModel)]="username"
                    name="username"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <!-- Password Input -->
              <div>
                <label 
                  for="password" 
                  class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                >
                  Password
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="LockIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    placeholder="Enter your password"
                    [(ngModel)]="password"
                    name="password"
                    class="w-full px-4 py-2.5 pl-11 pr-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    <lucide-icon *ngIf="showPassword" [img]="EyeOffIcon" [size]="20"></lucide-icon>
                    <lucide-icon *ngIf="!showPassword" [img]="EyeIcon" [size]="20"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="rememberMe"
                    name="rememberMe"
                    class="w-4 h-4 rounded border-[var(--color-border-medium)] text-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-0"
                  />
                  <span class="text-sm text-[var(--color-text-secondary)]">
                    Remember me
                  </span>
                </label>
                <a 
                  routerLink="/forgot-password"
                  class="text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium text-base min-h-[48px] disabled:opacity-50"
              >
                {{ isLoading ? 'Signing In...' : 'Sign In' }}
              </button>
            </form>

            <!-- Sign Up Link -->
            <div class="mt-6 text-center">
              <p class="text-sm text-[var(--color-text-secondary)]">
                Don't have an account? 
                <a 
                  routerLink="/signup"
                  class="text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] font-medium transition-colors"
                >
                  Sign up for free
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
export class LoginComponent {
  TentIcon = Tent;
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  showPassword = false;
  username = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) { }

  handleSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (this.authService.hasRole('admin')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}
