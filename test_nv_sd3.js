const apiKeyT2I = "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";

async function run() {
  let res = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium", {
    method: "POST", headers: { "Authorization": `Bearer ${apiKeyT2I}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "A dog", aspect_ratio: "16:9" })
  });
  console.log("SD3:", res.status, await res.text().catch(e=>e.message));
}
run();
