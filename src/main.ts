import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Importa la configuración principal
import { AppComponent } from './app/app.component';

// Arranca la aplicación usando SOLO la configuración de app.config.ts
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));