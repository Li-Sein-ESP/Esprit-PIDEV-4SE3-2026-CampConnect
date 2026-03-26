import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, ShieldAlert, Tent, Calendar as CalendarIcon, DollarSign, Clock, Activity, ArrowUpRight, ArrowDownRight, Server, Database, ActivitySquare, CreditCard, HelpCircle } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent {
  UsersIcon = Users;
  ShieldAlertIcon = ShieldAlert;
  TentIcon = Tent;
  CalendarIcon = CalendarIcon;
  DollarSignIcon = DollarSign;
  ClockIcon = Clock;
  ActivityIcon = Activity;
  ArrowUpRightIcon = ArrowUpRight;
  ArrowDownRightIcon = ArrowDownRight;
  ServerIcon = Server;
  DatabaseIcon = Database;
  ActivitySquareIcon = ActivitySquare;
  CreditCardIcon = CreditCard;
  HelpCircleIcon = HelpCircle;
}
