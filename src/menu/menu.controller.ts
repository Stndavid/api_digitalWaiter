import { Controller, Post, Body, UseGuards, Req, Get, Param, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('menu')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('categoria')
  @Roles('admin')
  async createCategory(@Body() dto, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso de crear un menú. Solo los administradores pueden hacerlo.');
    }
    return this.menuService.createCategory(dto, req.user);
  }

  @Post('producto')
  @Roles('admin')
  async createProduct(@Body() dto, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso de crear un menú. Solo los administradores pueden hacerlo.');
    }
    return this.menuService.createProduct(dto, req.user);
  }

  @Get(':restauranteId')
  @Roles('admin', 'mesero', 'cliente')
  async getMenu(@Param('restauranteId') restauranteId: number, @Req() req) {
    console.log('req.user:', req.user); // <-- Agrega este log para depurar
    if (!req.user) {
      throw new ForbiddenException('No se pudo autenticar el usuario. Verifica tu token.');
    }
    if (req.user.role === 'admin') {
      // Solo puede ver menús de sus propios restaurantes
      const menuRestaurante = await this.menuService['restauranteRepository'].findOne({
        where: { id: restauranteId },
        relations: ['owner'],
      });
      if (!menuRestaurante) {
        throw new NotFoundException('Restaurante no encontrado');
      }
      if (menuRestaurante.owner.id !== req.user.userId) {
        throw new ForbiddenException('No puedes ver el menú de restaurantes que no te pertenecen');
      }
    }
    if (req.user.role === 'mesero') {
      // Solo puede ver menús de restaurantes donde está asignado
      const restaurante = await this.menuService['restauranteRepository'].createQueryBuilder('restaurante')
        .leftJoin('restaurante.meseros', 'mesero')
        .where('restaurante.id = :restauranteId', { restauranteId })
        .andWhere('mesero.id = :meseroId', { meseroId: req.user.userId })
        .getOne();
      if (!restaurante) {
        throw new ForbiddenException('No puedes ver el menú de restaurantes donde no estás asignado como mesero');
      }
    }
    // Cliente: puede ver todos
    return this.menuService.getMenuByRestaurante(restauranteId);
  }
}
