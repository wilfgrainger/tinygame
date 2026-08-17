import * as pc from 'playcanvas';
import type { PlayerSnapshot } from './PlayerController';
import { material, primitive } from '../world/meshFactory';

export class PlayerView {
  readonly root = new pc.Entity('TinyExplorer');
  constructor(app: pc.Application) {
    app.root.addChild(this.root);
    const shirt = material(new pc.Color(0.22, 0.5, 0.68));
    const skin = material(new pc.Color(0.82, 0.63, 0.48));
    const trousers = material(new pc.Color(0.2, 0.25, 0.32));
    primitive(app, 'ExplorerBody', 'capsule', shirt, new pc.Vec3(0, 1.25, 0), new pc.Vec3(0.75, 1.25, 0.75), this.root);
    primitive(app, 'ExplorerHead', 'sphere', skin, new pc.Vec3(0, 2.45, 0), new pc.Vec3(0.75, 0.78, 0.75), this.root);
    primitive(app, 'ExplorerLegL', 'box', trousers, new pc.Vec3(-0.23, 0.35, 0), new pc.Vec3(0.34, 0.8, 0.42), this.root);
    primitive(app, 'ExplorerLegR', 'box', trousers, new pc.Vec3(0.23, 0.35, 0), new pc.Vec3(0.34, 0.8, 0.42), this.root);
  }
  sync(snapshot: PlayerSnapshot, rideOffset = 0) {
    this.root.setPosition(snapshot.position.x, snapshot.position.y + rideOffset, snapshot.position.z);
    this.root.setEulerAngles(0, snapshot.yaw * 180 / Math.PI, 0);
  }
}
