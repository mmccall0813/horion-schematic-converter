import * as NBT from "prismarine-nbt";
import { LitematicReader, schematicPaletteBlock } from "./schematicController";

export interface Litematic extends NBT.NBT {
    value: {
        Metadata: {
            type: NBT.TagType.Compound,
            value: {
                Author: {
                    type: NBT.TagType.String
                    value: string
                }
                Description: {
                    type: NBT.TagType.String
                    value: string
                }
                EnclosingSize: {
                    type: NBT.TagType.Compound
                    value: {
                        x: {type: NBT.TagType.Int, value: number},
                        y: {type: NBT.TagType.Int, value: number},
                        z: {type: NBT.TagType.Int, value: number}
                    }
                }
                Name: {
                    type: NBT.TagType.String
                    value: string
                }
                RegionCount: {
                    type: NBT.TagType.Int
                    value: number
                }
                TimeCreated: {
                    type: NBT.TagType.Long
                    value: [number, number]
                }
                TimeModified: {
                    type: NBT.TagType.Long
                    value: [number, number]
                }
                TotalBlocks: {
                    type: NBT.TagType.Int
                    value: number
                }
                TotalVolume: {
                    type: NBT.TagType.Int
                    value: number
                }
            }
        }
        MinecraftDataVersion: {
            type: NBT.TagType.Int
            value: number
        }
        Regions: {
            type: NBT.TagType.Compound
            value: Record<string, LitematicRegion>
        }
        Version: {
            type: NBT.TagType.Int
            value: number
        }
    }
}

interface LitematicRegion extends NBT.NBT {
    type: NBT.TagType.Compound
    value: {
        BlockStatePalette: {
            type: NBT.TagType.List
            value: {
                type: NBT.TagType.Compound
                value: Array<{
                    Name: {
                        type: NBT.TagType.String
                        value: string;
                    }
                    Properties?: {
                        type: NBT.TagType.Compound
                        value: Record<string, {type: NBT.TagType.String, value:string}>
                    }
                }>
            }
        }
        BlockStates: NBT.Tags["longArray"]
        /*
        Im skipping Entities, PendingBlockTicks, and PendingFluidTicks, as I do not plan on using them.
        */
        Position: {
            type: NBT.TagType.Compound
            value: {
                x: {type: NBT.TagType.Int, value:number}
                y: {type: NBT.TagType.Int, value:number}
                z: {type: NBT.TagType.Int, value:number}
            }
        }
        Size: {
            type: NBT.TagType.Compound
            value: {
                x: {type: NBT.TagType.Int, value:number}
                y: {type: NBT.TagType.Int, value:number}
                z: {type: NBT.TagType.Int, value:number}
            }
        }
        /*
        TileEntities are planned, but unsupported as of now, so im not going through the trouble of writing out the types
        */
    }
}

export interface litematicData {
    states: Array<number>
    statePallete: Array<schematicPaletteBlock>
    size: {
        x: number,
        y: number,
        z: number
    }
}

export function parseLitematic(litematic: Litematic): LitematicReader {
    let regions = Object.keys(litematic.value.Regions.value);
    let blockStates: Record<string, Array<number>> = {};
    
    regions.forEach( (region) => {
        blockStates[region] = parseBlockStates(litematic.value.Regions.value[region]);
    })

    // TODO: allow the user to select which region they want to build
    // for now, we'll just use the first one
    let size = litematic.value.Regions.value[regions[0]].value.Size.value;
    let data: litematicData = {
        states: blockStates[regions[0]],
        statePallete: litematic.value.Regions.value[regions[0]].value.BlockStatePalette.value.value
        .map( (block) => {
            return {"Name": block.Name.value, "Properties": block.Properties?.value}
        }),
        size: {
            x: Math.abs(size.x.value),
            y: Math.abs(size.y.value),
            z: Math.abs(size.z.value)
        }
    }

    return new LitematicReader(data);
}

function parseBlockStates(region: LitematicRegion){
    let blockStates = region.value.BlockStates.value;

    // parsing the bit array
    // this is going to be hell

    let nbits = Math.ceil(Math.log2(region.value.BlockStatePalette.value.value.length));
    
    // shove everything into a bigint64 array
    let intarr = new BigUint64Array(blockStates.length);

    for(let i = 0; i < blockStates.length; i++){
        intarr[i] = ( BigInt(blockStates[i][0] >>> 0) << 32n ) + BigInt(blockStates[i][1] >>> 0);
    }

    let blocks = [];
    let sz = region.value.Size.value;
    let vol = Math.abs(sz.x.value) * Math.abs(sz.y.value) * Math.abs(sz.z.value);
    let mask = (1 << nbits) - 1;

    let before = performance.now();

    for(let i = 0; i < vol; i++){
        let index = (nbits * i) >> 6; // divide 64
        let offset = BigInt(nbits * i) & (64n-1n); // mod 64
        let inverseoffset = (64n - offset); 
        let val = (intarr[index] >> offset) & BigInt(mask);

        if(nbits + Number(offset) > 64){
            val += (intarr[index+1] & (BigInt(mask) >> inverseoffset )) << inverseoffset;
        }

        blocks.push(Number(val));
    }

    let after = performance.now();
    
    console.log("Parsing block int array took " + (after-before) + "ms");

    return blocks;
}