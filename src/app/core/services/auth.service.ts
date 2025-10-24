import { Injectable, EventEmitter, OnDestroy } from '@angular/core'; // Añadir OnDestroy
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, Subject, takeUntil } from 'rxjs'; // Añadir BehaviorSubject, Subject, takeUntil
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy { // Implementar OnDestroy
  private apiUrl = '/auth';
  private readonly TOKEN_KEY = 'authToken';
  public logoutEvent = new EventEmitter<void>(); // Puedes mantenerlo o eliminarlo si usas solo el BehaviorSubject

  // Subject para estado de login
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedInStatus.asObservable(); // Observable público del estado

  // Subject para desuscripción
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    // Opcional: Escuchar eventos de storage si el token puede cambiar en otra pestaña
    // window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngOnDestroy(): void { // Método para limpiar
      this.destroy$.next();
      this.destroy$.complete();
      // window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  // Método privado para verificar si hay token
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Método para actualizar el estado del BehaviorSubject
  private updateLoginStatus(): void {
    this.loggedInStatus.next(this.hasToken());
  }

  // POST /auth/register
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.updateLoginStatus(); // Actualiza el estado después de registrar
      })
    );
  }

  // POST /auth/login
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.updateLoginStatus(); // Actualiza el estado después de login
      })
    );
  }

  // (Diagrama: Cerrar sesión)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.updateLoginStatus(); // Actualiza el estado después de logout
    this.logoutEvent.emit(); // Emite el evento si aún lo necesitas en otros lados
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Método original, ahora puede usar el BehaviorSubject si prefieres
  isLoggedIn(): boolean {
    // return this.loggedInStatus.value; // O puedes leer el valor actual del Subject
    return this.hasToken(); // O seguir usando la verificación directa
  }

  // Opcional: Manejador para cambios en localStorage desde otras pestañas
  // private handleStorageChange(event: StorageEvent): void {
  //   if (event.key === this.TOKEN_KEY) {
  //     this.updateLoginStatus();
  //   }
  // }
}