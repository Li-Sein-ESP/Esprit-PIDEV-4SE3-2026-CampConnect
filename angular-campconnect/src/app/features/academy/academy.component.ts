import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, BookOpen, Clock, Users, Award, Search, Filter, Star, TrendingUp, Play } from 'lucide-angular';
import { BadgeComponent } from '../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../shared/components/card.component';

@Component({
    selector: 'app-academy',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LucideAngularModule,
        BadgeComponent,
        CardComponent,
        CardContentComponent
    ],
    templateUrl: './academy.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AcademyComponent {
    // Icons
    readonly BookOpen = BookOpen;
    readonly Clock = Clock;
    readonly Users = Users;
    readonly Award = Award;
    readonly Search = Search;
    readonly Filter = Filter;
    readonly Star = Star;
    readonly TrendingUp = TrendingUp;
    readonly Play = Play;

    selectedCategory = 'all';
    searchQuery = '';

    categories = [
        { id: 'all', name: 'All Courses', count: 24 },
        { id: 'camping', name: 'Camping Basics', count: 8 },
        { id: 'survival', name: 'Survival Skills', count: 6 },
        { id: 'navigation', name: 'Navigation', count: 5 },
        { id: 'safety', name: 'Safety & First Aid', count: 5 },
    ];

    courses = [
        {
            id: 'course-1',
            title: 'Camping 101: Essential Skills for Beginners',
            description: 'Learn the fundamentals of camping, from setting up your tent to building a campfire safely.',
            instructor: 'Sarah Johnson',
            instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            category: 'camping',
            level: 'Beginner',
            duration: '2 hours',
            students: 1243,
            rating: 4.8,
            reviewCount: 342,
            thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
            lessons: 12,
            price: 'Free',
            featured: true,
        },
        {
            id: 'course-2',
            title: 'Wilderness Survival: Core Techniques',
            description: 'Master essential survival skills including shelter building, fire starting, and water purification.',
            instructor: 'Mike Chen',
            instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            category: 'survival',
            level: 'Intermediate',
            duration: '4 hours',
            students: 856,
            rating: 4.9,
            reviewCount: 234,
            thumbnail: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
            lessons: 18,
            price: '$29',
            featured: true,
        },
        {
            id: 'course-3',
            title: 'Map Reading & Compass Navigation',
            description: 'Navigate confidently in the wilderness using traditional map and compass techniques.',
            instructor: 'Emma Rodriguez',
            instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            category: 'navigation',
            level: 'Beginner',
            duration: '3 hours',
            students: 645,
            rating: 4.7,
            reviewCount: 189,
            thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
            lessons: 15,
            price: '$19',
            featured: false,
        },
        {
            id: 'course-4',
            title: 'Wilderness First Aid Certification',
            description: 'Get certified in wilderness first aid and learn to handle medical emergencies in remote areas.',
            instructor: 'Dr. James Wilson',
            instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
            category: 'safety',
            level: 'Advanced',
            duration: '8 hours',
            students: 423,
            rating: 5.0,
            reviewCount: 156,
            thumbnail: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
            lessons: 24,
            price: '$99',
            featured: true,
        },
    ];

    constructor(private router: Router) { }

    get filteredCourses() {
        return this.courses.filter(course => {
            const matchesCategory = this.selectedCategory === 'all' || course.category === this.selectedCategory;
            const matchesSearch = !this.searchQuery ||
                course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    get featuredCourses() {
        return this.courses.filter(c => c.featured);
    }

    viewCourse(courseId: string) {
        this.router.navigate(['/academy', courseId]);
    }

    getLevelVariant(level: string): 'default' | 'primary' | 'success' | 'warning' {
        const variants: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
            'Beginner': 'success',
            'Intermediate': 'primary',
            'Advanced': 'warning',
        };
        return variants[level] || 'default';
    }

    getCategoryName(): string {
        if (this.selectedCategory === 'all') return 'All Courses';
        return this.categories.find(c => c.id === this.selectedCategory)?.name || 'Courses';
    }
}
