export class CreateProductDto {
  nombre: string;
  precio: number;
  descripcion?: string;
  categoriaId: number;
  restauranteId: number;
}
