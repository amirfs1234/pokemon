import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { PokemonService } from './pokemon.service';
  import { CreatePokemonDto, UpdatePokemonDto } from './dto';
  
  @Controller('pokemon')
  export class PokemonController {
    constructor(private readonly pokemonService: PokemonService) {}
  
    @Get('id/:id')
    async getPokemonById(@Param('id') id: number) {
      try {
        const pokemon = await this.pokemonService.getPokemonById(id);
        if (!pokemon) {
          throw new HttpException('Pokémon not found', HttpStatus.NOT_FOUND);
        }
        return pokemon;
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get()
    async getAllPokemon() {
      return this.pokemonService.getAllPokemon();
    }
  
    @Put(':id')
    async updatePokemon(
      @Param('id') id: number,
      @Body() updatePokemonDto: UpdatePokemonDto,
    ) {
      try {
        const updatedPokemon = await this.pokemonService.updateNickname(
          id,
          updatePokemonDto.name,
        );
        if (!updatedPokemon) {
          throw new HttpException('Pokémon not found', HttpStatus.NOT_FOUND);
        }
        return updatedPokemon;
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Delete(':id')
    async deletePokemon(@Param('id') id: number) {
      try {
        const deleted = await this.pokemonService.deletePokemon(id);
        if (!deleted) {
          throw new HttpException('Pokémon not found', HttpStatus.NOT_FOUND);
        }
        return { message: 'Pokémon deleted successfully' };
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  