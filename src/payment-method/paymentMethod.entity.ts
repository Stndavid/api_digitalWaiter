import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Orden } from '../orders/entity/order.entity';

@Entity()
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Orden, (orden) => orden.metodoPago)
  ordenes: Orden[];
}
