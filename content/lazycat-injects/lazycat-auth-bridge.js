/**
 * 懒猫微服免密登录桥接脚本（由 lzc-manifest inject 注入）
 * 1. 已有 NextAuth session → 跳过
 * 2. 否则调用 /api/auth/lazycat-bridge 签发 cookie
 */
(function lazycatAuthBridge() {
  var BOOT_KEY = "lawlink-lzc-auth-bootstrapped";

  if (window.__LZC_AUTH_BRIDGE_DONE__ || window.__LZC_AUTH_BRIDGE_PENDING__) {
    return;
  }

  if (sessionStorage.getItem(BOOT_KEY) === "1") {
    window.__LZC_AUTH_BRIDGE_DONE__ = true;
    return;
  }

  window.__LZC_AUTH_BRIDGE_PENDING__ = true;

  function finishLogin() {
    if (document.querySelector(".lzc-open-save-chooser, lzc-file-picker")) {
      window.__LZC_AUTH_BRIDGE_PENDING__ = false;
      return;
    }
    window.__LZC_AUTH_BRIDGE_DONE__ = true;
    window.__LZC_AUTH_BRIDGE_PENDING__ = false;
    sessionStorage.setItem(BOOT_KEY, "1");

    var path = window.location.pathname;
    if (path === "/login" || path.startsWith("/login/")) {
      var params = new URLSearchParams(window.location.search);
      var target = params.get("callbackUrl") || "/";
      window.location.replace(target);
      return;
    }

    window.location.reload();
  }

  function fail() {
    window.__LZC_AUTH_BRIDGE_PENDING__ = false;
  }

  fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
    .then(function (res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function (session) {
      if (session && session.user) {
        finishLogin();
        return null;
      }
      return fetch("/api/auth/lazycat-bridge", {
        credentials: "include",
        cache: "no-store"
      });
    })
    .then(function (res) {
      if (!res) return;
      if (!res.ok) {
        fail();
        return null;
      }
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.ok) {
        fail();
        return;
      }
      finishLogin();
    })
    .catch(fail);
})();
