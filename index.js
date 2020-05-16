require('dotenv').config();

const axios = require('axios');
const fs = require('fs');

async function makePages(token, count, tld) {
	let pages = [];
	let start = 0;
	count = Math.round(count / 5000);

	for (let i = 0; i <= count; i++) {
		let page = `https://api.codepunch.com/dnfeed.php?t=${token}&f=json&src=added&z=${tld}&limit=5000&start=${start}`;
		pages.push(page);
		start += 5000;
	}

	return pages;
}

async function scrapeDomains(pages, tld) {
	const rawDate = new Date().toString().split(' ');
	const date = `${rawDate[1]}-${rawDate[2]}-${rawDate[3]}`;
	const writeStream = fs.createWriteStream(`${tld.toUpperCase()}-${date}.txt`);
	const pathName = writeStream.path;

	for (let i = 0; i <= pages.length; i++) {
		console.log(i);
		let res = await axios.get(pages[i]);
		res.data.domains.forEach((value) => writeStream.write(`${value.domain}\n`));
	}

	writeStream.on('finish', () => {
		console.log(`wrote all the array data to file ${pathName}`);
	});
	// handle the errors on the write process
	writeStream.on('error', (err) => {
		console.error(`There is an error writing the file ${pathName} => ${err}`);
	});

	// close the stream
	writeStream.end();
}

async function main(tld) {
	// await connectToMongoDb();

	const token = await axios
		.get(`https://api.codepunch.com/dnfeed.php?c=auth&k=${process.env.CLIENTID}&s=${process.env.CLIENTSECRET}`)
		.then((res) => res.data.replace('OK: ', ''))
		.catch((err) => console.log(err));

	const res = await axios.get(
		`https://api.codepunch.com/dnfeed.php?t=${token}&f=json&src=added&z=${tld}&limit=5000&start=0`
	);

	const pages = await makePages(token, res.data.count, tld);

	const pagesWithDomains = await scrapeDomains(pages, tld);
}

main('com');
