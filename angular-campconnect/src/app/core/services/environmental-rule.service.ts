import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EnvironmentalRule {
    id?: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    severity: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EnvironmentalRuleService {
    private readonly apiUrl = `${environment.apiUrl}/environmental-rules`;

    constructor(private http: HttpClient) { }

    getRules(): Observable<EnvironmentalRule[]> {
        return this.http.get<EnvironmentalRule[]>(this.apiUrl);
    }

    createRule(rule: EnvironmentalRule): Observable<EnvironmentalRule> {
        return this.http.post<EnvironmentalRule>(this.apiUrl, rule);
    }

    deleteRule(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
