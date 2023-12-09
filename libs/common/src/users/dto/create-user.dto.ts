import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  username: string;

  @IsString()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(50)
  password: string;
}
