import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
  console.log("flux2", rs.status, await rs.text());
}
run();
