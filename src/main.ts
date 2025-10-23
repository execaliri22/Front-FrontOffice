import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; 
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { authGuard } from './app/core/guards/auth.guard';

// Arranca la aplicación Standalone
bootstrapApplication(AppComponent, {
  providers: [
    // 1. Configura las rutas
    provideRouter(routes),
    
    // 2. Configura el cliente HTTP y el Interceptor
    importProvidersFrom(HttpClientModule),
    // Para interceptores funcionales en Angular 16+, usar directamente el interceptor en la configuración de importProvidersFrom
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    },

    // 3. Configura los módulos de formularios globalmente
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    
    // 4. Configura el Guard
    // El guard se debe configurar en las rutas, no como provider global
    // Elimina esta línea y asegúrate de que authGuard esté en la configuración de rutas en app.routes.ts

    // 5. Módulo de animaciones (opcional pero recomendado)
    importProvidersFrom(BrowserAnimationsModule)
  ]
}).catch(err => console.error(err));