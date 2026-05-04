package com.campconnect.config;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campconnect.delivery.model.Vehicle;
import com.campconnect.delivery.model.VehicleStatus;
import com.campconnect.delivery.model.Warehouse;
import com.campconnect.delivery.repository.VehicleRepository;
import com.campconnect.delivery.repository.WarehouseRepository;
import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearInventory;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.repository.GearInventoryRepository;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.model.ERole;
import com.campconnect.model.Role;
import com.campconnect.model.User;
import com.campconnect.repository.RoleRepository;
import com.campconnect.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    WarehouseRepository warehouseRepository;

    @Autowired
    VehicleRepository vehicleRepository;

    @Autowired
    GearRepository gearRepository;

    @Autowired
    GearInventoryRepository gearInventoryRepository;

    @Autowired
    MongoTemplate mongoTemplate;

    @Value("${delivery.default.provider.email:delivery@mail.com}")
    private String defaultDeliveryProviderEmail;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_USER));
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        if (roleRepository.findByName(ERole.ROLE_CAMPER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_CAMPER));
        if (roleRepository.findByName(ERole.ROLE_SITE_OWNER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_SITE_OWNER));
        if (roleRepository.findByName(ERole.ROLE_EQUIPMENT_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_EQUIPMENT_PROVIDER));
        if (roleRepository.findByName(ERole.ROLE_ORGANIZER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_ORGANIZER));
        if (roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER).isEmpty())
            roleRepository.save(new Role(ERole.ROLE_DELIVERY_PROVIDER));

        // Initialize Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@campconnect.com", encoder.encode("admin123"), "Administrator");
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("camper")) {
            User camper = new User("camper", "camper@campconnect.com", encoder.encode("camper123"), "Happy Camper");
            Set<Role> roles = new HashSet<>();
            Role camperRole = roleRepository.findByName(ERole.ROLE_CAMPER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(camperRole);
            camper.setRoles(roles);
            userRepository.save(camper);
        }

        if (!userRepository.existsByUsername("delivery")) {
            User delivery = new User("delivery", "delivery@campconnect.com", encoder.encode("delivery123"), "Delivery Driver");
            Set<Role> roles = new HashSet<>();
            Role deliveryRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(deliveryRole);
            delivery.setRoles(roles);
            userRepository.save(delivery);
        }

        // Also seed delivery@mail.com if not present (this is the user the system targets by default)
        if (!userRepository.existsByEmail("delivery@mail.com")) {
            User deliveryMain = new User("deliverymain", "delivery@mail.com", encoder.encode("delivery123"), "Delivery Provider");
            Set<Role> roles = new HashSet<>();
            Role deliveryRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(deliveryRole);
            deliveryMain.setRoles(roles);
            userRepository.save(deliveryMain);
            System.out.println("[DataInit] Seeded delivery@mail.com as delivery provider");
        }

        // Seed delivery infrastructure (warehouse + vehicle) for the default delivery provider
        seedDeliveryInfrastructure();

        // Seed gear inventory so all gears are available at the default warehouse
        seedGearInventory();

        // Patch existing gears that have no weight with category-based averages
        seedGearWeights();
    }

    /**
     * Ensures the default delivery provider (delivery@mail.com or configured email)
     * has at least one warehouse and one vehicle so deliveries can be assigned.
     */
    private void seedDeliveryInfrastructure() {
        // Find the delivery provider user — try configured email first, then fallback seeded account
        User deliveryProvider = userRepository.findByEmail(defaultDeliveryProviderEmail).orElse(null);
        if (deliveryProvider == null) {
            deliveryProvider = userRepository.findByEmail("delivery@campconnect.com").orElse(null);
        }
        if (deliveryProvider == null) {
            return; // No delivery provider user found — skip
        }

        String providerId = deliveryProvider.getId();

        // Seed default warehouse if this provider has none
        if (!warehouseRepository.existsByProviderIdAndDeletedFalse(providerId)) {
            Warehouse warehouse = new Warehouse();
            warehouse.setProviderId(providerId);
            warehouse.setName("CampConnect Main Warehouse");
            warehouse.setAddress("Tunis, Tunisia");
            warehouse.setLatitude(36.8065);
            warehouse.setLongitude(10.1815);
            warehouse.setZone("TUNIS");
            warehouse.setDeleted(false);
            warehouseRepository.save(warehouse);
            System.out.println("[DataInit] Created default warehouse for delivery provider: " + defaultDeliveryProviderEmail);
        }

        // Seed default vehicle if this provider has none
        List<Vehicle> providerVehicles = vehicleRepository.findByProviderIdAndDeletedFalse(providerId);
        if (providerVehicles.isEmpty()) {
            Vehicle vehicle = new Vehicle();
            vehicle.setPlateNumber("CC-DELIVERY-001");
            vehicle.setCapacity(500.0);
            vehicle.setMaxCapacityKg(500.0);
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicle.setProviderId(providerId);
            vehicle.setDriverId(providerId);
            vehicle.setVehicleType("VAN");
            vehicle.setCoverageZones(new ArrayList<>(List.of("TUNIS", "NORTH", "SOUTH", "CENTRE", "EAST", "WEST")));
            vehicle.setLatitude(36.8065);
            vehicle.setLongitude(10.1815);
            vehicle.setDeleted(false);

            // Check if plate already exists (from a previous run with different provider)
            if (!vehicleRepository.existsByPlateNumberAndDeletedFalse("CC-DELIVERY-001")) {
                vehicleRepository.save(vehicle);
                System.out.println("[DataInit] Created default vehicle for delivery provider: " + defaultDeliveryProviderEmail);
            }
        }
    }

    /**
     * Seeds GearInventory records linking every gear to the default warehouse.
     * This is needed so findNearestWarehouseWithStock() can find a warehouse during checkout.
     * Only creates records for gears that have no inventory at the default warehouse yet.
     */
    private void seedGearInventory() {
        // Find the default warehouse (seeded for delivery@mail.com)
        User deliveryProvider = userRepository.findByEmail(defaultDeliveryProviderEmail).orElse(null);
        if (deliveryProvider == null) {
            deliveryProvider = userRepository.findByEmail("delivery@campconnect.com").orElse(null);
        }
        if (deliveryProvider == null) {
            System.out.println("[DataInit] No delivery provider found — skipping gear inventory seeding");
            return;
        }

        List<com.campconnect.delivery.model.Warehouse> warehouses =
                warehouseRepository.findByProviderIdAndDeletedFalse(deliveryProvider.getId());
        if (warehouses.isEmpty()) {
            System.out.println("[DataInit] No warehouse found for delivery provider — skipping gear inventory seeding");
            return;
        }

        String warehouseId = warehouses.get(0).getId();

        // Seed each gear that doesn't already have inventory at this warehouse
        List<Gear> allGears = gearRepository.findAll();
        int seeded = 0;
        for (Gear gear : allGears) {
            if (gear.isDeleted()) continue;
            boolean exists = gearInventoryRepository.findByGearIdAndWarehouseId(gear.getId(), warehouseId).isPresent();
            if (!exists) {
                GearInventory inv = new GearInventory();
                inv.setGearId(gear.getId());
                inv.setWarehouseId(warehouseId);
                // Use the gear's own quantity as initial stock, minimum 10 to ensure availability
                inv.setQuantity(Math.max(gear.getQuantity() > 0 ? gear.getQuantity() : 10, 10));
                try {
                    gearInventoryRepository.save(inv);
                    seeded++;
                } catch (org.springframework.dao.DuplicateKeyException e) {
                    // Already exists (race condition or stale existence check) — skip silently
                }
            }
        }
        if (seeded > 0) {
            System.out.println("[DataInit] Seeded inventory for " + seeded + " gears at warehouse " + warehouseId);
        }
    }

    /**
     * Patches existing gears that have weightKg == 0 with a sensible category-based average.
     * This runs on startup and is idempotent: gears that already have a weight are skipped.
     *
     * Category averages (kg):
     *   Tents & Shelters        → 3.5 kg
     *   Backpacks & Bags        → 1.8 kg
     *   Sleeping Gear           → 1.5 kg
     *   Camp Kitchen            → 2.5 kg
     *   Lighting                → 0.5 kg
     *   Navigation & Electronics→ 0.4 kg
     *   Tools & Repair          → 1.0 kg
     *   Safety & First Aid      → 0.8 kg
     *   (default / unknown)     → 1.5 kg
     */
    private void seedGearWeights() {
        List<Gear> gears = gearRepository.findAll();
        int patched = 0;
        for (Gear gear : gears) {
            if (gear.isDeleted() || gear.getWeightKg() > 0) continue;
            double avg = categoryAverageWeight(gear.getCategory());
            // Use MongoTemplate targeted update instead of repository.save() to avoid
            // potential duplicate-key errors from Spring Data's insert-or-update detection
            Query q = new Query(Criteria.where("_id").is(gear.getId()));
            Update u = new Update().set("weightKg", avg);
            mongoTemplate.updateFirst(q, u, Gear.class);
            patched++;
        }
        if (patched > 0) {
            System.out.println("[DataInit] Patched weight for " + patched + " existing gears based on category averages");
        }
    }

    private double categoryAverageWeight(String category) {
        if (category == null) return 1.5;
        return switch (category.trim()) {
            case "Tents & Shelters"         -> 3.5;
            case "Backpacks & Bags"         -> 1.8;
            case "Sleeping Gear"            -> 1.5;
            case "Camp Kitchen"             -> 2.5;
            case "Lighting"                 -> 0.5;
            case "Navigation & Electronics" -> 0.4;
            case "Tools & Repair"           -> 1.0;
            case "Safety & First Aid"       -> 0.8;
            default                         -> 1.5;
        };
    }
}
