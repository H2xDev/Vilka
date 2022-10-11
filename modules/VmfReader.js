// @ts-check

const { ModManager } = require('./ModManager.js');
const { loadResource } = require('./ResReader.js');

class VMFReader {
  mapData = {};

  constructor(filename) {
    this.mapData = loadResource(filename);
  }

  get materialList() {
    const { solid: solids, skyname } = this.mapData.world;
    let { entity: entities } = this.mapData;
    entities = Array.isArray(entities)
      ? entities
      : [entities];

    const _geometryMaterials = Array.isArray(solids)
      ? solids
        .map(solid => Array.isArray(solid.side)
            ? solid.side.map(side => side.material)
            : [solid.side.material])
        .flat()
      :[];
    const geometryMaterials = new Set(_geometryMaterials);


    const _entityMaterials = entities
      .map(ent => [
        ent.material,
        ent.overlaymaterial,
        ent.texture,

        // NOTE: env_sprite uses model instead of material or texture. Strange .... :/
        ent.classname === "env_sprite"
          ? ent.model
          : null,
      ])
      .flat()
      .filter(m => !!m);

    const entityMaterials = new Set(_entityMaterials);

    const _brushEntityMaterials = entities
      .map(ent => {
        if (!ent.solid) return [];

        // NOTE: ent.solid might be array or object
        ent.solid = Array.isArray(ent.solid)
          ? ent.solid
          : [ent.solid];

        const entMaterials = ent.solid
          .map(sol => sol.side
            ? sol.side.map(s => s.material)
            : [])
          .flat();

        return entMaterials;
      })
      .flat();
    const brushEntityMaterials = new Set(_brushEntityMaterials);

    const _commonFiles = entities.map(ent => ent.filename);
    const commonFiles = new Set(_commonFiles);

    const skyMaterials = 'bk,dn,dn,lf,rt,up'
      .split(',')
      .map(skySide => `skybox/${skyname}${skySide}`);

    return [
      ...geometryMaterials,
      ...entityMaterials,
      ...skyMaterials,
      ...brushEntityMaterials,
      ...commonFiles,
    ].map(m => String(m).replace('.vmt', ''));
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
          const scriptedSoundFile = modManager.scriptedSoundList[ent.message]

          // NOTE: rndwave can have array or single file
          return Array.isArray(scriptedSoundFile)
            ? scriptedSoundFile
            : [scriptedSoundFile];
        }

        return [ent.message];
      })
      .flat()
      .filter(e => !!e);
  }
}

module.exports = { VMFReader };
