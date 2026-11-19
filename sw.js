const CACHE_NAME = 'quraner-pakhi-v1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return new Response("অফলাইন মোড: অনুগ্রহ করে ইন্টারনেট সংযোগ চালু করুন।", {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    })
  );
});
