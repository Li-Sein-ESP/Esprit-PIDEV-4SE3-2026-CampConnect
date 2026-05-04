import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { IncidentReport, SafetyAlert } from '../models/safety.model';

import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SafetyService {
    private apiUrl = `${environment.apiUrl}/incidents`;
    private apiUrlAlerts = `${environment.apiUrl}/alerts`;
    private adminModerationUrl = `${environment.apiUrl}/admin/moderation`;

    constructor(private http: HttpClient) { }

    getModerationLogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.adminModerationUrl}/logs`);
    }

    submitIncident(reportData: Omit<IncidentReport, 'id' | 'createdAt' | 'status'>): Observable<IncidentReport> {
        // Map frontend IncidentReport model to backend IncidentDTO
        const incidentDTO = {
            title: reportData.type,
            description: reportData.description,
            level: reportData.level,
            regionName: reportData.regionName,
            latitude: reportData.latitude,
            longitude: reportData.longitude,
            reporterId: reportData.reporterId,
            tripId: null // Optional
        };

        return this.http.post<IncidentReport>(this.apiUrl, incidentDTO);
    }

    getIncidents(): Observable<IncidentReport[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(incidents => incidents.map(inc => this.mapToIncidentReport(inc)))
        );
    }

    private mapToIncidentReport(dto: any): IncidentReport {
        return {
            id: dto.id,
            type: dto.title || 'Incident',
            level: dto.level || 'low',
            regionName: dto.regionName || 'Unknown Region',
            latitude: dto.latitude || 0,
            longitude: dto.longitude || 0,
            description: dto.description || '',
            reporterId: dto.reporterId || 'anonymous',
            createdAt: dto.reportedAt || new Date().toISOString(),
            status: (dto.status?.toLowerCase() as any) || 'pending'
        };
    }

    updateIncident(id: string, incident: Partial<IncidentReport>): Observable<IncidentReport> {
        // Map frontend IncidentReport partial to backend IncidentDTO
        const dto: any = {};
        if (incident.type) dto.title = incident.type;
        if (incident.description) dto.description = incident.description;
        if (incident.level) dto.level = incident.level;
        if (incident.regionName) dto.regionName = incident.regionName;
        if (incident.latitude !== undefined) dto.latitude = incident.latitude;
        if (incident.longitude !== undefined) dto.longitude = incident.longitude;
        if (incident.reporterId) dto.reporterId = incident.reporterId;
        if (incident.status) dto.status = incident.status;
        
        // Include tripId if it exists in the partial
        if ((incident as any).tripId) dto.tripId = (incident as any).tripId;

        return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
            map(inc => this.mapToIncidentReport(inc))
        );
    }

    deleteIncident(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAlerts(): Observable<SafetyAlert[]> {
        return this.http.get<any[]>(this.apiUrlAlerts).pipe(
            map(alerts => alerts.map(alert => this.mapToSafetyAlert(alert)))
        );
    }

  createAlert(alert: Partial<SafetyAlert>): Observable<SafetyAlert> {
    const dto = {
      title: alert.title,
      description: alert.description,
      type: alert.type?.toUpperCase(),
      severity: alert.severity?.toUpperCase(),
      locationName: alert.location?.name,
      regionName: alert.location?.region
    };
    return this.http.post<any>(this.apiUrlAlerts, dto).pipe(
      map(newDto => this.mapToSafetyAlert(newDto))
    );
  }

  getAlertById(id: string): Observable<SafetyAlert> {
    return this.http.get<any>(`${this.apiUrlAlerts}/${id}`).pipe(
      map(alert => this.mapToSafetyAlert(alert))
    );
  }

  updateAlert(id: string, alert: Partial<SafetyAlert>): Observable<SafetyAlert> {
    // Map frontend SafetyAlert model back to backend SafetyAlertDTO
    const dto = {
      title: alert.title,
      description: alert.description,
      type: alert.type?.toUpperCase(),
      severity: alert.severity?.toUpperCase(),
      locationName: alert.location?.name,
      regionName: alert.location?.region
    };
    return this.http.put<any>(`${this.apiUrlAlerts}/${id}`, dto).pipe(
      map(updatedDto => this.mapToSafetyAlert(updatedDto))
    );
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlAlerts}/${id}`);
  }

    private mapToSafetyAlert(dto: any): SafetyAlert {
        return {
            id: dto.id || 'unknown',
            type: (dto.type?.toLowerCase() as any) || 'advisory',
            severity: (dto.severity?.toLowerCase() as any) || 'info',
            title: dto.title || 'Safety Alert',
            description: dto.description || 'No description provided.',
            location: {
                name: dto.locationName || 'Unknown Location',
                region: dto.regionName || 'Unknown Region'
            },
            affectedAreas: dto.affectedAreas || [],
            startDate: dto.createdAt || new Date().toISOString(),
            updatedAt: dto.createdAt || new Date().toISOString(),
            source: dto.source || 'CampConnect System',
            active: true
        };
    }
}
