function normalizeAnswer(s) {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFKC");
}

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, "0")).join("");
}

function setResult(type, msg){
  const el = document.querySelector("#result");
  el.className = "result" + (type ? ` ${type}` : "");
  el.textContent = msg;
}

window.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".wrap");
  const salt = root.dataset.salt;
  const answerHashRaw = root.dataset.answerHash;

  // 複数正解（カンマ区切り）にも対応
  const answerHashes = answerHashRaw.split(",").map(s => s.trim()).filter(Boolean);

  document.querySelector("#problemTitle").textContent = root.dataset.problem;

  const input = document.querySelector("#answer");
  const btn = document.querySelector("#check");

  // 入力が変わったら「未判定」に戻す（分かりやすさ優先）
  input.addEventListener("input", () => {
    setResult("", "ここに結果が出ます");
  });

  async function checkAnswer() {
    const normalized = normalizeAnswer(input.value);
    const digest = await sha256Hex(`${salt}::${normalized}`);
    const isCorrect = answerHashes.includes(digest);
  
    setResult(isCorrect ? "ok" : "ng", isCorrect ? "正解" : "不正解");
  }

  // 判定はボタン押下のみ
  btn.addEventListener("click", checkAnswer);
});