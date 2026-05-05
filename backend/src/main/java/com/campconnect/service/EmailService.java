package com.campconnect.service;
 
import com.campconnect.model.Reservation;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
 
@Service
public class EmailService {
 
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final PdfService pdfService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
 
    public EmailService(JavaMailSender mailSender, PdfService pdfService) {
        this.mailSender = mailSender;
        this.pdfService = pdfService;
    }
 
    /**
     * Sends a reservation confirmation email with the PDF ticket attached.
     */
    public void sendReservationConfirmation(String to, String reservationId, String username,
                                             String campsiteName, LocalDateTime start, LocalDateTime end) {
        sendReservationConfirmation(to, reservationId, username, campsiteName, start, end, null);
    }

    /**
     * Sends a reservation confirmation email with the PDF ticket attached.
     * Accepts a Reservation object to generate the PDF inline.
     */
    public void sendReservationConfirmation(String to, String reservationId, String username,
                                             String campsiteName, LocalDateTime start, LocalDateTime end,
                                             Reservation reservation) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // multipart = true enables attachments
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@campconnect.com", "CampConnect Adventure");
            helper.setTo(to);
            helper.setSubject("✅ Booking Confirmed — " + campsiteName);

            // ── HTML BODY ──────────────────────────────────────────────────────
            String checkIn  = start.format(formatter);
            String checkOut = end.format(formatter);
            String bookingRef = reservationId.substring(Math.max(0, reservationId.length() - 8)).toUpperCase();
            String pdfUrl = "http://localhost:8089/api/reservations/" + reservationId + "/ticket/pdf";
            String manageUrl = "http://localhost:4200/booking/details/" + reservationId;

            String html = """
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:40px 20px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

      <!-- GREEN HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#1b4332 0%%,#2d6a4f 100%%);padding:40px 40px 30px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%%;padding:16px;margin-bottom:16px;">
            <span style="font-size:36px;">⛺</span>
          </div>
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">CampConnect Adventure</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Official Booking Confirmation</p>
        </td>
      </tr>

      <!-- SUCCESS BADGE -->
      <tr>
        <td style="padding:30px 40px 0;text-align:center;">
          <div style="display:inline-block;background:#d1fae5;border:1.5px solid #6ee7b7;border-radius:100px;padding:10px 24px;">
            <span style="color:#065f46;font-weight:700;font-size:13px;">✓ &nbsp;Reservation Confirmed</span>
          </div>
          <h2 style="margin:20px 0 4px;font-size:24px;color:#111;font-weight:800;">%s</h2>
          <p style="margin:0;color:#6b7280;font-size:14px;">Hello <strong>%s</strong>, your adventure is all set!</p>
        </td>
      </tr>

      <!-- BOOKING CARD -->
      <tr>
        <td style="padding:24px 40px;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8faf8;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                <table width="100%%"><tr>
                  <td style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</td>
                  <td align="right" style="font-size:15px;font-weight:800;color:#1b4332;letter-spacing:1px;">#%s</td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%%">
                  <tr>
                    <td width="50%%" style="padding-bottom:16px;vertical-align:top;">
                      <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Check-In</div>
                      <div style="font-size:16px;font-weight:700;color:#111;">%s</div>
                      <div style="font-size:11px;color:#6b7280;margin-top:2px;">From 14:00</div>
                    </td>
                    <td width="50%%" style="padding-bottom:16px;vertical-align:top;padding-left:20px;border-left:1px solid #e5e7eb;">
                      <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Check-Out</div>
                      <div style="font-size:16px;font-weight:700;color:#111;">%s</div>
                      <div style="font-size:11px;color:#6b7280;margin-top:2px;">Before 11:00</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:16px;border-top:1px solid #e5e7eb;">
                      <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Location</div>
                      <div style="font-size:15px;font-weight:700;color:#111;">📍 %s</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- PDF ATTACHMENT NOTE -->
      <tr>
        <td style="padding:0 40px 24px;">
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;display:flex;align-items:center;">
            <span style="font-size:20px;margin-right:12px;">📎</span>
            <div>
              <div style="font-weight:700;color:#92400e;font-size:13px;">Your ticket is attached to this email</div>
              <div style="color:#b45309;font-size:12px;margin-top:2px;">Open the PDF attachment to get your official entry pass with QR code.</div>
            </div>
          </div>
        </td>
      </tr>

      <!-- CTA BUTTONS -->
      <tr>
        <td style="padding:0 40px 32px;text-align:center;">
          <a href="%s" style="display:inline-block;background:#1b4332;color:#fff;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:14px;margin-right:12px;">Download Ticket PDF</a>
          <a href="%s" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:600;font-size:14px;">Manage Booking</a>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">Questions? Contact us at <a href="mailto:support@campconnect.com" style="color:#059669;">support@campconnect.com</a></p>
          <p style="margin:0;font-size:11px;color:#d1d5db;">© 2026 CampConnect Adventure · Tunisia</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
""".formatted(campsiteName, username, bookingRef, checkIn, checkOut, campsiteName, pdfUrl, manageUrl);

            helper.setText(html, true);

            // ── PDF ATTACHMENT ─────────────────────────────────────────────────
            if (reservation != null) {
                try {
                    byte[] pdfBytes = pdfService.generateReservationTicket(reservation, username, campsiteName);
                    helper.addAttachment("CampConnect-Ticket-" + bookingRef + ".pdf",
                            () -> new java.io.ByteArrayInputStream(pdfBytes),
                            "application/pdf");
                    logger.info("PDF ticket attached to email for reservation {}", reservationId);
                } catch (Exception pdfEx) {
                    // Non-blocking: if PDF generation fails, still send the email without attachment
                    logger.warn("Could not attach PDF to email (reservation {}): {}", reservationId, pdfEx.getMessage());
                }
            }

            mailSender.send(message);
            logger.info("Confirmation email sent to {}", to);

        } catch (Exception e) {
            logger.error("Failed to send confirmation email to {}: {}", to, e.getMessage());
        }
    }
}
