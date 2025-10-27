import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { Producto } from '../models/models'; // Asumiendo que quieres guardar Productos
import { AuthService } from './auth.service';

// Podrías definir una interfaz si el backend devuelve el objeto Favorito completo
// interface FavoritoResponse { id: number; producto: Producto; /* ... */ }

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private apiUrl = '/favoritos'; // Usa proxy (asegúrate que esté en proxy.conf.json)
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signal para mantener la lista de IDs de productos favoritos
  private favoritoIds = signal<Set<number>>(new Set());

  // Signal computado para obtener la lista de IDs como array (más fácil de usar)
  public favoritosIds$ = computed(() => Array.from(this.favoritoIds()));

  // Opcional: BehaviorSubject si necesitas la lista completa de Productos favoritos
  private favoritosSubject = new BehaviorSubject<Producto[]>([]);
  public favoritos$ = this.favoritosSubject.asObservable();

  constructor() {
    // Reacciona a cambios de login/logout
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.cargarFavoritosIniciales();
      } else {
        this.limpiarFavoritosLocales();
      }
    });
  }

  // Carga inicial de favoritos al loguearse o recargar
  private cargarFavoritosIniciales(): void {
    this.http.get<any[]>(this.apiUrl).pipe( // Cambia 'any[]' por 'FavoritoResponse[]' si la defines
      tap(favoritosResp => console.log('Favoritos cargados:', favoritosResp)),
      map(favoritosResp => {
         // Extrae solo los productos
         const productos = favoritosResp.map(fav => fav.producto as Producto);
         // Extrae solo los IDs y actualiza el signal de IDs
         const ids = new Set(productos.map(p => p.idProducto));
         this.favoritoIds.set(ids);
         return productos; // Devuelve la lista de productos
      }),
      catchError(err => this.handleError(err, 'cargarFavoritosIniciales'))
    ).subscribe({
      next: productos => this.favoritosSubject.next(productos), // Actualiza el BehaviorSubject de productos
      error: () => {
         this.favoritosSubject.next([]); // Vacía en caso de error
         this.favoritoIds.set(new Set()); // Vacía IDs
      }
    });
  }

  // POST /favoritos/{idProducto}
  agregarFavorito(idProducto: number): Observable<any> { // Cambia 'any' por 'FavoritoResponse'
    return this.http.post<any>(`${this.apiUrl}/${idProducto}`, {}).pipe(
      tap(favoritoAgregado => {
        console.log('Producto añadido a favoritos:', favoritoAgregado);
        // Actualiza el signal de IDs añadiendo el nuevo ID
        this.favoritoIds.update(ids => ids.add(idProducto));
        // Opcional: Actualiza el BehaviorSubject de Productos (más complejo, requiere obtener el producto)
        // Podrías recargar la lista completa o añadir el producto específico si lo tienes
         this.favoritosSubject.next([...this.favoritosSubject.value, favoritoAgregado.producto]);
      }),
      catchError(err => this.handleError(err, 'agregarFavorito'))
    );
  }

  // DELETE /favoritos/{idProducto}
  eliminarFavorito(idProducto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idProducto}`).pipe(
      tap(() => {
        console.log(`Producto ${idProducto} eliminado de favoritos.`);
        // Actualiza el signal de IDs quitando el ID
        this.favoritoIds.update(ids => {
            ids.delete(idProducto);
            return ids;
        });
        // Opcional: Actualiza el BehaviorSubject de Productos
        this.favoritosSubject.next(this.favoritosSubject.value.filter(p => p.idProducto !== idProducto));
      }),
      catchError(err => this.handleError(err, 'eliminarFavorito'))
    );
  }

  // Comprueba si un producto es favorito usando el signal de IDs
  esFavorito(idProducto: number): boolean {
    return this.favoritoIds().has(idProducto);
  }

  // Limpia estado local al hacer logout
  private limpiarFavoritosLocales(): void {
    this.favoritoIds.set(new Set());
    this.favoritosSubject.next([]);
    console.log('Favoritos locales limpiados.');
  }

  // Manejador de errores
  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
    let errorMessage = `Error en ${context}: ${error.message}`;
    console.error(errorMessage, error);
    // Puedes personalizar el mensaje basado en error.status si lo necesitas
    if (error.status === 401) {
       return throwError(() => new Error('No autorizado. Inicia sesión.'));
    }
    return throwError(() => new Error(`Ocurrió un error (${context}). Intenta de nuevo.`));
  }
}