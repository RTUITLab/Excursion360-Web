import * as GUI from "babylonjs-gui";

import { ILoadingScreen } from "babylonjs";

export class StateChangeLoadingScreen implements ILoadingScreen {

    public displayLoadingUI: () => void;
    public hideLoadingUI: () => void;
    public loadingUIBackgroundColor: string;
    public loadingUIText: string;
    
    private textBlock: GUI.TextBlock;

    constructor(private gui: GUI.AdvancedDynamicTexture) {
        this.displayLoadingUI = () => this.displayUIInternal();
        this.hideLoadingUI =    () => this.hideLoadingUIInternal();

        this.textBlock = new GUI.TextBlock("StateChangeLoadingScreen TextBlock", "Загрузка...");
        this.textBlock.isVisible = false;
        gui.addControl(this.textBlock);
    }

    
    private displayUIInternal(): void {        
        this.textBlock.isVisible = true;
    }

    private hideLoadingUIInternal(): void {
        this.textBlock.isVisible = false;
    }
}