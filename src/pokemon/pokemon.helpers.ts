import axios from 'axios';
import { ALL_POKEMON_REDIS_CACHE_KEY, POKEMON_API_BASE, REDIS_TTL } from 'src/constants';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';


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
    const { name, types } = pokemonData;
    const eggGroups = extractEggGroups(speciesData);
    const characteristics =
      characteristicsResult.status === 'fulfilled' ? characteristicsResult.value : null;

    return {
        name,
        types,
        eggGroups,
        characteristics
    }
}

export async function handleAllRedisSettingsForPokemon(pokemon, cacheKey: string, redisService: RedisService, update?: boolean): Promise<void> {
    await redisService.setCache(cacheKey, JSON.stringify(pokemon), REDIS_TTL);

    const allPokemonCache = await redisService.getCache(ALL_POKEMON_REDIS_CACHE_KEY);
    let allPokemon: Pokemon[] = [];

    if (allPokemonCache) {
        allPokemon = JSON.parse(allPokemonCache);
    }
    if(update) {
        const pokemonIndex = allPokemon.findIndex(
            (pokemonToSearch) => pokemonToSearch.id === pokemon.id,
          );
          if (pokemonIndex !== -1) {
            allPokemon[pokemonIndex].cybereason_nickname = pokemon.cybereason_nickname;
            redisService.setCache(ALL_POKEMON_REDIS_CACHE_KEY, JSON.stringify(allPokemon), REDIS_TTL);
            return;
          }
    }
    
    allPokemon.push(pokemon);

    redisService.setCache(ALL_POKEMON_REDIS_CACHE_KEY, JSON.stringify(allPokemon), REDIS_TTL);

  }
