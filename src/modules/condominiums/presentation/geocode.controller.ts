import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  CepParamDto,
  GeocodeQueryDto,
  GeocodeResultDto,
  GeocodeSuggestItemDto,
  GeocodeSuggestQueryDto,
} from '../application/dto/geocode.dto';
import { GeocodeAddressUseCase } from '../application/use-cases/geocode-address.use-case';
import { LookupCepUseCase } from '../application/use-cases/lookup-cep.use-case';
import { SuggestAddressesUseCase } from '../application/use-cases/suggest-addresses.use-case';

@ApiTags('Geocoding')
@ApiBearerAuth()
@Controller('geocode')
export class GeocodeController {
  constructor(
    private readonly geocodeAddress: GeocodeAddressUseCase,
    private readonly suggestAddresses: SuggestAddressesUseCase,
    private readonly lookupCep: LookupCepUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Busca latitude/longitude a partir de um endereço (OpenStreetMap Nominatim)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GeocodeResultDto })
  search(@Query() query: GeocodeQueryDto): Promise<GeocodeResultDto> {
    return this.geocodeAddress.execute(query.q);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Sugestões de endereço enquanto o usuário digita' })
  @ApiResponse({ status: HttpStatus.OK, type: GeocodeSuggestItemDto, isArray: true })
  suggest(@Query() query: GeocodeSuggestQueryDto): Promise<GeocodeSuggestItemDto[]> {
    return this.suggestAddresses.execute(query.q);
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Localiza endereço e coordenadas a partir do CEP (ViaCEP)' })
  @ApiResponse({ status: HttpStatus.OK, type: GeocodeResultDto })
  byCep(@Param() params: CepParamDto): Promise<GeocodeResultDto> {
    return this.lookupCep.execute(params.cep);
  }
}
