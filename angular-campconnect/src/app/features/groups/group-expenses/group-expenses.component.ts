import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Receipt, Plus, ArrowRight, Wallet, User as UserIcon } from 'lucide-angular';
import { GroupService } from '../services/group';
import { GroupExpenseService } from '../services/group-expenses.service';
import { Expense, Balance, GroupMember } from '../models/group.model';

@Component({
    selector: 'app-group-expenses',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-expenses.component.html',
    styleUrl: './group-expenses.component.css'
})
export class GroupExpensesComponent implements OnInit {
    @Input() groupId!: string;

    expenses: Expense[] = [];
    balances: Balance[] = [];
    members: GroupMember[] = [];
    currentUserId = 'me'; // Simulation

    loading = true;
    showNewExpenseForm = false;

    // New Expense Form State
    newExpenseAmount: number | null = null;
    newExpenseDescription = '';
    newExpensePaidBy = this.currentUserId; // Default to current user
    newExpenseSplitAmong: string[] = []; // Default everyone

    // Icons
    readonly Receipt = Receipt;
    readonly Plus = Plus;
    readonly ArrowRight = ArrowRight;
    readonly Wallet = Wallet;
    readonly UserIcon = UserIcon;

    constructor(
        private expenseService: GroupExpenseService,
        private groupService: GroupService
    ) { }

    ngOnInit(): void {
        if (this.groupId) {
            this.loadGroupMembers();
        }
    }

    loadGroupMembers() {
        this.groupService.getGroupById(this.groupId).subscribe({
            next: (group) => {
                this.members = group.members || [];
                this.newExpenseSplitAmong = this.members.map(m => m.userId);
                this.loadExpenses();
                this.loadBalances();
            },
            error: (err) => {
                console.error("Erreur de chargement du groupe", err);
                this.members = [];
                this.loading = false;
            }
        });
    }

    loadExpenses() {
        this.loading = true;
        this.expenseService.getExpensesForGroup(this.groupId).subscribe({
            next: (expenses) => {
                this.expenses = expenses || [];
                this.loading = false;
            },
            error: (err) => {
                console.error("Erreur de chargement des dépenses", err);
                this.expenses = [];
                this.loading = false;
            }
        });
    }

    loadBalances() {
        this.expenseService.getBalances(this.groupId).subscribe({
            next: (backendBalances) => {
                // Map backend BalanceDetail[] to frontend Balance[] structure
                this.balances = this.members.map(m => ({ userId: m.userId, owes: {} }));

                if (backendBalances && backendBalances.details) {
                    backendBalances.details.forEach((detail: any) => {
                        const debtor = this.balances.find(b => b.userId === detail.fromUserId);
                        if (debtor) {
                            debtor.owes[detail.toUserId] = detail.amount;
                        }
                    });
                }
            },
            error: (err) => {
                console.error("Erreur de calcul des balances", err);
                this.balances = [];
            }
        });
    }

    addExpense() {
        if (!this.newExpenseAmount || !this.newExpenseDescription || this.newExpenseSplitAmong.length === 0) return;

        const newExpense: any = {
            groupId: this.groupId,
            paidByUserId: this.newExpensePaidBy,
            amount: this.newExpenseAmount,
            description: this.newExpenseDescription,
            category: 'OTHER', // Default category
            splitType: 'EQUAL', // Default split type
            participants: [...this.newExpenseSplitAmong]
        };

        this.expenseService.addExpense(newExpense).subscribe({
            next: (expense) => {
                this.expenses.unshift(expense);
                this.loadBalances(); // Refresh balances from backend
            },
            error: (err) => {
                console.error("Erreur d'ajout de la dépense", err);
            }
        });

        this.showNewExpenseForm = false;
        this.newExpenseAmount = null;
        this.newExpenseDescription = '';
        this.newExpenseSplitAmong = this.members.map(m => m.userId);
    }

    toggleSplitMember(userId: string) {
        const idx = this.newExpenseSplitAmong.indexOf(userId);
        if (idx > -1) {
            this.newExpenseSplitAmong.splice(idx, 1);
        } else {
            this.newExpenseSplitAmong.push(userId);
        }
    }

    // --- Utilities ---
    getTotalSpent(): number {
        return this.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    }

    getMemberName(userId: string): string {
        return userId === 'me' ? 'Moi' : (userId === 'u2' ? 'Alex' : (userId === 'u3' ? 'Sarah' : userId));
    }
}
