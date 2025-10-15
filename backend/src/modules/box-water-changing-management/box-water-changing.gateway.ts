import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class LaboratoryBoxWaterChangingGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(record: any) {
    this.server.emit('waterChangeCreated', record);
  }

  emitUpdated(record: any) {
    this.server.emit('waterChangeUpdated', record);
  }

  emitDeleted(id: string) {
    this.server.emit('waterChangeDeleted', id);
  }
}
