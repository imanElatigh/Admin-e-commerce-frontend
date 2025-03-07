import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://api.hostflare.cloud';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(isJson: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();
    const token = localStorage.getItem('token');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const isJson = !(body instanceof FormData);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(isJson),
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const isJson = !(body instanceof FormData);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(isJson),
    });
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const isJson = !(body instanceof FormData);
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(isJson),
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }
}
