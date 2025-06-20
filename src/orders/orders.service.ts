import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Orden } from './entity/order.entity';
import { DetalleOrden } from './entity/orderDetail.entity';
import { Usuario } from '../users/entity/user.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';
import { MetodoPago } from '../payment-method/paymentMethod.entity';
import { Producto } from '../menu/entity/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orden) private ordenRepo: Repository<Orden>,
    @InjectRepository(DetalleOrden) private detalleRepo: Repository<DetalleOrden>,
    @InjectRepository(Restaurante) private restauranteRepo: Repository<Restaurante>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(MetodoPago) private metodoPagoRepo: Repository<MetodoPago>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
  ) {}

  async create(dto: any, user: any) {
    // Validar datos mínimos
    if (!dto.restauranteId || !dto.meseroId || !dto.metodoPagoId || !dto.numeroMesa || !dto.detalles || !Array.isArray(dto.detalles) || dto.detalles.length === 0) {
      throw new BadRequestException('Datos incompletos para crear la orden');
    }

    // Buscar entidades relacionadas
    const [restaurante, mesero, metodoPago, cliente] = await Promise.all([
      this.restauranteRepo.findOne({ where: { id: dto.restauranteId }, relations: ['owner', 'meseros'] }),
      this.usuarioRepo.findOne({ where: { id: dto.meseroId } }),
      this.metodoPagoRepo.findOne({ where: { id: dto.metodoPagoId } }),
      this.usuarioRepo.findOne({ where: { id: user.userId } }),
    ]);
    if (!restaurante) throw new NotFoundException('Restaurante no encontrado');
    if (!mesero) throw new NotFoundException('Mesero no encontrado');
    if (!metodoPago) throw new NotFoundException('Método de pago no encontrado');
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    // Permisos según rol
    if (user.role === 'admin') {
      if (!restaurante.owner || restaurante.owner.id !== user.userId) {
        throw new ForbiddenException('Solo puedes crear órdenes en tus restaurantes');
      }
    }
    if (user.role === 'mesero') {
      if (!restaurante.meseros.some(m => m.id === user.userId)) {
        throw new ForbiddenException('Solo puedes crear órdenes en restaurantes donde eres mesero');
      }
    }
    if (user.role === 'cliente') {
      if (user.userId !== cliente.id) {
        throw new ForbiddenException('Solo puedes crear órdenes para ti mismo');
      }
    }

    // Validar detalles y productos
    const detalles: DetalleOrden[] = [];
    for (const d of dto.detalles) {
      if (!d.productoId || d.cantidad <= 0 || d.precioUnitario <= 0 || d.subtotal <= 0) {
        throw new BadRequestException('Detalle de producto inválido');
      }
      const producto = await this.productoRepo.findOne({ where: { id: d.productoId } });
      if (!producto) throw new NotFoundException(`Producto con ID ${d.productoId} no existe`);
      detalles.push(
        this.detalleRepo.create({
          producto,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })
      );
    }

    const orden = this.ordenRepo.create({
      restaurante,
      mesero,
      cliente,
      numeroMesa: dto.numeroMesa,
      estado: 'pendiente',
      metodoPago,
      detalles,
    });

    return this.ordenRepo.save(orden);
  }

  async findAll(user: any) {
    let where: any = {};
    if (user.role === 'admin') {
      // Buscar restaurantes del admin
      const restaurantes = await this.restauranteRepo.find({ where: { owner: { id: user.userId } } });
      if (!restaurantes.length) return [];
      where.restaurante = { id: In(restaurantes.map(r => r.id)) };
    }
    if (user.role === 'mesero') {
      // Buscar restaurantes donde es mesero
      const restaurantes = await this.restauranteRepo
        .createQueryBuilder('restaurante')
        .leftJoin('restaurante.meseros', 'mesero')
        .where('mesero.id = :meseroId', { meseroId: user.userId })
        .getMany();
      if (!restaurantes.length) return [];
      where.restaurante = { id: In(restaurantes.map(r => r.id)) };
    }
    if (user.role === 'cliente') {
      where.cliente = { id: user.userId };
    }
    return this.ordenRepo.find({
      where,
      relations: ['cliente', 'mesero', 'restaurante', 'detalles', 'detalles.producto', 'metodoPago'],
    });
  }

  async findOne(id: number, user: any) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['cliente', 'mesero', 'restaurante', 'restaurante.owner', 'restaurante.meseros', 'detalles', 'detalles.producto', 'metodoPago'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    // Permisos
    if (user.role === 'admin') {
      if (!orden.restaurante.owner || orden.restaurante.owner.id !== user.userId) {
        throw new ForbiddenException('No puedes ver órdenes fuera de tus restaurantes');
      }
    }
    if (user.role === 'mesero') {
      if (!orden.restaurante.meseros.some(m => m.id === user.userId)) {
        throw new ForbiddenException('No puedes ver órdenes fuera de tus restaurantes asignados');
      }
    }
    if (user.role === 'cliente') {
      if (orden.cliente.id !== user.userId) {
        throw new ForbiddenException('No puedes ver órdenes que no te pertenecen');
      }
    }
    return orden;
  }

  async replace(id: number, dto: any, user: any) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['restaurante', 'restaurante.owner', 'restaurante.meseros', 'cliente'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    // Permisos
    if (user.role === 'admin') {
      if (!orden.restaurante.owner || orden.restaurante.owner.id !== user.userId) {
        throw new ForbiddenException('No puedes editar órdenes fuera de tus restaurantes');
      }
    }
    if (user.role === 'mesero') {
      if (!orden.restaurante.meseros.some(m => m.id === user.userId)) {
        throw new ForbiddenException('No puedes editar órdenes fuera de tus restaurantes asignados');
      }
    }
    // Actualiza la orden (puedes mejorar esto según tus necesidades)
    await this.ordenRepo.delete(id);
    return this.create(dto, user);
  }

  async update(
    id: number,
    partialDto: Partial<{ estado: string }>,
    user: any,
  ) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['restaurante', 'restaurante.owner', 'restaurante.meseros', 'cliente'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    // Permisos
    if (user.role === 'admin') {
      if (!orden.restaurante.owner || orden.restaurante.owner.id !== user.userId) {
        throw new ForbiddenException('No puedes editar órdenes fuera de tus restaurantes');
      }
    }
    if (user.role === 'mesero') {
      if (!orden.restaurante.meseros.some(m => m.id === user.userId)) {
        throw new ForbiddenException('No puedes editar órdenes fuera de tus restaurantes asignados');
      }
    }
    if (partialDto.estado) {
      const estadosValidos = ['pendiente', 'en preparación', 'entregada', 'cancelada'];
      if (!estadosValidos.includes(partialDto.estado)) {
        throw new BadRequestException(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
      }
      orden.estado = partialDto.estado;
    }
    return this.ordenRepo.save(orden);
  }

  async remove(id: number, user: any) {
    const orden = await this.ordenRepo.findOne({
      where: { id },
      relations: ['restaurante', 'restaurante.owner', 'restaurante.meseros', 'cliente'],
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    // Permisos
    if (user.role === 'admin') {
      if (!orden.restaurante.owner || orden.restaurante.owner.id !== user.userId) {
        throw new ForbiddenException('No puedes eliminar órdenes fuera de tus restaurantes');
      }
    }
    if (user.role === 'mesero') {
      if (!orden.restaurante.meseros.some(m => m.id === user.userId)) {
        throw new ForbiddenException('No puedes eliminar órdenes fuera de tus restaurantes asignados');
      }
    }
    await this.ordenRepo.remove(orden);
    return { message: 'Orden eliminada' };
  }

  async findByOwner(ownerId: number) {
    // Devuelve órdenes solo de restaurantes donde el usuario es owner
    const restaurantes = await this.restauranteRepo.find({ where: { owner: { id: ownerId } } });
    if (!restaurantes.length) return [];
    return this.ordenRepo.find({
      where: { restaurante: { id: In(restaurantes.map(r => r.id)) } },
      relations: ['cliente', 'mesero', 'restaurante', 'detalles', 'detalles.producto', 'metodoPago'],
    });
  }

  async findByMesero(meseroId: number) {
    // Devuelve órdenes solo de restaurantes donde el usuario es mesero asignado
    const restaurantes = await this.restauranteRepo
      .createQueryBuilder('restaurante')
      .leftJoin('restaurante.meseros', 'mesero')
      .where('mesero.id = :meseroId', { meseroId })
      .getMany();
    if (!restaurantes.length) return [];
    return this.ordenRepo.find({
      where: { restaurante: { id: In(restaurantes.map(r => r.id)) } },
      relations: ['cliente', 'mesero', 'restaurante', 'detalles', 'detalles.producto', 'metodoPago'],
    });
  }

  async findByCliente(clienteId: number) {
    // Devuelve solo las órdenes del cliente
    return this.ordenRepo.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente', 'mesero', 'restaurante', 'detalles', 'detalles.producto', 'metodoPago'],
    });
  }
}