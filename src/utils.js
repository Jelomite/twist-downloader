import CryptoJS from "crypto-js";
import axios from "axios";
import fs from "fs";
// import RequestProgress from "request-progress";

const key = "LXgIVP&PorO68Rq7dTx8N^lP!Fa5sGJ^*XK";

export const parseAnimeStr = str => {
	const matches = /([^/]+)(?:\/(\d+)?(-(\d+)?)?)?$/.exec(str);

	if (!matches) {
		console.error(`Cannot parse '${str}'`);
		return;
	}

	const showID = matches[1];
	// episodes range
	const start = parseInt(matches[2]) || 1;
	const end = matches[3] ? (parseInt(matches[4]) || null) : matches[2] ? start : Infinity;

	return {
		showID,
		episodeRange: {start, end: Math.max(start, end)},
	};
};

export const getSources = ({showID}) => {
	return new Promise((resolve, reject) => {
		axios.get(`https://twist.moe/api/anime/${showID}/sources`, {
			headers: {"x-access-token": "1rj2vRtegS8Y60B3w3qNZm5T2Q0TN2NR"},
		}).then(response => {
			resolve(response.data.map(ep => CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(ep.source, key))));
		}).catch(reject);
	});
};

export const downloadFile = async (url, path, onProgress) => {
	return new Promise((resolve, reject) => {
		const fileName = url.substring(url.lastIndexOf("/") + 1);
		axios.get(`https://twist.moe${url}`, {
			headers: {
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
				"referer": "https://twist.moe",
				"Range": "bytes=0-",
				"Connection": "keep-alive",

			},
			responseType: "stream",
		}).then(({data, headers}) => {
			data.on("data", chunk => onProgress({
				chunk,
				headers,
			}));
			data.pipe(fs.createWriteStream(`${path}/${fileName}`));
			data.on("end", resolve);
		}).catch(err => {
			console.log(err);
			reject();
		});
	});
};
