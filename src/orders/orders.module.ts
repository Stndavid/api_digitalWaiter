import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { Orden } from './entity/order.entity';
import { DetalleOrden } from './entity/orderDetail.entity';
import { Usuario } from '../users/entity/user.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';
import { MetodoPago } from '../payment-method/paymentMethod.entity';
import { Producto } from 'src/menu/entity/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orden,
      DetalleOrden,
      Usuario,
      Restaurante,
      MetodoPago,
      Producto
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
