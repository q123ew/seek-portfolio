/* ============================================================
   SEEK Portfolio · main.js
   ============================================================ */
(function () {
  "use strict";

  /* iOS / iPadOS can't embed a PDF in <iframe>; mark it so we show an open-in-browser panel */
  var _ua = navigator.userAgent || "", _pf = navigator.platform || "";
  if (/iPad|iPhone|iPod/.test(_ua) || (_pf === "MacIntel" && navigator.maxTouchPoints > 1)) {
    document.documentElement.className += " ios";
  }

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    links.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { links.classList.remove("open"); });
  });

  /* ---------- Marquee: duplicate for seamless loop ---------- */
  var track = document.getElementById("marqueeTrack");
  track.innerHTML += track.innerHTML;

  /* ---------- Scroll reveal (fail-safe) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function revealCheck() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh + 40) el.classList.add("in"); /* visible now, or already scrolled past */
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px 5% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { revealCheck(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", revealCheck);
  window.addEventListener("pageshow", revealCheck);
  setTimeout(revealCheck, 300);
  setTimeout(revealCheck, 1400);

  /* ============================================================
     RADAR CHART (hand-built SVG)
     ============================================================ */
  var radar = document.getElementById("radar");
  if (radar) {
    var CX = 210, CY = 210, R = 148, N = 6;
    var labels = [
      "选区·路径·蒙版", "图层·源文件工程", "多尺寸·多画板",
      "品牌规范·一致性", "色彩·输出管理", "任务拆解·评分"
    ];
    var values = [4.8, 4.7, 4.9, 4.8, 4.6, 4.5];
    var NS = "http://www.w3.org/2000/svg";
    var levels = 5;

    function angle(i) { return (-90 + i * (360 / N)) * Math.PI / 180; }
    function pt(i, r) {
      return [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))];
    }
    function ptsFor(scale) {
      return values.map(function (v, i) {
        var p = pt(i, R * (v / 5) * scale);
        return p[0].toFixed(1) + "," + p[1].toFixed(1);
      }).join(" ");
    }
    function el(name, attrs) {
      var e = document.createElementNS(NS, name);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    // grid polygons
    for (var g = levels; g >= 1; g--) {
      var rr = R * g / levels;
      var coords = [];
      for (var i = 0; i < N; i++) { var p = pt(i, rr); coords.push(p[0].toFixed(1) + "," + p[1].toFixed(1)); }
      radar.appendChild(el("polygon", {
        points: coords.join(" "),
        fill: g === levels ? "#f4f8f6" : "none",
        stroke: "#dbe5df", "stroke-width": 1
      }));
    }
    // axes
    for (var a = 0; a < N; a++) {
      var p2 = pt(a, R);
      radar.appendChild(el("line", {
        x1: CX, y1: CY, x2: p2[0].toFixed(1), y2: p2[1].toFixed(1),
        stroke: "#dbe5df", "stroke-width": 1
      }));
    }
    // data polygon
    var dataPoly = el("polygon", {
      points: ptsFor(0),
      fill: "rgba(0,170,113,.20)", stroke: "#00aa71", "stroke-width": 2.4,
      "stroke-linejoin": "round"
    });
    radar.appendChild(dataPoly);
    // vertex dots
    var dots = [];
    for (var d = 0; d < N; d++) {
      var dot = el("circle", { r: 4.2, fill: "#0a5c43", stroke: "#fff", "stroke-width": 1.6, cx: CX, cy: CY });
      radar.appendChild(dot); dots.push(dot);
    }
    // labels
    for (var l = 0; l < N; l++) {
      var lp = pt(l, R + 30);
      var t = el("text", {
        x: lp[0].toFixed(1), y: lp[1].toFixed(1),
        "text-anchor": "middle", "dominant-baseline": "middle",
        "font-size": 12.5, fill: "#38443d", "font-family": "inherit"
      });
      t.textContent = labels[l];
      radar.appendChild(t);
    }

    function placeDots(scale) {
      dots.forEach(function (dot, i) {
        var p = pt(i, R * (values[i] / 5) * scale);
        dot.setAttribute("cx", p[0].toFixed(1));
        dot.setAttribute("cy", p[1].toFixed(1));
      });
    }
    // animate when visible
    var started = false;
    function startRadar() {
      if (started) return; started = true;
      var t0 = null, DUR = 900;
      function frame(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        var ease = 1 - Math.pow(1 - p, 3);
        dataPoly.setAttribute("points", ptsFor(ease));
        placeDots(ease);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    var radarIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) startRadar(); });
    }, { threshold: 0.4 });
    radarIO.observe(radar);
  }

  /* ============================================================
     DECONSTRUCTION hotspots
     ============================================================ */
  var hotspots = document.querySelectorAll(".hotspot");
  var dcItems = document.querySelectorAll(".dc-item");
  function setActive(i) {
    hotspots.forEach(function (h) { h.classList.toggle("active", h.dataset.i === String(i)); });
    dcItems.forEach(function (d) { d.classList.toggle("active", d.dataset.i === String(i)); });
  }
  hotspots.forEach(function (h) {
    h.addEventListener("click", function () { setActive(h.dataset.i); });
  });
  dcItems.forEach(function (d) {
    d.addEventListener("click", function () {
      setActive(d.dataset.i);
      if (window.innerWidth <= 1024) {
        document.querySelector(".decon-stage").scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
  if (hotspots.length) setActive(2); // start on "free design zone"

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCaption");
  var lbCounter = document.getElementById("lbCounter");
  var list = [];
  var current = 0;

  function capText(shot) {
    var cap = shot.querySelector("figcaption");
    return cap ? cap.textContent.trim() : "";
  }
  function render(i) {
    current = (i + list.length) % list.length;
    var s = list[current];
    var img = s.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = capText(s);
    lbCounter.textContent = (current + 1) + " / " + list.length;
  }
  function openFrom(shot) {
    var container = shot.closest(".gallery,.pdf-grid") || document;
    list = Array.prototype.slice.call(container.querySelectorAll(".shot"));
    current = list.indexOf(shot);
    if (current < 0) current = 0;
    render(current);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  Array.prototype.slice.call(document.querySelectorAll(".shot")).forEach(function (s) {
    s.addEventListener("click", function () { openFrom(s); });
  });
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); render(current - 1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); render(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  /* touch swipe (mobile) */
  var startX = null, startY = null;
  lb.addEventListener("touchstart", function (e) {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      render(current + (dx < 0 ? 1 : -1));
    }
    startX = null; startY = null;
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") render(current - 1);
    if (e.key === "ArrowRight") render(current + 1);
  });

})();
