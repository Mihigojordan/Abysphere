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
export class JobGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Job client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Job client disconnected: ${client.id}`);
  }

  emitJobCreated(job: any) {
    this.server.emit('jobCreated', job);
  }

  emitJobUpdated(job: any) {
    this.server.emit('jobUpdated', job);
  }

  emitJobDeleted(jobId: string) {
    this.server.emit('jobDeleted', { id: jobId });
  }
}
