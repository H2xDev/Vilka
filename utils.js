// @ts-check

const fs = require('fs');
const path = require('path');

/**
 * Creates needed directories and do copy
 * @param { string } from
 * @param { string } to
 */
const forceCopy = (from, to) => {
  if (!fs.existsSync(from))
    return // console.log('NO FILE: ', from);

	// console.log('COPY FILE: ', from);

	const toDir = path.dirname(to);
	fs.mkdirSync(toDir, { recursive: true });
	fs.copyFileSync(from, to);
}

/**
 * Returns file list from directory
 * @param { string } startPath
 * @param { string } filter works by "includes" principe
 * @param { boolean } recurse
 * 
 * @returns { string[] }
 */
const getFileList = (startPath, filter, recurse = true) => {
    const foundFiles = [];

    if (!fs.existsSync(startPath)){
        return [];
    }

    var files = fs.readdirSync(startPath);

    for(let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);

        if (stat.isDirectory() && recurse){
            foundFiles.push(...getFileList(filename, filter));
        } else if (filename.indexOf(filter) >= 0) {
            if (!stat.isDirectory()) {
                foundFiles.push(filename);
            }
        };
    };

    return foundFiles;
};

module.exports = {
    getFileList,
    forceCopy,
};
