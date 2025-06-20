import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class HorarioAtencionDto {
  @IsString()
  dia: string;

  @IsString()
  apertura: string;

  @IsString()
  cierre: string;
}

export class CreateRestauranteDto {
  @IsString()
  nombre: string;

  @IsString()
  direccion: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioAtencionDto)
  horarioAtencion: HorarioAtencionDto[];

  ownerId?: number;
}
