import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#1a1f1d] flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 rounded-full blur-[120px]"></div>

      <div class="w-full max-w-md z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-[#10b981] rounded-xl mb-4 shadow-lg shadow-[#10b981]/20">
            <lucide-icon [img]="ZapIcon" class="text-white" [size]="24"></lucide-icon>
          </div>
          <h1 class="text-3xl font-serif font-bold text-white mb-2">CampConnect</h1>
          <h2 class="text-4xl font-serif font-bold text-white mb-2 leading-tight">Welcome Back, Explorer</h2>
          <p class="text-gray-400">Log in to continue your adventure.</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-[#242a27]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <!-- Tab Switcher -->
          <div class="flex p-1 bg-[#1a1f1d] rounded-xl mb-8">
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              [class.bg-[#10b981]]="activeTab === 'login'"
              [class.text-white]="activeTab === 'login'"
              [class.text-gray-400]="activeTab !== 'login'"
              (click)="activeTab = 'login'"
            >
              LOG IN
            </button>
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              [class.bg-[#10b981]]="activeTab === 'signup'"
              [class.text-white]="activeTab === 'signup'"
              [class.text-gray-400]="activeTab !== 'signup'"
              routerLink="/signup"
            >
              SIGN UP
            </button>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {{ errorMessage }}
          </div>

          <!-- Form -->
          <form (ngSubmit)="handleSubmit()" class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#10b981] uppercase tracking-wider ml-1">Email Address</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors">
                  <lucide-icon [img]="MailIcon" [size]="18"></lucide-icon>
                </div>
                <input
                  type="text"
                  placeholder="nawres@gmail.com"
                  [(ngModel)]="username"
                  name="username"
                  class="w-full bg-[#eef2ff] border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10b981] transition-all outline-none font-medium"
                  required
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-[#10b981] uppercase tracking-wider ml-1">Password</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors">
                  <lucide-icon [img]="LockIcon" [size]="18"></lucide-icon>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  class="w-full bg-[#eef2ff] border-none rounded-2xl py-4 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10b981] transition-all outline-none font-medium"
                  required
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <lucide-icon [img]="showPassword ? EyeOffIcon : EyeIcon" [size]="18"></lucide-icon>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between px-1">
              <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="rememberMe"
                    name="rememberMe"
                    class="peer appearance-none w-4 h-4 bg-transparent border-2 border-gray-600 rounded checked:bg-[#10b981] checked:border-[#10b981] transition-all focus:outline-none"
                  />
                  <svg class="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-xs text-gray-300 group-hover:text-white transition-colors">Stay logged in</span>
              </label>
              <a href="#" class="text-xs text-[#10b981] hover:underline font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full bg-[#10b981] text-white font-bold py-4 rounded-2xl hover:bg-[#0da271] active:scale-[0.98] transition-all shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading ? 'Entering...' : 'Start Adventure' }}
            </button>
          </form>

          <!-- Social Login -->
          <div class="mt-8 text-center relative">
            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/5"></div>
            <span class="relative px-4 bg-[#242a27] text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em]">or continue with</span>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <button class="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-white font-medium transition-all group">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google">
              <span>Google</span>
            </button>
            <button class="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-white font-medium transition-all group">
              <img src="https://www.svgrepo.com/show/330033/apple.svg" class="w-5 h-5 invert group-hover:scale-110 transition-transform" alt="Apple">
              <span>Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    input::placeholder {
      font-weight: 500;
    }
  `]
})
export class LoginComponent {
  activeTab = 'login';
  ZapIcon = Zap;
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  showPassword = false;
  username = 'admin';
  password = 'admin123';
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
        if (err.status === 0) {
          this.errorMessage = 'Network error: Check if backend is running and CORS is allowed.';
        } else {
          this.errorMessage = err.error?.message || 'Invalid email or password';
        }
      }
    });
  }
}
