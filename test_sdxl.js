const apiKey = "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";
async function run() {
  const res = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text_prompts: [{text: "dog"}], steps: 2, seed: 0 })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
