import * as fs from "fs-extra";


const persistentDirectory = "./data";

function getContentFromArchives(name: string): string {
	return fs.readFileSync("test/resources/archive/" + name).toString("base64");
}

function clearDisk(): void {
	fs.removeSync(persistentDirectory);
}

export {getContentFromArchives, persistentDirectory, clearDisk};
