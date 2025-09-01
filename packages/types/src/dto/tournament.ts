import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class TournamentModifyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class TournamentDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  //TODO:
  // teams: Team[];
}
