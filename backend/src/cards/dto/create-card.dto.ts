import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateCardDto {
  @IsMongoId()
  boardId!: string;

  @IsMongoId()
  columnId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  position?: number; // si no viene, el servicio asigna 100, 200...
}
