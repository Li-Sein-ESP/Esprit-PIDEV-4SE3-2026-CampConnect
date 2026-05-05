import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TripFeedback } from '../models/trip-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class TripFeedbackService {

  private apiUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) { }

  leaveFeedback(feedback: TripFeedback): Observable<TripFeedback> {
    return this.http.post<TripFeedback>(this.apiUrl, feedback);
  }

  getMyFeedbacksForTrip(tripId: string): Observable<TripFeedback[]> {
    return this.http.get<TripFeedback[]>(`${this.apiUrl}/trip/${tripId}`);
  }
}
