import type { Scene } from "@babylonjs/core/scene";
import type { FullScreenGUI } from "../ExcursionFullScreenGUI";
import type { BackgroundAudioInfo } from "../ExcursionModels/BackgroundAudioInfo";
import { AudioContainer } from "./AudioContainer";
import type { IBackgroundAudioEventTrigger } from "./IBackgroundAudioEventTrigger";

/**
 * Компонент фонового аудио, отвечает за воспроизведение и логику его работы
 * TODO: dispose и высвобождение ресурсов
 */
export class BackgroundAudioView {
	private packs: Map<string, AudioContainer> = new Map();
	private currentAudioPack: AudioContainer | null = null;
	private eventTrigger: IBackgroundAudioEventTrigger | null = null;
	private triggerInterval: NodeJS.Timeout;

	private get isPlay(): boolean {
		return this.currentAudioPack?.isPlaying() === true;
	}

	constructor(
		private scene: Scene,
		private sceneUrl: string,
		private fullScreenUI: FullScreenGUI,
		private onStartPlaying: () => void,
	) {
		fullScreenUI.onPlayPauseBackgroundAudioClickObservable.add(() => {
			if (this.currentAudioPack) {
				if (this.isPlay) {
					this.pause();
				} else {
					this.play();
				}
			}
		});
		this.triggerInterval = setInterval(async () => {
			if (!this.currentAudioPack || this.currentAudioPack.isLoading()) {
				this.fullScreenUI.setVisibleIconOnPlayPauseButton(false);
				return;
			}
			this.fullScreenUI.setVisibleIconOnPlayPauseButton(true);
			if (this.currentAudioPack.isPlaying()) {
				this.fullScreenUI.setPauseIconOnPlayPauseButton();
			} else if (this.currentAudioPack.isCanPlay()) {
				this.fullScreenUI.setPlayIconOnPlayPauseButton();
			}
			if (!this.eventTrigger) {
				return;
			}
			await this.eventTrigger.audioPositionChanged(
				this.currentAudioPack.getCurrentTime(),
			);
		}, 200);
	}

	public togglePlayPause() {
		if (!this.currentAudioPack) {
			return;
		}
		if (this.isPlay) {
			this.pause();
		} else {
			this.play();
		}
	}

	public play() {
		this.currentAudioPack?.play(true);
		this.onStartPlaying();
	}

	public pause() {
		this.currentAudioPack?.pause();
	}

	public clearSound() {
		if (this.currentAudioPack) {
			this.currentAudioPack.stop();
		}
		this.currentAudioPack = null;
	}

	public setSound(
		audioInfo: BackgroundAudioInfo | null,
		trigger: IBackgroundAudioEventTrigger | null,
	): void {
		if (audioInfo && audioInfo?.id === this.currentAudioPack?.id) {
			return;
		}

		if (audioInfo) {
			if (this.currentAudioPack) {
				this.currentAudioPack.stop();
			}
			this.eventTrigger = trigger || null;
			if (this.packs.has(audioInfo.id)) {
				this.currentAudioPack = this.packs.get(audioInfo.id);
			} else {
				this.currentAudioPack = new AudioContainer(
					audioInfo,
					this.scene,
					(container) => this.currentAudioPack?.id === container.id,
					this.sceneUrl,
				);
				this.packs.set(audioInfo.id, this.currentAudioPack);
			}
		} else {
			if (this.currentAudioPack) {
				this.currentAudioPack.stop();
			}
		}
	}
}
