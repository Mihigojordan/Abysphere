import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ClientGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  emitClientCreated(clientData: any) {
    this.server.emit('clientCreated', clientData);
  }

  emitClientUpdated(clientData: any) {
    this.server.emit('clientUpdated', clientData);
  }

  emitClientDeleted(clientId: string) {
    this.server.emit('clientDeleted', { id: clientId });
  }
}
