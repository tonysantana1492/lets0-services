import { IsNotEmpty, IsString } from 'class-validator';

export class ProfileCreateBodyDto {
  @IsString()
  @IsNotEmpty()
  socialNetwork: string;

  @IsString()
  @IsNotEmpty()
  socialNetworkUrl: string;

  @IsString()
  @IsNotEmpty()
  subdomain: string;
}
