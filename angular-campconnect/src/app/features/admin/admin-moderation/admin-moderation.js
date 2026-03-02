
  /* =====================================================
     CampConnect Admin Dashboard — Controller Logic
     Framework-agnostic, easy Angular integration
  ===================================================== */

  // ---- Data Store (mock) ----
  const reportData = {
    'RPT-0045': {
      id: 'RPT-0045',
      type: 'Post',
      entity: 'Fake campsite listing in Yosemite',
      reporter: 'OutdoorFan22',
      reporterEmail: 'outdoorfan22@email.com',
      reporterJoined: 'Mar 2023',
      date: 'Jan 15, 2025',
      status: 'Pending',
      description: 'This post advertises a campsite in Yosemite National Park that does not exist. The images appear to be stock photos, and the described amenities (private hot springs, helicopter access) are completely fabricated. Multiple users have attempted to book and received no confirmation. This appears to be a deliberate scam designed to collect payment information.',
      evidence: ['Screenshot of listing', 'Google Maps comparison', 'Failed booking receipt'],
      contentPreview: {
        user: 'YosemiteCamps',
        date: 'Jan 12, 2025',
        text: '⛺ EXCLUSIVE: Private luxury campsite in Yosemite Valley! Hot springs, helicopter pad, gourmet kitchen. Only $49/night! Book now before it\'s gone! Limited spots available for the season.',
        hasImage: true
      }
    },
    'RPT-0044': {
      id: 'RPT-0044',
      type: 'Post',
      entity: 'Hate speech in community forum',
      reporter: 'HikerJane',
      reporterEmail: 'hikerjane@email.com',
      reporterJoined: 'Jun 2022',
      date: 'Jan 14, 2025',
      status: 'Escalated',
      description: 'User posted extremely offensive and discriminatory content targeting specific ethnic groups in the "Campfire Stories" community forum. The post contains explicit hate speech, slurs, and calls for exclusion. This post has been reported by 7 different users and violates community guidelines sections 3.1, 3.2, and 4.5. Immediate action recommended.',
      evidence: ['Original post screenshot', 'User comment thread', 'Previous warning log'],
      contentPreview: {
        user: 'AnonymousUser',
        date: 'Jan 14, 2025',
        text: '[Content hidden — contains hate speech and discriminatory language violating Community Guidelines §3.1-3.2]',
        hasImage: false
      }
    },
    'RPT-0043': {
      id: 'RPT-0043',
      type: 'Product',
      entity: 'Counterfeit tent listing',
      reporter: 'GearChecker',
      reporterEmail: 'gearchecker@email.com',
      reporterJoined: 'Aug 2023',
      date: 'Jan 14, 2025',
      status: 'In Review',
      description: 'The product listed as "MSR Hubba Hubba NX 2-Person Tent" is a counterfeit item. The reporter is a verified outdoor gear expert who identified several discrepancies: incorrect stitching patterns, wrong zipper brand, mismatched color codes. The seller has 3 other similar listings that may also be counterfeit.',
      evidence: ['Product comparison photos', 'MSR brand verification email', 'Seller listing history'],
      contentPreview: {
        user: 'BudgetGear2024',
        date: 'Jan 11, 2025',
        text: 'MSR Hubba Hubba NX 2-Person Tent — Like new condition, used only twice! Retail $499, selling for $129. Includes footprint and rain fly. Fast shipping guaranteed.',
        hasImage: true
      }
    },
    'RPT-0042': {
      id: 'RPT-0042',
      type: 'Post',
      entity: 'Misleading campground photos',
      reporter: 'NatureLover88',
      reporterEmail: 'naturelover88@email.com',
      reporterJoined: 'Jan 2024',
      date: 'Jan 13, 2025',
      status: 'Pending',
      description: 'The campground listing uses heavily edited photos that don\'t represent actual conditions. Upon visiting, the reporter found overgrown sites, broken facilities, and no running water — none of which was disclosed in the listing. The host has received 4 similar complaints in the past 2 months.',
      evidence: ['Listing photos vs actual photos', 'Guest review screenshots', 'Prior complaint records'],
      contentPreview: {
        user: 'SunnySiteHost',
        date: 'Jan 8, 2025',
        text: 'Beautiful riverside campsite with modern amenities! Clean restrooms, hot showers, fire pits, and stunning views. Perfect for families. Just 10 minutes from town.',
        hasImage: true
      }
    },
    'RPT-0041': {
      id: 'RPT-0041',
      type: 'Post',
      entity: 'Spam promotion post',
      reporter: 'CampMod3',
      reporterEmail: 'campmod3@internal.com',
      reporterJoined: 'Staff',
      date: 'Jan 12, 2025',
      status: 'Resolved',
      description: 'Automated spam post promoting an unrelated commercial product (weight loss supplements) in the camping community forums. Post contained affiliate links and was cross-posted in 12 different threads. User account was flagged by automated systems and confirmed by moderator.',
      evidence: ['Spam post screenshot', 'Cross-posting log', 'Affiliate link analysis'],
      contentPreview: {
        user: 'HealthyLiving2024',
        date: 'Jan 12, 2025',
        text: '🔥 AMAZING DEAL! Lose 30 lbs while camping! Click here for our revolutionary supplements... [SPAM CONTENT REMOVED]',
        hasImage: false
      }
    },
    'RPT-0040': {
      id: 'RPT-0040',
      type: 'Post',
      entity: 'Dangerous campfire advice',
      reporter: 'SafetyFirst101',
      reporterEmail: 'safetyfirst@email.com',
      reporterJoined: 'May 2023',
      date: 'Jan 12, 2025',
      status: 'Pending',
      description: 'Post provides dangerous and incorrect advice about starting campfires using gasoline and other accelerants. The instructions could lead to serious injury or wildfires. Several comments have already expressed concern. This content should be removed for safety reasons and the user should be warned about posting dangerous advice.',
      evidence: ['Post screenshot', 'Fire safety expert opinion', 'Comment thread warnings'],
      contentPreview: {
        user: 'PyroHiker',
        date: 'Jan 11, 2025',
        text: 'Pro tip: Pour a cup of gasoline on your wood pile for instant campfire! Works every time, even with wet wood. Another trick is using...',
        hasImage: false
      }
    },
    'RPT-U001': {
      id: 'RPT-U001',
      type: 'User',
      entity: 'DarkTrail',
      reporter: 'MountainMike',
      reporterEmail: 'mountainmike@email.com',
      reporterJoined: 'Feb 2023',
      date: 'Jan 15, 2025',
      status: 'Escalated',
      description: 'User DarkTrail has been reported by 3 separate users in the past week for aggressive behavior, threatening messages, and intentionally leaving false negative reviews on competitor campsite listings. The user has previously received 2 warnings. Account has been active since Oct 2024 and has accumulated 5 total violations.',
      evidence: ['Threatening message screenshots (3)', 'False review comparison', 'Previous warning history'],
      contentPreview: {
        user: 'DarkTrail',
        date: 'Active since Oct 2024',
        text: 'Account overview: 47 posts, 23 reviews (8 flagged), 3 active reports, 2 prior warnings. Trust score: 12/100. Last active: 2 hours ago.',
        hasImage: false
      }
    },
    'RPT-U002': {
      id: 'RPT-U002',
      type: 'User',
      entity: 'ScamSeller42',
      reporter: 'TrustyCamper',
      reporterEmail: 'trusty@email.com',
      reporterJoined: 'Apr 2023',
      date: 'Jan 14, 2025',
      status: 'Pending',
      description: 'User appears to be operating a scam selling operation. Multiple products listed at unusually low prices with stock photos. Two buyers have reported not receiving products after payment. Account was created 2 weeks ago with no verification.',
      evidence: ['Product listing screenshots', 'Payment receipts', 'Buyer complaint messages'],
      contentPreview: {
        user: 'ScamSeller42',
        date: 'Active since Jan 2025',
        text: 'Account overview: 15 product listings, 0 reviews, 2 complaints, 0 verifications. Trust score: 5/100. Account age: 14 days.',
        hasImage: false
      }
    },
    'RPT-U003': {
      id: 'RPT-U003',
      type: 'User',
      entity: 'FakeReviewer77',
      reporter: 'HostHelper',
      reporterEmail: 'hosthelper@email.com',
      reporterJoined: 'Jul 2022',
      date: 'Jan 13, 2025',
      status: 'In Review',
      description: 'User is suspected of posting fake positive reviews in exchange for payment. Pattern analysis shows 30+ reviews posted in 48 hours, all 5-star, with similar language and structure. Multiple hosts have been identified as potentially paying for these reviews.',
      evidence: ['Review pattern analysis', 'Language similarity report', 'Timing correlation data'],
      contentPreview: {
        user: 'FakeReviewer77',
        date: 'Active since Dec 2024',
        text: 'Account overview: 2 posts, 34 reviews (30 flagged for similarity), 1 active report, 0 prior warnings. Trust score: 8/100.',
        hasImage: false
      }
    },
    'RPT-U004': {
      id: 'RPT-U004',
      type: 'User',
      entity: 'AggressiveAndy',
      reporter: 'PeacefulPat',
      reporterEmail: 'peaceful@email.com',
      reporterJoined: 'Sep 2023',
      date: 'Jan 12, 2025',
      status: 'Pending',
      description: 'User has sent aggressive and threatening private messages to another user following a campsite booking disagreement. Messages include threats of physical violence and doxxing. Reporter has provided full message thread as evidence.',
      evidence: ['Message thread screenshots', 'Threat analysis report'],
      contentPreview: {
        user: 'AggressiveAndy',
        date: 'Active since Jun 2024',
        text: 'Account overview: 28 posts, 11 reviews, 1 active report, 1 prior warning (verbal abuse). Trust score: 25/100.',
        hasImage: false
      }
    },
    'RPT-U005': {
      id: 'RPT-U005',
      type: 'User',
      entity: 'SpamBot2024',
      reporter: 'System',
      reporterEmail: 'system@campconnect.com',
      reporterJoined: 'System',
      date: 'Jan 11, 2025',
      status: 'Resolved',
      description: 'Automated detection flagged this account as a bot. Account created 200+ posts in 1 hour, all containing affiliate links. IP analysis shows connection from known bot farm. Account has been permanently banned.',
      evidence: ['Automated detection log', 'IP analysis report', 'Post frequency chart'],
      contentPreview: {
        user: 'SpamBot2024',
        date: 'Created Jan 11, 2025',
        text: 'Account overview: 247 posts (all spam), 0 reviews, auto-detected, permanently banned. Trust score: 0/100.',
        hasImage: false
      }
    }
  };

  const disputeData = {
    'ORD-7823': {
      orderId: 'ORD-7823',
      buyer: 'SarahHiker',
      seller: 'GearDepot',
      amount: '$189.00',
      status: 'Escalated',
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
    'ORD-7801': {
      orderId: 'ORD-7801',
      buyer: 'WeekendWarrior',
      seller: 'PineGroveRetreat',
      amount: '$75.00',
      status: 'Pending',
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
    'ORD-7756': {
      orderId: 'ORD-7756',
      buyer: 'CampChef88',
      seller: 'OutdoorKitchenPro',
      amount: '$64.50',
      status: 'In Review',
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
  };


  // ---- Tab Navigation ----
  const tabTitles = {
    'dashboard': 'Dashboard',
    'reported-posts': 'Reported Posts',
    'reported-users': 'Reported Users',
    'disputes': 'Disputes',
    'verification': 'Verification Requests',
    'suspended': 'Suspended Accounts'
  };

  function switchTab(tabId) {
    // Update nav
    document.querySelectorAll('.cc-admin__nav-item').forEach(item => {
      item.classList.toggle('cc-admin__nav-item--active', item.dataset.tab === tabId);
    });

    // Update tab views
    document.querySelectorAll('.cc-admin__tab-view').forEach(view => {
      view.classList.remove('cc-admin__tab-view--active');
    });
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('cc-admin__tab-view--active');

    // Update topbar
    document.getElementById('ccTopbarTitle').textContent = tabTitles[tabId] || 'Dashboard';
  }


  // ---- Report Detail Panel ----
  function openReportDetail(reportId) {
    const data = reportData[reportId];
    if (!data) return;

    const overlay = document.getElementById('detailOverlay');
    const body = document.getElementById('detailBody');
    const actions = document.getElementById('detailActions');
    const title = document.getElementById('detailTitle');

    title.textContent = 'Report ' + data.id;

    body.innerHTML = `
      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Report Information</div>
        <div class="cc-admin__detail-grid">
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Report ID</span>
            <span class="cc-admin__detail-value" style="font-family: 'SF Mono', monospace;">${data.id}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Type</span>
            <span class="cc-admin__detail-value">${data.type}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Date Filed</span>
            <span class="cc-admin__detail-value">${data.date}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Status</span>
            <span class="cc-admin__badge cc-admin__badge--${data.status.toLowerCase().replace(' ', '')}">${data.status}</span>
          </div>
        </div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Full Description</div>
        <div class="cc-admin__detail-description">${data.description}</div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Evidence</div>
        <div class="cc-admin__evidence-grid">
          ${data.evidence.map(e => `<div class="cc-admin__evidence-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${e}</div>`).join('')}
        </div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Reported Content Preview</div>
        <div class="cc-admin__content-preview">
          <div class="cc-admin__content-preview-header">
            <div class="cc-admin__content-preview-avatar"></div>
            <div>
              <div class="cc-admin__content-preview-user">${data.contentPreview.user}</div>
              <div class="cc-admin__content-preview-date">${data.contentPreview.date}</div>
            </div>
          </div>
          <div class="cc-admin__content-preview-body">${data.contentPreview.text}</div>
          ${data.contentPreview.hasImage ? '<div class="cc-admin__content-preview-image">📷 Image Attachment</div>' : ''}
        </div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Reporter Details</div>
        <div class="cc-admin__detail-grid">
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Username</span>
            <span class="cc-admin__detail-value">${data.reporter}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Email</span>
            <span class="cc-admin__detail-value">${data.reporterEmail}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Member Since</span>
            <span class="cc-admin__detail-value">${data.reporterJoined}</span>
          </div>
        </div>
      </section>
    `;

    if (data.status === 'Resolved') {
      actions.innerHTML = `
        <button class="cc-admin__btn cc-admin__btn--secondary" onclick="closeDetail()">Close</button>
      `;
    } else {
      actions.innerHTML = `
        <button class="cc-admin__btn cc-admin__btn--secondary" onclick="handleAction('${data.id}', 'dismiss')">Dismiss</button>
        <button class="cc-admin__btn cc-admin__btn--warning" onclick="handleAction('${data.id}', 'remove')">Remove Content</button>
        <button class="cc-admin__btn cc-admin__btn--danger" onclick="handleAction('${data.id}', 'suspend')">Suspend User</button>
        <button class="cc-admin__btn cc-admin__btn--danger" onclick="handleAction('${data.id}', 'ban')" style="background:#7f1d1d;">Ban User</button>
        <button class="cc-admin__btn cc-admin__btn--success" onclick="handleAction('${data.id}', 'resolve')">Mark Resolved</button>
      `;
    }

    overlay.classList.add('cc-admin__detail-overlay--open');
    document.body.style.overflow = 'hidden';
  }

  function openDisputeDetail(orderId) {
    const data = disputeData[orderId];
    if (!data) return;

    const overlay = document.getElementById('detailOverlay');
    const body = document.getElementById('detailBody');
    const actions = document.getElementById('detailActions');
    const title = document.getElementById('detailTitle');

    title.textContent = 'Dispute — ' + data.orderId;

    body.innerHTML = `
      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Dispute Overview</div>
        <div class="cc-admin__detail-grid">
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Order ID</span>
            <span class="cc-admin__detail-value" style="font-family: 'SF Mono', monospace;">${data.orderId}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Amount</span>
            <span class="cc-admin__detail-value">${data.amount}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Buyer</span>
            <span class="cc-admin__detail-value">${data.buyer}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Seller / Host</span>
            <span class="cc-admin__detail-value">${data.seller}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Status</span>
            <span class="cc-admin__badge cc-admin__badge--${data.status === 'Escalated' ? 'escalated' : data.status === 'In Review' ? 'review' : 'pending'}">${data.status}</span>
          </div>
          <div class="cc-admin__detail-field">
            <span class="cc-admin__detail-label">Reason</span>
            <span class="cc-admin__detail-value">${data.reason}</span>
          </div>
        </div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Description</div>
        <div class="cc-admin__detail-description">${data.description}</div>
      </section>

      <section class="cc-admin__detail-section">
        <div class="cc-admin__detail-section-title">Timeline</div>
        <div style="padding-left: 16px; border-left: 2px solid var(--cc-gray-200);">
          ${data.timeline.map(t => `
            <div style="position: relative; padding: 0 0 16px 16px;">
              <div style="position: absolute; left: -21px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--cc-gray-300); border: 2px solid var(--cc-white);"></div>
              <div style="font-size: 11px; color: var(--cc-gray-400); font-weight: 500;">${t.date}</div>
              <div style="font-size: 13px; color: var(--cc-gray-700);">${t.event}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    actions.innerHTML = `
      <button class="cc-admin__btn cc-admin__btn--secondary" onclick="handleDispute('${data.orderId}', 'dismiss')">Dismiss Dispute</button>
      <button class="cc-admin__btn cc-admin__btn--warning" onclick="handleDispute('${data.orderId}', 'partial')">Partial Refund</button>
      <button class="cc-admin__btn cc-admin__btn--success" onclick="handleDispute('${data.orderId}', 'refund')">Full Refund to Buyer</button>
      <button class="cc-admin__btn cc-admin__btn--primary" onclick="handleDispute('${data.orderId}', 'resolve')">Mark Resolved</button>
    `;

    overlay.classList.add('cc-admin__detail-overlay--open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('cc-admin__detail-overlay--open');
    document.body.style.overflow = '';
  }

  function closeDetailIfOverlay(e) {
    if (e.target === e.currentTarget) closeDetail();
  }


  // ---- Actions ----
  function handleAction(reportId, action) {
    const messages = {
      'dismiss': `Report ${reportId} dismissed`,
      'remove': `Content from ${reportId} has been removed`,
      'suspend': `User associated with ${reportId} has been suspended`,
      'ban': `User associated with ${reportId} has been permanently banned`,
      'resolve': `Report ${reportId} marked as resolved`
    };
    const types = {
      'dismiss': 'info',
      'remove': 'danger',
      'suspend': 'danger',
      'ban': 'danger',
      'resolve': 'success'
    };

    showToast(messages[action], types[action]);
    closeDetail();
  }

  function handleDispute(orderId, action) {
    const messages = {
      'dismiss': `Dispute for ${orderId} dismissed`,
      'partial': `Partial refund issued for ${orderId}`,
      'refund': `Full refund issued to buyer for ${orderId}`,
      'resolve': `Dispute ${orderId} marked as resolved`
    };
    const types = {
      'dismiss': 'info',
      'partial': 'success',
      'refund': 'success',
      'resolve': 'success'
    };

    showToast(messages[action], types[action]);
    closeDetail();
  }

  function handleVerification(itemId, action) {
    const el = document.getElementById(itemId);
    if (!el) return;

    const name = el.querySelector('.cc-admin__verif-name').textContent;

    if (action === 'approved') {
      el.style.opacity = '0.5';
      el.querySelector('.cc-admin__verif-actions').innerHTML = '<span class="cc-admin__badge cc-admin__badge--resolved">Approved</span>';
      showToast(`${name} has been verified and approved`, 'success');
    } else {
      el.style.opacity = '0.5';
      el.querySelector('.cc-admin__verif-actions').innerHTML = '<span class="cc-admin__badge cc-admin__badge--escalated">Rejected</span>';
      showToast(`${name} verification request rejected`, 'danger');
    }
  }

  function filterTable(btn, status) {
    // Update active filter
    btn.parentElement.querySelectorAll('.cc-admin__filter-btn').forEach(b => b.classList.remove('cc-admin__filter-btn--active'));
    btn.classList.add('cc-admin__filter-btn--active');

    // Filter rows
    const table = btn.closest('.cc-admin__panel').querySelector('.cc-admin__table tbody');
    if (!table) return;

    table.querySelectorAll('tr').forEach(row => {
      if (status === 'all') {
        row.style.display = '';
      } else {
        const rowStatus = row.dataset.status || '';
        row.style.display = (rowStatus === status || (status === 'pending' && rowStatus === 'escalated')) ? '' : 'none';
      }
    });
  }


  // ---- Toast Notifications ----
  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `cc-admin__toast cc-admin__toast--${type || 'info'}`;

    const icons = {
      success: '✓',
      danger: '✕',
      info: 'ℹ'
    };

    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---- Keyboard shortcut ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });
