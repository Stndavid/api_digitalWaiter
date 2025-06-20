// users/entities/usuario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Reservacion } from '../../reservations/entity/reservation.entity';
import { Orden } from '../../orders/entity/order.entity';
import { Restaurante } from '../../restaurant/entity/restaurant.entity';
import { Role } from '../../roles/entity/roles.entity'; // Importa la entidad Role


@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  cedula: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ unique: true })
  emailHash: string;

  @Column({ unique: true })
  cedulaHash: string;

  @Column({ nullable: true, unique: true })
  telefonoHash: string;

  @Column()
  password: string;

  @ManyToOne(() => Role)
  role: Role;

  // Reservaciones hechas por el usuario (cliente)
  @OneToMany(() => Reservacion, (reservacion) => reservacion.cliente, { nullable: true })
  reservaciones?: Reservacion[];

  // Órdenes hechas por el usuario (cliente)
  @OneToMany(() => Orden, (orden) => orden.cliente, { nullable: true })
  ordenes?: Orden[];

  // Restaurantes creados por el usuario (admin)
  @OneToMany(() => Restaurante, (restaurante) => restaurante.owner)
  restaurantesPropios: Restaurante[];

  // Restaurantes en los que el usuario actúa como mesero
  @ManyToMany(() => Restaurante, (restaurante) => restaurante.meseros, { nullable: true })
  @JoinTable({ name: 'restaurante_meseros' })
  restaurantesAsignados?: Restaurante[];
}
