package com.campconnect.service;

import java.util.List;

public interface MatchingService {

    Double getCompatibilityScore(List<Double> profile1, List<Double> profile2);

}