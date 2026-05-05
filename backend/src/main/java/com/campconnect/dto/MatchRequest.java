package com.campconnect.dto;


import java.util.List;

public class MatchRequest {

    private List<Double> profile1;
    private List<Double> profile2;

    public List<Double> getProfile1() {
        return profile1;
    }

    public void setProfile1(List<Double> profile1) {
        this.profile1 = profile1;
    }

    public List<Double> getProfile2() {
        return profile2;
    }

    public void setProfile2(List<Double> profile2) {
        this.profile2 = profile2;
    }
}
