import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column('text', { array: true }) // PostgreSQL array column
  abilities: string[];

  @Column()
  level: number;
}
