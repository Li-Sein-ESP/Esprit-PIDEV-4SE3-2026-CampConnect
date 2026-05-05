package com.campconnect.service;
 
import com.campconnect.model.Reservation;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.DottedLineSeparator;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;
 
import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
 
@Service
public class PdfService {
 
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
 
    public byte[] generateReservationTicket(Reservation reservation, String username, String campsiteName) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 30, 30);
            PdfWriter.getInstance(document, out);
            document.open();
 
            // Colors
            Color mainGreen = new Color(27, 67, 50);
            Color beigeBg = new Color(245, 243, 230); // Soft elegant beige
            Color boldTitleColor = Color.BLACK;
 
            // Fonts
            Font boldTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, boldTitleColor);
            Font resIdFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.DARK_GRAY);
 
            // --- TOP LOGO / HEADER ---
            Paragraph header = new Paragraph("CAMPCONNECT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, mainGreen));
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph("\n"));
 
            // --- MAIN TICKET CARD (Beige Background) ---
            PdfPTable mainTicketCard = new PdfPTable(1);
            mainTicketCard.setWidthPercentage(100);
            
            PdfPCell ticketCell = new PdfPCell();
            ticketCell.setBackgroundColor(beigeBg);
            ticketCell.setPadding(25);
            ticketCell.setBorder(Rectangle.BOX);
            ticketCell.setBorderColor(new Color(220, 220, 200));
            ticketCell.setBorderWidth(0.5f);
 
            // INNER CONTENT TABLE (2 Columns)
            PdfPTable innerTable = new PdfPTable(new float[]{1.5f, 1});
            innerTable.setWidthPercentage(100);
            innerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);
 
            // LEFT COLUMN
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPaddingRight(20);
 
            Paragraph campTitle = new Paragraph(campsiteName.toUpperCase(), boldTitle);
            campTitle.setSpacingAfter(15);
            leftCell.addElement(campTitle);
 
            leftCell.addElement(new Paragraph("DATE", labelFont));
            leftCell.addElement(new Paragraph(reservation.getStartDate().format(formatter), valueFont));
            leftCell.addElement(new Paragraph(" ", labelFont));
 
            leftCell.addElement(new Paragraph("CHECK-IN TIME", labelFont));
            leftCell.addElement(new Paragraph(reservation.getStartDate().format(timeFormatter), valueFont));
            leftCell.addElement(new Paragraph(" ", labelFont));
 
            leftCell.addElement(new Paragraph("GUEST", labelFont));
            leftCell.addElement(new Paragraph(username.toUpperCase(), valueFont));
            
            innerTable.addCell(leftCell);
 
            // RIGHT COLUMN
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
 
            Paragraph resLabel = new Paragraph("Booking Number :", labelFont);
            resLabel.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(resLabel);
            
            Paragraph resId = new Paragraph(reservation.getId().substring(Math.max(0, reservation.getId().length()-8)).toUpperCase(), resIdFont);
            resId.setAlignment(Element.ALIGN_CENTER);
            resId.setSpacingAfter(15);
            rightCell.addElement(resId);
 
            String qrText = "TICKET_VALID:" + reservation.getId();
            byte[] qrBytes = generateQRCodeBytes(qrText, 160, 160);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(qrImage);
 
            innerTable.addCell(rightCell);
            ticketCell.addElement(innerTable);
            mainTicketCard.addCell(ticketCell);
            document.add(mainTicketCard);
 
            // --- DASHED LINE SEPARATOR ---
            document.add(new Paragraph("\n\n"));
            DottedLineSeparator dottedline = new DottedLineSeparator();
            dottedline.setOffset(-2);
            dottedline.setGap(2f);
            document.add(dottedline);
            document.add(new Paragraph("\n"));
 
            // --- BOTTOM SECTION (ADDITIONAL INFO) ---
            Paragraph planTitle = new Paragraph("Additional Information", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK));
            planTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(planTitle);
            document.add(new Paragraph("\n"));
 
            PdfPTable infoTable = new PdfPTable(1);
            infoTable.setWidthPercentage(100);
            PdfPCell infoCell = new PdfPCell(new Phrase("Please present this ticket at the campsite entrance. This ticket is unique and strictly personal. Any reproduction is strictly prohibited.\n\nLocation: " + campsiteName + "\nStay Duration: Until " + reservation.getEndDate().format(formatter), smallFont));
            infoCell.setBorder(Rectangle.BOX);
            infoCell.setBorderColor(Color.LIGHT_GRAY);
            infoCell.setPadding(15);
            infoTable.addCell(infoCell);
            document.add(infoTable);
 
            // --- LEGAL FOOTER ---
            document.add(new Paragraph("\n\n\n\n"));
            Paragraph legal = new Paragraph("This ticket is subject to general terms and conditions. In case of loss, CampConnect cannot be held responsible. No refund is possible after reservation validation.", smallFont);
            legal.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(legal);
 
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Cinema-Style PDF ticket", e);
        }
    }
 
    private byte[] generateQRCodeBytes(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }
}
