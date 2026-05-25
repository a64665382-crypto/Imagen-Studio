import { config } from 'dotenv';
config();
async function run() {
  const models = ["alibaba/qwen-image-edit", "qwen-image-edit", "Qwen-Image-Edit"];
  for (const model of models) {
    const rs = await fetch("https://ai.api.nvidia.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: "a cat" })
    });
    console.log("Response for ai.api model ", model, ":", rs.status, await rs.text());
  }
}
run();
