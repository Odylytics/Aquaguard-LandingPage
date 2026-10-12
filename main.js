(function () {
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");
  var overlay = document.querySelector(".overlay");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    overlay.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  }

  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  overlay.addEventListener("click", function () { setMenu(false); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 720) setMenu(false); });

  // Hero video: keep still for people who prefer reduced motion
  var heroVideo = document.querySelector(".bg-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  // Scroll reveal
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Active nav link follows the section in view
  var links = document.querySelectorAll(".nav a, .mobile-menu a:not(.sign-in-mobile)");
  var targets = ["top", "solution", "how", "team", "faq"];
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id === "hero" ? "top" : entry.target.id;
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  targets.forEach(function (id) {
    var el = id === "top" ? document.getElementById("hero") : document.getElementById(id);
    if (!el) return;
    spy.observe(el);
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Typing demo: a rescue update is typed line by line while the rescuer "approaches"
  var typed = document.getElementById("typed");
  var status = document.getElementById("typed-status");
  var statusText = document.getElementById("typed-status-text");
  var bar = document.getElementById("typed-bar");
  if (typed && status && !reduced) {
    var messages = [
      { text: "Help request received. A rescue team is on the way.", note: "Request accepted", pct: 15 },
      { text: "Rescuers are coming \u2014 about 5 minutes away.", note: "ETA 5 min", pct: 45 },
      { text: "They\u2019re near you now. Keep your phone close.", note: "Rescuer nearby", pct: 80 },
      { text: "Please stay calm and wait. You\u2019re not alone.", note: "Arriving", pct: 100 }
    ];
    var idx = 0;
    var wait = function (ms, fn) { setTimeout(fn, ms); };

    var type = function (m, i) {
      if (i <= m.text.length) {
        typed.textContent = m.text.slice(0, i);
        wait(28 + Math.random() * 38, function () { type(m, i + 1); });
        return;
      }
      wait(300, function () {
        bar.style.width = m.pct + "%";
        statusText.textContent = "";
        status.classList.add("show", "typing");
        typeNote(m, 0);
      });
    };
    var typeNote = function (m, i) {
      if (i <= m.note.length) {
        statusText.textContent = m.note.slice(0, i);
        wait(45 + Math.random() * 35, function () { typeNote(m, i + 1); });
        return;
      }
      status.classList.remove("typing");
      wait(2200, function () { status.classList.remove("show"); erase(m.text.length); });
    };
    var erase = function (n) {
      if (n >= 0) {
        typed.textContent = typed.textContent.slice(0, n);
        wait(12, function () { erase(n - 2); });
        return;
      }
      idx = (idx + 1) % messages.length;
      if (idx === 0) bar.style.width = "0%";
      wait(280, function () { type(messages[idx], 0); });
    };

    typed.textContent = "";
    status.classList.remove("show");
    bar.style.width = "0%";
    wait(1300, function () { type(messages[0], 0); });
  }

  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Hero parallax: layers drift against the cursor
  var hero = document.getElementById("hero");
  if (hero && canHover && !reduced) {
    window.addEventListener("pointermove", function (e) {
      hero.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      hero.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      document.body.style.setProperty("--px", hero.style.getPropertyValue("--px"));
      document.body.style.setProperty("--py", hero.style.getPropertyValue("--py"));
    }, { passive: true });
  }

  // 3D tilt + glare on cards, steps and phones
  if (canHover && !reduced) {
    document.querySelectorAll(".card, .step, .phone, .member-frame").forEach(function (el) {
      el.classList.add("tilt");
      var max = el.classList.contains("phone") ? 12 : el.classList.contains("member-frame") ? 9 : 7;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.classList.add("tilting");
        el.style.setProperty("--ry", ((x - 0.5) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - y) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  // Interactive 3D dot-floor background: a perspective grid that ripples and lifts toward the cursor
  var cv = document.querySelector(".bg-grid");
  var ctx = cv && cv.getContext("2d");
  if (ctx) {
    var W = 0, H = 0, dpr = 1;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, nx: 0 };
    var COLS = 133, ROWS = 58, SX = 26, Z_NEAR = 70, Z_FAR = 1900;
    var DZ = (Z_FAR - Z_NEAR) / ROWS;
    var PURPLE = [70, 150, 235], TEAL = [90, 205, 215], CORAL = [150, 235, 215];

    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    if (canHover) {
      window.addEventListener("pointermove", function (e) {
        if (mouse.tx === -9999) { mouse.x = e.clientX; mouse.y = e.clientY; }
        mouse.tx = e.clientX; mouse.ty = e.clientY;
        mouse.nx = (e.clientX / W) * 2 - 1;
      }, { passive: true });
      document.addEventListener("pointerleave", function () { mouse.tx = mouse.ty = -9999; });
    }

    var mix = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
    var colorAt = function (u) { return u < 0.5 ? mix(PURPLE, TEAL, u * 2) : mix(TEAL, CORAL, (u - 0.5) * 2); };

    var camX = 0;
    var frame = function (now) {
      var t = now / 1000;
      var p = Math.min(Math.max((window.scrollY - H * 0.35) / (H * 0.55), 0), 1);
      cv.style.opacity = p.toFixed(3);
      if (p > 0) {
        ctx.clearRect(0, 0, W, H);
        if (mouse.tx !== -9999) { mouse.x += (mouse.tx - mouse.x) * 0.07; mouse.y += (mouse.ty - mouse.y) * 0.07; }
        camX += (mouse.nx * 70 - camX) * 0.03;

        var f = Math.max(H, 700) * 0.9;
        var horizon = H * 0.16;
        var camH = 260;
        var off = reduced ? 0 : t * 14 + window.scrollY * 0.2;
        var sigma = 170, hasMouse = mouse.tx !== -9999;

        for (var j = 0; j < ROWS; j++) {
          var z = Z_NEAR + (((j * DZ - off) % (ROWS * DZ)) + ROWS * DZ) % (ROWS * DZ);
          var s = f / z;
          var fade = Math.min(1, (z - Z_NEAR) / 220) * Math.min(1, (Z_FAR - z) / 700);
          if (fade <= 0) continue;
          for (var i = 0; i < COLS; i++) {
            var x = (i - (COLS - 1) / 2) * SX;
            var sx = W / 2 + (x - camX) * s;
            if (sx < -40 || sx > W + 40) continue;
            var wave = reduced ? 0 : (Math.sin(x * 0.004 + t * 0.9) + Math.sin(z * 0.005 - t * 0.7)) * 6;
            var sy0 = horizon + camH * s;
            var boost = 0;
            if (hasMouse) {
              var dx = sx - mouse.x, dy = sy0 - mouse.y;
              boost = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            }
            var ripple = 0;
            if (hasMouse && !reduced) { ripple = Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.045 - t * 3.2) * Math.exp(-Math.sqrt(dx * dx + dy * dy) / 260) * 9; }
            var lift = wave + boost * 26 + ripple;
            var sy = horizon + (camH - lift) * s;
            if (sy < -20 || sy > H + 40) continue;
            var c = colorAt((x / (COLS * SX / 2) + 1) / 2);
            var b = boost * 35;
            var r = Math.min(Math.max(1.15 * s, 0.7), 3.8) * (1 + boost * 0.4);
            var a = Math.min(1, (0.28 + Math.min(s, 3) * 0.09 + boost * 0.28) * fade);
            ctx.fillStyle = "rgba(" + Math.min(255, c[0] + b | 0) + "," + Math.min(255, c[1] + b | 0) + "," + Math.min(255, c[2] + b | 0) + "," + a.toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, 6.2832);
            ctx.fill();
          }
        }
      }
      if (!reduced) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    if (reduced) window.addEventListener("scroll", function () { requestAnimationFrame(frame); }, { passive: true });
  }

  // Flood gauge: scroll = rising water. Marks jump to sections; the life ring can be dragged to scrub the page.
  var gauge = document.querySelector(".gauge");
  if (gauge) {
    var track = gauge.querySelector(".gauge-track");
    var ring = gauge.querySelector(".gauge-ring");
    var depthEl = gauge.querySelector(".gauge-depth");
    var stateEl = gauge.querySelector(".gauge-state");
    var sections = [
      ["impact", "Our impact"], ["problem", "The problem"], ["solution", "The solution"], ["how", "How it works"], ["audience", "Who it’s for"],
      ["partners", "Partnership"], ["trust", "Trust"], ["team", "Team"], ["faq", "FAQ"], ["cta", "Get started"]
    ];
    var marks = [];
    sections.forEach(function (s) {
      var el = document.getElementById(s[0]);
      if (!el) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gauge-mark";
      b.setAttribute("aria-label", "Jump to " + s[1]);
      b.innerHTML = "<span>" + s[1] + "</span>";
      b.addEventListener("click", function () {
        var y = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(y, 0), behavior: reduced ? "auto" : "smooth" });
      });
      gauge.appendChild(b);
      marks.push({ el: el, btn: b });
    });

    var maxScroll = function () { return Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); };
    var placeMarks = function () {
      var max = maxScroll();
      marks.forEach(function (m) {
        var y = m.el.getBoundingClientRect().top + window.scrollY - 70;
        m.pos = Math.min(Math.max(y / max, 0), 1);
        m.btn.style.setProperty("--m", m.pos.toFixed(4));
      });
    };

    var stateFor = function (p) {
      if (p >= 0.975) return ["rescued", "Rescued"];
      if (p >= 0.8) return ["critical", "Critical"];
      if (p >= 0.5) return ["severe", "Severe"];
      if (p >= 0.2) return ["moderate", "Moderate"];
      return ["safe", "Safe"];
    };

    var updateGauge = function () {
      var p = Math.min(Math.max(window.scrollY / maxScroll(), 0), 1);
      var st = stateFor(p);
      gauge.style.setProperty("--p", p.toFixed(4));
      gauge.dataset.state = st[0];
      depthEl.textContent = (p * 4).toFixed(1) + " m";
      stateEl.textContent = st[1];
      ring.setAttribute("aria-valuenow", Math.round(p * 100));
      gauge.classList.toggle("on", window.scrollY > window.innerHeight * 0.4);
      var cur = -1;
      marks.forEach(function (m, i) { m.btn.classList.toggle("past", m.pos <= p + 0.001); if (m.pos <= p + 0.001) cur = i; });
      marks.forEach(function (m, i) { m.btn.classList.toggle("now", i === cur); });
    };

    var scrubTo = function (clientY, smooth) {
      var r = track.getBoundingClientRect();
      var p = 1 - (clientY - r.top) / r.height;
      p = Math.min(Math.max(p, 0), 1);
      window.scrollTo({ top: p * maxScroll(), behavior: smooth && !reduced ? "smooth" : "instant" });
    };

    track.addEventListener("click", function (e) { scrubTo(e.clientY, true); });
    var dragging = false;
    ring.addEventListener("pointerdown", function (e) {
      dragging = true;
      ring.setPointerCapture(e.pointerId);
      gauge.classList.add("dragging");
      e.preventDefault();
    });
    ring.addEventListener("pointermove", function (e) { if (dragging) scrubTo(e.clientY, false); });
    var endDrag = function () { dragging = false; gauge.classList.remove("dragging"); };
    ring.addEventListener("pointerup", endDrag);
    ring.addEventListener("pointercancel", endDrag);
    ring.addEventListener("keydown", function (e) {
      var step = window.innerHeight * 0.6;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") { window.scrollBy({ top: step, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") { window.scrollBy({ top: -step, behavior: "smooth" }); e.preventDefault(); }
    });

    window.addEventListener("scroll", updateGauge, { passive: true });
    window.addEventListener("resize", function () { placeMarks(); updateGauge(); });
    window.addEventListener("load", function () { placeMarks(); updateGauge(); });
    if (window.ResizeObserver) { new ResizeObserver(function () { placeMarks(); updateGauge(); }).observe(document.body); }
    placeMarks();
    updateGauge();
  }

  // Impact numbers count up when scrolled into view
  var nums = document.querySelectorAll(".stat-num");
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 4); };
  var runNum = function (el, delay) {
    var target = parseFloat(el.dataset.target), suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target.toLocaleString("en-US") + suffix; return; }
    setTimeout(function () {
      var start = null, dur = 1900;
      var step = function (now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * easeOut(p)).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  };
  if ("IntersectionObserver" in window) {
    var numIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        numIo.unobserve(entry.target);
        runNum(entry.target, 150 * Array.prototype.indexOf.call(nums, entry.target));
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { numIo.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = Number(n.dataset.target).toLocaleString("en-US") + (n.dataset.suffix || ""); });
  }

  // Build the water inside each impact card (layered waves, glints, bubbles)
  var svgNS = "http://www.w3.org/2000/svg";
  var wavePath = function (amp, phase, closed) {
    var d = "";
    for (var x = 0; x <= 2400; x += 12) {
      var y = 13 + amp * Math.sin((x / 300) * 6.2832 + phase) + amp * 0.35 * Math.sin((x / 150) * 6.2832 + phase * 1.6);
      d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1) + " ";
    }
    return closed ? d + "V30 H0 Z" : d;
  };
  var makeWave = function (cls, amp, phase) {
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "wave-layer " + cls);
    svg.setAttribute("viewBox", "0 0 2400 30");
    svg.setAttribute("preserveAspectRatio", "none");
    var fill = document.createElementNS(svgNS, "path");
    fill.setAttribute("class", "fill");
    fill.setAttribute("d", wavePath(amp, phase, true));
    svg.appendChild(fill);
    if (cls === "wave-front") {
      var crest = document.createElementNS(svgNS, "path");
      crest.setAttribute("class", "crest");
      crest.setAttribute("d", wavePath(amp, phase, false));
      svg.appendChild(crest);
    }
    return svg;
  };
  document.querySelectorAll(".stat").forEach(function (stat, si) {
    var water = document.createElement("div");
    water.className = "water";
    var body = document.createElement("div");
    body.className = "water-body";
    water.appendChild(body);
    water.appendChild(makeWave("wave-back", 5.5, 1.2 + si));
    water.appendChild(makeWave("wave-front", 4.5, si * 0.9));
    for (var b = 0; b < 7; b++) {
      var bub = document.createElement("i");
      bub.className = "bubble";
      var r = function (min, max) { return min + Math.random() * (max - min); };
      bub.style.setProperty("--x", r(8, 90).toFixed(0) + "%");
      bub.style.setProperty("--s", r(4, 9).toFixed(1) + "px");
      bub.style.setProperty("--d", r(4.5, 8).toFixed(1) + "s");
      bub.style.setProperty("--dl", (-r(0, 8)).toFixed(1) + "s");
      bub.style.setProperty("--dx", r(-14, 14).toFixed(0) + "px");
      bub.style.setProperty("--rise", r(70, 130).toFixed(0) + "px");
      water.appendChild(bub);
    }
    stat.insertBefore(water, stat.firstChild);
  });
})();
