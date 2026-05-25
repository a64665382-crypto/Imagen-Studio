const apiKey = "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";

async function run() {
  const url = "https://integrate.api.nvidia.com/v1/models";
  const res = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
  });
  const data = await res.json();
  const models = data.data.map(x => x.id);
  console.log("QWEN API MODELS:", models.find(m => m.includes("qwen")));
}
run();
