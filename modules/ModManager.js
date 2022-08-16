// @ts-check

import fs from 'fs';
import path from 'path';
import {getFileList} from '../utils.js';

import { loadResource } from './ResReader.js';


export class ModManager {

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
        return [weaponData.viewmodel, weaponData.playermodel];
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
      .map(([key, data]) => {
        if (data.wave) {
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
