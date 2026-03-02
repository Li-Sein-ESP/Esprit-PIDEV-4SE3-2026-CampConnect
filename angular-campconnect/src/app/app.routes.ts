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
        path: 'provider',
        loadComponent: () => import('./features/marketplace/provider-layout/provider-layout.component').then(m => m.ProviderLayoutComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_EQUIPMENT_PROVIDER'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/marketplace/provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/marketplace/provider-manage-products/provider-manage-products.component').then(m => m.ProviderManageProductsComponent)
            },
            {
                path: 'products/new',
                loadComponent: () => import('./features/marketplace/provider-add-product/provider-add-product.component').then(m => m.ProviderAddProductComponent)
            },
            {
                path: 'products/:id/edit',
                loadComponent: () => import('./features/marketplace/provider-edit-product/provider-edit-product.component').then(m => m.ProviderEditProductComponent)
            },
            {
                path: 'products/:id/analytics',
                loadComponent: () => import('./features/marketplace/provider-product-analytics/provider-product-analytics.component').then(m => m.ProviderProductAnalyticsComponent)
            },
            {
                path: 'rentals',
                loadComponent: () => import('./features/marketplace/provider-rentals/provider-rentals.component').then(m => m.ProviderRentalsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/marketplace/provider-profile/provider-profile.component').then(m => m.ProviderProfileComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'delivery',
        loadComponent: () => import('./features/delivery/delivery-layout/delivery-layout.component').then(m => m.DeliveryLayoutComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_DELIVERY_PROVIDER'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/delivery/delivery-dashboard/delivery-dashboard.component').then(m => m.DeliveryDashboardComponent)
            },
            {
                path: 'vehicles',
                loadComponent: () => import('./features/delivery/delivery-vehicles/delivery-vehicles.component').then(m => m.DeliveryVehiclesComponent)
            },
            {
                path: 'earnings',
                loadComponent: () => import('./features/delivery/delivery-earnings/delivery-earnings.component').then(m => m.DeliveryEarningsComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./features/delivery/delivery-history/delivery-history.component').then(m => m.DeliveryHistoryComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/delivery/delivery-profile/delivery-profile.component').then(m => m.DeliveryProfileComponent)
            },
            {
                path: ':deliveryId',
                loadComponent: () => import('./features/delivery/delivery-details/delivery-details.component').then(m => m.DeliveryDetailsComponent)
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
            {
                path: 'marketplace',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/marketplace/marketplace-landing/marketplace-landing.component').then(m => m.MarketplaceLandingComponent)
                    },
                    {
                        path: 'category/:id',
                        loadComponent: () => import('./features/marketplace/marketplace-category/marketplace-category.component').then(m => m.MarketplaceCategoryComponent)
                    },
                    {
                        path: 'product/:id',
                        loadComponent: () => import('./features/marketplace/marketplace-product-details/marketplace-product-details.component').then(m => m.MarketplaceProductDetailsComponent)
                    }
                ]
            },
            {
                path: 'cart',
                loadComponent: () => import('./features/marketplace/marketplace-cart/marketplace-cart.component').then(m => m.MarketplaceCartComponent)
            },
            {
                path: 'delivery/track/:orderId',
                loadComponent: () => import('./features/delivery/delivery-tracking/delivery-tracking.component').then(m => m.DeliveryTrackingComponent)
            },
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
                path: 'gear',
                loadComponent: () => import('./features/gear/gear.component').then(m => m.GearComponent)
            },
            {
                path: 'gear/my-gear',
                loadComponent: () => import('./features/gear/my-gear/my-gear.component').then(m => m.MyGearComponent),
                canActivate: [authGuard]
            },
            {
                path: 'gear/list',
                loadComponent: () => import('./features/gear/gear-list/gear-list.component').then(m => m.GearListComponent),
                canActivate: [authGuard]
            },
            {
                path: 'gear/create',
                loadComponent: () => import('./features/gear/gear-create/gear-create.component').then(m => m.GearCreateComponent),
                canActivate: [authGuard],
                data: { roles: ['ROLE_EQUIPMENT_PROVIDER'] }
            },
            {
                path: 'gear/:id',
                loadComponent: () => import('./features/gear/gear-detail/gear-detail.component').then(m => m.GearDetailComponent)
            },
            {
                path: 'rentals',
                loadComponent: () => import('./features/gear/gear-rentals/rentals.component').then(m => m.RentalsComponent),
                canActivate: [authGuard]
            },
            {
                path: 'deliveries',
                loadComponent: () => import('./features/delivery/deliveries/deliveries.component').then(m => m.DeliveriesComponent),
                canActivate: [authGuard]
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
                path: 'academy/:id',
                loadComponent: () => import('./features/academy/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
            },
            {
                path: 'safety',
                loadComponent: () => import('./features/safety/safety.component').then(m => m.SafetyComponent)
            },
            {
                path: 'delivery/track/:orderId',
                loadComponent: () => import('./features/delivery/delivery-tracking/delivery-tracking.component').then(m => m.DeliveryTrackingComponent)
            },
            {
                path: 'profile/orders',
                loadComponent: () => import('./features/marketplace/camper-orders/camper-orders.component').then(m => m.CamperOrdersComponent)
            },
            {
                path: 'profile/orders/:orderId',
                loadComponent: () => import('./features/marketplace/camper-order-details/camper-order-details.component').then(m => m.CamperOrderDetailsComponent)
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
