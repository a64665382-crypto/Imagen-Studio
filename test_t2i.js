const apiKey = "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";

async function run() {
  const models = await fetch("https://integrate.api.nvidia.com/v1/models", { headers: { "Authorization": `Bearer ${apiKey}` } }).then(r=>r.json());
  console.log(models);
}
run();
