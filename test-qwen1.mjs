import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://ai.api.nvidia.com/v1/genai/alibaba/qwen-image-edit", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "a cat" })
  });
  console.log("Response for ai.api genai: ", rs.status, await rs.text());
}
run();
