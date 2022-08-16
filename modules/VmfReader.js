// @ts-check

import { ModManager } from "./ModManager.js";
import { loadResource } from "./ResReader.js";

export class VMFReader {
  mapData = {};

  constructor(filename) {
    this.mapData = loadResource(filename);
  }

  get materialList() {
    const { solid: solids, skyname } = this.mapData.world;
    const { entity: entities } = this.mapData;

    const geometryMaterials = Array.isArray(solids)
      ? new Set(
        solids
          .map(solid => {
            const { side: sides } = solid;

            return sides.map(side => {
              return side.material;
            });
          })
          .flat(),
      )
      :[];

    const entityMaterials = Array.isArray(entities)
      ? new Set(
        entities.map(ent => ent.material).filter(m => !!m),
      )
      : [];

    const skyMaterials = 'bk,dn,dn,lf,rt,up'.split(',').map(skySide => `skybox/${skyname}${skySide}`);

    return [
      ...geometryMaterials,
      ...entityMaterials,
      ...skyMaterials,
    ];
  }

  get modelList() {
    const { entity: entities } = this.mapData;

    if (!entities) return [];

    return Array.isArray(entities)
      ? entities
        .map(ent => ent.model)
        .filter(m => !!m) 
      : [];
  }

  get soundList() {
    const { entity: entities } = this.mapData;
    const modManager = new ModManager();

    if (!entities) return [];

    return (Array.isArray(entities) ? entities : [entities])
      .filter(ent => ent.classname === 'ambient_generic' && ent.message)
      .map(ent => {
        const isScriptedSound = true
          && !ent.message.endsWith('.wav')
          && !ent.message.endsWith('.mp3');

        if (isScriptedSound) {
          return modManager.scriptedSoundList[ent.message];
        }

        return ent.message;
      })
      .filter(e => !!e);
  }
}
