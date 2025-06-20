import { Controller, Post, Body, Get, Req, UseGuards, ForbiddenException, NotFoundException, Patch, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservaciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Crear reservación según el rol
  @Post()
  @Roles('admin', 'mesero', 'cliente')
  async create(@Body() dto: CreateReservationDto, @Req() req) {
    // ADMIN: solo puede crear reservaciones en restaurantes donde es owner
    if (req.user.role === 'admin') {
      const restaurante = await this.reservationsService.getRestauranteWithOwner(dto.restauranteId);
      if (!restaurante) throw new NotFoundException('Restaurante no encontrado');
      if (restaurante.owner.id !== req.user.userId) {
        throw new ForbiddenException('No puedes crear reservaciones en restaurantes que no te pertenecen');
      }
      dto.clienteId = req.user.userId; // El admin se asigna como cliente
    }
    // MESERO: solo puede crear reservaciones en restaurantes donde está asignado
    if (req.user.role === 'mesero') {
      const assigned = await this.reservationsService.isMeseroAssignedToRestaurante(req.user.userId, dto.restauranteId);
      if (!assigned) {
        throw new ForbiddenException('No puedes crear reservaciones en restaurantes donde no eres mesero');
      }
      dto.clienteId = req.user.userId; // El mesero se asigna como cliente
    }
    // CLIENTE: puede reservar en cualquier restaurante, pero la reservación es para sí mismo
    if (req.user.role === 'cliente') {
      dto.clienteId = req.user.userId;
    }
    // Crea un nuevo objeto con clienteId obligatorio
    const dtoWithClienteId = { ...dto, clienteId: dto.clienteId! };
    return this.reservationsService.createReservation(dtoWithClienteId);
  }

  // Historial de reservaciones según el rol
  @Get('historial')
  @Roles('admin', 'mesero', 'cliente')
  async historial(@Req() req) {
    if (req.user.role === 'admin') {
      // Admin: solo historial de su restaurante
      return this.reservationsService.findByOwner(req.user.userId);
    }
    if (req.user.role === 'mesero') {
      // Mesero: solo historial de restaurantes donde es mesero
      return this.reservationsService.findByMesero(req.user.userId);
    }
    // Cliente: solo su historial
    return this.reservationsService.findByCliente(req.user.userId);
  }

  // Cambiar el estado de una reservación
  @Patch(':id/estado')
  @Roles('admin', 'mesero')
  async updateEstado(
    @Param('id') id: number,
    @Body('estado') estado: string,
    @Req() req
  ) {
    // Solo admin dueño o mesero asignado pueden cambiar el estado
    const reservacion = await this.reservationsService.findByIdWithRestaurante(id);
    if (!reservacion) throw new NotFoundException('Reservación no encontrada');

    if (req.user.role === 'admin') {
      if (reservacion.restaurante.owner.id !== req.user.userId) {
        throw new ForbiddenException('No puedes cambiar el estado de reservaciones de otros restaurantes');
      }
    }
    if (req.user.role === 'mesero') {
      const assigned = await this.reservationsService.isMeseroAssignedToRestaurante(
        req.user.userId,
        reservacion.restaurante.id
      );
      if (!assigned) {
        throw new ForbiddenException('No puedes cambiar el estado de reservaciones de restaurantes donde no eres mesero');
      }
    }
    return this.reservationsService.updateEstado(id, estado);
  }
}
