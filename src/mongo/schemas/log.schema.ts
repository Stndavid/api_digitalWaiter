import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true, enum: ['info', 'warn', 'error'] })
  nivel: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop()
  usuarioId?: number;

  @Prop({ type: Object })
  meta?: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);