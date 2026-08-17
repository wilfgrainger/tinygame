import * as pc from 'playcanvas';
import type { WorldBootstrap } from '../../shared/api';
import type { DiscoveryId } from '../../shared/ids';
import type { Vec3 } from '../../shared/world';
import type { ApiClient } from '../api/ApiClient';
import { InputState } from '../input/InputState';
import { KeyboardInput } from '../input/KeyboardInput';
import { TouchInput } from '../input/TouchInput';
import { CollisionWorld } from '../player/CollisionWorld';
import { PlayerController } from '../player/PlayerController';
import { PlayerView } from '../player/PlayerView';
import { WorldBuilder } from '../world/WorldBuilder';
import { DISCOVERIES, SPAWN_POINTS, WATER_BOUNDS } from '../world/WorldDefinition';
import { heightAt, WATER_SURFACE_Y } from '../world/heightfield';
import { InteractionSystem } from '../world/InteractionSystem';
import { WaterSystem } from '../water/WaterSystem';
import { HomeSystem } from '../home/HomeSystem';
import { BikeController } from '../vehicles/BikeController';
import { RaftController } from '../vehicles/RaftController';
import type { Hud } from '../ui/Hud';

export class GameApp {
  private app: pc.Application | null = null;
  private keyboard: KeyboardInput | null = null;
  private resizeHandler: (() => void) | null = null;
  constructor(private readonly canvas: HTMLCanvasElement, private readonly hud: Hud, private readonly api: ApiClient) {}

  start(bootstrap: WorldBootstrap) {
    const app = new pc.Application(this.canvas, { graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' } });
    this.app = app;
    app.start();
    app.scene.ambientLight = new pc.Color(0.72, 0.76, 0.7);
    const sun = new pc.Entity('Sun');
    sun.addComponent('light', { type: 'directional', color: new pc.Color(1, 0.95, 0.82), intensity: 1.25, castShadows: true, shadowResolution: 1024 });
    sun.setEulerAngles(45, 35, 0);
    app.root.addChild(sun);
    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.63, 0.79, 0.9), farClip: 320, fov: 58 });
    app.root.addChild(camera);

    const runtime = new WorldBuilder(app).build();
    const spawn = SPAWN_POINTS.find((point) => point.id === bootstrap.profile.lastSpawnId) ?? SPAWN_POINTS[0]!;
    const collision = new CollisionWorld(heightAt, runtime.colliders, spawn.position);
    const water = new WaterSystem(WATER_BOUNDS, WATER_SURFACE_Y);
    const player = new PlayerController(collision, water, spawn.position, spawn.yaw);
    const view = new PlayerView(app);
    const input = new InputState();
    this.keyboard = new KeyboardInput(input, this.canvas);
    new TouchInput(input, this.hud.movePad, this.hud.lookPad, this.hud.jumpButton, this.hud.actionButton);
    const interactions = new InteractionSystem();
    const home = new HomeSystem(bootstrap.home, (state) => this.api.saveHome(state), (status) => this.hud.setSave(status));
    const discovered = new Set<DiscoveryId>(bootstrap.discoveries);
    const bike = new BikeController({ x: -10, y: heightAt(-10, 13), z: 13 }, collision);
    const raft = new RaftController({ x: 50, y: WATER_SURFACE_Y + 0.15, z: 59 }, water);
    let cupboardOpen = false;
    let wheelAngle = 0;
    let previousBikePosition = { ...bike.snapshot.position };

    const syncLamp = () => runtime.lampEntity.setLocalScale(home.current.lampOn ? 0.95 : 0.55, home.current.lampOn ? 0.95 : 0.55, home.current.lampOn ? 0.95 : 0.55);
    syncLamp();
    interactions.register({ id: 'lamp', label: 'Lamp', position: runtime.lampPosition, radius: 2.2, run: async () => { const result = await home.setLamp(!home.current.lampOn); syncLamp(); this.hud.showToast(result === 'saved' ? 'Lamp saved' : 'Lamp change not saved'); } });
    interactions.register({ id: 'chair', label: 'Sit', position: runtime.chairPosition, radius: 2.2, run: () => this.hud.showToast('A tiny sit. Surprisingly restorative.') });
    interactions.register({ id: 'cupboard', label: 'Cupboard', position: runtime.cupboardPosition, radius: 2.2, run: () => { cupboardOpen = !cupboardOpen; runtime.cupboardDoor.setEulerAngles(0, cupboardOpen ? 75 : 0, 0); } });

    const updateCamera = (position: Vec3, yaw: number, pitch: number) => {
      const distance = 9;
      const pitchRad = pitch * Math.PI / 180;
      camera.setPosition(position.x - Math.sin(yaw) * Math.cos(pitchRad) * distance, position.y + 4.2 - Math.sin(pitchRad) * distance * 0.45, position.z + Math.cos(yaw) * Math.cos(pitchRad) * distance);
      camera.lookAt(position.x, position.y + 1.4, position.z);
    };

    const syncBikeVisual = () => {
      const state = bike.snapshot;
      const travelled = Math.hypot(state.position.x - previousBikePosition.x, state.position.z - previousBikePosition.z);
      wheelAngle = (wheelAngle + travelled / 1.25 * 180 / Math.PI) % 360;
      previousBikePosition = { ...state.position };
      runtime.bikeEntity.setPosition(state.position.x, state.position.y + 0.75, state.position.z);
      runtime.bikeEntity.setEulerAngles(0, state.yaw * 180 / Math.PI, 0);
      for (const pivot of runtime.bikeWheelPivots) pivot.setLocalEulerAngles(wheelAngle, 0, 0);
    };

    app.on('update', (dt: number) => {
      this.keyboard?.update();
      const frame = input.snapshot();
      let snap = player.snapshot;
      if (bike.snapshot.mounted) {
        if (frame.interactPressed) {
          const dismount = bike.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = bike.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'bike');
        }
      } else if (raft.snapshot.mounted) {
        if (frame.interactPressed) {
          const dismount = raft.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = raft.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'raft');
        }
      } else {
        snap = player.update(dt, frame);
        if (frame.interactPressed) {
          if (bike.canMount(snap.position) && bike.mount(snap.position)) player.setExternal(bike.snapshot.position, bike.snapshot.yaw, 'bike');
          else if (raft.canMount(snap.position) && raft.mount(snap.position)) player.setExternal(raft.snapshot.position, raft.snapshot.yaw, 'raft');
          else void interactions.nearest(snap.position)?.run();
        }
      }

      snap = player.snapshot;
      syncBikeVisual();
      const raftState = raft.snapshot;
      runtime.raftEntity.setPosition(raftState.position.x, raftState.position.y, raftState.position.z);
      runtime.raftEntity.setEulerAngles(0, raftState.yaw * 180 / Math.PI, 0);
      view.sync(snap, snap.mode === 'bike' ? 1.0 : snap.mode === 'raft' ? 0.7 : 0);
      updateCamera(snap.position, snap.yaw, snap.pitch);

      for (const discovery of DISCOVERIES) {
        if (discovered.has(discovery.id) || Math.hypot(snap.position.x - discovery.position.x, snap.position.z - discovery.position.z) > discovery.radius) continue;
        discovered.add(discovery.id);
        void this.api.saveDiscovery(discovery.id)
          .then(() => this.hud.showToast(discovery.id === 'mountain-summit' ? 'You found the summit!' : discovery.id === 'woodland-grove' ? 'Secret grove discovered!' : 'Harbour lookout discovered!'))
          .catch(() => { discovered.delete(discovery.id); this.hud.setSave('failed'); });
      }

      let action: string | null = null;
      if (bike.snapshot.mounted || raft.snapshot.mounted) action = 'Dismount';
      else if (bike.canMount(snap.position)) action = 'Ride bike';
      else if (raft.canMount(snap.position)) action = 'Board raft';
      else action = interactions.nearest(snap.position)?.label ?? null;
      this.hud.setAction(action);
    });

    this.resizeHandler = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
      this.canvas.width = Math.floor(innerWidth * dpr);
      this.canvas.height = Math.floor(innerHeight * dpr);
      app.resizeCanvas();
    };
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  }

  destroy() {
    this.keyboard?.destroy();
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    this.app?.destroy();
    this.app = null;
  }
}
