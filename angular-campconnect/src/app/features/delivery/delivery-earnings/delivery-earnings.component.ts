import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaymentItem {
    id: string;
    date: string;
    zone: string;
    vehicle: 'motorcycle' | 'van' | '4x4';
    distance: number;
    duration: string;
    amount: number;
    status: 'completed' | 'pending' | 'processing';
    rating: number | null;
    customer: string;
}

export interface EarningsData {
    total: number;
    weekly: number;
    monthly: number;
    deliveriesCompleted: number;
    dailyTrend: { date: Date; label: string; value: number }[];
    prevDailyTrend: { value: number }[];
    vehicleBreakdown: { label: string; value: number; color: string; emoji: string; count: number }[];
    recentPayments: PaymentItem[];
}

@Component({
    selector: 'app-delivery-earnings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delivery-earnings.component.html',
    styleUrls: ['./delivery-earnings.component.scss']
})
export class DeliveryEarningsComponent implements OnInit, AfterViewInit {
    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('donutChartCanvas') donutChartCanvas!: ElementRef<HTMLCanvasElement>;

    @ViewChild('tooltipContainer') tooltipContainer!: ElementRef<HTMLDivElement>;

    activePeriod: string = '30d';

    earnings: EarningsData = {
        total: 24680.00,
        weekly: 2140.00,
        monthly: 8950.00,
        deliveriesCompleted: 342,
        dailyTrend: [],
        prevDailyTrend: [],
        vehicleBreakdown: [
            { label: 'Van', value: 4654, count: 148, color: '#8B7355', emoji: '🚐' },
            { label: 'Motorcycle', value: 2775, count: 126, color: '#2B6FA0', emoji: '🏍️' },
            { label: '4×4', value: 1521, count: 68, color: '#38855F', emoji: '🚙' }
        ],
        recentPayments: [
            { id: 'DL-4201', date: '2025-01-15', zone: 'Urban', vehicle: 'van', distance: 12.4, duration: '42 min', amount: 34.50, status: 'completed', rating: 5.0, customer: 'Sarah M.' },
            { id: 'DL-4200', date: '2025-01-15', zone: 'Suburban', vehicle: 'motorcycle', distance: 8.2, duration: '28 min', amount: 18.75, status: 'completed', rating: 4.8, customer: 'James K.' },
            { id: 'DL-4199', date: '2025-01-14', zone: 'Rural', vehicle: '4x4', distance: 35.6, duration: '1h 15min', amount: 52.00, status: 'completed', rating: 4.9, customer: 'Emily R.' },
            { id: 'DL-4198', date: '2025-01-14', zone: 'Urban', vehicle: 'motorcycle', distance: 5.1, duration: '18 min', amount: 14.25, status: 'completed', rating: 5.0, customer: 'David L.' },
            { id: 'DL-4197', date: '2025-01-14', zone: 'Remote', vehicle: '4x4', distance: 48.3, duration: '1h 45min', amount: 68.50, status: 'processing', rating: null, customer: 'Anna T.' },
            { id: 'DL-4196', date: '2025-01-13', zone: 'Suburban', vehicle: 'van', distance: 18.7, duration: '52 min', amount: 38.00, status: 'completed', rating: 4.5, customer: 'Mike P.' },
            { id: 'DL-4195', date: '2025-01-13', zone: 'Urban', vehicle: 'motorcycle', distance: 3.8, duration: '14 min', amount: 12.50, status: 'completed', rating: 4.7, customer: 'Lisa W.' },
            { id: 'DL-4194', date: '2025-01-12', zone: 'Rural', vehicle: 'van', distance: 28.5, duration: '1h 05min', amount: 45.00, status: 'completed', rating: 4.6, customer: 'Tom H.' },
            { id: 'DL-4193', date: '2025-01-12', zone: 'Urban', vehicle: 'motorcycle', distance: 6.9, duration: '22 min', amount: 16.00, status: 'pending', rating: null, customer: 'Sophie B.' },
            { id: 'DL-4192', date: '2025-01-11', zone: 'Remote', vehicle: '4x4', distance: 52.1, duration: '2h 10min', amount: 74.00, status: 'completed', rating: 5.0, customer: 'Chris N.' },
        ]
    };

    filteredPayments: PaymentItem[] = [];
    resizeTimer: any;

    ngOnInit(): void {
        this.generateMockChartData();
        this.filteredPayments = [...this.earnings.recentPayments];
    }

    ngAfterViewInit(): void {
        this.drawCharts();
    }

    @HostListener('window:resize')
    onResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.drawCharts();
        }, 200);
    }

    generateMockChartData(): void {
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const base = 180 + Math.sin(i * 0.4) * 80 + Math.random() * 120;
            const prevBase = 160 + Math.sin(i * 0.35) * 70 + Math.random() * 100;
            this.earnings.dailyTrend.push({
                date: d,
                label: `${d.getMonth() + 1}/${d.getDate()}`,
                value: Math.round(base * 100) / 100
            });
            this.earnings.prevDailyTrend.push({
                value: Math.round(prevBase * 100) / 100
            });
        }
    }

    drawCharts(): void {
        this.drawLineChart();
        this.drawDonutChart();
    }

    drawLineChart(): void {
        if (!this.lineChartCanvas) return;
        const canvas = this.lineChartCanvas.nativeElement;

        // Disconnect old listeners to avoid buildup on resize
        const newCanvas = canvas.cloneNode(true) as HTMLCanvasElement;
        if (canvas.parentNode) canvas.parentNode.replaceChild(newCanvas, canvas);
        this.lineChartCanvas.nativeElement = newCanvas;

        const dpr = window.devicePixelRatio || 1;
        const rect = newCanvas.parentElement?.getBoundingClientRect();
        if (!rect) return;

        const W = rect.width;
        const H = 280;

        newCanvas.width = W * dpr;
        newCanvas.height = H * dpr;
        newCanvas.style.width = `${W}px`;
        newCanvas.style.height = `${H}px`;

        const ctx = newCanvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);

        const padding = { top: 20, right: 20, bottom: 40, left: 55 };
        const cW = W - padding.left - padding.right;
        const cH = H - padding.top - padding.bottom;

        const values = this.earnings.dailyTrend.map(d => d.value);
        const prevValues = this.earnings.prevDailyTrend.map(d => d.value);
        const allValues = [...values, ...prevValues];

        const minV = Math.min(...allValues) * 0.85;
        const maxV = Math.max(...allValues) * 1.1;
        const range = maxV - minV || 1;

        const xPos = (i: number) => padding.left + (i / (values.length - 1)) * cW;
        const yPos = (v: number) => padding.top + cH - ((v - minV) / range) * cH;

        // Grid lines
        ctx.strokeStyle = '#F0EDE7';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let g = 0; g <= gridLines; g++) {
            const gy = padding.top + (g / gridLines) * cH;
            ctx.beginPath();
            ctx.moveTo(padding.left, gy);
            ctx.lineTo(W - padding.right, gy);
            ctx.stroke();

            const gridVal = maxV - (g / gridLines) * range;
            ctx.fillStyle = '#9C9690';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('$' + Math.round(gridVal), padding.left - 10, gy);
        }

        // X-axis labels
        ctx.fillStyle = '#9C9690';
        ctx.font = '10.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const step = Math.ceil(values.length / 8);
        for (let xi = 0; xi < values.length; xi += step) {
            ctx.fillText(this.earnings.dailyTrend[xi].label, xPos(xi), H - padding.bottom + 12);
        }

        // Previous period line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#DDD0B8';
        ctx.lineWidth = 1.5;
        prevValues.forEach((v, i) => {
            if (i === 0) ctx.moveTo(xPos(i), yPos(v));
            else ctx.lineTo(xPos(i), yPos(v));
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom);
        gradient.addColorStop(0, 'rgba(139,115,85,0.15)');
        gradient.addColorStop(1, 'rgba(139,115,85,0.01)');

        ctx.beginPath();
        values.forEach((v, i) => {
            if (i === 0) ctx.moveTo(xPos(i), yPos(v));
            else ctx.lineTo(xPos(i), yPos(v));
        });
        ctx.lineTo(xPos(values.length - 1), H - padding.bottom);
        ctx.lineTo(xPos(0), H - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main line
        ctx.beginPath();
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        values.forEach((v, i) => {
            if (i === 0) ctx.moveTo(xPos(i), yPos(v));
            else ctx.lineTo(xPos(i), yPos(v));
        });
        ctx.stroke();

        // Data points
        values.forEach((v, i) => {
            ctx.beginPath();
            ctx.arc(xPos(i), yPos(v), 3, 0, Math.PI * 2);
            ctx.fillStyle = '#8B7355';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(xPos(i), yPos(v), 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        });

        // Tooltip logic
        const tooltip = this.tooltipContainer?.nativeElement;
        if (tooltip) {
            newCanvas.addEventListener('mousemove', (e) => {
                const r = newCanvas.getBoundingClientRect();
                const mx = e.clientX - r.left;
                let closestIdx = 0;
                let closestDist = Infinity;

                values.forEach((v, i) => {
                    const dist = Math.abs(mx - xPos(i));
                    if (dist < closestDist) { closestDist = dist; closestIdx = i; }
                });

                if (closestDist < 25) {
                    const ttX = xPos(closestIdx);
                    const ttY = yPos(values[closestIdx]);

                    tooltip.querySelector('.cc-chart-tooltip__label')!.textContent = this.earnings.dailyTrend[closestIdx].label;
                    tooltip.querySelector('.cc-chart-tooltip__value')!.textContent = '$' + values[closestIdx].toFixed(2);
                    tooltip.style.left = (ttX - 40) + 'px';
                    tooltip.style.top = (ttY - 50) + 'px';
                    tooltip.classList.add('cc-chart-tooltip--visible');
                } else {
                    tooltip.classList.remove('cc-chart-tooltip--visible');
                }
            });

            newCanvas.addEventListener('mouseleave', () => {
                tooltip.classList.remove('cc-chart-tooltip--visible');
            });
        }
    }

    drawDonutChart(): void {
        if (!this.donutChartCanvas) return;
        const canvas = this.donutChartCanvas.nativeElement;

        const dpr = window.devicePixelRatio || 1;
        const size = 220;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const outerR = 95;
        const innerR = 62;

        const segments = this.earnings.vehicleBreakdown;
        const total = segments.reduce((s, seg) => s + seg.value, 0);
        let startAngle = -Math.PI / 2;

        segments.forEach(seg => {
            const sliceAngle = (seg.value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, endAngle);
            ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();

            // Gap
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, endAngle - 0.02, endAngle + 0.02);
            ctx.arc(cx, cy, innerR, endAngle + 0.02, endAngle - 0.02, true);
            ctx.closePath();
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            startAngle = endAngle;
        });

        // Center text
        ctx.fillStyle = '#2C2A26';
        ctx.font = '700 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$' + (total / 1000).toFixed(1) + 'k', cx, cy - 6);

        ctx.fillStyle = '#9C9690';
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillText('Total', cx, cy + 14);
    }

    setPeriod(period: string): void {
        this.activePeriod = period;
        // In a real app we would refetch data here.
    }

    onFilterPayments(event: Event): void {
        const q = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredPayments = this.earnings.recentPayments.filter(d =>
            d.id.toLowerCase().includes(q) ||
            d.customer.toLowerCase().includes(q) ||
            d.zone.toLowerCase().includes(q) ||
            d.vehicle.toLowerCase().includes(q)
        );
    }

    // Pure template helpers
    getTypeBadgeClass(vehicle: string): string {
        const map: any = { motorcycle: 'cc-badge--motorcycle', van: 'cc-badge--van', '4x4': 'cc-badge--fourx4' };
        return map[vehicle] || '';
    }

    getTypeLabel(vehicle: string): string {
        const map: any = { motorcycle: 'Motorcycle', van: 'Van', '4x4': '4×4' };
        return map[vehicle] || vehicle;
    }

    getTypeEmoji(vehicle: string): string {
        const map: any = { motorcycle: '🏍️', van: '🚐', '4x4': '🚙' };
        return map[vehicle] || '📦';
    }

    getTypeIconBg(vehicle: string): string {
        const map: any = { motorcycle: 'background:#EFF6FF;', van: 'background:#F5F0E8;', '4x4': 'background:#F0FAF4;' };
        return map[vehicle] || '';
    }

    getStatusBadgeClass(status: string): string {
        const map: any = { completed: 'cc-badge--completed', pending: 'cc-badge--pending', processing: 'cc-badge--processing' };
        return map[status] || '';
    }

    getZoneEmoji(zone: string): string {
        const map: any = { Urban: '🏙️', Suburban: '🏘️', Rural: '🌾', Remote: '⛰️' };
        return map[zone] || '';
    }

    generateStarsArray(rating: number | null): number[] {
        if (!rating) return [];
        const rounded = Math.round(rating);
        return Array(5).fill(0).map((_, i) => i + 1 <= rounded ? 1 : 0);
    }
}
