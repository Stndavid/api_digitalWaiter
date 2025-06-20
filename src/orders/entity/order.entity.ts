// orders/orders.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../users/entity/user.entity';
import { Restaurante } from '../../restaurant/entity/restaurant.entity'
import { DetalleOrden } from './orderDetail.entity';
import { MetodoPago } from '../../payment-method/paymentMethod.entity'; // Corrige la ruta aquí

@Entity()
export class Orden {
  @PrimaryGeneratedColumn()
  id: number;

  // Cliente que hace la orden
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Usuario;

  // Restaurante donde se hace la orden
  @ManyToOne(() => Restaurante)
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  // Mesero que atiende la orden
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'mesero_id' })
  mesero: Usuario;

  @Column()
  numeroMesa: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ default: 'pendiente' })
  estado: string;

  // Detalle de la orden (productos, cantidades, precios)
  @OneToMany(() => DetalleOrden, (detalle) => detalle.orden, { cascade: true })
  detalles: DetalleOrden[];

  @ManyToOne(() => MetodoPago, (metodoPago) => metodoPago.ordenes)
  metodoPago: MetodoPago;
}