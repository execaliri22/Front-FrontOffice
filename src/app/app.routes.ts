import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Importa los componentes
import { TiendaComponent } from './pages/tienda/tienda.component';
import { AuthComponent } from './pages/auth/auth.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { HistorialPedidosComponent } from './pages/historial-pedidos/historial-pedidos.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component'; // <-- IMPORTA EL NUEVO COMPONENTE

export const routes: Routes = [
  // Rutas públicas
  { path: '', redirectTo: '/tienda', pathMatch: 'full' },
  { path: 'tienda', component: TiendaComponent },
  { path: 'auth', component: AuthComponent },

  // Rutas protegidas
  { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'historial', component: HistorialPedidosComponent, canActivate: [authGuard] },
  { path: 'favoritos', component: FavoritosComponent, canActivate: [authGuard] }, // <-- AÑADE LA RUTA

  // Placeholder para otras rutas del menú (añade componentes cuando los crees)
  { path: 'perfil', component: TiendaComponent, canActivate: [authGuard] }, // Temporalmente redirige a tienda
  { path: 'direcciones', component: TiendaComponent, canActivate: [authGuard] }, // Temporalmente redirige a tienda
  { path: 'configuracion', component: TiendaComponent, canActivate: [authGuard] }, // Temporalmente redirige a tienda


  // Redirige cualquier otra ruta no encontrada a la tienda
  { path: '**', redirectTo: '/tienda' }
];