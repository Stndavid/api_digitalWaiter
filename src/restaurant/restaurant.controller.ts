import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantService } from './restaurant.service'; // Servicio SQL

@Controller('restaurantes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RestaurantController {
  constructor(
    private readonly mongoService: MongoService,
    private readonly restauranteService: RestaurantService // Servicio SQL
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateRestauranteDto, @Req() req) {
    let owner;
    // Si el body trae ownerId y el usuario autenticado es superadmin, usa ese ownerId
    if (dto.ownerId && req.user.role === 'superadmin') {
      owner = await this.restauranteService.findUsuarioById(dto.ownerId);
      if (!owner) {
        throw new NotFoundException('Usuario owner no encontrado');
      }
    } else {
      // Por defecto, el owner es el usuario autenticado
      owner = await this.restauranteService.findUsuarioById(req.user.userId);
      if (!owner) {
        throw new NotFoundException('Usuario no encontrado');
      }
    }
    const restauranteSQL = await this.restauranteService.createRestaurante({ ...dto, owner });

    // 2. Guarda el horario en Mongo, asociando el id del restaurante SQL
    const horarioAtencion = dto.horarioAtencion;
    const restauranteMongo = await this.mongoService.createRestaurante({
      restauranteId: restauranteSQL.id, // referencia al restaurante SQL
      horarioAtencion
    });

    return { restaurante: restauranteSQL, horario: restauranteMongo };
  }

  @Get()
  @Roles('admin', 'cliente', 'mesero')
  async findAll(@Req() req) {
    if (req.user.role === 'admin') {
      // Admin: solo sus restaurantes
      return this.restauranteService.findRestaurantesByOwner(req.user.userId);
    }
    if (req.user.role === 'mesero') {
      // Mesero: solo restaurantes donde está asignado
      return this.restauranteService.findRestaurantesByMesero(req.user.userId);
    }
    // Cliente: todos los restaurantes
    return this.restauranteService.findAllRestaurantes();
  }

  @Patch(':id/asignar-mesero/:meseroId')
  @Roles('admin')
  async asignarMesero(
    @Param('id') restauranteId: string,
    @Param('meseroId') meseroId: string
  ) {
    return this.mongoService.asignarMesero(restauranteId, meseroId);
  }

  @Patch(':id/asignar-mesero-sql/:meseroId')
  @Roles('admin')
  async asignarMeseroSQL(
    @Param('id') restauranteId: number,
    @Param('meseroId') meseroId: number,
    @Req() req
  ) {
    const restaurante = await this.restauranteService.findRestauranteById(restauranteId);
    if (!restaurante) {
      throw new NotFoundException('Restaurante no encontrado');
    }
    // DEBUG: log ids and types
    console.log('restaurante.owner.id:', restaurante.owner?.id, typeof restaurante.owner?.id);
    console.log('req.user.userId:', req.user.userId, typeof req.user.userId);

    if (!restaurante.owner || restaurante.owner.id != req.user.userId) {
      throw new ForbiddenException('No puedes asignar meseros a restaurantes que no te pertenecen');
    }
    return this.restauranteService.asignarMesero(restauranteId, meseroId);
  }
}

