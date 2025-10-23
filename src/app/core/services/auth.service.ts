import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/auth';
  private readonly TOKEN_KEY = 'authToken';
  public logoutEvent = new EventEmitter<void>(); // Para avisar al navbar

  constructor(private http: HttpClient) { }

  // POST /auth/register
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  // POST /auth/login
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  // (Diagrama: Cerrar sesión)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.logoutEvent.emit(); 
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); 
  }
}