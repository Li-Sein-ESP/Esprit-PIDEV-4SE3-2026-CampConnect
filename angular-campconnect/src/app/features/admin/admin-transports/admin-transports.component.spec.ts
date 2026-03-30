import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { AdminTransportsComponent } from "./admin-transports.component";
import { TransportationService } from "../../transportation/services/transportation.service";
import { AuthService } from "../../../core/services/auth.service";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { of, throwError } from "rxjs";

describe("AdminTransportsComponent", () => {
  let component: AdminTransportsComponent;
  let mockTransportService: jasmine.SpyObj<TransportationService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockHttp: jasmine.SpyObj<HttpClient>;

  const mockTransports = [
    {
      id: "tr-001",
      mode: "BUS",
      provider: "TunisiaBus",
      duration: 120,
      cost: 150,
      tripId: "trip-001",
      imageUrl: "",
    },
    {
      id: "tr-002",
      mode: "CAR",
      provider: "CarRoute",
      duration: 90,
      cost: 200,
      tripId: "",
      imageUrl: "",
    },
  ];

  const mockTrips = [
    {
      id: "trip-001",
      title: "Atlas Trek",
      name: "Atlas Trek",
      destination: { address: "Morocco" },
    },
    {
      id: "trip-002",
      title: "Sahara Camp",
      name: "Sahara Camp",
      destination: { address: "Tunisia" },
    },
  ];

  beforeEach(() => {
    mockTransportService = jasmine.createSpyObj("TransportationService", [
      "getAllTransports",
      "createTransport",
      "updateTransport",
      "deleteTransport",
    ]);
    mockAuthService = jasmine.createSpyObj("AuthService", ["getToken"], {
      currentUserValue: { id: "admin-001" },
    });
    mockHttp = jasmine.createSpyObj("HttpClient", [
      "get",
      "post",
      "put",
      "delete",
    ]);

    mockTransportService.getAllTransports.and.returnValue(
      of(mockTransports as any),
    );
    mockTransportService.createTransport.and.returnValue(
      of({ ...mockTransports[0], id: "tr-003" } as any),
    );
    mockTransportService.updateTransport.and.returnValue(
      of({ ...mockTransports[0], provider: "UpdatedBus" } as any),
    );
    mockTransportService.deleteTransport.and.returnValue(of(undefined as any));
    mockAuthService.getToken.and.returnValue("fake-jwt-token");
    mockHttp.get.and.returnValue(of(mockTrips));

    TestBed.configureTestingModule({
      imports: [AdminTransportsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TransportationService, useValue: mockTransportService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: HttpClient, useValue: mockHttp },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });

    const fixture = TestBed.createComponent(AdminTransportsComponent);
    component = fixture.componentInstance;
  });

  // ─── Init ────────────────────────────────────────────────────────────────

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should load transports on init", () => {
    component.ngOnInit();
    expect(mockTransportService.getAllTransports).toHaveBeenCalled();
    expect(component.transports().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it("should set isLoading to false when loadAllTransports fails", () => {
    mockTransportService.getAllTransports.and.returnValue(
      throwError(() => new Error("Server error")),
    );
    component.ngOnInit();
    expect(component.isLoading()).toBeFalse();
  });

  // ─── Filter ──────────────────────────────────────────────────────────────

  it("should filter transports by provider", () => {
    component.ngOnInit();
    component.searchQuery = "tunisiabus";
    component.filterTransports();
    expect(component.filteredTransports().length).toBe(1);
    expect(component.filteredTransports()[0].provider).toBe("TunisiaBus");
  });

  it("should filter transports by mode", () => {
    component.ngOnInit();
    component.searchQuery = "car";
    component.filterTransports();
    expect(component.filteredTransports().length).toBe(1);
    expect(component.filteredTransports()[0].mode).toBe("CAR");
  });

  it("should show all transports when search is empty", () => {
    component.ngOnInit();
    component.searchQuery = "";
    component.filterTransports();
    expect(component.filteredTransports().length).toBe(2);
  });

  // ─── Mode Stats ──────────────────────────────────────────────────────────

  it("should correctly compute mode stats", () => {
    component.ngOnInit();
    const stats = component.modeStats();
    const busStats = stats.find((s) => s.mode === "BUS");
    const carStats = stats.find((s) => s.mode === "CAR");
    expect(busStats?.count).toBe(1);
    expect(carStats?.count).toBe(1);
  });

  // ─── Mode Color / Icon ───────────────────────────────────────────────────

  it("should return correct color class for BUS", () => {
    expect(component.getModeColor("BUS")).toContain("indigo");
  });

  it("should return correct color class for CAR", () => {
    expect(component.getModeColor("CAR")).toContain("teal");
  });

  it("should return correct color class for TRAIN", () => {
    expect(component.getModeColor("TRAIN")).toContain("amber");
  });

  it("should return default color for unknown mode", () => {
    expect(component.getModeColor("UNKNOWN")).toContain("slate");
  });

  // ─── Trip Lookup ─────────────────────────────────────────────────────────

  it("should return trip name from availableTrips", () => {
    component.availableTrips.set(mockTrips);
    expect(component.getTripName("trip-001")).toBe("Atlas Trek");
  });

  it("should return fallback when tripId not found", () => {
    component.availableTrips.set([]);
    expect(component.getTripName("non-existent")).toBe("Assigned Trip");
  });

  it("should return trip destination from availableTrips", () => {
    component.availableTrips.set(mockTrips);
    expect(component.getTripDestination("trip-001")).toBe("Morocco");
  });

  // ─── Modal ───────────────────────────────────────────────────────────────

  it("should open create modal in create mode", () => {
    component.openCreateModal();
    expect(component.isModalOpen()).toBeTrue();
    expect(component.editingId()).toBeNull();
    expect(component.formData.provider).toBe("");
  });

  it("should open edit modal with transport data", () => {
    component.editTransport(mockTransports[0]);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.editingId()).toBe("tr-001");
    expect(component.formData.provider).toBe("TunisiaBus");
    expect(component.formData.mode).toBe("BUS");
    expect(component.formData.cost).toBe(150);
  });

  it("should close modal and reset form", () => {
    component.openCreateModal();
    component.formData.provider = "TestBus";
    component.closeModal();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.formData.provider).toBe("");
    expect(component.editingId()).toBeNull();
  });

  // ─── Create ──────────────────────────────────────────────────────────────

  it("should call createTransport when editingId is null", fakeAsync(() => {
    component.openCreateModal();
    component.formData.mode = "BUS";
    component.formData.provider = "NewBus";
    component.formData.cost = 100;
    component.formData.duration = 60;

    component.submitTransport();
    tick(1600);

    expect(mockTransportService.createTransport).toHaveBeenCalled();
    expect(component.submitSuccess()).toBeTrue();
  }));

  // ─── Update ──────────────────────────────────────────────────────────────

  it("should call updateTransport when editingId is set", fakeAsync(() => {
    component.editTransport(mockTransports[0]);
    component.formData.provider = "UpdatedBus";

    component.submitTransport();
    tick(1600);

    expect(mockTransportService.updateTransport).toHaveBeenCalledWith(
      "tr-001",
      jasmine.any(Object),
    );
    expect(component.submitSuccess()).toBeTrue();
  }));

  // ─── Delete ──────────────────────────────────────────────────────────────

  it("should call deleteTransport and reload on confirm", () => {
    spyOn(window, "confirm").and.returnValue(true);
    component.ngOnInit();
    component.onDeleteTransport("tr-001");
    expect(mockTransportService.deleteTransport).toHaveBeenCalledWith("tr-001");
    expect(mockTransportService.getAllTransports).toHaveBeenCalledTimes(2);
  });

  it("should NOT delete when confirm is cancelled", () => {
    spyOn(window, "confirm").and.returnValue(false);
    component.onDeleteTransport("tr-001");
    expect(mockTransportService.deleteTransport).not.toHaveBeenCalled();
  });
});
