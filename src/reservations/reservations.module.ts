import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservacion } from './entity/reservation.entity';
import { Usuario } from '../users/entity/user.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservacion, Usuario, Restaurante]), // <-- Importa las entidades aquí
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
