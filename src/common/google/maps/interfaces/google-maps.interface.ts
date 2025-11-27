import type { STATES_CODE, STATES_NAME } from '@/common/app-config/enums/states.enum';

export interface IAddressInterface {
  one?: string;

  two?: string;

  city?: string;

  state: STATES_CODE | STATES_NAME | string;

  zip?: string;

  country?: string;

  placeId?: string;
}

export interface ICoordsInterface {
  lat: number;
  long: number;
}

export interface IGoogleMapsValidateInterface {
  coords: ICoordsInterface | boolean;

  address: IAddressInterface;

  state: STATES_CODE | STATES_NAME | string;

  isStateOnly: boolean;
}
