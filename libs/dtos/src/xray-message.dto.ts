import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, isNumber, IsNumber, IsString, ValidateNested } from "class-validator";

class XRayDataPoint {
    @IsNumber()
    time: number;

    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    @IsNumber({}, { each: true })
    coordinatesAndSpeed: [number, number, number] // [x, y, speed]
}

export class XRayMessageDto {
    @IsString()
    deviceId: string;

    @IsNumber()
    time: number;

    @IsArray()
    @ValidateNested({ each: true})
    @Type(() => XRayDataPoint)
    data: XRayDataPoint[];
}