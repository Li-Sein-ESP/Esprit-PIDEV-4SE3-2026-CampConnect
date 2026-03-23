import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Tent, Mail, Lock, LogIn } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border-light)] relative overflow-hidden"
             style="box-shadow: 0 20px 25px -5px rgba(42, 42, 42, 0.1), 0 8px 10px -6px rgba(42, 42, 42, 0.05)">
          
          <!-- Background Decoration -->
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl"></div>
          
          <!-- Content -->
          <div class="relative">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary-light)] rounded-2xl mb-4 text-[var(--color-primary)]">
                <lucide-icon [name]="TentIcon" size="32"></lucide-icon>
              </div>
              <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">Welcome Back</h1>
              <p class="text-[var(--color-text-secondary)]">Sign in to continue your outdoor adventure</p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              {{ errorMessage }}
            </div>

            <!-- Form -->
            <form (ngSubmit)="handleSubmit()" class="space-y-6">
              <div>
                <label for="username" class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Username or Email</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [name]="MailIcon" size="20"></lucide-icon>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    [(ngModel)]="username"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="password" class="block text-sm font-medium text-[var(--color-text-primary)]">Password</label>
                  <a routerLink="/forgot-password" class="text-xs font-semibold text-[var(--color-primary)] hover:underline">Forgot?</a>
                </div>
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
                    class="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  class="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border-light)] rounded focus:ring-[var(--color-primary)]"
                />
                <label for="remember" class="ml-2 text-sm text-[var(--color-text-secondary)]">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                [disabled]="isLoading || !username || !password"
                class="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl shadow-lg shadow-[var(--color-primary-light)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <lucide-icon *ngIf="!isLoading" [name]="LogInIcon" size="20" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
                <div *ngIf="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <!-- Footer -->
            <p class="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              Don't have an account? 
              <a routerLink="/signup" class="font-bold text-[var(--color-primary)] hover:underline">Create one for free</a>
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
export class LoginComponent {
  TentIcon = Tent;
  MailIcon = Mail;
  LockIcon = Lock;
  LogInIcon = LogIn;

  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  handleSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;
        // Redirect based on role or to dashboard
        if (user.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed depth check:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to the backend. Please ensure it is running on port 8089.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid username or password (Bad Credentials).';
        } else {
          this.errorMessage = `Error ${err.status}: ${err.error?.message || 'Login failed. Please try again.'}`;
        }
      }
    });
  }
}
