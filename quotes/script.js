(function () {
  "use strict";

  var SERVICES = [
    { id: "renovation", name: "Renovation", icon: "🏠", hint: "Kitchen, rooms, full homes" },
    { id: "bathroom", name: "Bathroom", icon: "🛁", hint: "Wet rooms & tiling" },
    { id: "painting", name: "Painting", icon: "🎨", hint: "Interior & exterior" },
    { id: "carpentry", name: "Carpentry", icon: "🪚", hint: "Joinery & extensions" },
    { id: "roofing", name: "Roofing", icon: "🏚️", hint: "New roofs & repairs" },
    { id: "electrical", name: "Electrician", icon: "💡", hint: "Wiring & installations" },
    { id: "plumbing", name: "Plumbing", icon: "🔧", hint: "Pipes, drains & heating" },
    { id: "flooring", name: "Flooring", icon: "🪵", hint: "Laying & sanding" },
    { id: "groundwork", name: "Groundwork", icon: "🚜", hint: "Excavation & drainage" },
    { id: "garden", name: "Garden", icon: "🌳", hint: "Landscaping & paving" },
    { id: "moving", name: "Moving", icon: "📦", hint: "Removals & storage" },
    { id: "cleaning", name: "Cleaning", icon: "🧽", hint: "Move-out & regular" }
  ];

  var REVIEWS = [
    { name: "Anna L.", place: "Stockholm", job: "Bathroom renovation", stars: 5, text: "Got four quotes within a day. The company we picked was professional, on time and €1,200 cheaper than the first quote we'd had." },
    { name: "Johan K.", place: "Gothenburg", job: "Exterior painting", stars: 5, text: "So much easier than calling around. I could compare prices and reviews side by side and the result is fantastic." },
    { name: "Sara M.", place: "Malmö", job: "Moving", stars: 4, text: "Quick and simple. Three moving companies got in touch the same evening and the move went smoothly." }
  ];

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Render content ---------- */

  $("#service-grid").innerHTML = SERVICES.map(function (s) {
    return '<button type="button" class="service-card reveal" data-service="' + s.id + '">' +
      '<span class="service-icon" aria-hidden="true">' + s.icon + "</span>" +
      s.name + "<small>" + s.hint + "</small></button>";
  }).join("");

  $("#choice-grid").innerHTML = SERVICES.map(function (s) {
    return '<label class="choice"><input type="radio" name="category" value="' + s.id + '" required>' +
      '<span><i aria-hidden="true">' + s.icon + "</i>" + s.name + "</span></label>";
  }).join("");

  $("#service-list").innerHTML = SERVICES.map(function (s) {
    return '<option value="' + s.name + '">';
  }).join("");

  $("#footer-services").innerHTML = SERVICES.slice(0, 6).map(function (s) {
    return '<li><a href="#services" data-service="' + s.id + '">' + s.name + "</a></li>";
  }).join("");

  $("#reviews-track").innerHTML = REVIEWS.map(function (r) {
    var initials = r.name.split(" ").map(function (p) { return p[0]; }).join("");
    return '<article class="review reveal">' +
      '<span class="stars" aria-label="' + r.stars + ' out of 5 stars">' + "★★★★★".slice(0, r.stars) + "☆☆☆☆☆".slice(0, 5 - r.stars) + "</span>" +
      "<blockquote>“" + escapeHtml(r.text) + "”</blockquote>" +
      '<div class="review-meta"><div class="hc-avatar" style="--c:#0b6e4f">' + initials + "</div>" +
      "<div><strong>" + escapeHtml(r.name) + ", " + escapeHtml(r.place) + "</strong><span>" + escapeHtml(r.job) + "</span></div></div>" +
      "</article>";
  }).join("");

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header ---------- */

  var header = $(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navToggle = $(".nav-toggle");
  var nav = $("#main-nav");
  function setNav(open) {
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  navToggle.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });

  /* ---------- Quote wizard ---------- */

  var modal = $("#quote-modal");
  var form = $("#quote-form");
  var steps = $$(".step", form);
  var btnBack = $("#btn-back");
  var btnNext = $("#btn-next");
  var current = 1;
  var lastFocus = null;
  var TOTAL = 3;

  function serviceById(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }

  function findService(text) {
    var q = text.trim().toLowerCase();
    if (!q) return null;
    for (var i = 0; i < SERVICES.length; i++) {
      var s = SERVICES[i];
      if (s.name.toLowerCase().indexOf(q) !== -1 || q.indexOf(s.name.toLowerCase()) !== -1 ||
          s.hint.toLowerCase().indexOf(q) !== -1) return s;
    }
    return null;
  }

  function showStep(n) {
    current = n;
    steps.forEach(function (el) { el.hidden = Number(el.dataset.step) !== n; });
    var done = n > TOTAL;
    $("#wizard-nav").hidden = done;
    $(".wizard-progress").style.visibility = done ? "hidden" : "visible";
    btnBack.style.visibility = n === 1 ? "hidden" : "visible";
    btnNext.textContent = n === TOTAL ? "Send request" : "Continue";
    $("#wp-fill").style.width = Math.min(n / TOTAL, 1) * 100 + "%";
    $("#wp-label").textContent = "Step " + Math.min(n, TOTAL) + " of " + TOTAL;

    if (n === 2) {
      var cat = form.elements.category.value;
      var s = serviceById(cat);
      $("#step2-sub").textContent = s ? "Category: " + s.name : "";
    }

    var target = done ? $(".step-done .btn", form) : $('[data-step="' + n + '"] input, [data-step="' + n + '"] textarea', form);
    if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 30);
  }

  function openQuote(serviceId) {
    lastFocus = document.activeElement;
    if (current > TOTAL) resetForm();
    if (serviceId) {
      var radio = $('input[name="category"][value="' + serviceId + '"]', form);
      if (radio) radio.checked = true;
    }
    modal.hidden = false;
    document.body.classList.add("modal-open");
    showStep(serviceId ? 2 : 1);
  }

  function closeQuote() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function resetForm() {
    form.reset();
    clearErrors();
    current = 1;
  }

  function clearErrors() {
    $$(".field-error", form).forEach(function (e) { e.textContent = ""; });
    $$(".invalid", form).forEach(function (e) { e.classList.remove("invalid"); });
  }

  var MESSAGES = {
    category: "Please choose a category.",
    description: "Please describe the job in at least 20 characters.",
    postcode: "Please enter a valid postcode.",
    property: "Please choose a property type.",
    when: "Please choose when the work should start.",
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    consent: "You need to accept to send your request."
  };

  function validateStep(n) {
    clearErrors();
    var fieldset = $('[data-step="' + n + '"]', form);
    var fields = $$("input, select, textarea", fieldset);
    var seen = {};
    var firstBad = null;

    fields.forEach(function (f) {
      if (seen[f.name]) return;
      var ok;
      if (f.type === "radio") {
        seen[f.name] = true;
        ok = !!form.elements[f.name].value;
      } else {
        ok = f.checkValidity() && (f.type === "checkbox" || f.value.trim() !== "");
        if (f.minLength > 0 && f.value.trim().length < f.minLength) ok = false;
      }
      if (!ok) {
        if (f.type !== "radio" && f.type !== "checkbox") f.classList.add("invalid");
        var err = $('[data-error="' + f.name + '"]', form);
        if (err) err.textContent = MESSAGES[f.name] || "This field is required.";
        if (!firstBad) firstBad = f;
      }
    });

    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function submitRequest() {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.submittedAt = new Date().toISOString();

    // No backend yet: keep a local copy so the flow can be demoed.
    // Replace this with a fetch() to your form endpoint (e.g. Formspree, Netlify Forms, your own API).
    try {
      var saved = JSON.parse(localStorage.getItem("modoQuoteRequests") || "[]");
      saved.push(data);
      localStorage.setItem("modoQuoteRequests", JSON.stringify(saved));
    } catch (e) { /* storage unavailable — ignore */ }

    var s = serviceById(data.category);
    $("#done-text").textContent = "We've sent your " + (s ? s.name.toLowerCase() : "") +
      " request to companies near " + data.postcode + ". Quotes will arrive at " + data.email + ".";
    showStep(TOTAL + 1);
  }

  btnNext.addEventListener("click", function () {
    if (!validateStep(current)) return;
    if (current < TOTAL) showStep(current + 1);
    else submitRequest();
  });
  btnBack.addEventListener("click", function () { if (current > 1) showStep(current - 1); });

  // Picking a category advances automatically
  form.addEventListener("change", function (e) {
    if (e.target.name === "category" && current === 1) setTimeout(function () { showStep(2); }, 150);
  });

  // Clear a field's error as soon as the user fixes it
  form.addEventListener("input", function (e) {
    var f = e.target;
    if (!f.name) return;
    f.classList.remove("invalid");
    var err = $('[data-error="' + f.name + '"]', form);
    if (err) err.textContent = "";
  });

  // Enter key moves forward (except in textarea)
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      btnNext.click();
    }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeQuote); });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") closeQuote();
    if (e.key === "Tab") {
      var focusable = $$('button, [href], input:not([type="radio"]), input[type="radio"]:checked, select, textarea', modal)
        .filter(function (el) { return el.offsetParent !== null && !el.disabled && getComputedStyle(el).visibility !== "hidden"; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  $$("[data-open-quote]").forEach(function (b) { b.addEventListener("click", function () { openQuote(); }); });
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-service]");
    if (el) { e.preventDefault(); openQuote(el.dataset.service); }
  });

  $("#hero-search").addEventListener("submit", function (e) {
    e.preventDefault();
    var s = findService($("#hero-input").value);
    openQuote(s ? s.id : null);
  });

  /* ---------- Company sign-up ---------- */

  var companyForm = $("#company-form");
  companyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $(".form-msg", companyForm);
    var bad = $$("input", companyForm).filter(function (i) {
      var ok = i.checkValidity() && i.value.trim() !== "";
      i.classList.toggle("invalid", !ok);
      return !ok;
    });
    if (bad.length) {
      msg.textContent = "Please fill in all fields correctly.";
      msg.classList.add("error");
      bad[0].focus();
      return;
    }
    msg.classList.remove("error");
    msg.textContent = "Thanks! We'll contact you within one working day.";
    companyForm.reset();
  });

  /* ---------- Animated counters ---------- */

  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = Number(el.dataset.decimals || 0);
    var suffix = el.dataset.suffix || "";
    var start = null;
    var duration = 1400;
    function fmt(v) {
      return (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US")) + suffix;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(target); return; }
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll ---------- */

  $$(".steps li, .mini-card, .section-head").forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.count) animateCount(el);
        else el.classList.add("visible");
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    $$(".reveal, [data-count]").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("visible"); });
    $$("[data-count]").forEach(animateCount);
  }
})();
