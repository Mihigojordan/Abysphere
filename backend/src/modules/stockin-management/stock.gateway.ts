import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins, adjust for production
  },
})
export class StockGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  // ---------- STOCK CATEGORY EVENTS ----------
  emitCategoryCreated(categoryData: any) {
    this.server.emit('categoryCreated', categoryData);
  }

  emitCategoryUpdated(categoryData: any) {
    this.server.emit('categoryUpdated', categoryData);
  }

  emitCategoryDeleted(categoryId: string) {
    this.server.emit('categoryDeleted', { id: categoryId });
  }

  // ---------- STOCK IN EVENTS ----------
  emitStockInCreated(stockData: any) {
    this.server.emit('stockInCreated', stockData);
  }

  emitStockInUpdated(stockData: any) {
    this.server.emit('stockInUpdated', stockData);
  }

  emitStockInDeleted(stockId: string) {
    this.server.emit('stockInDeleted', { id: stockId });
  }
}
