import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carrito } from '../models/models';

// Coincide con el 'record AddItemRequest' del backend
interface AddItemRequest { 
  idProducto: number; 
  cantidad: number; 
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private apiUrl = '/carrito';

  constructor(private http: HttpClient) { }

  // POST /carrito (Diagrama: Agregar producto al carrito)
  agregarItem(idProducto: number, cantidad: number): Observable<Carrito> {
    const request: AddItemRequest = { idProducto, cantidad };
    return this.http.post<Carrito>(this.apiUrl, request);
  }

  // (Simulación porque el backend no tiene GET /carrito)
  // Tu backend usa un idUsuario=1 hardcodeado, 
  // pero el interceptor ya envía el token. Deberías actualizar tu backend
  // para tomar el usuario del token en lugar de hardcodearlo.
  getCarrito(): Observable<Carrito> {
    // Simulamos una llamada al POST con 'null' para obtener el carrito actual
    return this.http.post<Carrito>(this.apiUrl, { idProducto: null, cantidad: 0 });
  }

  // (Aquí implementarías PUT y DELETE para Modificar/Eliminar)
}