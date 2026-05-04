package com.campconnect.predict.ml;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DemandPredictionRequest {

    private int year;
    private int month;
    private String category;
    private String region;
    private double views;
    private double rentals;
    private double purchases;

    @JsonProperty("avg_price")
    private double avgPrice;

    @JsonProperty("avg_rating")
    private double avgRating;

    @JsonProperty("is_holiday")
    private int isHoliday;

    @JsonProperty("delivery_demand")
    private double deliveryDemand;

    // constructors
    public DemandPredictionRequest() {}

    // getters and setters
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public double getViews() { return views; }
    public void setViews(double views) { this.views = views; }
    public double getRentals() { return rentals; }
    public void setRentals(double rentals) { this.rentals = rentals; }
    public double getPurchases() { return purchases; }
    public void setPurchases(double purchases) { this.purchases = purchases; }
    public double getAvgPrice() { return avgPrice; }
    public void setAvgPrice(double avgPrice) { this.avgPrice = avgPrice; }
    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }
    public int getIsHoliday() { return isHoliday; }
    public void setIsHoliday(int isHoliday) { this.isHoliday = isHoliday; }
    public double getDeliveryDemand() { return deliveryDemand; }
    public void setDeliveryDemand(double deliveryDemand) { this.deliveryDemand = deliveryDemand; }
}
