const apiKeyT2I = "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";

async function testImages() {
  const url = "https://integrate.api.nvidia.com/v1/images/generations";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKeyT2I}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "stabilityai/stable-diffusion-3.5-large", prompt: "A dog", steps: 25 })
  });
  console.log("Images status:", res.status);
  console.log(await res.text());
}

testImages();
