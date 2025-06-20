import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Usuario } from './entity/user.entity';
import { Role } from '../roles/entity/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Role]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
