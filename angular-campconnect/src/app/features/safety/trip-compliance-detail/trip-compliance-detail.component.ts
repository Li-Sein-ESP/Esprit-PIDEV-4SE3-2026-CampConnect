import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
    LucideAngularModule,
    ChevronLeft, ShieldCheck, MapPin, Calendar, Users, CircleCheck,
    AlertTriangle, CircleX, Flame, Utensils, Mountain, Binoculars,
    TreePine, Info, FileText, Eye, Tent
} from 'lucide-angular';

interface RestrictionItem {
    type: 'requirement' | 'restriction';
    text: string;
}

interface ComplianceCard {
    id: string;
    title: string;
    category: string;
    status: 'Allowed' | 'Restricted' | 'Prohibited';
    iconName: string;
    description: string;
    items: RestrictionItem[];
}

@Component({
    selector: 'app-trip-compliance-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './trip-compliance-detail.component.html'
})
export class TripComplianceDetailComponent {
    readonly ChevronLeftIcon = ChevronLeft;
    readonly ShieldCheckIcon = ShieldCheck;
    readonly MapPinIcon = MapPin;
    readonly CalendarIcon = Calendar;
    readonly UsersIcon = Users;
    readonly CircleCheckIcon = CircleCheck;
    readonly AlertTriangleIcon = AlertTriangle;
    readonly CircleXIcon = CircleX;
    readonly FlameIcon = Flame;
    readonly UtensilsIcon = Utensils;
    readonly MountainIcon = Mountain;
    readonly BinocularsIcon = Binoculars;
    readonly TreePineIcon = TreePine;
    readonly InfoIcon = Info;
    readonly FileTextIcon = FileText;
    readonly EyeIcon = Eye;
    readonly TentIcon = Tent;

    complianceData: ComplianceCard[] = [
        {
            id: '1',
            title: 'Open Campfires',
            category: 'Fire Regulations',
            status: 'Prohibited',
            iconName: 'flame',
            description: 'Stage 2 fire restrictions currently in effect due to elevated fire danger. All open fires including campfires are prohibited.',
            items: [
                { type: 'restriction', text: 'No wood-burning fires of any kind' },
                { type: 'restriction', text: 'Fire rings and fire pits may not be used' },
                { type: 'restriction', text: 'Charcoal grills prohibited' },
                { type: 'restriction', text: 'Violators subject to citation and fines up to $5,000' }
            ]
        },
        {
            id: '2',
            title: 'Camp Stoves',
            category: 'Cooking Regulations',
            status: 'Allowed',
            iconName: 'utensils',
            description: 'Portable camp stoves with shut-off valves are permitted during fire restrictions.',
            items: [
                { type: 'requirement', text: 'Must have functional shut-off valve' },
                { type: 'requirement', text: 'Use only in cleared areas (10ft diameter)' },
                { type: 'requirement', text: 'Keep away from flammable vegetation' },
                { type: 'requirement', text: 'Never leave unattended while in use' },
                { type: 'requirement', text: 'Have fire extinguisher or water nearby' }
            ]
        },
        {
            id: '3',
            title: 'Trail Access',
            category: 'Access Regulations',
            status: 'Restricted',
            iconName: 'mountain',
            description: 'Some trails have seasonal closures or permit requirements during this time period.',
            items: [
                { type: 'requirement', text: 'Wilderness permit required for overnight stays' },
                { type: 'requirement', text: 'Maximum group size: 7 people' },
                { type: 'restriction', text: 'Longs Peak Trail closed until April 1' },
                { type: 'restriction', text: 'Thunder Lake Trail requires advance reservation' }
            ]
        },
        {
            id: '4',
            title: 'Bear Precautions',
            category: 'Wildlife Regulations',
            status: 'Restricted',
            iconName: 'users',
            description: 'Bear activity is moderate. Food storage requirements are mandatory in all backcountry areas.',
            items: [
                { type: 'requirement', text: 'Bear canisters required for all food and scented items' },
                { type: 'requirement', text: 'Store canisters 100+ feet from sleeping area' },
                { type: 'requirement', text: 'No food storage in vehicles overnight' },
                { type: 'requirement', text: 'Report all bear encounters to rangers' }
            ]
        },
        {
            id: '5',
            title: 'Wildlife Viewing',
            category: 'Wildlife Regulations',
            status: 'Allowed',
            iconName: 'binoculars',
            description: 'Wildlife viewing is permitted with proper distance and behavior guidelines.',
            items: [
                { type: 'requirement', text: 'Maintain 25 yards from most wildlife' },
                { type: 'requirement', text: 'Maintain 100 yards from bears and moose' },
                { type: 'requirement', text: 'Never feed or approach animals' }
            ]
        },
        {
            id: '6',
            title: 'Waste Disposal',
            category: 'Environmental Regulations',
            status: 'Restricted',
            iconName: 'treepine',
            description: 'Pack in, pack out policy strictly enforced. Leave No Trace principles apply.',
            items: [
                { type: 'requirement', text: 'Pack out all trash and food waste' },
                { type: 'requirement', text: 'Use designated toilet facilities when available' },
                { type: 'requirement', text: 'Use biodegradable soap only, 200ft from water sources' }
            ]
        },
        {
            id: '7',
            title: 'Camping Zones',
            category: 'Environmental Regulations',
            status: 'Restricted',
            iconName: 'tent',
            description: 'Camping is only permitted in designated zones with valid permits.',
            items: [
                { type: 'requirement', text: 'Camp only in designated wilderness zones' },
                { type: 'requirement', text: 'Set up camp 200ft from lakes and streams' },
                { type: 'restriction', text: 'No camping above treeline (11,500 ft)' },
                { type: 'restriction', text: 'Sensitive habitat zones closed to camping' }
            ]
        }
    ];

    getRequirements(card: ComplianceCard) {
        return card.items.filter(i => i.type === 'requirement');
    }

    getRestrictions(card: ComplianceCard) {
        return card.items.filter(i => i.type === 'restriction');
    }

    get allowedCount() { return this.complianceData.filter(c => c.status === 'Allowed').length; }
    get restrictedCount() { return this.complianceData.filter(c => c.status === 'Restricted').length; }
    get prohibitedCount() { return this.complianceData.filter(c => c.status === 'Prohibited').length; }

    getIcon(name: string): any {
        const map: Record<string, any> = {
            flame: this.FlameIcon, utensils: this.UtensilsIcon, mountain: this.MountainIcon,
            users: this.UsersIcon, binoculars: this.BinocularsIcon, treepine: this.TreePineIcon, tent: this.TentIcon
        };
        return map[name] || this.ShieldCheckIcon;
    }

    getBorderClass(status: string) {
        if (status === 'Allowed') return 'border-l-4 border-l-[#10B981] border-gray-200';
        if (status === 'Restricted') return 'border-l-4 border-l-[#D97706] border-gray-200';
        return 'border-l-4 border-l-[#EF4444] border-gray-200';
    }

    getBadgeClass(status: string) {
        if (status === 'Allowed') return 'bg-[#10B981] text-white';
        if (status === 'Restricted') return 'bg-[#D97706] text-white';
        return 'bg-[#EF4444] text-white';
    }

    getIconBgClass(status: string) {
        if (status === 'Allowed') return 'bg-[#ECFDF5] text-[#10B981]';
        if (status === 'Restricted') return 'bg-[#FFFBEB] text-[#D97706]';
        return 'bg-[#FEF2F2] text-[#EF4444]';
    }
}
