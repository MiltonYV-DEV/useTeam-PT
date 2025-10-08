import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'Board', index: true, required: true })
  boardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Column', index: true, required: true })
  columnId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, index: true })
  position: number;

  @Prop({ default: 0 })
  version: number;
}

export type CardDocument = HydratedDocument<Card>;
export const CardSchema = SchemaFactory.createForClass(Card);

// Indices compuestos recomendados
CardSchema.index({ boardId: 1, columnId: 1, position: 1 });
CardSchema.index({ boardId: 1, position: 1 });
