import { loadResource } from "./ResReader.js";

export class VMTReader {
  constructor(filename) {
    this.data = loadResource(filename);
    [this.vmtData] = Object.values(this.data);    
  }

  get vtfs() {
    const checkProperties = [
			'basetexture',
			'basetexture2',
			'bumpmap',
			'bumpmap2',
			'ambientocclusiontexture',
			'phongexponenttexture',
			'detail',
			'blendmodulatetexture',
			'tooltexture',
			'envmapmask',
			'selfillummask',
		]

    return checkProperties
      .map(key => this.vmtData[key])
      .filter(tex => !!tex)
      .map(tex => tex + '.vtf');
  }
}
