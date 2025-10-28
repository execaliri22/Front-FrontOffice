import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common'; // NgOptimizedImage añadido

// Validador personalizado para contraseñas
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('nueva');
  const confirmar = control.get('confirmar');
  // Solo valida si ambos campos tienen valor
  return nueva && confirmar && nueva.value && confirmar.value && nueva.value !== confirmar.value ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage], // NgOptimizedImage añadido
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Añadir OnPush
})
export class PerfilComponent implements OnInit {
  // Inyección de dependencias
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Formularios reactivos
  nombreForm!: FormGroup;
  contraForm!: FormGroup;

  // Signals para manejar estados de la UI
  guardandoNombre = signal(false);
  guardandoContra = signal(false);
  subiendoFoto = signal(false);
  eliminandoFoto = signal(false); // Signal para eliminar foto
  errorNombre = signal<string | null>(null);
  errorContra = signal<string | null>(null);
  errorFoto = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  selectedFile: File | null = null;
  objectUrl = signal<string | null>(null); // Signal para la URL de vista previa

  ngOnInit(): void {
    // Inicializar formulario de nombre con el valor actual del signal
    this.nombreForm = this.fb.group({
      nombre: [this.authService.currentUserName() || '', Validators.required]
    });

    // Inicializar formulario de contraseña
    this.contraForm = this.fb.group({
      actual: ['', Validators.required],
      nueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required]
    }, { validators: passwordsMatchValidator }); // Aplica validador al grupo
  }

  // Obtiene iniciales para el placeholder
  getUserInitials(): string {
    const name = this.authService.currentUserName();
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1 && name.length >= 2) return name.substring(0, 2).toUpperCase();
    if (parts.length === 1 && name.length === 1) return name.toUpperCase();
    return '??';
  }

  // Maneja la selección de archivo y muestra vista previa
  onFileSelected(event: Event): void {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files[0]) {
       this.selectedFile = input.files[0];
       // Limpiar URL anterior si existe
       if (this.objectUrl()) {
         URL.revokeObjectURL(this.objectUrl()!);
       }
       // Crear y asignar nueva URL para vista previa
       this.objectUrl.set(URL.createObjectURL(this.selectedFile));
       this.subirFoto(); // Llama a subir inmediatamente
       input.value = ''; // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
     } else {
         this.selectedFile = null;
         this.objectUrl.set(null);
     }
  }

  // Sube la foto seleccionada al backend
   subirFoto(): void {
     if (!this.selectedFile) return;

     this.subiendoFoto.set(true);
     this.errorFoto.set(null);
     this.mensajeExito.set(null);

     this.authService.subirFotoPerfil(this.selectedFile).subscribe({
       next: (response) => { // El backend devuelve AuthResponse con el nuevo token
         this.mensajeExito.set('Foto de perfil actualizada.');
         this.selectedFile = null;
         this.objectUrl.set(null); // Limpia la vista previa
         // AuthService ya refrescó los datos al recibir el nuevo token
       },
       error: (err: Error) => { // Captura el error procesado por handleError
           this.errorFoto.set(err.message || 'Error desconocido al subir la foto.');
           this.objectUrl.set(null); // Limpia vista previa en error también
       },
       complete: () => this.subiendoFoto.set(false)
     });
   }

   // Elimina la foto de perfil
   eliminarFoto(): void {
      if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return;

      this.eliminandoFoto.set(true);
      this.errorFoto.set(null);
      this.mensajeExito.set(null);

      this.authService.eliminarFotoPerfil().subscribe({
         next: (response) => { // El backend devuelve AuthResponse con el nuevo token
            this.mensajeExito.set('Foto de perfil eliminada.');
            this.objectUrl.set(null); // Limpia la vista previa si existía
             // AuthService ya refrescó los datos
         },
         error: (err: Error) => this.errorFoto.set(err.message || 'Error desconocido al eliminar la foto.'),
         complete: () => this.eliminandoFoto.set(false)
      });
   }

  // Actualiza el nombre del usuario
  actualizarNombre(): void {
    if (this.nombreForm.invalid || this.guardandoNombre()) return;
    this.guardandoNombre.set(true);
    this.errorNombre.set(null);
    this.mensajeExito.set(null);

    const nuevoNombre = this.nombreForm.value.nombre.trim();
    this.authService.actualizarNombre(nuevoNombre).subscribe({
      next: (response) => { // El backend devuelve AuthResponse
         this.mensajeExito.set('Nombre actualizado correctamente.');
         // AuthService ya refrescó los datos
         this.nombreForm.reset({ nombre: nuevoNombre }); // Actualiza valor del form sin ensuciarlo
         this.nombreForm.markAsPristine(); // Marcar como no modificado
      },
      error: (err: Error) => this.errorNombre.set(err.message || 'Error desconocido al actualizar el nombre.'),
      complete: () => this.guardandoNombre.set(false)
    });
  }

  // Cambia la contraseña del usuario
  cambiarContrasena(): void {
    if (this.contraForm.invalid || this.guardandoContra()) return;
    this.guardandoContra.set(true);
    this.errorContra.set(null);
    this.mensajeExito.set(null);

    const { actual, nueva } = this.contraForm.value;
    this.authService.cambiarContrasena(actual, nueva).subscribe({
      next: () => {
         this.mensajeExito.set('Contraseña cambiada correctamente.');
         this.contraForm.reset(); // Limpia el formulario
         this.contraForm.markAsPristine(); // Marcar como no modificado
         this.contraForm.markAsUntouched(); // Marcar como no tocado
      },
      error: (err: Error) => this.errorContra.set(err.message || 'Error desconocido al cambiar la contraseña.'),
      complete: () => this.guardandoContra.set(false)
    });
  }
}