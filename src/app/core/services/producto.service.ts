import { Injectable, inject } from '@angular/core'; // Usar inject
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = '/api/productos'; // Usa proxy
  private http = inject(HttpClient); // Inyección simplificada

  // GET /api/productos (Ya existente)
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  // GET /api/productos/{id} (Ya existente)
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODO AÑADIDO ---
  // GET /api/productos/categoria/{idCategoria}
  getProductosPorCategoria(idCategoria: number): Observable<Producto[]> {
    // Llama al endpoint del backend que filtra por categoría
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${idCategoria}`);
  }
}