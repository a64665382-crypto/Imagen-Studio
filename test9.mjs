import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
  console.log("SD3", rs.status);

  const rs2 = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
  console.log("SDXL Turbo", rs2.status);
}
run();
