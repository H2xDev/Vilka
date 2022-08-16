import fs from 'fs';
import path from 'path';
import { loadResource } from './ResReader.js';

let INITIALIZED_MANAGER;

export class GameSoundsManager {
  soundManifest = {};

  constructor(gameinfoPath) {
    if (INITIALIZED_MANAGER) return INITIALIZED_MANAGER;

    const MANIFEST_PATH = path.resolve(gameinfoPath, 'scripts/game_sounds_manifest.txt');

    const manifest = loadResource(MANIFEST_PATH);
    manifest.game_sounds_manifest.precache_file
      .map(file => {
        const soundFile = path.resolve(gameinfoPath, file);
        
        if (!fs.existsSync(soundFile)) return;

        const data = loadResource(soundFile);
        
        this.soundManifest = {
          ...this.soundManifest,
          ...data,
        };
      });

    this.soundManifest = Object.fromEntries(
      Object.entries(this.soundManifest).map(([key, data]) => {
        if (data.wave) {
          data.wave = data.wave.replace(/\\/g, '/');
        }
        return [key, data.wave || data.rndwave.wave];
      }),
    );

    INITIALIZED_MANAGER = this;
  }
}
