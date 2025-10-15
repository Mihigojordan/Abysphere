import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PondWaterChangingGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(record: any) {
    this.server.emit('pondWaterChangeCreated', record);
  }

  emitUpdated(record: any) {
    this.server.emit('pondWaterChangeUpdated', record);
  }

  emitDeleted(id: string) {
    this.server.emit('pondWaterChangeDeleted', id);
  }
}
