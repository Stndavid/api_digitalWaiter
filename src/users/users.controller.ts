import { Controller, Get, Param, Put, Patch, Delete, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsers(@Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede ver todos los usuarios');
    }
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: number, @Req() req) {
    if (req.user.userId !== Number(id) && req.user.role !== 'admin') {
      throw new ForbiddenException('No puedes ver la información de otro usuario');
    }
    return await this.usersService.findById(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() data: any, @Req() req) {
    // console.log('Token userId:', req.user.userId, 'URL id:', id); // Depuración opcional
    if (req.user.userId !== Number(id)) {
      throw new ForbiddenException('Solo puedes editar tu propia información');
    }
    return await this.usersService.update(Number(id), data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async patchUser(@Param('id') id: number, @Body() data: any, @Req() req) {
    // console.log('Token userId:', req.user.userId, 'URL id:', id); // Depuración opcional
    if (req.user.userId !== Number(id)) {
      throw new ForbiddenException('Solo puedes editar tu propia información');
    }
    return await this.usersService.update(Number(id), data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUser(@Param('id') id: number, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede eliminar usuarios');
    }
    await this.usersService.remove(Number(id));
    return { message: 'Usuario eliminado' };
  }
}
