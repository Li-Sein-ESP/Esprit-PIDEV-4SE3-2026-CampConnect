package com.campconnect.predict.ml;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DemandPredictionResponse {

    private String category;
    private int month;
    private String season;

    @JsonProperty("predicted_demand")
    private int predictedDemand;

    @JsonProperty("suggested_price")
    private double suggestedPrice;

    @JsonProperty("price_action")
    private String priceAction;

    // getters and setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
    public int getPredictedDemand() { return predictedDemand; }
    public void setPredictedDemand(int predictedDemand) { this.predictedDemand = predictedDemand; }
    public double getSuggestedPrice() { return suggestedPrice; }
    public void setSuggestedPrice(double suggestedPrice) { this.suggestedPrice = suggestedPrice; }
    public String getPriceAction() { return priceAction; }
    public void setPriceAction(String priceAction) { this.priceAction = priceAction; }
}
