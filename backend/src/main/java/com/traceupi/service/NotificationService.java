package com.traceupi.service;

import com.traceupi.enums.NotificationType;
import com.traceupi.model.Notification;
import com.traceupi.model.Transaction;
import com.traceupi.repository.NotificationRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter IST_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${twilio.phone.from}")
    private String twilioFromPhone;

    @Value("${twilio.phone.to}")
    private String twilioToPhone;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public NotificationService(NotificationRepository notificationRepository, JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    /**
     * Send both SMS and Email notifications for a transaction event.
     * Failures are logged but never thrown — the caller's flow is not interrupted.
     */
    @Transactional
    public void sendNotifications(Transaction transaction, String eventType) {
        sendSms(transaction, eventType);
        sendEmail(transaction, eventType);
    }

    private void sendSms(Transaction transaction, String eventType) {
        String smsBody = String.format(
                "[TraceUPI] Transaction %s has been %s. Amount: ₹%s. Reason: %s",
                transaction.getTransactionId(),
                eventType.toLowerCase(),
                transaction.getAmount(),
                transaction.getFailureReason()
        );

        boolean success = false;
        try {
            Message.creator(
                    new PhoneNumber(twilioToPhone),
                    new PhoneNumber(twilioFromPhone),
                    smsBody
            ).create();
            success = true;
            log.info("SMS sent for transaction {}: {}", transaction.getTransactionId(), eventType);
        } catch (Exception e) {
            log.error("Failed to send SMS for transaction {}: {}", transaction.getTransactionId(), e.getMessage());
        }

        saveNotificationLog(transaction.getTransactionId(), NotificationType.SMS, twilioToPhone, smsBody, success);
    }

    private void sendEmail(Transaction transaction, String eventType) {
        String subject = String.format("TraceUPI Alert: Transaction %s - %s", eventType, transaction.getTransactionId());

        String htmlBody = buildEmailHtml(transaction, eventType);

        boolean success = false;
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            success = true;
            log.info("Email sent for transaction {}: {}", transaction.getTransactionId(), eventType);
        } catch (MessagingException e) {
            log.error("Failed to send email for transaction {}: {}", transaction.getTransactionId(), e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email for transaction {}: {}", transaction.getTransactionId(), e.getMessage());
        }

        saveNotificationLog(transaction.getTransactionId(), NotificationType.EMAIL, adminEmail,
                "Subject: " + subject, success);
    }

    private String buildEmailHtml(Transaction transaction, String eventType) {
        String escalationTime = transaction.getEscalatedAt() != null
                ? transaction.getEscalatedAt().format(IST_FORMAT) + " IST"
                : "N/A";

        return """
                <html>
                <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155;">
                    <h1 style="color: #6366f1; margin-top: 0;">🔔 TraceUPI Alert</h1>
                    <h2 style="color: #f59e0b;">Transaction %s</h2>
                    <table style="width: 100%%; border-collapse: collapse; margin-top: 16px;">
                      <tr><td style="padding: 8px; color: #94a3b8;">Transaction ID</td><td style="padding: 8px; font-weight: bold;">%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Amount</td><td style="padding: 8px; font-weight: bold;">₹%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Sender UPI</td><td style="padding: 8px;">%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Receiver UPI</td><td style="padding: 8px;">%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Status</td><td style="padding: 8px; color: #f59e0b; font-weight: bold;">%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Failure Reason</td><td style="padding: 8px; color: #ef4444;">%s</td></tr>
                      <tr><td style="padding: 8px; color: #94a3b8;">Escalation Time</td><td style="padding: 8px;">%s</td></tr>
                    </table>
                    <p style="margin-top: 24px; color: #64748b; font-size: 13px;">This is an automated alert from TraceUPI.</p>
                  </div>
                </body>
                </html>
                """.formatted(
                eventType,
                transaction.getTransactionId(),
                transaction.getAmount(),
                transaction.getSenderUpi(),
                transaction.getReceiverUpi(),
                transaction.getStatus().name(),
                transaction.getFailureReason(),
                escalationTime
        );
    }

    private void saveNotificationLog(String transactionId, NotificationType type, String recipient,
                                     String message, boolean success) {
        Notification notification = Notification.builder()
                .transactionId(transactionId)
                .type(type)
                .recipient(recipient)
                .message(message)
                .sentAt(LocalDateTime.now())
                .success(success)
                .build();
        notificationRepository.save(notification);
    }

    /**
     * Get all notifications, newest first.
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderBySentAtDesc();
    }

    /**
     * Get notifications for a specific transaction.
     */
    public List<Notification> getNotificationsByTransactionId(String transactionId) {
        return notificationRepository.findByTransactionId(transactionId);
    }
}
