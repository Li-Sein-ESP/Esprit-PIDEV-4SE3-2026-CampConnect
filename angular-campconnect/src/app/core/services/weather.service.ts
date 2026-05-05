import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = `${environment.apiUrl}/external/weather`;

  constructor(private http: HttpClient) {}

  getCurrentWeather(location: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/current`, { params: { location } });
  }

  getWeatherAdvice(location: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/advice`, { 
      params: { location },
      responseType: 'text' 
    });
  }
}
