import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HorarioAtencionDocument = HorarioAtencion & Document;
export type RestauranteDocument = Restaurante & Document;

@Schema()
export class HorarioAtencion {
  @Prop({ required: true })
  dia: string;

  @Prop({ required: true })
  apertura: string;

  @Prop({ required: true })
  cierre: string;
}

const HorarioAtencionSchema = SchemaFactory.createForClass(HorarioAtencion);

@Schema()
export class Restaurante {
  @Prop({ required: true })
  restauranteId: number; // ID del restaurante en SQL

  @Prop({ type: [HorarioAtencionSchema], default: [] })
  horarioAtencion: HorarioAtencion[];
}

export const RestauranteSchema = SchemaFactory.createForClass(Restaurante);
