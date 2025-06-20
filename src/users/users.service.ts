import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entity/user.entity';
import { Role } from '../roles/entity/roles.entity';
import { encrypt, decrypt, hashValue } from '../common/crypto.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    const emailHash = hashValue(email);
    const user = await this.usersRepository.findOne({
      where: { emailHash },
      relations: ['role'],
    });
    if (user) {
      user.email = decrypt(user.email);
      user.cedula = decrypt(user.cedula);
      user.telefono = decrypt(user.telefono);
    }
    return user;
  }

  async findByCedula(cedula: string): Promise<Usuario | null> {
    const cedulaHash = hashValue(cedula);
    const user = await this.usersRepository.findOne({ where: { cedulaHash } });
    if (user) {
      user.email = decrypt(user.email);
      user.cedula = decrypt(user.cedula);
      user.telefono = decrypt(user.telefono);
    }
    return user;
  }

  async findByTelefono(telefono: string): Promise<Usuario | null> {
    const telefonoHash = hashValue(telefono);
    const user = await this.usersRepository.findOne({ where: { telefonoHash } });
    if (user) {
      user.email = decrypt(user.email);
      user.cedula = decrypt(user.cedula);
      user.telefono = decrypt(user.telefono);
    }
    return user;
  }

  async create(data: { nombre: string; email: string; password: string; roleId: number; cedula: string; telefono: string }): Promise<Usuario> {
    const role = await this.rolesRepository.findOne({ where: { id: data.roleId } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    const userByEmail = await this.findByEmail(data.email);
    if (userByEmail) throw new ConflictException('El email ya está en uso');
    const userByCedula = await this.findByCedula(data.cedula);
    if (userByCedula) throw new ConflictException('La cédula ya está registrada');
    if (data.telefono) {
      const userByTelefono = await this.findByTelefono(data.telefono);
      if (userByTelefono) throw new ConflictException('El teléfono ya está registrado');
    }
    const user = this.usersRepository.create({
      nombre: data.nombre,
      email: encrypt(data.email),
      password: data.password,
      role: role, // Asegúrate de que 'role' es del tipo correcto
      cedula: encrypt(data.cedula),
      telefono: encrypt(data.telefono),
      emailHash: hashValue(data.email),
      cedulaHash: hashValue(data.cedula),
      telefonoHash: data.telefono ? hashValue(data.telefono) : undefined,
    });
    const saved = await this.usersRepository.save(user);
    saved.email = decrypt(saved.email);
    saved.cedula = decrypt(saved.cedula);
    saved.telefono = decrypt(saved.telefono);
    return saved;
  }

  async findById(id: number): Promise<Usuario | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (user) {
      user.email = decrypt(user.email);
      user.cedula = decrypt(user.cedula);
      user.telefono = decrypt(user.telefono);
    }
    return user;
  }

  async findAll(): Promise<Usuario[]> {
    const users = await this.usersRepository.find({ relations: ['role'] });
    return users.map(user => {
      user.email = decrypt(user.email);
      user.cedula = decrypt(user.cedula);
      user.telefono = decrypt(user.telefono);
      return user;
    });
  }

  async update(id: number, data: Partial<{ nombre: string; email: string; cedula: string; telefono: string; password: string; roleId: number }>): Promise<Usuario> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['role'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.email && hashValue(data.email) !== user.emailHash) {
      const exists = await this.findByEmail(data.email);
      if (exists) throw new ConflictException('El email ya está en uso');
      user.email = encrypt(data.email);
      user.emailHash = hashValue(data.email);
    }
    if (data.cedula && hashValue(data.cedula) !== user.cedulaHash) {
      const exists = await this.findByCedula(data.cedula);
      if (exists) throw new ConflictException('La cédula ya está registrada');
      user.cedula = encrypt(data.cedula);
      user.cedulaHash = hashValue(data.cedula);
    }
    if (data.telefono && hashValue(data.telefono) !== user.telefonoHash) {
      const exists = await this.findByTelefono(data.telefono);
      if (exists) throw new ConflictException('El teléfono ya está registrado');
      user.telefono = encrypt(data.telefono);
      user.telefonoHash = hashValue(data.telefono);
    }
    if (data.nombre) user.nombre = data.nombre;
    if (data.password) user.password = data.password;
    if (data.roleId) {
      const role = await this.rolesRepository.findOne({ where: { id: data.roleId } });
      if (!role) throw new NotFoundException('Rol no encontrado');
      user.role = role;
    }
    const saved = await this.usersRepository.save(user);
    saved.email = decrypt(saved.email);
    saved.cedula = decrypt(saved.cedula);
    saved.telefono = decrypt(saved.telefono);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.usersRepository.remove(user);
  }
}
