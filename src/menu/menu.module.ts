import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Categoria } from './entity/category.entity';
import { Producto } from './entity/product.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';
import { Usuario } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Producto, Restaurante, Usuario])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
