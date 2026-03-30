package com.campconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/db-info")
    public Map<String, Object> getDbInfo() {
        Map<String, Object> info = new HashMap<>();
        try {
            info.put("dbName", mongoTemplate.getDb().getName());
            Set<String> collections = mongoTemplate.getCollectionNames();
            info.put("collections", collections);
            
            Map<String, Long> counts = new HashMap<>();
            for (String col : collections) {
                counts.put(col, mongoTemplate.getCollection(col).countDocuments());
            }
            info.put("counts", counts);
        } catch (Exception e) {
            info.put("error", e.getMessage());
        }
        return info;
    }
}
