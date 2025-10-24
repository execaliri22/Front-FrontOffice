import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/models';
import { catchError } from 'rxjs/operators'; // Importar catchError
import { throwError } from 'rxjs'; // Importar throwError


@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = '/api/categorias'; // URL base para categorías (usará proxy)
  private http = inject(HttpClient);

  // GET /api/categorias
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl).pipe(
       catchError(this.handleError) // Manejo básico de errores
    );
  }

   // Manejador de errores simple
  private handleError(error: any): Observable<never> {
    console.error('Error al obtener categorías:', error);
    return throwError(() => new Error('No se pudieron cargar las categorías. Intenta de nuevo.'));
  }
}