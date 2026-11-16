// Writes public/ar/<slug>.glb: a true-size AR preview for every product whose description gives its size.
//
//   npm run ar
//
// There are no real 3D models of the products, so the preview is honest about what it is:
// - frames (W×H, 2 numbers): the photo as a picture of that size with a black frame, for hanging on a wall;
// - models (L×W×H, 3 numbers): a glass box of the real size with red edges on a baseplate, and the product photo
//   standing inside it, so a customer can see whether it fits the shelf.
// Re-run after catalog.json changes, then commit the .glb files. Also writes src/data/ar.json (slug → kind, size).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(path.join(root, "src", "data", "catalog.json"), "utf8"));
const outDir = path.join(root, "public", "ar");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const lin = (hex) => [1, 3, 5].map((i) => ((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))(parseInt(hex.slice(i, i + 2), 16) / 255));

/** Minimal glTF 2.0 binary writer: indexed triangle meshes, PBR or unlit materials, one optional JPEG texture. */
function glb({ parts, materials, jpeg }) {
  const chunks = [];
  let offset = 0;
  const bufferViews = [];
  const accessors = [];
  const push = (buf, target) => {
    const pad = (4 - (buf.length % 4)) % 4;
    chunks.push(buf, Buffer.alloc(pad));
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target && { target }) });
    offset += buf.length + pad;
    return bufferViews.length - 1;
  };
  const f32 = (arr, type, target, minmax) => {
    const view = push(Buffer.from(new Float32Array(arr).buffer), target);
    const n = { VEC2: 2, VEC3: 3 }[type];
    const acc = { bufferView: view, componentType: 5126, count: arr.length / n, type };
    if (minmax) {
      acc.min = [0, 1, 2].map((k) => Math.min(...arr.filter((_, i) => i % 3 === k)));
      acc.max = [0, 1, 2].map((k) => Math.max(...arr.filter((_, i) => i % 3 === k)));
    }
    accessors.push(acc);
    return accessors.length - 1;
  };
  const meshes = parts.map((p) => {
    const POSITION = f32(p.pos, "VEC3", 34962, true);
    const NORMAL = f32(p.nrm, "VEC3", 34962);
    const attributes = { POSITION, NORMAL, ...(p.uv && { TEXCOORD_0: f32(p.uv, "VEC2", 34962) }) };
    const iv = push(Buffer.from(new Uint16Array(p.idx).buffer), 34963);
    accessors.push({ bufferView: iv, componentType: 5123, count: p.idx.length, type: "SCALAR" });
    return { primitives: [{ attributes, indices: accessors.length - 1, material: p.material }] };
  });
  const json = {
    asset: { version: "2.0", generator: "brickzone build-ar.mjs" },
    scene: 0,
    scenes: [{ nodes: meshes.map((_, i) => i) }],
    nodes: meshes.map((_, i) => ({ mesh: i })),
    meshes,
    materials,
    accessors,
    bufferViews,
  };
  if (jpeg) {
    json.images = [{ bufferView: push(jpeg), mimeType: "image/jpeg" }];
    json.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }];
    json.textures = [{ sampler: 0, source: 0 }];
  }
  if (materials.some((m) => m.extensions?.KHR_materials_unlit)) json.extensionsUsed = ["KHR_materials_unlit"];
  json.buffers = [{ byteLength: offset }];
  const bin = Buffer.concat(chunks);
  let js = Buffer.from(JSON.stringify(json));
  js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const ch = (type, data) => {
    const h = Buffer.alloc(8);
    h.writeUInt32LE(data.length, 0);
    h.writeUInt32LE(type, 4);
    return Buffer.concat([h, data]);
  };
  return Buffer.concat([header, ch(0x4e4f534a, js), ch(0x004e4942, bin)]);
}

/** Axis-aligned box from (x0,y0,z0) to (x1,y1,z1), 24 vertices with flat normals. */
function box([x0, y0, z0], [x1, y1, z1], material) {
  const faces = [
    [[1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]],
    [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
    [[0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]],
    [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    [[0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]],
  ];
  const pos = [], nrm = [], idx = [];
  faces.forEach(([n, vs], f) => {
    vs.forEach((v) => (pos.push(...v), nrm.push(...n)));
    const b = f * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  return { pos, nrm, idx, material };
}

/** Upright rectangle in the XY plane at depth z, facing +Z, centred on x = 0, from y0 up. */
function card(w, h, y0, z, material) {
  const x = w / 2;
  return { pos: [-x, y0, z, x, y0, z, x, y0 + h, z, -x, y0 + h, z], nrm: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], uv: [0, 1, 1, 1, 1, 0, 0, 0], idx: [0, 1, 2, 0, 2, 3], material };
}

/** Merge parts that share a material into one primitive (fewer draw calls). */
function merge(parts) {
  const by = new Map();
  for (const p of parts) {
    const m = by.get(p.material) ?? { pos: [], nrm: [], idx: [], material: p.material, ...(p.uv && { uv: [] }) };
    const base = m.pos.length / 3;
    m.pos.push(...p.pos);
    m.nrm.push(...p.nrm);
    if (p.uv) m.uv.push(...p.uv);
    m.idx.push(...p.idx.map((i) => i + base));
    by.set(p.material, m);
  }
  return [...by.values()];
}

const pbr = (hex, extra = {}) => ({ pbrMetallicRoughness: { baseColorFactor: [...lin(hex), 1], metallicFactor: 0, roughnessFactor: 0.6 }, ...extra });
const photoMat = { pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 1 }, doubleSided: true, extensions: { KHR_materials_unlit: {} } };

async function texture(src, trim, maxSide = 768) {
  // models: cut away the empty photo background so the product fills its card (falls back to the full photo)
  let input = await sharp(path.join(root, "public", src)).flatten({ background: "#ffffff" }).toBuffer();
  if (trim) {
    try {
      const t = await sharp(input).trim({ threshold: 28 }).toBuffer({ resolveWithObject: true });
      const o = await sharp(input).metadata();
      if (t.info.width * t.info.height > 0.18 * o.width * o.height) input = t.data;
    } catch {
      /* nothing to trim */
    }
  }
  return sharp(input).resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
}

const index = {};
let bytes = 0;
for (const p of catalog.products) {
  const nums = (p.size ?? "").match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!nums || nums.length < 2 || nums.some((n) => !(n > 0 && n < 300))) continue;
  const { data: jpeg, info } = await texture(p.images[0].src, nums.length === 3);
  const aspect = info.width / info.height;
  const cm = (n) => n / 100;
  let model;

  if (nums.length === 2) {
    // a picture for the wall: back of the frame at z = 0, facing +Z
    const [a, b] = nums;
    const [W, H] = aspect >= 1 ? [Math.max(a, b), Math.min(a, b)] : [Math.min(a, b), Math.max(a, b)];
    const w = cm(W), h = cm(H), d = cm(2), rim = cm(2);
    // photo fitted inside the frame without stretching (contain), on a white mount
    const [pw, ph] = aspect > (W - 4) / (H - 4) ? [w - 2 * rim, (w - 2 * rim) / aspect] : [(h - 2 * rim) * aspect, h - 2 * rim];
    const parts = [
      box([-w / 2, 0, 0], [w / 2, rim, d], 0),
      box([-w / 2, h - rim, 0], [w / 2, h, d], 0),
      box([-w / 2, rim, 0], [-w / 2 + rim, h - rim, d], 0),
      box([w / 2 - rim, rim, 0], [w / 2, h - rim, d], 0),
      box([-w / 2 + rim, rim, 0], [w / 2 - rim, h - rim, d * 0.4], 1),
      card(pw, ph, (h - ph) / 2, d * 0.4 + 0.001, 2),
    ];
    model = glb({ parts: merge(parts), materials: [pbr("#16171b", { pbrMetallicRoughness: { baseColorFactor: [...lin("#16171b"), 1], metallicFactor: 0.2, roughnessFactor: 0.35 } }), pbr("#f4f3ef"), photoMat], jpeg });
    index[p.slug] = { kind: "wall", w: W, h: H };
  } else {
    // a model: length along X, width along Z, height up
    const [a, b, c] = nums;
    const L = Math.max(a, b), Wd = Math.min(a, b), H = c;
    const l = cm(L), w = cm(Wd), h = cm(H), e = 0.0035, base = 0.006, pad = 0.015;
    const y0 = base;
    const edges = [];
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) edges.push(box([(sx * l) / 2 - e, y0, (sz * w) / 2 - e], [(sx * l) / 2 + e, y0 + h, (sz * w) / 2 + e], 2));
    for (const y of [y0, y0 + h]) {
      for (const sz of [-1, 1]) edges.push(box([-l / 2 - e, y - e, (sz * w) / 2 - e], [l / 2 + e, y + e, (sz * w) / 2 + e], 2));
      for (const sx of [-1, 1]) edges.push(box([(sx * l) / 2 - e, y - e, -w / 2 - e], [(sx * l) / 2 + e, y + e, w / 2 + e], 2));
    }
    // studs on the baseplate corners, like a brick
    const studs = [];
    const r = 0.0045;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) studs.push(box([(sx * (l / 2 + pad / 2)) - r, base, (sz * (w / 2 + pad / 2)) - r], [(sx * (l / 2 + pad / 2)) + r, base + 0.003, (sz * (w / 2 + pad / 2)) + r], 0));
    const [pw, ph] = aspect > L / H ? [l, l / aspect] : [h * aspect, h];
    const parts = [
      box([-l / 2 - pad, 0, -w / 2 - pad], [l / 2 + pad, base, w / 2 + pad], 0),
      ...studs,
      box([-l / 2, y0, -w / 2], [l / 2, y0 + h, w / 2], 1),
      ...edges,
      card(pw, ph, y0 + (h - ph) / 2, 0, 3),
    ];
    model = glb({
      parts: merge(parts),
      materials: [
        pbr("#d5d2ca", { pbrMetallicRoughness: { baseColorFactor: [...lin("#d5d2ca"), 1], metallicFactor: 0, roughnessFactor: 0.75 } }),
        { pbrMetallicRoughness: { baseColorFactor: [0.75, 0.9, 0.9, 0.14], metallicFactor: 0, roughnessFactor: 0.05 }, alphaMode: "BLEND", doubleSided: true },
        pbr("#e2283a"),
        photoMat,
      ],
      jpeg,
    });
    index[p.slug] = { kind: "floor", l: L, w: Wd, h: H };
  }
  writeFileSync(path.join(outDir, `${p.slug}.glb`), model);
  bytes += model.length;
}
writeFileSync(path.join(root, "src", "data", "ar.json"), JSON.stringify(index) + "\n");
const kinds = Object.values(index).reduce((n, x) => ((n[x.kind] = (n[x.kind] ?? 0) + 1), n), {});
console.log(`ar: ${Object.keys(index).length} models (${JSON.stringify(kinds)}), ${(bytes / 1048576).toFixed(1)} MB`);
