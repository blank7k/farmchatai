const CACHE_NAME = 'farmbot-kerala-v1';
const urlsToCache = [
  '/',
  '/app',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.svg',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Farming advice and tips that can work offline
const OFFLINE_FARMING_TIPS = [
  {
    id: 'tip-1',
    title: 'Best Time for Irrigation',
    content: 'Water your crops early morning (6-8 AM) or late evening (5-7 PM) to reduce water loss through evaporation.',
    category: 'irrigation'
  },
  {
    id: 'tip-2',
    title: 'Organic Pest Control',
    content: 'Use neem oil spray (2-3ml per liter water) to control most common pests naturally.',
    category: 'pest-control'
  },
  {
    id: 'tip-3',
    title: 'Monsoon Preparation',
    content: 'Clean drainage channels and secure plant supports before monsoon arrives to prevent waterlogging and wind damage.',
    category: 'seasonal'
  },
  {
    id: 'tip-4',
    title: 'Soil Health Check',
    content: 'Test soil pH every 6 months. Most Kerala crops prefer slightly acidic soil (pH 6.0-6.8).',
    category: 'soil'
  },
  {
    id: 'tip-5',
    title: 'Coconut Tree Care',
    content: 'Remove dead fronds monthly and apply organic manure twice yearly around the base for better yield.',
    category: 'crops'
  }
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // Special handling for API requests when offline
        if (event.request.url.includes('/api/')) {
          return handleOfflineApiRequest(event.request);
        }

        return fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Handle API requests when offline
function handleOfflineApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle different API endpoints when offline
  if (pathname.includes('/api/chat')) {
    return new Response(JSON.stringify({
      id: 'offline-' + Date.now(),
      message: request.method === 'GET' ? [] : request.body,
      response: "I'm currently offline. Here are some helpful farming tips:\n\n" + 
               getRandomFarmingTip() + 
               "\n\nPlease connect to internet for personalized AI assistance.",
      isVoice: false,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (pathname.includes('/api/suggestions')) {
    return new Response(JSON.stringify(getOfflineSuggestions()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (pathname.includes('/api/weather')) {
    return new Response(JSON.stringify({
      error: 'Weather data requires internet connection',
      message: 'Please connect to internet for current weather information',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (pathname.includes('/api/market-prices')) {
    return new Response(JSON.stringify({
      error: 'Market prices require internet connection',
      message: 'Please connect to internet for current market prices',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Default offline response
  return new Response(JSON.stringify({
    error: 'Service unavailable offline',
    message: 'This feature requires internet connection'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get random farming tip for offline use
function getRandomFarmingTip() {
  const randomIndex = Math.floor(Math.random() * OFFLINE_FARMING_TIPS.length);
  const tip = OFFLINE_FARMING_TIPS[randomIndex];
  return `💡 ${tip.title}\n\n${tip.content}`;
}

// Generate offline suggestions
function getOfflineSuggestions() {
  const currentMonth = new Date().getMonth() + 1;
  const suggestions = [];

  // Seasonal suggestions based on month
  if (currentMonth >= 10 && currentMonth <= 2) {
    suggestions.push({
      id: 'offline-winter-veg',
      title: 'Plant Winter Vegetables',
      description: 'Perfect time for leafy greens, carrots, and beans in Kerala climate.',
      priority: 'high',
      category: 'planting',
      isCompleted: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (currentMonth >= 3 && currentMonth <= 5) {
    suggestions.push({
      id: 'offline-summer-prep',
      title: 'Prepare for Summer',
      description: 'Set up shade nets and check irrigation systems before hot weather.',
      priority: 'high',
      category: 'seasonal',
      isCompleted: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (currentMonth >= 6 && currentMonth <= 9) {
    suggestions.push({
      id: 'offline-monsoon-care',
      title: 'Monsoon Field Care',
      description: 'Check drainage, prevent waterlogging, and manage fungal diseases.',
      priority: 'medium',
      category: 'care',
      isCompleted: false,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Always include these general suggestions
  suggestions.push(
    {
      id: 'offline-soil-test',
      title: 'Monthly Soil Check',
      description: 'Check soil moisture and pH levels for optimal crop growth.',
      priority: 'medium',
      category: 'care',
      isCompleted: false,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'offline-pest-inspection',
      title: 'Pest Inspection',
      description: 'Regular inspection of crops for early pest and disease detection.',
      priority: 'medium',
      category: 'pest',
      isCompleted: false,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  );

  return suggestions.slice(0, 3);
}

// Update cache when new version is available
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications for farming alerts
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New farming alert available',
    icon: '/static/media/logo.svg',
    badge: '/static/media/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/static/media/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/static/media/dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FarmBot Kerala', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-chat-sync') {
    event.waitUntil(syncOfflineChats());
  }
  
  if (event.tag === 'offline-suggestions-sync') {
    event.waitUntil(syncOfflineSuggestions());
  }
});

// Sync offline chat messages when connection is restored
async function syncOfflineChats() {
  try {
    // Get offline messages from IndexedDB or localStorage
    const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    
    if (offlineMessages.length === 0) return;

    // Send each message to the server
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          // Remove synced message from offline storage
          const index = offlineMessages.indexOf(message);
          offlineMessages.splice(index, 1);
        }
      } catch (error) {
        console.log('Failed to sync message:', error);
        break; // Stop syncing if network is still unavailable
      }
    }

    // Update offline storage with remaining messages
    localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
  } catch (error) {
    console.log('Offline chat sync failed:', error);
  }
}

// Sync offline suggestion updates when connection is restored
async function syncOfflineSuggestions() {
  try {
    const offlineUpdates = JSON.parse(localStorage.getItem('offlineSuggestionUpdates') || '[]');
    
    if (offlineUpdates.length === 0) return;

    for (const update of offlineUpdates) {
      try {
        const response = await fetch(`/api/suggestions/${update.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          const index = offlineUpdates.indexOf(update);
          offlineUpdates.splice(index, 1);
        }
      } catch (error) {
        console.log('Failed to sync suggestion update:', error);
        break;
      }
    }

    localStorage.setItem('offlineSuggestionUpdates', JSON.stringify(offlineUpdates));
  } catch (error) {
    console.log('Offline suggestions sync failed:', error);
  }
}
