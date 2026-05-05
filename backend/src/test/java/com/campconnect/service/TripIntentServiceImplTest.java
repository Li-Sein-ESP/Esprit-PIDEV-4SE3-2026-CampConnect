package com.campconnect.service;

import com.campconnect.model.Group;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.TripIntentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripIntentServiceImplTest {

    @Mock
    private TripIntentRepository tripIntentRepository;

    @Mock
    private IGroupService groupService;

    @InjectMocks
    private TripIntentServiceImpl tripIntentService;

    @Test
    void createTripIntent_ShouldCreateGroupAndSaveIntent() {
        // Arrange : Préparation des données
        TripIntent intent = new TripIntent();
        intent.setId("trip-1");
        intent.setTitle("Camping aux Étoiles");
        intent.setCreatorUserId("user-1");

        when(tripIntentRepository.save(any(TripIntent.class))).thenReturn(intent);

        // Act : Exécution de la méthode
        TripIntent saved = tripIntentService.createTripIntent(intent);

        // Assert : Vérifications
        assertNotNull(saved);
        assertEquals("trip-1", saved.getId());
        assertEquals(TripIntentStatus.OPEN, saved.getStatus());

        // Vérifie qu'un groupe a été créé automatiquement pour ce voyage
        verify(groupService, times(1)).createGroup(any(Group.class));
        verify(tripIntentRepository, times(1)).save(intent);
    }

    @Test
    void updateTripIntent_ShouldSyncWithGroupName() {
        // Arrange
        TripIntent existing = new TripIntent();
        existing.setId("trip-1");
        existing.setTitle("Ancien Titre");

        TripIntent update = new TripIntent();
        update.setTitle("Nouveau Titre");

        Group associatedGroup = new Group();
        associatedGroup.setId("group-1");
        associatedGroup.setName("Ancien Titre");

        when(tripIntentRepository.findById("trip-1")).thenReturn(Optional.of(existing));
        when(tripIntentRepository.save(any(TripIntent.class))).thenReturn(existing);
        when(groupService.getGroupByTripId("trip-1")).thenReturn(Optional.of(associatedGroup));

        // Act
        tripIntentService.updateTripIntent("trip-1", update);

        // Assert
        assertEquals("Nouveau Titre", existing.getTitle());
        // Vérifie que le nom du groupe a été mis à jour pour correspondre au nouveau titre du voyage
        verify(groupService, times(1)).updateGroup(eq("group-1"), any(Group.class));
    }
}
