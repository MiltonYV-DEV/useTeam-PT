import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'kanban', // ws:localhost:3000/kanban
  cors: {
    origin:
      process.env.FRONTEND_ORIGIN?.split(',').map((s) => s.trim()) ?? true,
    credentials: true,
  },
})
export class KanbanGateway {
  @WebSocketServer()
  io!: Server;

  // cliente se une a una 'room' del board
  @SubscribeMessage('joinBoard')
  handleJoin(
    @MessageBody() payload: { boardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `board:${payload.boardId}`;
    client.join(room);
    client.emit('joined', { room });
  }

  // utilidad para emitir a todos los clientes del board
  emitToBoard(boardId: string, event: string, data: any) {
    const room = `board:${boardId}`;
    this.io.to(room).emit(event, data);
  }
}
