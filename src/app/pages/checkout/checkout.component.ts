import { Component } from '@angular/core';
import { PedidoService } from '../../core/services/pedido.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true, 
  imports: [], 
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {

  constructor(private pedidoService: PedidoService, private router: Router) {}

  // (Diagrama: Realizar compra)
  pagar() {
    // 1. Simulación de pasarela de pago
    const tokenSimulado = 'tok_stripe_simulado';
    
    // 2. Simulamos ID del pedido (debería venir del carrito/backend)
    const pedidoIdSimulado = 1; 

    this.pedidoService.procesarPago(pedidoIdSimulado, tokenSimulado).subscribe({
      next: (respuesta) => {
        alert('¡Pago Exitoso! ' + respuesta);
        this.router.navigate(['/historial']);
      },
      error: (err) => {
        // El backend devuelve un texto de error, no un JSON
        alert('Error en el pago: ' + (err.error || 'Error desconocido')); 
      }
    });
  }
}
