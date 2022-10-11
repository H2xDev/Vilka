const fs = require('fs');
const path = require('path');
const { getFileList } = require('./utils.js');

const IMPORTANT_FOLDERS = [
	'resource',
	'bin',
	'scripts',
	'scenes',
	'cfg',
];

const CONFIG = {};
const GAMEINFO_FOLDER = process.argv[2];
const CONFIG_FILE = path.resolve(GAMEINFO_FOLDER, 'vilka.config.json');
const GAMEINFO_FILE = path.resolve(GAMEINFO_FOLDER, 'gameinfo.txt');
const MAPSRC_FOLDER = path.resolve(GAMEINFO_FOLDER, 'mapsrc');
const MAPS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'maps');
const SOUNDS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'sound');
const MATERIALS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'materials');
const RELEASE_PATH = path.resolve(GAMEINFO_FOLDER, 'release');

/** @type { string[] } */
const MAPLIST = getFileList(MAPSRC_FOLDER, '.vmf', true);

const Authors = [
	`┌───────────────────────────────┐
│                               │
│             ┌─────────────    │
│  VILKA      │                 │
├─────────────┼──────────────   │
│  v 1.0      │                 │
│             └─────────────    │
│                               │
│  Created by                   │
│  RADIK "H2x" KHAMATDINOV      │
│                               │
│  Technical Assistance         │
│  ALEXANDER "KAJAJJJ" VESELOV  │
│                               │
│  Testing                      │
│  EDUARD "MYCbEH" ROSTOVTSEV   │
│                               │
│                               │
│  h2xdev.github.io             │
│                               │
└───────────────────────────────┘
`,
];

console.log(Authors.join('\n'));

// TODO: Add config scheme validation
if (fs.existsSync(CONFIG_FILE)) {
	console.log('Config detected');
	Object.assign(CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE).toString()));

	if (CONFIG.include) {
		IMPORTANT_FOLDERS.push(...CONFIG.include);
	}
}

module.exports = {
	CONFIG,
	GAMEINFO_FOLDER,
	CONFIG_FILE,
	GAMEINFO_FILE,
	MAPSRC_FOLDER,
	MAPS_FOLDER,
	SOUNDS_FOLDER,
	MATERIALS_FOLDER,
	RELEASE_PATH,
	MAPLIST,
	IMPORTANT_FOLDERS,

	Authors,
};
