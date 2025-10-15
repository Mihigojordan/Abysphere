import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins, adjust for production
  },
})
export class RequestGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  // ---------- REQUEST EVENTS ----------

  emitRequestCreated(requestData: any) {
    this.server.emit('requestCreated', requestData);
  }

  emitRequestUpdated(requestData: any) {
    this.server.emit('requestUpdated', requestData);
  }

  emitRequestApproved(requestData: any) {
    this.server.emit('requestApproved', requestData);
  }

  emitRequestRejected(requestData: any) {
    this.server.emit('requestRejected', requestData);
  }

  emitMaterialsIssued(issueData: any) {
    this.server.emit('materialsIssued', issueData);
  }

  emitMaterialsReceived(receiveData: any) {
    this.server.emit('materialsReceived', receiveData);
  }

  emitRequestClosed(requestData: any) {
    this.server.emit('requestClosed', requestData);
  }
}
