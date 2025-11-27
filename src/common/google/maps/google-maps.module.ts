import { Module } from '@nestjs/common';

import { GoogleMapsService } from '@/common/google/maps/services/google-maps.service';
import { GooglePlacesService } from '@/common/google/maps/services/google-places.service';

@Module({
  providers: [GoogleMapsService, GooglePlacesService],
  exports: [GoogleMapsService, GooglePlacesService],
  imports: [],
  controllers: [],
})
export class GoogleMapsModule {}
