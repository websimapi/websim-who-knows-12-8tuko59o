import * as THREE from 'three';
import { TASKS } from './tasks.js';

// Work stays in the house: every station visibly changes as tasks progress.
export function buildTaskObjects() {
  const root = new THREE.Group(), stations = new Map(); let painter = null;
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: .8 });
  const wood = mat(0x98663c), green = mat(0x6aaf36), pale = mat(0xb3ce74), paper = mat(0xe7dcc3), brass = mat(0xb79550);
  const box = (g, w, h, d, material, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  for (const task of TASKS.filter(t => t.id !== 'pool')) {
    const g = new THREE.Group(); g.position.set(task.x, task.y, task.z); root.add(g);
    const parts = []; let update = () => {}, paint = null;
    if (task.id === 'lettuce') {
      box(g, .76, .035, .5, wood, 0, -.055);
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 7), i % 2 ? green : pale); m.scale.set(1, .75, .75); m.position.set(Math.cos(i * 2.4) * .09, .035 + i * .008, Math.sin(i * 2.4) * .065); g.add(m); parts.push(m); }
      const chopped = [];
      for (let i = 0; i < 18; i++) chopped.push(box(g, .065, .025, .035, i % 2 ? green : pale, -.28 + i % 6 * .1, -.02, -.13 + Math.floor(i / 6) * .12));
      update = p => { parts.forEach((m, i) => m.visible = i >= Math.floor(p * 6)); chopped.forEach((m, i) => m.visible = i < Math.floor(p * 18)); };
    } else if (task.id === 'books') {
      for (let i = 0; i < 4; i++) parts.push(box(g, .25, .055, .32, mat([0x704334, 0x365b47, 0x304863, 0x8c7441][i]), (i - 1.5) * .25, i * .025, 0));
      update = p => parts.forEach((m, i) => { const done = i < Math.round(p * 4); m.position.set(done ? -.3 + i * .12 : (i - 1.5) * .25, done ? .125 : i * .025, 0); m.rotation.set(0, done ? 0 : i * .65, done ? Math.PI / 2 : 0); });
    } else if (task.id === 'papers') {
      for (let i = 0; i < 4; i++) parts.push(box(g, .22, .006, .3, paper, (i - 1.5) * .19, i * .008));
      update = p => parts.forEach((m, i) => { const done = i < Math.round(p * 4); m.position.x = done ? 0 : (i - 1.5) * .19; m.rotation.y = done ? 0 : (i - 1) * .45; });
    } else if (task.id === 'darts') {
      for (let i = 0; i < 3; i++) {
        const d = new THREE.Group(); g.add(d); parts.push(d);
        const a = i * 2.1 + 0.4, r = 0.05 + i * 0.06; d.position.set(0.02, Math.sin(a) * r, Math.cos(a) * r);
        const shaft = box(d, 0.15, 0.012, 0.012, mat(0x9a9a9a), 0.075); shaft.castShadow = false;
        box(d, 0.05, 0.05, 0.004, mat([0xc7372f, 0x2e7d4f, 0xe8c547][i]), 0.15, 0, 0); box(d, 0.05, 0.004, 0.05, mat([0xc7372f, 0x2e7d4f, 0xe8c547][i]), 0.15, 0, 0);
      }
      update = p => parts.forEach((m, i) => m.visible = i < Math.floor(p * 3 + 1e-6));
    } else if (task.id === 'paint') {
      g.rotation.y = -0.3;
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.71, 0.96), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
      pic.position.z = 0.045; pic.visible = false; g.add(pic);
      let url = null; const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
      paint = (u) => {
        if (u === url) return; url = u;
        if (!u) { pic.visible = false; return; }
        loader.load(u, (t) => { if (url !== u) return; t.colorSpace = THREE.SRGBColorSpace; pic.material.map?.dispose(); pic.material.map = t; pic.material.needsUpdate = true; pic.visible = true; });
      };
    } else if (task.id === 'bathroom') {
      const grime = new THREE.MeshStandardMaterial({ color: 0x5c5028, transparent: true, opacity: .6, depthWrite: false, roughness: 1 });
      const blob = (r, x, y, z) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), grime); m.position.set(x, y, z); m.rotation.x = -Math.PI / 2; g.add(m); };
      blob(.09, -.5, .006, .05); blob(.07, .35, .006, -.05); blob(.06, .8, .006, .08);
      for (let i = 0; i < 5; i++) blob(.16 + (i % 2) * .08, -1.2 + i * .6, -.885, .9 + (i * 37 % 5) * .15);
      update = p => { grime.opacity = (1 - p) * .6; grime.visible = p < 1; };
    } else if (task.id === 'defrag') {
      g.rotation.y = Math.PI;
      const beige = mat(0xd8cfb4), dark = mat(0x2b2b2b);
      box(g, .44, .38, .4, beige, 0, .2, .05); box(g, .3, .05, .26, beige, 0, .025, .05);
      box(g, .2, .46, .44, beige, .62, .23, .05); box(g, .5, .03, .17, dark, 0, .015, .34);
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 96; const cg = cv.getContext('2d');
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(.34, .26), new THREE.MeshBasicMaterial({ map: tex })); screen.position.set(0, .22, .252); g.add(screen);
      let last = -1;
      update = p => {
        if (p === last) return; last = p;
        cg.fillStyle = '#0000a8'; cg.fillRect(0, 0, 128, 96);
        for (let i = 0; i < 60; i++) { cg.fillStyle = i / 60 < p ? '#55ffff' : (i * 7) % 5 === 0 ? '#ff5555' : '#aaaaaa'; cg.fillRect(8 + (i % 12) * 9.5, 10 + Math.floor(i / 12) * 11, 8, 9); }
        cg.fillStyle = '#000060'; cg.fillRect(8, 74, 112, 10); cg.fillStyle = '#55ffff'; cg.fillRect(8, 74, 112 * p, 10);
        tex.needsUpdate = true;
      };
    } else {
      const crank = new THREE.Group(); g.add(crank);
      if (task.id === 'clock') g.rotation.y = Math.PI / 2;
      box(crank, .18, .028, .028, brass); box(crank, .03, .085, .035, brass, .075, .03);
      if (task.id === 'music') crank.position.set(.25, -.16, 0);
      update = p => { crank.rotation.z = p * Math.PI * 8; };
    }
    update(0); stations.set(task.id, update); if (paint) painter = paint;
  }
  return { root, update(scene = {}, painting = null) { for (const [id, update] of stations) update(scene[id]?.progress || 0); painter?.(painting); } };
}

export function skullBallTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
  const g = canvas.getContext('2d'); g.fillStyle = '#e6dfc8'; g.fillRect(0, 0, 256, 128);
  // Two painted skulls stay legible as the ball turns.
  for (const x of [64, 192]) {
    g.fillStyle = '#22251d'; g.beginPath(); g.ellipse(x - 13, 56, 9, 12, -.25, 0, Math.PI * 2); g.ellipse(x + 13, 56, 9, 12, .25, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x, 66); g.lineTo(x - 5, 78); g.lineTo(x + 5, 78); g.fill();
    for (let i = -2; i <= 2; i++) g.fillRect(x + i * 7 - 2, 84, 4, 11);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
