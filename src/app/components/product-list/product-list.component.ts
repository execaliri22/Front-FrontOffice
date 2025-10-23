import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../core/models/models';
import { ProductoService } from '../../core/services/producto.service';

// Importaciones Standalone
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | async
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true, 
  imports: [
    CommonModule,
    ProductCardComponent // Importa el componente hijo
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  
  public productos$: Observable<Producto[]> | undefined;

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.productos$ = this.productoService.getProductos();
  }
}