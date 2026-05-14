import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PermissionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Permission socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Permission socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinEmployeeRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { employeeId: string },
  ) {
    if (data?.employeeId) {
      client.join(`employee:${data.employeeId}`);
    }
  }

  emitPermissionsUpdated(employeeId: string, permissions: any[]) {
    this.server.to(`employee:${employeeId}`).emit('permissionsUpdated', permissions);
  }
}
