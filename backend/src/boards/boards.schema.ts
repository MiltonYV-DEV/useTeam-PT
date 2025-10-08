import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  name!: string;
}

export type BoardDocument = HydratedDocument<Board>;
export const BoardSchema = SchemaFactory.createForClass(Board);
