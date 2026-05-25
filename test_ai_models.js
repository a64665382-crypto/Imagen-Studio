async function run() {
  const url = "https://ai.api.nvidia.com/v1/models";
  const res = await fetch(url, {
    method: "GET",
    headers: { "Authorization": `Bearer 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`, "Content-Type": "application/json" }
  });
  console.log("ai.api models status:", res.status);
  console.log(await res.text());
}
run();
