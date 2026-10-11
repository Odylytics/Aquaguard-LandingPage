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
    var PURPLE = [150, 118, 240], TEAL = [109, 196, 199], CORAL = [236, 112, 138];

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
            var lift = wave + boost * 50;
            var sy = horizon + (camH - lift) * s;
            if (sy < -20 || sy > H + 40) continue;
            var c = colorAt((x / (COLS * SX / 2) + 1) / 2);
            var b = boost * 70;
            var r = Math.min(Math.max(1.15 * s, 0.7), 3.8) * (1 + boost * 0.7);
            var a = Math.min(1, (0.28 + Math.min(s, 3) * 0.09 + boost * 0.5) * fade);
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
})();
