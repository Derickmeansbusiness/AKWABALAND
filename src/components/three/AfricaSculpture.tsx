'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { buildAfricaGeometry, loadAfricaTopology, africaSvgPath, type AfricaGeometry } from '@/lib/webgl/africaShape';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTier } from '@/hooks/useMediaQuery';

interface Props {
  /** 0..1 scroll progress of the Awakening, written by the section every frame */
  progressRef: MutableRefObject<number>;
  /** called once the first frame with geometry has rendered */
  onReady?: () => void;
  className?: string;
}

const UAE: [number, number] = [54.4, 24.4];
const CONTINENT_HEART: [number, number] = [18, 6];

/**
 * A shallow bronze relief of the continent, cut from Natural Earth geometry.
 * Soft warm key, faint rim, deep shadow; the camera pushes in for a few seconds
 * on its own, then scroll takes the camera back and sends one point of light
 * toward the Gulf. No bloom, no particles, no spin.
 */
export function AfricaSculpture({ progressRef, onReady, className }: Props) {
  const mount = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tier = useTier();
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    const disposables: { dispose: () => void }[] = [];

    (async () => {
      let geo: AfricaGeometry;
      try {
        geo = buildAfricaGeometry(await loadAfricaTopology());
      } catch {
        return; // no geometry, no sculpture; the act still reads with text alone
      }
      if (disposed) return;

      // WebGL probe
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
      if (!gl) {
        setFallback(africaSvgPath(geo));
        onReady?.();
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      // Camera distances: the continent occupies roughly half the frame height at rest.
      const CAM_START = 6.4;
      const CAM_PUSHED = 5.5;
      const CAM_RECEDE = 9.2;
      camera.position.set(0, 0.15, CAM_START);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'mobile' ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.8;
      host.appendChild(renderer.domElement);

      // ── Relief ──────────────────────────────────────────────────────
      const extrude = new THREE.ExtrudeGeometry(geo.shapes, {
        depth: 0.055,
        bevelEnabled: tier !== 'mobile',
        bevelThickness: 0.008,
        bevelSize: 0.006,
        bevelSegments: 2,
        curveSegments: tier === 'mobile' ? 2 : 4,
      });
      extrude.computeVertexNormals();
      disposables.push(extrude);

      // Dark bronze: most of the surface sits in shadow; only the raking key finds it.
      const topMat = new THREE.MeshStandardMaterial({ color: 0x4a331d, roughness: 0.64, metalness: 0.3, transparent: true, opacity: 0 });
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x24170d, roughness: 0.75, metalness: 0.2, transparent: true, opacity: 0 });
      disposables.push(topMat, sideMat);
      const relief = new THREE.Mesh(extrude, [topMat, sideMat]);
      relief.position.z = -0.055; // put the top face on z=0
      const rig = new THREE.Group();
      rig.add(relief);
      rig.rotation.x = -0.32;
      rig.rotation.y = 0.06;
      rig.position.y = -0.05;
      scene.add(rig);

      // ── Light ───────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0x1a1410, 0.35);
      // Raking key from the upper left: a tight, soft cone so the south-east falls into shadow.
      const key = new THREE.SpotLight(0xffd0a0, 0, 24, 0.42, 1, 1.4);
      key.position.set(-3.4, 3.6, 2.6);
      key.target = rig;
      const rim = new THREE.DirectionalLight(0xb79a58, 0);
      rim.position.set(2.4, -1.2, -1.6);
      scene.add(ambient, key, rim);

      // ── Point of light toward the Gulf ──────────────────────────────
      const start = geo.project(CONTINENT_HEART);
      const end = geo.project(UAE);
      const dotGeo = new THREE.SphereGeometry(0.011, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xe8cf8f, transparent: true, opacity: 0 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(start[0], start[1], 0.02);
      const haloMat = new THREE.SpriteMaterial({
        color: 0xb79a58,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: haloTexture(),
      });
      const halo = new THREE.Sprite(haloMat);
      halo.scale.setScalar(0.22);
      halo.position.copy(dot.position);
      const trailGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(start[0], start[1], 0.015), new THREE.Vector3(start[0], start[1], 0.015)]);
      const trailMat = new THREE.LineBasicMaterial({ color: 0xb79a58, transparent: true, opacity: 0 });
      const trail = new THREE.Line(trailGeo, trailMat);
      rig.add(dot, halo, trail);
      disposables.push(dotGeo, dotMat, haloMat, trailGeo, trailMat);

      // ── Sizing ──────────────────────────────────────────────────────
      const resize = () => {
        if (!renderer) return;
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // keep the continent comfortably framed on portrait screens
        camera.fov = w < h ? 44 : 30;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // ── Loop ────────────────────────────────────────────────────────
      const t0 = performance.now();
      const REVEAL_S = reduced ? 0.01 : 3.6;
      const PUSH_S = reduced ? 0.01 : 9;
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      let readyFired = false;
      const tmp = new THREE.Vector3();

      const frame = (now: number) => {
        if (disposed || !renderer) return;
        const elapsed = (now - t0) / 1000;
        const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);

        // reveal: materials and key light come up over a few seconds
        const reveal = smooth(THREE.MathUtils.clamp(elapsed / REVEAL_S, 0, 1));
        topMat.opacity = sideMat.opacity = reveal * (1 - smoothRange(p, 0.78, 1));
        key.intensity = 34 * reveal;
        rim.intensity = 0.45 * reveal;

        // autonomous push, then scroll-driven recede
        const push = ease(THREE.MathUtils.clamp(elapsed / PUSH_S, 0, 1));
        const base = THREE.MathUtils.lerp(CAM_START, CAM_PUSHED, push);
        const recede = smooth(THREE.MathUtils.clamp(p / 0.85, 0, 1));
        camera.position.z = THREE.MathUtils.lerp(base, CAM_RECEDE, recede);
        camera.position.y = 0.15 + recede * 0.25;
        camera.lookAt(0, 0, 0);
        rig.rotation.y = 0.06 + recede * 0.16 + (reduced ? 0 : Math.sin(elapsed * 0.12) * 0.012);

        // the point of light leaves the continent for the Gulf
        const lightIn = smoothRange(p, 0.3, 0.42);
        const travel = ease(smoothRange(p, 0.38, 0.86));
        const fadeOut = 1 - smoothRange(p, 0.9, 1);
        tmp.set(THREE.MathUtils.lerp(start[0], end[0], travel), THREE.MathUtils.lerp(start[1], end[1], travel), 0.02 + travel * 0.05);
        dot.position.copy(tmp);
        halo.position.copy(tmp);
        dotMat.opacity = lightIn * fadeOut;
        haloMat.opacity = 0.5 * lightIn * fadeOut * (0.85 + 0.15 * Math.sin(elapsed * 2.1));
        const pos = trailGeo.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(1, tmp.x, tmp.y, tmp.z - 0.005);
        pos.needsUpdate = true;
        trailMat.opacity = 0.35 * lightIn * fadeOut * travel;

        renderer.render(scene, camera);
        if (!readyFired) {
          readyFired = true;
          onReady?.();
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      disposables.push({ dispose: () => ro.disconnect() });
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
  }, [progressRef, onReady, reduced, tier]);

  return (
    <div ref={mount} className={className} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      {fallback && (
        <svg viewBox="-130 -130 260 260" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <path d={fallback} fill="#4a3420" />
        </svg>
      )}
    </div>
  );
}

function smoothRange(v: number, a: number, b: number): number {
  const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function haloTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,230,180,0.9)');
  g.addColorStop(0.35, 'rgba(183,154,88,0.35)');
  g.addColorStop(1, 'rgba(183,154,88,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
