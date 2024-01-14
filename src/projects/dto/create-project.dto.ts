import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID(4)
  @IsString()
  @IsNotEmpty()
  referringEmployeeId!: string;
}
