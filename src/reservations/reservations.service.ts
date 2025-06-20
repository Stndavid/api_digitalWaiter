import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservacion } from './entity/reservation.entity';
import { Usuario } from '../users/entity/user.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservacion)
    private readonly reservacionRepository: Repository<Reservacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
  ) {}

  // Obtener restaurante con su owner para validación de admin
  async getRestauranteWithOwner(restauranteId: number): Promise<Restaurante | null> {
    return this.restauranteRepository.findOne({
      where: { id: restauranteId },
      relations: ['owner'],
    });
  }

  // Verificar si el mesero está asignado al restaurante
  async isMeseroAssignedToRestaurante(meseroId: number, restauranteId: number): Promise<boolean> {
    const restaurante = await this.restauranteRepository
      .createQueryBuilder('restaurante')
      .leftJoin('restaurante.meseros', 'mesero')
      .where('restaurante.id = :restauranteId', { restauranteId })
      .andWhere('mesero.id = :meseroId', { meseroId })
      .getOne();
    return !!restaurante;
  }

  // Crear reservación (usado por todos los roles, validación en el controller)
  async createReservation(dto: CreateReservationDto & { clienteId: number }): Promise<Reservacion> {
    const cliente = await this.usuarioRepository.findOne({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    const restaurante = await this.restauranteRepository.findOne({ where: { id: dto.restauranteId } });
    if (!restaurante) throw new NotFoundException('Restaurante no encontrado');
    const reservacion = this.reservacionRepository.create({
      cliente,
      restaurante,
      fechaReservacion: dto.fechaReservacion,
      numeroPersonas: dto.numeroPersonas,
      notas: dto.notas,
    });
    return this.reservacionRepository.save(reservacion);
  }

  // Historial para admin (solo sus restaurantes)
  async findByOwner(ownerId: number): Promise<Reservacion[]> {
    return this.reservacionRepository
      .createQueryBuilder('reservacion')
      .leftJoinAndSelect('reservacion.restaurante', 'restaurante')
      .leftJoinAndSelect('reservacion.cliente', 'cliente')
      .where('restaurante.owner = :ownerId', { ownerId })
      .getMany();
  }

  // Historial para mesero (solo restaurantes donde es mesero)
  async findByMesero(meseroId: number): Promise<Reservacion[]> {
    return this.reservacionRepository
      .createQueryBuilder('reservacion')
      .leftJoinAndSelect('reservacion.restaurante', 'restaurante')
      .leftJoinAndSelect('restaurante.meseros', 'mesero')
      .leftJoinAndSelect('reservacion.cliente', 'cliente')
      .where('mesero.id = :meseroId', { meseroId })
      .getMany();
  }

  // Historial para cliente (solo sus reservaciones)
  async findByCliente(clienteId: number): Promise<Reservacion[]> {
    return this.reservacionRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['restaurante', 'cliente'],
    });
  }

  // Buscar reservación por ID con restaurante y owner
  async findByIdWithRestaurante(id: number): Promise<Reservacion | null> {
    return this.reservacionRepository.findOne({
      where: { id },
      relations: ['restaurante', 'restaurante.owner'],
    });
  }

  // Actualizar el estado de la reservación
  async updateEstado(id: number, estado: string): Promise<Reservacion> {
    const reservacion = await this.reservacionRepository.findOne({ where: { id } });
    if (!reservacion) throw new NotFoundException('Reservación no encontrada');
    reservacion.estado = estado;
    return this.reservacionRepository.save(reservacion);
  }
}
