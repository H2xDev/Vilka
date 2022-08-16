import path from 'path';
import fs from 'fs';

import { forceCopy } from './utils.js';

import {
	COPY_PATH,
	GAMEINFO_FILE,
	GAMEINFO_FOLDER,
	MATERIALS_FOLDER,
	SOUNDS_FOLDER
} from './consts.js';

import { ModManager } from './modules/ModManager.js';
import { MDLReader } from "./modules/MdlReader.js";
import { VMFReader } from "./modules/VmfReader.js";
import { VMTReader } from './modules/VMTReader.js';

const GameInfoManager = new ModManager(GAMEINFO_FILE);

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

const copyMaterial = (materialPath) => {
	const base = path.resolve(MATERIALS_FOLDER, materialPath.toLowerCase());
	const vmt = base + '.vmt';

	if (!fs.existsSync(vmt)) return;

	const from = vmt;
	const to = path.resolve(COPY_PATH, 'materials', materialPath.toLowerCase() + '.vmt');

	forceCopy(from, to);

	const data = new VMTReader(vmt);

	data.vtfs
		.map(tex => {
			const from = path.resolve(MATERIALS_FOLDER, tex.toLowerCase());
			const to = path.resolve(COPY_PATH, 'materials', tex.toLowerCase());

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

const prepareSounds = () => assets.push(...GameInfoManager.weaponAssets);

const prepareMaterialsFromModels = () => {
	assets
		.filter(asset => asset.endsWith('.mdl'))
		.forEach(asset => {
			const assetPath = path.resolve(GAMEINFO_FOLDER, asset);

			if (fs.existsSync(assetPath)) {
				const modelData = new MDLReader(assetPath);

				assets.push(...modelData.materialList);
			}
		});
}

const copySound = (asset) => {
	const from = path.resolve(SOUNDS_FOLDER, asset);
	const to = path.resolve(COPY_PATH, 'sound', asset);

	forceCopy(from, to);
}

const copyAssets = () => {
	assets.forEach(asset => {
		const ext = asset.split('.').pop();
		
		switch (ext) {
			case 'mdl':
				return copyModel(asset);

			case 'wav':
			case 'mp3':
				return copySound(asset);

			default:
				return copyMaterial(asset);
		}
	});
}

prepareSounds();
prepareMaterialsFromModels();
copyAssets();

console.log('Assets prepared');
