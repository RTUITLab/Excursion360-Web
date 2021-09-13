import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration/Configuration";
import axios from "axios";
import { Excursion } from "./Models/ExcursionModels/Excursion";
import { BuildConfiguration } from "./Configuration/BuildConfiguration";

const supportedTourVersion = "v0.9";

document.addEventListener("DOMContentLoaded", async () => {

    console.log(`excursion viewer ${supportedTourVersion}`);
    const configuration = await axios.get<Configuration>(BuildConfiguration.ConfigFilePath || "config.json");
    if (configuration.status !== 200) {
        console.warn("Can't get configuration");
        return;
    }
    const viewer = new Viewer(configuration.data);
    viewer.createScene();
    (document as any).viewer = viewer;
    try {
        const response = await axios.get<Excursion>(configuration.data.sceneUrl + "tour.json");
        if (response.status !== 200) {
            console.warn("Can't get scene description");
            return;
        }
        const excursion = response.data;
        if (!excursion.tourProtocolVersion) {
            alert("Too old protocol (without version), use new builder or old viewer");
            return;
        }
        if (excursion.tourProtocolVersion != supportedTourVersion) {
            alert(`That viewer supports only tour ${supportedTourVersion}, please use another viewer or builder (now try ${response.data.tourProtocolVersion})`);
            return;
        }
        console.table({
            title: excursion.title,
            id: excursion.id,
            buildTime: new Date(excursion.buildTime),
            versionNum: excursion.versionNum,
            protocolVersion: excursion.tourProtocolVersion
        });
        await viewer.show(excursion);
    } catch (error) {
        console.error(error);
        alert(`Can't load excursion from ${configuration.data.sceneUrl}`);
    }
});
