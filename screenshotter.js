#!/usr/bin/env node

const commander = require('commander');
const puppeteer = require('puppeteer');
const lodash = require('lodash');

(async () => {
	try {
		// TODO: options
		// --wait -> load, domcontentloaded, networkidle0, networkidle2

		commander
			.option('--url, <url>', 'Page URL')
			.option('--element, [element]', 'Page Element', '')
			.option('--full-page, [fullPage]', 'Full Page', true)
			.option('--width, [width]', 'Screenshot Width', '')
			.option('--height, [height]', 'Screenshot Height', '')
			.option('--device, [device]', 'Emulate Device', '')
			.option('--path, [path]', 'Save Path', process.cwd())
			.parse(process.argv);

		if (!commander.url) {
			throw 'missing --url option';

			process.exit();
		}

		const browser = await puppeteer.launch(), 
					page = await browser.newPage();

		if (commander.device) {
			const devices = require('puppeteer/DeviceDescriptors'), 
						device = lodash.find(devices, {'name': commander.device});

			if (!device)
				throw `invalid --device ${commander.device}`;

			await page.emulate(device);
		}

		await page.goto(commander.url, 
			{
				waitUntil: 'load'
			}
		);

		let path = `${commander.path}/${new Date().getTime()}.png`;

		if (!commander.fullPage) {
			commander.fullPage = true;
		} else {
			commander.fullPage = JSON.parse(commander.fullPage);
		}

		if (commander.element) {
			const element = await page.$(
				commander.element
			);

			if (!element)
				throw `invalid --element ${commander.element}`;

			await element.screenshot(
				{
					path: path
				}
			);
		} else {
			if (!commander.fullPage && (!commander.width || !commander.height))
				throw 'missing --width and --height options for --full-page=false';
 
			if (!commander.fullPage) {
				await page.setViewport(
					{
						width: Number(commander.width), 
						height: Number(commander.height)
					}
				);
			}

			await page.screenshot(
				{
					path: path, 
					fullPage: commander.fullPage
				}
			);
		}

		console.log('screenshot taken and saved to ' + path);

		await browser.close();
	} catch(err) {
		console.log(err);

		process.exit();
	}
})();