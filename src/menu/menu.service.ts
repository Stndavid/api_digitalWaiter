import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entity/category.entity';
import { Producto } from './entity/product.entity';
import { Restaurante } from '../restaurant/entity/restaurant.entity';
import { Usuario } from '../users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createCategory(dto: any, user: any) {
    const restaurante = await this.restauranteRepository.findOne({
      where: { id: dto.restauranteId },
      relations: ['owner'],
    });
    if (!restaurante) throw new NotFoundException('Restaurante no encontrado');
    if (user.role !== 'admin' || restaurante.owner.id !== user.userId) {
      throw new ForbiddenException('No puedes crear categorías en este restaurante');
    }
    const categoria = this.categoriaRepository.create({
      nombre: dto.nombre,
      restaurante,
    });
    return this.categoriaRepository.save(categoria);
  }

  async createProduct(dto: any, user: any) {
    console.log('categoriaId:', dto.categoriaId, typeof dto.categoriaId);
    const restaurante = await this.restauranteRepository.findOne({
      where: { id: dto.restauranteId },
      relations: ['owner'],
    });
    if (!restaurante) throw new NotFoundException('Restaurante no encontrado');
    if (user.role !== 'admin' || restaurante.owner.id !== user.userId) {
      throw new ForbiddenException('No puedes crear productos en este restaurante');
    }
    const categoria = await this.categoriaRepository.findOne({
      where: { id: dto.categoriaId, restaurante: { id: dto.restauranteId } },
    });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    const producto = this.productoRepository.create({
      nombre: dto.nombre,
      precio: dto.precio,
      categoria,
      restaurante,
    });
    return this.productoRepository.save(producto);
  }

  async getMenuByRestaurante(restauranteId: number) {
    // Trae todas las categorías y sus productos para el restaurante
    return this.categoriaRepository
      .createQueryBuilder('categoria')
      .leftJoinAndSelect('categoria.productos', 'producto')
      .where('categoria.restaurante = :restauranteId', { restauranteId })
      .getMany();
  }
}
