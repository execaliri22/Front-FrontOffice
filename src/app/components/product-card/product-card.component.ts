import { Component, Input, inject, signal, computed, OnInit } from '@angular/core'; // Importar OnInit
import { Producto } from '../../core/models/models';
import { CarritoService } from '../../core/services/carrito.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoritoService } from '../../core/services/favorito.service'; // <-- IMPORTAR FavoritoService

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
  // changeDetection: ChangeDetectionStrategy.OnPush // Puedes añadir OnPush si quieres optimizar
})
export class ProductCardComponent implements OnInit { // Implementar OnInit
  @Input({ required: true }) producto!: Producto; // Usar Input requerido

  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private favoritoService = inject(FavoritoService); // <-- Inyectar FavoritoService

  public agregando = signal(false);
  public errorAgregar: string | null = null;
  public procesandoFavorito = signal(false); // Signal para feedback visual de favoritos

  // Signal computado para saber si es favorito (lee del servicio)
  public esFavorito = computed(() =>
    this.producto ? this.favoritoService.esFavorito(this.producto.idProducto) : false
  );

  ngOnInit(): void {
      // Puedes inicializar algo aquí si fuera necesario al recibir el Input producto
      // console.log('ProductCard init:', this.producto?.nombre);
  }

  agregarAlCarrito(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      this.router.navigate(['/auth']);
      return;
    }

    this.agregando.set(true);
    this.errorAgregar = null;
    console.log(`Agregando: ${this.producto.nombre}`);

    this.carritoService.agregarItem(this.producto.idProducto, 1).subscribe({
      next: (_carritoActualizado) => {
        console.log(`${this.producto.nombre} añadido al carrito.`);
        this.agregando.set(false);
      },
      error: (err) => {
        console.error('Error al añadir producto:', err);
        this.errorAgregar = err.message || 'Error al añadir el producto.';
        this.agregando.set(false);
      }
    });
  }

  // Método ACTUALIZADO para manejar el clic en el botón de favoritos
  toggleFavorito(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para gestionar tus favoritos.');
      this.router.navigate(['/auth']);
      return;
    }

    this.procesandoFavorito.set(true); // Indica que se está procesando
    const currentlyFavorite = this.esFavorito();
    const productId = this.producto.idProducto;
    const action = currentlyFavorite ? 'eliminar' : 'agregar';

    const request$ = currentlyFavorite
      ? this.favoritoService.eliminarFavorito(productId)
      : this.favoritoService.agregarFavorito(productId);

    request$.subscribe({
      next: () => {
        console.log(`Producto ${productId} ${currentlyFavorite ? 'eliminado de' : 'agregado a'} favoritos.`);
        this.procesandoFavorito.set(false);
        // El signal 'esFavorito' se actualizará automáticamente porque lee del servicio
      },
      error: (err) => {
        console.error(`Error al ${action} favorito:`, err);
        alert(`Error al ${action} favorito: ${err.message || 'Error desconocido'}`);
        // No necesitamos revertir el estado aquí, ya que 'esFavorito' lee directamente del servicio,
        // y el servicio no se actualizó debido al error.
        this.procesandoFavorito.set(false);
      }
    });
  }
}