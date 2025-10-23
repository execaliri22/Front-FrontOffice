import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,     // <-- Para usar *ngIf en el HTML
    RouterOutlet,     // <-- Para que funcionen las rutas
    RouterLink,       // <-- Para los enlaces
    RouterLinkActive  // <-- Para marcar el enlace activo
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  constructor(public authService: AuthService, private router: Router) {
    // Escucha los cambios de logout para redirigir
    this.authService.logoutEvent.subscribe(() => {
      this.router.navigate(['/auth']);
    });
  }
}