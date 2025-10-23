import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../core/services/carrito.service';
import { Carrito, ItemCarrito } from '../../core/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Para *ngIf, | async, | currency
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

  public carrito$: Observable<Carrito> | undefined;

  constructor(private carritoService: CarritoService) { }

  ngOnInit(): void {
    // (Simulado, ver CarritoService)
    this.carrito$ = this.carritoService.getCarrito();
  }

  // (Diagrama: Eliminar del carrito)
  eliminarItem(itemId: number) {
    alert(`Lógica para eliminar item ${itemId} (no implementado en backend)`);
    // this.carritoService.eliminarItem(itemId).subscribe(...);
  }

  // (Diagrama: Modificar cantidad)
  actualizarCantidad(item: ItemCarrito, nuevaCantidad: number) {
    alert(`Lógica para actualizar item ${item.id} a ${nuevaCantidad} (no implementado en backend)`);
    // this.carritoService.actualizarCantidad(item.id, nuevaCantidad).subscribe(...);
  }

  calcularTotal(items: ItemCarrito[]): number {
    if (!items) return 0;
    return items.reduce((total, item) => total + item.subtotal, 0);
  }
}