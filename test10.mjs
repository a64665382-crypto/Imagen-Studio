import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://integrate.api.nvidia.com/v1/images/generations", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat", model: "stabilityai/sdxl-turbo" }) });
  console.log("SDXL Turbo", rs.status, await rs.text());
}
run();
