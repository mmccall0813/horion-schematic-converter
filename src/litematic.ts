import * as NBT from "prismarine-nbt";

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

export async function parseLitematic(litematic: Litematic){
    // for now we only parse the first region, this is subject to change as my understanding of the Litematic format expands
    let regions = Object.keys(litematic.value.Regions.value);
    let blockStates: Record<string, Array<number>> | any /* TODO: remove this any */ = {};
    
    regions.forEach( (region) => {
        blockStates[region] = parseBlockStates(litematic.value.Regions.value[region]);
    })
}

function parseBlockStates(region: LitematicRegion){
    let blockStates = region.value.BlockStates.value;

    let fullBinary = "";

    // time to parse the bit array
    blockStates.forEach( (long) => {
        long.forEach( (number) => {
            let bin = (number >>> 0).toString(2) // binary
            bin = bin.padStart(32, "0");
            
            fullBinary+=bin;
        })
    })
    // split based on palette bit length
    let paletteSize = region.value.BlockStatePalette.value.value.length
    let paletteSizeBits = (paletteSize - 1).toString(2).length;
    let statesBits: Array<string> = fullBinary.match(new RegExp(`.{1,${paletteSizeBits}}`, "g"));

    // get max length of the schematic
    let maxLength = Math.abs(region.value.Size.value.x.value * region.value.Size.value.y.value * region.value.Size.value.z.value);
    statesBits = statesBits.slice(0, maxLength-1);


    let statesInts: Array<number> = statesBits.map( (v) => parseInt(v, 2));

    return statesInts
}