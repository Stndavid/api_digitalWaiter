import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  restauranteId: number;

  @Prop({ required: true })
  usuarioId: number;

  @Prop({ required: true, min: 1, max: 5 })
  puntuacion: number;

  @Prop({ default: '' })
  comentario: string;

  @Prop({ type: [String] })
  fotos?: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);