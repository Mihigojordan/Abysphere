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
export class CompanyGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🏢 Company client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Company client disconnected: ${client.id}`);
  }

  // Emit events to frontend
  emitCompanyCreated(company: any) {
    this.server.emit('companyCreated', company);
  }

  emitCompanyUpdated(company: any) {
    this.server.emit('companyUpdated', company);
  }

  emitCompanyDeleted(companyId: string) {
    this.server.emit('companyDeleted', { id: companyId });
  }
}
