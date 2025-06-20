import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurante } from './entity/restaurant.entity';
import { Usuario } from '../users/entity/user.entity';
import { Role } from '../roles/entity/roles.entity'; // Importa la entidad Role
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurante)
    private readonly restauranteRepository: Repository<Restaurante>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createRestaurante(data: Partial<Restaurante>): Promise<Restaurante> {
    const restaurante = this.restauranteRepository.create(data);
    return this.restauranteRepository.save(restaurante);
  }

  async asignarMesero(
    restauranteId: number,
    meseroId: number,
  ): Promise<Restaurante> {
    const restaurante = await this.restauranteRepository.findOne({
      where: { id: restauranteId },
      relations: ['meseros'],
    });
    if (!restaurante) throw new Error('Restaurante no encontrado');

    const mesero = await this.usuarioRepository.findOne({
      where: { id: meseroId },
      relations: ['role'], // Asegúrate de traer la relación
      select: ['id'], // Puedes omitir 'role' aquí, ya que lo traes por relations
    });
    if (!mesero) throw new Error('Mesero no encontrado');

    // Validación: solo usuarios con rol 'mesero'
    if (mesero.role?.nombre !== 'mesero') {
      throw new BadRequestException('Solo se pueden asignar usuarios con rol de mesero');
    }

    // Evita duplicados
    if (!restaurante.meseros.some(m => m.id === mesero.id)) {
      restaurante.meseros.push(mesero);
      await this.restauranteRepository.save(restaurante);
    }
    return restaurante;
  }

  async findRestaurantesByOwner(ownerId: number): Promise<Restaurante[]> {
    return this.restauranteRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner', 'meseros', 'categorias', 'categorias.productos'],
    });
  }

  async findAllRestaurantes(): Promise<Restaurante[]> {
    return this.restauranteRepository.find({
      relations: ['owner', 'meseros', 'categorias', 'categorias.productos'],
    });
  }

  async findRestaurantesByMesero(meseroId: number): Promise<Restaurante[]> {
    return this.restauranteRepository
      .createQueryBuilder('restaurante')
      .leftJoin('restaurante.meseros', 'mesero')
      .leftJoinAndSelect('restaurante.owner', 'owner')
      .leftJoinAndSelect('restaurante.meseros', 'meseros')
      .leftJoinAndSelect('restaurante.categorias', 'categorias')
      .leftJoinAndSelect('categorias.productos', 'productos')
      .where('mesero.id = :meseroId', { meseroId })
      .getMany();
  }

  async findRestauranteById(id: number): Promise<Restaurante | null> {
    return this.restauranteRepository.findOne({
      where: { id },
      relations: ['owner', 'meseros', 'categorias', 'categorias.productos'],
    });
  }

  async findUsuarioById(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }
}

