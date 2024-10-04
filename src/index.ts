import * as nbt from "prismarine-nbt";
import {parseLitematic, Litematic} from "./litematic"
import { schematicReader } from "./schematicController";

async function startConversion(file: File){
    const arrBuffer = await file.arrayBuffer();
    const parsed = await nbt.parse(Buffer.from(arrBuffer));

    console.log("Parsed nbt.")
    console.log(parsed); // dont stringify it so we can explore it in the browser console for debugging

    // figure out what type of file we're working with here
    let fileType: "unknown" | "litematic" | "vanilla" | "schematica" = "unknown";

    if(isLitematicaSchematic(parsed.parsed)) fileType = "litematic";
    if(isSchematicaSchematic(parsed.parsed)) fileType = "schematica";
    if(isVanillaSchematic(parsed.parsed)) fileType = "vanilla";
    console.log(`Found a ${fileType} schematic in ${file.name}`);
    
    // if the file type is still unknown, exit here and tell the user that their file is unsupported.
    if(fileType === "unknown"){
        // TODO: notify the user that their file is invalid
        return;
    }

    let reader: schematicReader;

    switch(fileType){
        case "litematic":
            var schematic = parsed.parsed as Litematic; // this probably isnt the best way to do this, but it works and if it doesn't then I need to find a new way to detect litematics
            reader = parseLitematic(schematic);
        break;
        case "schematica":

        break;
        case "vanilla":

        break;
    }

    for(let i = 0; i < reader.sizeY; i++){
        console.log(reader.getBlockAt(0, i, 0));
    }
}

function isLitematicaSchematic(possibleLitematic: nbt.NBT): possibleLitematic is Litematic {
    /*
        Litematics have regions, which no other schematic format (to my knowledge) has. So we just check if the Regions compound exists. If it does, its a litematic!
    */
    if(possibleLitematic.type === nbt.TagType.Compound && possibleLitematic.value?.Regions?.type === nbt.TagType.Compound){
        return true;
    } else return false;
}

function isVanillaSchematic(possibleVanilla: nbt.NBT): boolean {
    /*
        Vanilla schematics have a few unique attributes, the one im choosing to check for is DataVersion
    */
    if(possibleVanilla.type === nbt.TagType.Compound && possibleVanilla.value.DataVersion?.type === nbt.TagType.Int){
        return true;
    } else return false;
}

function isSchematicaSchematic(possibleSchematica: nbt.NBT): boolean {
    /*
        Schematica schematics have the Materials attribute, which no other formats have, so we check for that.
    */
   if(possibleSchematica.type === nbt.TagType.Compound && possibleSchematica.value.Materials?.type === nbt.TagType.String){
        return true;
   } else return false;
}

// add a global function on window
// we access this function in index.html
declare global {
    interface Window { startConversion: Function; }
}

window.startConversion = startConversion;