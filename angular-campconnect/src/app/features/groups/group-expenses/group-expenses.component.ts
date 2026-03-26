import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Receipt, Plus, ArrowRight, Wallet, User as UserIcon } from 'lucide-angular';
import { GroupService } from '../services/group';
import { GroupExpenseService } from '../services/group-expenses.service';
import { Expense, Balance, GroupMember, User, GroupDetail } from '../models/group.model';

@Component({
    selector: 'app-group-expenses',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-expenses.component.html',
    styleUrl: './group-expenses.component.css'
})
export class GroupExpensesComponent implements OnInit {
    @Input() groupId!: string;
    @Input() group: GroupDetail | null = null;
    @Input() currentUserId: string | null = null;

    expenses: Expense[] = [];
    balances: Balance[] = [];

    loading = true;
    showNewExpenseForm = false;

    // New Expense Form State
    newExpenseAmount: number | null = null;
    newExpenseDescription = '';
    newExpensePaidBy = ''; 
    newExpenseSplitAmong: string[] = []; 

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
            this.loadExpenses();
            this.loadBalances();
            this.newExpensePaidBy = this.currentUserId || '';
            this.newExpenseSplitAmong = this.group?.members?.map((m: any) => m.id) || [];
        }
    }

    // Helper for template to access members
    get members(): any[] {
        return this.group?.members?.map(m => ({ ...m, userId: m.id })) || [];
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
                this.balances = this.group?.members?.map((m: any) => ({ userId: m.id, owes: {} })) || [];
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
            }
        });
    }

    addExpense() {
        if (!this.newExpenseAmount || !this.newExpenseDescription || this.newExpenseSplitAmong.length === 0) return;

        const newExpense: any = {
            groupId: this.groupId,
            paidByUserId: this.newExpensePaidBy || this.currentUserId,
            amount: this.newExpenseAmount,
            description: this.newExpenseDescription,
            category: 'OTHER',
            splitType: 'EQUAL',
            participants: [...this.newExpenseSplitAmong]
        };

        this.expenseService.addExpense(newExpense).subscribe({
            next: (expense) => {
                this.expenses.unshift(expense);
                this.loadBalances();
                this.resetForm();
            },
            error: (err) => {
                console.error("Erreur d'ajout de la dépense", err);
            }
        });
    }

    resetForm() {
        this.showNewExpenseForm = false;
        this.newExpenseAmount = null;
        this.newExpenseDescription = '';
        this.newExpenseSplitAmong = this.group?.members?.map((m: any) => m.id) || [];
        this.newExpensePaidBy = this.currentUserId || '';
    }

    toggleSplitMember(userId: string) {
        const idx = this.newExpenseSplitAmong.indexOf(userId);
        if (idx > -1) {
            this.newExpenseSplitAmong.splice(idx, 1);
        } else {
            this.newExpenseSplitAmong.push(userId);
        }
    }

    getTotalSpent(): number {
        return this.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    }

    getMemberName(userId: string | undefined): string {
        if (!userId) return 'Inconnu';
        if (userId === this.currentUserId) return 'Moi';
        const member = this.group?.members?.find((m: any) => m.id === userId);
        return member?.name || member?.username || userId;
    }

    getMemberAvatar(userId: string): string {
        const member = this.group?.members?.find((m: any) => m.id === userId);
        return member?.avatar || `https://ui-avatars.com/api/?name=${member?.name || userId}&background=random&size=48`;
    }
}
