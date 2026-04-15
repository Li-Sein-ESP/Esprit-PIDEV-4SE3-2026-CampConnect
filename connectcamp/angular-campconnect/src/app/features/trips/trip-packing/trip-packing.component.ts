import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Package, CheckCircle, Circle } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { PackingList } from '../models/trip.model';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-trip-packing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, BadgeComponent],
  templateUrl: './trip-packing.component.html'
})
export class TripPackingComponent implements OnInit {
  readonly Package = Package;
  readonly CheckCircle = CheckCircle;
  readonly Circle = Circle;

  packingList = signal<PackingList | null>(null);

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService
  ) { }

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id') || 'trip-1';
    this.packingList.set(this.tripService.getMockPackingList(tripId));
  }

  togglePacked(itemId: string) {
    const list = this.packingList();
    if (!list) return;

    const updated = {
      ...list,
      categories: list.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        )
      }))
    };
    this.packingList.set(updated);
  }

  packedCount(): number {
    const list = this.packingList();
    if (!list) return 0;
    return list.categories.reduce((sum, cat) =>
      sum + cat.items.filter(item => item.packed).length, 0
    );
  }

  totalCount(): number {
    const list = this.packingList();
    if (!list) return 0;
    return list.categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }
}
