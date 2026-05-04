package com.campconnect.gear.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "gear_inventory")
@Data
@NoArgsConstructor
@CompoundIndexes({
    @CompoundIndex(name = "idx_gear_warehouse_unique", def = "{'gearId': 1, 'warehouseId': 1}", unique = true)
})
public class GearInventory {
    @Id
    private String id;

    @Indexed
    private String gearId;

    @Indexed
    private String warehouseId;

    private int quantity;
}
