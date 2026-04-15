import { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, ArrowRight, Star, 
  Mountain, BookOpen, Shield, Award, TrendingUp, 
  Filter, Search, Heart, Share2, ChevronLeft, ChevronRight,
  Flame, Compass, Tent, Sun
} from 'lucide-react';

// Types
interface Event {
  id: string;
  title: string;
  type: 'workshop' | 'expedition' | 'retreat' | 'certification' | 'hike' | 'camp';
  difficulty: 'beginner' | 'moderate' | 'advanced' | 'expert';
  date: string;
  time: string;
  location: string;
  price: number;
  maxParticipants: number;
  registered: number;
  image: string;
  instructor: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  tags: string[];
}

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

// Données
const events: Event[] = [
  {
    id: '1',
    title: 'Wilderness Survival Masterclass',
    type: 'workshop',
    difficulty: 'moderate',
    date: 'Tue, Mar 3, 2026',
    time: '03:51 PM',
    location: 'Joshua Tree National Park, CA',
    price: 80,
    maxParticipants: 8,
    registered: 0,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    instructor: 'Sarah Mitchell',
    rating: 4.9,
    reviews: 127,
    featured: true,
    tags: ['Survival', 'Bushcraft', 'Weekend']
  },
  {
    id: '2',
    title: 'Sunset Photography Trek',
    type: 'hike',
    difficulty: 'beginner',
    date: 'Thu, Mar 19, 2026',
    time: '04:09 PM',
    location: 'Joshua Tree National Park, CA',
    price: 50,
    maxParticipants: 12,
    registered: 5,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    instructor: 'Mike Chen',
    rating: 4.8,
    reviews: 89,
    featured: true,
    tags: ['Photography', 'Nature', 'Sunset']
  },
  {
    id: '3',
    title: 'Alpine Expedition: Summit Challenge',
    type: 'expedition',
    difficulty: 'advanced',
    date: 'Wed, Mar 18, 2026',
    time: '04:19 PM',
    location: 'Sierra Nevada, CA',
    price: 350,
    maxParticipants: 6,
    registered: 2,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    instructor: 'Alex Rivera',
    rating: 5.0,
    reviews: 45,
    featured: false,
    tags: ['Mountaineering', '3 Days', 'Challenge']
  },
  {
    id: '4',
    title: 'Mindfulness in Nature Retreat',
    type: 'retreat',
    difficulty: 'beginner',
    date: 'Fri, Apr 10, 2026',
    time: '09:00 AM',
    location: 'Yosemite Valley, CA',
    price: 299,
    maxParticipants: 15,
    registered: 8,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    instructor: 'Emma Wilson',
    rating: 4.9,
    reviews: 156,
    featured: false,
    tags: ['Wellness', 'Meditation', 'Weekend']
  },
  {
    id: '5',
    title: 'Wilderness First Aid Certification',
    type: 'certification',
    difficulty: 'moderate',
    date: 'Sat, Apr 25, 2026',
    time: '08:00 AM',
    location: 'Lake Tahoe, CA',
    price: 199,
    maxParticipants: 20,
    registered: 12,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    instructor: 'Dr. James Park',
    rating: 4.9,
    reviews: 203,
    featured: false,
    tags: ['Certification', 'Medical', '2 Days']
  },
  {
    id: '6',
    title: 'Group Camping Adventure',
    type: 'camp',
    difficulty: 'beginner',
    date: 'Sat, May 2, 2026',
    time: '02:00 PM',
    location: 'Big Sur, CA',
    price: 120,
    maxParticipants: 25,
    registered: 18,
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80',
    instructor: 'Lisa Thompson',
    rating: 4.7,
    reviews: 78,
    featured: false,
    tags: ['Camping', 'Social', 'Beach']
  }
];

const benefits: Benefit[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Connect with Community',
    description: 'Meet like-minded outdoor enthusiasts and build lasting friendships around the campfire.',
    color: 'from-orange-400 to-amber-500'
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Learn from Experts',
    description: 'Gain skills from certified guides and experienced instructors with years of field experience.',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Explore Safely',
    description: 'Venture into new terrain with experienced guides and group support every step of the way.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Earn Certifications',
    description: 'Complete courses and earn recognized outdoor certifications to advance your skills.',
    color: 'from-purple-400 to-violet-500'
  }
];

const categories = [
  { id: 'all', label: 'All Events', icon: <Compass className="w-4 h-4" /> },
  { id: 'workshop', label: 'Workshops', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'expedition', label: 'Expeditions', icon: <Mountain className="w-4 h-4" /> },
  { id: 'hike', label: 'Guided Hikes', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'retreat', label: 'Retreats', icon: <Sun className="w-4 h-4" /> },
  { id: 'camp', label: 'Group Camps', icon: <Tent className="w-4 h-4" /> },
  { id: 'certification', label: 'Certifications', icon: <Award className="w-4 h-4" /> }
];

// Composants
const DifficultyBadge = ({ level }: { level: string }) => {
  const colors = {
    beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    advanced: 'bg-orange-100 text-orange-700 border-orange-200',
    expert: 'bg-red-100 text-red-700 border-red-200'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${colors[level as keyof typeof colors]}`}>
      {level}
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const colors = {
    workshop: 'bg-violet-100 text-violet-700',
    expedition: 'bg-red-100 text-red-700',
    retreat: 'bg-pink-100 text-pink-700',
    certification: 'bg-blue-100 text-blue-700',
    hike: 'bg-green-100 text-green-700',
    camp: 'bg-orange-100 text-orange-700'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  );
};

const EventCard = ({ event, featured = false }: { event: Event; featured?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const availabilityPercent = (event.registered / event.maxParticipants) * 100;
  const isAlmostFull = availabilityPercent >= 75;
  const isFull = event.registered >= event.maxParticipants;
  
  if (featured) {
    return (
      <div 
        className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Featured
            </span>
            <TypeBadge type={event.type} />
          </div>
          
          {/* Like Button */}
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          
          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{event.rating}</span>
            <span className="text-white/70">({event.reviews})</span>
          </div>
          
          {/* Price Tag */}
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-600 text-white rounded-full font-bold text-lg">
            ${event.price}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
              {event.title}
            </h3>
            <DifficultyBadge level={event.difficulty} />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
          
          {/* Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">{event.registered}/{event.maxParticipants} registered</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isAlmostFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
            {isAlmostFull && !isFull && (
              <p className="text-xs text-red-600 mt-1 font-medium">Almost full - Only {event.maxParticipants - event.registered} spots left!</p>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-700">{event.instructor.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <span className="text-sm text-gray-600">{event.instructor}</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-full text-sm font-semibold hover:bg-emerald-800 transition-all hover:gap-3">
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="absolute top-3 left-3">
          <TypeBadge type={event.type} />
        </div>
        
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-gray-900">
          ${event.price}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {event.title}
          </h3>
        </div>
        
        <div className="mb-3">
          <DifficultyBadge level={event.difficulty} />
        </div>
        
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{event.date} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.registered}/{event.maxParticipants}</span>
            {isAlmostFull && <span className="text-red-500 text-xs font-medium">Almost full!</span>}
          </div>
          <button className="flex items-center gap-1 text-emerald-700 font-semibold text-sm hover:gap-2 transition-all">
            Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const BenefitCard = ({ benefit, index }: { benefit: Benefit; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);
  
  return (
    <div 
      className={`group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {benefit.icon}
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
        {benefit.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {benefit.description}
      </p>
      
      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    </div>
  );
};

// Sections
const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <img 
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920&q=80"
          alt="Camping background"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-emerald-900/50 to-stone-100" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Join 10,000+ outdoor enthusiasts</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
          Events &<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
            Expeditions
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join our community for guided adventures, workshops, and expert-led wilderness sessions that transform beginners into explorers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold text-lg hover:bg-emerald-700 transition-all hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2">
            Browse All Events
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/30">
            Host an Event
          </button>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '150+', label: 'Events' },
            { value: '50+', label: 'Guides' },
            { value: '10k+', label: 'Members' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-24 px-4 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Join <span className="text-emerald-700">CampConnect</span> Events?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the benefits of exploring with our community of passionate outdoor enthusiasts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedEventsSection = () => {
  const featuredEvents = events.filter(e => e.featured);
  const [, setCurrentIndex] = useState(0);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };
  
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4" />
              Top Rated
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Featured Events
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Top picks hand-picked by our wilderness experts.
            </p>
          </div>
          
          <div className="flex gap-2 mt-6 md:mt-0">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} featured={true} />
          ))}
        </div>
      </div>
    </section>
  );
};

const AllEventsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredEvents = events.filter(event => {
    const matchesCategory = activeCategory === 'all' || event.type === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <section className="py-24 px-4 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Upcoming Events
            </h2>
            <p className="text-gray-600">
              {filteredEvents.length} events found
            </p>
          </div>
          
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-3 rounded-full border flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${
                activeCategory === cat.id 
                  ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>
        
        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
        
        {/* Load More */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors">
              Load More Events
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const HostSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-emerald-950 rounded-[3rem] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-6 border border-white/10">
              <Compass className="w-4 h-4" />
              <span>Share Your Passion</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Host Your Own<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Expedition
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Share your expertise with the community. Lead workshops, organize treks, or host wilderness certifications. Turn your passion into unforgettable experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold text-lg hover:bg-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2">
                Start Creating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/20">
                Learn More
              </button>
            </div>
            
            {/* Features */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: <Users className="w-6 h-6" />, label: 'Build Community' },
                { icon: <Award className="w-6 h-6" />, label: 'Earn Recognition' },
                { icon: <Share2 className="w-6 h-6" />, label: 'Share Skills' },
                { icon: <TrendingUp className="w-6 h-6" />, label: 'Grow Income' }
              ].map((feature, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                    {feature.icon}
                  </div>
                  <span className="text-white/80 text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-stone-950 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Tent className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CampConnect</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted platform for outdoor adventure planning and campsite discovery.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-400">Explore</h4>
            <ul className="space-y-3">
              {['Campsites', 'Academy', 'Events', 'Safety'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-400">Plan</h4>
            <ul className="space-y-3">
              {['Trip Planner', 'Transportation', 'Gear', 'Find Companions'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-emerald-400">Community</h4>
            <ul className="space-y-3">
              {['Forums', 'Trip Stories', 'Help Center', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 CampConnect. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App
function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <HeroSection />
      <BenefitsSection />
      <FeaturedEventsSection />
      <AllEventsSection />
      <HostSection />
      <Footer />
    </div>
  );
}

export default App;
