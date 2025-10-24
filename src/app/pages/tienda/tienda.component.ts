import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core'; // Importar signal y ChangeDetectionStrategy
import { catchError, Observable, of } from 'rxjs'; // Importar 'of' para manejo de error
import { Categoria, Producto } from '../../core/models/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';

// Importaciones Standalone
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule,
    ProductListComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Mejor rendimiento
})
export class TiendaComponent implements OnInit {
  // Inyecta los servicios
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);

  // Observable para las categorías
  public categorias$: Observable<Categoria[]> | undefined;
  public errorCategorias: string | null = null;

  // Signal para la categoría seleccionada (null = Todas)
  categoriaSeleccionadaId = signal<number | null>(null);

  // Observable para los productos (se actualizará reactivamente)
  public productos$: Observable<Producto[]> | undefined;

  ngOnInit(): void {
    this.cargarCategorias();
    // La carga inicial de productos se hará dentro de cargarProductos
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.errorCategorias = null;
    this.categorias$ = this.categoriaService.getCategorias().pipe(
      catchError(err => {
        this.errorCategorias = err.message || 'Error cargando categorías.';
        console.error('Error al cargar categorías:', err);
        return of([]); // Devuelve observable con array vacío en caso de error
      })
    );
  }

  // Método llamado al hacer clic en una categoría
  seleccionarCategoria(idCategoria: number | null): void {
    console.log('Categoría seleccionada:', idCategoria); // Log existente
    this.categoriaSeleccionadaId.set(idCategoria); // Actualiza el signal
    this.cargarProductos(); // Vuelve a cargar los productos con la nueva categoría
  }

  // Carga los productos basado en el valor actual del signal
  cargarProductos(): void {
      const idCat = this.categoriaSeleccionadaId();
      console.log(`Cargando productos para categoría ID: ${idCat}`); // Log existente

      // Llama al servicio correspondiente según si hay categoría seleccionada o no
      const productosObservable = idCat === null
          ? this.productoService.getProductos() // Obtiene todos
          : this.productoService.getProductosPorCategoria(idCat); // Obtiene filtrados

      // Asigna el observable a productos$ y maneja errores
      this.productos$ = productosObservable.pipe(
          catchError(err => {
              console.error(`Error al cargar productos para categoría ${idCat}:`, err);
              // Aquí podrías mostrar un mensaje de error en la UI si lo deseas
              alert(`Error al cargar productos: ${err.message || 'Error desconocido'}`); // Muestra alerta de error
              return of([]); // Devuelve observable con array vacío para que la UI no se rompa
          })
      );
  }
}