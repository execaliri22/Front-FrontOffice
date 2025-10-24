import { Component, OnInit, inject } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Categoria, Producto } from '../../core/models/models'; // Importa Categoria
import { CategoriaService } from '../../core/services/categoria.service'; // Importa CategoriaService
import { ProductoService } from '../../core/services/producto.service'; // Asegúrate que ProductoService esté

// Importaciones Standalone
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule, // Para *ngIf, *ngFor, | async
    ProductListComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {
  // Inyecta los servicios
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService); // Si necesitas filtrar productos aquí

  // Observables para los datos
  public categorias$: Observable<Categoria[]> | undefined;
  // Mantén productos$ si ProductListComponent lo necesita, o si filtras aquí
  public productos$: Observable<Producto[]> | undefined; // Lo obtiene ProductListComponent

  // Variable para la categoría seleccionada (opcional, para filtrar)
  categoriaSeleccionadaId: number | null = null;
  errorCategorias: string | null = null; // Para mostrar errores

  ngOnInit(): void {
    this.cargarCategorias();
    // La carga de productos la maneja ProductListComponent internamente
    // this.cargarProductos(); // Ya no es necesario aquí si ProductListComponent lo hace
    this.productos$ = this.productoService.getProductos(); // ProductListComponent lo consume
  }

  cargarCategorias(): void {
    this.errorCategorias = null; // Resetea error
    this.categorias$ = this.categoriaService.getCategorias().pipe(
      catchError(err => {
        this.errorCategorias = err.message || 'Error cargando categorías.';
        return []; // Devuelve un array vacío en caso de error para que la UI no se rompa
      })
    );
  }

  // --- Lógica de Filtros (Ejemplo básico) ---
  seleccionarCategoria(idCategoria: number | null): void {
    console.log('Categoría seleccionada:', idCategoria);
    this.categoriaSeleccionadaId = idCategoria;
    // Aquí iría la lógica para volver a cargar los productos filtrados
    // this.cargarProductosFiltrados(idCategoria);
    // O podrías pasar el ID al ProductListComponent si él maneja el filtrado
  }

  // Ejemplo si quisieras filtrar aquí (necesitarías modificar ProductoService)
  // cargarProductosFiltrados(idCategoria: number | null): void {
  //   this.productos$ = idCategoria === null
  //     ? this.productoService.getProductos()
  //     : this.productoService.getProductosPorCategoria(idCategoria); // Necesitarías crear este método
  // }
}