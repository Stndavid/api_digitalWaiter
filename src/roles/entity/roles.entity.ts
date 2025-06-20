
// roles/entities/role.entity.ts (opcional si manejas roles por tabla)
import { Usuario } from 'src/users/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // admin, mesero, cliente
  
  @Column({ nullable: true })
  ruta: string; 
  
  @OneToMany(() => Usuario, (usuario) => usuario.role)
  usuarios: Usuario[];
}
