import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  restauranteId: number;

  @IsDateString()
  fechaReservacion: Date;

  @IsInt()
  numeroPersonas: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsInt()
  @IsOptional()
  clienteId?: number; // <-- Permite asignar clienteId dinámicamente
}
