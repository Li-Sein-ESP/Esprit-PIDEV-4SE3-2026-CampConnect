package com.campconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:CampConnect <campconnect.noreply@gmail.com>}")
    private String mailFrom;

    @Async
    public void sendBanNotification(String toEmail, String username, String reason) {
        if (!mailEnabled) {
            log.info("[Email] Mail désactivé. Simulation d'envoi à {} - Raison: {}", toEmail, reason);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject("⛔ Votre compte CampConnect a été suspendu");
            helper.setText(buildBanEmailBody(username, reason), true);
            mailSender.send(message);
            log.info("[Email] ✅ Email de bannissement envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] ❌ Échec de l'envoi à {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendRehabilitationSuccessEmail(String toEmail, String username) {
        if (!mailEnabled) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject("✅ Bon retour parmi nous sur CampConnect !");
            helper.setText(buildRehabilitationEmailBody(username), true);
            mailSender.send(message);
            log.info("[Email] ✅ Email de réhabilitation envoyé à {}", toEmail);
        } catch (Exception e) {
            log.error("[Email] ❌ Échec envoi réhabilitation à {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildBanEmailBody(String username, String reason) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <body style="font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:20px;">
              <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b); padding:30px; text-align:center;">
                  <h1 style="color:white; margin:0; font-size:24px;">⛔ Compte Suspendu</h1>
                  <p style="color:#fca5a5; margin:8px 0 0;">CampConnect Modération</p>
                </div>
                <div style="padding:30px;">
                  <p style="font-size:16px; color:#374151;">Bonjour <strong>%s</strong>,</p>
                  <p style="color:#4b5563; line-height:1.6;">Votre compte a été <span style="color:#dc2626; font-weight:bold;">suspendu définitivement</span>.</p>
                  <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:16px; border-radius:4px; margin:20px 0;">
                    <p style="margin:0; color:#7f1d1d; font-weight:bold;">Raison :</p>
                    <p style="margin:8px 0 0; color:#991b1b;">%s</p>
                  </div>
                  <p style="color:#4b5563;">Si vous pensez que c'est une erreur, vous pouvez passer le <strong>Quiz de Réhabilitation</strong> sur votre profil pour retrouver l'accès.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(username, reason);
    }

    private String buildRehabilitationEmailBody(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background:#f0fdf4; padding:20px;">
              <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                <div style="background:linear-gradient(135deg,#16a34a,#22c55e); padding:30px; text-align:center;">
                  <h1 style="color:white; margin:0;">✅ Accès Rétabli</h1>
                  <p style="color:#dcfce7; margin:8px 0 0;">Seconde chance accordée</p>
                </div>
                <div style="padding:30px; color:#374151;">
                  <p>Bonjour <strong>%s</strong>,</p>
                  <p>Félicitations ! Vous avez réussi notre <strong>Quiz de Sensibilisation à la Sécurité</strong>.</p>
                  <p>Votre compte a été réactivé avec succès. Vous pouvez à nouveau publier des posts et interagir avec la communauté.</p>
                  <p>Bon camping et profitez bien de l'aventure !</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(username);
    }
}
