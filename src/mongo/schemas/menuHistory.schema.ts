import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuHistoryDocument = MenuHistory & Document;

@Schema({ timestamps: true })
export class MenuHistory {
  @Prop({ required: true })
  restauranteId: number;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Array, required: true })
  productosSnapshot: any[];

  @Prop()
  usuarioId?: number;

  @Prop({ default: '' })
  comentarios?: string;
}

export const MenuHistorySchema = SchemaFactory.createForClass(MenuHistory);