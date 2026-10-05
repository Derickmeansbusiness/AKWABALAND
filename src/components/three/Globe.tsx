'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { loadAfricaTopologyCached, loadLandTopology } from '@/lib/webgl/useGeo';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

interface Props {
  /** 0..1 progress of the act */
  progressRef: MutableRefObject<number>;
}

const UAE: [number, number] = [54.4, 24.4];
/** Symbolic origins — continents, not routes. */
const ORIGINS: { lonLat: [number, number] }[] = [
  { lonLat: [3.4, 6.5] }, // West Africa
  { lonLat: [36.8, -1.3] }, // East Africa
  { lonLat: [28.0, -26.2] }, // Southern Africa
  { lonLat: [-7.6, 33.6] }, // North Africa
  { lonLat: [-0.1, 51.5] }, // Europe
  { lonLat: [13.4, 52.5] }, // Europe
  { lonLat: [72.9, 19.1] }, // Asia
  { lonLat: [103.8, 1.3] }, // Asia
  { lonLat: [116.4, 39.9] }, // Asia
];

/** lon/lat → position in the sphere's own frame, matching SphereGeometry's UV layout. */
function toVec(lon: number, lat: number, r: number): THREE.Vector3 {
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const phi = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}
/** rotation.y that brings a longitude to face the camera (+Z). */
const rotYFor = (lon: number) => -Math.PI / 2 - THREE.MathUtils.degToRad(lon);

/**
 * A quiet globe: dark ocean, darker land, Africa a shade lighter. Thin arcs
 * from Africa, Europe and Asia gather on the Gulf as the scroll turns the
 * sphere from the continent toward the UAE. No atmosphere, no glow.
 */
export function Globe({ progressRef }: Props) {
  const mount = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    const disposables: { dispose: () => void }[] = [];

    (async () => {
      let land: FeatureCollection;
      let africa: FeatureCollection;
      try {
        const [lt, at] = await Promise.all([loadLandTopology(), loadAfricaTopologyCached()]);
        land = feature(lt, lt.objects.land) as FeatureCollection;
        africa = feature(at, at.objects.africa) as FeatureCollection;
      } catch {
        return;
      }
      if (disposed) return;
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') ?? probe.getContext('webgl'))) return;

      // ── texture: equirectangular canvas drawn with d3 ──
      // The visible hemisphere spans roughly 900 px on a large screen; 2048 across the full equator is plenty.
      const W = tier === 'mobile' ? 1536 : 2048;
      const H = W / 2;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      const projection = geoEquirectangular().fitSize([W, H], { type: 'Sphere' });
      const path = geoPath(projection, ctx);
      ctx.fillStyle = '#0c0b09';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#231a11';
      ctx.beginPath();
      path(land);
      ctx.fill();
      ctx.fillStyle = '#3f2b18';
      ctx.beginPath();
      path(africa);
      ctx.fill();
      ctx.strokeStyle = 'rgba(242,238,229,0.07)';
      ctx.lineWidth = W / 2048;
      ctx.beginPath();
      path(land);
      ctx.stroke();
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      disposables.push(texture);

      // ── scene ──
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
      camera.position.set(0, 0.2, 4.6);
      camera.lookAt(0, 0, 0);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'mobile' ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      host.appendChild(renderer.domElement);

      const R = 1;
      const geo = new THREE.SphereGeometry(R, 96, 64);
      const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0.04 });
      disposables.push(geo, mat);
      const sphere = new THREE.Mesh(geo, mat);
      const tilt = new THREE.Group();
      tilt.rotation.x = 0.32;
      tilt.add(sphere);
      scene.add(tilt);

      scene.add(new THREE.AmbientLight(0x2a2218, 0.6));
      const key = new THREE.DirectionalLight(0xffe2bd, 2.2);
      key.position.set(-3, 2.5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xb79a58, 0.5);
      rim.position.set(3, -1, -2);
      scene.add(rim);

      // ── arcs ──
      const uae = toVec(UAE[0], UAE[1], R);
      const arcs: { line: THREE.Line; count: number; delay: number }[] = [];
      ORIGINS.forEach((o, i) => {
        const a = toVec(o.lonLat[0], o.lonLat[1], R);
        const angle = a.angleTo(uae);
        const N = 96;
        const pts: THREE.Vector3[] = [];
        for (let k = 0; k <= N; k++) {
          const t = k / N;
          const p = new THREE.Vector3().copy(a).lerp(uae, t).normalize();
          // slerp-ish: lerp then renormalise is adequate for these spans; lift it off the surface
          const lift = 1 + Math.sin(t * Math.PI) * (0.06 + angle * 0.07);
          pts.push(p.multiplyScalar(R * lift));
        }
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color: 0xb79a58, transparent: true, opacity: 0.55 });
        const line = new THREE.Line(g, m);
        g.setDrawRange(0, 0);
        sphere.add(line);
        disposables.push(g, m);
        arcs.push({ line, count: N + 1, delay: i / ORIGINS.length });

        const dg = new THREE.SphereGeometry(0.008, 8, 8);
        const dm = new THREE.MeshBasicMaterial({ color: 0xd8d0c2, transparent: true, opacity: 0.8 });
        const dot = new THREE.Mesh(dg, dm);
        dot.position.copy(a.clone().multiplyScalar(1.004));
        sphere.add(dot);
        disposables.push(dg, dm);
      });
      const coreG = new THREE.SphereGeometry(0.014, 12, 12);
      const coreM = new THREE.MeshBasicMaterial({ color: 0xe8cf8f });
      const core = new THREE.Mesh(coreG, coreM);
      core.position.copy(uae.clone().multiplyScalar(1.006));
      sphere.add(core);
      disposables.push(coreG, coreM);

      const resize = () => {
        if (!renderer) return;
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w < h ? 40 : 28;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      disposables.push({ dispose: () => ro.disconnect() });

      const smooth = (t: number) => t * t * (3 - 2 * t);
      const range = (v: number, a: number, b: number) => smooth(THREE.MathUtils.clamp((v - a) / (b - a), 0, 1));
      const FROM = rotYFor(20);
      const TO = rotYFor(48);
      const t0 = performance.now();

      // Render only while the act is near the viewport; one WebGL loop per visible scene, never per page.
      let visible = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          const was = visible;
          visible = entry.isIntersecting;
          if (visible && !was && !raf) raf = requestAnimationFrame(frame);
        },
        { rootMargin: '25% 0px 25% 0px' },
      );
      io.observe(host);
      disposables.push({ dispose: () => io.disconnect() });

      const frame = (now: number) => {
        raf = 0;
        if (disposed || !renderer) return;
        const p = reduced ? 1 : THREE.MathUtils.clamp(progressRef.current, 0, 1);
        const turn = range(p, 0.02, 0.6);
        sphere.rotation.y = THREE.MathUtils.lerp(FROM, TO, turn) + (reduced ? 0 : Math.sin((now - t0) / 9000) * 0.01);
        camera.position.z = THREE.MathUtils.lerp(4.9, 4.3, range(p, 0, 0.7));
        camera.lookAt(0, 0.05, 0);
        for (const arc of arcs) {
          const d = range(p, 0.3 + arc.delay * 0.3, 0.55 + arc.delay * 0.3);
          arc.line.geometry.setDrawRange(0, Math.floor(d * arc.count));
        }
        renderer.render(scene, camera);
        if (visible) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame); // one frame so the first paint is not empty
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      disposables.forEach((d) => d.dispose());
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [progressRef, reduced, tier]);

  return <div ref={mount} aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />;
}
