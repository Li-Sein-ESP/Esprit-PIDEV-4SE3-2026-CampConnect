package com.campconnect.gear.repository;

import com.campconnect.gear.model.MaintenanceRecord;
import com.campconnect.gear.model.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends MongoRepository<MaintenanceRecord, String> {

    Page<MaintenanceRecord> findByGearIdAndDeletedFalse(String gearId, Pageable pageable);

    Page<MaintenanceRecord> findByStatusAndDeletedFalse(MaintenanceStatus status, Pageable pageable);

    List<MaintenanceRecord> findByGearId(String gearId);
}
