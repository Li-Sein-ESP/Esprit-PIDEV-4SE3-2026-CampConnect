import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Tent, Mail, Lock, User as UserIcon, UserPlus } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border-light)] relative overflow-hidden"
             style="box-shadow: 0 20px 25px -5px rgba(42, 42, 42, 0.1), 0 8px 10px -6px rgba(42, 42, 42, 0.05)">
          
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl"></div>
          
          <div class="relative">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-light)] rounded-2xl mb-4 text-[var(--color-primary)]">
                <lucide-icon [name]="TentIcon" size="32"></lucide-icon>
              </div>
              <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">Create Account</h1>
              <p class="text-[var(--color-text-secondary)]">Start planning your outdoor adventures</p>
            </div>

            <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              {{ errorMessage }}
            </div>

            <form (ngSubmit)="handleSubmit()" class="space-y-5">
              <div>
                <label for="name" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Full Name</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [name]="UserIconRef" size="20"></lucide-icon>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    [(ngModel)]="name"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label for="username" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Username</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [name]="UserIconRef" size="20"></lucide-icon>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    [(ngModel)]="username"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="johndoe123"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Email Address</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [name]="MailIcon" size="20"></lucide-icon>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    [(ngModel)]="email"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Password</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [name]="LockIcon" size="20"></lucide-icon>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    [(ngModel)]="password"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div class="flex items-start gap-3 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="agreeToTerms"
                  [(ngModel)]="agreeToTerms"
                  required
                  class="mt-1 w-4 h-4 text-[var(--color-primary)] border-[var(--color-border-light)] rounded focus:ring-[var(--color-primary)]"
                />
                <label for="terms" class="text-sm text-[var(--color-text-secondary)] leading-snug">
                  I agree to the <a href="#" class="text-[var(--color-primary)] font-bold hover:underline">Terms of Service</a> and 
                  <a href="#" class="text-[var(--color-primary)] font-bold hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                [disabled]="isLoading || !name || !username || !email || !password || !agreeToTerms"
                class="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl shadow-lg shadow-[var(--color-primary-light)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <lucide-icon *ngIf="!isLoading" [name]="UserPlusIcon" size="20" class="group-hover:scale-110 transition-transform"></lucide-icon>
                <div *ngIf="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ isLoading ? 'Creating account...' : 'Create Account' }}
              </button>
            </form>

            <p class="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              Already have an account? 
              <a routerLink="/login" class="font-bold text-[var(--color-primary)] hover:underline">Sign in instead</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: var(--color-bg-primary); }
  `]
})
export class SignupComponent {
  TentIcon = Tent;
  MailIcon = Mail;
  LockIcon = Lock;
  UserIconRef = UserIcon;
  UserPlusIcon = UserPlus;

  name = '';
  username = '';
  email = '';
  password = '';
  agreeToTerms = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  handleSubmit(): void {
    if (!this.name || !this.username || !this.email || !this.password || !this.agreeToTerms) return;

    this.isLoading = true;
    this.errorMessage = '';

    const signupData = {
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password,
      role: ['user'] // Setting default role
    };

    this.authService.signup(signupData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Registration successful:', response);
        // On success, redirect to login so they can sign in
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Registration failed:', err);
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
