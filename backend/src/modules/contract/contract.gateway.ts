import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server , Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ContractGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  emitContractCreated(contract: any) {
    this.server.emit('contractCreated', contract);
  }

  emitContractUpdated(contract: any) {
    this.server.emit('contractUpdated', contract);
  }

  emitContractDeleted(contractId: string) {
    this.server.emit('contractDeleted', { id: contractId });
  }
}
