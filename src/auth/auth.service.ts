import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Usuario } from '../users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    nombre: string,
    email: string,
    password: string,
    roleId: number,
    cedula: string,
    telefono: string,
  ): Promise<Usuario> {
    const existing = await this.usersService.findByEmail(email);
    if (existing !== null) throw new ConflictException('Email ya registrado');
    const existingCedula = await this.usersService.findByCedula(cedula);
    if (existingCedula !== null) throw new ConflictException('Cédula ya registrada');
    if (telefono) {
      const existingTelefono = await this.usersService.findByTelefono(telefono);
      if (existingTelefono !== null) throw new ConflictException('Teléfono ya registrado');
    }
    const hash = await bcrypt.hash(password, 10);
    return this.usersService.create({ nombre, email, password: hash, roleId, cedula, telefono });
  }

  async validateUser(email: string, password: string): Promise<Usuario> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async login(user: Usuario) {
    const payload = { sub: user.id, role: user.role }; // Si role es enum o string
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role }
    };
  }
}
