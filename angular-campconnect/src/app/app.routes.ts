import { Routes } from "@angular/router";
import { MainLayoutComponent } from "./core/layouts/main-layout.component";
import { authGuard } from "./core/guards/auth.guard";
import { RoleDashboardComponent } from "./features/dashboard/role-dashboard.component";
import { DashboardRedirectComponent } from "./features/dashboard/dashboard-redirect.component";

export const routes: Routes = [
  // Standalone auth routes (outside MainLayoutComponent)
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "signup",
    loadComponent: () =>
      import("./features/auth/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard-redirect.component").then(
        (m) => m.DashboardRedirectComponent,
      ),
    canActivate: [authGuard],
  },
  // Equipment Provider Portal
  {
    path: "provider",
    loadComponent: () =>
      import("./features/marketplace/provider-layout/provider-layout.component").then(
        (m) => m.ProviderLayoutComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ["ROLE_EQUIPMENT_PROVIDER"] },
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/marketplace/provider-dashboard/provider-dashboard.component").then(
            (m) => m.ProviderDashboardComponent,
          ),
      },
      {
        path: "products",
        loadComponent: () =>
          import("./features/marketplace/provider-manage-products/provider-manage-products.component").then(
            (m) => m.ProviderManageProductsComponent,
          ),
      },
      {
        path: "products/new",
        loadComponent: () =>
          import("./features/marketplace/provider-add-product/provider-add-product.component").then(
            (m) => m.ProviderAddProductComponent,
          ),
      },
      {
        path: "products/:id/edit",
        loadComponent: () =>
          import("./features/marketplace/provider-edit-product/provider-edit-product.component").then(
            (m) => m.ProviderEditProductComponent,
          ),
      },
      {
        path: "products/:id/analytics",
        loadComponent: () =>
          import("./features/marketplace/provider-product-analytics/provider-product-analytics.component").then(
            (m) => m.ProviderProductAnalyticsComponent,
          ),
      },
      {
        path: "rentals",
        loadComponent: () =>
          import("./features/marketplace/provider-rentals/provider-rentals.component").then(
            (m) => m.ProviderRentalsComponent,
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./features/marketplace/provider-profile/provider-profile.component").then(
            (m) => m.ProviderProfileComponent,
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
  // Delivery Provider Portal
  {
    path: "delivery",
    loadComponent: () =>
      import("./features/delivery/delivery-layout/delivery-layout.component").then(
        (m) => m.DeliveryLayoutComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ["ROLE_DELIVERY_PROVIDER"] },
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/delivery/delivery-dashboard/delivery-dashboard.component").then(
            (m) => m.DeliveryDashboardComponent,
          ),
      },
      {
        path: "vehicles",
        loadComponent: () =>
          import("./features/delivery/delivery-vehicles/delivery-vehicles.component").then(
            (m) => m.DeliveryVehiclesComponent,
          ),
      },
      {
        path: "earnings",
        loadComponent: () =>
          import("./features/delivery/delivery-earnings/delivery-earnings.component").then(
            (m) => m.DeliveryEarningsComponent,
          ),
      },
      {
        path: "history",
        loadComponent: () =>
          import("./features/delivery/delivery-history/delivery-history.component").then(
            (m) => m.DeliveryHistoryComponent,
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./features/delivery/delivery-profile/delivery-profile.component").then(
            (m) => m.DeliveryProfileComponent,
          ),
      },
      {
        path: ":deliveryId",
        loadComponent: () =>
          import("./features/delivery/delivery-details/delivery-details.component").then(
            (m) => m.DeliveryDetailsComponent,
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
  // Landing Page
  {
    path: "",
    loadComponent: () =>
      import("./features/landing/landing.component").then(
        (m) => m.LandingComponent,
      ),
  },
  // Admin Portal
  {
    path: "admin",
    loadComponent: () =>
      import("./features/admin/admin-layout/admin-layout.component").then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ["ROLE_ADMIN"] },
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/admin/admin-dashboard/admin-dashboard.component").then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./features/admin/admin-user-management/admin-user-management.component").then(
            (m) => m.AdminUserManagementComponent,
          ),
      },
      {
        path: "analytics",
        loadComponent: () =>
          import("./features/admin/admin-analytics/admin-analytics.component").then(
            (m) => m.AdminAnalyticsComponent,
          ),
      },
      {
        path: "bookings",
        loadComponent: () =>
          import("./features/admin/admin-bookings/admin-bookings.component").then(
            (m) => m.AdminBookingsComponent,
          ),
      },
      {
        path: "sites",
        loadComponent: () =>
          import("./features/admin/admin-sites-management/admin-sites-management.component").then(
            (m) => m.AdminSitesManagementComponent,
          ),
      },
      {
        path: "sites/new",
        loadComponent: () =>
          import("./features/campsites/campsite-form/campsite-form.component").then(
            (m) => m.CampsiteFormComponent,
          ),
      },
      {
        path: "sites/edit/:id",
        loadComponent: () =>
          import("./features/campsites/campsite-form/campsite-form.component").then(
            (m) => m.CampsiteFormComponent,
          ),
      },
      {
        path: "environmental-rules",
        loadComponent: () =>
          import("./features/admin/admin-environmental-rules/admin-environmental-rules.component").then(
            (m) => m.AdminEnvironmentalRulesComponent,
          ),
      },
      {
        path: "marketplace",
        loadComponent: () =>
          import("./features/admin/admin-marketplace/admin-marketplace.component").then(
            (m) => m.AdminMarketplaceComponent,
          ),
      },
      {
        path: "incidents",
        loadComponent: () =>
          import("./features/admin/admin-incident-management/admin-incident-management.component").then(
            (m) => m.AdminIncidentManagementComponent,
          ),
      },
      {
        path: "moderation",
        loadComponent: () =>
          import("./features/admin/admin-moderation/admin-moderation.component").then(
            (m) => m.AdminModerationComponent,
          ),
      },
      {
        path: "trips",
        loadComponent: () =>
          import("./features/admin/admin-trips/admin-trips.component").then(
            (m) => m.AdminTripsComponent,
          ),
      },
      {
        path: "transports",
        loadComponent: () =>
          import("./features/admin/admin-transports/admin-transports.component").then(
            (m) => m.AdminTransportsComponent,
          ),
      },
      {
        path: "academy",
        loadComponent: () =>
          import("./features/admin/admin-academy-governance/admin-academy-governance.component").then(
            (m) => m.AdminAcademyGovernanceComponent,
          ),
      },
      {
        path: "events",
        loadComponent: () =>
          import("./features/admin/admin-events-management/admin-events-management.component").then(
            (m) => m.AdminEventsManagementComponent,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./features/admin/admin-settings/admin-settings.component").then(
            (m) => m.AdminSettingsComponent,
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
  // Main Layout Routes
  {
    path: "",
    component: MainLayoutComponent,
    children: [
      // Dashboard Redirection
      {
        path: "marketplace",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/marketplace/marketplace-landing/marketplace-landing.component").then(
                (m) => m.MarketplaceLandingComponent,
              ),
          },
          {
            path: "category/:id",
            loadComponent: () =>
              import("./features/marketplace/marketplace-category/marketplace-category.component").then(
                (m) => m.MarketplaceCategoryComponent,
              ),
          },
          {
            path: "product/:id",
            loadComponent: () =>
              import("./features/marketplace/marketplace-product-details/marketplace-product-details.component").then(
                (m) => m.MarketplaceProductDetailsComponent,
              ),
          },
        ],
      },
      {
        path: "cart",
        loadComponent: () =>
          import("./features/marketplace/marketplace-cart/marketplace-cart.component").then(
            (m) => m.MarketplaceCartComponent,
          ),
      },
      {
        path: "delivery/track/:orderId",
        loadComponent: () =>
          import("./features/delivery/delivery-tracking/delivery-tracking.component").then(
            (m) => m.DeliveryTrackingComponent,
          ),
      },
      // Role Dashboards
      {
        path: "site-dashboard",
        component: RoleDashboardComponent,
        canActivate: [authGuard],
        data: { roles: ["ROLE_SITE_OWNER"] },
      },
      {
        path: "organizer-dashboard",
        component: RoleDashboardComponent,
        canActivate: [authGuard],
        data: { roles: ["ROLE_ORGANIZER"] },
      },
      // Profile
      {
        path: "profile/edit",
        loadComponent: () =>
          import("./features/auth/profile/camper-edit-profile.component").then(
            (m) => m.CamperEditProfileComponent,
          ),
        canActivate: [authGuard],
        data: {
          roles: [
            "ROLE_USER",
            "ROLE_CAMPER",
            "ROLE_SITE_OWNER",
            "ROLE_EQUIPMENT_PROVIDER",
            "ROLE_ORGANIZER",
            "ROLE_DELIVERY_PROVIDER",
            "ROLE_ADMIN",
          ],
        },
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./features/auth/profile/camper-profile.component").then(
            (m) => m.CamperProfileComponent,
          ),
        canActivate: [authGuard],
        data: {
          roles: [
            "ROLE_USER",
            "ROLE_CAMPER",
            "ROLE_SITE_OWNER",
            "ROLE_EQUIPMENT_PROVIDER",
            "ROLE_ORGANIZER",
            "ROLE_DELIVERY_PROVIDER",
            "ROLE_ADMIN",
          ],
        },
      },
      {
        path: "profile/orders",
        loadComponent: () =>
          import("./features/marketplace/camper-orders/camper-orders.component").then(
            (m) => m.CamperOrdersComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "profile/orders/:orderId",
        loadComponent: () =>
          import("./features/marketplace/camper-order-details/camper-order-details.component").then(
            (m) => m.CamperOrderDetailsComponent,
          ),
        canActivate: [authGuard],
      },
      // Trips
      {
        path: "plan-trip",
        loadComponent: () =>
          import("./features/trips/plan-trip.component").then(
            (m) => m.PlanTripComponent,
          ),
      },
      {
        path: "trips",
        loadComponent: () =>
          import("./features/trips/my-trips.component").then(
            (m) => m.MyTripsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "trips/:id",
        loadComponent: () =>
          import("./features/trips/trip-detail/trip-detail.component").then(
            (m) => m.TripDetailComponent,
          ),
      },
      // Campsites
      {
        path: "campsites",
        loadComponent: () =>
          import("./features/campsites/campsites.component").then(
            (m) => m.CampsitesComponent,
          ),
      },
      {
        path: "campsites/create",
        loadComponent: () =>
          import("./features/campsites/campsite-create/campsite-create.component").then(
            (m) => m.CampsiteCreateComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ["ROLE_SITE_OWNER", "ROLE_ADMIN"] },
      },
      {
        path: "campsites/:id",
        loadComponent: () =>
          import("./features/campsites/campsite-detail/campsite-detail.component").then(
            (m) => m.CampsiteDetailComponent,
          ),
      },
      // Gear
      {
        path: "gear",
        loadComponent: () =>
          import("./features/gear/gear.component").then((m) => m.GearComponent),
      },
      {
        path: "gear/my-gear",
        loadComponent: () =>
          import("./features/gear/my-gear/my-gear.component").then(
            (m) => m.MyGearComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "gear/list",
        loadComponent: () =>
          import("./features/gear/gear-list/gear-list.component").then(
            (m) => m.GearListComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "gear/create",
        loadComponent: () =>
          import("./features/gear/gear-create/gear-create.component").then(
            (m) => m.GearCreateComponent,
          ),
        canActivate: [authGuard],
        data: { roles: ["ROLE_EQUIPMENT_PROVIDER"] },
      },
      {
        path: "gear/:id",
        loadComponent: () =>
          import("./features/gear/gear-detail/gear-detail.component").then(
            (m) => m.GearDetailComponent,
          ),
      },
      {
        path: "rentals",
        loadComponent: () =>
          import("./features/gear/gear-rentals/rentals.component").then(
            (m) => m.RentalsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "deliveries",
        loadComponent: () =>
          import("./features/delivery/deliveries/deliveries.component").then(
            (m) => m.DeliveriesComponent,
          ),
        canActivate: [authGuard],
      },
      // Community
      {
        path: "community",
        loadComponent: () =>
          import("./features/community/community.component").then(
            (m) => m.CommunityComponent,
          ),
      },
      {
        path: "community/feed",
        loadComponent: () =>
          import("./features/community/community-feed/community-feed.component").then(
            (m) => m.CommunityFeedComponent,
          ),
      },
      {
        path: "community/forums",
        loadComponent: () =>
          import("./features/community/forum-home/forum-home.component").then(
            (m) => m.ForumHomeComponent,
          ),
      },
      {
        path: "community/forums/:id",
        loadComponent: () =>
          import("./features/community/forum-category/forum-category.component").then(
            (m) => m.ForumCategoryComponent,
          ),
      },
      {
        path: "community/forums/:forumId/topics/:topicId",
        loadComponent: () =>
          import("./features/community/forum-topic-details/forum-topic-details.component").then(
            (m) => m.ForumTopicDetailsComponent,
          ),
      },
      {
        path: "community/events",
        loadComponent: () =>
          import("./features/community/community-events/community-events.component").then(
            (m) => m.CommunityEventsComponent,
          ),
      },
      {
        path: "community/messaging",
        loadComponent: () =>
          import("./features/community/messaging/messaging.component").then(
            (m) => m.MessagingComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "community/stories",
        loadComponent: () =>
          import("./features/community/trip-stories/trip-stories.component").then(
            (m) => m.TripStoriesComponent,
          ),
      },
      {
        path: "community/leaderboard",
        loadComponent: () =>
          import("./features/community/leaderboard/leaderboard.component").then(
            (m) => m.LeaderboardComponent,
          ),
      },
      {
        path: "community/ask-for-help",
        loadComponent: () =>
          import("./features/community/ask-for-help/ask-for-help.component").then(
            (m) => m.AskForHelpComponent,
          ),
      },
      {
        path: "community/create",
        loadComponent: () =>
          import("./features/community/create-post/create-post.component").then(
            (m) => m.CreatePostComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "community/create-post",
        loadComponent: () =>
          import("./features/community/create-post/create-post.component").then(
            (m) => m.CreatePostComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "community/profile/:id",
        loadComponent: () =>
          import("./features/community/public-profile/public-profile.component").then(
            (m) => m.PublicProfileComponent,
          ),
      },
      {
        path: "community/post/:id",
        loadComponent: () =>
          import("./features/community/post-details/post-details.component").then(
            (m) => m.PostDetailsComponent,
          ),
      },
      {
        path: "community/moderation",
        loadComponent: () =>
          import("./features/community/moderation-dashboard/moderation-dashboard.component").then(
            (m) => m.ModerationDashboardComponent,
          ),
      },
      {
        path: "community/safety-quiz",
        loadComponent: () =>
          import("./features/community/safety-quiz/safety-quiz.component").then(
            (m) => m.SafetyQuizComponent,
          ),
      },
      {
        path: "community/:id",
        loadComponent: () =>
          import("./features/community/post-detail/post-detail.component").then(
            (m) => m.PostDetailComponent,
          ),
      },
      // Academy
      {
        path: "academy",
        loadComponent: () =>
          import("./features/academy/academy.component").then(
            (m) => m.AcademyComponent,
          ),
      },
      {
        path: "academy/:id",
        loadComponent: () =>
          import("./features/academy/course-detail/course-detail.component").then(
            (m) => m.CourseDetailComponent,
          ),
      },
      {
        path: "academy/video/:videoId",
        loadComponent: () =>
          import("./features/academy/knowledge-video/knowledge-video.component").then(
            (m) => m.KnowledgeVideoComponent,
          ),
      },
      {
        path: "academy/expert/:expertId",
        loadComponent: () =>
          import("./features/academy/expert-profile/expert-profile.component").then(
            (m) => m.ExpertProfileComponent,
          ),
      },
      {
        path: "academy/certifications",
        loadComponent: () =>
          import("./features/academy/certification-programs/certification-programs.component").then(
            (m) => m.CertificationProgramsComponent,
          ),
      },
      {
        path: "academy/my-progress",
        loadComponent: () =>
          import("./features/academy/certification-progress/certification-progress.component").then(
            (m) => m.CertificationProgressComponent,
          ),
      },
      {
        path: "academy/my-badges",
        loadComponent: () =>
          import("./features/academy/my-badges/my-badges.component").then(
            (m) => m.MyBadgesComponent,
          ),
      },
      // Safety
      {
        path: "safety",
        loadComponent: () =>
          import("./features/safety/safety.component").then(
            (m) => m.SafetyComponent,
          ),
      },
      {
        path: "safety/alerts",
        loadComponent: () =>
          import("./features/safety/safety-alerts/safety-alerts.component").then(
            (m) => m.SafetyAlertsComponent,
          ),
      },
      {
        path: "safety/map",
        loadComponent: () =>
          import("./features/safety/safety-map/safety-map.component").then(
            (m) => m.SafetyMapComponent,
          ),
      },
      {
        path: "safety/active-alerts",
        loadComponent: () =>
          import("./features/safety/active-alerts/active-alerts.component").then(
            (m) => m.ActiveAlertsComponent,
          ),
      },
      {
        path: "safety/report",
        loadComponent: () =>
          import("./features/safety/report-incident/report-incident.component").then(
            (m) => m.ReportIncidentComponent,
          ),
      },
      {
        path: "safety/report-incident",
        loadComponent: () =>
          import("./features/safety/report-incident/report-incident.component").then(
            (m) => m.ReportIncidentComponent,
          ),
      },
      {
        path: "safety/analytics",
        loadComponent: () =>
          import("./features/safety/safety-analytics/safety-analytics.component").then(
            (m) => m.SafetyAnalyticsComponent,
          ),
      },
      {
        path: "safety/checkin",
        loadComponent: () =>
          import("./features/safety/trip-checkin/trip-checkin.component").then(
            (m) => m.TripCheckinComponent,
          ),
      },
      {
        path: "safety/compliance/:tripId",
        loadComponent: () =>
          import("./features/safety/trip-compliance-report/trip-compliance-report.component").then(
            (m) => m.TripComplianceReportComponent,
          ),
      },
      {
        path: "safety/compliance-detail",
        loadComponent: () =>
          import("./features/safety/trip-compliance-detail/trip-compliance-detail.component").then(
            (m) => m.TripComplianceDetailComponent,
          ),
      },
      {
        path: "safety/wildlife",
        loadComponent: () =>
          import("./features/safety/wildlife-regulations/wildlife-regulations.component").then(
            (m) => m.WildlifeRegulationsComponent,
          ),
      },
      {
        path: "safety/zones",
        loadComponent: () =>
          import("./features/safety/environmental-zones/environmental-zones.component").then(
            (m) => m.EnvironmentalZonesComponent,
          ),
      },
      {
        path: "environmental",
        loadComponent: () =>
          import("./features/safety/environmental-compliance/environmental-compliance.component").then(
            (m) => m.EnvironmentalComplianceComponent,
          ),
      },
      // Dashboard
      {
        path: "dashboard",
        redirectTo: "profile",
        pathMatch: "full",
      },
      // Booking Flow
      {
        path: "dashboard/bookings",
        loadComponent: () =>
          import("./features/bookings/booking-management/booking-management.component").then(
            (m) => m.BookingManagementComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "discover",
        loadComponent: () =>
          import("./features/bookings/availability-search/availability-search.component").then(
            (m) => m.AvailabilitySearchComponent,
          ),
      },
      {
        path: "booking/reserve/:siteId",
        loadComponent: () =>
          import("./features/bookings/reservation-create/reservation-create.component").then(
            (m) => m.ReservationCreateComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "booking/confirmation",
        loadComponent: () =>
          import("./features/bookings/booking-confirmation/booking-confirmation.component").then(
            (m) => m.BookingConfirmationComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "booking/details/:id",
        loadComponent: () =>
          import("./features/bookings/booking-detail/booking-detail.component").then(
            (m) => m.BookingDetailComponent,
          ),
      },
      {
        path: "booking/edit/:id",
        loadComponent: () =>
          import("./features/bookings/booking-edit/booking-edit.component").then(
            (m) => m.BookingEditComponent,
          ),
      },
      {
        path: "booking/cancel/:bookingId",
        loadComponent: () =>
          import("./features/bookings/booking-cancel/booking-cancel.component").then(
            (m) => m.BookingCancelComponent,
          ),
        canActivate: [authGuard],
      },
      // Companion Matching
      {
        path: "companions",
        loadComponent: () =>
          import("./features/companions/companions-layout/companions-layout").then(
            (m) => m.CompanionsLayout,
          ),
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/companions/companion-discovery/companion-discovery").then(
                (m) => m.CompanionDiscovery,
              ),
          },
          {
            path: "profile",
            loadComponent: () =>
              import("./features/companions/companion-profile-form/companion-profile-form").then(
                (m) => m.CompanionProfileForm,
              ),
          },
          {
            path: "connections",
            loadComponent: () =>
              import("./features/companions/companion-connections/companion-connections").then(
                (m) => m.CompanionConnections,
              ),
          },
        ],
      },
      {
        path: "companions/preferences",
        loadComponent: () =>
          import("./features/companions/matching-preferences/matching-preferences.component").then(
            (m) => m.MatchingPreferencesComponent,
          ),
      },
      {
        path: "companions/matches",
        loadComponent: () =>
          import("./features/companions/match-suggestions/match-suggestions.component").then(
            (m) => m.MatchSuggestionsComponent,
          ),
      },
      {
        path: "companions/match/:matchId",
        loadComponent: () =>
          import("./features/companions/match-detail/match-detail.component").then(
            (m) => m.MatchDetailComponent,
          ),
      },
      {
        path: "companions/create-group",
        loadComponent: () =>
          import("./features/companions/create-group-trip/create-group-trip.component").then(
            (m) => m.CreateGroupTripComponent,
          ),
      },
      {
        path: "companions/group/:groupId",
        loadComponent: () =>
          import("./features/companions/group-management/group-management.component").then(
            (m) => m.GroupManagementComponent,
          ),
      },
      {
        path: "companions/groups",
        loadComponent: () =>
          import("./features/companions/my-groups/my-groups.component").then(
            (m) => m.MyGroupsComponent,
          ),
      },
      // Groups Management
      {
        path: "groups/my-groups",
        loadComponent: () =>
          import("./features/companions/my-groups/my-groups.component").then(
            (m) => m.MyGroupsComponent,
          ),
      },
      {
        path: "groups/create",
        loadComponent: () =>
          import("./features/groups/group-create/group-create.component").then(
            (m) => m.GroupCreateComponent,
          ),
      },
      {
        path: "groups/invitations",
        loadComponent: () =>
          import("./features/groups/group-invitations/group-invitations.component").then(
            (m) => m.GroupInvitationsComponent,
          ),
      },
      {
        path: "groups/:id",
        loadComponent: () =>
          import("./features/groups/group-dashboard/group-dashboard.component").then(
            (m) => m.GroupDashboardComponent,
          ),
      },
      {
        path: "groups/:id/:tab",
        loadComponent: () =>
          import("./features/groups/group-dashboard/group-dashboard.component").then(
            (m) => m.GroupDashboardComponent,
          ),
      },
      // Trip Planning Extended
      {
        path: "trip-intents",
        loadComponent: () =>
          import("./features/trip-intents/trip-intent-feed/trip-intent-feed.component").then(
            (m) => m.TripIntentFeedComponent,
          ),
      },
      {
        path: "trip-intents/create",
        loadComponent: () =>
          import("./features/trip-intents/trip-intent-create/trip-intent-create.component").then(
            (m) => m.TripIntentCreateComponent,
          ),
      },
      {
        path: "trip-intents/edit/:id",
        loadComponent: () =>
          import("./features/trip-intents/trip-intent-edit/trip-intent-edit").then(
            (m) => m.TripIntentEditComponent,
          ),
      },
      {
        path: "my-trip-intents",
        loadComponent: () =>
          import("./features/trip-intents/my-trip-intents/my-trip-intents.component").then(
            (m) => m.MyTripIntentsComponent,
          ),
      },
      {
        path: "trip-intents/:id",
        loadComponent: () =>
          import("./features/trip-intents/trip-intent-detail/trip-intent-detail.component").then(
            (m) => m.TripIntentDetailComponent,
          ),
      },
      {
        path: "invites",
        loadComponent: () =>
          import("./features/trip-intents/group-invites-manager/group-invites-manager.component").then(
            (m) => m.GroupInvitesManagerComponent,
          ),
      },
      {
        path: "plan-trip/create",
        loadComponent: () =>
          import("./features/trips/trip-create/trip-create.component").then(
            (m) => m.TripCreateComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "plan-trip/:tripId/itinerary",
        loadComponent: () =>
          import("./features/trips/trip-itinerary/trip-itinerary.component").then(
            (m) => m.TripItineraryComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "plan-trip/:tripId/packing",
        loadComponent: () =>
          import("./features/trips/trip-packing/trip-packing.component").then(
            (m) => m.TripPackingComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: "plan-trip/:tripId/budget",
        loadComponent: () =>
          import("./features/trips/trip-budget/trip-budget.component").then(
            (m) => m.TripBudgetComponent,
          ),
      },
      {
        path: "plan-trip/:tripId/nearby",
        loadComponent: () =>
          import("./features/trips/trip-nearby/trip-nearby.component").then(
            (m) => m.TripNearbyComponent,
          ),
      },
      {
        path: "packing-lists",
        loadComponent: () =>
          import("./features/trips/packing-lists/packing-lists.component").then(
            (m) => m.PackingListsComponent,
          ),
      },
      {
        path: "budget-estimation",
        loadComponent: () =>
          import("./features/trips/budget-estimation/budget-estimation.component").then(
            (m) => m.BudgetEstimationComponent,
          ),
      },
      {
        path: "recommended-places",
        loadComponent: () =>
          import("./features/trips/recommended-places/recommended-places.component").then(
            (m) => m.RecommendedPlacesComponent,
          ),
      },
      // Gear Extended (from Nawres)
      {
        path: "gear/cart",
        loadComponent: () =>
          import("./features/gear/gear-cart/gear-cart.component").then(
            (m) => m.GearCartComponent,
          ),
      },
      {
        path: "gear/kits",
        loadComponent: () =>
          import("./features/gear/gear-kits/gear-kits.component").then(
            (m) => m.GearKitsComponent,
          ),
      },

      {
        path: "gear/delivery",
        loadComponent: () =>
          import("./features/gear/delivery-logistics/delivery-logistics.component").then(
            (m) => m.DeliveryLogisticsComponent,
          ),
      },
      {
        path: "gear/delivery/:deliveryId",
        loadComponent: () =>
          import("./features/gear/delivery-tracking/delivery-tracking.component").then(
            (m) => m.DeliveryTrackingComponent,
          ),
      },
      {
        path: "gear/provider",
        loadComponent: () =>
          import("./features/gear/provider-deliveries/provider-deliveries.component").then(
            (m) => m.ProviderDeliveriesComponent,
          ),
      },
      // Transportation (from Nawres)
      {
        path: "transportation",
        loadComponent: () =>
          import("./features/transportation/transportation-overview/transportation-overview.component").then(
            (m) => m.TransportationOverviewComponent,
          ),
      },
      {
        path: "transportation/options",
        loadComponent: () =>
          import("./features/transportation/transportation-options/transportation-options.component").then(
            (m) => m.TransportationOptionsComponent,
          ),
      },
      {
        path: "transportation/route/:optionId",
        loadComponent: () =>
          import("./features/transportation/route-breakdown/route-breakdown.component").then(
            (m) => m.RouteBreakdownComponent,
          ),
      },
      {
        path: "transportation/confirm",
        loadComponent: () =>
          import("./features/transportation/transport-confirmation/transport-confirmation.component").then(
            (m) => m.TransportConfirmationComponent,
          ),
      },
      // Events (from Nawres)
      {
        path: "events",
        loadComponent: () =>
          import("./features/events/events-home/events-home.component").then(
            (m) => m.EventsHomeComponent,
          ),
      },
      {
        path: "events/:eventId",
        loadComponent: () =>
          import("./features/events/event-details/event-details.component").then(
            (m) => m.EventDetailsComponent,
          ),
      },
      // Delivery Provider Login
      {
        path: "delivery-provider/login",
        loadComponent: () =>
          import("./features/auth/login.component").then(
            (m) => m.LoginComponent,
          ),
      },
    ],
  },
  // Wildcard - redirect to landing
  {
    path: "**",
    redirectTo: "",
  },
];
