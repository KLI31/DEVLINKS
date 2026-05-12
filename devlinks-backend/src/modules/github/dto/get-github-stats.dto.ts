import { IsNotEmpty, IsString } from 'class-validator';

export class GetGithubStatsDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
