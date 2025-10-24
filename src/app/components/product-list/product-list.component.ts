import { Component, Input, ChangeDetectionStrategy } from '@angular/core'; // Añadir Input y ChangeDetectionStrategy
// Quitar OnInit y Observable si ya no se usan para cargar aquí
import { Producto } from '../../core/models/models';
// Quitar ProductoService si ya no se usa aquí

// Importaciones Standalone
import { CommonModule } from '@angular/common'; // Para @if, @for
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Añadir OnPush
})
export class ProductListComponent { // Quitar OnInit si ya no se usa

  // Input para recibir los productos del padre (TiendaComponent)
  @Input() productos: Producto[] | null = null; // Acepta array o null

  // Ya no necesita cargar productos aquí, los recibe del @Input
  constructor() {} // Constructor vacío si no hay inyecciones
}