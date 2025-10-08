import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './boards.schema';
import { Column, ColumnDocument } from '../columns/column.schema';
import { Card, CardDocument } from '../cards/card.schema';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
    @InjectModel(Column.name)
    private readonly columnModel: Model<ColumnDocument>,
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
  ) {}

  /** Dev-only: crea un board demo con 3 columnas y 2 cards si no existe */
  async seedDemo() {
    let board = await this.boardModel.findOne({ name: 'Demo' });

    if (!board) {
      board = await this.boardModel.create({ name: 'Demo' });

      const cols = [
        { name: 'To Do', position: 100 },
        { name: 'In Progress', position: 200 },
        { name: 'Done', position: 300 },
      ];
      const createdCols = await this.columnModel.insertMany(
        cols.map((c) => ({ ...c, boardId: board!._id })),
      );

      const todo = createdCols.find((c) => c.name === 'To Do')!;
      await this.cardModel.insertMany([
        {
          boardId: board._id,
          columnId: todo._id,
          title: 'Configurar proyecto',
          description: 'Nest + mongo + WebSockets',
          position: 100,
          version: 0,
        },
        {
          boardId: board._id,
          columnId: todo._id,
          title: 'Disenar esquema',
          position: 200,
          version: 0,
        },
      ]);
    }
    return board;
  }

  /** Devuelve board + columnas + cards (ordenados) */
  async getHydrated(boardId: string) {
    const _id = new Types.ObjectId(boardId);
    const board = await this.boardModel.findById(_id).lean();
    if (!board) throw new NotFoundException('Board not found');

    const columns = await this.columnModel
      .find({ boardId: _id })
      .sort({ position: 1 })
      .lean();

    const cards = await this.cardModel
      .find({ boardId: _id })
      .sort({ columnId: 1, position: 1 })
      .lean();

    return { board, columns, cards };
  }
}
