import { PointerEventTypes, type PointerInfo } from "@babylonjs/core";
import type { Sound } from "@babylonjs/core/Audio/sound";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

declare global {
	interface Window {
		showApproveAudioModal(
			approvedCallback: () => void,
			cancelledCallback: () => void,
		): void;
	}
}

export class PlayAudioHelper {
	public static subscribeToAudioLockEvent() {
		Engine.audioEngine.onAudioLockedObservable.add((audioEngine) => {
			window.showApproveAudioModal(
				() => {
					audioEngine.unlock();
				},
				() => {},
			);
		});
	}
	private static showModalAlreadyOpened = false;
	private static gestureDetected = false;
	/** Запускает аудио, при необходимости спрашивает разрешения у пользователя на его запуск
	 * Если вызвано с forceShowModal не true - окно покажется единожды
	 */
	public static playSound(
		sound: Sound | null,
		scene: Scene,
		options?: {
			/** Функция проверки, нужно ли еще запускать это аудио на момент подтверждения работы аудио */
			ensureToPlay?: () => boolean;
			/** Если передано true - модальное окно с запросом разрешения покажется если аудио контекст заблокирован */
			forceShowModal?: boolean;
			/** Если передано true - будет выполнена попытка разблокировать аудио в процессе обработки заблокированного состояния*/
			forceUnlock?: boolean;
			playSuccess?: () => void;
		},
	) {
		if (!sound) {
			return;
		}
		if (!sound.isReady()) {
			return;
		}
		if (Engine.audioEngine.unlocked) {
			sound.play();
			options?.playSuccess?.call(null);
			return;
		}
		if (PlayAudioHelper.showModalAlreadyOpened && !options?.forceShowModal) {
			return;
		}
		const playIfNeedCallback = () => {
			Engine.audioEngine.onAudioUnlockedObservable.removeCallback(
				playIfNeedCallback,
			);
			if (sound.isPlaying) {
				return;
			}
			if (!options?.ensureToPlay) {
				sound.play();
				options?.playSuccess?.call(null);
			} else if (options.ensureToPlay()) {
				sound.play();
				options?.playSuccess?.call(null);
			}
		};
		Engine.audioEngine.onAudioUnlockedObservable.addOnce(playIfNeedCallback);

		const showModal = () => {
			window.showApproveAudioModal(
				() => Engine.audioEngine.unlock(),
				() =>
					Engine.audioEngine.onAudioUnlockedObservable.removeCallback(
						playIfNeedCallback,
					),
			);
			PlayAudioHelper.showModalAlreadyOpened = true;
		};

		if (options.forceUnlock) {
			Engine.audioEngine.unlock();
		}

		// Сначала пытаемся обработать просто жест
		if (!PlayAudioHelper.gestureDetected) {
			const gestureListener = (p: PointerInfo) => {
				if (
					p.type !== PointerEventTypes.POINTERMOVE &&
					p.type !== PointerEventTypes.POINTERWHEEL &&
					p.type !== PointerEventTypes.POINTERDOWN
				) {
					PlayAudioHelper.gestureDetected = true;
					Engine.audioEngine.unlock();
					scene.onPointerObservable.removeCallback(gestureListener);
					setTimeout(() => {
						// Если не получилось отработать по жесту - придется показать модалку
						if (!Engine.audioEngine.unlocked) {
							showModal();
						}
					}, 500);
				}
			};
			scene.onPointerObservable.add(gestureListener);
			return;
		}
		// Потом уже показываем модальное окно
		showModal();
	}
}
