import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { RoleDashboardComponent } from './features/dashboard/role-dashboard.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },


    {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/admin-user-management/admin-user-management.component').then(m => m.AdminUserManagementComponent)
            },
            {
                path: 'academy',
                loadComponent: () => import('./features/admin/admin-academy-governance/admin-academy-governance.component').then(m => m.AdminAcademyGovernanceComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./features/admin/admin-events-management/admin-events-management.component').then(m => m.AdminEventsManagementComponent)
            },
            {
                path: 'marketplace',
                loadComponent: () => import('./features/admin/admin-marketplace/admin-marketplace.component').then(m => m.AdminMarketplaceComponent)
            },
            {
                path: 'bookings',
                loadComponent: () => import('./features/admin/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
            },
            {
                path: 'incidents',
                loadComponent: () => import('./features/admin/admin-incident-management/admin-incident-management.component').then(m => m.AdminIncidentManagementComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./features/admin/admin-analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [


            // Role Dashboards
            {
                path: 'site-dashboard',
                component: RoleDashboardComponent,
                canActivate: [authGuard],
                data: { roles: ['ROLE_SITE_OWNER'] }
            },
            {
                path: 'organizer-dashboard',
                component: RoleDashboardComponent,
                canActivate: [authGuard],
                data: { roles: ['ROLE_ORGANIZER'] }
            },
            {
                path: 'profile/edit',
                loadComponent: () => import('./features/auth/profile/camper-edit-profile.component').then(m => m.CamperEditProfileComponent),
                canActivate: [authGuard],
                data: { roles: ['ROLE_CAMPER', 'ROLE_site_owner', 'ROLE_equipment_provider', 'ROLE_organizer', 'ROLE_delivery_provider', 'ROLE_admin'] }
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/auth/profile/camper-profile.component').then(m => m.CamperProfileComponent),
                canActivate: [authGuard],
                data: { roles: ['ROLE_CAMPER', 'ROLE_site_owner', 'ROLE_equipment_provider', 'ROLE_organizer', 'ROLE_delivery_provider', 'ROLE_admin'] } // Accessible to all logged in
            },
            // Existing routes
            {
                path: 'plan-trip',
                loadComponent: () => import('./features/trips/plan-trip.component').then(m => m.PlanTripComponent)
            },
            {
                path: 'trips',
                loadComponent: () => import('./features/trips/my-trips.component').then(m => m.MyTripsComponent),
                canActivate: [authGuard]
            },
            {
                path: 'trips/:id',
                loadComponent: () => import('./features/trips/trip-detail/trip-detail.component').then(m => m.TripDetailComponent)
            },
            {
                path: 'campsites',
                loadComponent: () => import('./features/campsites/campsites.component').then(m => m.CampsitesComponent)
            },
            {
                path: 'campsites/:id',
                loadComponent: () => import('./features/campsites/campsite-detail/campsite-detail.component').then(m => m.CampsiteDetailComponent)
            },

            {
                path: 'community',
                loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent)
            },
            {
                path: 'community/:id',
                loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent)
            },
            {
                path: 'academy',
                loadComponent: () => import('./features/academy/academy.component').then(m => m.AcademyComponent)
            },
            {
                path: 'academy/video/:videoId',
                loadComponent: () => import('./features/academy/knowledge-video/knowledge-video.component').then(m => m.KnowledgeVideoComponent)
            },
            {
                path: 'academy/expert/:expertId',
                loadComponent: () => import('./features/academy/expert-profile/expert-profile.component').then(m => m.ExpertProfileComponent)
            },
            {
                path: 'academy/certifications',
                loadComponent: () => import('./features/academy/certification-programs/certification-programs.component').then(m => m.CertificationProgramsComponent)
            },
            {
                path: 'academy/my-progress',
                loadComponent: () => import('./features/academy/certification-progress/certification-progress.component').then(m => m.CertificationProgressComponent)
            },
            {
                path: 'academy/my-badges',
                loadComponent: () => import('./features/academy/my-badges/my-badges.component').then(m => m.MyBadgesComponent)
            },
            {
                path: 'academy/:id',
                loadComponent: () => import('./features/academy/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./features/events/events-home/events-home.component').then(m => m.EventsHomeComponent)
            },
            {
                path: 'events/:eventId',
                loadComponent: () => import('./features/events/event-details/event-details.component').then(m => m.EventDetailsComponent)
            },
            {
                path: 'delivery-provider/login',
                loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
                canActivate: [authGuard]
            },
            // Booking Flow
            {
                path: 'dashboard/bookings',
                loadComponent: () => import('./features/bookings/booking-management/booking-management.component').then(m => m.BookingManagementComponent),
                canActivate: [authGuard]
            },
            {
                path: 'discover',
                loadComponent: () => import('./features/bookings/availability-search/availability-search.component').then(m => m.AvailabilitySearchComponent)
            },
            {
                path: 'booking/reserve/:siteId',
                loadComponent: () => import('./features/bookings/reservation-create/reservation-create.component').then(m => m.ReservationCreateComponent),
                canActivate: [authGuard]
            },
            {
                path: 'booking/payment/:siteId',
                loadComponent: () => import('./features/bookings/payment-flow/payment-flow.component').then(m => m.PaymentFlowComponent),
                canActivate: [authGuard]
            },
            {
                path: 'booking/confirmation/:bookingId',
                loadComponent: () => import('./features/bookings/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
                canActivate: [authGuard]
            },
            {
                path: 'booking/cancel/:bookingId',
                loadComponent: () => import('./features/bookings/booking-cancel/booking-cancel.component').then(m => m.BookingCancelComponent),
                canActivate: [authGuard]
            },
            // Trip Planning Extended
            {
                path: 'plan-trip/create',
                loadComponent: () => import('./features/trips/trip-create/trip-create.component').then(m => m.TripCreateComponent),
                canActivate: [authGuard]
            },
            {
                path: 'plan-trip/:tripId/itinerary',
                loadComponent: () => import('./features/trips/trip-itinerary/trip-itinerary.component').then(m => m.TripItineraryComponent),
                canActivate: [authGuard]
            },
            {
                path: 'plan-trip/:tripId/packing',
                loadComponent: () => import('./features/trips/trip-packing/trip-packing.component').then(m => m.TripPackingComponent),
                canActivate: [authGuard]
            },
            // END Admin Block
            {
                path: '**',
                redirectTo: ''
            }
        ]
    }
];
