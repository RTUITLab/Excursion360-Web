import { LinkToState } from "./LinkToState";
import { GroupLink } from "./GroupLink";
import { FieldItem } from "./FieldItem";
import { FieldItemInfo } from "./FieldItemInfo";
import {
  AssetsManager,
  Scene,
  Vector3,
  Material,
  StandardMaterial,
  AbstractMesh,
  Animation,
} from "@babylonjs/core/index";
import { GUI3DManager } from "@babylonjs/gui/index";
import { GroupConnectionViewMode } from "./ExcursionModels/GroupLink";

// TODO reuse link objects
export class LinkToStatePool {
  private linkAnimation: Animation;
  private links: LinkToState[] = [];
  // private timer: NodeJS.Timeout;

  constructor(
    private assetsManager: AssetsManager,
    private guiManager: GUI3DManager,
    private scene: Scene
  ) {
    var animationBox = new Animation(
      "linkToStateAnimation",
      "rotation.y",
      15,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    var keys = [
      {
        frame: 0,
        value: 0,
      },
      {
        frame: 30,
        value: Math.PI,
      },
      {
        frame: 60,
        value: Math.PI * 2,
      },
    ];
    animationBox.setKeys(keys);
    this.linkAnimation = animationBox;
  }

  public getLink(
    name: string,
    position: Vector3,
    material: Material,
    triggered: () => Promise<void>
  ): LinkToState {
    const link = new LinkToState(
      name,
      position,
      material,
      triggered,
      this.linkAnimation,
      this.scene
    );
    this.links.push(link);
    return link;
  }

  public getGroupLink(
    name: string,
    viewMode: GroupConnectionViewMode,
    states: { title: string; id: string }[],
    infos: string[],
    position: Vector3,
    positionDetails: { scale: number; titleYPosition: number },
    material: Material,
    clickSphere: (gl: GroupLink) => Promise<void>,
    goToSceneTriggered: (id: string) => Promise<void>
  ): GroupLink {
    const link = new GroupLink(
      name,
      viewMode,
      states,
      infos,
      position,
      positionDetails,
      material,
      clickSphere,
      goToSceneTriggered,
      this.linkAnimation,
      this.guiManager,
      this.scene
    );
    this.links.push(link);
    return link;
  }

  public getFieldItem(
    name: string,
    fieldItemInfo: FieldItemInfo,
    onOpen: (fi: FieldItem) => Promise<void>,
    onPlayMedia: () => void,
    material: StandardMaterial
  ): FieldItem {
    const link = new FieldItem(
      name,
      fieldItemInfo,
      onOpen,
      onPlayMedia,
      material.clone(name),
      this.assetsManager,
      this.guiManager,
      this.scene
    );
    this.links.push(link);
    return link;
  }

  public clean(): void {
    for (const link of this.links) {
      link.dispose();
    }
    this.links = [];
  }

  public isLinkMesh(mesh: AbstractMesh): boolean {
    return this.links.some((l) => l.isLinkMesh(mesh));
  }
}
