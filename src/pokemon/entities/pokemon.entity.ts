import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Pokemon {
  @PrimaryColumn()
  id: number;

  @Column()
  cybereason_nickname: string;

  @Column()
  name: string;

  @Column('simple-array', { nullable: true })
  types: string[];

  @Column('simple-array', { nullable: true })
  egg_groups: string[];

  @Column('jsonb', { nullable: true })
  characteristics: { gene_modulo: number; description: string } | null;
}
