const apiKey = "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";
[
  "https://ai.api.nvidia.com/v1/genai/stable-diffusion-3.5-large",
  "https://ai.api.nvidia.com/v1/genai/stability-ai/stable-diffusion-3.5-large",
  "https://integrate.api.nvidia.com/v1/images/generations/stable-diffusion-3.5-large"
].forEach(async url => {
  const res = await fetch(url, { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: "{}"});
  console.log(url, res.status);
})
