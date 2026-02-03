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
export class AssetGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Asset client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Asset client disconnected: ${client.id}`);
  }

  emitAssetCreated(asset: any) {
    this.server.emit('assetCreated', asset);
  }

  emitAssetUpdated(asset: any) {
    this.server.emit('assetUpdated', asset);
  }

  emitAssetDeleted(assetId: string) {
    this.server.emit('assetDeleted', { id: assetId });
  }

  emitAssetStatusChanged(assetId: string, status: string) {
    this.server.emit('assetStatusChanged', { id: assetId, status });
  }
}
