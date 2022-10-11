// @ts-check

const fs = require('fs');
const path = require('path');
const { getFileList } = require('../utils.js');
const { loadResource } = require('./ResReader.js');

class ModManager {

  /** @type { ModManager | undefined } */
  static currentManager;

  /** @param { string } gameInfoPath */
  constructor(gameInfoPath = '') {
    if (ModManager.currentManager) {
      return ModManager.currentManager;
    }

    this.gameInfoFolder = path.dirname(gameInfoPath);
    this.gameInfo = loadResource(gameInfoPath);
    this.commonAssets = [];

    ModManager.currentManager = this;
  }

  get weaponAssets() {
    const { gameInfoFolder } = this;

    const files = getFileList(path.resolve(gameInfoFolder, 'scripts'), 'weapon_');

    return files
      .map(file => {
        const weaponData = loadResource(file).WeaponData;

        Object
          .keys(weaponData)
          .forEach(key => {
            weaponData[key.toLowerCase()] = weaponData[key];
          });

        const soundData = Object
          .values(weaponData.sounddata || {})
          .map((soundName) => {
            const wave = this.scriptedSoundList[soundName];

            if (!wave) {
              return null;
            }

            return Array.isArray(wave)
              ? wave
              : [wave]
          })
          .flat()
          .filter(wave => !!wave)
          .map(wave => wave.replace('^', ''))

        return [
          weaponData.viewmodel,
          weaponData.playermodel,
          ...soundData,
        ];
      })
      .filter(file => !!file)
      .flat();
  }

  get scriptedSoundList() {
    const { gameInfoFolder } = this;
    let soundManifest = {};

    const MANIFEST_PATH = path.resolve(gameInfoFolder, 'scripts/game_sounds_manifest.txt');
    const manifest = loadResource(MANIFEST_PATH);

    /** @param { string } file sound file */
    const defineSoundScript = file => {
      const soundFile = path.resolve(gameInfoFolder, file);
      
      if (!fs.existsSync(soundFile)) return;

      const data = loadResource(soundFile);
      
      soundManifest = {
        ...soundManifest,
        ...data,
      };
    }

    manifest
      .game_sounds_manifest
      .precache_file
      .forEach(defineSoundScript);

    const updatedEntries = Object
      .entries(soundManifest)
      .filter(([_, data]) => !!data)
      .map(([key, data]) => {
        // NOTE: Avoid duplicates of sound script
        if (Array.isArray(data)) {
          data = data[0];
        }

        if (data && data.wave) {
          data.wave = data.wave.replace(/\\/g, '/');
        }

        return [key, data.wave || data.rndwave.wave];
      });

    return Object
      .fromEntries(updatedEntries);
  }

  get scenesSoundList() {
    return [];
  }
}

module.exports = { ModManager };
