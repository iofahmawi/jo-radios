// --- إعدادات عامل الخدمة ---

// اسم ذاكرة التخزين المؤقت. غيّر 'v1' إلى 'v2' عند إجراء أي تعديلات على الملفات المخزنة.
const CACHE_NAME = 'jordan-radios-cache-v1';

// قائمة بالملفات الأساسية للتطبيق التي سيتم تخزينها مؤقتًا للعمل دون اتصال.
// هذه هي "قشرة التطبيق" (App Shell).
const urlsToCache = [
  './', // <-- مهم جدًا لـ GitHub Pages: يشير إلى الصفحة الرئيسية للمشروع
  'index.html', // ملف HTML الرئيسي
  'manifest.json', // ملف البيان الخاص بالتطبيق

  // يمكنك إضافة ملف JS الرئيسي هنا إذا قمت بفصله
  // 'main.js',

  // يمكنك إضافة مجلد الأيقونات هنا
  // 'images/icon-192x192.png',
  // 'images/icon-512x512.png',
  
  // الموارد الخارجية (CDNs) التي يعتمد عليها الموقع
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://cdn.plyr.io/3.7.8/plyr.css',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/hls.js@latest',
  'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/60px-Flag_of_Jordan.svg.png'
];


// --- مراحل حياة عامل الخدمة ---

// 1. مرحلة التثبيت (Install)
// يتم تفعيل هذا الحدث عند تسجيل عامل الخدمة لأول مرة.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service Worker: Caching failed', err);
      })
  );
});


// 2. مرحلة التفعيل (Activate)
// يتم تفعيل هذا الحدث بعد التثبيت، وظيفته هي تنظيف أي بيانات قديمة.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // إذا كان اسم الـ cache لا يطابق الاسم الحالي، يتم حذفه.
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});


// 3. مرحلة الجلب (Fetch)
// يعترض هذا الحدث جميع طلبات الشبكة الصادرة من الصفحة.
self.addEventListener('fetch', event => {
  // استخدم استراتيجية "Cache First": حاول جلب المورد من ذاكرة التخزين أولاً.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان المورد موجودًا في الـ cache، قم بإرجاعه مباشرة.
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجودًا، اطلبه من الشبكة كالمعتاد.
        return fetch(event.request);
      })
  );
});