import fs from 'fs';
import path from 'path';
import {getFileList} from '../utils/fileList.js';

import { loadResource } from './ResReader.js';

export class ModManager {
  constructor(gameInfoPath) {
    this.gameInfoFolder = path.dirname(gameInfoPath);
    this.gameInfo = loadResource(gameInfoPath);
    this.commonAssets = [];
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
}
