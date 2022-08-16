import path from 'path';
import fs from 'fs';

export const forceCopy = (from, to) => {
	if (!fs.existsSync(from)) return;

	console.log('COPY FILE: ', from);

	const toDir = path.dirname(to);
	fs.mkdirSync(toDir, { recursive: true });
	fs.copyFileSync(from, to);
}

export const getFileList = (startPath, filter, recurse = true) => {
    const foundFiles = [];

    if (!fs.existsSync(startPath)){
				throw new Error(`Directory ${startPath} not found`);
    }

    var files = fs.readdirSync(startPath);

    for(let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);

        if (stat.isDirectory() && recurse){
            foundFiles.push(...getFileList(filename, filter));
        } else if (filename.indexOf(filter) >= 0) {
            foundFiles.push(filename);
        };
    };

    return foundFiles;
};

