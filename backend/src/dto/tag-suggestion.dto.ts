import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class TagSuggestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}
