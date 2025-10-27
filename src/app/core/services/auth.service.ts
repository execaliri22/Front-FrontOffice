import { Injectable, computed, signal, OnDestroy, EventEmitter } from '@angular/core'; // Añadir signal y computed
import { HttpClient } from '@angular/common/http';
import { Observable, tap, Subject, takeUntil, catchError, throwError } from 'rxjs'; // Quitar BehaviorSubject si no se usa más directamente
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/models';

// Interface simple para la estructura esperada del payload del JWT
// Asegúrate que coincida con lo que envía tu backend (especialmente 'nombre')
interface JwtPayload {
  sub: string; // Típicamente el email/username
  nombre?: string; // El backend DEBE incluir el nombre aquí para mostrarlo
  exp?: number; // Fecha de expiración (opcional para mostrar)
  iat?: number; // Fecha de emisión (opcional)
  // Agrega otros campos si los necesitas/envías desde el backend
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private apiUrl = '/auth';
  private readonly TOKEN_KEY = 'authToken';
  public logoutEvent = new EventEmitter<void>(); // Puedes mantenerlo si lo usas

  // Signal para el estado de login
  private loggedInStatus = signal<boolean>(false); // Inicializa en false, se actualiza en constructor
  public isLoggedIn$ = this.loggedInStatus.asReadonly(); // Observable público (si lo necesitas)

  // Signals para el token y datos del usuario decodificados
  private currentUserToken = signal<string | null>(null); // Inicializa en null
  // Signal computado: decodifica el token cuando cambia
  public currentUser = computed<JwtPayload | null>(() => {
    const token = this.currentUserToken();
    if (token) {
      return this.decodeToken(token);
    }
    return null;
  });
  // Signals computados específicos para nombre y email (más fácil de usar en componentes)
  public currentUserName = computed<string | null>(() => this.currentUser()?.nombre ?? this.currentUser()?.sub ?? null);
  public currentUserEmail = computed<string | null>(() => this.currentUser()?.sub ?? null);

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    // Solo actualiza el estado si estamos en el navegador
    if (typeof localStorage !== 'undefined') {
      this.updateLoginStatus(); // Actualiza estado al iniciar el servicio
       window.addEventListener('storage', this.handleStorageChange.bind(this)); // Escucha cambios en otras pestañas
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
     if (typeof window !== 'undefined') { // Solo si estamos en el navegador
        window.removeEventListener('storage', this.handleStorageChange.bind(this));
     }
  }

  // Verifica si hay token (solo en navegador)
  private hasToken(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Decodifica el payload del JWT (Implementación básica SIN verificar firma)
  private decodeToken(token: string): JwtPayload | null {
     // Solo decodifica si estamos en el navegador (atob no existe en SSR)
     if (typeof atob === 'undefined') return null;
    try {
      // 1. Separa el token en sus partes (header, payload, signature)
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null; // Si no hay payload, token inválido

      // 2. Decodifica la parte del payload (Base64)
      const payloadDecoded = atob(payloadBase64);

      // 3. Parsea el JSON decodificado
      return JSON.parse(payloadDecoded) as JwtPayload;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      this.clearToken(); // Limpia el token si es inválido
      return null;
    }
  }

  // Actualiza los signals basados en el localStorage (solo en navegador)
  private updateLoginStatus(): void {
     if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem(this.TOKEN_KEY);
    this.currentUserToken.set(token); // Actualiza el signal del token
    this.loggedInStatus.set(!!token); // Actualiza el signal de estado de login
    console.log('Login status updated:', this.loggedInStatus());
  }

  // Limpia el token y actualiza signals (solo en navegador)
  private clearToken(): void {
     if (typeof localStorage === 'undefined') return;
     localStorage.removeItem(this.TOKEN_KEY);
     this.updateLoginStatus(); // Refleja el cambio en los signals
  }

  // Guarda el token y actualiza signals (solo en navegador)
  private saveToken(token: string): void {
     if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
    this.updateLoginStatus(); // Refleja el cambio en los signals
  }

  // --- Métodos Públicos ---

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.saveToken(response.token)), // Guarda token y actualiza signals
      catchError(err => {
         console.error("Error en registro:", err);
         return throwError(() => new Error('Error al registrar. ¿El email ya existe?')); // Mensaje de error más específico
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.saveToken(response.token)), // Guarda token y actualiza signals
      catchError(err => {
         console.error("Error en login:", err);
         return throwError(() => new Error('Email o contraseña incorrectos.')); // Mensaje de error más específico
      })
    );
  }

  logout(): void {
    this.clearToken(); // Limpia token y actualiza signals
    this.logoutEvent.emit(); // Emite evento si es necesario
    console.log('Usuario deslogueado.');
  }

  getToken(): string | null {
     if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Método público para verificar si está logueado (lee el signal)
  isLoggedIn(): boolean {
    return this.loggedInStatus();
  }

  // Manejador para cambios en localStorage desde otras pestañas/ventanas
  private handleStorageChange(event: StorageEvent): void {
    // Si la clave que cambió es la del token, actualiza el estado
    if (event.key === this.TOKEN_KEY) {
      console.log('Storage change detectado para el token.');
      this.updateLoginStatus();
    }
  }
}