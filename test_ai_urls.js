const urls = [
  "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-5-large",
  "https://ai.api.nvidia.com/v1/genai/stabilityai/sd3.5-large",
  "https://ai.api.nvidia.com/v1/genai/stabilityai/sd3-large",
  "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl",
  "https://ai.api.nvidia.com/v1/genai/nvidia/stable-diffusion-3.5-large",
  "https://api.nvcf.nvidia.com/v2/nvcf/pexec/models/stable-diffusion-3.5-large",
  "https://api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large",
  "https://ai.api.nvidia.com/v1/genai/stability/stable-diffusion-3.5-large",
];

async function run() {
  for (const url of urls) {
    const res = await fetch(url, {
      method: "POST", headers: { "Authorization": `Bearer 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`, "Content-Type": "application/json" },
      body: "{}"
    });
    console.log(url, res.status);
  }
}
run();
