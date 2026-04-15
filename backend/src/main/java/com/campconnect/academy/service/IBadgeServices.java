package com.campconnect.academy.service;

import com.campconnect.academy.dto.BadgeDTO;
import java.util.List;

public interface IBadgeServices {
    List<BadgeDTO> getAllBadges();
    BadgeDTO getBadgeById(String id);
    BadgeDTO createBadge(BadgeDTO badgeDTO);
    void deleteBadge(String id);
    BadgeDTO updateBadge(String id, BadgeDTO dto);
}
