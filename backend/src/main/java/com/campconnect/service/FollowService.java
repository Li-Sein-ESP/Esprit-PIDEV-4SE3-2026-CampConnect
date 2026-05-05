package com.campconnect.service;

import java.util.List;

public interface FollowService {
    void follow(String followerId, String followingId);
    void unfollow(String followerId, String followingId);
    boolean isFollowing(String followerId, String followingId);
    List<String> getFollowingIds(String followerId);
    List<String> getFollowerIds(String followingId);
    long getFollowingCount(String userId);
    long getFollowersCount(String userId);
}
