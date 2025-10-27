import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../core/models/models';
import { FavoritoService } from '../../core/services/favorito.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component'; // Reutiliza la tarjeta
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [ CommonModule, ProductCardComponent, RouterLink ],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // OnPush para mejor rendimiento
})
export class FavoritosComponent implements OnInit {
  private favoritoService = inject(FavoritoService);

  // Observable para obtener la lista de productos favoritos
  public favoritos$: Observable<Producto[]> = this.favoritoService.favoritos$;

  ngOnInit(): void {
    // El servicio ya se encarga de cargar los favoritos al iniciar sesión
    // Si quisieras forzar recarga al visitar la página:
    // this.favoritoService.cargarFavoritosIniciales(); // Descomentar si es necesario
  }
}