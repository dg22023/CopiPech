import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Importa la función de provisión
import { importProvidersFrom } from '@angular/core'; // Importa importProvidersFrom
import { FormsModule } from '@angular/forms'; // Importa FormsModule


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // Proporciona el cliente HTTP
    importProvidersFrom(FormsModule) // Importa FormsModule para formularios reactivos
  ]
};
