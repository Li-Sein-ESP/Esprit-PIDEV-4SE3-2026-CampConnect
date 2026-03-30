import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { signal } from "@angular/core";
import { AdminTripsComponent } from "./admin-trips.component";
import { TripService } from "../../trips/services/trip.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { of, throwError } from "rxjs";

describe("AdminTripsComponent", () => {
  let component: AdminTripsComponent;
  let mockTripService: jasmine.SpyObj<TripService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockTrips = [
    {
      id: "trip-001",
      title: "Atlas Mountains Trek",
      name: "Atlas Mountains Trek",
      destination: "Atlas, Morocco",
      startDate: "2026-07-01T00:00:00Z",
      endDate: "2026-07-07T00:00:00Z",
      participants: 6,
      status: "PLANNED",
      difficulty: "HARD",
      totalBudget: 800,
      template: true,
      imageUrl: "",
    },
    {
      id: "trip-002",
      title: "Sahara Desert Camp",
      name: "Sahara Desert Camp",
      destination: "Douz, Tunisia",
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-01-05T00:00:00Z",
      participants: 4,
      status: "COMPLETED",
      difficulty: "EASY",
      totalBudget: 400,
      template: false,
      imageUrl: "",
    },
  ];

  beforeEach(() => {
    mockTripService = jasmine.createSpyObj("TripService", [
      "getAllTripsAdmin",
      "createTrip",
      "updateTrip",
      "deleteTrip",
    ]);
    mockAuthService = jasmine.createSpyObj("AuthService", [], {
      currentUserValue: { id: "admin-id-001", username: "admin" },
    });

    mockTripService.getAllTripsAdmin.and.returnValue(of(mockTrips));
    mockTripService.createTrip.and.returnValue(
      of({ ...mockTrips[0], id: "trip-003" }),
    );
    mockTripService.updateTrip.and.returnValue(
      of({ ...mockTrips[0], title: "Updated Title" }),
    );
    mockTripService.deleteTrip.and.returnValue(of(undefined as any));

    TestBed.configureTestingModule({
      imports: [AdminTripsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TripService, useValue: mockTripService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });

    const fixture = TestBed.createComponent(AdminTripsComponent);
    component = fixture.componentInstance;
  });

  // ─── Init ────────────────────────────────────────────────────────────────

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should load trips on init", () => {
    component.ngOnInit();
    expect(mockTripService.getAllTripsAdmin).toHaveBeenCalled();
    expect(component.trips().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it("should set isLoading to false even if loadTrips fails", () => {
    mockTripService.getAllTripsAdmin.and.returnValue(
      throwError(() => new Error("Server error")),
    );
    component.ngOnInit();
    expect(component.isLoading()).toBeFalse();
  });

  // ─── Filter ──────────────────────────────────────────────────────────────

  it("should filter trips by search query (name)", () => {
    component.ngOnInit();
    component.searchQuery = "atlas";
    component.filterTrips();
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].name).toBe("Atlas Mountains Trek");
  });

  it("should filter trips by destination", () => {
    component.ngOnInit();
    component.searchQuery = "douz";
    component.filterTrips();
    expect(component.filteredTrips().length).toBe(1);
    expect(component.filteredTrips()[0].destination).toBe("Douz, Tunisia");
  });

  it("should show all trips when search query is empty", () => {
    component.ngOnInit();
    component.searchQuery = "";
    component.filterTrips();
    expect(component.filteredTrips().length).toBe(2);
  });

  // ─── Stats ───────────────────────────────────────────────────────────────

  it("should correctly count template trips", () => {
    component.ngOnInit();
    expect(component.getTemplateCount()).toBe(1);
  });

  it("should correctly compute upcoming trips", () => {
    component.ngOnInit();
    // Only trip-001 has a future start date (2026-07-01)
    expect(component.getUpcomingCount()).toBe(1);
  });

  it("should correctly compute average participants", () => {
    component.ngOnInit();
    // (6 + 4) / 2 = 5
    expect(component.getAvgParticipants()).toBe(5);
  });

  it("should return 0 avg participants when no trips", () => {
    mockTripService.getAllTripsAdmin.and.returnValue(of([]));
    component.ngOnInit();
    expect(component.getAvgParticipants()).toBe(0);
  });

  // ─── Modal ───────────────────────────────────────────────────────────────

  it("should open create modal in create mode", () => {
    component.openCreateModal();
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeFalse();
    expect(component.editingId()).toBeNull();
  });

  it("should open edit modal with trip data pre-filled", () => {
    component.ngOnInit();
    const trip = component.trips()[0];
    component.openEditModal(trip);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.isEditMode()).toBeTrue();
    expect(component.editingId()).toBe("trip-001");
    expect(component.formData.name).toBe("Atlas Mountains Trek");
    expect(component.formData.destination).toBe("Atlas, Morocco");
  });

  it("should close modal and reset form", () => {
    component.openCreateModal();
    component.formData.name = "Temp Name";
    component.closeModal();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.formData.name).toBe("");
  });

  // ─── Create ──────────────────────────────────────────────────────────────

  it("should call createTrip and reload on submit in create mode", fakeAsync(() => {
    component.ngOnInit();
    component.openCreateModal();
    component.formData.name = "New Trip";
    component.formData.destination = "Tunis";
    component.formData.startDate = "2026-08-01";
    component.formData.endDate = "2026-08-07";

    component.submitForm();
    tick(1600); // Wait for setTimeout closeModal

    expect(mockTripService.createTrip).toHaveBeenCalled();
    expect(mockTripService.getAllTripsAdmin).toHaveBeenCalledTimes(2); // init + reload
    expect(component.submitSuccess()).toBeTrue();
  }));

  // ─── Update ──────────────────────────────────────────────────────────────

  it("should call updateTrip on submit in edit mode", fakeAsync(() => {
    component.ngOnInit();
    component.openEditModal(component.trips()[0]);
    component.formData.name = "Updated Atlas Trek";

    component.submitForm();
    tick(1600);

    expect(mockTripService.updateTrip).toHaveBeenCalledWith(
      "trip-001",
      jasmine.any(Object),
    );
    expect(component.submitSuccess()).toBeTrue();
  }));

  // ─── Delete ──────────────────────────────────────────────────────────────

  it("should call deleteTrip and remove from list on confirm", () => {
    spyOn(window, "confirm").and.returnValue(true);
    component.ngOnInit();
    component.deleteTrip("trip-001");
    expect(mockTripService.deleteTrip).toHaveBeenCalledWith("trip-001");
    expect(component.trips().find((t) => t.id === "trip-001")).toBeUndefined();
  });

  it("should NOT delete trip when confirm is cancelled", () => {
    spyOn(window, "confirm").and.returnValue(false);
    component.ngOnInit();
    component.deleteTrip("trip-001");
    expect(mockTripService.deleteTrip).not.toHaveBeenCalled();
    expect(component.trips().length).toBe(2);
  });

  // ─── Status Styles ───────────────────────────────────────────────────────

  it("should return correct CSS classes for PLANNED status", () => {
    expect(component.getStatusStyles("PLANNED")).toContain("blue");
  });

  it("should return correct CSS classes for COMPLETED status", () => {
    expect(component.getStatusStyles("COMPLETED")).toContain("slate");
  });

  it("should return correct CSS classes for ACTIVE status", () => {
    expect(component.getStatusStyles("ACTIVE")).toContain("emerald");
  });
});
