import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY }
  });
  let data = await rs.json();
  data = data.data || data;
  data.forEach(m => {
    if (m.id.toLowerCase().includes("alibaba") || m.id.toLowerCase().includes("qwen") || m.id.toLowerCase().includes("image")) {
      console.log(m.id);
    }
  });
}
run();
