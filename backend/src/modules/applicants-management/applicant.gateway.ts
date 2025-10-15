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
export class ApplicantGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Applicant client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Applicant client disconnected: ${client.id}`);
  }

  emitApplicantCreated(applicant: any) {
    this.server.emit('applicantCreated', applicant);
  }

  emitApplicantUpdated(applicant: any) {
    this.server.emit('applicantUpdated', applicant);
  }

  emitApplicantDeleted(applicantId: string) {
    this.server.emit('applicantDeleted', { id: applicantId });
  }
}
