import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Column {
  @Prop({ type: Types.ObjectId, ref: 'Board', index: true, required: true })
  boardId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  position!: number; // orden de la columna
}

export type ColumnDocument = HydratedDocument<Column>;
export const ColumnSchema = SchemaFactory.createForClass(Column);
