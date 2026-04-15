import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AcademyService } from '../../academy/services/academy.service';
import { EventService } from '../../events/services/event.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'] // Keeping your scoped styles here
})
export class AdminDashboardComponent implements OnInit {

  @ViewChild('revenueChartCanvas', { static: true }) revenueChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Stats Data - Initialized with zeros, then populated via API
  stats = {
    totalUsers: 0,
    activeCampsites: 0,
    marketplaceRevenue: 0,
    activeDeliveries: 0,
    activeBookings: 0,
    environmentalAlerts: 0,
    activeCourses: 0,
    totalStudents: 0,
    upcomingEvents: 0,
    eventRegistrations: 0
  };

  // Mock Data for Activity Feeds based on Design
  recentRegistrations = [
    { initials: 'EM', name: 'Elena Martinez', desc: 'Registered as Campsite Owner', time: '2m ago' },
    { initials: 'AK', name: 'Alex Kim', desc: 'Registered as Camper', time: '18m ago' },
    { initials: 'RP', name: 'Rachel Patel', desc: 'Registered as Vendor', time: '34m ago' },
    { initials: 'TN', name: 'Tobias Nguyen', desc: 'Registered as Camper', time: '1h ago' },
    { initials: 'SW', name: 'Sarah Wilson', desc: 'Registered as Campsite Owner', time: '2h ago' }
  ];

  recentOrders = [
    { title: 'Premium Tent Bundle', desc: 'Order #CC-4821 · $249.00', status: 'Completed', statusClass: 'success' },
    { title: 'Solar Lantern Kit ×3', desc: 'Order #CC-4820 · $87.00', status: 'Processing', statusClass: 'info' },
    { title: 'Eco Cookware Set', desc: 'Order #CC-4819 · $134.50', status: 'Shipped', statusClass: 'warning' },
    { title: 'Waterproof Backpack Pro', desc: 'Order #CC-4818 · $179.99', status: 'Completed', statusClass: 'success' }
  ];

  recentIncidents = [
    { title: 'Delayed — Route #DR-291', desc: 'Weather disruption on mountain pass', status: 'Critical', statusClass: 'danger' },
    { title: 'Missing Items — Order #CC-4798', desc: 'Customer reported 1 item missing', status: 'Under Review', statusClass: 'warning' },
    { title: 'Vehicle Breakdown — Van #12', desc: 'Maintenance team dispatched', status: 'Resolved', statusClass: 'info' }
  ];

  complianceAlerts = [
    { title: 'Waste Threshold — Pine Valley', desc: 'Waste levels at 87% capacity', status: 'Urgent', statusClass: 'danger' },
    { title: 'Water Quality — Eagle Lake Camp', desc: 'pH levels slightly elevated', status: 'Monitoring', statusClass: 'warning' },
    { title: 'Fire Risk — Sierra Ridge', desc: 'Campfire ban advisory issued', status: 'Active', statusClass: 'danger' },
    { title: 'Noise Violation — Lakeshore #7', desc: 'Repeated after-hours noise reports', status: 'Warned', statusClass: 'warning' }
  ];

  // Chart Data
  private revenueData = [
    8200, 9100, 8800, 10200, 11500, 10800, 12400,
    11900, 13200, 12800, 14100, 13500, 15200, 14800,
    16100, 15400, 14900, 16800, 17200, 16500, 15800,
    17500, 18200, 17800, 19420, 18100, 17500, 16900,
    18400, 17200
  ];
  private bookingsData = [
    4100, 4800, 4200, 5500, 6200, 5800, 6800,
    6400, 7100, 6900, 7500, 7200, 8000, 7600,
    8200, 7800, 7600, 8500, 8800, 8400, 8100,
    9000, 9200, 9100, 9800, 9200, 8900, 8600,
    9400, 8800
  ];

  constructor(
    private decimalPipe: DecimalPipe,
    private academyService: AcademyService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.loadStats();
    // We defer chart drawing to ensure view is fully settled
    setTimeout(() => this.drawChart(), 100);
  }

  private loadStats() {
    forkJoin({
      courses: this.academyService.getCourses(),
      events: this.eventService.getEvents(),
      certStats: this.academyService.getCertificationStats()
    }).subscribe({
      next: ({ courses, events, certStats }) => {
        this.stats.activeCourses = courses.length;
        this.stats.upcomingEvents = events.filter(e => e.status === 'upcoming').length;

        // Sum up total registrations from events
        this.stats.eventRegistrations = events.reduce((acc, curr) => acc + (curr.registered || 0), 0);

        // Use certification stats for total students
        this.stats.totalStudents = certStats.reduce((acc, curr) => acc + curr.totalIssued, 0);

        // Keep other stats as sensible defaults or placeholders if not available globally
        this.stats.totalUsers = 24831;
        this.stats.activeCampsites = 1247;
      },
      error: (err) => console.error('Error loading dashboard stats:', err)
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.drawChart();
  }

  // --- Lightweight Canvas Chart Implementation ---
  drawChart(): void {
    const canvas = this.revenueChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use parent container dimensions
    const parent = canvas.parentElement;
    if (!parent) return;

    // Set internal resolution based on CSS size & device pixel ratio for crisp text/lines
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // The wrapper logic normally has a defined height via CSS (e.g. 280px).
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Padding for scales
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const numYLines = 6;

    ctx.beginPath();
    for (let i = 0; i <= numYLines; i++) {
      const y = padding.top + (chartHeight / numYLines) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Scale mapping functions
    const pointsCount = this.revenueData.length;
    const maxVal = 20000; // Hardcoded max for nice scaling based on data

    const getX = (index: number) => padding.left + (chartWidth / (pointsCount - 1)) * index;
    const getY = (val: number) => padding.top + chartHeight - ((val / maxVal) * chartHeight);

    // --- Draw Bookings Line (Dashed) ---
    ctx.strokeStyle = '#84a98c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    this.bookingsData.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // --- Draw Revenue Area & Line ---
    ctx.setLineDash([]); // Reset to solid line

    // Gradient filling for area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(45, 106, 79, 0.15)'); // var(--cc-primary)
    gradient.addColorStop(1, 'rgba(45, 106, 79, 0.01)');

    ctx.fillStyle = gradient;
    ctx.beginPath();

    // Map points for fill
    ctx.moveTo(padding.left, height - padding.bottom); // start bottom left
    this.revenueData.forEach((val, i) => {
      ctx.lineTo(getX(i), getY(val));
    });
    ctx.lineTo(width - padding.right, height - padding.bottom); // end bottom right
    ctx.closePath();
    ctx.fill();

    // Line drawing
    ctx.strokeStyle = '#2d6a4f'; // var(--cc-primary)
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.revenueData.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw bottom labels
    ctx.fillStyle = '#94a3b8'; // text-muted
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    const numLabels = 6;
    for (let i = 0; i <= numLabels; i++) {
      const index = Math.floor((pointsCount - 1) * (i / numLabels));
      const xPos = getX(index);

      // Mock dates moving backwards 30 days
      const d = new Date();
      d.setDate(d.getDate() - (pointsCount - 1 - index));
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      ctx.fillText(dateStr, xPos, height - 10);
    }

    // Draw Y axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= numYLines; i++) {
      const val = maxVal - (maxVal / numYLines) * i;
      const y = padding.top + (chartHeight / numYLines) * i;
      ctx.fillText(`$${val / 1000}k`, padding.left - 10, y);
    }
  }

}
