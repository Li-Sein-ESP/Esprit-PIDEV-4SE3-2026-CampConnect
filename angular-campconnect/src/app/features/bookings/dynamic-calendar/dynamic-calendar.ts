import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isHighDemand: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
}

@Component({
  selector: 'app-dynamic-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-calendar.html',
  styleUrl: './dynamic-calendar.css',
})
export class DynamicCalendar implements OnInit {
  currentDate = new Date();
  daysInMonth: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock booked dates & high demand dates for the heatmap
  bookedDates: Date[] = [
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 10),
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 11),
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 12)
  ];

  highDemandDates: Date[] = [
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 20),
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 21),
    new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 22)
  ];

  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;

  basePricePerNight = 100;
  weekendSurcharge = 20;

  totalPrice = 0;
  numberOfNights = 0;
  applicableWeekendSurcharges = 0;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.generateCalendar();
  }

  confirmReservation() {
    const siteId = this.route.snapshot.paramMap.get('siteId') || '1';
    this.router.navigate(['/booking/reserve', siteId], {
      state: {
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate,
        totalPrice: this.totalPrice,
        nights: this.numberOfNights
      }
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    }

    this.daysInMonth = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      this.daysInMonth.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isBooked: this.checkIfBooked(current),
        isHighDemand: this.checkIfHighDemand(current),
        isSelected: this.isDateSelected(current),
        isInRange: this.isDateInRange(current)
      });
      current.setDate(current.getDate() + 1);
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: CalendarDay) {
    if (day.isBooked || !day.isCurrentMonth) return;

    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      this.selectedStartDate = day.date;
      this.selectedEndDate = null;
    } else if (this.selectedStartDate && !this.selectedEndDate) {
      if (day.date < this.selectedStartDate) {
        this.selectedStartDate = day.date;
      } else {
        this.selectedEndDate = day.date;
        // Check if range includes booked dates
        if (this.isRangeValid(this.selectedStartDate, this.selectedEndDate)) {
          this.calculatePrice();
        } else {
          this.selectedEndDate = null; // Reset if invalid
          alert('Selected range includes already booked dates. Please try another range.');
        }
      }
    }
    this.updateSelectionVisuals();
  }

  isRangeValid(start: Date, end: Date): boolean {
    let current = new Date(start);
    while (current <= end) {
      if (this.checkIfBooked(current)) return false;
      current.setDate(current.getDate() + 1);
    }
    return true;
  }

  updateSelectionVisuals() {
    this.daysInMonth.forEach(day => {
      day.isSelected = this.isDateSelected(day.date);
      day.isInRange = this.isDateInRange(day.date);
    });
  }

  checkIfBooked(date: Date): boolean {
    return this.bookedDates.some(bd => bd.toDateString() === date.toDateString());
  }

  checkIfHighDemand(date: Date): boolean {
    return this.highDemandDates.some(hd => hd.toDateString() === date.toDateString());
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedStartDate) return false;
    if (this.selectedStartDate.toDateString() === date.toDateString()) return true;
    if (this.selectedEndDate && this.selectedEndDate.toDateString() === date.toDateString()) return true;
    return false;
  }

  isDateInRange(date: Date): boolean {
    if (!this.selectedStartDate || !this.selectedEndDate) return false;
    return date > this.selectedStartDate && date < this.selectedEndDate;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  calculatePrice() {
    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.totalPrice = 0;
      this.numberOfNights = 0;
      return;
    }

    let nights = 0;
    let weekendCount = 0;
    let current = new Date(this.selectedStartDate);

    while (current < this.selectedEndDate) {
      nights++;
      if (this.isWeekend(current)) {
        weekendCount++;
      }
      current.setDate(current.getDate() + 1);
    }

    this.numberOfNights = nights;
    this.applicableWeekendSurcharges = weekendCount;
    this.totalPrice = (nights * this.basePricePerNight) + (weekendCount * this.weekendSurcharge);
  }

  formatMonthYear(): string {
    return this.currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
}
