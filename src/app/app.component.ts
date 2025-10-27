import { Component, inject, signal, computed } from '@angular/core'; // Añadir computed
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Inyectar servicios
  public authService = inject(AuthService); // Hacerlo público para usar isLoggedIn() en la plantilla
  private router = inject(Router);

  // Signal para la visibilidad del menú
  menuVisible = signal(false);

  // *** USA LOS SIGNALS COMPUTADOS DEL SERVICIO ***
  // No necesitas redeclararlos aquí si AuthService es público y los usas directamente en la plantilla
  // Si prefieres tenerlos en el componente (por claridad o si AuthService fuera privado):
  // userName = computed(() => this.authService.currentUserName() || 'Usuario'); // Con fallback
  // userEmail = computed(() => this.authService.currentUserEmail() || '');
  // userInitials = computed(() => { ... lógica de iniciales basada en userName() ... });

  constructor() {
    // Opcional: Cerrar menú al cambiar de ruta
    this.router.events.subscribe(() => {
      this.menuVisible.set(false);
    });
  }

  toggleMenu(): void {
    this.menuVisible.update(visible => !visible);
  }

  logout(): void {
    this.authService.logout();
    this.menuVisible.set(false); // Cierra menú
    this.router.navigate(['/auth']); // Redirige a login tras logout
  }

  // *** ¡YA NO NECESITAS LOS MÉTODOS PLACEHOLDER GETTER! ***
  // getUserName(): string { ... } --> ELIMINAR
  // getUserEmail(): string { ... } --> ELIMINAR
  // getUserInitials(): string { ... } --> ELIMINAR (o modificar para usar el signal userName)

  // Ejemplo de cómo recalcular iniciales si decides mantenerlas en el componente:
  getUserInitials(): string {
     const name = this.authService.currentUserName(); // Accede al signal del servicio
     if (!name) return '??';
     const parts = name.trim().split(' ').filter(part => part.length > 0);
     if (parts.length >= 2) {
       return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase(); // Primera letra del nombre y apellido
     } else if (parts.length === 1 && name.length >= 2) {
       return name.substring(0, 2).toUpperCase();
     } else if (parts.length === 1 && name.length === 1) {
       return name.toUpperCase();
     }
     return '??'; // Fallback
   }
}