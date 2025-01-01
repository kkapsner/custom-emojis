"use strict";

const child_process = require("child_process");
const path = require("path");
const ftp = require("basic-ftp");

const fs = require("fs");

function twoDigits(number){
	if (number < 10){
		return "0" + number.toFixed(0);
	}
	return number.toFixed(0);
}

function updateVersion(version){
	const parts = version.split(".");
	if (parts.length < 2){
		parts[1] = "0";
	}
	const now = new Date();
	const date = `${now.getFullYear()}${twoDigits(now.getMonth() + 1)}${twoDigits(now.getDate())}`;
	let index = -1;
	if (parts.length > 2 && parts[2].startsWith(date) && parts[2].length === 9){
		index = parseInt(parts[2].substring(8), 10);
	}
	index += 1;
	if (index > 9){
		throw "unable to create more than 10 versions per day";
	}
	parts[2] = `${date}${index}`;
	return parts.join(".");
}

async function run(){
	const baseFolder = path.join(__dirname, "..");
	
	const manifest = require("../manifest.json");
	console.log("updating version");
	manifest.version = updateVersion(manifest.version);
	console.log("... new:", manifest.version);
	console.log("updating manifest.json");
	await fs.promises.writeFile(
		path.join(baseFolder, "manifest.json"),
		JSON.stringify(manifest, undefined, "\t"),
		{encoding: "utf-8"}
	);
	
	const outputFolder = path.join(baseFolder, "mail-ext-artifacts");
	try {
		await fs.promises.access(outputFolder, fs.constants.F_OK);
	}
	catch (e){
		if (e.code === "ENOENT"){
			console.log("Creating", outputFolder);
			await fs.promises.mkdir(outputFolder);
		}
		else {
			throw e;
		}
	}
	
	const fileName = `${manifest.name}-${manifest.version}.xpi`.replace(/\s+/g, "-");
	const filePath = path.join(outputFolder, fileName);
	try {
		await fs.promises.unlink(filePath);
	}
	catch (e){
		// do nothing if the deletion failed
	}
	
	const exclude = [
		"mail-ext-artifacts/", "mail-ext-artifacts/*",
		"data/*.txt",
		"versions/*",
		"eslint.config.mjs",
		"README.md",
		"node_modules/*", ".*", "**/.*", "package*", "src/"];
	
	const args = ["-r", filePath, "./", "--exclude", ...exclude];
	
	process.chdir(baseFolder);
	console.log("zip files");
	await new Promise(function(resolve, reject){
		child_process.spawn("zip", args, {stdio: "inherit"}).on("close", resolve);
	});
	
	console.log("updating updates.json");
	const updates = require("../versions/updates.json");
	updates.addons["custom-emojis@kkapsner.de"].updates.push({
		"version": manifest.version,
		"update_link": `https://custom-emojis.kkapsner.de/versions/${fileName}`
	});
	const updatesPath = path.join(baseFolder, "versions", "updates.json");
	await fs.promises.writeFile(updatesPath, JSON.stringify(updates, undefined, "\t"));
	
	const ftpConfig = require("../.ftpConfig.json");
	console.log("pushing files to FTP");
	const ftpClient = new ftp.Client();
	// ftpClient.ftp.verbose = true;
	await ftpClient.access(ftpConfig);
	await [filePath, updatesPath].reduce(async function(previous, localPath){
		await previous;
		console.log("sending", localPath);
		await ftpClient.uploadFrom(localPath, "versions/" + path.basename(localPath));
		console.log("upload finished for", localPath);
	}, Promise.resolve());
	ftpClient.close();
}

run().catch(console.error);
