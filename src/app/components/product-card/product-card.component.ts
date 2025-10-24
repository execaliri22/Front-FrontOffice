import { Component, Input, inject } from '@angular/core';
import { Producto } from '../../core/models/models';
import { CarritoService } from '../../core/services/carrito.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Para redirigir si no está logueado
import { AuthService } from '../../core/services/auth.service'; // Para chequear login

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() producto: Producto | undefined;

  private carritoService = inject(CarritoService);
  private authService = inject(AuthService); // Inyecta AuthService
  private router = inject(Router); // Inyecta Router
  public agregando = false; // Estado para feedback visual (opcional)
  public errorAgregar: string | null = null; // Para mostrar errores

  agregarAlCarrito(): void {
    if (!this.producto) return;

    // Verifica si el usuario está logueado ANTES de llamar al servicio
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/auth']); // Redirige a login
      return;
    }

    this.agregando = true; // Indica que se está procesando (para UI)
    this.errorAgregar = null; // Resetea error
    console.log(`Agregando: ${this.producto.nombre}`);

    this.carritoService.agregarItem(this.producto.idProducto, 1).subscribe({
      next: (carritoActualizado) => {
        console.log(`${this.producto!.nombre} añadido al carrito.`);
        // Feedback visual: Podrías cambiar el texto del botón temporalmente,
        // mostrar un mensaje corto, etc. en lugar del alert.
        // Ejemplo simple: cambiar texto (requiere añadir variable al componente)
        // this.textoBoton = '¡Añadido!';
        // setTimeout(() => this.textoBoton = 'Añadir al Carrito', 1500);

        this.agregando = false;
        // alert(`${this.producto!.nombre} fue añadido al carrito.`); // QUITAMOS EL ALERT
      },
      error: (err) => {
        console.error('Error al añadir producto:', err);
        // Muestra el error específico del servicio
        this.errorAgregar = err.message || 'Error al añadir el producto.';
        // alert(this.errorAgregar); // QUITAMOS EL ALERT
        this.agregando = false;
      }
    });
  }
}