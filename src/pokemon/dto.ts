export class CreatePokemonDto {
    name: string;
    type: string;
    level: number;
    abilities: string[];
  }
  
  export class UpdatePokemonDto {
    name?: string;
    type?: string;
    level?: number;
    abilities?: string[];
  }
  