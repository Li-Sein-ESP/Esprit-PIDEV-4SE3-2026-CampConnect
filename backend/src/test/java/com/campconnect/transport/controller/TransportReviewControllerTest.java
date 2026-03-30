package com.campconnect.transport.controller;

import com.campconnect.predict.service.OpenAIService;
import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.entity.TransportReview;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.transport.repository.TransportReviewRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransportReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransportReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransportReviewRepository reviewRepository;

    @MockBean
    private TransportRepository transportRepository;

    @MockBean
    private OpenAIService openAIService;

    @Test
    void listReviews_ReturnsOk() throws Exception {
        TransportReview r = new TransportReview("t1", "u1", 4, "good");
        r.setId("r1");
        when(reviewRepository.findByTransportId("t1")).thenReturn(List.of(r));

        mockMvc.perform(get("/api/transports/t1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("r1"));
    }

    @Test
    void createReview_UpdatesTransportAggregate_ReturnsOk() throws Exception {
        Transport t = new Transport();
        t.setId("t1");
        t.setAverageRating(null);
        t.setReviewCount(null);
        when(transportRepository.findById("t1")).thenReturn(Optional.of(t));
        when(openAIService.generateText(anyString(), anyString())).thenReturn("APPROVED");

        TransportReview saved = new TransportReview("t1", "u1", 5, "great");
        saved.setId("r2");
        when(reviewRepository.save(any(TransportReview.class))).thenReturn(saved);
        when(reviewRepository.findByTransportId("t1")).thenReturn(List.of(saved));

        String body = "{\"userId\":\"u1\",\"rating\":5,\"comment\":\"great\"}";

        mockMvc.perform(post("/api/transports/t1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("r2"));

        ArgumentCaptor<Transport> cap = ArgumentCaptor.forClass(Transport.class);
        verify(transportRepository).save(cap.capture());
        Transport updated = cap.getValue();
        assertThat(updated.getReviewCount()).isEqualTo(1);
        assertThat(updated.getAverageRating()).isEqualTo(5.0);
    }
}
