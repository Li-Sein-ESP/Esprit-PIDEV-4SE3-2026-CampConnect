import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, Balance } from '../models/group.model';
import { environment } from '../../../../environments/environment';
import { GroupBalances } from '../models/expense.dto';

@Injectable({
    providedIn: 'root'
})
export class GroupExpenseService {
    private apiUrl = `${environment.apiUrl}/expenses`;

    constructor(private http: HttpClient) { }

    getExpensesForGroup(groupId: string): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.apiUrl}/group/${groupId}`);
    }

    getBalances(groupId: string): Observable<GroupBalances> {
        return this.http.get<GroupBalances>(`${this.apiUrl}/group/${groupId}/balances`);
    }

    addExpense(data: any): Observable<Expense> {
        return this.http.post<Expense>(this.apiUrl, data);
    }

    deleteExpense(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
