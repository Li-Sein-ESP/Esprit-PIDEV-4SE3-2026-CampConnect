import { Component, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  LucideAngularModule, Calendar, Users, MapPin, Clock, DollarSign, ChevronLeft,
  ArrowRight, Star, CheckCircle, Shield, Mountain, Award, Share2, Heart,
  ChevronRight, Play, Tent, Info, Backpack, HelpCircle, AlertTriangle, BadgeCheck, Ban,
  MessageSquare, Globe, Leaf, X, Send, CreditCard, ShieldCheck, Ticket, Download, Sparkles
} from 'lucide-angular';
import { EventService } from '../services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './event-details.component.html',
  styles: [`
    app-event-details {
      display: block;
      background-color: #F1EDE1;
    }
    @media print {
      @page {
        size: auto;
        margin: 0mm;
      }
      /* Masquer TOUT sauf le container du ticket */
      body * {
        visibility: hidden !important;
      }
      .print-container, .print-container * {
        visibility: visible !important;
      }
      .print-container {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        background: white !important;
        visibility: visible !important;
        z-index: 999999 !important;
      }
      .print-ticket {
        position: relative !important;
        margin: 2cm auto !important;
        padding: 0 !important;
        width: 15cm !important;
        display: block !important;
        border: 1px solid #eee !important;
        box-shadow: none !important;
        visibility: visible !important;
      }
      /* Cacher les éléments interactifs du ticket */
      .print-ticket button, .p-6.bg-gray-50, .fixed.bottom-6, nav, header, footer {
        display: none !important;
        visibility: hidden !important;
      }
    }
  `]
})
export class EventDetailsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly ChevronLeft = ChevronLeft;
  readonly ArrowRight = ArrowRight;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly Mountain = Mountain;
  readonly Award = Award;
  readonly Share2 = Share2;
  readonly Heart = Heart;
  readonly ChevronRight = ChevronRight;
  readonly Play = Play;
  readonly Tent = Tent;
  readonly Info = Info;
  readonly Backpack = Backpack;
  readonly HelpCircle = HelpCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly BadgeCheck = BadgeCheck;
  readonly MessageSquare = MessageSquare;
  readonly Ban = Ban;
  readonly Globe = Globe;
  readonly Leaf = Leaf;
  readonly X = X;
  readonly Send = Send;
  readonly CreditCard = CreditCard;
  readonly ShieldCheck = ShieldCheck;
  readonly Ticket = Ticket;
  readonly Download = Download;
  readonly Sparkles = Sparkles;

  event = signal<Event | null>(null);
  isRegistered = signal<boolean>(false);
  isFavorited = signal<boolean>(false);
  userEmail = signal<string>('user@campconnect.tn');
  toast = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  showChatWindow = signal(false);
  chatMessages = signal<{text: string, sender: 'user' | 'host', time: string}[]>([]);
  newMessage = signal('');
  isGeneratingPackingList = signal<boolean>(false);
  aiPackingList = signal<{ items: string[], tips: string[] } | null>(null);
  
  isAnalyzingOdd = signal<boolean>(false);
  aiOddResult = signal<{ sdgs: string[], sustainability_score: number } | null>(null);

  highlights = [
    'Expert-led instruction',
    'All equipment provided',
    'Certificate of completion',
    'Small group setting',
    'Meals & refreshments included',
    'Post-event community access'
  ];

  itinerary = [
    { time: '08:00', activity: 'Meet & Greet', desc: 'Welcome coffee and group introduction at base camp.' },
    { time: '10:00', activity: 'Morning Session', desc: 'Starting the adventure with safety briefing and first drills.' },
    { time: '13:00', activity: 'Outdoor Lunch', desc: 'Local organic meal provided by our partners.' },
    { time: '15:00', activity: 'Expert Workshop', desc: 'Deep dive into advanced techniques with our lead guide.' },
    { time: '18:00', activity: 'Debrief & Wrap-up', desc: 'Sharing experiences and certificate ceremony.' }
  ];

  inclusions = [
    { icon: Mountain, label: 'Expert Guide' },
    { icon: Backpack, label: 'Pro Gear' },
    { icon: Tent, label: 'Premium Stay' },
    { icon: Award, label: 'Certification' },
    { icon: Shield, label: 'Insurance' },
    { icon: Heart, label: 'Support 24/7' }
  ];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    const id = this.route.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe(evt => {
        if (evt) {
          this.event.set(evt);
          // Initial welcome message
          this.chatMessages.set([{
            text: `Hello! I'm the organizer of ${evt.title}. Do you have any questions about the trip? 🏕️`,
            sender: 'host' as const,
            time: 'Just now'
          }]);
        }
      });
    }

    // Récupérer le vrai email de l'utilisateur
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.email) {
        this.userEmail.set(user.email);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  isSameTime(start: string, end: string): boolean {
    if (!start || !end) return true;
    return this.formatTime(start) === this.formatTime(end);
  }

  getCapacityColor(): string {
    const percent = this.getCapacityPercent();
    if (percent >= 100) return '#9D4A4A'; // Red
    if (percent >= 80) return '#C77D48';  // Orange
    return '#2d6a4f';                     // Green
  }

  getCapacityPercent(): number {
    const evt = this.event();
    if (!evt) return 0;
    return Math.round((evt.registered / evt.capacity) * 100);
  }

  getSpotsLeft(): number {
    const evt = this.event();
    if (!evt) return 0;
    return Math.max(0, evt.capacity - evt.registered);
  }

  getCapacitySegments(): number[] {
    // Returns an array of 10 segments representing the capacity status
    const percent = this.getCapacityPercent();
    const activeSegments = Math.ceil(percent / 10);
    return Array(10).fill(0).map((_, i) => i < activeSegments ? 1 : 0);
  }

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'workshop': '🔥',
      'expedition': '🏔️',
      'meetup': '🤝',
      'training': '🎯',
      'festival': '🎪'
    };
    return emojis[type] || '🌿';
  }

  // Payment & Ticketing
  showCheckout = signal(false);
  isPaying = signal(false);
  showTicket = signal(false);
  ticketId = signal('');

  register() {
    this.showCheckout.set(true);
  }

  confirmPayment() {
    this.isPaying.set(true);
    const evt = this.event();
    if (!evt) return;

    // Récupérer le userId réel via l'authService
    this.authService.getCurrentUser().subscribe(user => {
      const userId = user?.id || 'guest-user-123';
      const email = this.userEmail();

      this.eventService.registerForEvent(evt.id, 1, userId).subscribe({
        next: (response) => {
          this.isPaying.set(false);
          this.showCheckout.set(false);
          this.isRegistered.set(true);
          this.showTicket.set(true);
          this.ticketId.set('CC-' + Math.random().toString(36).substr(2, 9).toUpperCase());
          
          this.event.set({ ...evt, registered: evt.registered + 1 });
          this.showToast(`✨ Confirmation sent to ${email}! Ticket ready.`, 'success');
        },
        error: (err) => {
          this.isPaying.set(false);
          // Même en cas d'erreur (ex: backend non lancé), on simule la réussite pour la démo
          this.showCheckout.set(false);
          this.isRegistered.set(true);
          this.showTicket.set(true);
          this.ticketId.set('CC-OFFLINE-' + Math.random().toString(36).substr(2, 5).toUpperCase());
          this.showToast(`✨ Confirmation simulated for ${email}`, 'success');
          console.error('Registration API error:', err);
        }
      });
    });
  }

  downloadTicket() {
    window.print();
    this.showToast('Generating PDF Ticket...', 'success');
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  toggleFavorite() {
    this.isFavorited.set(!this.isFavorited());
  }

  joinWaitlist() {
    // Placeholder waitlist logic
    alert('Joining waitlist for ' + this.event()?.title);
  }

  shareEvent() {
    if (navigator.share) {
      navigator.share({
        title: this.event()?.title,
        text: this.event()?.description,
        url: window.location.href
      });
    } else {
      alert('Sharing: ' + window.location.href);
    }
  }

  saveEvent() {
    this.isFavorited.set(!this.isFavorited());
  }

  generateAiPackingList() {
    const evt = this.event();
    if (!evt) return;

    const month = new Date(evt.startDate).getMonth();
    let season = 'summer';
    if (this.aiPackingList()) return;
    this.isGeneratingPackingList.set(true);
    
    this.eventService.getPackingList(
      evt.type,
      evt.difficulty,
      'summer'
    ).subscribe({
      next: (res) => {
        this.aiPackingList.set(res);
        this.isGeneratingPackingList.set(false);
        this.showToast('✨ Smart packing list generated!', 'success');
      },
      error: () => {
        // Fallback demo data
        this.aiPackingList.set({
          items: ['Professional Backpack', 'Waterproof Boots', 'Portable Power Bank', 'First Aid Kit'],
          tips: ['AI Advice: Pack light but don\'t forget a warm layer for the evening!']
        });
        this.isGeneratingPackingList.set(false);
        this.showToast('✨ AI Assistant: Here is your suggested list.', 'success');
      }
    });
  }

  analyzeOdd() {
    const evt = this.event();
    if (!evt) return;

    this.isAnalyzingOdd.set(true);
    this.eventService.predictAiOdd(evt.title, evt.description).subscribe({
      next: (res) => {
        this.aiOddResult.set(res);
        this.isAnalyzingOdd.set(false);
        this.showToast('AI: Analyse ODD terminée !', 'success');
        
        // Update local event for UI
        this.event.update(e => {
            if(!e) return e;
            return {
                ...e,
                sdgs: res.sdgs,
                sustainabilityScore: res.sustainability_score
            };
        });
      },
      error: (err) => {
        this.isAnalyzingOdd.set(false);
        this.showToast('Erreur du service IA ODD', 'error');
      }
    });
  }

  contactHost(): void {
    this.showChatWindow.set(true);
  }

  sendMessage(): void {
    const text = this.newMessage();
    if (!text.trim()) return;

    // Add user message
    this.chatMessages.update(msgs => [...msgs, {
      text,
      sender: 'user' as const,
      time: 'Just now'
    }]);
    this.newMessage.set('');

    // AI/Host logic based on keywords
    let replyText = "Thanks for your message! I'm checking that for you right now. 🏕️";
    const lowerText = text.toLowerCase();

    if (lowerText.includes('water') || lowerText.includes('eau') || lowerText.includes('drink')) {
      replyText = "Yes, there is a fresh water spring near the base camp, so you can refill your bottles! 💧";
    } else if (lowerText.includes('tent') || lowerText.includes('sleeping') || lowerText.includes('abri')) {
      replyText = "We provide shared group tents, but you're more than welcome to bring your own for extra privacy. ⛺";
    } else if (lowerText.includes('gear') || lowerText.includes('equipment') || lowerText.includes('boots') || lowerText.includes('pack')) {
      replyText = "Great question! Please check the 'AI Packing List' on this page, it's tailored specifically for this trip. 🎒";
    } else if (lowerText.includes('weather') || lowerText.includes('rain') || lowerText.includes('météo')) {
      replyText = "The event is rain or shine! We have large waterproof shelters at the site just in case. 🌦️";
    } else if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('manger')) {
      replyText = "We provide dinner and breakfast. Just let us know if you have any allergies! 🍳";
    } else if (lowerText.includes('safe') || lowerText.includes('safety') || lowerText.includes('danger') || lowerText.includes('sécurité')) {
      replyText = "Safety is our absolute priority! We have certified guides and emergency kits available at all times. 🛡️";
    } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pay') || lowerText.includes('prix')) {
      replyText = "The total investment is shown in the ticket section. There are no hidden fees! 💳";
    } else if (lowerText.includes('difficult') || lowerText.includes('hard') || lowerText.includes('level') || lowerText.includes('difficile')) {
      replyText = "You can check the difficulty level in the main details. Our guides adjust the pace to the group. 🏔️";
    } else if (lowerText.includes('time') || lowerText.includes('schedule') || lowerText.includes('start') || lowerText.includes('heure')) {
      replyText = "Please refer to the start and end dates shown above. We recommend arriving 15 minutes early! 🕒";
    }

    // Simulate host reply
    setTimeout(() => {
      this.chatMessages.update(msgs => [...msgs, {
        text: replyText,
        sender: 'host' as const,
        time: 'Just now'
      }]);
    }, 1500);
  }

  navigateBack() {
    window.history.back();
  }
}
