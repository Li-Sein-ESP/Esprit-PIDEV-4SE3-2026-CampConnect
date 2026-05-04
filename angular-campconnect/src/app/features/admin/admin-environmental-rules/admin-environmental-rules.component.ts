import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, ShieldAlert, Leaf, Flame, Binoculars, Fish, Info } from 'lucide-angular';
import { EnvironmentalRuleService, EnvironmentalRule } from '../../../core/services/environmental-rule.service';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-admin-environmental-rules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Environmental Rules Management</h1>
          <p class="text-gray-500">Create and manage park regulations for campers</p>
        </div>
      </div>

      <!-- Add Rule Card -->
      <app-card variant="default" customClass="mb-8 border-2 border-[var(--color-primary-100)] bg-white">
        <app-card-content customClass="p-6">
          <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
            <lucide-icon [img]="Plus" size="20" class="text-[var(--color-primary-600)]"></lucide-icon>
            Add New Regulation
          </h2>
          <form [formGroup]="ruleForm" (ngSubmit)="addRule()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold mb-1">Title</label>
              <input type="text" formControlName="title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Bear Awareness">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold mb-1">Description</label>
              <textarea formControlName="description" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Explain the rule in detail..."></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold mb-1">Region <span class="text-gray-400 font-normal">(optional — match to campsite location)</span></label>
              <input type="text" formControlName="region" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Yosemite, Alps, Coastal...">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Category</label>
              <select formControlName="category" class="w-full px-4 py-2 border rounded-lg outline-none">
                <option value="Wildlife">Wildlife</option>
                <option value="Fire Safety">Fire Safety</option>
                <option value="General">General</option>
                <option value="Water">Water Usage</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Severity</label>
              <select formControlName="severity" class="w-full px-4 py-2 border rounded-lg outline-none">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Icon</label>
              <select formControlName="icon" class="w-full px-4 py-2 border rounded-lg outline-none">
                <option value="Leaf">Leaf</option>
                <option value="Flame">Flame</option>
                <option value="Binoculars">Binoculars</option>
                <option value="Fish">Fish</option>
                <option value="Info">Info</option>
              </select>
            </div>
            <div class="flex items-end">
              <app-button [fullWidth]="true" type="submit" [disabled]="ruleForm.invalid || isSaving">
                {{ isSaving ? 'Saving...' : 'Publish Regulation' }}
              </app-button>
            </div>
          </form>
        </app-card-content>
      </app-card>

      <!-- Rules List -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-gray-900 border-b pb-2">Active Regulations</h2>
        <div *ngFor="let rule of rules" class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
              <lucide-icon [img]="getIcon(rule.icon)" size="24" class="text-gray-600"></lucide-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-gray-900">{{ rule.title }}</h3>
                <app-badge [variant]="getSeverityVariant(rule.severity)">{{ rule.severity }}</app-badge>
              </div>
              <p class="text-sm text-gray-500">{{ rule.description | slice:0:100 }}...</p>
            </div>
          </div>
          <button (click)="deleteRule(rule.id!)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
            <lucide-icon [img]="Trash2" size="20"></lucide-icon>
          </button>
        </div>

        <div *ngIf="rules.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
           <p class="text-gray-400">No regulations published yet.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminEnvironmentalRulesComponent implements OnInit {
  // Icons
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Leaf = Leaf;
  readonly Flame = Flame;
  readonly Binoculars = Binoculars;
  readonly Fish = Fish;
  readonly Info = Info;

  rules: EnvironmentalRule[] = [];
  ruleForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private ruleService: EnvironmentalRuleService
  ) {
    this.ruleForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      region: [''],
      category: ['General', Validators.required],
      severity: ['LOW', Validators.required],
      icon: ['Info', Validators.required],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.ruleService.getRules().subscribe(data => {
      this.rules = data;
    });
  }

  addRule(): void {
    if (this.ruleForm.invalid) return;
    this.isSaving = true;
    this.ruleService.createRule(this.ruleForm.value).subscribe({
      next: () => {
        this.loadRules();
        this.ruleForm.reset({ region: '', category: 'General', severity: 'LOW', icon: 'Info', active: true });
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  deleteRule(id: string): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.ruleService.deleteRule(id).subscribe(() => {
        this.loadRules();
      });
    }
  }

  getIcon(name: string): any {
    switch (name) {
      case 'Leaf': return this.Leaf;
      case 'Flame': return this.Flame;
      case 'Binoculars': return this.Binoculars;
      case 'Fish': return this.Fish;
      default: return this.Info;
    }
  }

  getSeverityVariant(sev: string): any {
    switch (sev) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      default: return 'success';
    }
  }
}
