export interface IBackgroundAudioEventTrigger {
	audioPositionChanged(positionInSeconds: number): Promise<void>;
}

export class IntervalBackgroundAudioEventTrigger
	implements IBackgroundAudioEventTrigger
{
	private intervalEntered = false;
	constructor(
		private startSeconds: number,
		private endSeconds: number,
		private onEnterInInterval: () => Promise<void>,
		private onExitFromInterval: () => Promise<void>,
	) {}
	public async audioPositionChanged(positionInSeconds: number): Promise<void> {
		if (
			positionInSeconds >= this.startSeconds &&
			positionInSeconds <= this.endSeconds &&
			!this.intervalEntered
		) {
			this.intervalEntered = true;
			await this.onEnterInInterval();
		} else if (positionInSeconds > this.endSeconds && this.intervalEntered) {
			this.intervalEntered = false;
			await this.onExitFromInterval();
		}
	}
}

export class ArrayTrigger implements IBackgroundAudioEventTrigger {
	constructor(private triggers: IBackgroundAudioEventTrigger[]) {}

	async audioPositionChanged(positionInSeconds: number): Promise<void> {
		await Promise.all(
			this.triggers.map((t) => t.audioPositionChanged(positionInSeconds)),
		);
	}
}
