import { Injectable, computed, signal, OnDestroy, EventEmitter, inject } from '@angular/core'; // inject añadido
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // HttpErrorResponse añadido
import { Observable, tap, Subject, catchError, throwError } from 'rxjs'; // takeUntil eliminado, catchError y throwError añadidos
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/models';

// Interface actualizada para el payload del JWT
interface JwtPayload {
  sub: string; // Típicamente el email/username
  nombre?: string; // Nombre del usuario
  fotoPerfilUrl?: string; // <-- NUEVO CAMPO OPCIONAL
  exp?: number;
  iat?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private apiUrl = '/auth'; // Ruta base para auth
  private perfilApiUrl = '/api/perfil'; // Ruta base para perfil
  private readonly TOKEN_KEY = 'authToken';
  public logoutEvent = new EventEmitter<void>();

  // Inyección de HttpClient
  private http = inject(HttpClient);

  // Signal para el estado de login
  private loggedInStatus = signal<boolean>(false);
  public isLoggedIn$ = this.loggedInStatus.asReadonly(); // No necesita ser observable si usas el signal directamente

  // Signals para el token y datos del usuario decodificados
  private currentUserToken = signal<string | null>(null);
  public currentUser = computed<JwtPayload | null>(() => {
    const token = this.currentUserToken();
    if (token) {
      return this.decodeToken(token);
    }
    return null;
  });
  // Signals computados específicos (más fácil de usar)
  public currentUserName = computed<string | null>(() => this.currentUser()?.nombre ?? this.currentUser()?.sub ?? null);
  public currentUserEmail = computed<string | null>(() => this.currentUser()?.sub ?? null);
  public currentUserFotoUrl = computed<string | null>(() => this.currentUser()?.fotoPerfilUrl ?? null); // <-- NUEVO SIGNAL COMPUTADO

  private destroy$ = new Subject<void>();

  constructor() {
    // Solo actualiza el estado si estamos en el navegador
    if (typeof localStorage !== 'undefined') {
      this.updateLoginStatus(); // Actualiza estado al iniciar
      window.addEventListener('storage', this.handleStorageChange.bind(this)); // Escucha cambios
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof window !== 'undefined') {
       window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  // Decodifica el payload del JWT
  private decodeToken(token: string): JwtPayload | null {
     if (typeof atob === 'undefined') return null;
     try {
       const payloadBase64 = token.split('.')[1];
       if (!payloadBase64) return null;
       const payloadDecoded = atob(payloadBase64);
       const payload = JSON.parse(payloadDecoded) as JwtPayload;
       console.log("Decoded Payload:", payload); // Para depurar
       return payload;
     } catch (error) {
       console.error('Error decodificando el token:', error);
       this.clearToken(); // Limpia token inválido
       return null;
     }
  }

  // Actualiza los signals basados en localStorage
  private updateLoginStatus(): void {
     if (typeof localStorage === 'undefined') return;
     const token = localStorage.getItem(this.TOKEN_KEY);
     this.currentUserToken.set(token);
     this.loggedInStatus.set(!!token);
     console.log('AuthService: Login status updated:', this.loggedInStatus());
     console.log('AuthService: Current user data:', this.currentUser()); // Log para depurar datos decodificados
  }

  // Limpia el token y actualiza signals
  private clearToken(): void {
     if (typeof localStorage === 'undefined') return;
     localStorage.removeItem(this.TOKEN_KEY);
     this.updateLoginStatus();
  }

  // Guarda el token y actualiza signals
  private saveToken(token: string): void {
     if (typeof localStorage === 'undefined') return;
     localStorage.setItem(this.TOKEN_KEY, token);
     this.updateLoginStatus();
  }

  // --- Métodos de Autenticación ---

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.saveToken(response.token)),
      catchError(err => this.handleError(err, 'registro')) // Usa manejador de errores
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.saveToken(response.token)),
      catchError(err => this.handleError(err, 'login')) // Usa manejador de errores
    );
  }

  logout(): void {
    this.clearToken();
    this.logoutEvent.emit();
    console.log('Usuario deslogueado.');
  }

  getToken(): string | null {
     if (typeof localStorage === 'undefined') return null;
     return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.loggedInStatus();
  }

  // --- Métodos de Perfil ---

  // Refresca los datos del usuario localmente a partir de un nuevo token
  // Útil después de actualizar el perfil si el backend devuelve el token actualizado
  private refreshUserDataFromToken(newToken: string): void {
      console.log("Refrescando datos del usuario con nuevo token...");
      this.saveToken(newToken); // Esto guarda Y actualiza los signals
  }

  actualizarNombre(nuevoNombre: string): Observable<AuthResponse> { // Espera AuthResponse con el nuevo token
    return this.http.put<AuthResponse>(`${this.perfilApiUrl}/nombre`, { nombre: nuevoNombre }).pipe(
       tap(response => this.refreshUserDataFromToken(response.token)), // Refresca con el nuevo token
       catchError(err => this.handleError(err, 'actualizar nombre'))
    );
  }

  // ***** CAMBIO AQUÍ *****
  cambiarContrasena(actual: string, nueva: string): Observable<string> { // Cambiado a Observable<string>
     // Añadido { responseType: 'text' }
     return this.http.put(`${this.perfilApiUrl}/contrasena`, { actual, nueva }, { responseType: 'text' }).pipe(
        tap(responseText => console.log('Respuesta del backend (cambio contraseña):', responseText)), // Opcional: loguear la respuesta de texto
        catchError(err => this.handleError(err, 'cambiar contraseña'))
     );
  }
  // ***** FIN DEL CAMBIO *****

  subirFotoPerfil(archivo: File): Observable<AuthResponse> { // Espera AuthResponse con el nuevo token
     const formData = new FormData();
     formData.append('file', archivo, archivo.name); // 'file' coincide con @RequestParam("file")
     return this.http.post<AuthResponse>(`${this.perfilApiUrl}/foto`, formData).pipe(
        tap(response => this.refreshUserDataFromToken(response.token)), // Refresca con el nuevo token
        catchError(err => this.handleError(err, 'subir foto'))
     );
  }

  eliminarFotoPerfil(): Observable<AuthResponse> { // Espera AuthResponse con el nuevo token (sin fotoUrl)
     return this.http.delete<AuthResponse>(`${this.perfilApiUrl}/foto`).pipe(
        tap(response => this.refreshUserDataFromToken(response.token)), // Refresca con el nuevo token
        catchError(err => this.handleError(err, 'eliminar foto'))
     );
  }


  // Manejador de errores centralizado
  private handleError(error: HttpErrorResponse, context: string = 'desconocido'): Observable<never> {
    console.error(`Error en ${context}:`, error); // Log original del error para depuración interna
    let userMessage = `Ocurrió un error en la operación (${context}). Intenta de nuevo.`; // Mensaje genérico por defecto

    if (error.status === 0) {
        // Error de conexión (el servidor no responde o problema de red)
        userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
    } else if (error.status === 401 || error.status === 403) {
      // Errores de autenticación/autorización
      userMessage = 'Tu sesión ha expirado o no tienes permiso. Por favor, inicia sesión de nuevo.';
      // Considera desloguear al usuario aquí si quieres forzar un nuevo login
      // this.logout();
    } else if (error.status === 404) {
      // Recurso no encontrado
      userMessage = 'El recurso solicitado no fue encontrado en el servidor.';
    } else if (error.status === 400) {
        // Errores del lado del cliente enviados por el backend (ej. validación, contraseña incorrecta)
        if (typeof error.error === 'string' && error.error.length < 100) { // Si es un string simple
            userMessage = error.error; // Mostrar directamente el mensaje del backend
        } else if (error.error && typeof error.error.message === 'string') { // Si es un objeto JSON con propiedad 'message'
             userMessage = error.error.message;
        } else {
             // Mensaje genérico para 400 si el formato no es esperado
            userMessage = `Datos inválidos (${context}). Verifica la información ingresada.`;
        }
    } else if (error.status >= 500) {
      // Errores internos del servidor
      userMessage = 'Ocurrió un error inesperado en el servidor. Por favor, intenta más tarde.';
    }
    // else { // Otros códigos de error (4xx no cubiertos antes, etc.)
    //    userMessage = `Error ${error.status}: ${error.statusText}. Intenta de nuevo.`;
    // }

    // Devuelve un observable que emite un *nuevo* Error con el mensaje amigable
    return throwError(() => new Error(userMessage));
  }


  // Manejador para cambios en localStorage
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.TOKEN_KEY) {
      console.log('AuthService: Storage change detectado para el token.');
      this.updateLoginStatus();
    }
  }
}