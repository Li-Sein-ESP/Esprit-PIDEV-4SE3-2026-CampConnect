<<<<<<< HEAD
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Tent, Search, MoreVertical, MapPin, Calendar, Users, Eye, Trash2 } from 'lucide-angular';
import { TripService } from '../../trips/services/trip.service';
import { Trip } from '../../trips/models/trip.model';

@Component({
    selector: 'app-admin-trips',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">User Trips Management</h1>
          <p class="text-sm text-slate-500 mt-1">Monitor and manage trips created by users across the platform.</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button (click)="openCreateModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
            <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
            Add Template Trip
          </button>
          <div class="relative w-full sm:w-64">
            <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
            <input type="text" placeholder="Search trips..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
          </div>
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
            Filter
=======
import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  LucideAngularModule,
  Tent,
  Search,
  MoreVertical,
  MapPin,
  Calendar,
  Users,
  Eye,
  Trash2,
  Edit3,
} from "lucide-angular";
import { TripService } from "../../trips/services/trip.service";
import { Trip } from "../../trips/models/trip.model";

@Component({
  selector: "app-admin-trips",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Missions Hub</h1>
          <p class="text-sm text-slate-500 mt-1">
            Orchestrate platform templates and monitor community-driven
            adventures.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button
            (click)="openCreateModal()"
            class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <lucide-icon [img]="TentIcon" [size]="18"></lucide-icon>
            Create Platform Template
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
          </button>
        </div>
      </div>

<<<<<<< HEAD
      <!-- Data Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th class="px-6 py-4 font-semibold">Trip Name</th>
                <th class="px-6 py-4 font-semibold">Destination</th>
                <th class="px-6 py-4 font-semibold">Dates</th>
                <th class="px-6 py-4 font-semibold">Participants</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="isLoading()" class="animate-pulse">
                 <td colspan="6" class="px-6 py-8 text-center text-slate-500">Loading trips data...</td>
              </tr>
              <tr *ngIf="!isLoading() && trips().length === 0">
                 <td colspan="6" class="px-6 py-8 text-center text-slate-500">No trips found in the system.</td>
              </tr>
              <tr *ngFor="let trip of trips()" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <lucide-icon [img]="TentIcon" [size]="20"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">{{ trip.name }}</p>
                      <p class="text-[11px] text-slate-400 font-mono">ID: {{ trip.id.substring(0, 8) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <lucide-icon [img]="MapPinIcon" [size]="14" class="text-slate-400"></lucide-icon>
                    {{ trip.destination }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col text-sm text-slate-600">
                    <span class="flex items-center gap-1.5"><lucide-icon [img]="CalendarIcon" [size]="12" class="text-slate-400"></lucide-icon> {{ trip.startDate | date:'MMM d, y' }}</span>
                    <span class="text-xs text-slate-400 mt-0.5">{{ trip.duration }} days total</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <lucide-icon [img]="UsersIcon" [size]="14" class="text-slate-400"></lucide-icon>
                    {{ trip.participants }} members
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': isUpcoming(trip.startDate),
                          'bg-amber-100 text-amber-700': !isUpcoming(trip.startDate)
                        }">
                    {{ isUpcoming(trip.startDate) ? 'Upcoming' : 'Past' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a [routerLink]="['/trips', trip.id]" target="_blank" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Trip">
                      <lucide-icon [img]="EyeIcon" [size]="18"></lucide-icon>
                    </a>
                    <button (click)="deleteTrip(trip.id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
=======
      <!-- Discovery & Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          (click)="activeTab.set('users')"
          class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
        >
          <div
            class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"
          >
            <lucide-icon [img]="UsersIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
            >
              User Adventures
            </p>
            <p class="text-xl font-black text-slate-900">
              {{ getUserTrips().length }}
            </p>
          </div>
        </div>
        <div
          (click)="activeTab.set('templates')"
          class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
        >
          <div
            class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"
          >
            <lucide-icon [img]="TentIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p
              class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
            >
              Global Templates
            </p>
            <p class="text-xl font-black text-slate-900">
              {{ getAdminTemplates().length }}
            </p>
          </div>
        </div>
        <div
          class="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 text-white"
        >
          <div
            class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
          >
            <lucide-icon [img]="SearchIcon" [size]="24"></lucide-icon>
          </div>
          <div class="flex-1 text-white">
            <input
              type="text"
              placeholder="Omni-search..."
              class="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 text-white"
              (input)="onSearch($event)"
            />
          </div>
        </div>
      </div>

      <!-- Navigation Tabs & Timeline Filter -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div
          class="flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit"
        >
          <button
            (click)="activeTab.set('templates')"
            [class]="
              activeTab() === 'templates'
                ? 'bg-white shadow-sm text-emerald-700'
                : 'text-slate-500 hover:text-slate-700'
            "
            class="px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
            Master Templates
          </button>
          <button
            (click)="activeTab.set('users')"
            [class]="
              activeTab() === 'users'
                ? 'bg-white shadow-sm text-indigo-700'
                : 'text-slate-500 hover:text-slate-700'
            "
            class="px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <lucide-icon [img]="UsersIcon" [size]="16"></lucide-icon>
            User Missions
          </button>
        </div>

        <!-- Timeline Filter -->
        <div
          class="flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit self-end"
        >
          <button
            (click)="timelineFilter.set('active')"
            [class]="
              timelineFilter() === 'active'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-slate-500 hover:text-slate-700'
            "
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Active Missions
          </button>
          <button
            (click)="timelineFilter.set('past')"
            [class]="
              timelineFilter() === 'past'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            "
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Mission Archives
          </button>
        </div>
      </div>

      <!-- Data Section -->
      <div
        class="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400"
              >
                <th class="px-8 py-5 font-black">Identity</th>
                <th class="px-6 py-5 font-black">Landing Zone</th>
                <th class="px-6 py-5 font-black">Timeline</th>
                <th class="px-6 py-5 font-black">Team Size</th>
                <th class="px-6 py-5 font-black">Status</th>
                <th class="px-8 py-5 font-black text-right">Operations</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngIf="isLoading()">
                <td colspan="6" class="px-8 py-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div
                      class="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"
                    ></div>
                    <p class="text-sm font-medium text-slate-400">
                      Synchronizing database...
                    </p>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!isLoading() && getActiveTrips().length === 0">
                <td colspan="6" class="px-8 py-20 text-center">
                  <div
                    class="flex flex-col items-center gap-3 grayscale opacity-40"
                  >
                    <lucide-icon [img]="SearchIcon" [size]="48"></lucide-icon>
                    <p
                      class="text-sm font-bold text-slate-900 uppercase tracking-widest"
                    >
                      No Records Found
                    </p>
                    <p class="text-xs text-slate-400">
                      Your search criteria matched no missions in this sector.
                    </p>
                  </div>
                </td>
              </tr>

              <tr
                *ngFor="let trip of getActiveTrips()"
                class="hover:bg-slate-50/80 transition-all group border-l-4 border-transparent hover:border-emerald-500"
              >
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden group-hover:scale-110 transition-transform shadow-inner"
                    >
                      <img
                        [src]="
                          trip.imageUrl ||
                          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'
                        "
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p
                        class="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors"
                      >
                        {{ trip.name }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <span
                          *ngIf="trip.template"
                          class="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter"
                          >System Template</span
                        >
                        <span
                          *ngIf="!trip.template"
                          class="text-[9px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-tighter"
                          >User Venture</span
                        >
                        <span class="text-[10px] text-slate-400 font-mono"
                          >#{{ trip.id.substring(0, 6) }}</span
                        >
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div
                    class="flex items-center gap-2 text-xs font-bold text-slate-600"
                  >
                    <lucide-icon
                      [img]="MapPinIcon"
                      [size]="14"
                      class="text-emerald-500"
                    ></lucide-icon>
                    {{ trip.destination }}
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span
                      class="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                      ><lucide-icon
                        [img]="CalendarIcon"
                        [size]="12"
                        class="text-slate-400"
                      ></lucide-icon>
                      {{ trip.startDate | date: "MMM d, y" }}</span
                    >
                    <span
                      class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide"
                      >Deployment Duration: {{ trip.duration }} Days</span
                    >
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex -space-x-2">
                    <div
                      *ngFor="let i of [1, 2, 3]"
                      class="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center"
                    >
                      <lucide-icon
                        [img]="UsersIcon"
                        [size]="10"
                        class="text-slate-400"
                      ></lucide-icon>
                    </div>
                    <div
                      class="w-6 h-6 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white"
                    >
                      +{{ trip.participants }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span
                    class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700 border-emerald-100':
                        isUpcoming(trip.startDate),
                      'bg-slate-50 text-slate-600 border-slate-100':
                        !isUpcoming(trip.startDate),
                    }"
                  >
                    {{
                      isUpcoming(trip.startDate) ? "Active Ready" : "Archived"
                    }}
                  </span>
                </td>
                <td class="px-8 py-5 text-right">
                  <div
                    class="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0"
                  >
                    <a
                      [routerLink]="['/trips', trip.id]"
                      target="_blank"
                      class="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                      title="Inspect Mission"
                    >
                      <lucide-icon [img]="EyeIcon" [size]="18"></lucide-icon>
                    </a>
                    <button
                      *ngIf="trip.template"
                      (click)="openEditModal(trip)"
                      class="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Edit template"
                    >
                      <lucide-icon [img]="EditIcon" [size]="18"></lucide-icon>
                    </button>
                    <button
                      (click)="deleteTrip(trip.id)"
                      class="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Terminate Data"
                    >
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                      <lucide-icon [img]="Trash2Icon" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
        <!-- Pagination Mock -->
        <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>Showing <strong>{{ trips().length }}</strong> trips</span>
          <div class="flex gap-1">
            <button class="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button class="px-3 py-1 rounded border border-slate-200 bg-emerald-50 text-emerald-700 font-medium">1</button>
            <button class="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Template Trip Modal -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <lucide-icon [img]="TentIcon" [size]="20" class="text-emerald-600"></lucide-icon>
            Add New Template Trip
          </h2>
          <button (click)="closeModal()" class="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600">
=======
      </div>
    </div>

    <!-- Create/Edit Template Trip Modal -->
    <div
      *ngIf="isModalOpen()"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between"
        >
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <lucide-icon
              [img]="TentIcon"
              [size]="20"
              class="text-emerald-600"
            ></lucide-icon>
            {{
              isEditing() ? "Edit Mission Template" : "Add New Template Trip"
            }}
          </h2>
          <button
            (click)="closeModal()"
            class="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600"
          >
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            &times;
          </button>
        </div>

        <form (ngSubmit)="submitTemplateTrip()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
<<<<<<< HEAD
             <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Trip Title <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="e.g. Sahara Desert Expedition" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
             <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Destination <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="formData.destination" name="destination" required placeholder="e.g. Douz, Kebili" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Difficulty <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="formData.adventureLevel" name="adventureLevel" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
                   <option value="easy">Easy</option>
                   <option value="moderate">Moderate</option>
                   <option value="hard">Hard / Advanced</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Est. Budget (TND) <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="formData.estimatedBudget" name="estimatedBudget" required min="0" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
            <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" placeholder="https://images.unsplash.com/..." class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
            <div *ngIf="formData.imageUrl" class="mt-2 w-full h-24 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center">
               <img [src]="formData.imageUrl" class="h-full w-full object-cover">
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Leave empty for a default image based on destination.</p>
          </div>

          <div *ngIf="submitMessage()" class="p-3 rounded-lg text-sm" [ngClass]="submitSuccess() ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
            {{ submitMessage() }}
          </div>
          
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!formData.name || !formData.destination" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              Create Template
=======
            <div class="col-span-2">
              <label
                class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider"
                >Trip Title <span class="text-rose-500">*</span></label
              >
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                placeholder="e.g. Sahara Desert Expedition"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div class="col-span-2">
              <label
                class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider"
                >Destination <span class="text-rose-500">*</span></label
              >
              <input
                type="text"
                [(ngModel)]="formData.destination"
                name="destination"
                required
                placeholder="e.g. Douz, Kebili"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider"
                >Difficulty <span class="text-rose-500">*</span></label
              >
              <select
                [(ngModel)]="formData.adventureLevel"
                name="adventureLevel"
                required
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard / Advanced</option>
              </select>
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider"
                >Est. Budget (TND) <span class="text-rose-500">*</span></label
              >
              <input
                type="number"
                [(ngModel)]="formData.estimatedBudget"
                name="estimatedBudget"
                required
                min="0"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div class="col-span-2">
            <label
              class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider"
              >Cover Image URL</label
            >
            <input
              type="text"
              [(ngModel)]="formData.imageUrl"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <div
              *ngIf="formData.imageUrl"
              class="mt-2 w-full h-24 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center"
            >
              <img
                [src]="formData.imageUrl"
                class="h-full w-full object-cover"
              />
            </div>
            <p class="text-[10px] text-slate-400 mt-1">
              Leave empty for a default image based on destination.
            </p>
          </div>

          <div
            *ngIf="submitMessage()"
            class="p-3 rounded-lg text-sm"
            [ngClass]="
              submitSuccess()
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            "
          >
            {{ submitMessage() }}
          </div>

          <div
            class="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4"
          >
            <button
              type="button"
              (click)="closeModal()"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!formData.name || !formData.destination"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isEditing() ? "Update Mission" : "Create Template" }}
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
<<<<<<< HEAD
    styles: []
})
export class AdminTripsComponent implements OnInit {
    TentIcon = Tent;
    SearchIcon = Search;
    MoreVerticalIcon = MoreVertical;
    MapPinIcon = MapPin;
    CalendarIcon = Calendar;
    UsersIcon = Users;
    EyeIcon = Eye;
    Trash2Icon = Trash2;

    trips = signal<Trip[]>([]);
    isLoading = signal<boolean>(true);

    isModalOpen = signal(false);
    submitMessage = signal('');
    submitSuccess = signal(false);
    formData = {
        name: '',
        destination: '',
        adventureLevel: 'moderate',
        estimatedBudget: 0,
        imageUrl: ''
    };

    constructor(private tripService: TripService) { }

    ngOnInit(): void {
        this.loadTrips();
    }

    loadTrips() {
        this.isLoading.set(true);
        this.tripService.getAllTripsAdmin().subscribe({
            next: (data) => {
                this.trips.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error fetching trips for admin', err);
                this.isLoading.set(false);
            }
        });
    }

    deleteTrip(tripId: string) {
        if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            this.tripService.deleteTrip(tripId).subscribe({
                next: () => {
                    this.trips.update(current => current.filter(t => t.id !== tripId));
                },
                error: (err) => console.error('Error deleting trip', err)
            });
        }
    }

    isUpcoming(dateStr: string): boolean {
        return new Date(dateStr) > new Date();
    }

    openCreateModal() {
        this.resetForm();
        this.submitMessage.set('');
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            name: '',
            destination: '',
            adventureLevel: 'moderate',
            estimatedBudget: 0,
            imageUrl: ''
        };
    }

    submitTemplateTrip() {
        const newTrip = {
            name: this.formData.name,
            destination: this.formData.destination,
            adventureLevel: this.formData.adventureLevel,
            budget: { estimated: this.formData.estimatedBudget || 0, actual: 0 },
            imageUrl: this.formData.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80',
            isTemplate: true // the key indicator
        };

        this.tripService.createTrip(newTrip).subscribe({
            next: (created) => {
                this.submitSuccess.set(true);
                this.submitMessage.set('Template Trip created successfully!');
                this.loadTrips(); // refresh list
                setTimeout(() => this.closeModal(), 1500);
            },
            error: (err) => {
                this.submitSuccess.set(false);
                this.submitMessage.set('Failed to create template trip.');
                console.error(err);
            }
        });
    }
=======
  styles: [],
})
export class AdminTripsComponent implements OnInit {
  TentIcon = Tent;
  SearchIcon = Search;
  MoreVerticalIcon = MoreVertical;
  MapPinIcon = MapPin;
  CalendarIcon = Calendar;
  UsersIcon = Users;
  EyeIcon = Eye;
  Trash2Icon = Trash2;
  EditIcon = Edit3;

  trips = signal<Trip[]>([]);
  isLoading = signal<boolean>(true);
  activeTab = signal<"templates" | "users">("templates");
  timelineFilter = signal<"active" | "past">("active");
  searchQuery = signal<string>("");

  isModalOpen = signal(false);
  isEditing = signal(false);
  selectedTripId = signal<string | null>(null);
  submitMessage = signal("");
  submitSuccess = signal(false);
  formData = {
    name: "",
    destination: "",
    adventureLevel: "moderate",
    estimatedBudget: 0,
    imageUrl: "",
  };

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips() {
    this.isLoading.set(true);
    let allTrips: Trip[] = [];
    let templateCount = 0;
    let userTripsCount = 0;

    // SYNC FIX: Load templates from consistent endpoint (matches user Discover Adventures)
    this.tripService.getAllTemplates().subscribe({
      next: (templates) => {
        // Map templates
        const mappedTemplates: Trip[] = (templates || []).map((t) => ({
          id: t.id || t._id,
          name: t.title || t.name || "Untitled Trip",
          description: t.description || "",
          destination:
            typeof t.destination === "string"
              ? t.destination
              : t.destination?.address || "Destination inconnue",
          startDate: t.startDate,
          endDate: t.endDate,
          duration: 0,
          status: this.mapStatus(t.status),
          participants: t.participants || 1,
          createdBy: t.userId || t.creatorId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          imageUrl: t.imageUrl,
          template: true,
        }));

        allTrips = [...allTrips, ...mappedTemplates];
        templateCount = mappedTemplates.length;

        // Also load user trips for the "User Missions" tab
        this.tripService.getAllTripsAdmin().subscribe({
          next: (allData) => {
            // Filter only non-templates (user trips)
            const userTrips = (allData || [])
              .filter((t) => !t.template)
              .map((t) => ({
                ...t,
                template: false,
              }));

            allTrips = [...mappedTemplates, ...userTrips];
            this.trips.set(allTrips);
            this.isLoading.set(false);

            userTripsCount = userTrips.length;

            // UX: If no templates but user trips exist, show user missions tab
            if (templateCount === 0 && userTripsCount > 0) {
              this.activeTab.set("users");
            }
          },
          error: (err) => {
            console.error("Error fetching user trips for admin", err);
            this.trips.set(mappedTemplates);
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        console.error("Error fetching templates for admin", err);
        this.isLoading.set(false);
      },
    });
  }

  private mapStatus(
    status: any,
  ): "planning" | "upcoming" | "active" | "completed" | "cancelled" {
    if (!status) return "planning";
    const s = status.toString().toLowerCase();
    if (s === "planned" || s === "planning") return "planning";
    if (s === "ongoing" || s === "active") return "active";
    if (s === "confirmed" || s === "upcoming") return "upcoming";
    if (s === "completed" || s === "finished") return "completed";
    if (s === "cancelled" || s === "inactive") return "cancelled";
    return "planning";
  }

  getAdminTemplates() {
    // SYNC FIX: Filter only templates (still filters, but source is now consistent with Discover Adventures)
    return this.trips().filter((t) => t.template === true);
  }

  getUserTrips() {
    return this.trips().filter((t) => !t.template);
  }

  getActiveTrips() {
    let sourceList =
      this.activeTab() === "templates"
        ? this.getAdminTemplates()
        : this.getUserTrips();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.timelineFilter() === "past") {
      // Archives: only trips whose start date has already passed
      sourceList = sourceList.filter((t) => {
        if (!t.startDate) return false;
        const start = new Date(t.startDate);
        return !isNaN(start.getTime()) && start < today;
      });
    } else {
      // Active: trips whose start date is today or future, OR have no date
      sourceList = sourceList.filter((t) => {
        if (!t.startDate) return true;
        const start = new Date(t.startDate);
        if (isNaN(start.getTime())) return true;
        return start >= today;
      });
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return sourceList;

    return sourceList.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query),
    );
  }

  onSearch(event: any) {
    this.searchQuery.set(event.target.value);
  }

  deleteTrip(tripId: string) {
    if (
      confirm(
        "Are you sure you want to delete this trip missions record? Data recovery is impossible.",
      )
    ) {
      this.tripService.deleteTrip(tripId).subscribe({
        next: () => {
          this.trips.update((current) =>
            current.filter((t) => t.id !== tripId),
          );
        },
        error: (err) => console.error("Error deleting trip", err),
      });
    }
  }

  isUpcoming(dateStr: string): boolean {
    return new Date(dateStr) > new Date();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedTripId.set(null);
    this.resetForm();
    this.submitMessage.set("");
    this.isModalOpen.set(true);
  }

  openEditModal(trip: Trip) {
    this.isEditing.set(true);
    this.selectedTripId.set(trip.id);
    this.formData = {
      name: trip.name,
      destination: trip.destination,
      adventureLevel: (trip as any).difficulty?.toLowerCase() || "moderate",
      estimatedBudget: (trip as any).totalBudget || 0,
      imageUrl: (trip as any).imageUrl || "",
    };
    this.submitMessage.set("");
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: "",
      destination: "",
      adventureLevel: "moderate",
      estimatedBudget: 0,
      imageUrl: "",
    };
  }

  submitTemplateTrip() {
    if (this.isEditing()) {
      this.updateTemplateTrip();
    } else {
      this.createTemplateTrip();
    }
  }

  createTemplateTrip() {
    const dummyDate = new Date();
    const dummyEndDate = new Date();
    dummyEndDate.setDate(dummyEndDate.getDate() + 7);

    const newTrip = {
      title: this.formData.name,
      destination: {
        name: this.formData.destination,
        address: this.formData.destination,
        coordinates: { lat: 0, lng: 0 },
      },
      difficulty: this.formData.adventureLevel.toUpperCase(),
      totalBudget: this.formData.estimatedBudget || 0,
      imageUrl:
        this.formData.imageUrl ||
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80",
      template: true,
      startDate: dummyDate.toISOString(),
      endDate: dummyEndDate.toISOString(),
      status: "PLANNED",
      participants: 1,
      userId: "admin",
    };

    this.tripService.createTrip(newTrip).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.submitMessage.set("Template Trip created successfully!");
        this.loadTrips();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.submitSuccess.set(false);
        this.submitMessage.set("Failed to create template trip.");
        console.error(err);
      },
    });
  }

  updateTemplateTrip() {
    const tripId = this.selectedTripId();
    if (!tripId) return;

    const updatedTrip = {
      title: this.formData.name,
      destination: {
        address: this.formData.destination,
      },
      difficulty: this.formData.adventureLevel.toUpperCase(),
      totalBudget: this.formData.estimatedBudget,
      imageUrl: this.formData.imageUrl,
      template: true,
    };

    this.tripService.updateTrip(tripId, updatedTrip).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.submitMessage.set("Template updated successfully!");
        this.loadTrips();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.submitSuccess.set(false);
        this.submitMessage.set("Update failed.");
        console.error(err);
      },
    });
  }
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
