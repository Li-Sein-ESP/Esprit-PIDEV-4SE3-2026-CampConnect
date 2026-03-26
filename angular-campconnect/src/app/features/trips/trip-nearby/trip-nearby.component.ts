import { Component, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Heart, MapPin, Clock, Navigation, ExternalLink, Check, Plus, Map as MapIcon } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { PoiService } from '../services/poi.service';

export interface Place {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel?: string;
  description: string;
  distance: string;
  driveTime: string;
  hours: string;
  location: string;
  image: string;
  category: string;
  isFavorite: boolean;
  isAddedToTrip: boolean;
}

export interface Category {
  id: string;
  label: string;
  count: number;
}

@Component({
  selector: 'app-trip-nearby-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './trip-nearby.component.html',
  styles: [`
    :host { display: block; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TripNearbyComponent implements OnInit {
  // Lucide Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Heart = Heart;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Navigation = Navigation;
  readonly ExternalLink = ExternalLink;
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Map = MapIcon;

  activeCategory = signal<string>('all');


  places = signal<Place[]>([]);

  categories = signal<Category[]>([
    { id: 'all', label: 'All Places', count: 0 },
    { id: 'added', label: 'Added to Trip', count: 0 }
  ]);

  stats = computed(() => {
    const list = this.places();
    return {
      total: list.length,
      added: list.filter(p => p.isAddedToTrip).length,
      restaurants: list.filter(p => p.category.toLowerCase() === 'restaurant').length,
      viewpoints: list.filter(p => p.category.toLowerCase() === 'viewpoint').length,
    };
  });

  filteredPlaces = computed(() => {
    const list = this.places();
    const active = this.activeCategory();

    if (active === 'all') return list;
    if (active === 'added') return list.filter(p => p.isAddedToTrip);
    return list.filter(p => p.category.toLowerCase() === active);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private poiService: PoiService
  ) {
    // Synchronize global count when 'added' count changes
    effect(() => {
      const tripId = this.route.snapshot.paramMap.get('tripId');
      if (tripId) {
        this.tripService.updateNearbyPlacesCount(tripId, this.stats().added);
      }
    });
  }

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces() {
    this.poiService.getAll().subscribe(places => {
      const mappedPlaces = places.map(p => ({
        id: Number(p.id) || Math.floor(Math.random() * 1000),
        name: p.name,
        rating: p.rating,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        description: p.description,
        distance: p.distance || '2.3 km away',
        driveTime: p.driveTime || '5 min drive',
        hours: p.hours,
        location: p.location.name,
        image: p.image,
        category: p.category,
        isFavorite: false,
        isAddedToTrip: false
      }));
      this.places.set(mappedPlaces);
      this.updateCategories(mappedPlaces);
    });
  }

  updateCategories(places: Place[]) {
    const categoriesMap = new Map<string, number>();
    places.forEach(p => {
      const cat = p.category.toLowerCase();
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    const newCategories: Category[] = [
      { id: 'all', label: 'All Places', count: places.length },
      { id: 'added', label: 'Added to Trip', count: places.filter(p => p.isAddedToTrip).length }
    ];

    categoriesMap.forEach((count: number, id: string) => {
      newCategories.push({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1) + 's',
        count
      });
    });

    this.categories.set(newCategories);
  }

  toggleFavorite(id: number): void {
    this.places.update(prev =>
      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  }

  toggleAddedToTrip(id: number): void {
    this.places.update(prev =>
      prev.map(p => p.id === id ? { ...p, isAddedToTrip: !p.isAddedToTrip } : p)
    );
  }

  setActiveCategory(id: string): void {
    this.activeCategory.set(id);
  }

  navigateBack(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId') || '1';
    this.router.navigate(['/trips', tripId]);
  }
}
