// @ts-check

import path from 'path';
import fs from 'fs';

import { forceCopy, getFileList } from './utils.js';

import {
	CONFIG,
	COPY_FOLDERS,
	COPY_PATH,
	GAMEINFO_FILE,
	GAMEINFO_FOLDER,
	MAPLIST,
	MAPS_FOLDER,
	MATERIALS_FOLDER,
	SOUNDS_FOLDER
} from './consts.js';

import { ModManager } from './modules/ModManager.js';
import { MDLReader } from "./modules/MdlReader.js";
import { VMFReader } from "./modules/VmfReader.js";
import { VMTReader } from './modules/VMTReader.js';

const GameInfoManager = new ModManager(GAMEINFO_FILE);

/**
 * @param { string } modelPath
 */
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


/**
 * @param { string } materialPath
 */
const copyMaterial = (materialPath) => {
	const base = path.resolve(MATERIALS_FOLDER, String(materialPath).toLowerCase());
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

/**
 * @param { string } asset
 */
const copySound = (asset) => {
	const from = path.resolve(SOUNDS_FOLDER, asset);
	const to = path.resolve(COPY_PATH, 'sound', asset);

	forceCopy(from, to);
}

const copyBsp = (map) => {
	const from = path.resolve(MAPS_FOLDER, map);
	const to = path.resolve(COPY_PATH, 'maps', map);

	forceCopy(from, to);
}


console.log('Prepare maps...');
const assets = MAPLIST
	.filter(map => {
		if (!CONFIG.excludeMaps) return true;

		return !CONFIG.excludeMaps.some(file => map.includes(file));
	})
	.map(map => {
		const bsp = map.split(/[\\\/]/).pop().split('.')[0] + '.bsp';

		copyBsp(bsp);

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
		.filter(asset => String(asset).endsWith('.mdl'))
		.forEach(asset => {
			const assetPath = path.resolve(GAMEINFO_FOLDER, asset);

			if (fs.existsSync(assetPath)) {
				const modelData = new MDLReader(assetPath);

				assets.push(...modelData.materialList);
			}
		});
}

const copyAssets = () => {
	assets.forEach(asset => {
		const ext = String(asset).split('.').pop();
		
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

const copyImportantFiles = () => {
	const rootFiles = getFileList(GAMEINFO_FOLDER, '', false);
	let files = COPY_FOLDERS
		.map(folder => {
			const fullPath = path.resolve(GAMEINFO_FOLDER, folder);
	 		return getFileList(fullPath, '', true);
	 	})
		.flat();

	files.push(...rootFiles);

	files = files
		.map(asset => asset
				.replace(GAMEINFO_FOLDER, '')
				.replace(/\\/g, '/')
				.replace(/^\//, ''));



	if (CONFIG.exclude) {
		files = files
			.filter(asset => {
				const isExcluded = CONFIG.exclude
					.some(file => asset.includes(file))

				if (isExcluded) {
					console.log('EXCLUDED: ', asset);
				}

				return !isExcluded;
			});
	}

	files.forEach((asset) => {
		const from = path.resolve(GAMEINFO_FOLDER, asset);
		const to = path.resolve(COPY_PATH, asset);

		forceCopy(from, to);
	});
}


console.log('Collecting assets...');
prepareSounds();
prepareMaterialsFromModels();
copyAssets();
copyImportantFiles();

console.log('Assets prepared');
