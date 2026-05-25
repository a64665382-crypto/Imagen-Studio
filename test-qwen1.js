async function run() {
  const rs = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.NVIDIA_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "alibaba/qwen-image-edit",
      prompt: "a cat"
    })
  });
  const data = await rs.text();
  console.log("Response for integrate.api: ", rs.status, data);
}
run();
