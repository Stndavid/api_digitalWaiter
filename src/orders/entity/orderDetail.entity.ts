
// orders/detalle-orden.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Orden } from './order.entity';
import { Producto } from '../../menu/entity/product.entity';

@Entity()
export class DetalleOrden {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Orden, (orden) => orden.detalles)
  @JoinColumn({ name: 'orden_id' })
  orden: Orden;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column('int')
  cantidad: number;

  @Column('decimal')
  precioUnitario: number;

  @Column('decimal')
  subtotal: number;
}