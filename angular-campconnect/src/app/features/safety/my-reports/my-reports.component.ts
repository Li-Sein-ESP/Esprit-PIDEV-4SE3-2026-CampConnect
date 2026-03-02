import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TimelineEvent {
    step: string;
    date: string | null;
    active: boolean;
    message?: string;
    rejected?: boolean;
}

interface Report {
    id: string;
    issueType: string;
    refType: string;
    refName: string;
    dateSubmitted: string;
    status: 'pending' | 'review' | 'resolved' | 'rejected';
    adminMessage: string | null;
    description: string;
    evidence: string[];
    timeline: TimelineEvent[];
}

@Component({
    selector: 'app-my-reports',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-reports.component.html',
    styleUrls: ['./my-reports.component.scss']
})
export class MyReportsComponent {

    reports: Report[] = [
        {
            id: 'RPT-20248',
            issueType: 'Inappropriate Content',
            refType: 'Post',
            refName: 'Sunset Peak Campground Review',
            dateSubmitted: '2024-12-18',
            status: 'resolved',
            adminMessage: 'The reported content has been removed and the user has been notified of the community guidelines.',
            description: 'This post contains misleading information about trail safety conditions. The author claims the summit trail is beginner-friendly, but it requires Class 3 scrambling and has significant exposure. This could endanger inexperienced hikers who attempt the route without proper gear.',
            evidence: ['screenshot_trail_post.png', 'trail_conditions_photo.jpg', 'safety_report.pdf'],
            timeline: [
                { step: 'Submitted', date: '2024-12-18 09:32 AM', active: true },
                { step: 'Under Review', date: '2024-12-19 02:15 PM', active: true },
                { step: 'Decision Made', date: '2024-12-21 11:00 AM', active: true, message: 'Content has been reviewed and removed for violating safety guidelines. Thank you for helping keep the community safe.' }
            ]
        },
        {
            id: 'RPT-20253',
            issueType: 'Product Quality Issue',
            refType: 'Product',
            refName: 'TrekMaster 4-Season Tent',
            dateSubmitted: '2025-01-05',
            status: 'review',
            adminMessage: null,
            description: 'Received the tent with a damaged rain fly and missing stakes. The waterproof coating on the seams appears to be peeling off. Product listing advertises "weatherproof construction" which does not match the delivered product quality.',
            evidence: ['damaged_rainfly.jpg', 'missing_parts.jpg'],
            timeline: [
                { step: 'Submitted', date: '2025-01-05 03:18 PM', active: true },
                { step: 'Under Review', date: '2025-01-06 10:30 AM', active: true, message: 'Our quality team is currently inspecting this report and will reach out shortly.' },
                { step: 'Decision', date: null, active: false }
            ]
        },
        {
            id: 'RPT-20261',
            issueType: 'Fraudulent Listing',
            refType: 'Product',
            refName: 'Solar Camp Charger Pro',
            dateSubmitted: '2025-01-12',
            status: 'pending',
            adminMessage: null,
            description: 'The product listing uses stock images that do not represent the actual item. Specifications listed are significantly exaggerated. The "10000mAh" capacity tested at roughly 3000mAh. Seller has multiple similar listings with identical patterns.',
            evidence: ['comparison_photos.png', 'capacity_test.jpg', 'listing_screenshot.png'],
            timeline: [
                { step: 'Submitted', date: '2025-01-12 08:45 AM', active: true },
                { step: 'Under Review', date: null, active: false },
                { step: 'Decision', date: null, active: false }
            ]
        },
        {
            id: 'RPT-20215',
            issueType: 'Order Dispute',
            refType: 'Order',
            refName: 'Order #CC-99481',
            dateSubmitted: '2024-11-28',
            status: 'rejected',
            adminMessage: 'After thorough review, the order was delivered within the stated timeframe and matches the product description. The return window has also passed.',
            description: 'I ordered a premium hiking backpack but received a smaller capacity version. The color also does not match what was shown on the listing page. I want a full refund or correct replacement.',
            evidence: ['order_confirmation.png', 'received_item.jpg'],
            timeline: [
                { step: 'Submitted', date: '2024-11-28 11:20 AM', active: true },
                { step: 'Under Review', date: '2024-11-29 09:00 AM', active: true },
                { step: 'Decision Made', date: '2024-12-02 04:45 PM', active: true, message: 'After reviewing the order details and delivery photos, the product matches the listing specifications. The return window of 14 days has passed. We recommend contacting the seller directly for further resolution.', rejected: true }
            ]
        },
        {
            id: 'RPT-20270',
            issueType: 'Safety Concern',
            refType: 'Post',
            refName: 'DIY Bear Canister Guide',
            dateSubmitted: '2025-01-18',
            status: 'review',
            adminMessage: null,
            description: 'This post provides instructions for building a homemade bear canister from household materials. Following these instructions would create a container that does not meet IGBC requirements and could lead to dangerous bear encounters. This content should be flagged as potentially harmful.',
            evidence: ['post_screenshot.png'],
            timeline: [
                { step: 'Submitted', date: '2025-01-18 06:10 PM', active: true },
                { step: 'Under Review', date: '2025-01-19 08:00 AM', active: true },
                { step: 'Decision', date: null, active: false }
            ]
        }
    ];

    activeFilter = 'all';
    selectedReport: Report | null = null;
    isModalOpen = false;

    get filterCounts() {
        const counts: Record<string, number> = { all: this.reports.length };
        for (const report of this.reports) {
            counts[report.status] = (counts[report.status] || 0) + 1;
        }
        return counts;
    }

    get filteredReports() {
        if (this.activeFilter === 'all') {
            return this.reports;
        }
        return this.reports.filter(r => r.status === this.activeFilter);
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: 'Pending',
            review: 'Under Review',
            resolved: 'Resolved',
            rejected: 'Rejected'
        };
        return labels[status] || status;
    }

    openModal(report: Report) {
        this.selectedReport = report;
        this.isModalOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.isModalOpen = false;
        document.body.style.overflow = '';
        // Optional: wait for animation before clearing data
        setTimeout(() => {
            this.selectedReport = null;
        }, 300);
    }

    isImageEvi(filename: string): boolean {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }
}
