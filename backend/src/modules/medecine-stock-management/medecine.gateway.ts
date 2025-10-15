import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust in production for security
  },
})
export class MedicineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  // Emit events
  emitMedicineCreated(medicine: any) {
    this.server.emit('medicineCreated', medicine);
  }

  emitMedicineUpdated(medicine: any) {
    this.server.emit('medicineUpdated', medicine);
  }

  emitMedicineDeleted(id: string) {
    this.server.emit('medicineDeleted', { id });
  }
}
