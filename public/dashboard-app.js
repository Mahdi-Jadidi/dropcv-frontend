(function () {
  "use strict";
  var state = {
    user: null,
    language: localStorage.getItem("dropcv_language") || "fa",
    upload: null,
  };
  var icons = {
    home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    site: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    analytics:
      '<svg viewBox="0 0 24 24"><path d="M4 20V10m6 10V4m6 16v-7m5 7H2"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1m3 6a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.8.9-1.9L15 4l-1.9.9L11.3 4h-3l-.7 2-1.8.8-1.9-.9L2 8l.9 1.9L2 11.7v3l2 .7.8 1.8-.9 1.9L6 21l1.9-.9 1.8.9h3l.7-2 1.8-.8 1.9.9L21 17l-.9-1.9z"/></svg>',
    billing:
      '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',
  };
  function text(fa, en) {
    return state.language === "en" ? en : fa;
  }
  function escape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
  function userName() {
    var p = (state.user && state.user.profile) || {};
    return (
      p.fullName || p.full_name || state.user.firstName || state.user.email
    );
  }
  function publicUrl() {
    return (state.user && state.user.publicUrl) || "";
  }
  function setLanguage(lang) {
    state.language = lang === "en" ? "en" : "fa";
    localStorage.setItem("dropcv_language", state.language);
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-fa][data-en]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + state.language);
    });
    document.getElementById("language").textContent =
      state.language === "fa" ? "EN" : "فا";
    renderUser();
    renderSite();
    renderAnalytics();
  }
  function show(section) {
    document.querySelectorAll(".page").forEach(function (el) {
      el.classList.toggle("active", el.id === "section-" + section);
    });
    document.querySelectorAll(".nav[data-section]").forEach(function (el) {
      el.classList.toggle("active", el.dataset.section === section);
    });
    var active = document.querySelector(
      '.nav[data-section="' + section + '"] b',
    );
    document.getElementById("page-title").textContent = active
      ? active.textContent
      : "";
    document.getElementById("sidebar").classList.remove("open");
    history.replaceState(null, "", "#" + section);
    if (section === "analytics") renderAnalytics();
  }
  function renderUser() {
    if (!state.user) return;
    var name = userName();
    document.getElementById("account-name").textContent = name;
    document.getElementById("account-plan").textContent = text("سالانه", "Annual");
    document.getElementById("plan-pill").textContent = text("سالانه", "Annual");
    document.getElementById("avatar").textContent = (name || "?")
      .trim()
      .slice(0, 1)
      .toUpperCase();
    document.getElementById("welcome").textContent =
      text("خوش آمدید، ", "Welcome, ") + (state.user.firstName || name);
    var sub = state.user.subscription || {};
    document.getElementById("trial-card").textContent =
      sub.status === "trial"
        ? text(
            "از دوره آزمایشی سه‌روزه شما " +
              (sub.daysLeft || 0) +
              " روز باقی مانده است.",
            "Your three-day trial has " + (sub.daysLeft || 0) + " day(s) left.",
          )
        : text("وضعیت اشتراک: ", "Subscription: ") + (sub.status || "—");
    document.getElementById("premium-upgrade").hidden = true;
    document.getElementById("premium-brief").hidden = true;
    var form = document.getElementById("settings-form");
    form.fullName.value = name || "";
    form.email.value = state.user.email || "";
    form.language.value = state.language;
  }
  function renderSite() {
    if (!state.user) return;
    var dep = state.user.latestDeployment || {};
    var live = dep.status === "live" && publicUrl();
    var card = document.getElementById("site-card");
    var siteNavLabel = document.querySelector('.nav[data-section="site"] b');
    var siteDependentNav = document.querySelectorAll(
      '.nav[data-section="link"], .nav[data-section="analytics"]',
    );

    siteDependentNav.forEach(function (item) {
      item.hidden = !dep.id;
    });
    if (siteNavLabel) {
      siteNavLabel.setAttribute("data-fa", dep.id ? "سایت من" : "ساخت سایت");
      siteNavLabel.setAttribute("data-en", dep.id ? "My Site" : "Build My Site");
      siteNavLabel.textContent = text(
        dep.id ? "سایت من" : "ساخت سایت",
        dep.id ? "My Site" : "Build My Site",
      );
    }

    if (!dep.id) {
      card.classList.add("empty-site");
      card.innerHTML =
        '<span class="empty-site-step">' +
        text("قدم اول", "Your first step") +
        "</span><h2>" +
        text("سایت حرفه‌ای خود را بسازید", "Create your professional site") +
        "</h2><p>" +
        text(
          "فایل‌های سایت یا رزومه خود را بارگذاری کنید تا پیش‌نمایش سایت شما ساخته شود.",
          "Upload your site files or CV and we will build your preview.",
        ) +
        '</p><button class="primary empty-site-action" id="create-site">' +
        text("شروع ساخت سایت", "Start building my site") +
        "</button>";
      document.getElementById("create-site").onclick = function () {
        show("site");
      };
      document.getElementById("public-link-card").innerHTML =
        "<p>" +
        text(
          "پس از ساخت سایت، لینک قابل اشتراک شما اینجا نمایش داده می‌شود.",
          "Your shareable link will appear here after you build your site.",
        ) +
        "</p>";
      return;
    }

    card.classList.remove("empty-site");
    card.innerHTML =
      '<div class="site-card-head"><h2>' +
      text("وضعیت سایت", "Site status") +
      '</h2><span><i class="status-dot ' +
      (live ? "live" : "") +
      '"></i>' +
      escape(
        live
          ? text("منتشر شده", "Live")
          : text(
              dep.status === "draft" ? "پیش‌نویس" : "هنوز ساخته نشده",
              dep.status === "draft" ? "Draft" : "Not created",
            ),
      ) +
      '</span></div><div class="url">' +
      escape(
        publicUrl() ||
          text(
            "پس از ساخت پیش‌نمایش، لینک اینجا نمایش داده می‌شود.",
            "Your link will appear after creating a preview.",
          ),
      ) +
      '</div><div class="actions">' +
      (dep.id
        ? '<a class="secondary button-link" href="/proxy/api/preview/' +
          encodeURIComponent(dep.id) +
          '" target="_blank">' +
          text("پیش‌نمایش", "Preview") +
          "</a>"
        : "") +
      (publicUrl()
        ? '<a class="primary button-link" href="' +
          escape(publicUrl()) +
          '" target="_blank" rel="noopener">' +
          text("باز کردن سایت", "Open site") +
          '</a><button class="secondary" id="copy-site">' +
          text("کپی لینک", "Copy link") +
          "</button>"
        : "") +
      (dep.id
        ? '<button class="secondary" id="toggle-publish">' +
          (live ? text("لغو انتشار", "Unpublish") : text("انتشار", "Publish")) +
          "</button>"
        : "") +
      '<button class="secondary" id="replace-site">' +
      text("جایگزینی فایل", "Replace") +
      "</button></div>";
    var copy = document.getElementById("copy-site");
    if (copy)
      copy.onclick = function () {
        navigator.clipboard.writeText(publicUrl()).then(function () {
          copy.textContent = text("کپی شد", "Copied");
        });
      };
    var replace = document.getElementById("replace-site");
    if (replace)
      replace.onclick = function () {
        show("site");
      };
    var toggle = document.getElementById("toggle-publish");
    if (toggle)
      toggle.onclick = async function () {
        toggle.disabled = true;
        var r = live
          ? await dropCVApi.unpublishSite(dep.id)
          : await dropCVApi.publishSite(dep.id);
        if (r.ok) {
          await refreshUser();
        } else {
          toggle.disabled = false;
          alert(r.error || text("عملیات ناموفق بود", "Action failed"));
        }
      };
    var linkCard = document.getElementById("public-link-card");
    linkCard.innerHTML = publicUrl()
      ? "<h2>" +
        text("لینک قابل اشتراک", "Shareable link") +
        '</h2><div class="url">' +
        escape(publicUrl()) +
        '</div><div class="link-actions"><button class="primary" id="copy-public">' +
        text("کپی لینک", "Copy link") +
        '</button><a class="secondary button-link" href="' +
        escape(publicUrl()) +
        '" target="_blank" rel="noopener">' +
        text("باز کردن", "Open") +
        "</a></div>"
      : "<p>" +
        text(
          "هنوز لینک عمومی ندارید. ابتدا سایت خود را بسازید.",
          "You do not have a public link yet. Build your site first.",
        ) +
        "</p>";
    var cp = document.getElementById("copy-public");
    if (cp)
      cp.onclick = function () {
        navigator.clipboard.writeText(publicUrl()).then(function () {
          cp.textContent = text("کپی شد", "Copied");
        });
      };
  }
  async function refreshUser() {
    var result = await dropCVApi.getMe();
    if (result.ok && result.data && result.data.user) {
      state.user = result.data.user;
      window.currentUser = state.user;
      renderUser();
      renderSite();
      return true;
    }
    return false;
  }
  function setupUpload() {
    dropcvUpload.injectStyles();
    state.upload = dropcvUpload.createUploadZone({
      accept: ".html,.css,.js,.zip,.pdf,.docx",
      multiple: true,
      formatsText: "HTML, CSS, JS, ZIP, PDF, DOCX — max 10 MB",
      onChange: function (files) {
        document.getElementById("upload-submit").disabled =
          !files || !files.length;
      },
    });
    document.getElementById("upload-zone").appendChild(state.upload.el);
    document.getElementById("upload-zone").appendChild(state.upload.formatsEl);
    document.getElementById("upload-submit").onclick = async function (event) {
      var button = event.currentTarget,
        out = document.getElementById("upload-result"),
        files = state.upload.getFiles();
      button.disabled = true;
      out.textContent = text(
        "در حال بارگذاری و ساخت پیش‌نمایش…",
        "Uploading and building preview…",
      );
      var result = await dropCVApi.uploadSite({ files: files });
      if (result.ok) {
        out.textContent = text("پیش‌نمایش آماده شد.", "Preview is ready.");
        state.upload.reset();
        await refreshUser();
        show("home");
      } else {
        out.innerHTML =
          '<p class="error">' +
          escape(result.error || text("بارگذاری ناموفق بود", "Upload failed")) +
          "</p>";
        button.disabled = false;
      }
    };
  }
  async function renderAnalytics() {
    var host = document.getElementById("analytics-content");
    if (!state.user || !host) return;
    host.innerHTML = '<div class="skeleton"></div>';
    var result = await dropCVApi.getAnalyticsDashboard();
    if (!result.ok) {
      host.innerHTML =
        '<p class="error">' +
        escape(
          result.error ||
            text("دریافت آمار ممکن نشد.", "Could not load analytics."),
        ) +
        "</p>";
      return;
    }
    var a = result.data || {};
    var refs = Array.isArray(a.topReferrers) ? a.topReferrers : [];
    host.innerHTML =
      '<div class="metrics"><div class="metric"><span>' +
      text("کل بازدید", "Total views") +
      "</span><strong>" +
      Number(a.totalViews || 0).toLocaleString(
        state.language === "fa" ? "fa-IR" : "en-US",
      ) +
      '</strong></div><div class="metric"><span>' +
      text("بازدیدکننده یکتا", "Unique visitors") +
      "</span><strong>" +
      Number(a.uniqueVisitors || 0).toLocaleString(
        state.language === "fa" ? "fa-IR" : "en-US",
      ) +
      '</strong></div><div class="metric"><span>' +
      text("هفت روز اخیر", "Last 7 days") +
      "</span><strong>" +
      Number(a.viewsThisWeek || 0).toLocaleString(
        state.language === "fa" ? "fa-IR" : "en-US",
      ) +
      "</strong></div></div><h3>" +
      text("منابع ورودی", "Top referrers") +
      "</h3>" +
      (refs.length
        ? "<ul>" +
          refs
            .map(function (r) {
              return (
                "<li><span>" +
                escape(r.referrer) +
                "</span> — " +
                escape(r.count) +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : "<p>" +
          text(
            "هنوز بازدیدی ثبت نشده است. لینک خود را به اشتراک بگذارید.",
            "No visits yet. Share your public link.",
          ) +
          "</p>");
  }
  function setupBrief() {
    var form = document.getElementById("premium-brief"),
      saved = localStorage.getItem("dropcv_premium_brief");
    if (saved) {
      try {
        var data = JSON.parse(saved);
        Object.keys(data).forEach(function (k) {
          if (form.elements[k]) form.elements[k].value = data[k];
        });
      } catch (e) {}
    }
    function values() {
      return Object.fromEntries(new FormData(form).entries());
    }
    document.getElementById("save-brief").onclick = function () {
      localStorage.setItem("dropcv_premium_brief", JSON.stringify(values()));
      document.getElementById("brief-result").textContent = text(
        "پیش‌نویس روی این دستگاه ذخیره شد.",
        "Draft saved on this device.",
      );
    };
    form.onsubmit = async function (e) {
      e.preventDefault();
      var d = values(),
        out = document.getElementById("brief-result");
      out.textContent = text("در حال ساخت پیش‌نمایش…", "Building preview…");
      var result = await dropCVApi.uploadStory({
        q1: d.name + " — " + d.role + "\n" + d.bio,
        q2: d.experience,
        q3: d.skills,
        q4: d.style,
        q5: d.goal,
        q6: [d.preferredLanguage, d.links, d.notes].filter(Boolean).join("\n"),
      });
      if (result.ok) {
        localStorage.removeItem("dropcv_premium_brief");
        out.textContent = text(
          "درخواست ثبت شد و پیش‌نمایش در حال ساخت است.",
          "Brief submitted and preview generation started.",
        );
        await refreshUser();
      } else
        out.innerHTML =
          '<span class="error">' +
          escape(
            result.error || text("ارسال ناموفق بود", "Submission failed"),
          ) +
          "</span>";
    };
  }
  function setupSettings() {
    document.getElementById("settings-form").onsubmit = async function (e) {
      e.preventDefault();
      var out = document.getElementById("settings-result"),
        fullName = this.fullName.value.trim(),
        language = this.language.value;
      out.textContent = text("در حال ذخیره…", "Saving…");
      var result = await dropCVApi.updateSettings({
        fullName: fullName,
        language: language,
      });
      if (result.ok) {
        setLanguage(language);
        out.textContent = text("تنظیمات ذخیره شد.", "Settings saved.");
        await refreshUser();
      } else
        out.innerHTML =
          '<span class="error">' +
          escape(result.error || text("ذخیره ناموفق بود", "Save failed")) +
          "</span>";
    };
  }
  function setupAccountActions() {
    document.getElementById("email-form").onsubmit = async function (event) {
      event.preventDefault();
      var out = document.getElementById("email-result");
      out.textContent = text("در حال ارسال…", "Sending…");
      var result = await dropCVApi.requestEmailChange(this.newEmail.value.trim());
      out.innerHTML = result.ok
        ? text("پیوند تأیید ارسال شد.", "Confirmation link sent.")
        : '<span class="error">' + escape(result.error || text("ارسال ناموفق بود", "Request failed")) + "</span>";
    };
    document.getElementById("password-form").onsubmit = async function (event) {
      event.preventDefault();
      var out = document.getElementById("password-result");
      var result = await dropCVApi.changePassword(this.currentPassword.value, this.newPassword.value);
      if (result.ok) {
        this.reset();
        out.textContent = text("رمز عبور تغییر کرد.", "Password changed.");
      } else {
        out.innerHTML = '<span class="error">' + escape(result.error || text("تغییر رمز ناموفق بود", "Password change failed")) + "</span>";
      }
    };
    document.getElementById("delete-form").onsubmit = async function (event) {
      event.preventDefault();
      if (!confirm(text("حساب و همه اطلاعات شما برای همیشه حذف شود؟", "Permanently delete your account and all data?"))) return;
      var out = document.getElementById("delete-result");
      var result = await dropCVApi.deleteAccount(this.password.value);
      if (result.ok) location.replace("index.html?account=deleted");
      else out.innerHTML = '<span class="error">' + escape(result.error || text("حذف حساب ناموفق بود", "Account deletion failed")) + "</span>";
    };
  }
  async function init() {
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      el.innerHTML = icons[el.dataset.icon] || "";
    });
    document.querySelectorAll(".nav[data-section]").forEach(function (el) {
      el.onclick = function () {
        show(el.dataset.section);
      };
    });
    document.getElementById("menu").onclick = function () {
      document.getElementById("sidebar").classList.toggle("open");
    };
    document.getElementById("language").onclick = function () {
      setLanguage(state.language === "fa" ? "en" : "fa");
    };
    document.getElementById("logout").onclick = async function () {
      await dropCVApi.logout();
      location.replace("login.html");
    };
    var ok = await refreshUser();
    if (!ok) {
      location.replace("login.html?next=dashboard.html");
      return;
    }
    setupUpload();
    setupSettings();
    setupAccountActions();
    setLanguage(state.user.language || state.language);
    document.getElementById("auth-loader").hidden = true;
    document.getElementById("app").hidden = false;
    document.documentElement.dataset.auth = "ready";
    var requestedSection = (location.hash || "#home").slice(1);
    if (
      (!state.user.latestDeployment || !state.user.latestDeployment.id) &&
      requestedSection !== "home" &&
      requestedSection !== "site" &&
      requestedSection !== "settings"
    ) {
      requestedSection = "home";
    }
    show(requestedSection);
  }
  init().catch(function (error) {
    document.getElementById("auth-loader").innerHTML =
      '<p class="error">' +
      escape(
        text(
          "داشبورد بارگذاری نشد. صفحه را دوباره باز کنید.",
          "Dashboard failed to load. Refresh the page.",
        ),
      ) +
      "</p>";
    console.error(error);
  });
})();
