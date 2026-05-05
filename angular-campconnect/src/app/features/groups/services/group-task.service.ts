import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GroupTask {
  id?: string;
  groupId: string;
  title: string;
  assignedUserId?: string;
  isCompleted: boolean;
  lastModifiedBy?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupTaskService {
  private apiUrl = `${environment.apiUrl}/group-tasks`;

  constructor(private http: HttpClient) { }

  getTasksByGroupId(groupId: string): Observable<GroupTask[]> {
    return this.http.get<GroupTask[]>(`${this.apiUrl}/group/${groupId}`);
  }

  createTask(task: GroupTask): Observable<GroupTask> {
    return this.http.post<GroupTask>(this.apiUrl, task);
  }

  updateTask(id: string, task: Partial<GroupTask>): Observable<GroupTask> {
    return this.http.put<GroupTask>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
