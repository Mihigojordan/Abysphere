import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class LaboratoryBoxGateway {
  @WebSocketServer()
  server: Server;

  broadcastUpdate(event: string, payload: any) {
    this.server.emit('laboratoryBoxUpdate', { event, payload });
  }
}
