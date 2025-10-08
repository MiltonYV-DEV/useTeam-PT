import { Module } from '@nestjs/common';
import { KanbanGateway } from './kanban.gateway';

@Module({
  providers: [KanbanGateway],
  exports: [KanbanGateway], // para inyectarlo en services (CardsService)
})
export class EventsModule {}
