import { Component, Input } from '@angular/core';
import { Producto } from '../../core/models/models';
import { CarritoService } from '../../core/services/carrito.service';

// Importaciones Standalone
import { CommonModule } from '@angular/common'; // Para *ngIf, | currency

@Component({
  selector: 'app-product-card',
  standalone: true, 
  imports: [
    CommonModule
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() producto: Producto | undefined;

  constructor(private carritoService: CarritoService) {}

  // (Diagrama: Agregar producto al carrito)
  agregarAlCarrito(): void {
    if (!this.producto) return;
    console.log(`Agregando: ${this.producto.nombre}`);
    this.carritoService.agregarItem(this.producto.idProducto, 1).subscribe({
      next: (carritoActualizado) => {
        alert(`${this.producto!.nombre} fue añadido al carrito.`);
      },
      error: (err) => {
        alert('Error al añadir producto. ¿Iniciaste sesión?');
      }
    });
  }
}