import { IsMongoId, IsNumber } from 'class-validator';

export class MoveCardDto {
  @IsMongoId()
  toColumnId!: string; // columna destino

  @IsNumber()
  toPosition!: number; // nueva posicion en la columna
}
