import { BuildConfiguration } from "./Configuration/BuildConfiguration";
import type { Configuration } from "./Configuration/Configuration";
import type { Excursion } from "./Models/ExcursionModels/Excursion";
import { Viewer } from "./Viewer";

const supportedTourVersion = "v0.10";

document.addEventListener("DOMContentLoaded", async () => {
	console.log(`excursion viewer ${supportedTourVersion}`);
	const configurationResponse = await fetch(
		BuildConfiguration.ConfigFilePath || "config.json",
	);
	if (configurationResponse.status !== 200) {
		console.warn("Can't get configuration");
		return;
	}
	const configuration = (await configurationResponse.json()) as Configuration;
	const viewer = new Viewer(configuration);
	viewer.createScene(configuration.minFOV, configuration.maxFOV);
	(document as any).viewer = viewer;
	try {
		if (configuration.sceneUrl && !configuration.sceneUrl.endsWith("/")) {
			configuration.sceneUrl += "/";
		}
		const tourResponse = await fetch(configuration.sceneUrl + "tour.json");
		if (tourResponse.status !== 200) {
			console.warn("Can't get scene description");
			return;
		}
		const excursion = (await tourResponse.json()) as Excursion;
		if (!excursion.tourProtocolVersion) {
			alert(
				"Too old protocol (without version), use new builder or old viewer",
			);
			return;
		}
		if (excursion.tourProtocolVersion !== supportedTourVersion) {
			alert(
				`Данный инструмент поддерживает версию протокола ${supportedTourVersion}, пожалуйтса, используйте другой инструмент сборки или просмотра экскурсии (была произведена попытка отобразить экскурсию ${excursion.tourProtocolVersion})`,
			);
			return;
		}
		console.table({
			title: excursion.title,
			id: excursion.id,
			buildTime: new Date(excursion.buildTime),
			versionNum: excursion.versionNum,
			protocolVersion: excursion.tourProtocolVersion,
		});
		await viewer.show(excursion);
	} catch (error) {
		console.error(error);
		alert(`Can't load excursion from ${configuration.sceneUrl}`);
	}
});

const loadPreloadImages = async () => {
	try {
		const response = await fetch("/eapi/preload.json");
		if (response.status !== 200) {
			throw new Error(`Response status is ${response.status}`);
		}
		const jsonResponse = (await response.json()) as PreloadResources;
		const markappToAdd = jsonResponse.images.reduce(
			(markup, url) =>
				`${markup}\n<link rel="preload" as="image" href="${url}" crossOrigin="anonymous">`,
			"",
		);
		document.head.innerHTML += markappToAdd;
	} catch (error) {
		console.warn("Can't load preload images", error);
	}
};
loadPreloadImages();
interface PreloadResources {
	images: string[];
}
