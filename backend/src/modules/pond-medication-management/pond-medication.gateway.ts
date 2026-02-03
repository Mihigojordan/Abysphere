import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PondMedicationGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(record: any) {
    this.server.emit('pondMedicationCreated', record);
  }

  emitUpdated(record: any) {
    this.server.emit('pondMedicationUpdated', record);
  }

  emitDeleted(id: string) {
    this.server.emit('pondMedicationDeleted', id);
  }
}
