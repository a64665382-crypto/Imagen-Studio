const apiKey = "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";

const urls = [
  "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-5-large",
  "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large",
  "https://ai.api.nvidia.com/v1/genai/alibaba/qwen-image-edit",
  "https://ai.api.nvidia.com/v1/images/generations",
  "https://integrate.api.nvidia.com/v1/images/generations",
  "https://integrate.api.nvidia.com/v1/images/edits"
];

async function test() {
  for (const url of urls) {
    const res = await fetch(url, { method: "POST", headers: {"Authorization": "Bearer " + apiKey, "Content-Type": "application/json"}, body: "{}"});
    console.log(url, res.status);
    if(res.status !== 404) {
      console.log(await res.text());
    }
  }
}
test();
