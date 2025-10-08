import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card, CardDocument } from './card.schema';

import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { KanbanGateway } from '../events/kanban.gateway';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    private readonly gateway: KanbanGateway,
  ) {}

  /**
   * Crea una card si no se enia position,
   * se asigna automaticamente como el ultimo de la columna
   * */
  async create(dto: CreateCardDto) {
    const columnId = new Types.ObjectId(dto.columnId);

    // Asignar posicion por defecto: ultimo + 100
    if (dto.position == null) {
      const last = await this.cardModel
        .find({ columnId })
        .sort({ position: -1 })
        .limit(1)
        .lean();

      dto.position = last[0] ? last[0].position + 100 : 100;
    }

    const created = await this.cardModel.create({
      boardId: new Types.ObjectId(dto.boardId),
      columnId,
      title: dto.title,
      description: dto.description,
      position: dto.position,
      version: 0,
    });

    this.gateway.emitToBoard(
      String(created.boardId),
      'card.created',
      created.toObject(),
    );

    return created;
  }

  /**
   * Actualiza titulo/description con control optimista.
   * Requiere version actual del cliente; si no coincide => 409
   * */
  async update(id: string, dto: UpdateCardDto) {
    const _id = new Types.ObjectId(id);

    const updated = await this.cardModel.findOneAndUpdate(
      { _id, version: dto.version },
      {
        $set: { title: dto.title, description: dto.description },
        $inc: { version: 1 },
      },
      { new: true },
    );

    if (!updated) {
      throw new ConflictException('Version conflict or card not found ');
    }

    this.gateway.emitToBoard(
      String(updated.boardId),
      'card.updated',
      updated.toObject(),
    );
    return updated;
  }

  /**
   * Mueve una card de columna/posicion. Incrementa 'version'
   */
  async move(id: string, dto: MoveCardDto) {
    const _id = new Types.ObjectId(id);
    const card = await this.cardModel.findById(_id);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    card.columnId = new Types.ObjectId(dto.toColumnId);
    card.position = dto.toPosition;
    card.version += 1;
    await card.save();

    this.gateway.emitToBoard(String(card.boardId), 'card.moved', {
      _id: card._id,
      columnId: card.columnId,
      position: card.position,
      version: card.version,
    });

    return card;
  }

  async remove(id: string) {
    const deleted = await this.cardModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Card not found');

    // Notifica a todos en el board para refrescar
    this.gateway.emitToBoard(String(deleted.boardId), 'card.moved', {
      deletedId: id,
    });
    return { ok: true };
  }

  // Utilidad opcional: otener una card por id
  async findById(id: string) {
    const _id = new Types.ObjectId(id);
    const card = await this.cardModel.findById(_id);
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }
}
