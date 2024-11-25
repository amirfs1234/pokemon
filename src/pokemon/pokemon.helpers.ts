import axios from 'axios';
import { POKEMON_API_BASE } from 'src/constants';

export async function fetchPokemonData(pokemonId: number): Promise<any> {
  const response = await axios.get(`${POKEMON_API_BASE}/pokemon/${pokemonId}/`);
  return {
    name: response.data.name,
    types: response.data.types.map((type) => type.type.name),
  };
}

export async function fetchSpeciesData(pokemonId: number): Promise<any> {
  const response = await axios.get(`${POKEMON_API_BASE}/pokemon-species/${pokemonId}/`);
  return response.data;
}

export async function fetchCharacteristics(pokemonId: number): Promise<{ description: string; gene_modulo: number } | null> {
    try {
      const response = await axios.get(`${POKEMON_API_BASE}/characteristic/${pokemonId}/`);
      const description = response.data.descriptions.find((desc) => desc.language.name === 'en')?.description || null;
      return description ? { description, gene_modulo: response.data.gene_modulo } : null;
    } catch {
      return null;
    }
  }
  

function extractEggGroups(speciesData: any): string[] {
  return speciesData.egg_groups.map((group) => group.name);
}

export function getPokemonFields(pokemonData, speciesData, characteristicsResult) {
    const { name, types } = pokemonData.value;
    const eggGroups = extractEggGroups(speciesData.value);
    const characteristics =
      characteristicsResult.status === 'fulfilled' ? characteristicsResult.value : null;

    return {
        name,
        types,
        eggGroups,
        characteristics
    }
}
