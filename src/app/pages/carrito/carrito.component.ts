import { Component, OnInit, inject } from '@angular/core';
import { CarritoService } from '../../core/services/carrito.service';
import { Carrito, ItemCarrito } from '../../core/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | async, | currency
import { RouterLink } from '@angular/router';   // Para routerLink

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  // Inyecta el servicio
  private carritoService = inject(CarritoService);

  // Usa el observable público del servicio
  public carrito$: Observable<Carrito | null> = this.carritoService.carrito$;
  public error: string | null = null; // Para mostrar errores

  ngOnInit(): void {
    // El servicio ya se encarga de cargar el carrito si el usuario está logueado
    // No necesitamos llamar a getCarrito() aquí explícitamente si el servicio lo maneja
  }

  // Llama al método del servicio para eliminar
  eliminarItem(itemId: number): void {
     this.error = null; // Resetea error
    // El servicio ahora devuelve Observable<void>, nos suscribimos para ejecutarlo
    this.carritoService.eliminarItem(itemId).subscribe({
      // El servicio ya recarga el carrito en el 'tap', no necesitamos hacer nada aquí
      next: () => console.log(`Solicitud para eliminar ítem ${itemId} enviada.`),
      error: (err) => {
        console.error('Error al eliminar ítem:', err);
        this.error = err.message || 'Error al eliminar el producto.';
        // Podrías querer recargar el carrito aquí también por si el estado local se desincronizó
        // this.carritoService.cargarCarritoInicial();
      }
    });
  }

  // Llama al método del servicio para actualizar
  actualizarCantidad(item: ItemCarrito, nuevaCantidadStr: string): void {
    this.error = null; // Resetea error
    const nuevaCantidad = parseInt(nuevaCantidadStr, 10);

    // Validación simple
    if (isNaN(nuevaCantidad)) {
        console.error('Cantidad inválida:', nuevaCantidadStr);
        this.error = 'Por favor, ingresa un número válido.';
        // Opcional: podrías resetear el valor del input al valor anterior de item.cantidad
        return;
    }

    // Llama al servicio (devuelve Observable<Carrito | null>)
    this.carritoService.actualizarCantidad(item.id, nuevaCantidad).subscribe({
      // El servicio ya actualiza el carritoSubject en el 'tap' (o recarga si se eliminó)
      next: (carritoActualizado) => {
          if (carritoActualizado) {
              console.log(`Cantidad del ítem ${item.id} actualizada a ${nuevaCantidad}.`);
          } else {
              console.log(`Ítem ${item.id} eliminado al actualizar cantidad a ${nuevaCantidad}.`);
          }
      },
      error: (err) => {
        console.error(`Error al actualizar cantidad del ítem ${item.id}:`, err);
        this.error = err.message || `Error al actualizar la cantidad.`;
        // Recargar el carrito para asegurar consistencia tras el error
        // this.carritoService.cargarCarritoInicial();
      }
    });
  }

  // Calcula el total directamente desde los ítems del carrito actual
  calcularTotal(items: ItemCarrito[] | undefined | null): number {
    if (!items) return 0;
    return items.reduce((total, item) => total + item.subtotal, 0);
  }
}