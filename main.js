
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = innerWidth * devicePixelRatio;
  H = canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  W = innerWidth;
  H = innerHeight;
}
addEventListener("resize", resize);
resize();

let started = false;
let view = 0;
const views = ["TOP", "CHASE", "COCKPIT", "SIDE"];

let plane = {
  x: 0, y: 0,
  speed: 180,
  altitude: 1000,
  heading: 0,
  pitch: 0,
  bank: 0
};

let controls = { x: 0, y: 0 };
let joystick = document.getElementById("joystick");
let knob = document.getElementById("knob");
let activeTouch = false;

function moveJoystick(e) {
  const r = joystick.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  const max = r.width * 0.32;
  const len = Math.hypot(dx, dy);
  const scale = len > max ? max / len : 1;
  controls.x = dx * scale / max;
  controls.y = dy * scale / max;
  knob.style.left = `calc(50% + ${dx * scale}px)`;
  knob.style.top = `calc(50% + ${dy * scale}px)`;
}

joystick.addEventListener("pointerdown", e => {
  activeTouch = true;
  joystick.setPointerCapture(e.pointerId);
  moveJoystick(e);
});
joystick.addEventListener("pointermove", e => {
  if (activeTouch) moveJoystick(e);
});
function releaseJoystick() {
  activeTouch = false;
  controls.x = 0;
  controls.y = 0;
  knob.style.left = "50%";
  knob.style.top = "50%";
}
joystick.addEventListener("pointerup", releaseJoystick);
joystick.addEventListener("pointercancel", releaseJoystick);

document.getElementById("view").onclick = () => {
  view = (view + 1) % views.length;
  document.getElementById("view").textContent = "VIEW: " + views[view];
};

document.getElementById("start").onclick = () => {
  started = true;
  document.getElementById("startScreen").classList.add("hidden");
};

let worldSeed = 12345;
function random(n) {
  let x = Math.sin(n * 127.1 + worldSeed) * 43758.5453;
  return x - Math.floor(x);
}

function drawSky(time) {
  const daylight = (Math.sin(time * 0.00004 - 1.2) + 1) / 2;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${8 + daylight*65},${15 + daylight*130},${40 + daylight*190})`);
  g.addColorStop(1, `rgb(${12 + daylight*130},${25 + daylight*155},${55 + daylight*170})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawIsland(x, y, size) {
  ctx.fillStyle = "#153f37";
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#277451";
  ctx.beginPath();
  ctx.ellipse(x - size * .1, y - size * .1, size * .7, size * .4, -.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b5a66a";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.05, size * .72, 0, 0, Math.PI * 2);
  ctx.ellipse(x, y, size * .8, size * .48, 0, 0, Math.PI * 2);
  ctx.fill("evenodd");
}

function drawWorld() {
  ctx.fillStyle = "#17628a";
  ctx.fillRect(0, 0, W, H);

  const scale = 1 + plane.altitude / 4000;
  for (let i = 0; i < 35; i++) {
    const wx = random(i) * W;
    const wy = (random(i + 50) * H + plane.y * .15) % H;
    const size = (25 + random(i + 100) * 65) / scale;
    drawIsland(wx, wy, size);
  }

  ctx.fillStyle = "#ffffff55";
  for (let i = 0; i < 45; i++) {
    const x = random(i + 200) * W;
    const y = random(i + 300) * H;
    ctx.fillRect(x, y, 3, 2);
  }
}

function drawPlane(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(plane.bank * .35);
  ctx.scale(scale, scale);

  // Wings
  ctx.fillStyle = "#bfcbd5";
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-65, 15);
  ctx.lineTo(-58, 25);
  ctx.lineTo(0, 12);
  ctx.lineTo(58, 25);
  ctx.lineTo(65, 15);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  // Tail
  ctx.fillStyle = "#71899b";
  ctx.beginPath();
  ctx.moveTo(-5, 25);
  ctx.lineTo(-24, 43);
  ctx.lineTo(-10, 38);
  ctx.lineTo(0, 31);
  ctx.lineTo(10, 38);
  ctx.lineTo(24, 43);
  ctx.lineTo(5, 25);
  ctx.fill();

  // Fuselage
  ctx.fillStyle = "#e1e8ed";
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.lineTo(9, -12);
  ctx.lineTo(10, 29);
  ctx.lineTo(0, 40);
  ctx.lineTo(-10, 29);
  ctx.lineTo(-9, -12);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = "#173e59";
  ctx.beginPath();
  ctx.ellipse(0, -18, 5, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCockpit() {
  drawSky(performance.now());
  drawWorld();
  ctx.fillStyle = "#101d2b";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W * .18, 0);
  ctx.lineTo(W * .35, H * .68);
  ctx.lineTo(W * .65, H * .68);
  ctx.lineTo(W * .82, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();

  ctx.fillStyle = "#263e50";
  ctx.fillRect(W * .44, H * .73, W * .12, H * .27);
  ctx.fillStyle = "#a9d9ed";
  ctx.fillRect(W * .46, H * .78, W * .08, 4);
}

function drawScene(time) {
  if (view === 2) {
    drawCockpit();
    return;
  }

  drawSky(time);
  drawWorld();

  if (view === 0) {
    drawPlane(W / 2, H / 2, .85);
  } else if (view === 1) {
    drawPlane(W / 2, H * .73, 1.15);
  } else {
    drawPlane(W / 2, H / 2, .8);
    ctx.fillStyle = "#ffffffaa";
    ctx.fillRect(0, H * .78, W, 3);
  }
}

let last = 0;
function update(time) {
  const dt = Math.min((time - last) / 1000 || 0, .05);
  last = time;

  if (started) {
    plane.heading = (plane.heading + controls.x * 45 * dt + 360) % 360;
    plane.bank += (controls.x * .8 - plane.bank) * dt * 3;
    plane.pitch += (-controls.y * .7 - plane.pitch) * dt * 3;
    plane.altitude = Math.max(100, Math.min(12000, plane.altitude - controls.y * 250 * dt));
    plane.speed = Math.max(80, Math.min(600, plane.speed + controls.y * 20 * dt));
    plane.x += Math.sin(plane.heading * Math.PI / 180) * plane.speed * dt;
    plane.y += Math.cos(plane.heading * Math.PI / 180) * plane.speed * dt;
  }

  drawScene(time);

  document.getElementById("speed").textContent = "SPEED: " + Math.round(plane.speed);
  document.getElementById("altitude").textContent = "ALT: " + Math.round(plane.altitude);
  document.getElementById("direction").textContent = "HDG: " + String(Math.round(plane.heading)).padStart(3, "0");

  requestAnimationFrame(update);
}

requestAnimationFrame(update);
                                     
