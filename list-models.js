async function run() {
  const rs = await fetch("http://localhost:3000/api/models");
  const text = await rs.text();
  console.log(text);
}
run();
