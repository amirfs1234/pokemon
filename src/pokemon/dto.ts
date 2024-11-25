export class CreatePokemonDto {
    cybereason_pokemon_id: number;
    cybereason_nickname?: string;
    name: string;
    types: string[];
    egg_groups?: string[];
    characteristics?: { gene_modulo: number; description: string } | null;
  }
  
  export class UpdatePokemonDto {
    cybereason_nickname?: string;
    name?: string;
    types?: string[];
    egg_groups?: string[];
    characteristics?: { gene_modulo: number; description: string } | null;
  }
  