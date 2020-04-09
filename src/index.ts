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
    const viewer = new Viewer(configuration.data);
    viewer.createScene();
    await viewer.show(response.data);
});
