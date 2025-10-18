'use strict';
const CACHE_NAME_BASE = 'flutter-app-cache';
const TEMP = 'flutter-temp-cache';
const MANIFEST = 'flutter-app-manifest';
const VERSION_URL = 'version.json';

let CURRENT_VERSION = null;
let CACHE_NAME = CACHE_NAME_BASE;

// لیست فایل‌هایی که باید کش بشن (در حالت دلخواه می‌تونی بیشترشون رو اضافه کنی)
const CORE = [
  "index.html",
  "main.dart.js",
  "flutter.js",
  "favicon.png",
  "manifest.json",
  "assets/AssetManifest.json",
  "assets/FontManifest.json"
];

// 📦 نصب اولیه
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(TEMP).then((cache) => cache.addAll(CORE))
  );
});

// 🌀 فعال‌سازی و مدیریت کش‌ها
self.addEventListener("activate", async (event) => {
  try {
    const versionResp = await fetch(VERSION_URL, { cache: "no-store" });
    const versionData = await versionResp.json();
    CURRENT_VERSION = versionData.version;
    CACHE_NAME = `${CACHE_NAME_BASE}-${CURRENT_VERSION}`;

    const contentCache = await caches.open(CACHE_NAME);
    const tempCache = await caches.open(TEMP);
    const manifestCache = await caches.open(MANIFEST);
    const manifest = await manifestCache.match('manifest');

    // اگر اولین بار اجرا میشه
    if (!manifest) {
      await caches.delete(CACHE_NAME);
      for (const request of await tempCache.keys()) {
        const response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      await manifestCache.put('manifest', new Response(JSON.stringify({ version: CURRENT_VERSION })));
      self.clients.claim();
      return;
    }

    // اگر نسخه قبلی فرق داشت → همه‌چیز رو پاک کن
    const oldManifest = await manifest.json();
    if (oldManifest.version !== CURRENT_VERSION) {
      console.log('[SW] New version detected, clearing old caches...');
      const allCaches = await caches.keys();
      for (const name of allCaches) {
        if (name.startsWith(CACHE_NAME_BASE)) await caches.delete(name);
      }
    }

    // انتقال فایل‌های موقت به کش اصلی
    for (const request of await tempCache.keys()) {
      const response = await tempCache.match(request);
      await contentCache.put(request, response);
    }

    await caches.delete(TEMP);
    await manifestCache.put('manifest', new Response(JSON.stringify({ version: CURRENT_VERSION })));
    self.clients.claim();
  } catch (err) {
    console.error('[SW] Activation error:', err);
    await caches.delete(CACHE_NAME_BASE);
    await caches.delete(TEMP);
    await caches.delete(MANIFEST);
  }
});

// ⚡ مدیریت درخواست‌ها (network first برای HTML)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) =>
      response ||
      fetch(event.request).then((resp) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()));
        return resp;
      })
    )
  );
});

// 📢 وقتی نسخه جدید پیدا بشه → ریفرش اتومات
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
