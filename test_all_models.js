const apiKeyT2I = "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";

async function run() {
  const url = "https://integrate.api.nvidia.com/v1/models";
  const res = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${apiKeyT2I}`, "Content-Type": "application/json" }
  });
  const data = await res.json();
  const models = data.data.map(x => x.id);
  console.log("ALL MODELS:", models.join("\n"));
}
run();
