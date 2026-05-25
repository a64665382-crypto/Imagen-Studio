import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
  console.log("flux1", rs.status, await rs.text());
}
run();
