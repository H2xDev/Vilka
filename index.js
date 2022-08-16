import path from 'path';
import fs from 'fs';

import {GameSoundsManager} from './modules/GameSoundsManager.js';

import { MDLReader } from "./modules/MdlReader.js";
import { ModManager } from './modules/ModManager.js';
import { VMFReader } from "./modules/VmfReader.js";
import {getFileList} from './utils/fileList.js';
import {VMTReader} from './modules/VMTReader.js';

const COPY_FOLDERS = [
	'resource',
	'bin',
	'scripts',
];

const ADDITIONAL_ASSET_FOLDERS = [
	'materials/VGUI',
	'materials/CONSOLE',
	'models/props_c17',
	'models/weapons',
	'models/items',
	'models/gibs',
	'models/humans',
];

const GAMEINFO_FOLDER = process.argv[2];
const GAMEINFO_FILE = path.resolve(GAMEINFO_FOLDER, 'gameinfo.txt');
const MAPSRC_FOLDER = path.resolve(GAMEINFO_FOLDER, 'mapsrc');
const SOUNDS_FOLDER = path.resolve(GAMEINFO_FOLDER, 'sound');
const COPY_PATH = path.resolve(GAMEINFO_FOLDER, 'release');
const MAPLIST = getFileList(MAPSRC_FOLDER, '.vmf', true);

const GameInfoManager = new ModManager(GAMEINFO_FILE);
const GameSoundManager = new GameSoundsManager(GAMEINFO_FOLDER);


const copyModel = (modelPath) => {
	'.mdl,.sw.vtx,.vvd,.ani,.dx80.vtx,.dx90.vtx,.phy'
		.split(',')
		.map(ext => modelPath.replace('.mdl', ext))
		.forEach(file => {
			const from = path.resolve(GAMEINFO_FOLDER, file);

			if (!fs.existsSync(from)) {
				return;
			}

			const to = path.resolve(COPY_PATH, file);

			forceCopy(from, to);
		});
}

const forceCopy = (from, to) => {
	if (!fs.existsSync(from)) return;

	console.log('COPY FILE: ', from);

	const toDir = path.dirname(to);
	fs.mkdirSync(toDir, { recursive: true });
	fs.copyFileSync(from, to);
}

const copyMaterial = (materialPath) => {
	const base = path.resolve(GAMEINFO_FOLDER, 'materials', materialPath.toLowerCase());
	const vmt = base + '.vmt';

	if (!fs.existsSync(vmt)) return;

	const from = vmt;
	const to = path.resolve(GAMEINFO_FOLDER, 'release/materials', materialPath.toLowerCase() + '.vmt');

	forceCopy(from, to);

	const data = new VMTReader(vmt);

	data.vtfs
		.map(tex => {
			const from = path.resolve(GAMEINFO_FOLDER, 'materials', tex.toLowerCase());
			const to = path.resolve(GAMEINFO_FOLDER, 'release/materials', tex.toLowerCase());

			forceCopy(from, to);
		});

}

console.log('Collecting assets...');
const assets = MAPLIST
	.map(map => {
		const vmf = new VMFReader(map);
	
		return [
			...vmf.modelList,
			...vmf.materialList,
			...vmf.soundList,
		];
	})
	.flat();

assets.push(...GameInfoManager.weaponAssets);

const loadMaterialsFromModels = () => {
	assets
		.filter(asset => asset.endsWith('.mdl'))
		.forEach(asset => {
			const base = path.resolve(GAMEINFO_FOLDER, asset);

			if (fs.existsSync(base)) {
				const modelData = new MDLReader(base);

				assets.push(...modelData.materialList);
			}
		});
}

const justCopy = (asset) => {
	const from = path.resolve(SOUNDS_FOLDER, asset);
	const to = path.resolve(GAMEINFO_FOLDER, 'release/sound', asset);

	forceCopy(from, to);
}

const copyAssets = () => {
	assets.forEach(asset => {
			if (asset.endsWith('.mdl')) {
				copyModel(asset);
				return;
			}

			if (asset.endsWith('.wav') || asset.endsWith('.mp3')) {
				justCopy(asset);
				return;
			}
	
			copyMaterial(asset);
		});
}

loadMaterialsFromModels();
copyAssets();

console.log('Assets prepared');
