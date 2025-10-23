// --- Modelos (Entidades de Java) ---
export interface Categoria { 
  idCategoria: number; 
  nombre: string; 
}

export interface Producto {
  idProducto: number;
  sku: string;
  ean: string;
  urlImagen: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: Categoria;
}

export interface ItemCarrito {
  id: number;
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface Carrito {
  idCarrito: number;
  fechaCreacion: Date;
  usuario: any; // Simplificado
  items: ItemCarrito[];
}

export interface Pedido {
  idPedido: number;
  fecha: Date;
  total: number;
  estado: string;
  items: any[]; // Simplificado
}

// --- DTOs (Records de Java) ---
export interface AuthResponse { 
  token: string; 
}

export interface LoginRequest {
  email?: string | null;
  password?: string | null;
}

export interface RegisterRequest {
  nombre?: string | null;
  email?: string | null;
  password?: string | null;
  direccion?: string | null;
}