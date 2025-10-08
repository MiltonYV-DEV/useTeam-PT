import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  // Crear tarjeta
  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.cards.create(dto);
  }

  // Actualizar titulo/descripcion (control de version)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cards.update(id, dto);
  }

  // Mover tarjeta entre columnas/posiciones
  @Patch(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveCardDto) {
    return this.cards.move(id, dto);
  }
}
