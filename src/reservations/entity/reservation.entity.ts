
// reservations/reservations.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../users/entity/user.entity';
import { Restaurante } from '../../restaurant/entity/restaurant.entity';

@Entity()
export class Reservacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  @ManyToOne(() => Restaurante)
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @Column()
  fechaReservacion: Date;

  @Column()
  numeroPersonas: number;

  @Column({ nullable: true })
  notas: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ default: 'pendiente' })
  estado: string;
}