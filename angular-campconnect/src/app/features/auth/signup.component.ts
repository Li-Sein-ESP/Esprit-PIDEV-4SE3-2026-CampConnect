import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, Zap, Tent, Mountain, Backpack, Calendar, Truck, User as UserIcon, Mail, Lock, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#1a1f1d] flex items-center justify-center p-6 lg:py-12 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 rounded-full blur-[120px]"></div>

      <div class="w-full max-w-xl z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-[#10b981] rounded-xl mb-4 shadow-lg shadow-[#10b981]/20">
            <lucide-icon [img]="ZapIcon" class="text-white" [size]="24"></lucide-icon>
          </div>
          <h1 class="text-3xl font-serif font-bold text-white mb-2">CampConnect</h1>
          <h2 class="text-4xl font-serif font-bold text-white mb-2 leading-tight">Begin Your Journey</h2>
          <p class="text-gray-400">Join our community of outdoor enthusiasts.</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-[#242a27]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <!-- Tab Switcher -->
          <div class="flex p-1 bg-[#1a1f1d] rounded-xl mb-8">
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-400"
              routerLink="/login"
            >
              LOG IN
            </button>
            <button 
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-[#10b981] text-white"
            >
              SIGN UP
            </button>
          </div>

          <div class="mb-8">
            <h3 class="text-white text-center font-bold mb-6">Choose Your Journey</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                *ngFor="let r of rolesList"
                (click)="selectedRole = r.id"
                class="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 group text-center"
                [class.bg-[#10b981]/10]="selectedRole === r.id"
                [class.border-[#10b981]]="selectedRole === r.id"
                [class.border-transparent]="selectedRole !== r.id"
                [class.bg-white/5]="selectedRole !== r.id"
                [class.hover:bg-white/10]="selectedRole !== r.id"
              >
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  [class.bg-[#10b981]]="selectedRole === r.id"
                  [class.bg-white/10]="selectedRole !== r.id"
                >
                  <lucide-icon [img]="r.icon" [class.text-white]="selectedRole === r.id" [class.text-gray-400]="selectedRole !== r.id" [size]="18"></lucide-icon>
                </div>
                <span class="text-[9px] uppercase font-bold tracking-[0.1em] break-words" [class.text-[#10b981]]="selectedRole === r.id" [class.text-gray-400]="selectedRole !== r.id">{{ r.label }}</span>
              </button>
            </div>
          </div>

          <!-- Form Area -->
          <form (ngSubmit)="handleSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-[#10b981] uppercase tracking-wider ml-1">Full Name</label>
                <div class="relative group">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors">
                    <lucide-icon [img]="UserIconRef" [size]="18"></lucide-icon>
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    [(ngModel)]="name"
                    name="name"
                    class="w-full bg-[#eef2ff] border-none rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10b981] transition-all outline-none font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-[#10b981] uppercase tracking-wider ml-1">Email Address</label>
                <div class="relative group">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10b981] transition-colors">
                    <lucide-icon [img]="MailIcon" [size]="18"></lucide-icon>
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    [(ngModel)]="email"
                    name="email"
                    class="w-full bg-[#eef2ff] border-none rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10b981] transition-all outline-none font-medium text-sm"
                    required
                  />
                </div>
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
                  class="w-full bg-[#eef2ff] border-none rounded-2xl py-3.5 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10b981] transition-all outline-none font-medium text-sm"
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

            <div class="flex items-start gap-3 px-1">
              <div class="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  [(ngModel)]="agreeToTerms"
                  name="agreeToTerms"
                  class="peer appearance-none w-4 h-4 bg-transparent border-2 border-gray-600 rounded checked:bg-[#10b981] checked:border-[#10b981] transition-all focus:outline-none"
                  required
                />
                <svg class="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-xs text-gray-400 leading-relaxed">
                By signing up, you agree to our <a href="#" class="text-[#10b981] hover:underline font-medium">Terms of Service</a> and <a href="#" class="text-[#10b981] hover:underline font-medium">Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              [disabled]="isLoading || !agreeToTerms"
              class="w-full bg-[#10b981] text-white font-bold py-4 rounded-2xl hover:bg-[#0da271] active:scale-[0.98] transition-all shadow-lg shadow-[#10b981]/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading ? 'Creating Account...' : 'Continue to Adventure' }}
            </button>
          </form>

          <!-- Social Login -->
          <div class="mt-8 text-center relative mb-6">
            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/5"></div>
            <span class="relative px-4 bg-[#242a27] text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em]">or continue with</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
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
  `]
})
export class SignupComponent {
  activeTab = 'signup';
  ZapIcon = Zap;
  UserIconRef = UserIcon;
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  
  rolesList = [
    { id: 'camper', label: 'Camper', icon: Tent },
    { id: 'site_owner', label: 'Site Owner', icon: Mountain },
    { id: 'provider', label: 'Provider', icon: Backpack },
    { id: 'organizer', label: 'Organizer', icon: Calendar }
  ];

  selectedRole = 'camper';
  showPassword = false;
  isLoading = false;
  
  name = '';
  email = '';
  password = '';
  agreeToTerms = false;

  constructor(private router: Router, private authService: AuthService) { }

  handleSubmit(): void {
    if (!this.agreeToTerms) return;
    
    this.isLoading = true;
    
    this.authService.signup(this.email.split('@')[0], this.email, this.password, this.name, [this.selectedRole]).subscribe({
        next: () => {
            this.isLoading = false;
            alert('Journey started! Please log in to continue.');
            this.router.navigate(['/login']);
        },
        error: (err) => {
            this.isLoading = false;
            console.error('Signup failed', err);
            const errorMessage = err.error?.message || 'Encountered an obstacle. Please try again.';
            alert(errorMessage);
        }
    });
  }
}
