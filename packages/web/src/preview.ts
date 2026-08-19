/**
 * Side-by-side 3D view of a model before and after repair.
 *
 * Loaded on demand — three.js is by far the heaviest thing on the page, so
 * it only arrives when someone actually opens a preview.
 *
 * Both halves share one camera and one renderer (two scissored viewports),
 * which keeps the two views in lockstep for free.
 */

import {
  AmbientLight,
  BackSide,
  MeshBasicMaterial,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { MeshView } from './worker.js';

export interface PreviewHandle {
  dispose(): void;
  setWireframe(on: boolean): void;
  setDefects(on: boolean): void;
  /** Frame the next problem spot; returns which one, 1-based. */
  jumpToNextDefect(): { index: number; total: number };
  resetView(): void;
}

interface Side {
  scene: Scene;
  surface: Mesh;
  backfaces: Mesh;
  wireframe: Mesh;
  overlays: (LineSegments | Points)[];
}

const SURFACE = 0x8d97a8;
const WIRE = 0xa7b1c2;
/** Anything you can see through the surface is a hole or an inside-out face. */
const BACKFACE = 0xd0453f;
const OPEN = 0xff4d4d;
const NON_MANIFOLD = 0xff33cc;
const FLIPPED = 0xffb020;
const MARKER = 0xffe066;
/** The defect "Next problem" is currently pointing at. */
const CURRENT = 0x53ff9c;

export function mountPreview(
  container: HTMLElement,
  before: MeshView,
  after: MeshView,
): PreviewHandle {
  const canvas = container.querySelector('canvas') as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // Everything is drawn around the origin so orbiting feels sane.
  const centre = new Vector3(
    (before.bbox.min[0] + before.bbox.max[0]) / 2,
    (before.bbox.min[1] + before.bbox.max[1]) / 2,
    (before.bbox.min[2] + before.bbox.max[2]) / 2,
  );
  const size = [0, 1, 2].map((axis) => before.bbox.max[axis] - before.bbox.min[axis]);
  const radius = Math.max(Math.hypot(size[0], size[1], size[2]) / 2, 1e-3);

  const fov = 45;
  const camera = new PerspectiveCamera(fov, 1, radius / 100, radius * 100);
  camera.up.set(0, 0, 1); // STL is Z-up

  // Framing waits for the first frame: the canvas has no measured size
  // until the panel is laid out, and the fit depends on its aspect.
  const direction = new Vector3(0.6, -1, 0.45).normalize();
  const home = direction.clone().multiplyScalar(radius * 3);
  camera.position.copy(home);
  let framed = false;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  const sides = [buildSide(before, centre), buildSide(after, centre)];

  // One movable dot marks the defect the camera was last sent to, in both
  // views: on the right it should sit on plain, healthy surface.
  const cursors = sides.map((side) => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(3), 3));
    const cursor = new Points(
      geometry,
      new PointsMaterial({
        color: new Color(CURRENT),
        size: 17,
        sizeAttenuation: false,
        depthTest: false,
        transparent: true,
      }),
    );
    // Below the defect overlays: the dot is a backdrop, the defect itself
    // has to stay readable on top of it.
    cursor.renderOrder = 9;
    cursor.visible = false;
    side.scene.add(cursor);
    return cursor;
  });

  let frame = 0;
  const render = (): void => {
    frame = requestAnimationFrame(render);
    controls.update();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * renderer.getPixelRatio()) renderer.setSize(width, height, false);
    const half = width / 2;
    camera.aspect = half / height;
    camera.updateProjectionMatrix();
    if (!framed && width > 0 && height > 0) {
      framed = true;
      home.copy(direction).multiplyScalar(fitDistance(before, centre, direction, fov, camera.aspect));
      camera.position.copy(home);
    }
    renderer.setScissorTest(true);
    sides.forEach((side, i) => {
      renderer.setViewport(i * half, 0, half, height);
      renderer.setScissor(i * half + (i === 0 ? 0 : 1), 0, half - 1, height);
      renderer.render(side.scene, camera);
    });
  };
  render();

  const hotspots: Vector3[] = [];
  for (let i = 0; i < before.hotspots.length; i += 3) {
    hotspots.push(
      new Vector3(
        before.hotspots[i] - centre.x,
        before.hotspots[i + 1] - centre.y,
        before.hotspots[i + 2] - centre.z,
      ),
    );
  }
  let next = 0;

  return {
    dispose(): void {
      cancelAnimationFrame(frame);
      controls.dispose();
      for (const side of sides) {
        for (const object of [
          side.surface,
          side.backfaces,
          side.wireframe,
          ...side.overlays,
          ...cursors,
        ]) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      }
      renderer.dispose();
    },

    setWireframe(on: boolean): void {
      for (const side of sides) {
        side.wireframe.visible = on;
        side.surface.visible = !on;
        side.backfaces.visible = !on;
      }
    },

    setDefects(on: boolean): void {
      for (const side of sides) for (const overlay of side.overlays) overlay.visible = on;
    },

    jumpToNextDefect(): { index: number; total: number } {
      if (hotspots.length === 0) return { index: 0, total: 0 };
      const target = hotspots[next % hotspots.length];
      const towards = camera.position.clone().sub(controls.target).normalize();
      controls.target.copy(target);
      camera.position.copy(target).addScaledVector(towards, radius * 0.22);
      for (const cursor of cursors) {
        const position = cursor.geometry.getAttribute('position');
        position.setXYZ(0, target.x, target.y, target.z);
        position.needsUpdate = true;
        cursor.visible = true;
      }
      next++;
      return { index: ((next - 1) % hotspots.length) + 1, total: hotspots.length };
    },

    resetView(): void {
      controls.target.set(0, 0, 0);
      camera.position.copy(home);
      for (const cursor of cursors) cursor.visible = false;
      next = 0;
    },
  };
}

/**
 * How far back the camera has to sit for every corner of the bounding box
 * to stay inside the frustum. Each corner is tested at its own depth —
 * pairing the widest corner with the nearest one wastes half the viewport
 * on long thin models, which is most printed parts.
 */
function fitDistance(
  view: MeshView,
  centre: Vector3,
  direction: Vector3,
  fov: number,
  aspect: number,
): number {
  const up = new Vector3(0, 0, 1);
  const right = new Vector3().crossVectors(direction, up).normalize();
  const trueUp = new Vector3().crossVectors(right, direction).normalize();
  const tan = Math.tan((fov / 2) * (Math.PI / 180));

  let distance = 0;
  for (let corner = 0; corner < 8; corner++) {
    const point = new Vector3(
      (corner & 1 ? view.bbox.max[0] : view.bbox.min[0]) - centre.x,
      (corner & 2 ? view.bbox.max[1] : view.bbox.min[1]) - centre.y,
      (corner & 4 ? view.bbox.max[2] : view.bbox.min[2]) - centre.z,
    );
    const depth = point.dot(direction);
    distance = Math.max(
      distance,
      Math.abs(point.dot(right)) / (tan * Math.max(aspect, 0.1)) + depth,
      Math.abs(point.dot(trueUp)) / tan + depth,
    );
  }
  return distance * 1.06;
}

function buildSide(view: MeshView, centre: Vector3): Side {
  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.1));
  const key = new DirectionalLight(0xffffff, 1.9);
  key.position.set(1, -1.4, 1.2);
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 0.7);
  fill.position.set(-1, 1, -0.6);
  scene.add(fill);

  const geometry = new BufferGeometry();
  const positions = view.positions;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= centre.x;
    positions[i + 1] -= centre.y;
    positions[i + 2] -= centre.z;
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.computeVertexNormals(); // non-indexed, so this is flat shading

  const surface = new Mesh(geometry, new MeshLambertMaterial({ color: SURFACE }));
  // Replaces the surface when switched on — a see-through wireframe, which
  // is the point: you can look at the far side of the model through it.
  const wireframe = new Mesh(
    geometry,
    new MeshBasicMaterial({ color: WIRE, wireframe: true, transparent: true, opacity: 0.55 }),
  );
  wireframe.visible = false;
  // Backfaces in red: through a hole, or on an inside-out shell, you see them.
  const backfaces = new Mesh(
    geometry,
    new MeshLambertMaterial({ color: BACKFACE, side: BackSide }),
  );
  scene.add(surface, backfaces, wireframe);

  const overlays: (LineSegments | Points)[] = [
    lines(view.openEdges, OPEN, centre),
    lines(view.nonManifoldEdges, NON_MANIFOLD, centre),
    lines(view.flippedEdges, FLIPPED, centre),
    points(view.bowties, MARKER, centre),
    points(view.degenerate, MARKER, centre),
  ];
  for (const overlay of overlays) scene.add(overlay);

  return { scene, surface, backfaces, wireframe, overlays };
}

function shift(data: Float32Array, centre: Vector3): Float32Array {
  for (let i = 0; i < data.length; i += 3) {
    data[i] -= centre.x;
    data[i + 1] -= centre.y;
    data[i + 2] -= centre.z;
  }
  return data;
}

function lines(data: Float32Array, color: number, centre: Vector3): LineSegments {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(shift(data, centre), 3));
  const segments = new LineSegments(
    geometry,
    // Drawn through the model on purpose: a defect is usually round the back.
    new LineBasicMaterial({ color: new Color(color), depthTest: false, transparent: true }),
  );
  segments.renderOrder = 10;
  return segments;
}

function points(data: Float32Array, color: number, centre: Vector3): Points {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(shift(data, centre), 3));
  const cloud = new Points(
    geometry,
    new PointsMaterial({
      color: new Color(color),
      size: 7,
      sizeAttenuation: false,
      depthTest: false,
      transparent: true,
    }),
  );
  cloud.renderOrder = 11;
  return cloud;
}
