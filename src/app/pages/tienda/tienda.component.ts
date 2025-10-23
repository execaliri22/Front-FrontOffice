import { Component } from '@angular/core';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-tienda',
  standalone: true, 
  imports: [
    ProductListComponent // Importa el componente hijo
  ],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent {
  // Lógica de filtros iría aquí
}