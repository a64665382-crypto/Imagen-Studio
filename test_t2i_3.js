const apiKey = "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";
async function run() {
  const models = await fetch("https://integrate.api.nvidia.com/v1/models", { headers: { "Authorization": `Bearer ${apiKey}` } }).then(r=>r.json());
  console.log(models.data.map(x=>x.id).filter(id => id.toLowerCase().includes("vision") || id.toLowerCase().includes("image") || id.toLowerCase().includes("vl") || id.toLowerCase().includes("diff")));
}
run();
