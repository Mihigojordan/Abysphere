import { Module } from "@nestjs/common";
import { StockoutController } from "./stockout.controller";
import { StockoutService } from "./stockout.service";
import { DualAuthGuard } from "src/guards/dual-auth.guard";

@Module({
    controllers:[StockoutController],
    providers: [StockoutService, DualAuthGuard]
})

export class StockoutModule {}