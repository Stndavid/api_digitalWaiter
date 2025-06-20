// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MongoModule } from './mongo/mongo.module';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './users/entity/user.entity';
import { Role } from './roles/entity/roles.entity';
import { Restaurante } from './restaurant/entity/restaurant.entity';
import { Reservacion } from './reservations/entity/reservation.entity';
import { Orden } from './orders/entity/order.entity';
import { DetalleOrden } from './orders/entity/orderDetail.entity';
import { Producto } from './menu/entity/product.entity';
import { Categoria } from './menu/entity/category.entity';
import { Inventario } from './inventory/entities/invemtory.entity';
import { MetodoPago } from './payment-method/paymentMethod.entity';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        Usuario,
        Role,
        Restaurante,
        Reservacion,
        Orden,
        DetalleOrden,
        Producto,
        Categoria,
        Inventario,
        MetodoPago, 
      ],
      autoLoadEntities: false, // Usa false si defines entities manualmente
      synchronize: true, // solo para desarrollo
    }),
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    RestaurantModule,
    MenuModule,
    OrdersModule,
    InventoryModule,
    ReservationsModule,
    MongoModule,
    AuthModule,

   
  ],
})
export class AppModule {}