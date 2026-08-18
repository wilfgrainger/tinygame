import * as pc from 'playcanvas';
import type { WorldBootstrap } from '../../shared/api';
import type { DiscoveryId } from '../../shared/ids';
import type { Vec3 } from '../../shared/world';
import type { ApiClient } from '../api/ApiClient';
import { InputState } from '../input/InputState';
import { KeyboardInput } from '../input/KeyboardInput';
import { TouchInput } from '../input/TouchInput';
import { CollisionWorld } from '../player/CollisionWorld';
import { PlayerController, type PlayerMode } from '../player/PlayerController';
import { PlayerView } from '../player/PlayerView';
import { WorldBuilder } from '../world/WorldBuilder';
import { Atmosphere } from '../world/Atmosphere';
import { SoundFx } from '../audio/SoundFx';
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

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly hud: Hud,
    private readonly api: ApiClient
  ) {}

  start(bootstrap: WorldBootstrap) {
    const app = new pc.Application(this.canvas, {
      graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' }
    });
    this.app = app;
    app.start();

    // Sound engine
    const sound = new SoundFx();

    // Scene ambient lighting
    app.scene.ambientLight = new pc.Color(0.74, 0.78, 0.76);

    // Warm directional sun
    const sun = new pc.Entity('Sun');
    sun.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.96, 0.86),
      intensity: 1.35,
      castShadows: true,
      shadowResolution: 2048,
      shadowBias: 0.15,
      normalOffsetBias: 0.05
    });
    sun.setEulerAngles(48, 38, 0);
    app.root.addChild(sun);

    // Soft sky fill light
    const skyFill = new pc.Entity('SkyFill');
    skyFill.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.68, 0.82, 0.95),
      intensity: 0.45,
      castShadows: false
    });
    skyFill.setEulerAngles(-60, 210, 0);
    app.root.addChild(skyFill);

    // Main camera with clear color matching atmospheric horizon
    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.76, 0.88, 0.98),
      farClip: 380,
      fov: 56
    });
    app.root.addChild(camera);

    // World & Atmosphere
    const atmosphere = new Atmosphere(app);
    const runtime = new WorldBuilder(app).build();

    const spawn = SPAWN_POINTS.find((point) => point.id === bootstrap.profile.lastSpawnId) ?? SPAWN_POINTS[0]!;
    const collision = new CollisionWorld(heightAt, runtime.colliders, spawn.position);
    const water = new WaterSystem(WATER_BOUNDS, WATER_SURFACE_Y);
    const player = new PlayerController(collision, water, spawn.position, spawn.yaw);

    const view = new PlayerView(app);
    view.onStep = (surface) => sound.footstep(surface);

    const input = new InputState();
    this.keyboard = new KeyboardInput(input, this.canvas);
    new TouchInput(input, this.hud.movePad, this.hud.lookPad, this.hud.jumpButton, this.hud.actionButton);

    const interactions = new InteractionSystem();
    const home = new HomeSystem(
      bootstrap.home,
      (state) => this.api.saveHome(state),
      (status) => this.hud.setSave(status)
    );
    const discovered = new Set<DiscoveryId>(bootstrap.discoveries);

    const bike = new BikeController({ x: -10, y: heightAt(-10, 13), z: 13 }, collision);
    const raft = new RaftController({ x: 50, y: WATER_SURFACE_Y + 0.15, z: 59 }, water);

    let cupboardOpen = false;
    let wheelAngle = 0;
    let previousBikePosition = { ...bike.snapshot.position };
    let prevMode: PlayerMode = 'grounded';
    let simTime = 0;

    // Smooth camera state
    const camPos = new pc.Vec3(spawn.position.x, spawn.position.y + 4, spawn.position.z + 8);
    const camLook = new pc.Vec3(spawn.position.x, spawn.position.y + 1.4, spawn.position.z);

    const syncLamp = () => {
      runtime.lampEntity.setLocalScale(
        home.current.lampOn ? 0.95 : 0.55,
        home.current.lampOn ? 0.95 : 0.55,
        home.current.lampOn ? 0.95 : 0.55
      );
    };
    syncLamp();

    interactions.register({
      id: 'lamp',
      label: 'Toggle Lamp',
      position: runtime.lampPosition,
      radius: 2.4,
      run: async () => {
        sound.lamp(!home.current.lampOn);
        const result = await home.setLamp(!home.current.lampOn);
        syncLamp();
        this.hud.showToast(result === 'saved' ? 'Lamp saved to cloud' : 'Lamp updated');
      }
    });

    interactions.register({
      id: 'chair',
      label: 'Sit down',
      position: runtime.chairPosition,
      radius: 2.2,
      run: () => {
        sound.click();
        this.hud.showToast('A tiny sit. Surprisingly restorative.');
      }
    });

    interactions.register({
      id: 'cupboard',
      label: 'Open Cupboard',
      position: runtime.cupboardPosition,
      radius: 2.4,
      run: () => {
        sound.click();
        cupboardOpen = !cupboardOpen;
        runtime.cupboardDoor.setEulerAngles(0, cupboardOpen ? 75 : 0, 0);
      }
    });

    const updateCamera = (position: Vec3, yaw: number, pitch: number, dt: number) => {
      const distance = 8.5;
      const pitchRad = (pitch * Math.PI) / 180;
      const targetCamX = position.x - Math.sin(yaw) * Math.cos(pitchRad) * distance;
      const targetCamY = position.y + 3.8 - Math.sin(pitchRad) * distance * 0.45;
      const targetCamZ = position.z + Math.cos(yaw) * Math.cos(pitchRad) * distance;

      const targetLookX = position.x;
      const targetLookY = position.y + 1.4;
      const targetLookZ = position.z;

      // Smooth camera dampening
      const lerpFactor = Math.min(1, dt * 12);
      camPos.lerp(camPos, new pc.Vec3(targetCamX, targetCamY, targetCamZ), lerpFactor);
      camLook.lerp(camLook, new pc.Vec3(targetLookX, targetLookY, targetLookZ), lerpFactor);

      camera.setPosition(camPos);
      camera.lookAt(camLook);
    };

    const syncBikeVisual = () => {
      const state = bike.snapshot;
      const travelled = Math.hypot(state.position.x - previousBikePosition.x, state.position.z - previousBikePosition.z);
      wheelAngle = (wheelAngle + (travelled / 1.25) * 180 / Math.PI) % 360;
      previousBikePosition = { ...state.position };
      runtime.bikeEntity.setPosition(state.position.x, state.position.y + 0.75, state.position.z);
      runtime.bikeEntity.setEulerAngles(0, (state.yaw * 180) / Math.PI, 0);
      for (const pivot of runtime.bikeWheelPivots) pivot.setLocalEulerAngles(wheelAngle, 0, 0);
    };

    app.on('update', (dt: number) => {
      simTime += dt;
      this.keyboard?.update();
      const frame = input.snapshot();
      let snap = player.snapshot;

      // Sound triggers for jump
      if (frame.jumpPressed && snap.mode === 'grounded') {
        sound.jump();
      }

      if (bike.snapshot.mounted) {
        if (frame.interactPressed) {
          sound.click();
          const dismount = bike.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = bike.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'bike');
        }
      } else if (raft.snapshot.mounted) {
        if (frame.interactPressed) {
          sound.click();
          const dismount = raft.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = raft.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'raft');
        }
      } else {
        snap = player.update(dt, frame);

        // Landing sound
        if (prevMode === 'airborne' && snap.mode === 'grounded') {
          sound.land();
        }

        // Entering water splash
        if (prevMode !== 'swimming' && snap.mode === 'swimming') {
          sound.splash();
        }

        if (frame.interactPressed) {
          if (bike.canMount(snap.position) && bike.mount(snap.position)) {
            sound.bikeBell();
            player.setExternal(bike.snapshot.position, bike.snapshot.yaw, 'bike');
          } else if (raft.canMount(snap.position) && raft.mount(snap.position)) {
            sound.splash();
            player.setExternal(raft.snapshot.position, raft.snapshot.yaw, 'raft');
          } else {
            void interactions.nearest(snap.position)?.run();
          }
        }
      }

      prevMode = snap.mode;
      snap = player.snapshot;

      syncBikeVisual();

      const raftState = raft.snapshot;
      // Gentle water bobbing on raft
      const raftBob = Math.sin(simTime * 2.2) * 0.04;
      const raftRoll = Math.sin(simTime * 1.8) * 1.5;
      runtime.raftEntity.setPosition(raftState.position.x, raftState.position.y + raftBob, raftState.position.z);
      runtime.raftEntity.setEulerAngles(0, (raftState.yaw * 180) / Math.PI, raftRoll);

      view.sync(snap, snap.mode === 'bike' ? 0.95 : snap.mode === 'raft' ? 0.65 : 0, dt);
      updateCamera(snap.position, snap.yaw, snap.pitch, dt);

      // Discovery triggers
      for (const discovery of DISCOVERIES) {
        if (discovered.has(discovery.id) || Math.hypot(snap.position.x - discovery.position.x, snap.position.z - discovery.position.z) > discovery.radius) continue;
        discovered.add(discovery.id);
        sound.discovery();
        const title = discovery.id === 'mountain-summit' ? 'Mountain Summit' : discovery.id === 'woodland-grove' ? 'Secret Woodland Grove' : 'Harbour Lookout';
        const subtitle = discovery.id === 'mountain-summit' ? 'You climbed to the highest peak!' : discovery.id === 'woodland-grove' ? 'A peaceful forest campsite discovered!' : 'You found the harbour dock!';
        this.hud.showDiscovery(title, subtitle);

        void this.api.saveDiscovery(discovery.id).catch(() => {
          discovered.delete(discovery.id);
          this.hud.setSave('failed');
        });
      }

      // Interaction prompts and floating marker
      let action: string | null = null;
      let targetMarkerPos: { x: number; y: number; z: number } | null = null;

      if (bike.snapshot.mounted || raft.snapshot.mounted) {
        action = 'Dismount';
      } else if (bike.canMount(snap.position)) {
        action = 'Ride Tiny Bike';
        targetMarkerPos = bike.snapshot.position;
      } else if (raft.canMount(snap.position)) {
        action = 'Board Tiny Raft';
        targetMarkerPos = raft.snapshot.position;
      } else {
        const near = interactions.nearest(snap.position);
        if (near) {
          action = near.label;
          targetMarkerPos = near.position;
        }
      }

      this.hud.setAction(action);
      atmosphere.setInteractionTarget(targetMarkerPos, simTime);
      atmosphere.update(dt, simTime, runtime.chimneyEmitters, runtime.fountainEmitter);
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
