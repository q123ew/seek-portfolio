/* ============ GATE: password protection for sensitive projects ============ */
(function () {
  "use strict";

  /* —— 解锁密码：如需修改，改这一行即可 —— */
  var PASSWORD = "seek2026";
  var STORAGE_KEY = "seek_portfolio_unlocked";

  var body = document.body;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- source swapping ---------- */
  function revealClear() {
    each(document.querySelectorAll("img.gated-img"), function (im) {
      var full = im.getAttribute("data-full");
      if (full && im.getAttribute("src") !== full) im.src = full;
    });
    var frame = document.querySelector(".pdf-frame[data-src]");
    if (frame && !frame.getAttribute("src")) frame.src = frame.getAttribute("data-src");
    each(document.querySelectorAll("[data-href]"), function (a) {
      if (!a.getAttribute("href")) a.setAttribute("href", a.getAttribute("data-href"));
    });
  }

  function restoreBlur() {
    each(document.querySelectorAll("img.gated-img"), function (im) {
      var blur = im.getAttribute("data-blur");
      if (blur) im.src = blur;
    });
    var frame = document.querySelector(".pdf-frame");
    if (frame) frame.removeAttribute("src");
    each(document.querySelectorAll("[data-href]"), function (a) {
      a.removeAttribute("href");
    });
  }

  /* ---------- lock / unlock ---------- */
  function unlock() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    body.classList.add("unlocked");
    revealClear();
    updateNavBtn();
  }
  function lock() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    body.classList.remove("unlocked");
    restoreBlur();
    updateNavBtn();
  }
  function isUnlocked() {
    try { return sessionStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
  }

  /* ---------- nav button ---------- */
  function updateNavBtn() {
    var btn = document.getElementById("navUnlock");
    if (!btn) return;
    btn.textContent = body.classList.contains("unlocked") ? "锁定敏感内容" : "解锁完整内容";
  }

  /* ---------- modal ---------- */
  var modal = document.getElementById("gateModal");
  var input = document.getElementById("gmInput");
  var err = document.getElementById("gmErr");

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    if (input) { input.value = ""; setTimeout(function(){ input.focus(); }, 30); }
    if (err) err.textContent = "";
  }
  function closeModal() { if (modal) modal.classList.remove("open"); }
  function submit() {
    var v = input ? input.value : "";
    if (v === PASSWORD) {
      closeModal();
      unlock();
    } else {
      if (err) err.textContent = "密码不正确，请重新输入";
      if (input) input.select();
    }
  }

  /* ---------- events ---------- */
  each(document.querySelectorAll(".gate-overlay"), function (o) {
    o.addEventListener("click", openModal);
    o.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(); }
    });
  });

  var navBtn = document.getElementById("navUnlock");
  if (navBtn) navBtn.addEventListener("click", function () {
    if (body.classList.contains("unlocked")) lock(); else openModal();
  });

  var okBtn = document.getElementById("gmOk");
  if (okBtn) okBtn.addEventListener("click", submit);
  var cancelBtn = document.getElementById("gmCancel");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  /* ---------- init ---------- */
  if (isUnlocked()) {
    body.classList.add("unlocked");
    revealClear();
  }
  updateNavBtn();
})();
