import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  usuarioId: number;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: false })
  leido: boolean;

  @Prop({ default: 'general' })
  tipo: string; // ejemplo: 'reserva', 'orden', 'promocion', etc.
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
