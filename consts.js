import { getFileList } from "./utils";

export const COPY_FOLDERS = [
	'resource',
	'bin',
	'scripts',
];

export const ADDITIONAL_ASSET_FOLDERS = [
	'materials/VGUI',
	'materials/CONSOLE',
	'models/props_c17',
	'models/weapons',
	'models/items',
	'models/gibs',
	'models/humans',
];

export const GAMEINFO_FOLDER = process.argv[2];
export const GAMEINFO_FILE = path.resolve(GAMEINFO_FOLDER, 'gameinfo.txt');
export const MAPSRC_FOLDER = path.resolve(GAMEINFO_FOLDER, 'mapsrc');
export const SOUNDS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'sound');
export const COPY_PATH = path.resolve(GAMEINFO_FOLDER, 'release');
export const MAPLIST = getFileList(MAPSRC_FOLDER, '.vmf', true);
