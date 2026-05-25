import { config } from 'dotenv';
config();
async function run() {
  const rs = await fetch("https://integrate.api.nvidia.com/v1/models", { headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY }});
  const data = await rs.json();
  const alibabaModels = data.data.filter(m => m.id.includes("alibaba"));
  console.log("Alibaba models: ", alibabaModels.map(m=>m.id));
}
run();
