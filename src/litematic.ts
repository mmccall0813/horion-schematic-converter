import * as NBT from "prismarine-nbt";

interface Litematic extends NBT.NBT {
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
        Regions: Record<string, LitematicRegion>
        Version: {
            type: NBT.TagType.Int
            value: number
        }
    }
}

interface LitematicRegion extends NBT.NBT {
    type: NBT.TagType.Compound
    value: {
        BlockStatePallete: {
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

export default async function parseLitematic(litematic: Litematic){
    // for now we only parse the first region, this is subject to change as my understanding of the Litematic format expands
    let regions = litematic
}

function parseBlockStates(states: LitematicRegion){

}