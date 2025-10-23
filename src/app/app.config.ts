import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http'; // Usa provideHttpClient y withInterceptors
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideClientHydration } from '@angular/platform-browser'; // Para SSR Hydration
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authGuard } from './core/guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Configura las rutas
    provideRouter(routes),

    // 2. Habilita Hydration (mejora rendimiento SSR)
    provideClientHydration(),

    // 3. Configura el cliente HTTP y el Interceptor (nueva forma)
    provideHttpClient(withInterceptors([authInterceptor])),

    // 4. Configura los módulos de formularios globalmente
    importProvidersFrom(FormsModule, ReactiveFormsModule),

    // 5. El guard no se añade aquí (es un CanActivateFn); úsalo en las rutas con `canActivate`
     // 6. Módulo de animaciones (opcional pero recomendado)
    importProvidersFrom(BrowserAnimationsModule)
  ]
};
