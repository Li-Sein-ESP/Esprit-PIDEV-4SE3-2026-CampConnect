import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/components/card.component';
import { CardContentComponent } from '../../../shared/components/card.component';

interface ContentPreview {
  user: string;
  date: string;
  text: string;
  hasImage: boolean;
}

interface Report {
  id: string;
  type: string;
  entity: string;
  reporter: string;
  reporterEmail: string;
  reporterJoined: string;
  date: string;
  status: string;
  description: string;
  evidence: string[];
  contentPreview: ContentPreview;
}

interface TimelineEvent {
  date: string;
  event: string;
}

interface Dispute {
  orderId: string;
  buyer: string;
  seller: string;
  amount: string;
  status: string;
  reason: string;
  description: string;
  timeline: TimelineEvent[];
}

interface Verification {
  id: string;
  avatar: string;
  name: string;
  type: string;
  appliedDate: string;
  pendingTime: string;
  docs: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface SuspendedUser {
  id: string;
  avatar: string;
  name: string;
  reason: string;
  expiry: string;
  status: 'Suspended' | 'Banned';
}

interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info';
  id: number;
}

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, CardContentComponent],
  templateUrl: './admin-moderation.component.html',
  styleUrls: ['./admin-moderation.component.scss']
})
export class AdminModerationComponent implements OnInit {
  activeTab: string = 'dashboard';
  tabTitles: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'reported-posts': 'Reported Posts',
    'reported-users': 'Reported Users',
    'disputes': 'Disputes',
    'verification': 'Verification Requests',
    'suspended': 'Suspended Accounts'
  };

  reports: Report[] = [
    {
      id: 'RPT-0045', type: 'Post', entity: 'Fake campsite listing in Yosemite', reporter: 'OutdoorFan22', reporterEmail: 'outdoorfan22@email.com', reporterJoined: 'Mar 2023',
      date: 'Jan 15, 2025', status: 'Pending',
      description: 'This post advertises a campsite in Yosemite National Park that does not exist. The images appear to be stock photos, and the described amenities (private hot springs, helicopter access) are completely fabricated. Multiple users have attempted to book and received no confirmation. This appears to be a deliberate scam designed to collect payment information.',
      evidence: ['Screenshot of listing', 'Google Maps comparison', 'Failed booking receipt'],
      contentPreview: { user: 'YosemiteCamps', date: 'Jan 12, 2025', text: '⛺ EXCLUSIVE: Private luxury campsite in Yosemite Valley! Hot springs, helicopter pad, gourmet kitchen. Only $49/night! Book now before it\'s gone! Limited spots available for the season.', hasImage: true }
    },
    {
      id: 'RPT-0044', type: 'Post', entity: 'Hate speech in community forum', reporter: 'HikerJane', reporterEmail: 'hikerjane@email.com', reporterJoined: 'Jun 2022',
      date: 'Jan 14, 2025', status: 'Escalated',
      description: 'User posted extremely offensive and discriminatory content targeting specific ethnic groups in the "Campfire Stories" community forum. The post contains explicit hate speech, slurs, and calls for exclusion. This post has been reported by 7 different users and violates community guidelines sections 3.1, 3.2, and 4.5. Immediate action recommended.',
      evidence: ['Original post screenshot', 'User comment thread', 'Previous warning log'],
      contentPreview: { user: 'AnonymousUser', date: 'Jan 14, 2025', text: '[Content hidden — contains hate speech and discriminatory language violating Community Guidelines §3.1-3.2]', hasImage: false }
    },
    {
      id: 'RPT-0043', type: 'Product', entity: 'Counterfeit tent listing', reporter: 'GearChecker', reporterEmail: 'gearchecker@email.com', reporterJoined: 'Aug 2023',
      date: 'Jan 14, 2025', status: 'In Review',
      description: 'The product listed as "MSR Hubba Hubba NX 2-Person Tent" is a counterfeit item. The reporter is a verified outdoor gear expert who identified several discrepancies: incorrect stitching patterns, wrong zipper brand, mismatched color codes. The seller has 3 other similar listings that may also be counterfeit.',
      evidence: ['Product comparison photos', 'MSR brand verification email', 'Seller listing history'],
      contentPreview: { user: 'BudgetGear2024', date: 'Jan 11, 2025', text: 'MSR Hubba Hubba NX 2-Person Tent — Like new condition, used only twice! Retail $499, selling for $129. Includes footprint and rain fly. Fast shipping guaranteed.', hasImage: true }
    },
    {
      id: 'RPT-0042', type: 'Post', entity: 'Misleading campground photos', reporter: 'NatureLover88', reporterEmail: 'naturelover88@email.com', reporterJoined: 'Jan 2024',
      date: 'Jan 13, 2025', status: 'Pending',
      description: 'The campground listing uses heavily edited photos that don\'t represent actual conditions. Upon visiting, the reporter found overgrown sites, broken facilities, and no running water — none of which was disclosed in the listing. The host has received 4 similar complaints in the past 2 months.',
      evidence: ['Listing photos vs actual photos', 'Guest review screenshots', 'Prior complaint records'],
      contentPreview: { user: 'SunnySiteHost', date: 'Jan 8, 2025', text: 'Beautiful riverside campsite with modern amenities! Clean restrooms, hot showers, fire pits, and stunning views. Perfect for families. Just 10 minutes from town.', hasImage: true }
    },
    {
      id: 'RPT-0041', type: 'Post', entity: 'Spam promotion post', reporter: 'CampMod3', reporterEmail: 'campmod3@internal.com', reporterJoined: 'Staff',
      date: 'Jan 12, 2025', status: 'Resolved',
      description: 'Automated spam post promoting an unrelated commercial product (weight loss supplements) in the camping community forums. Post contained affiliate links and was cross-posted in 12 different threads. User account was flagged by automated systems and confirmed by moderator.',
      evidence: ['Spam post screenshot', 'Cross-posting log', 'Affiliate link analysis'],
      contentPreview: { user: 'HealthyLiving2024', date: 'Jan 12, 2025', text: '🔥 AMAZING DEAL! Lose 30 lbs while camping! Click here for our revolutionary supplements... [SPAM CONTENT REMOVED]', hasImage: false }
    },
    {
      id: 'RPT-0040', type: 'Post', entity: 'Dangerous campfire advice', reporter: 'SafetyFirst101', reporterEmail: 'safetyfirst@email.com', reporterJoined: 'May 2023',
      date: 'Jan 12, 2025', status: 'Pending',
      description: 'Post provides dangerous and incorrect advice about starting campfires using gasoline and other accelerants. The instructions could lead to serious injury or wildfires. Several comments have already expressed concern. This content should be removed for safety reasons and the user should be warned about posting dangerous advice.',
      evidence: ['Post screenshot', 'Fire safety expert opinion', 'Comment thread warnings'],
      contentPreview: { user: 'PyroHiker', date: 'Jan 11, 2025', text: 'Pro tip: Pour a cup of gasoline on your wood pile for instant campfire! Works every time, even with wet wood. Another trick is using...', hasImage: false }
    }
  ];

  userReports: Report[] = [
    {
      id: 'RPT-U001', type: 'User', entity: 'DarkTrail', reporter: 'MountainMike', reporterEmail: 'mountainmike@email.com', reporterJoined: 'Feb 2023',
      date: 'Jan 15, 2025', status: 'Escalated',
      description: 'User DarkTrail has been reported by 3 separate users in the past week for aggressive behavior, threatening messages, and intentionally leaving false negative reviews on competitor campsite listings. The user has previously received 2 warnings. Account has been active since Oct 2024 and has accumulated 5 total violations.',
      evidence: ['Threatening message screenshots (3)', 'False review comparison', 'Previous warning history'],
      contentPreview: { user: 'DarkTrail', date: 'Active since Oct 2024', text: 'Account overview: 47 posts, 23 reviews (8 flagged), 3 active reports, 2 prior warnings. Trust score: 12/100. Last active: 2 hours ago.', hasImage: false }
    },
    {
      id: 'RPT-U002', type: 'User', entity: 'ScamSeller42', reporter: 'TrustyCamper', reporterEmail: 'trusty@email.com', reporterJoined: 'Apr 2023',
      date: 'Jan 14, 2025', status: 'Pending',
      description: 'User appears to be operating a scam selling operation. Multiple products listed at unusually low prices with stock photos. Two buyers have reported not receiving products after payment. Account was created 2 weeks ago with no verification.',
      evidence: ['Product listing screenshots', 'Payment receipts', 'Buyer complaint messages'],
      contentPreview: { user: 'ScamSeller42', date: 'Active since Jan 2025', text: 'Account overview: 15 product listings, 0 reviews, 2 complaints, 0 verifications. Trust score: 5/100. Account age: 14 days.', hasImage: false }
    },
    {
      id: 'RPT-U003', type: 'User', entity: 'FakeReviewer77', reporter: 'HostHelper', reporterEmail: 'hosthelper@email.com', reporterJoined: 'Jul 2022',
      date: 'Jan 13, 2025', status: 'In Review',
      description: 'User is suspected of posting fake positive reviews in exchange for payment. Pattern analysis shows 30+ reviews posted in 48 hours, all 5-star, with similar language and structure. Multiple hosts have been identified as potentially paying for these reviews.',
      evidence: ['Review pattern analysis', 'Language similarity report', 'Timing correlation data'],
      contentPreview: { user: 'FakeReviewer77', date: 'Active since Dec 2024', text: 'Account overview: 2 posts, 34 reviews (30 flagged for similarity), 1 active report, 0 prior warnings. Trust score: 8/100.', hasImage: false }
    },
    {
      id: 'RPT-U004', type: 'User', entity: 'AggressiveAndy', reporter: 'PeacefulPat', reporterEmail: 'peaceful@email.com', reporterJoined: 'Sep 2023',
      date: 'Jan 12, 2025', status: 'Pending',
      description: 'User has sent aggressive and threatening private messages to another user following a campsite booking disagreement. Messages include threats of physical violence and doxxing. Reporter has provided full message thread as evidence.',
      evidence: ['Message thread screenshots', 'Threat analysis report'],
      contentPreview: { user: 'AggressiveAndy', date: 'Active since Jun 2024', text: 'Account overview: 28 posts, 11 reviews, 1 active report, 1 prior warning (verbal abuse). Trust score: 25/100.', hasImage: false }
    },
    {
      id: 'RPT-U005', type: 'User', entity: 'SpamBot2024', reporter: 'System', reporterEmail: 'system@campconnect.com', reporterJoined: 'System',
      date: 'Jan 11, 2025', status: 'Resolved',
      description: 'Automated detection flagged this account as a bot. Account created 200+ posts in 1 hour, all containing affiliate links. IP analysis shows connection from known bot farm. Account has been permanently banned.',
      evidence: ['Automated detection log', 'IP analysis report', 'Post frequency chart'],
      contentPreview: { user: 'SpamBot2024', date: 'Created Jan 11, 2025', text: 'Account overview: 247 posts (all spam), 0 reviews, auto-detected, permanently banned. Trust score: 0/100.', hasImage: false }
    }
  ];

  disputes: Dispute[] = [
    {
      orderId: 'ORD-7823', buyer: 'SarahHiker', seller: 'GearDepot', amount: '$189.00', status: 'Escalated',
      reason: 'Equipment never delivered',
      description: 'Buyer purchased a backpacking tent on Jan 2, 2025. Seller provided tracking number which shows "delivered" on Jan 8, but buyer claims package never arrived. Seller refuses refund citing delivery confirmation. Buyer has filed a police report for package theft. Delivery was to a shared apartment building without secure package area.',
      timeline: [
        { date: 'Jan 2', event: 'Order placed and payment processed' },
        { date: 'Jan 4', event: 'Seller shipped item, tracking provided' },
        { date: 'Jan 8', event: 'Carrier marks as delivered' },
        { date: 'Jan 9', event: 'Buyer reports non-receipt' },
        { date: 'Jan 11', event: 'Seller declines refund' },
        { date: 'Jan 13', event: 'Buyer escalates to admin' },
      ]
    },
    {
      orderId: 'ORD-7801', buyer: 'WeekendWarrior', seller: 'PineGroveRetreat', amount: '$75.00', status: 'Pending',
      reason: 'Campsite conditions not as advertised',
      description: 'Guest booked a "premium riverside campsite" for $150/night. Upon arrival, the site had no river access (seasonal drought), broken picnic table, and restrooms were closed for maintenance — none of which was disclosed. Guest is requesting 50% refund. Host argues drought conditions are outside their control.',
      timeline: [
        { date: 'Jan 5', event: 'Booking confirmed for Jan 10-11' },
        { date: 'Jan 10', event: 'Guest arrives, finds discrepancies' },
        { date: 'Jan 11', event: 'Guest contacts host for partial refund' },
        { date: 'Jan 12', event: 'Host offers 10% discount on future booking' },
        { date: 'Jan 13', event: 'Guest files formal dispute' },
      ]
    },
    {
      orderId: 'ORD-7756', buyer: 'CampChef88', seller: 'OutdoorKitchenPro', amount: '$64.50', status: 'In Review',
      reason: 'Product arrived damaged',
      description: 'Buyer received a portable camping stove with a cracked burner plate and missing carrying case. Photos show damage consistent with inadequate packaging. Seller claims item was in perfect condition when shipped and suspects carrier damage. Neither party has carrier insurance. Buyer wants full refund or replacement.',
      timeline: [
        { date: 'Jan 3', event: 'Order placed' },
        { date: 'Jan 6', event: 'Item shipped' },
        { date: 'Jan 10', event: 'Item delivered — damage noted' },
        { date: 'Jan 10', event: 'Buyer contacts seller with photos' },
        { date: 'Jan 12', event: 'Seller declines responsibility' },
        { date: 'Jan 13', event: 'Dispute filed' },
      ]
    }
  ];

  verifications: Verification[] = [
    {
      id: 'verif-1', avatar: 'MR', name: 'MountainRetreatsCo', type: 'Commercial Host', appliedDate: 'Jan 10, 2025', pendingTime: '5 days pending',
      docs: ['Business License.pdf', 'Insurance Certificate.pdf', 'Property Photos (8)'], status: 'Pending'
    },
    {
      id: 'verif-2', avatar: 'TB', name: 'TrailBlazer92', type: 'Individual Host', appliedDate: 'Jan 14, 2025', pendingTime: '1 day pending',
      docs: ['Government ID.jpg', 'Proof of Address.pdf', 'Property Photos (3)'], status: 'Pending'
    },
    {
      id: 'verif-3', avatar: 'WC', name: 'WildCampersLLC', type: 'Commercial Host', appliedDate: 'Jan 12, 2025', pendingTime: '3 days pending',
      docs: ['LLC Registration.pdf', 'Tax ID Document.pdf'], status: 'Pending'
    },
    {
      id: 'verif-4', avatar: 'RL', name: 'RiverLodgeHost', type: 'Individual Host', appliedDate: 'Jan 13, 2025', pendingTime: '2 days pending',
      docs: ['Passport Scan.jpg', 'Site Photos (5)'], status: 'Pending'
    }
  ];

  suspendedUsers: SuspendedUser[] = [
    { id: 'CK', avatar: 'CK', name: 'CampKing99', reason: 'Repeated harassment in community forums · 30-day suspension', expiry: 'Expires Feb 12, 2025', status: 'Suspended' },
    { id: 'TL', avatar: 'TL', name: 'ToxicLurker', reason: 'Hate speech and threats · Permanent ban', expiry: 'Permanent', status: 'Banned' },
    { id: 'FS', avatar: 'FS', name: 'FakeListings2024', reason: 'Posting fraudulent campsite listings · 90-day suspension', expiry: 'Expires Mar 28, 2025', status: 'Suspended' },
    { id: 'SB', avatar: 'SB', name: 'SpamBot2024', reason: 'Automated spam account · Permanent ban', expiry: 'Permanent', status: 'Banned' },
    { id: 'NR', avatar: 'NR', name: 'NoRefundNate', reason: 'Multiple unresolved buyer disputes · 14-day suspension', expiry: 'Expires Jan 26, 2025', status: 'Suspended' },
    { id: 'PI', avatar: 'PI', name: 'PhotoImpersonator', reason: 'Using stolen identity photos · 60-day suspension + investigation', expiry: 'Expires Mar 10, 2025', status: 'Suspended' }
  ];

  // UI State
  reportFilter: string = 'all';
  userFilter: string = 'all';
  disputeFilter: string = 'all';
  verifFilter: string = 'Pending';
  suspendedFilter: string = 'Active Suspensions';

  isDetailOpen: boolean = false;
  detailMode: 'report' | 'dispute' | null = null;
  selectedReport: Report | null = null;
  selectedDispute: Dispute | null = null;

  toasts: Toast[] = [];
  toastIdCounter = 0;

  ngOnInit(): void {
  }

  get filteredReports(): Report[] {
    if (this.reportFilter === 'all') return this.reports;
    return this.reports.filter(r => r.status.toLowerCase() === this.reportFilter || (this.reportFilter === 'pending' && r.status.toLowerCase() === 'escalated'));
  }

  get filteredUserReports(): Report[] {
    if (this.userFilter === 'all') return this.userReports;
    return this.userReports.filter(r => r.status.toLowerCase() === this.userFilter || (this.userFilter === 'pending' && r.status.toLowerCase() === 'escalated'));
  }

  get filteredDisputes(): Dispute[] {
    if (this.disputeFilter === 'all') return this.disputes;
    if (this.disputeFilter === 'Escalated') return this.disputes.filter(d => d.status === 'Escalated');
    if (this.disputeFilter === 'Closed') return this.disputes.filter(d => d.status === 'Resolved');
    return this.disputes.filter(d => d.status !== 'Resolved'); // Open
  }

  get filteredVerifications(): Verification[] {
    return this.verifications.filter(v => v.status === this.verifFilter);
  }

  get filteredSuspendedUsers(): SuspendedUser[] {
    if (this.suspendedFilter === 'Permanent Bans') return this.suspendedUsers.filter(u => u.status === 'Banned');
    if (this.suspendedFilter === 'Active Suspensions') return this.suspendedUsers.filter(u => u.status === 'Suspended');
    return []; // Expired
  }

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  setFilter(type: string, filter: string): void {
    if (type === 'report') this.reportFilter = filter;
    if (type === 'user') this.userFilter = filter;
    if (type === 'dispute') this.disputeFilter = filter;
    if (type === 'verif') this.verifFilter = filter;
    if (type === 'suspended') this.suspendedFilter = filter;
  }

  openReportDetail(reportId: string, isUserReport: boolean = false): void {
    const dataList = isUserReport ? this.userReports : this.reports;
    const report = dataList.find(r => r.id === reportId);
    if (report) {
      this.selectedReport = report;
      this.detailMode = 'report';
      this.isDetailOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  openDisputeDetail(orderId: string): void {
    const dispute = this.disputes.find(d => d.orderId === orderId);
    if (dispute) {
      this.selectedDispute = dispute;
      this.detailMode = 'dispute';
      this.isDetailOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    setTimeout(() => {
      this.detailMode = null;
      this.selectedReport = null;
      this.selectedDispute = null;
    }, 250);
    document.body.style.overflow = '';
  }

  closeDetailIfOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('cc-admin__detail-overlay')) {
      this.closeDetail();
    }
  }

  handleAction(action: string): void {
    if (!this.selectedReport) return;
    const reportId = this.selectedReport.id;
    const messages: any = {
      'dismiss': 'Report ' + reportId + ' dismissed',
      'remove': 'Content from ' + reportId + ' has been removed',
      'suspend': 'User associated with ' + reportId + ' has been suspended',
      'ban': 'User associated with ' + reportId + ' has been permanently banned',
      'resolve': 'Report ' + reportId + ' marked as resolved'
    };
    const types: any = {
      'dismiss': 'info',
      'remove': 'danger',
      'suspend': 'danger',
      'ban': 'danger',
      'resolve': 'success'
    };

    if (action === 'dismiss') this.selectedReport.status = 'Dismissed';
    if (action === 'resolve') this.selectedReport.status = 'Resolved';

    this.showToast(messages[action], types[action]);
    this.closeDetail();
  }

  handleDisputeAction(action: string): void {
    if (!this.selectedDispute) return;
    const orderId = this.selectedDispute.orderId;
    const messages: any = {
      'dismiss': 'Dispute for ' + orderId + ' dismissed',
      'partial': 'Partial refund issued for ' + orderId,
      'refund': 'Full refund issued to buyer for ' + orderId,
      'resolve': 'Dispute ' + orderId + ' marked as resolved'
    };
    const types: any = {
      'dismiss': 'info',
      'partial': 'success',
      'refund': 'success',
      'resolve': 'success'
    };

    if (action === 'resolve' || action === 'refund' || action === 'partial' || action === 'dismiss') {
      this.selectedDispute.status = 'Resolved';
    }

    this.showToast(messages[action], types[action]);
    this.closeDetail();
  }

  handleVerification(item: Verification, action: 'approved' | 'rejected'): void {
    item.status = action === 'approved' ? 'Approved' : 'Rejected';
    const msg = action === 'approved' ? item.name + ' has been verified and approved' : item.name + ' verification request rejected';
    this.showToast(msg, action === 'approved' ? 'success' : 'danger');
  }

  showInfoToast(msg: string): void {
    this.showToast(msg, 'info');
  }

  showToast(message: string, type: 'success' | 'danger' | 'info'): void {
    const id = this.toastIdCounter++;
    this.toasts.push({ message, type, id });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3500);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    if (this.isDetailOpen) {
      this.closeDetail();
    }
  }

  // Helper getters
  get openReportsCount(): number {
    return this.reports.filter(r => r.status !== 'Resolved' && r.status !== 'Dismissed').length;
  }

  get activeDisputesCount(): number {
    return this.disputes.filter(d => d.status !== 'Resolved').length;
  }

  get pendingVerificationsCount(): number {
    return this.verifications.filter(v => v.status === 'Pending').length;
  }

  get suspendedUsersCount(): number {
    return this.suspendedUsers.length;
  }

}
