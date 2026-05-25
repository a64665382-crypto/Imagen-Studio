import { config } from 'dotenv';
config();
async function run() {
  const formData = new FormData();
  formData.append("prompt", "cat");
  formData.append("model", "qwen-image-edit");
  const rs = await fetch("https://ai.api.nvidia.com/v1/images/edits", { method: 'POST', headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY }, body: formData });
  console.log(rs.status, await rs.text());
}
run();
