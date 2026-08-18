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
import { cameraTargetInto, followAlpha, type CameraTarget } from '../player/cameraRig';
import { WorldBuilder } from '../world/WorldBuilder';
import { Atmosphere } from '../world/Atmosphere';
import { SoundFx } from '../audio/SoundFx';
import { DISCOVERIES, SPAWN_POINTS, WATER_BOUNDS } from '../world/WorldDefinition';
import { heightAt, WATER_SURFACE_Y } from '../world/heightfield';
import { InteractionSystem } from '../world/InteractionSystem';
import { WaterSystem } from '../water/WaterSystem';
import { HomeSystem } from '../home/HomeSystem';
import { HouseManager } from '../home/HouseManager';
import { VillagerManager } from '../world/VillagerManager';
import { BikeController } from '../vehicles/BikeController';
import { CarController } from '../vehicles/CarController';
import { RaftController } from '../vehicles/RaftController';
import { RaftWake } from '../vehicles/RaftWake';
import { VehicleSpawner } from '../vehicles/VehicleSpawner';
import { bikeLeanDegrees, raftPose } from '../vehicles/vehicleFeel';
import type { Hud } from '../ui/Hud';

export class GameApp {
  private app: pc.Application | null = null;
  private keyboard: KeyboardInput | null = null;
  private resizeHandler: (() => void) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

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

    const sound = new SoundFx();

    app.scene.ambientLight = new pc.Color(0.74, 0.78, 0.76);

    const sun = new pc.Entity('Sun');
    sun.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1.0, 0.96, 0.86),
      intensity: 1.35,
      castShadows: true,
      shadowResolution: 1024,
      shadowBias: 0.15,
      normalOffsetBias: 0.05
    });
    sun.setEulerAngles(48, 38, 0);
    app.root.addChild(sun);

    const skyFill = new pc.Entity('SkyFill');
    skyFill.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.68, 0.82, 0.95),
      intensity: 0.45,
      castShadows: false
    });
    skyFill.setEulerAngles(-60, 210, 0);
    app.root.addChild(skyFill);

    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.76, 0.88, 0.98),
      farClip: 380,
      fov: 56
    });
    app.root.addChild(camera);

    const atmosphere = new Atmosphere(app);
    const runtime = new WorldBuilder(app).build();

    const villagers = new VillagerManager(app);
    villagers.buildAll();

    // V0.1 has one player home. The legacy manager name remains only to avoid a
    // broad composition-root rewrite; no ownership/lock state is promised.
    const house = new HouseManager();

    const vehicleSpawner = new VehicleSpawner();

    const spawn = SPAWN_POINTS.find((point) => point.id === bootstrap.profile.lastSpawnId) ?? SPAWN_POINTS[0]!;
    const collision = new CollisionWorld(heightAt, runtime.colliders, spawn.position);
    const water = new WaterSystem(WATER_BOUNDS, WATER_SURFACE_Y);
    const player = new PlayerController(collision, water, spawn.position, spawn.yaw);

    const view = new PlayerView(app);
    view.onStep = (surface) => sound.footstep(surface);

    const input = new InputState();
    this.keyboard = new KeyboardInput(input, this.canvas);
    new TouchInput(input, this.hud.movePad, this.hud.lookPad, this.hud.jumpButton, this.hud.actionButton);

    let coffeeSpeedBoostTimer = 0;

    const useCurrentProp = (prop: string) => {
      if (prop === 'coffee') {
        sound.slurp();
        coffeeSpeedBoostTimer = 6.0;
        this.hud.showToast('⚡ Coffee drank! Speed Boost for 6s!');
      } else if (prop === 'icecream') {
        sound.crunch();
        this.hud.showToast('🍦 Delicious strawberry crunch!');
      } else if (prop === 'waterhose') {
        sound.waterHose();
        this.hud.showToast('💦 Spraying water hose!');
      }
    };

    this.hud.onSelectPropCallback = (prop) => {
      view.setProp(prop);
      if (prop === 'coffee') {
        sound.slurp();
        this.hud.showToast('Holding Hot Coffee ☕');
      } else if (prop === 'icecream') {
        sound.slurp();
        this.hud.showToast('Holding Strawberry Ice Cream 🍦');
      } else if (prop === 'flashlight') {
        sound.lamp(true);
        this.hud.showToast('Flashlight On 🔦');
      } else if (prop === 'balloon') {
        sound.click();
        this.hud.showToast('Holding Red Balloon 🎈');
      } else if (prop === 'waterhose') {
        sound.waterHose();
        this.hud.showToast('Holding Fire Hose 💦');
      }
    };

    this.hud.onSelectRoleCallback = (role) => {
      view.setRole(role);
      sound.cheer();
    };

    this.hud.onSelectEmoteCallback = (emote) => {
      view.playEmote(emote);
      if (emote === 'cheer') sound.cheer();
      else sound.click();
    };

    this.hud.onToggleMusicCallback = () => sound.toggleMusic();
    this.hud.onUsePropCallback = (prop) => useCurrentProp(prop);

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === '1') this.hud.selectProp('coffee');
      else if (e.key === '2') this.hud.selectProp('icecream');
      else if (e.key === '3') this.hud.selectProp('flashlight');
      else if (e.key === '4') this.hud.selectProp('balloon');
      else if (e.key === '5') this.hud.selectProp('waterhose');
      else if (e.key === '0') this.hud.selectProp('none');
      else if (e.key === 'f' || e.key === 'F') useCurrentProp(view.activeProp);
      else if (e.key === 'h' || e.key === 'H') sound.carHorn();
      else if (e.key === 'm' || e.key === 'M') {
        const on = sound.toggleMusic();
        this.hud.musicButton.classList.toggle('active', on);
        this.hud.showToast(on ? '🎶 Town Music: ON' : '🔇 Town Music: OFF', 1.8);
      }
    };

    window.addEventListener('keydown', this.keydownHandler);

    this.hud.hornButton.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.carHorn();
    });

    const interactions = new InteractionSystem();
    const home = new HomeSystem(
      bootstrap.home,
      (state) => this.api.saveHome(state),
      (status) => this.hud.setSave(status)
    );
    const discovered = new Set<DiscoveryId>(bootstrap.discoveries);

    const bike = new BikeController({ x: 15, y: heightAt(15, 7), z: 7 }, collision);
    const car = new CarController({ x: 5, y: heightAt(5, 8), z: 8 }, collision);
    const raft = new RaftController({ x: 50, y: WATER_SURFACE_Y + 0.15, z: 59 }, water);
    const raftWake = new RaftWake(app);

    this.hud.onSpawnVehicleCallback = (type, color) => {
      vehicleSpawner.spawn(type, color);
      sound.carHorn();
      const pos = { x: -6.5, y: heightAt(-6.5, -4.5) + 0.65, z: -4.5 };
      if (type === 'car') {
        car.dismount();
        car.teleport(pos, 0);
      } else {
        bike.dismount();
        bike.teleport(pos, 0);
      }
    };

    let cupboardOpen = false;
    let bikeWheelAngle = 0;
    let carWheelAngle = 0;
    let previousBikePosition = { ...bike.snapshot.position };
    let previousCarPosition = { ...car.snapshot.position };
    const previousViewPosition = { x: player.snapshot.position.x, z: player.snapshot.position.z };
    let prevMode: PlayerMode = 'grounded';
    let simTime = 0;

    const camPos = new pc.Vec3(spawn.position.x, spawn.position.y + 4, spawn.position.z + 8);
    const camLook = new pc.Vec3(spawn.position.x, spawn.position.y + 1.4, spawn.position.z);
    const camTargetVec = new pc.Vec3();
    const camLookTargetVec = new pc.Vec3();
    const cameraTargetState: CameraTarget = {
      position: { x: 0, y: 0, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 }
    };

    const syncLamp = () => {
      runtime.lampEntity.setLocalScale(
        home.current.lampOn ? 0.95 : 0.55,
        home.current.lampOn ? 0.95 : 0.55,
        home.current.lampOn ? 0.95 : 0.55
      );
    };
    syncLamp();

    interactions.register({
      id: 'houseClaim',
      label: 'Welcome Home 🏠',
      position: runtime.houseClaimPosition,
      radius: 2.8,
      run: () => {
        const res = house.claim(bootstrap.profile.playerName || 'Explorer');
        sound.click();
        this.hud.showToast(res.message, 3.0);
      }
    });

    interactions.register({
      id: 'vehicleTerminal',
      label: 'Vehicle Spawner 🏎️',
      position: runtime.vehicleSpawnPosition,
      radius: 2.8,
      run: () => {
        this.hud.vehicleDock.classList.toggle('open');
      }
    });

    interactions.register({
      id: 'cafe',
      label: 'Brew Coffee ☕',
      position: runtime.cafeCounterPosition,
      radius: 2.6,
      run: () => {
        sound.coffeeBrew();
        view.setProp('coffee');
        this.hud.selectProp('coffee');
        this.hud.showToast('Brewed a fresh hot latte! ☕');
      }
    });

    interactions.register({
      id: 'grocery',
      label: 'Scan Items 🛒',
      position: runtime.groceryRegisterPosition,
      radius: 2.6,
      run: () => {
        sound.cashRegister();
        this.hud.showToast('Scanned fresh groceries at Fresh Mart! 🛒');
      }
    });

    interactions.register({
      id: 'townhall',
      label: 'Give Speech 🎙️',
      position: runtime.townHallPodiumPosition,
      radius: 2.6,
      run: () => {
        sound.cheer();
        view.playEmote('wave');
        this.hud.showToast('Mayor Speech: TinyWorld is thriving! 🏛️');
      }
    });

    interactions.register({
      id: 'doorbell',
      label: 'Ring Bell 🔔',
      position: runtime.doorbellPosition,
      radius: 2.4,
      run: () => {
        sound.doorbell();
        this.hud.showToast('*Ding-Dong!* 🔔');
      }
    });

    interactions.register({
      id: 'fridge',
      label: 'Grab Ice Cream 🍦',
      position: runtime.fridgePosition,
      radius: 2.4,
      run: () => {
        sound.slurp();
        view.setProp('icecream');
        this.hud.selectProp('icecream');
        this.hud.showToast('Grabbed delicious strawberry ice cream! 🍦');
      }
    });

    interactions.register({
      id: 'lamp',
      label: 'Toggle Lamp 💡',
      position: runtime.lampPosition,
      radius: 2.4,
      run: async () => {
        sound.lamp(!home.current.lampOn);
        const result = await home.setLamp(!home.current.lampOn);
        syncLamp();
        this.hud.showToast(result === 'saved' ? 'Bedside lamp saved' : 'Lamp updated');
      }
    });

    interactions.register({
      id: 'chair',
      label: 'Sit on Sofa 🪑',
      position: runtime.chairPosition,
      radius: 2.4,
      run: () => {
        sound.click();
        view.playEmote('sit', 5.0);
        this.hud.showToast('Relaxing comfortably on the living room sofa.');
      }
    });

    interactions.register({
      id: 'cupboard',
      label: 'Open Wardrobe 🚪',
      position: runtime.cupboardPosition,
      radius: 2.4,
      run: () => {
        sound.click();
        cupboardOpen = !cupboardOpen;
        runtime.cupboardDoor.setEulerAngles(0, cupboardOpen ? 75 : 0, 0);
        this.hud.rolesDock.classList.add('open');
      }
    });

    const updateCamera = (position: Vec3, yaw: number, pitch: number, dt: number, inVehicle = false) => {
      const aspect = innerWidth / Math.max(1, innerHeight);
      cameraTargetInto(cameraTargetState, position, yaw, pitch, aspect, inVehicle);
      camTargetVec.set(cameraTargetState.position.x, cameraTargetState.position.y, cameraTargetState.position.z);
      camLookTargetVec.set(cameraTargetState.lookAt.x, cameraTargetState.lookAt.y, cameraTargetState.lookAt.z);
      const alpha = followAlpha(dt, 12);
      camPos.lerp(camPos, camTargetVec, alpha);
      camLook.lerp(camLook, camLookTargetVec, alpha);
      camera.setPosition(camPos);
      camera.lookAt(camLook);
    };

    const syncBikeVisual = () => {
      const state = bike.snapshot;
      const travelled = Math.hypot(state.position.x - previousBikePosition.x, state.position.z - previousBikePosition.z);
      bikeWheelAngle = (bikeWheelAngle + (travelled / 1.25) * 180 / Math.PI) % 360;
      previousBikePosition = { ...state.position };
      const lean = -bikeLeanDegrees(state.steerInput, Math.min(1, Math.abs(state.speed) / bike.maxSpeed));
      runtime.bikeEntity.setPosition(state.position.x, state.position.y + 0.75, state.position.z);
      runtime.bikeEntity.setEulerAngles(0, (state.yaw * 180) / Math.PI, lean);
      for (const pivot of runtime.bikeWheelPivots) pivot.setLocalEulerAngles(bikeWheelAngle, 0, 0);
    };

    const syncCarVisual = () => {
      const state = car.snapshot;
      const travelled = Math.hypot(state.position.x - previousCarPosition.x, state.position.z - previousCarPosition.z);
      const direction = state.speed >= 0 ? 1 : -1;
      carWheelAngle = (carWheelAngle + (travelled / 0.85) * direction * 180 / Math.PI) % 360;
      previousCarPosition = { ...state.position };

      runtime.carEntity.setPosition(state.position.x, state.position.y + 0.55, state.position.z);
      runtime.carEntity.setEulerAngles(0, (state.yaw * 180) / Math.PI, 0);

      for (const mount of runtime.carFrontWheelMounts) mount.setLocalEulerAngles(0, state.steerAngle, 0);
      for (const pivot of runtime.carWheelPivots) pivot.setLocalEulerAngles(carWheelAngle, 0, 0);
    };

    app.on('update', (dt: number) => {
      simTime += dt;
      if (coffeeSpeedBoostTimer > 0) coffeeSpeedBoostTimer -= dt;

      this.keyboard?.update();
      const frame = input.snapshot();
      let snap = player.snapshot;

      if (frame.jumpPressed && snap.mode === 'grounded') sound.jump();

      if (car.snapshot.mounted) {
        this.hud.setCarMode(true);
        if (frame.interactPressed) {
          sound.click();
          const dismount = car.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = car.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'car');
        }
      } else if (bike.snapshot.mounted) {
        this.hud.setCarMode(false);
        if (frame.interactPressed) {
          sound.click();
          const dismount = bike.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = bike.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'bike');
        }
      } else if (raft.snapshot.mounted) {
        this.hud.setCarMode(false);
        if (frame.interactPressed) {
          sound.click();
          const dismount = raft.dismount();
          if (dismount) player.resumeGrounded(dismount);
        } else {
          const state = raft.update(dt, frame);
          player.setExternal(state.position, state.yaw, 'raft');
        }
      } else {
        this.hud.setCarMode(false);

        if (coffeeSpeedBoostTimer > 0) {
          frame.moveX *= 1.35;
          frame.moveY *= 1.35;
        }

        snap = player.update(dt, frame);

        if (prevMode === 'airborne' && snap.mode === 'grounded') sound.land();
        if (prevMode !== 'swimming' && snap.mode === 'swimming') sound.splash();

        if (frame.interactPressed) {
          if (car.canMount(snap.position) && car.mount(snap.position)) {
            sound.carHorn();
            player.setExternal(car.snapshot.position, car.snapshot.yaw, 'car');
          } else if (bike.canMount(snap.position) && bike.mount(snap.position)) {
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
      syncCarVisual();

      const raftState = raft.snapshot;
      const raftSpeedRatio = Math.min(1, Math.abs(raftState.speed) / raft.maxSpeed);
      const raftMotion = raftPose(simTime, raftSpeedRatio, raftState.steerInput);
      runtime.raftEntity.setPosition(raftState.position.x, raftState.position.y + raftMotion.bob, raftState.position.z);
      runtime.raftEntity.setEulerAngles(raftMotion.pitch, (raftState.yaw * 180) / Math.PI, raftMotion.roll);
      raftWake.update(raftState.position, raftState.yaw, raftSpeedRatio, simTime);

      const travelled = Math.hypot(
        snap.position.x - previousViewPosition.x,
        snap.position.z - previousViewPosition.z
      );
      const actualTravelSpeed = dt > 0 ? Math.min(12, travelled / dt) : 0;
      previousViewPosition.x = snap.position.x;
      previousViewPosition.z = snap.position.z;

      const currentSpeed = snap.mode === 'car'
        ? Math.abs(car.snapshot.speed)
        : snap.mode === 'bike'
        ? Math.abs(bike.snapshot.speed)
        : snap.mode === 'raft'
        ? 0
        : actualTravelSpeed;

      const viewSteer = snap.mode === 'bike'
        ? bike.snapshot.steerInput
        : snap.mode === 'car'
        ? car.snapshot.steerAngle / 32
        : 0;

      view.sync(snap.position, snap.yaw, currentSpeed, dt, snap.mode, viewSteer);

      villagers.update(simTime, snap.position);
      const vehicleCamera = snap.mode === 'car' || snap.mode === 'bike' || snap.mode === 'raft';
      updateCamera(snap.position, snap.yaw, snap.pitch, dt, vehicleCamera);

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

      let action: string | null = null;
      let targetMarkerPos: { x: number; y: number; z: number } | null = null;

      if (car.snapshot.mounted || bike.snapshot.mounted || raft.snapshot.mounted) {
        action = 'Dismount';
      } else if (car.canMount(snap.position)) {
        action = 'Drive Mini-Car 🚗';
        targetMarkerPos = car.snapshot.position;
      } else if (bike.canMount(snap.position)) {
        action = 'Ride Cruiser 🚲';
        targetMarkerPos = bike.snapshot.position;
      } else if (raft.canMount(snap.position)) {
        action = 'Board Raft ⛵';
        targetMarkerPos = raft.snapshot.position;
      } else {
        const near = interactions.nearest(snap.position);
        if (near) {
          action = near.label;
          targetMarkerPos = near.position;
        }
      }

      this.hud.setAction(action);
      this.hud.update(dt);
      atmosphere.setInteractionTarget(targetMarkerPos, simTime);
      atmosphere.update(dt, simTime, runtime.chimneyEmitters, runtime.fountainEmitter);
    });

    this.resizeHandler = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
      this.canvas.width = Math.floor(innerWidth * dpr);
      this.canvas.height = Math.floor(innerHeight * dpr);
      const aspect = innerWidth / innerHeight;
      if (camera.camera) camera.camera.fov = aspect < 1.0 ? Math.min(68, Math.round(54 / aspect)) : 54;
      app.resizeCanvas();
    };
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  }

  destroy() {
    this.keyboard?.destroy();
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
    this.app?.destroy();
    this.app = null;
  }
}
