import minimist from "minimist";
import colors from "colors";
import fs from "fs";
import moment from "moment";
import * as utils from "./src/utils";

const ARGV = minimist(process.argv.slice(2), {
	string: "destination",
	default: {
		destination: "./downloads",
	},
});

const animes = ARGV._.map(str => utils.parseAnimeStr(str));

// create directory of downloads if it doesn't already exist.
if (!fs.existsSync(ARGV.destination)) {
	fs.mkdirSync(ARGV.destination);
}

const main = async () => {
	// loop over all of the animes specified.
	for (const index in animes) {
		const anime = animes[index];
		console.log(`> [${Number(index) + 1}/${animes.length}] Downloading '${colors.bold(anime.showID)}'`.green);

		const sources = await utils.getSources(anime);
		// if the end range is bigger than the sources actual size, change it.
		if (anime.episodeRange.end > sources.length) {
			anime.episodeRange.end = sources.length;
		}

		const {episodeRange: {start, end}} = anime;
		const episodesStr = end === start	? `EP${start}` : `EP${start} -> EP${end}`;

		console.log(`  + Queued episodes : ${episodesStr}`);

		// create subfolder in the downloads folder (if it doen't exist).
		const {title} = await utils.getShowData(anime);
		const folderPath = `${ARGV.destination}/${title}`;
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}

		// now iterate over each episode in the specified anime.
		for (let episode = start; episode <= end; episode++) {
			// fancy printing of current downloading episode.
			const episodeURL = sources[episode - 1];
			const episodesProgressStr = `${episode - start + 1}/${end - start + 1}`;
			const episodeFilenameStr = episodeURL.substring(episodeURL.lastIndexOf("/") + 1);
			console.log(`  - [${episodesProgressStr}] Downloading EP${episode} : '${episodeFilenameStr}'`.gray);

			const fileName = episodeURL.substring(episodeURL.lastIndexOf("/") + 1);
			const existingFileSize = utils.getFileSize(`${folderPath}/${fileName}`);
			// because we will use this value in the 'Range' header, this value cannot be equal to
			// 100% of the file. {Range: "bytes=0-"} where 0 is the safeRange.
			const safeRange = Math.max(existingFileSize - 1, 0);

			let totalProgress = existingFileSize;
			let intervalProgress = 0; // will be reset each time we calculate the speed;
			let startTime = new Date().getTime();
			let speed = 0;

			await utils.downloadFile({
				url: episodeURL,
				path: folderPath,
				startRange: safeRange,
			}, state => {
				totalProgress += state.chunk.length;
				intervalProgress += state.chunk.length;

				const currentTime = new Date().getTime();
				const deltaTime = currentTime - startTime;

				if (deltaTime > 1000) {
					// if time delta is bigger than one second, we do new speed calculation.
					speed = intervalProgress / deltaTime; // bytes per ms.
					intervalProgress = 0;
					startTime = currentTime;
				}

				const totalData = parseInt(state.headers["content-length"]) + safeRange;
				const progressPercent = totalProgress / totalData;
				const barStr = `[${"#".repeat(Math.round(progressPercent * 40))}${"-".repeat(40 - Math.round(progressPercent * 40))}]`;
				const downloadedStr = `${Math.round(totalProgress / 1000)}/${Math.round(totalData / 1000)}kb`;
				const eta = (totalData - totalProgress) / speed;
				const etaStr = moment.duration(eta, "milliseconds").humanize();
				process.stdout.write(`      ${barStr} ${downloadedStr} (${(progressPercent * 100).toFixed(2)}%) ${Math.round(speed)}kb/s ETA: ${etaStr}    \r`);
			});
		}
	}
	console.log(`\n${"√".green} All tasks completed`.bold);
};

main();
