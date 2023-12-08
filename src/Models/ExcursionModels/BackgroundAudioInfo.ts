/** background audio pack */
export interface BackgroundAudioInfo {
  id: string;
  loopAudios: boolean;
  audios: string[];
  timer?: {
    start: number,
    end: number
  };
}