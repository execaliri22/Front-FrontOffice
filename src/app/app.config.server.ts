import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config'; // Importa la config del cliente

// Combina la configuración del cliente con la específica del servidor
export const config: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering() // Habilita el renderizado en servidor
    // provideClientHydration() NO es necesario aquí, ya viene de appConfig
  ]
});