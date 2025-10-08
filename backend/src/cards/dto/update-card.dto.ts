import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  version: number; // version actual de la card
}
