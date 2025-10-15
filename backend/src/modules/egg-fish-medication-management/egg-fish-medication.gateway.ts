import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EggFishMedicationGateway {
  @WebSocketServer()
  server: Server;

  broadcastChange(event: 'create' | 'update' | 'delete', payload: any) {
    this.server.emit(`eggFishMedication.${event}`, payload);
  }
}
