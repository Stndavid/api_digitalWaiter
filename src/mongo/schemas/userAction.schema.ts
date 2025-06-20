import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserActionDocument = UserAction & Document;

@Schema({ timestamps: true })
export class UserAction {
  @Prop({ required: true })
  usuarioId: number;

  @Prop({ required: true })
  accion: string; // ejemplo: 'login', 'crear_reserva', 'actualizar_perfil', etc.

  @Prop({ type: Object })
  detalles?: any; // información adicional sobre la acción
}

export const UserActionSchema = SchemaFactory.createForClass(UserAction);
