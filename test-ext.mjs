import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://ai.api.nvidia.com/v1/genai/alibaba/qwen-image-edit", { 
    method: 'POST', 
    headers: { 
      Authorization: "Bearer " + process.env.NVIDIA_API_KEY, 
      "Content-type": "application/json" 
    }, 
    body: JSON.stringify({ prompt: "make it blue", image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" }) 
  });
  console.log("qwen", rs.status, await rs.text());
}
run();
