const apiKeyT2I = "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";

async function getModels() {
  const url = "https://integrate.api.nvidia.com/v1/models";
  const res = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer ${apiKeyT2I}`, "Content-Type": "application/json" }
  });
  console.log("Models status:", res.status);
  const data = await res.json();
  console.log("Models found:", data.data.slice(0, 10).map(x => x.id).join(", "));
  console.log("Has SD3.5:", data.data.find(x => x.id.includes("3.5") || x.id.includes("stable")));
  console.log("Has qwen:", data.data.find(x => x.id.includes("qwen")));
}

getModels();
