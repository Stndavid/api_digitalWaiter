import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurante } from './entity/restaurant.entity';
import { Usuario } from '../users/entity/user.entity'; // Asegúrate de importar Usuario
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { MongoModule } from '../mongo/mongo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurante, Usuario]),
    MongoModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}

