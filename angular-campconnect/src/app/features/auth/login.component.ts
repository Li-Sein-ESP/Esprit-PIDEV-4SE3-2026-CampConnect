import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { WaveInputComponent } from './wave-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, WaveInputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  activeTab: 'login' | 'signup' | 'role_selection' = 'login';
  selectedSignUpRole: string | null = null;
  errorMessage: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    // Base Signup Form
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      // Dynamic profile details group
      profileDetails: this.fb.group({})
    }, { validators: this.passwordMatchValidator });
  }

  // Method to build dynamic form block based on role
  selectRoleForSignUp(role: string) {
    this.selectedSignUpRole = role;
    this.activeTab = 'signup';

    // Reset and rebuild the profile details group
    const detailsGroup = this.fb.group({});

    switch (role) {
      case 'camper':
        detailsGroup.addControl('age', this.fb.control('', Validators.required));
        detailsGroup.addControl('emergencyContact', this.fb.control('', Validators.required));
        break;
      case 'equipment_provider':
        detailsGroup.addControl('companyName', this.fb.control('', Validators.required));
        detailsGroup.addControl('businessPhone', this.fb.control('', Validators.required));
        detailsGroup.addControl('businessAddress', this.fb.control('', Validators.required));
        break;
      case 'site_owner':
        detailsGroup.addControl('propertyName', this.fb.control('', Validators.required));
        detailsGroup.addControl('propertyLocation', this.fb.control('', Validators.required));
        detailsGroup.addControl('contactNumber', this.fb.control('', Validators.required));
        break;
      case 'organizer':
        detailsGroup.addControl('organizationName', this.fb.control('', Validators.required));
        detailsGroup.addControl('website', this.fb.control(''));
        break;
      case 'delivery_provider':
        detailsGroup.addControl('vehicleType', this.fb.control('', Validators.required));
        detailsGroup.addControl('licensePlateNumber', this.fb.control('', Validators.required));
        break;
    }

    this.signupForm.setControl('profileDetails', detailsGroup);
  }

  // Helper to easily access profileDetails controls in HTML
  get profileDetailsGroup(): FormGroup {
    return this.signupForm.get('profileDetails') as FormGroup;
  }

  ngOnInit(): void {
    // If user is already logged in, redirect them away
    if (this.authService.getToken()) {
      const roles = this.authService.getRoles();
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin']);
      } else if (roles.length > 0) {
        this.router.navigate([this.getRedirectUrlForRole(roles[0])]);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'signup') {
        this.activeTab = 'signup';
      }
    });

    // Clear error message on tab switch or form change
    this.loginForm.valueChanges.subscribe(() => this.errorMessage = '');
    this.signupForm.valueChanges.subscribe(() => this.errorMessage = '');
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  switchMode(mode: 'login' | 'signup' | 'role_selection') {
    this.activeTab = mode;
    this.errorMessage = '';

    // If switching out of signup, clear the selected role
    if (mode !== 'signup') {
      this.selectedSignUpRole = null;
    }

    const queryParams = mode === 'role_selection' || mode === 'signup' ? { mode: 'signup' } : {};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email.trim(), password.trim()).subscribe({
      next: (data) => {
        this.isSubmitting = false;
        
        // Priority to Admin redirection (role or email suffix)
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          const roles = this.authService.getRoles();
          if (roles.length > 0) {
            this.router.navigate([this.getRedirectUrlForRole(roles[0])]);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Login failed', err);
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  onSignup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all fields. Password must be at least 6 characters.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;
    const profileDetails = this.signupForm.get('profileDetails')?.value;

    this.authService.signup({
      username: email,
      email: email,
      password: password,
      name: name,
      role: [this.selectedSignUpRole || 'camper'],
      profileDetails: profileDetails
    }).subscribe({
      next: (res) => {
        console.log('Signup success:', res);
        // Automatic login after successful signup
        this.authService.login(email.trim(), password.trim()).subscribe({
          next: () => {
            this.isSubmitting = false;
            if (this.authService.isAdmin()) {
              this.router.navigate(['/admin']);
            } else {
              const roles = this.authService.getRoles();
              if (roles.length > 0) {
                this.router.navigate([this.getRedirectUrlForRole(roles[0])]);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }
          },
          error: (loginErr) => {
            this.isSubmitting = false;
            console.error('Auto-login failed after signup', loginErr);
            this.errorMessage = 'Account created! Please log in manually.';
            this.switchMode('login');
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Signup failed', err);
        this.errorMessage = 'Signup failed. Please try again.';
      }
    });
  }

  // Helper to map roles to routes
  private getRedirectUrlForRole(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return '/admin';
      case 'ROLE_SITE_OWNER': return '/site-dashboard';
      case 'ROLE_EQUIPMENT_PROVIDER': return '/provider/dashboard';
      case 'ROLE_ORGANIZER': return '/organizer-dashboard';
      case 'ROLE_DELIVERY_PROVIDER': return '/delivery/dashboard';
      case 'ROLE_CAMPER': return '/profile'; // User asked for /profile for CAMPER
      default: return '/dashboard'; // Fallback
    }
  }
}
