// restaurant/entities/restaurante.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../users/entity/user.entity';
import { Reservacion } from '../../reservations/entity/reservation.entity';
import { Producto } from '../../menu/entity/product.entity';
import { Orden } from '../../orders/entity/order.entity'
import { Inventario } from '../../inventory/entities/invemtory.entity';
import { Categoria } from '../../menu/entity/category.entity';

@Entity()
export class Restaurante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  // Usuario que creó el restaurante (admin)
  @ManyToOne(() => Usuario, (usuario) => usuario.restaurantesPropios)
  owner: Usuario;

  // Meseros asignados al restaurante
  @ManyToMany(() => Usuario, (usuario) => usuario.restaurantesAsignados)
  meseros: Usuario[];

  @OneToMany(() => Reservacion, (reservacion) => reservacion.restaurante)
  reservaciones: Reservacion[];

  @OneToMany(() => Producto, (producto) => producto.restaurante)
  productos: Producto[];

  @OneToMany(() => Orden, (orden) => orden.restaurante)
  ordenes: Orden[];

  @OneToMany(() => Inventario, (inventario) => inventario.restaurante)
  inventario: Inventario[];

  @OneToMany(() => Categoria, (categoria) => categoria.restaurante)
  categorias: Categoria[];

  @Column({ nullable: true })
  ruc?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  web?: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;
}
