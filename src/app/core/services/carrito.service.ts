import { Injectable, inject, OnDestroy } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, BehaviorSubject, throwError, tap, catchError, Subject, takeUntil, map } from 'rxjs';

import { Carrito, ItemCarrito } from '../models/models';

import { AuthService } from './auth.service'; // Para saber si está logueado y reaccionar a login/logout



// Coincide con los 'record' del backend

interface AddItemRequest {

  idProducto: number;

  cantidad: number;

}

interface UpdateQuantityRequest {

    cantidad: number;

}



@Injectable({ providedIn: 'root' })

export class CarritoService implements OnDestroy {

  private apiUrl = '/carrito'; // URL base para endpoints del carrito (usará proxy)

  private http = inject(HttpClient);

  private authService = inject(AuthService);



  // BehaviorSubject para mantener el estado actual del carrito

  // Iniciamos con null

  private carritoSubject = new BehaviorSubject<Carrito | null>(null);

  public carrito$ = this.carritoSubject.asObservable(); // Observable público



  // Subject para manejar la desuscripción

  private destroy$ = new Subject<void>();



  constructor() {

    // Escucha cambios en el estado de login

    this.authService.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((loggedIn: any) => {

      if (loggedIn) {

        this.cargarCarritoInicial(); // Carga el carrito si el usuario inicia sesión

      } else {

        this.limpiarCarritoLocal(); // Limpia el carrito si el usuario cierra sesión

      }

    });



     // Carga inicial por si la página se recarga y el usuario ya está logueado

     if (this.authService.isLoggedIn()) {

        this.cargarCarritoInicial();

     }

  }



  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }



  // --- Métodos Públicos ---



  // GET /carrito - Carga el carrito desde el backend y actualiza el Subject

  public cargarCarritoInicial(): void {

    // No hacer nada si no está logueado (aunque el interceptor bloquearía la petición)

    if (!this.authService.isLoggedIn()) {

        console.warn('Intento de cargar carrito sin estar logueado.');

        this.carritoSubject.next(null); // Asegura que el carrito esté vacío localmente

        return;

    }



    this.http.get<Carrito>(this.apiUrl).pipe(

      tap(carrito => console.log('Carrito cargado:', carrito)), // Para depuración

      catchError(err => this.handleError(err, 'cargarCarritoInicial'))

    ).subscribe({

        next: carrito => this.carritoSubject.next(carrito),

        error: () => this.carritoSubject.next(null) // En caso de error, emitir null

    });

  }



  // POST /carrito - Agrega ítem

  agregarItem(idProducto: number, cantidad: number): Observable<Carrito> {

    if (!this.authService.isLoggedIn()) {

      return throwError(() => new Error('Usuario no autenticado. Inicia sesión para agregar productos.'));

    }

    const request: AddItemRequest = { idProducto, cantidad };

    return this.http.post<Carrito>(this.apiUrl, request).pipe(

      tap(carritoActualizado => {

        console.log('Ítem agregado, carrito actualizado:', carritoActualizado); // Depuración

        this.carritoSubject.next(carritoActualizado); // Actualiza el estado local

      }),

      catchError(err => this.handleError(err, 'agregarItem'))

    );

  }



  // PUT /carrito/items/{idItemCarrito} - Actualiza cantidad

  actualizarCantidad(idItemCarrito: number, nuevaCantidad: number): Observable<Carrito | null> {

     if (!this.authService.isLoggedIn()) {

      return throwError(() => new Error('Usuario no autenticado.'));

    }

    const request: UpdateQuantityRequest = { cantidad: nuevaCantidad };

    // Si la cantidad es <= 0, el backend lo manejará como eliminación (204)

    // Usamos { observe: 'response', responseType: 'json' } para poder leer el status 204

    return this.http.put<Carrito>(`${this.apiUrl}/items/${idItemCarrito}`, request, { observe: 'response', responseType: 'json' }).pipe(

      tap(response => {

        // Si el status es 200 OK (actualización), actualizamos el subject con el body

        if (response.status === 200 && response.body) {

           console.log('Cantidad actualizada, carrito:', response.body); // Depuración

           this.carritoSubject.next(response.body);

        }

        // Si el status es 204 No Content (eliminación por cantidad <= 0), recargamos el carrito

        else if (response.status === 204) {

           console.log('Ítem eliminado por cantidad <= 0, recargando carrito...'); // Depuración

           this.cargarCarritoInicial(); // Vuelve a pedir el carrito actualizado

        }

      }),

      // Mapeamos la respuesta para devolver solo el body (o null si fue 204)

      map((response: { body: any; }) => response.body),

      catchError(err => this.handleError(err, 'actualizarCantidad'))

    );

  }



  // DELETE /carrito/items/{idItemCarrito} - Elimina ítem

  eliminarItem(idItemCarrito: number): Observable<void> {

     if (!this.authService.isLoggedIn()) {

      return throwError(() => new Error('Usuario no autenticado.'));

    }

    return this.http.delete<void>(`${this.apiUrl}/items/${idItemCarrito}`).pipe(

      tap(() => {

        console.log(`Ítem ${idItemCarrito} eliminado, recargando carrito...`); // Depuración

        // Tras eliminar, volvemos a pedir el carrito completo para actualizar el estado

        this.cargarCarritoInicial();

      }),

      catchError(err => this.handleError(err, 'eliminarItem'))

    );

  }



  // Limpia el estado local del carrito (usado en logout)

  private limpiarCarritoLocal(): void {

    this.carritoSubject.next(null);

    console.log('Carrito local limpiado.'); // Depuración

  }



  // Manejador de errores HTTP básico

  private handleError(error: HttpErrorResponse, context: string = 'desconocido'): Observable<never> {

    let errorMessage = `Error en ${context}: `;

    if (error.error instanceof ErrorEvent) {

      // Error del lado del cliente o de red

      errorMessage += `Error: ${error.error.message}`;

    } else {

      // El backend devolvió un código de error

      errorMessage += `Código ${error.status}, Body: ${error.error?.message || error.message || JSON.stringify(error.error)}`;

    }

    console.error(errorMessage, error); // Loguea el error detallado

    // Devuelve un observable con un error user-friendly

    // Podrías mapear códigos de status a mensajes específicos

    if (error.status === 401 || error.status === 403) {

         return throwError(() => new Error('No autorizado. Por favor, inicia sesión.'));

    }

     if (error.status === 404) {

         return throwError(() => new Error('Recurso no encontrado.'));

     }

    return throwError(() => new Error(`Ocurrió un error en la operación (${context}). Intenta de nuevo.`));

  }

}