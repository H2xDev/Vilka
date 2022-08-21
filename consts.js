// @ts-check

import fs from 'fs';
import path from 'path';
import { getFileList } from "./utils.js";

export const IMPORTANT_FOLDERS = [
	'resource',
	'bin',
	'scripts',
	'scenes',
	'cfg',
];

export const CONFIG = {};
export const GAMEINFO_FOLDER = process.argv[2];
export const CONFIG_FILE = path.resolve(GAMEINFO_FOLDER, 'vilka.config.json');
export const GAMEINFO_FILE = path.resolve(GAMEINFO_FOLDER, 'gameinfo.txt');
export const MAPSRC_FOLDER = path.resolve(GAMEINFO_FOLDER, 'mapsrc');
export const MAPS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'maps');
export const SOUNDS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'sound');
export const MATERIALS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'materials');
export const RELEASE_PATH = path.resolve(GAMEINFO_FOLDER, 'release');

/** @type { string[] } */
export const MAPLIST = getFileList(MAPSRC_FOLDER, '.vmf', true);

export const Authors = [
	"Vilka\n",
	"Created by:",
	'Radik \"H2x\" Khamatdinov',
	"\nTechnical assistance:",
	'Alexander \"KAJAJJJ\" Veselov',
];

console.log(Authors.join('\n'));

// TODO: Add config scheme validation
if (fs.existsSync(CONFIG_FILE)) {
	console.log('CONFIG DETECTED');
	Object.assign(CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE).toString()));

	if (CONFIG.include) {
		IMPORTANT_FOLDERS.push(...CONFIG.include);
	}
}

