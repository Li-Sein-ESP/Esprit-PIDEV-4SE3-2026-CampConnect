import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { GearApiService, BookedDateRange } from '../../gear/services/gear-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-gear-availability-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="gear-cal-wrapper">
      <!-- Header -->
      <div class="gear-cal-header">
        <div class="gear-cal-header__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <h3 class="gear-cal-header__title">Availability Calendar</h3>
          <p class="gear-cal-header__sub">Select a start date for your rental</p>
        </div>
      </div>

      <!-- Legend -->
      <div class="gear-cal-legend">
        <span class="gear-cal-legend__item">
          <span class="gear-cal-legend__dot gear-cal-legend__dot--booked"></span>
          Booked
        </span>
        <span class="gear-cal-legend__item">
          <span class="gear-cal-legend__dot gear-cal-legend__dot--available"></span>
          Available
        </span>
        <span class="gear-cal-legend__item">
          <span class="gear-cal-legend__dot gear-cal-legend__dot--past"></span>
          Past dates
        </span>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="gear-cal-skeleton">
        <div class="gear-cal-skeleton__bar" *ngFor="let _ of [1,2,3,4,5]"></div>
      </div>

      <!-- Calendar -->
      <div *ngIf="!loading" class="gear-cal-fc-wrap">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>

      <!-- Date warning / selection feedback -->
      <div *ngIf="dateWarning" class="gear-cal-warning" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="gear-cal-warning__icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ dateWarning }}</span>
      </div>

      <div *ngIf="selectedDateLabel && !dateWarning" class="gear-cal-success" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="gear-cal-success__icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Start date selected: <strong>{{ selectedDateLabel }}</strong></span>
      </div>
    </div>
  `,
    styles: [`
    /* FullCalendar reset and theming */
    .gear-cal-wrapper {
      background: var(--fc-bg, #ffffff);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--fc-border-color, #e5e7eb);
      margin-bottom: 24px;
      box-shadow: 0 1px 6px rgba(0,0,0,.06);
    }

    /* Dark-mode awareness */
    @media (prefers-color-scheme: dark) {
      .gear-cal-wrapper {
        --fc-bg: #1e2a23;
        --fc-border-color: #2d4035;
        background: #1e2a23;
        border-color: #2d4035;
      }
    }

    .gear-cal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .gear-cal-header__icon {
      width: 38px;
      height: 38px;
      background: #d1fae5;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #065f46;
      flex-shrink: 0;
    }
    .gear-cal-header__icon svg { width: 18px; height: 18px; }
    .gear-cal-header__title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 2px; }
    .gear-cal-header__sub { font-size: 0.78rem; color: #6b7280; margin: 0; }

    /* Legend */
    .gear-cal-legend {
      display: flex;
      gap: 18px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .gear-cal-legend__item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #6b7280;
    }
    .gear-cal-legend__dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .gear-cal-legend__dot--booked { background: #ef4444; }
    .gear-cal-legend__dot--available { background: #10b981; }
    .gear-cal-legend__dot--past { background: #d1d5db; }

    /* Skeleton loader */
    .gear-cal-skeleton {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 0;
    }
    .gear-cal-skeleton__bar {
      height: 20px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      border-radius: 8px;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* FullCalendar overrides */
    .gear-cal-fc-wrap .fc {
      font-family: inherit;
      font-size: 0.82rem;
    }
    .gear-cal-fc-wrap .fc-toolbar-title {
      font-size: 0.95rem !important;
      font-weight: 700;
    }
    .gear-cal-fc-wrap .fc-col-header-cell-cushion {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #9ca3af;
    }
    .gear-cal-fc-wrap .fc-daygrid-day-number {
      font-size: 0.8rem;
      color: #374151;
    }
    .gear-cal-fc-wrap .fc-day-today {
      background: #ecfdf5 !important;
    }
    .gear-cal-fc-wrap .fc-day-today .fc-daygrid-day-number {
      background: #059669;
      color: #fff;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    /* Past date styling */
    .gear-cal-fc-wrap .fc-day-past .fc-daygrid-day-number {
      color: #d1d5db;
    }
    .gear-cal-fc-wrap .fc-day-past {
      background: #fafafa !important;
      cursor: not-allowed;
    }
    /* Booked event */
    .gear-cal-fc-wrap .fc-event {
      border-radius: 4px !important;
      border: none !important;
      font-size: 0.7rem !important;
      font-weight: 600 !important;
      cursor: default !important;
    }
    .gear-cal-fc-wrap .fc-button {
      background: #059669 !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 0.78rem !important;
      padding: 5px 12px !important;
    }
    .gear-cal-fc-wrap .fc-button:hover { background: #047857 !important; }
    .gear-cal-fc-wrap .fc-button:focus { box-shadow: 0 0 0 3px rgba(5,150,105,.3) !important; }

    /* Warning / success toasts */
    .gear-cal-warning, .gear-cal-success {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 500;
    }
    .gear-cal-warning {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .gear-cal-warning__icon { width: 16px; height: 16px; flex-shrink: 0; color: #dc2626; }
    .gear-cal-success {
      background: #f0fdf4;
      color: #14532d;
      border: 1px solid #bbf7d0;
    }
    .gear-cal-success__icon { width: 16px; height: 16px; flex-shrink: 0; color: #16a34a; }

    @media (max-width: 640px) {
      .gear-cal-wrapper { padding: 14px; }
      .gear-cal-fc-wrap .fc-toolbar { flex-direction: column; gap: 8px; }
    }
  `]
})
export class GearAvailabilityCalendarComponent implements OnChanges {

    @Input() gearId!: string;
    /** Emits the selected ISO date string when a free date is clicked */
    @Output() dateSelected = new EventEmitter<string>();

    loading = true;
    dateWarning: string | null = null;
    selectedDateLabel: string | null = null;

    private bookedRanges: BookedDateRange[] = [];

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        editable: false,
        selectable: true,
        selectMirror: false,
        weekends: true,
        height: 'auto',
        dayMaxEvents: true,
        validRange: { start: new Date().toISOString().slice(0, 10) },
        events: [],
        dateClick: (info) => this.onDateClick(info),
        eventClick: (info) => this.onEventClick(info),
        // Gray out past dates visually via CSS class — validRange already prevents selecting them
        dayCellClassNames: (arg) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (arg.date < today) return ['fc-day-past'];
            return [];
        }
    };

    constructor(
        private gearApi: GearApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gearId'] && this.gearId) {
            this.loadBookedDates();
        }
    }

    private loadBookedDates(): void {
        this.loading = true;
        this.dateWarning = null;
        this.selectedDateLabel = null;
        this.cdr.markForCheck();

        this.gearApi.getBookedDates(this.gearId).pipe(
            catchError(() => of([]))  // silently return empty array on any error
        ).subscribe((ranges: BookedDateRange[]) => {
            this.bookedRanges = ranges;
            this.calendarOptions = {
                ...this.calendarOptions,
                events: ranges.map((r: BookedDateRange) => ({
                    title: 'Booked',
                    start: r.start,
                    // FullCalendar end is exclusive — add 1 day so it renders inclusive
                    end: this.addDay(r.end),
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    textColor: '#ffffff',
                    display: 'block',
                    classNames: ['fc-booked-event']
                }))
            };
            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private onDateClick(info: any): void {
        const clickedDate = info.dateStr; // yyyy-MM-dd

        // Reject past dates
        if (clickedDate < new Date().toISOString().slice(0, 10)) {
            this.dateWarning = 'Past dates are not available for rental.';
            this.selectedDateLabel = null;
            this.cdr.markForCheck();
            return;
        }

        // Check if within a booked range
        if (this.isDateBooked(clickedDate)) {
            this.dateWarning = 'This date is unavailable — already booked by another camper.';
            this.selectedDateLabel = null;
            this.cdr.markForCheck();
            return;
        }

        // Available — emit and show confirmation
        this.dateWarning = null;
        this.selectedDateLabel = this.formatDisplay(clickedDate);
        this.dateSelected.emit(clickedDate);
        this.cdr.markForCheck();
    }

    private onEventClick(info: EventClickArg): void {
        info.jsEvent.preventDefault();
        this.dateWarning = 'This date is unavailable — already booked by another camper.';
        this.selectedDateLabel = null;
        this.cdr.markForCheck();
    }

    private isDateBooked(dateStr: string): boolean {
        return this.bookedRanges.some(r => dateStr >= r.start && dateStr <= r.end);
    }

    /** Adds one calendar day to an ISO date string (for FullCalendar's exclusive end). */
    private addDay(dateStr: string): string {
        const d = new Date(dateStr + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    }

    private formatDisplay(dateStr: string): string {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}
