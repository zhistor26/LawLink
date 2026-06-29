import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";

const size = 256;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext("2d");

// 深色背景 + 金色天平意象
ctx.fillStyle = "#0b1220";
ctx.fillRect(0, 0, size, size);

const grad = ctx.createLinearGradient(0, 0, size, size);
grad.addColorStop(0, "#3b82f6");
grad.addColorStop(1, "#1d4ed8");
ctx.fillStyle = grad;
ctx.beginPath();
ctx.roundRect(24, 24, 208, 208, 40);
ctx.fill();

ctx.fillStyle = "#f8fafc";
ctx.font = "bold 96px system-ui, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("L", size / 2, size / 2 + 6);

writeFileSync(new URL("../icon.png", import.meta.url), canvas.toBuffer("image/png"));
console.log("icon.png generated");
