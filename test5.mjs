import { config } from 'dotenv';
config();
async function run() {
  const urls = [
    "https://api.nvidia.com/v1/images/generations",
    "https://integrate.api.nvidia.com/v1/images",
    "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/alibaba/qwen2-vl-72b-instruct",
    "https://ai.api.nvidia.com/v1/cv/image-edits",
  ];
  for (const url of urls) {
    try {
      const rs = await fetch(url, { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-type": "application/json" }, body: JSON.stringify({ prompt: "cat" }) });
      console.log(url, rs.status, await rs.text());
    } catch (e) {
      console.log(url, e.message);
    }
  }
}
run();
