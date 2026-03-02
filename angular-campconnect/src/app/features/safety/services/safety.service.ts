import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IncidentReport } from '../models/safety.model';

@Injectable({
    providedIn: 'root'
})
export class SafetyService {
    private apiUrl = 'http://localhost:8081/api/incidents';
    private apiUrlAlerts = 'http://localhost:8081/api/alerts';

    constructor(private http: HttpClient) { }

    submitIncident(reportData: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>): Observable<IncidentReport> {
        // Map frontend IncidentReport model to backend IncidentDTO
        const incidentDTO = {
            title: reportData.type,
            description: reportData.description,
            tripId: 'default-trip' // Or handle trip selection
        };

        return this.http.post<IncidentReport>(this.apiUrl, incidentDTO);
    }

    getIncidents(): Observable<IncidentReport[]> {
        return this.http.get<IncidentReport[]>(this.apiUrl);
    }

    getAlerts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrlAlerts);
    }
}
