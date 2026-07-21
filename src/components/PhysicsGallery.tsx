"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useNavigate } from "@tanstack/react-router";
import * as THREE from "three";
import type { MosaicItem } from "./MosaicGallery";

const COLS = 5;
const GAP = 20;
const HOVER_SCALE = 1.2;

type OpenFn = (item: MosaicItem) => void;

function Photo({
  item,
  home,
  w,
  h,
  onOpen,
}: {
  item: MosaicItem;
  home: [number, number];
  w: number;
  h: number;
  onOpen: OpenFn;
}) {
  const rb = useRef<RapierRigidBody>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(item.src);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, [texture]);

  const cw = hovered ? w * HOVER_SCALE : w;
  const ch = hovered ? h * HOVER_SCALE : h;

  useFrame((_, dt) => {
    const r = rb.current;
    if (!r) return;
    const t = r.translation();
    const v = r.linvel();
    const k = 40; // spring stiffness back to home
    const c = 10; // damping
    const fx = (home[0] - t.x) * k - v.x * c;
    const fy = (home[1] - t.y) * k - v.y * c;
    const step = Math.min(dt, 1 / 30);
    r.applyImpulse({ x: fx * step, y: fy * step, z: 0 }, true);
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (typeof document !== "undefined") document.body.style.cursor = "pointer";
  };
  const handleOut = () => {
    setHovered(false);
    if (typeof document !== "undefined") document.body.style.cursor = "";
  };

  return (
    <RigidBody
      ref={rb}
      type="dynamic"
      gravityScale={0}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, true, false]}
      linearDamping={2.5}
      colliders={false}
      position={[home[0], home[1], hovered ? 1 : 0]}
    >
      <CuboidCollider args={[cw / 2, ch / 2, 0.1]} restitution={0.1} friction={0} />
      <mesh
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(item);
        }}
        scale={[cw, ch, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </RigidBody>
  );
}

function Walls({ w, h }: { w: number; h: number }) {
  const t = 2;
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, h / 2 + t / 2, 0]}>
        <CuboidCollider args={[w / 2 + t, t / 2, 1]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, -h / 2 - t / 2, 0]}>
        <CuboidCollider args={[w / 2 + t, t / 2, 1]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[-w / 2 - t / 2, 0, 0]}>
        <CuboidCollider args={[t / 2, h / 2 + t, 1]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[w / 2 + t / 2, 0, 0]}>
        <CuboidCollider args={[t / 2, h / 2 + t, 1]} />
      </RigidBody>
    </>
  );
}

function Scene({
  items,
  width,
  height,
  onOpen,
}: {
  items: MosaicItem[];
  width: number;
  height: number;
  onOpen: OpenFn;
}) {
  const cellW = (width - GAP * (COLS + 1)) / COLS;
  const cellH = cellW * 1.25;

  const positions = useMemo<[number, number][]>(
    () =>
      items.map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = -width / 2 + GAP + cellW / 2 + col * (cellW + GAP);
        const y =
          height / 2 - GAP - cellH / 2 - row * (cellH + GAP);
        return [x, y];
      }),
    [items, width, height, cellW, cellH],
  );

  return (
    <>
      <Walls w={width} h={height} />
      {items.map((item, i) => (
        <Photo
          key={item.key}
          item={item}
          home={positions[i]}
          w={cellW}
          h={cellH}
          onOpen={onOpen}
        />
      ))}
    </>
  );
}

export default function PhysicsGallery({ items }: { items: MosaicItem[] }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  const cellW = (width - GAP * (COLS + 1)) / COLS;
  const cellH = cellW * 1.25;
  const rows = Math.ceil(items.length / COLS);
  const height = rows * (cellH + GAP) + GAP;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onOpen: OpenFn = (item) => {
    void navigate({
      to: "/disciplines/$discipline_/$photo",
      params: { discipline: item.discipline, photo: item.photo },
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[1600px] px-2"
      style={{ height: `${height}px` }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Physics gravity={[0, 0, 0]} timeStep={1 / 60}>
            <Scene
              items={items}
              width={width}
              height={height}
              onOpen={onOpen}
            />
          </Physics>
        </Suspense>
      </Canvas>
      {/* SEO / a11y: crawlable links behind the canvas */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={`/disciplines/${item.discipline}/${item.photo}`}
            >{`${item.title} — ${item.year}`}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}