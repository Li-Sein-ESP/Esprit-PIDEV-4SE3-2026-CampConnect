import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'plan-trip',
                loadComponent: () => import('./features/trips/trip-create/trip-create.component').then(m => m.TripCreateComponent)
            },
            {
                path: 'trips',
                loadComponent: () => import('./features/trips/my-trips.component').then(m => m.MyTripsComponent)
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
                path: 'gear/:id',
                loadComponent: () => import('./features/gear/gear-detail/gear-detail.component').then(m => m.GearDetailComponent)
            },
            // Base community route moved to the end of this group
            {
                path: 'community/events',
                loadComponent: () => import('./features/community/community-events/community-events.component').then(m => m.CommunityEventsComponent)
            },
            {
                path: 'community/messages',
                loadComponent: () => import('./features/community/messaging/messaging.component').then(m => m.MessagingComponent)
            },
            {
                path: 'community/messages/:id',
                loadComponent: () => import('./features/community/messaging/messaging.component').then(m => m.MessagingComponent)
            },
            {
                path: 'community/leaderboard',
                loadComponent: () => import('./features/community/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
            },
            {
                path: 'community/create',
                loadComponent: () => import('./features/community/create-post/create-post.component').then(m => m.CreatePostComponent)
            },
            {
                path: 'community/forum',
                loadComponent: () => import('./features/community/forum-home/forum-home.component').then(m => m.ForumHomeComponent)
            },
            {
                path: 'community/forum/category/:id',
                loadComponent: () => import('./features/community/forum-category/forum-category.component').then(m => m.ForumCategoryComponent)
            },
            {
                path: 'community/forum/create',
                canActivate: [authGuard],
                data: { roles: ['Camper', 'Verified Camper', 'admin'] },
                loadComponent: () => import('./features/community/create-forum-topic/create-forum-topic.component').then(m => m.CreateForumTopicComponent)
            },
            {
                path: 'community/forum/topic/:id',
                loadComponent: () => import('./features/community/forum-topic-details/forum-topic-details.component').then(m => m.ForumTopicDetailsComponent)
            },
            {
                path: 'community/profile/:id',
                loadComponent: () => import('./features/community/public-profile/public-profile.component').then(m => m.PublicProfileComponent)
            },
            {
                path: 'community/:id',
                loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent)
            },
            {
                path: 'community',
                pathMatch: 'full',
                loadComponent: () => import('./features/community/community-feed/community-feed.component').then(m => m.CommunityFeedComponent)
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
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            // Booking Flow
            {
                path: 'dashboard/bookings',
                loadComponent: () => import('./features/bookings/booking-management/booking-management.component').then(m => m.BookingManagementComponent)
            },
            {
                path: 'discover',
                loadComponent: () => import('./features/bookings/availability-search/availability-search.component').then(m => m.AvailabilitySearchComponent)
            },
            {
                path: 'booking/reserve/:siteId',
                loadComponent: () => import('./features/bookings/reservation-create/reservation-create.component').then(m => m.ReservationCreateComponent)
            },
            {
                path: 'booking/payment/:siteId',
                loadComponent: () => import('./features/bookings/payment-flow/payment-flow.component').then(m => m.PaymentFlowComponent)
            },
            {
                path: 'booking/confirmation/:bookingId',
                loadComponent: () => import('./features/bookings/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent)
            },
            {
                path: 'booking/cancel/:bookingId',
                loadComponent: () => import('./features/bookings/booking-cancel/booking-cancel.component').then(m => m.BookingCancelComponent)
            },
            // Trip Planning Extended
            {
                path: 'plan-trip/create',
                loadComponent: () => import('./features/trips/trip-create/trip-create.component').then(m => m.TripCreateComponent)
            },
            {
                path: 'plan-trip/:tripId/itinerary',
                loadComponent: () => import('./features/trips/trip-itinerary/trip-itinerary.component').then(m => m.TripItineraryComponent)
            },
            {
                path: 'plan-trip/:tripId/packing',
                loadComponent: () => import('./features/trips/trip-packing/trip-packing.component').then(m => m.TripPackingComponent)
            },
            {
                path: 'plan-trip/:tripId/budget',
                loadComponent: () => import('./features/trips/trip-budget/trip-budget.component').then(m => m.TripBudgetComponent)
            },
            {
                path: 'plan-trip/:tripId/nearby',
                loadComponent: () => import('./features/trips/trip-nearby/trip-nearby.component').then(m => m.TripNearbyComponent)
            },
            {
                path: 'packing-lists',
                loadComponent: () => import('./features/trips/packing-lists/packing-lists.component').then(m => m.PackingListsComponent)
            },
            {
                path: 'budget-estimation',
                loadComponent: () => import('./features/trips/budget-estimation/budget-estimation.component').then(m => m.BudgetEstimationComponent)
            },
            {
                path: 'recommended-places',
                loadComponent: () => import('./features/trips/recommended-places/recommended-places.component').then(m => m.RecommendedPlacesComponent)
            },
            // Academy Extended
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
            // Gear Extended
            {
                path: 'gear/cart',
                loadComponent: () => import('./features/gear/gear-cart/gear-cart.component').then(m => m.GearCartComponent)
            },
            {
                path: 'gear/kits',
                loadComponent: () => import('./features/gear/gear-kits/gear-kits.component').then(m => m.GearKitsComponent)
            },
            {
                path: 'gear/rentals',
                loadComponent: () => import('./features/gear/gear-rentals/gear-rentals.component').then(m => m.GearRentalsComponent)
            },
            {
                path: 'gear/delivery',
                loadComponent: () => import('./features/gear/delivery-logistics/delivery-logistics.component').then(m => m.DeliveryLogisticsComponent)
            },
            {
                path: 'gear/delivery/:deliveryId',
                loadComponent: () => import('./features/gear/delivery-tracking/delivery-tracking.component').then(m => m.DeliveryTrackingComponent)
            },
            {
                path: 'gear/provider',
                loadComponent: () => import('./features/gear/provider-deliveries/provider-deliveries.component').then(m => m.ProviderDeliveriesComponent)
            },
            // Community Extended
            {
                path: 'community/stories',
                loadComponent: () => import('./features/community/trip-stories/trip-stories.component').then(m => m.TripStoriesComponent)
            },
            {
                path: 'community/help',
                loadComponent: () => import('./features/community/ask-for-help/ask-for-help.component').then(m => m.AskForHelpComponent)
            },
            {
                path: 'community/create',
                loadComponent: () => import('./features/community/create-post/create-post.component').then(m => m.CreatePostComponent)
            },
            {
                path: 'community/post/:id',
                loadComponent: () => import('./features/community/post-details/post-details.component').then(m => m.PostDetailsComponent)
            },
            {
                path: 'community/leaderboard',
                loadComponent: () => import('./features/community/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
            },
            {
                path: 'community/moderation',
                loadComponent: () => import('./features/community/moderation-dashboard/moderation-dashboard.component').then(m => m.ModerationDashboardComponent)
            },
            // Safety Extended
            {
                path: 'environmental',
                loadComponent: () => import('./features/safety/environmental-compliance/environmental-compliance.component').then(m => m.EnvironmentalComplianceComponent)
            },
            {
                path: 'safety/compliance/:tripId',
                loadComponent: () => import('./features/safety/trip-compliance-report/trip-compliance-report.component').then(m => m.TripComplianceReportComponent)
            },
            {
                path: 'safety/zones',
                loadComponent: () => import('./features/safety/environmental-zones/environmental-zones.component').then(m => m.EnvironmentalZonesComponent)
            },
            {
                path: 'safety/wildlife',
                loadComponent: () => import('./features/safety/wildlife-regulations/wildlife-regulations.component').then(m => m.WildlifeRegulationsComponent)
            },
            {
                path: 'safety/alerts',
                loadComponent: () => import('./features/safety/safety-alerts/safety-alerts.component').then(m => m.SafetyAlertsComponent)
            },
            {
                path: 'safety/alerts/:id',
                loadComponent: () => import('./features/safety/safety-alert-details/safety-alert-details.component').then(m => m.SafetyAlertDetailsComponent)
            },
            {
                path: 'safety/map',
                loadComponent: () => import('./features/safety/safety-map/safety-map.component').then(m => m.SafetyMapComponent)
            },
            {
                path: 'safety/checkin',
                loadComponent: () => import('./features/safety/emergency-checkin/emergency-checkin.component').then(m => m.EmergencyCheckinComponent)
            },
            {
                path: 'safety/emergency',
                loadComponent: () => import('./features/safety/emergency-contacts/emergency-contacts.component').then(m => m.EmergencyContactsComponent)
            },
            {
                path: 'safety/analytics',
                canActivate: [authGuard],
                data: { roles: ['Camper', 'Verified Camper', 'admin'] },
                loadComponent: () => import('./features/safety/safety-analytics/safety-analytics.component').then(m => m.SafetyAnalyticsComponent)
            },
            {
                path: 'safety/report',
                canActivate: [authGuard],
                data: { roles: ['Camper', 'Verified Camper', 'admin'] },
                loadComponent: () => import('./features/safety/report-incident/report-incident.component').then(m => m.ReportIncidentComponent)
            },
            {
                path: 'safety/my-reports',
                loadComponent: () => import('./features/safety/my-reports/my-reports.component').then(m => m.MyReportsComponent)
            },
            // Companions
            {
                path: 'companions',
                loadComponent: () => import('./features/companions/companion-matching/companion-matching.component').then(m => m.CompanionMatchingComponent)
            },
            {
                path: 'companions/preferences',
                loadComponent: () => import('./features/companions/matching-preferences/matching-preferences.component').then(m => m.MatchingPreferencesComponent)
            },
            {
                path: 'companions/matches',
                loadComponent: () => import('./features/companions/match-suggestions/match-suggestions.component').then(m => m.MatchSuggestionsComponent)
            },
            {
                path: 'companions/match/:matchId',
                loadComponent: () => import('./features/companions/match-detail/match-detail.component').then(m => m.MatchDetailComponent)
            },
            {
                path: 'companions/create-group',
                loadComponent: () => import('./features/companions/create-group-trip/create-group-trip.component').then(m => m.CreateGroupTripComponent)
            },
            {
                path: 'companions/group/:groupId',
                loadComponent: () => import('./features/companions/group-management/group-management.component').then(m => m.GroupManagementComponent)
            },
            {
                path: 'companions/groups',
                loadComponent: () => import('./features/companions/my-groups/my-groups.component').then(m => m.MyGroupsComponent)
            },
            // Transportation
            {
                path: 'transportation',
                loadComponent: () => import('./features/transportation/transportation-overview/transportation-overview.component').then(m => m.TransportationOverviewComponent)
            },
            {
                path: 'transportation/options',
                loadComponent: () => import('./features/transportation/transportation-options/transportation-options.component').then(m => m.TransportationOptionsComponent)
            },
            {
                path: 'transportation/route/:optionId',
                loadComponent: () => import('./features/transportation/route-breakdown/route-breakdown.component').then(m => m.RouteBreakdownComponent)
            },
            {
                path: 'transportation/confirm',
                loadComponent: () => import('./features/transportation/transport-confirmation/transport-confirmation.component').then(m => m.TransportConfirmationComponent)
            },
            // Events
            {
                path: 'events',
                loadComponent: () => import('./features/events/events-home/events-home.component').then(m => m.EventsHomeComponent)
            },
            {
                path: 'events/:eventId',
                loadComponent: () => import('./features/events/event-details/event-details.component').then(m => m.EventDetailsComponent)
            },
            // Admin
            {
                path: 'admin',
                loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./features/admin/admin-user-management/admin-user-management.component').then(m => m.AdminUserManagementComponent)
            },
            {
                path: 'admin/academy',
                loadComponent: () => import('./features/admin/admin-academy-governance/admin-academy-governance.component').then(m => m.AdminAcademyGovernanceComponent)
            },
            {
                path: 'admin/moderation',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/admin/admin-moderation/admin-moderation.component').then(m => m.AdminModerationComponent)
            },
            {
                path: 'admin/incidents',
                loadComponent: () => import('./features/admin/admin-incident-management/admin-incident-management.component').then(m => m.AdminIncidentManagementComponent)
            },
            {
                path: 'admin/sites',
                loadComponent: () => import('./features/admin/admin-sites-management/admin-sites-management.component').then(m => m.AdminSitesManagementComponent)
            },
            {
                path: 'admin/marketplace',
                loadComponent: () => import('./features/admin/admin-marketplace/admin-marketplace.component').then(m => m.AdminMarketplaceComponent)
            },
            {
                path: 'admin/bookings',
                loadComponent: () => import('./features/admin/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
            },
            {
                path: 'admin/analytics',
                loadComponent: () => import('./features/admin/admin-analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
            },
            {
                path: 'admin/settings',
                loadComponent: () => import('./features/admin/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent)
            },
            {
                path: '**',
                redirectTo: ''
            }
        ]
    }
];
