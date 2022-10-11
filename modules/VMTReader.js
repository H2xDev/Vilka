const { loadResource } = require('./ResReader.js');

class VMTReader {
  constructor(filename) {
    this.data = loadResource(filename);
    [this.vmtData] = Object
			.values(this.data);

		if (filename && filename.includes('FLOOR05')) {
			console.log(this.vmtData);
		}

		// NOTE: Since the Source Engine is not case-sensitive we need to bring keys to lowercase.
		Object
			.keys(this.vmtData)
			.forEach(key => {
				this.vmtData[key.toLowerCase()] = this.vmtData[key];
			});
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
			'normalmap',
		]

    return checkProperties
      .map(key => [this.vmtData['$' + key], this.vmtData['360?$' + key]])
			.flat()
      .filter(tex => !!tex)
			.map(tex => tex.includes('.vtf') ? tex : tex + '.vtf');
  }
}

module.exports = { VMTReader };
