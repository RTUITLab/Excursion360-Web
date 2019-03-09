import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration";

document.addEventListener("DOMContentLoaded", async () => {
    var viewer = new Viewer();
    viewer.createScene();
    await viewer.load(Configuration.SceneURL);
});