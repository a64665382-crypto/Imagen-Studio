import { config } from 'dotenv';
config();
async function run() {
  const models = [
    "https://ai.api.nvidia.com/v1/genai/alibaba/qwen-vl-chat",
    "https://ai.api.nvidia.com/v1/genai/alibaba/qwen-vl",
    "https://api.nvidia.com/v1/genai/alibaba/qwen-image-edit",
    "https://integrate.api.nvidia.com/v1/genai/alibaba/qwen-image-edit",
    "https://integrate.api.nvidia.com/v1/alibaba/qwen-image-edit",
    "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/c8969b6a-93f9-4bdf-b620-8b17baf6c12b" // a random function id?
  ];
  for (const url of models) {
    const rs = await fetch(url, { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
    console.log(url, rs.status);
  }
}
run();
