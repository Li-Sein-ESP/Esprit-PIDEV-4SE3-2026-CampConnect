import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../core/layouts/footer/footer.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, FooterComponent],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('scrollReveal') scrollRevealElements!: QueryList<ElementRef>;
    @ViewChildren('reveal') revealElements!: QueryList<ElementRef>;
    @ViewChildren('statNumber') statNumbers!: QueryList<ElementRef>;

    isScrolled = false;
    isMobileMenuOpen = false;

    private observer: IntersectionObserver | null = null;
    private animatedStats = false;
    private ticking = false;

    isAuthenticated: boolean = false;
    dashboardRoute: string = '/dashboard';

    constructor(
        private elRef: ElementRef,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.initNavbar();

        // Setup auth state
        this.authService.isAuthenticated().subscribe((isAuth: boolean) => {
            this.isAuthenticated = isAuth;
            if (isAuth) {
                const roles = this.authService.getRoles();
                if (roles.includes('ROLE_ADMIN')) this.dashboardRoute = '/admin';
                else if (roles.includes('ROLE_SITE_OWNER')) this.dashboardRoute = '/site-dashboard';
                else if (roles.includes('ROLE_EQUIPMENT_PROVIDER')) this.dashboardRoute = '/provider/dashboard';
                else if (roles.includes('ROLE_ORGANIZER')) this.dashboardRoute = '/organizer-dashboard';
                else if (roles.includes('ROLE_DELIVERY_PROVIDER')) this.dashboardRoute = '/delivery/dashboard';
                else this.dashboardRoute = '/dashboard';
            }
        });
    }

    ngAfterViewInit() {
        // Slight delay to ensure paint
        setTimeout(() => {
            this.initHeroReveal();
            this.initScrollReveal();
            this.initParallax();
            this.initParticles();
            this.initCounterAnimation();
        }, 100);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.initNavbar();
        this.initParallax();
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

    // ========================================
    // HERO REVEAL ANIMATIONS
    // ========================================
    private initHeroReveal() {
        this.revealElements.forEach(elRef => {
            const el = elRef.nativeElement;
            const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            setTimeout(() => {
                el.classList.add('cc-visible');
            }, 300 + delay);
        });
    }

    // ========================================
    // SCROLL REVEAL (Intersection Observer)
    // ========================================
    private initScrollReveal() {
        if (!('IntersectionObserver' in window)) {
            this.scrollRevealElements.forEach(elRef => elRef.nativeElement.classList.add('cc-visible'));
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                    setTimeout(() => {
                        el.classList.add('cc-visible');
                    }, delay);
                    this.observer?.unobserve(el);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px',
        });

        this.scrollRevealElements.forEach(elRef => {
            this.observer?.observe(elRef.nativeElement);
        });
    }

    // ========================================
    // PARALLAX EFFECT
    // ========================================
    private initParallax() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                const windowHeight = window.innerHeight;

                const heroBg = this.elRef.nativeElement.querySelector('#heroBg');
                if (heroBg && scrollY < windowHeight * 1.5) {
                    const heroOffset = scrollY * 0.35;
                    heroBg.style.transform = `translate3d(0, ${heroOffset}px, 0) scale(1.05)`;
                }

                const ctaBg = this.elRef.nativeElement.querySelector('#ctaBg');
                const ctaSection = this.elRef.nativeElement.querySelector('#cta');
                if (ctaBg && ctaSection) {
                    const ctaRect = ctaSection.getBoundingClientRect();
                    if (ctaRect.top < windowHeight && ctaRect.bottom > 0) {
                        const ctaProgress = (windowHeight - ctaRect.top) / (windowHeight + ctaRect.height);
                        const ctaOffset = (ctaProgress - 0.5) * 60;
                        ctaBg.style.transform = `translate3d(0, ${ctaOffset}px, 0) scale(1.05)`;
                    }
                }

                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    // ========================================
    // NAVBAR SCROLL BEHAVIOR
    // ========================================
    private initNavbar() {
        const scrollY = window.pageYOffset;
        this.isScrolled = scrollY > 80;
    }

    // ========================================
    // HERO PARTICLES (Fireflies)
    // ========================================
    private initParticles() {
        const container = this.elRef.nativeElement.querySelector('#heroParticles');
        if (!container) return;

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'cc-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = (6 + Math.random() * 10) + 's';
            particle.style.animationDelay = (Math.random() * 8) + 's';
            const size = (2 + Math.random() * 3) + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.opacity = (0.2 + Math.random() * 0.5).toString();
            container.appendChild(particle);
        }
    }

    // ========================================
    // COUNTER ANIMATION FOR STATS
    // ========================================
    private initCounterAnimation() {
        const animateCounters = () => {
            if (this.animatedStats) return;
            this.animatedStats = true;

            this.statNumbers.forEach(elRef => {
                const stat = elRef.nativeElement;
                const text = stat.textContent;
                let suffix = '';
                let numberStr = text;

                if (text.includes('+')) {
                    suffix = '+';
                    numberStr = text.replace('+', '').replace(',', '');
                } else if (text.includes('K')) {
                    suffix = 'K+';
                    numberStr = text.replace('K+', '').replace(',', '');
                }

                const target = parseFloat(numberStr);
                if (isNaN(target)) return;

                let current = 0;
                const duration = 2000;
                let startTime: number | null = null;
                const isDecimal = target % 1 !== 0;

                const step = (timestamp: number) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    current = eased * target;

                    if (target >= 1000) {
                        stat.textContent = Math.floor(current).toLocaleString() + suffix;
                    } else if (isDecimal) {
                        stat.textContent = current.toFixed(1) + suffix;
                    } else {
                        stat.textContent = Math.floor(current) + suffix;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        stat.textContent = text;
                    }
                };

                requestAnimationFrame(step);
            });
        };

        setTimeout(animateCounters, 1200);
    }

    scrollToTarget(targetId: string, event: Event) {
        event.preventDefault();
        const target = this.elRef.nativeElement.querySelector(targetId);
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth',
            });
        }
        this.closeMobileMenu();
    }
}
