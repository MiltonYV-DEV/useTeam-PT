import { Controller, Get, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  // dev,,, crea board demo + columnas + 2 cards
  @Get('seed')
  async seedDemo() {
    const board = await this.boards.seedDemo();
    return { message: 'Seed ok', boardId: board._id };
  }

  // devuelve board + columnas + cards (ordenados)
  @Get(':id')
  getHydrated(@Param('id') id: string) {
    return this.boards.getHydrated(id);
  }
}
