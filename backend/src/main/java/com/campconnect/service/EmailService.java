package com.campconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("[EMAIL SUCCESS] Email sent to " + to);
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendEventConfirmation(String to, String eventTitle, String ticketId) {
        String subject = "CampConnect - Registration Confirmed: " + eventTitle;
        String body = "Hello,\n\n" +
                "Your registration for the event '" + eventTitle + "' has been confirmed!\n" +
                "Your Ticket ID is: " + ticketId + "\n\n" +
                "Please present your digital ticket at the entry.\n" +
                "We look forward to seeing you!\n\n" +
                "Best regards,\n" +
                "The CampConnect Team";
        sendEmail(to, subject, body);
    }
}
