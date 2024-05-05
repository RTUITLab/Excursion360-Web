import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration/Configuration";
import { Excursion } from "./Models/ExcursionModels/Excursion";
import { BuildConfiguration } from "./Configuration/BuildConfiguration";

const supportedTourVersion = "v0.9";

document.addEventListener("DOMContentLoaded", async () => {
  console.log(`excursion viewer ${supportedTourVersion}`);
  const configurationResponse = await fetch(
    BuildConfiguration.ConfigFilePath || "config.json"
  );
  if (configurationResponse.status !== 200) {
    console.warn("Can't get configuration");
    return;
  }
  const configuration = (await configurationResponse.json()) as Configuration;
  const viewer = new Viewer(configuration);
  viewer.createScene();
  (document as any).viewer = viewer;
  try {
    const tourResonses = await fetch(configuration.sceneUrl + "tour.json");
    if (tourResonses.status !== 200) {
      console.warn("Can't get scene description");
      return;
    }
    const excursion = (await (
      await fetch(configuration.sceneUrl + "tour.json")
    ).json()) as Excursion;

    if (!excursion.tourProtocolVersion) {
      alert(
        "Too old protocol (without version), use new builder or old viewer"
      );
      return;
    }
    if (excursion.tourProtocolVersion != supportedTourVersion) {
      alert(
        `That viewer supports only tour ${supportedTourVersion}, please use another viewer or builder (now try ${excursion.tourProtocolVersion})`
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
    if (response.status != 200) {
      throw new Error(`Response status is ${response.status}`);
    }
    const jsonResponse = await response.json() as PreloadResources;
    const markappToAdd = jsonResponse.images.reduce((markup, url) => `${markup}\n<link rel="preload" as="image" href="${url}" crossOrigin="anonymous">`, '');
    document.head.innerHTML += markappToAdd;
  } catch (error) {
    console.warn("Can't load preload images", error);
  }
};
loadPreloadImages();
interface PreloadResources {
  images: string[];
}