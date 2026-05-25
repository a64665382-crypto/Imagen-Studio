async function run() {
  const url = `https://api.github.com/search/code?q="qwen-image-edit"+"nvidia"`;
  const rs = await fetch(url, {
    headers: {
      "User-Agent": "NodeJS",
      "Accept": "application/vnd.github.v3.text-match+json"
    }
  });
  const data = await rs.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
