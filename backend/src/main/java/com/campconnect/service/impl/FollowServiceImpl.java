package com.campconnect.service.impl;

import com.campconnect.model.Follow;
import com.campconnect.repository.FollowRepository;
import com.campconnect.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;

    @Override
    @Transactional
    public void follow(String followerId, String followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            Follow follow = Follow.builder()
                    .followerId(followerId)
                    .followingId(followingId)
                    .build();
            followRepository.save(follow);
        }
    }

    @Override
    @Transactional
    public void unfollow(String followerId, String followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public boolean isFollowing(String followerId, String followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public List<String> getFollowingIds(String followerId) {
        return followRepository.findByFollowerId(followerId).stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getFollowerIds(String followingId) {
        return followRepository.findByFollowingId(followingId).stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());
    }

    @Override
    public long getFollowingCount(String userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Override
    public long getFollowersCount(String userId) {
        return followRepository.countByFollowingId(userId);
    }
}
