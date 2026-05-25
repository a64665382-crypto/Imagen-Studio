const apiKey = "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";
async function run() {
  const res = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text_prompts: [{text: "dog"}], steps: 2, seed: 0 })
  });
  console.log(res.status);
}
run();
