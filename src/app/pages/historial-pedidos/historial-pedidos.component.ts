import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../core/services/pedido.service';
import { Pedido } from '../../core/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | async, | date

@Component({
  selector: 'app-historial-pedidos',
  standalone: true, 
  imports: [
    CommonModule
  ],
  templateUrl: './historial-pedidos.component.html',
  styleUrls: ['./historial-pedidos.component.css']
})
export class HistorialPedidosComponent implements OnInit {

  public pedidos$: Observable<Pedido[]> | undefined;

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    // (Datos simulados, ver PedidoService)
    this.pedidos$ = this.pedidoService.getHistorialPedidos();
  }
}