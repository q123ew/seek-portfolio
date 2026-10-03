/* ============================================================
   METHOD IN ACTION · interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- A · skin swap ---------- */
  var stage = document.getElementById("skinStage");
  var skinImgs = stage ? stage.querySelectorAll(".skin-img") : [];
  var skinTabs = document.querySelectorAll("#skinTabs .skin-tab");
  function setSkin(i) {
    skinImgs.forEach(function (im) { im.classList.toggle("active", im.dataset.skin === String(i)); });
    skinTabs.forEach(function (t) { t.classList.toggle("active", t.dataset.skin === String(i)); });
  }
  skinTabs.forEach(function (t) { t.addEventListener("click", function () { setSkin(t.dataset.skin); }); });

  /* lock layer toggle */
  var lockToggle = document.getElementById("lockToggle");
  if (lockToggle && stage) {
    lockToggle.addEventListener("click", function () {
      var on = stage.classList.toggle("show-locks");
      lockToggle.textContent = on ? "隐藏锁定层" : "显示锁定层";
    });
  }

  /* ---------- B · version stepper ---------- */
  var verImgs = document.querySelectorAll(".ver-img");
  var verSteps = document.querySelectorAll("#verStepper .ver-step");
  var verNotes = document.querySelectorAll(".ver-note");
  function setVer(i) {
    verImgs.forEach(function (im) { im.classList.toggle("active", im.dataset.ver === String(i)); });
    verSteps.forEach(function (s) { s.classList.toggle("active", s.dataset.ver === String(i)); });
    verNotes.forEach(function (n) { n.classList.toggle("active", n.dataset.ver === String(i)); });
  }
  verSteps.forEach(function (s) { s.addEventListener("click", function () { setVer(s.dataset.ver); }); });
})();
