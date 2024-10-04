import * as NBT from "prismarine-nbt";
import { litematicData } from "./litematic";

export type schematicPaletteBlock = {
    Name: string;
    Properties?: Record<string, {type: NBT.TagType.String, value:string}>;
}

export interface schematicReader {
    getBlockAt(x: number, y: number, z: number): schematicPaletteBlock;
    volume: number;
    sizeX : number;
    sizeY : number;
    sizeZ : number;
}

export class LitematicReader implements schematicReader {
    public readonly sizeX: number;
    public readonly sizeY: number;
    public readonly sizeZ: number;
    public readonly volume: number;
    private layerSize: number;
    private states: Array<number>
    private statePalette: Array<schematicPaletteBlock>

    constructor(data: litematicData){
        this.sizeX = data.size.x;
        this.sizeY = data.size.y;
        this.sizeZ = data.size.z;
        this.volume = (this.sizeX * this.sizeY * this.sizeZ);
        this.layerSize = this.sizeX * this.sizeZ;
        this.states = data.states
        this.statePalette = data.statePallete;
    }
    private getIndex(x: number, y: number, z: number): number {
        return (y * this.layerSize) + z * this.sizeX + x;
    }
    public getBlockAt(x: number, y: number, z: number): schematicPaletteBlock {
        return this.statePalette[this.states[this.getIndex(x, y, z)]];
    }
}