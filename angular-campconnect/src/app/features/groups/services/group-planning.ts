import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupTask, TaskStatus, GroupDecision, DecisionStatus, Expense } from '../models/group.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupPlanningService {
  private apiUrl = `${environment.apiUrl}/group-tasks`;
  private decisionsApiUrl = `${environment.apiUrl}/groups`; // temporary

  constructor(private http: HttpClient) { }

  // --- TASKS ---
  getTasks(groupId: string): Observable<GroupTask[]> {
    return this.http.get<GroupTask[]>(`${this.apiUrl}/group/${groupId}`);
  }

  createTask(groupId: string, data: any): Observable<GroupTask> {
    return this.http.post<GroupTask>(this.apiUrl, { ...data, groupId });
  }

  updateTaskStatus(taskId: string, task: GroupTask): Observable<GroupTask> {
    return this.http.put<GroupTask>(`${this.apiUrl}/${taskId}`, task);
  }


  // --- DECISIONS (POLLS) ---
  getDecisions(groupId: string): Observable<GroupDecision[]> {
    return this.http.get<GroupDecision[]>(`${this.decisionsApiUrl}/${groupId}/decisions`);
  }

  vote(groupId: string, decisionId: string, optionId: string): Observable<any> {
    return this.http.post(`${this.decisionsApiUrl}/${groupId}/decisions/${decisionId}/vote`, { optionId });
  }




  // --- MOCK DATA --- 
  getMockTasks(groupId: string): GroupTask[] {
    return [
      { id: 't-1', groupId, title: 'Louer 4x4', description: 'Pour le trajet Agadir-Taghazout', status: TaskStatus.TODO, createdAt: new Date().toISOString() },
      { id: 't-2', groupId, title: 'Acheter victuailles', assignedToUserId: 'u2', status: TaskStatus.IN_PROGRESS, createdAt: new Date().toISOString() },
      { id: 't-3', groupId, title: 'Réserver camping', assignedToUserId: 'me', status: TaskStatus.DONE, createdAt: new Date().toISOString() }
    ];
  }

  getMockDecisions(groupId: string): GroupDecision[] {
    return [
      {
        id: 'd-1', groupId, title: 'Menu du Samedi soir', status: DecisionStatus.OPEN, createdByUserId: 'me', createdAt: new Date().toISOString(),
        options: [
          { id: 'o-1', text: 'Barbecue', votesCount: 2, votedByUserIds: ['me', 'u2'] },
          { id: 'o-2', text: 'Pâtes au pesto', votesCount: 0, votedByUserIds: [] }
        ]
      }
    ];
  }

  getMockExpenses(groupId: string): Expense[] {
    return [
      { id: 'e-1', groupId, paidByUserId: 'me', amount: 500, description: 'Courses supermarché', createdAt: new Date().toISOString(), participants: ['me', 'u2', 'u3'] },
      { id: 'e-2', groupId, paidByUserId: 'u2', amount: 300, description: 'Essence', createdAt: new Date().toISOString(), participants: ['me', 'u2', 'u3'] }
    ];
  }
}
