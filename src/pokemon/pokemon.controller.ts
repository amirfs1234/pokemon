import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Body,
  } from '@nestjs/common';
  import { PokemonService } from './pokemon.service';
  import { CreatePokemonDto, UpdatePokemonDto } from './dto';
  
  @Controller('pokemon')
  export class PokemonController {
    constructor(private readonly pokemonService: PokemonService) {}
  
    @Get('id/:id')
    async getPokemonById(@Param('id') id: number) {
      return this.pokemonService.getPokemonById(id);
    }
  
    @Get()
    async getAllPokemon() {
      return this.pokemonService.getAllPokemon();
    }
  
    @Post()
    async createPokemon(@Body() createPokemonDto: CreatePokemonDto) {
      return this.pokemonService.createPokemon(createPokemonDto);
    }
  
    @Put(':id')
    async updatePokemon(
      @Param('id') id: number,
      @Body() updatePokemonDto: UpdatePokemonDto,
    ) {
      return this.pokemonService.updatePokemon(id, updatePokemonDto);
    }
  
    @Delete(':id')
    async deletePokemon(@Param('id') id: number) {
      return this.pokemonService.deletePokemon(id);
    }
  }
  