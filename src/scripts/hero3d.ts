/**
 * Hero wireframe model.
 *
 * A meshopt-compressed GLB rendered as a hidden-line wireframe in a fixed layer
 * behind the page, from the top of the hero until the work grid scrolls in.
 *
 * Loaded only from a dynamic import in main.ts, so neither three.js nor the
 * model costs anything on a browser that never gets here (reduced motion,
 * Save-Data, or no WebGL).
 *
 * Notes on the three deliberate choices that are easy to get wrong later:
 *
 * 1. No OrbitControls. It listens for `wheel` on its element, and this canvas
 *    covers half a scrolling page — the visitor would hit an invisible dead
 *    zone where the page stops scrolling. The drag handling below is pointer
 *    events only, so the wheel is never intercepted.
 *
 * 2. Input is hit-tested on `document`, not bound to the canvas. The canvas
 *    paints *behind* the page (every `.section` is positioned, so it stacks
 *    above), which means the section covering it would swallow every pointer
 *    event before the canvas saw it. Listening higher up and testing the
 *    layer's rect keeps the model both behind the text and draggable.
 *
 * 3. A touch drag only ever spins the model on its vertical axis, and never
 *    calls preventDefault. Vertical swipes therefore scroll the page natively,
 *    exactly as they do everywhere else — trapping them on a decorative
 *    background would strand anyone reading on a phone.
 */
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Sphere,
  Timer,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { withBase } from '../utils/url';

/**
 * Longest bounding-box edge after normalisation, in world units. This only puts
 * every model on a common scale — apparent size is set by FIT_MARGIN below,
 * since the camera is fitted to the model rather than parked at a fixed depth.
 */
const TARGET_SIZE = 1.9;
/**
 * Padding around the fitted model, as a multiple of the ideal distance. This is
 * the knob for apparent size: raise it to pull the model further clear of the
 * headline, lower it to make more of the layer.
 */
const FIT_MARGIN = 1.45;
/** How far the model may be tilted off its rest pose by dragging, in radians. */
const MAX_PITCH = 0.55;
/**
 * Idle motion is a slow sweep either side of rest, not a full turntable. The
 * mask is 17.9 units wide and only 5.2 deep, so a continuous spin leaves it
 * edge-on — an unreadable sliver — for a good part of every revolution. A
 * ±26° sweep keeps the face presented while still reading as alive. Dragging
 * is unaffected and still goes all the way round.
 */
const IDLE_SWEEP = 0.45;
/** Radians per second travelled along the sweep, giving a ~18s cycle. */
const IDLE_RATE = 0.35;
/** Pointer pixels → radians. */
const DRAG_SPEED = 0.006;
/** Approach rate for the eased rotation. Higher is snappier. */
const DAMPING = 6;

export interface Hero3D {
  destroy(): void;
}

export function initHero3D(host: HTMLElement): Hero3D | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-3d-canvas';
  // Decorative: the model repeats information the headline already gives.
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true, // let the drafting grid show through
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null; // no WebGL — the hero is complete without it
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // No lights: both materials are MeshBasicMaterial, which is unlit, and the
  // optimised GLB carries POSITION only — normals were stripped so the mesh
  // could weld and simplify (see README notes on the model pipeline).

  // pivot spins; tilt holds the drag pitch, so the two never fight.
  const tilt = new Group();
  const pivot = new Group();
  tilt.add(pivot);
  scene.add(tilt);

  /* ---------------------------------------------------------------- theme */
  // Colours live in tokens.css and change with the theme toggle. Reading the
  // computed custom properties keeps this module from duplicating any hex.
  const readToken = (name: string, fallback: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };

  const wireMaterial = new MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    // Low enough that the mesh reads as a drafting overlay behind the type
    // rather than a solid gold mass competing with it.
    opacity: 0.42,
  });

  // Drawn first, into the depth buffer only, so far-side edges are hidden and
  // the mesh reads as a solid object instead of a ball of yarn. polygonOffset
  // pushes it back a hair so the wireframe never z-fights with its own shell.
  const occluderMaterial = new MeshBasicMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const applyTheme = () => {
    wireMaterial.color = new Color(readToken('--accent', '#f0b429'));
    occluderMaterial.color = new Color(readToken('--surface', '#0b0b0f'));
  };
  applyTheme();

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* ------------------------------------------------------------- pointer */
  /** Yaw contributed by dragging. The idle sweep oscillates around it, so
   *  letting go never snaps the model back to where it started. */
  let dragYaw = 0;
  let idlePhase = 0;
  let targetPitch = 0;
  let yaw = 0;
  let pitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let activePointer: number | null = null;
  /** Suppresses the idle spin for a moment after the visitor lets go. */
  let interactedAt = 0;

  /**
   * Anything the visitor is more plausibly aiming at than the model: controls
   * to click, and text to select. Without the text selectors a drag across the
   * headline would silently become a model rotation, and the title could never
   * be selected or copied.
   */
  const CLAIMED_BY_PAGE =
    'a, button, input, textarea, select, label, [role="button"], .project-card,' +
    'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, table';

  /**
   * True when a pointer is over the model's layer and over none of the above —
   * the model only claims otherwise-dead space.
   */
  const isOverModel = (event: PointerEvent) => {
    if (!inView || !loaded) return false;

    const rect = host.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) return false;

    const target = event.target as HTMLElement | null;
    return !target?.closest(CLAIMED_BY_PAGE);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (!isOverModel(event)) return;

    dragging = true;
    activePointer = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    // Mouse only: stops the drag turning into a text selection. Touch is left
    // alone so the browser can still take the gesture as a scroll.
    if (event.pointerType === 'mouse') {
      event.preventDefault();
      document.body.classList.add('is-model-dragging');
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== activePointer) {
      // Not dragging — just advertise that this area is grabbable.
      if (!dragging && event.pointerType === 'mouse') {
        document.body.classList.toggle('is-model-hot', isOverModel(event));
      }
      return;
    }

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    dragYaw += dx * DRAG_SPEED;
    // Touch keeps its vertical axis for scrolling (see the header note), so a
    // finger only ever spins the model; a mouse gets both axes.
    if (event.pointerType !== 'touch') {
      targetPitch = clamp(targetPitch + dy * DRAG_SPEED, -MAX_PITCH, MAX_PITCH);
    }
    interactedAt = performance.now();
  };

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId !== activePointer) return;
    dragging = false;
    activePointer = null;
    interactedAt = performance.now();
    document.body.classList.remove('is-model-dragging');
  };

  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  /* -------------------------------------------------------------- resize */
  /** Bounding-sphere radius of the scaled model; set once it has loaded. */
  let fitRadius = 0;

  /**
   * Pull the camera back far enough that the model fits the *narrower* of the
   * two fields of view. A fixed camera distance only respects the vertical fov,
   * so on a tall narrow layer — every phone — the model was wider than the
   * canvas and spilled out across the copy.
   */
  const fitCamera = () => {
    if (fitRadius === 0) return;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    camera.position.z = (fitRadius / Math.sin(Math.min(vFov, hFov) / 2)) * FIT_MARGIN;
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fitCamera();
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  /* ------------------------------------------------------------ visibility */
  // Rendering is gated on three independent things: the layer being faded in,
  // the tab being foregrounded, and the model having arrived. Any one of them
  // false means the rAF loop stops entirely rather than burning battery on
  // frames nobody sees.
  let inView = true;
  let loaded = false;
  let frame = 0;
  const timer = new Timer();

  const shouldRender = () => inView && !document.hidden && loaded;

  const tick = (timestamp: number) => {
    frame = requestAnimationFrame(tick);
    timer.update(timestamp);
    // Cap the step so a backgrounded tab cannot resume with one enormous jump.
    const dt = Math.min(timer.getDelta(), 0.1);

    // Resume the sweep a beat after the visitor stops dragging.
    if (!dragging && performance.now() - interactedAt > 1200) {
      idlePhase += IDLE_RATE * dt;
    }
    const targetYaw = dragYaw + Math.sin(idlePhase) * IDLE_SWEEP;

    // Frame-rate independent easing toward the target pose.
    const k = 1 - Math.exp(-DAMPING * dt);
    yaw += (targetYaw - yaw) * k;
    pitch += (targetPitch - pitch) * k;

    pivot.rotation.y = yaw;
    tilt.rotation.x = pitch;

    renderer.render(scene, camera);
  };

  const start = () => {
    if (frame === 0 && shouldRender()) {
      timer.reset(); // discard time spent paused
      frame = requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const sync = () => (shouldRender() ? start() : stop());

  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);

  // The work grid is where the real imagery starts; the model has had its say
  // by then and would only compete with the cards behind it.
  const workSection = document.getElementById('work');
  let workObserver: IntersectionObserver | null = null;
  if (workSection) {
    workObserver = new IntersectionObserver(
      ([entry]) => {
        inView = !entry?.isIntersecting;
        host.classList.toggle('is-dismissed', !inView);
        if (!inView) document.body.classList.remove('is-model-hot');
        sync();
      },
      // Start the fade a little before the section's top edge lands, so the
      // handover reads as deliberate rather than as a pop.
      { rootMargin: '-15% 0px 0px 0px', threshold: 0 }
    );
    workObserver.observe(workSection);
  }

  /* ---------------------------------------------------------------- load */
  // Meshopt rather than Draco. Draco compresses this mesh harder (17KB vs
  // 28KB), but its decoder is a ~75KB gzipped wasm fetch — four times the
  // model — where the meshopt decoder is ~8KB of JS bundled straight into this
  // chunk. Total transfer: ~30KB against ~92KB. Revisit only if the models here
  // ever get big enough for Draco's ratio to outweigh its fixed cost.
  const gltfLoader = new GLTFLoader();
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  let disposed = false;
  const geometries: BufferGeometry[] = [];

  gltfLoader.load(
    withBase('models/nagaraksha.glb'),
    (gltf) => {
      if (disposed) return;

      const model = gltf.scene;

      // Normalise whatever the export produced: centre on the origin and scale
      // the longest edge to TARGET_SIZE, so swapping in a different model never
      // means re-tuning the camera.
      const box = new Box3().setFromObject(model);
      const size = box.getSize(new Vector3());
      const centre = box.getCenter(new Vector3());
      const longest = Math.max(size.x, size.y, size.z) || 1;
      const scale = TARGET_SIZE / longest;

      model.position.copy(centre).multiplyScalar(-scale);
      model.scale.setScalar(scale);

      // Replace the exported materials with the wireframe pair. The occluder is
      // a clone of the whole scene rather than per-mesh copies, so every child's
      // local transform comes along for free; clone() shares geometry by
      // reference, so this costs draw calls but no extra vertex memory.
      const occluder = model.clone(true);
      occluder.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        child.material = occluderMaterial;
        child.renderOrder = 0;
      });

      model.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        geometries.push(child.geometry);
        child.material = wireMaterial;
        child.renderOrder = 1;
      });

      pivot.add(occluder, model);

      // Fit against the bounding *sphere*, not the box: the model spins, so the
      // silhouette that has to fit is the one it sweeps through, not the one it
      // happens to present at rest.
      const sphere = new Box3()
        .setFromObject(model)
        .getBoundingSphere(new Sphere());
      fitRadius = sphere.radius;
      resize();

      loaded = true;
      host.classList.add('is-ready');
      sync();
    },
    undefined,
    () => {
      // A missing or corrupt model is not worth an error state on a portfolio
      // hero — the layer simply stays empty.
      host.classList.add('is-failed');
    }
  );

  /* ------------------------------------------------------------- teardown */
  return {
    destroy() {
      disposed = true;
      stop();

      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', endDrag);
      document.body.classList.remove('is-model-hot', 'is-model-dragging');
      document.removeEventListener('visibilitychange', onVisibility);

      resizeObserver.disconnect();
      themeObserver.disconnect();
      workObserver?.disconnect();

      // three.js does not free GPU memory on its own; without this an unmounted
      // viewer keeps its buffers until the context is dropped.
      geometries.forEach((geometry) => geometry.dispose());
      wireMaterial.dispose();
      occluderMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
