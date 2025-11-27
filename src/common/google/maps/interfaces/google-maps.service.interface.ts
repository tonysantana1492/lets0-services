import type { STATES_CODE, STATES_NAME } from '@/common/app-config/enums/states.enum';
import type {
  IAddressInterface,
  ICoordsInterface,
  IGoogleMapsValidateInterface,
} from '@/common/google/maps/interfaces/google-maps.interface';

export interface IGoogleMapsServiceInterface {
  reverseGeocode({ lat, long }: ICoordsInterface): Promise<IAddressInterface>;
  geocode(address: string): Promise<ICoordsInterface | boolean>;
  validateAddressObj(val: IAddressInterface): Promise<IGoogleMapsValidateInterface>;
  validateState(val: STATES_CODE | STATES_NAME | string): STATES_CODE | STATES_NAME | string;
}
