package com.campconnect.repository;

import com.campconnect.model.EnvironmentalRule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentalRuleRepository extends MongoRepository<EnvironmentalRule, String> {

    List<EnvironmentalRule> findByActiveTrue();

    List<EnvironmentalRule> findByActiveTrueAndRegionContainingIgnoreCase(String region);
}
