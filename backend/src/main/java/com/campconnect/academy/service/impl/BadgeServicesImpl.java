package com.campconnect.academy.service.impl;
import com.campconnect.academy.service.IBadgeServices;

import com.campconnect.model.User;

import com.campconnect.academy.dto.BadgeDTO;
import com.campconnect.academy.entity.Badge;
import com.campconnect.academy.repository.BadgeRepository;
import com.campconnect.repository.CategoryRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeServicesImpl implements IBadgeServices {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<BadgeDTO> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BadgeDTO getBadgeById(String id) {
        return badgeRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public BadgeDTO createBadge(BadgeDTO badgeDTO) {
        Badge badge = convertToEntity(badgeDTO);
        Badge savedBadge = badgeRepository.save(badge);
        return convertToDTO(savedBadge);
    }

    @Override
    public void deleteBadge(String id) {
        badgeRepository.deleteById(id);
    }

    @Override
    public BadgeDTO updateBadge(String id, BadgeDTO dto) {
        if (!badgeRepository.existsById(id)) return null;
        Badge badge = convertToEntity(dto);
        badge.setId(id);
        return convertToDTO(badgeRepository.save(badge));
    }

    private BadgeDTO convertToDTO(Badge badge) {
        BadgeDTO dto = new BadgeDTO();
        dto.setId(badge.getId());
        dto.setName(badge.getName());
        dto.setDescription(badge.getDescription());
        dto.setIcon(badge.getIcon());
        dto.setCategoryName(badge.getCategory() != null ? badge.getCategory().getName() : null);
        dto.setRarity(com.campconnect.enums.BadgeRarity.fromString(badge.getRarity()));
        dto.setRequirements(badge.getRequirements());
        
        if (badge.getCreator() != null) {
            dto.setCreatorId(badge.getCreator().getId());
            dto.setCreatorName(badge.getCreator().getName());
        }
        return dto;
    }

    private Badge convertToEntity(BadgeDTO dto) {
        Badge badge = new Badge();
        badge.setName(dto.getName());
        badge.setDescription(dto.getDescription());
        badge.setIcon(dto.getIcon());
        
        // Handle Category
        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryName(), "")));
            badge.setCategory(category);
        }
        
        badge.setRarity(dto.getRarity() != null ? dto.getRarity().name() : null);
        badge.setRequirements(dto.getRequirements());
        
        // Handle Traceability: assign creator safely
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails)auth.getPrincipal()).getUsername();
            userRepository.findByUsername(username).ifPresent(badge::setCreator);
        }
        
        return badge;
    }
}
