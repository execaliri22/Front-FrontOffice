import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Este es el nuevo estilo de Guard funcional
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio
  const router = inject(Router);         // Inyecta el router

  if (authService.isLoggedIn()) {
    return true; // El usuario está logueado, permite el acceso
  }
  
  // El usuario no está logueado, redirige a la página de login
  return router.createUrlTree(['/auth']);
};