import { Injectable } from "@angular/core";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

@Injectable({
  providedIn: "root",
})
export class PdfExportService {
  constructor() {}

  /**
   * Exporte un élément HTML en PDF
   * @param elementId ID de l'élément HTML à exporter
   * @param fileName Nom du fichier PDF
   */
  async exportHtmlToPdf(
    elementId: string,
    fileName: string = "export.pdf",
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export failed:", error);
      throw error;
    }
  }

  /**
   * Exporte les données d'un trip en PDF formaté
   */
  async exportTripToPdf(
    trip: any,
    fileName: string = `${trip.name || "trip"}.pdf`,
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Header with trip name
      pdf.setFontSize(24);
      pdf.setTextColor(51, 51, 51);
      pdf.text(trip.name || "Trip Details", margin, yPosition);
      yPosition += 15;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Trip Information Section
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text("TRIP INFORMATION", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);

      // Basic details
      const tripDetails = [
        { label: "Destination:", value: trip.destination || "N/A" },
        { label: "Start Date:", value: this.formatDate(trip.startDate) },
        { label: "End Date:", value: this.formatDate(trip.endDate) },
        { label: "Group Size:", value: `${trip.groupSize || 0} people` },
        { label: "Status:", value: this.formatStatus(trip.status) },
        {
          label: "Adventure Level:",
          value: this.capitalize(trip.adventureLevel) || "N/A",
        },
        {
          label: "Comfort Level:",
          value: this.capitalize(trip.comfortLevel) || "N/A",
        },
      ];

      tripDetails.forEach((detail) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(detail.label, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        const valueX = margin + 50;
        const wrappedText = pdf.splitTextToSize(detail.value, maxWidth - 50);
        pdf.text(wrappedText, valueX, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Budget Section
      if (trip.budget) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text("BUDGET", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);
        pdf.setFont("helvetica", "bold");
        pdf.text("Estimated Budget:", margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          this.formatCurrency(trip.budget.estimated),
          margin + 50,
          yPosition,
        );
        yPosition += 6;

        pdf.setFont("helvetica", "bold");
        pdf.text("Actual Spent:", margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          this.formatCurrency(trip.budget.actual),
          margin + 50,
          yPosition,
        );
        yPosition += 8;
      }

      // Activities Section
      if (trip.activities && trip.activities.length > 0) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text("ACTIVITIES", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);

        trip.activities.forEach((activity: string) => {
          pdf.text(`• ${this.capitalize(activity)}`, margin + 5, yPosition);
          yPosition += 6;
        });

        yPosition += 2;
      }

      // Itinerary Section
      if (trip.itinerary && trip.itinerary.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text("ITINERARY", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(51, 51, 51);

        trip.itinerary.forEach((day: any, index: number) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFont("helvetica", "bold");
          pdf.text(
            `Day ${index + 1}: ${day.title || "Activity"}`,
            margin,
            yPosition,
          );
          yPosition += 5;

          pdf.setFont("helvetica", "normal");
          if (day.description) {
            const wrappedDesc = pdf.splitTextToSize(
              day.description,
              maxWidth - 10,
            );
            pdf.text(wrappedDesc, margin + 5, yPosition);
            yPosition += wrappedDesc.length * 4 + 2;
          }
          yPosition += 3;
        });
      }

      // Footer with generation date
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 10,
      );

      pdf.save(fileName);
    } catch (error) {
      console.error("Trip PDF export failed:", error);
      throw error;
    }
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-TN", {
      style: "currency",
      currency: "TND",
    }).format(value || 0);
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      draft: "Draft",
      planned: "Planned",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || this.capitalize(status);
  }

  private capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
