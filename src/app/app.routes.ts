import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Importamos las páginas (que ahora son standalone)
import { TiendaComponent } from './pages/tienda/tienda.component';
import { AuthComponent } from './pages/auth/auth.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { HistorialPedidosComponent } from './pages/historial-pedidos/historial-pedidos.component';

export const routes: Routes = [
  // Rutas públicas
  { path: '', redirectTo: '/tienda', pathMatch: 'full' },
  { path: 'tienda', component: TiendaComponent }, // (Ver catálogo)
  { path: 'auth', component: AuthComponent },     // (Registrarse / Iniciar sesión)
  
  // Rutas protegidas (requieren login)
  { 
    path: 'carrito', 
    component: CarritoComponent, 
    canActivate: [authGuard] // (Modificar carrito)
  },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard] // (Realizar compra)
  },
  { 
    path: 'historial', 
    component: HistorialPedidosComponent, 
    canActivate: [authGuard] // (Ver historial)
  },
  
  // Redirige cualquier otra ruta a la tienda
  { path: '**', redirectTo: '/tienda' }
];