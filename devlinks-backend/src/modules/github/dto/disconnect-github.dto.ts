import { IsNotEmpty, IsString } from 'class-validator';

export class DisconnectGithubDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
