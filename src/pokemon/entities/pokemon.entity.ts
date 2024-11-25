// src/pokemon/entities/pokemon.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number; // Internal database ID

  @Column()
  cybereason_pokemon_id: number; // Internal unique ID for Pokémon

  @Column()
  cybereason_nickname: string; // Pokémon's nickname, defaults to its name

  @Column()
  name: string; // Original Pokémon name

  @Column('simple-array', { nullable: true })
  egg_groups: string[]; // List of egg groups (e.g., 'monster', 'dragon')

  @Column('json', { nullable: true })
  characteristics: { gene_modulo: number; description: string } | null; // Pokémon characteristics
}
