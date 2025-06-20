import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from './paymentMethod.entity';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(MetodoPago)
    private paymentMethodRepository: Repository<MetodoPago>,
  ) {}

  async findAll(): Promise<MetodoPago[]> {
    return this.paymentMethodRepository.find();
  }

  async findOne(id: number): Promise<MetodoPago> {
    const metodo = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');
    return metodo;
  }

  async create(data: { nombre: string }): Promise<MetodoPago> {
    const metodo = this.paymentMethodRepository.create(data);
    return this.paymentMethodRepository.save(metodo);
  }

  async update(id: number, data: { nombre: string }): Promise<MetodoPago> {
    const metodo = await this.findOne(id);
    metodo.nombre = data.nombre;
    return this.paymentMethodRepository.save(metodo);
  }

  async setActive(id: number, activo: boolean): Promise<MetodoPago> {
    const metodo = await this.findOne(id);
    metodo.activo = activo;
    return this.paymentMethodRepository.save(metodo);
  }

  async remove(id: number): Promise<void> {
    const metodo = await this.findOne(id);
    await this.paymentMethodRepository.remove(metodo);
  }
}
