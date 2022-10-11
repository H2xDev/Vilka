// @ts-check

const fs = require('fs');
const path = require('path');

const {
	forceCopy,
	getFileList,
} = require('./utils.js');

const {
	CONFIG,
	IMPORTANT_FOLDERS,
	RELEASE_PATH,
	GAMEINFO_FILE,
	GAMEINFO_FOLDER,
	MAPLIST,
	MAPS_FOLDER,
	MATERIALS_FOLDER,
	SOUNDS_FOLDER,
} = require('./consts.js');

const { ModManager } = require('./modules/ModManager.js');
const { MDLReader } = require('./modules/MdlReader.js');
const { VMFReader } = require('./modules/VmfReader.js');
const { VMTReader } = require('./modules/VMTReader.js');

const mod = new ModManager(GAMEINFO_FILE);

const copyModel = (modelPath) => {
	'.mdl,.sw.vtx,.vvd,.ani,.dx80.vtx,.dx90.vtx,.phy'
		.split(',')
		.map(ext => modelPath.replace('.mdl', ext))
		.forEach(file => {
			const from = path.resolve(GAMEINFO_FOLDER, file);

			if (!fs.existsSync(from)) {
				return;
			}

			const to = path.resolve(RELEASE_PATH, file);

			forceCopy(from, to);
		});
}

const copyMaterial = (materialPath) => {
	const base = path.resolve(MATERIALS_FOLDER, String(materialPath).toLowerCase());
	const vmt = base + '.vmt';

	if (!fs.existsSync(vmt)) return;

	const from = vmt;
	const to = path.resolve(RELEASE_PATH, 'materials', materialPath.toLowerCase() + '.vmt');

	forceCopy(from, to);

	const data = new VMTReader(vmt);

	data.vtfs
		.map(tex => {
			const from = path.resolve(MATERIALS_FOLDER, tex.toLowerCase());
			const to = path.resolve(RELEASE_PATH, 'materials', tex.toLowerCase());

			forceCopy(from, to);
		});

}

const copySound = (asset) => {
	const from = path.resolve(SOUNDS_FOLDER, asset);
	const to = path.resolve(RELEASE_PATH, 'sound', asset);

	forceCopy(from, to);
}

const copyBsp = (map) => {
	const from = path.resolve(MAPS_FOLDER, map);
	const to = path.resolve(RELEASE_PATH, 'maps', map);

	forceCopy(from, to);
}

const copyRaw = (raw) => {
	const from = path.resolve(GAMEINFO_FOLDER, raw);
	const to = path.resolve(RELEASE_PATH, raw);

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

const prepareWeaponAssets = () => assets.push(...mod.weaponAssets);

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

			case 'raw':
				return copyRaw(asset);

			default:
				return copyMaterial(asset.replace('.vmt', ''));
		}
	});
}

const copyImportantFiles = () => {
	const rootFiles = getFileList(GAMEINFO_FOLDER, '', false);
	let files = IMPORTANT_FOLDERS
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

				return !isExcluded;
			});
	}

	files.forEach((asset) => {
		const from = path.resolve(GAMEINFO_FOLDER, asset);
		const to = path.resolve(RELEASE_PATH, asset);

		forceCopy(from, to);
	});
}


console.log('Collecting assets...');
prepareWeaponAssets();
prepareMaterialsFromModels();

console.log('Building release...');
copyAssets();
copyImportantFiles();

console.log('The release is ready');
