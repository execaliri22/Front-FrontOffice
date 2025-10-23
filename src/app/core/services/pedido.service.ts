import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // 'of' para simular
import { Pedido } from '../models/models';

// Coincide con el 'record PagoRequest' del backend
interface PagoRequest { 
  pedidoId: number; 
  token: string; 
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = '/checkout';

  constructor(private http: HttpClient) { }

  // POST /checkout/pagar (Diagrama: Realizar compra -> Procesar pago)
  procesarPago(pedidoId: number, tokenStripe: string): Observable<string> {
    const request: PagoRequest = { pedidoId: pedidoId, token: tokenStripe };
    // Tu backend devuelve un ResponseEntity<String>, por eso 'responseType: text'
    return this.http.post(`${this.apiUrl}/pagar`, request, { responseType: 'text' });
  }

  // (Diagrama: Ver historial de pedidos)
  // SIMULADO, ya que tu backend no tiene un endpoint GET /pedidos
  getHistorialPedidos(): Observable<Pedido[]> {
    const historialSimulado: Pedido[] = [
      { idPedido: 1, fecha: new Date(2025, 9, 20), total: 177.97, estado: 'PAGADO', items: [] },
      { idPedido: 2, fecha: new Date(2025, 9, 21), total: 88.50, estado: 'ENVIADO', items: [] }
    ];
    return of(historialSimulado); // 'of' crea un Observable con los datos simulados.
  }
}