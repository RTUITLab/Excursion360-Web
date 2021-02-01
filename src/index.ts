import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration/Configuration";
import axios from "axios";
import { Excursion } from "./Models/ExcursionModels/Excursion";
import { BuildConfiguration } from "./Configuration/BuildConfiguration";

document.addEventListener("DOMContentLoaded", async () => {

    const configuration = await axios.get<Configuration>(BuildConfiguration.ConfigFilePath || "config.json");
    if (configuration.status !== 200) {
        console.warn("Can't get configuration");
        return;
    }

    const response = await axios.get<Excursion>(configuration.data.sceneUrl + "tour.json");
    if (response.status !== 200) {
        console.warn("Can't get scene description");
        return;
    }
    if (!response.data.tourProtocolVersion) {
        alert("Too old protocol (without version), use new builder or old viewer");
        return;
    }
    if (response.data.tourProtocolVersion != "v0.7") {
        alert(`That viewer supports only tour v0.7, please use another viewer or builder (now try ${response.data.tourProtocolVersion})`);
        return;
    }
    const viewer = new Viewer(configuration.data);
    viewer.createScene();
    (document as any).viewer = viewer;
    await viewer.show(response.data);
});
