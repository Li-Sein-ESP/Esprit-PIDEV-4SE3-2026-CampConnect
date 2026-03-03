import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Group {
    id?: string;
    name: string;
    description?: string;
    createdAt?: string;
    trips?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private apiUrl = 'http://localhost:8081/api/groups';

    constructor(private http: HttpClient) { }

    getAllGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(this.apiUrl);
    }

    getGroupById(id: string): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/${id}`);
    }

    createGroup(group: Group): Observable<Group> {
        return this.http.post<Group>(this.apiUrl, group);
    }

    deleteGroup(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
