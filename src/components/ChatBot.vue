<template>
  <div class="fixed bottom-4 right-4 z-40 flex flex-col gap-3 sm:gap-4">
    <!-- Chat Window -->
    <transition name="slide-up">
      <div v-if="isChatOpen" class="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[32rem] max-h-[calc(100vh-8rem)] sm:max-h-[32rem] border border-white/10 hover:border-white/20 transition-all">
        <!-- Chat Header - Glassmorphic -->
        <div class="relative overflow-hidden">
          <!-- Background gradient blur -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-pink-600/40 blur-2xl"></div>
          
          <!-- Content -->
          <div class="relative px-3 sm:px-5 py-3 sm:py-5 flex items-center justify-between backdrop-blur-md border-b border-white/10">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <div class="relative flex-shrink-0">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75 animate-pulse"></div>
                <div class="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm sm:text-lg font-bold text-white shadow-lg">
                  ⚡
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-white text-xs sm:text-sm truncate">GENI</h3>
                <p class="text-[10px] sm:text-xs bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent font-medium truncate">Weather Assistant</p>
              </div>
            </div>
            <button
              @click="closeChatWindow"
              type="button"
              class="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-300 hover:text-white flex-shrink-0"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full py-6 sm:py-8 text-center px-2">
            <div class="text-4xl sm:text-5xl mb-2 sm:mb-3 animate-bounce">⚡</div>
            <h4 class="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Hi, I'm GENI!</h4>
            <p class="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs">
              Your AI weather assistant. Ask me about weather conditions, rainfall, temperature, wind, or any weather-related questions!
            </p>
          </div>

          <!-- Messages -->
          <div v-for="(message, index) in messages" :key="index" :class="[
            'flex gap-2 sm:gap-3 animate-fade-in',
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          ]">
            <!-- Bot Avatar -->
            <div v-if="message.sender === 'bot'" class="flex-shrink-0">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                ⚡
              </div>
            </div>
            
            <!-- Message Bubble -->
            <div :class="[
              'max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed backdrop-blur-sm border transition-all',
              message.sender === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none border-blue-400/30 shadow-lg'
                : 'bg-slate-700/50 text-gray-100 rounded-bl-none border-white/10 hover:border-white/20'
            ]">
              {{ message.text }}
            </div>

            <!-- User Avatar -->
            <div v-if="message.sender === 'user'" class="flex-shrink-0">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg border border-white/10">
                👤
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex gap-2 sm:gap-3 justify-start">
            <div class="flex-shrink-0">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg animate-pulse">
                ⚡
              </div>
            </div>
            <div class="bg-slate-700/50 text-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-none border border-white/10 backdrop-blur-sm">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area - Glassmorphic -->
        <div class="border-t border-white/10 p-3 sm:p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-md">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="userMessage"
              type="text"
              placeholder="Ask GENI..."
              class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all"
              :disabled="isLoading"
            />
            <button
              type="submit"
              :disabled="isLoading || !userMessage.trim()"
              class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-200 font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center flex-shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>

    <!-- Chat Toggle Button - Glassmorphic -->
    <button
      @click="toggleChat"
      type="button"
      class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white/20 hover:border-white/40 backdrop-blur-sm flex-shrink-0"
      :class="isChatOpen ? 'hidden' : 'flex'"
    >
      <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const isChatOpen = ref(false);
const userMessage = ref('');
const messages = ref<Message[]>([]);
const isLoading = ref(false);

// Try multiple API endpoints for better mobile compatibility
const CHAT_API_URLS = [
  'http://152.42.220.20:82/api/weather-chat',
  'https://152.42.220.20:82/api/weather-chat', // HTTPS fallback
];

// Diagnostic endpoints to test connectivity
const DIAGNOSTIC_URLS = [
  'http://152.42.220.20:82/api/weather-chat',
  'http://152.42.220.20:82', // Base URL
  'https://152.42.220.20:82', // HTTPS base
];

let CHAT_API_URL = CHAT_API_URLS[0]; // Default to first URL

// Detect if running on a native platform (Android/iOS)
const isNative = typeof Capacitor !== 'undefined' && Capacitor.getPlatform() !== 'web';

// Unified HTTP helper to use native HTTP on device and fetch on web
async function httpRequest(
  method: 'GET' | 'POST' | 'HEAD',
  url: string,
  options?: {
    headers?: Record<string, string>;
    json?: any;
    timeoutMs?: number;
    signal?: AbortSignal;
  }
) {
  const headers = options?.headers ?? {};
  const timeoutMs = options?.timeoutMs ?? 10000;

  if (isNative) {
    // Use Capacitor native HTTP to bypass CORS/preflight in WebView
    const response = await CapacitorHttp.request({
      method,
      url,
      headers,
      data: options?.json,
      connectTimeout: timeoutMs,
      readTimeout: timeoutMs
    });

    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      json: async () => response.data,
      statusText: String(response.status),
    } as const;
  }

  // Web fallback using fetch
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const resp = await fetch(url, {
    method,
    headers,
    body: options?.json ? JSON.stringify(options.json) : undefined,
    mode: 'cors',
    credentials: 'omit',
    signal: options?.signal ?? controller.signal
  });
  clearTimeout(timeoutId);

  return {
    status: resp.status,
    ok: resp.ok,
    json: async () => resp.json(),
    statusText: resp.statusText,
  } as const;
}

function toggleChat() {
  isChatOpen.value = !isChatOpen.value;
}

function closeChatWindow() {
  isChatOpen.value = false;
}

async function sendMessage() {
  const message = userMessage.value.trim();
  if (!message) return;

  // Add user message
  messages.value.push({
    sender: 'user',
    text: message
  });

  userMessage.value = '';
  isLoading.value = true;

  // Scroll to bottom
  await nextTick();
  scrollToBottom();

  // Check for diagnostic command
  if (message === '/diag') {
    await runDiagnostics();
    isLoading.value = false;
    return;
  }

  try {
    // Send to API with retry logic and multiple URL attempts
    let lastError: Error | null = null;
    let success = false;

    for (let urlIndex = 0; urlIndex < CHAT_API_URLS.length && !success; urlIndex++) {
      const testUrl = CHAT_API_URLS[urlIndex];
      
      // HTTP gets 3 attempts, HTTPS gets 2 (since HTTP is primary)
      const maxAttempts = testUrl.includes('https') ? 2 : 3;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const response = await httpRequest('POST', testUrl, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            json: {
              message: message,
              timestamp: new Date().toISOString(),
            },
            timeoutMs: 10000,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Extract bot response from API - try multiple possible paths
          let botResponse = data.reply?.response || 
                           data.response || 
                           data.reply || 
                           data.message || 
                           data.text ||
                           data.data?.response ||
                           data.data?.reply;
          
          // If response is a string that looks like JSON, try to parse it
          if (typeof botResponse === 'string') {
            try {
              const parsed = JSON.parse(botResponse);
              botResponse = parsed.response || parsed.message || parsed.text || botResponse;
            } catch (e) {
            }
          }
          
          // Fallback if no response found
          if (!botResponse || (typeof botResponse === 'string' && botResponse.trim() === '')) {
            botResponse = 'I received your message but the response was empty. Please try again.';
          }
          
          // Add bot response
          messages.value.push({
            sender: 'bot',
            text: botResponse
          });
          
          success = true;
          CHAT_API_URL = testUrl; // Update to working URL
          break; // Exit retry loop
        } catch (error) {
          lastError = error as Error;
          const errorMsg = error instanceof Error ? error.message : String(error);
          
          if (attempt < maxAttempts - 1) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!success && urlIndex < CHAT_API_URLS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // If all attempts failed, show detailed error
    if (!success) {
      throw new Error(`All API endpoints failed. Last error: ${lastError?.message || 'Unknown'}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Add detailed error message for debugging
    let displayError = '⚠️ Connection Error: The weather service is currently unreachable.';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      displayError += '\n\n📡 Issue: Request timed out (service taking too long to respond)\n• Check if the server at 152.42.220.20:82 is running\n• Check your network connection';
    } else if (errorMessage.includes('abort') || errorMessage.includes('Abort')) {
      displayError += '\n\n📡 Issue: Request was aborted (slow/unstable connection)\n• Try again with a stable internet connection';
    } else if (errorMessage.includes('HTTP')) {
      displayError += `\n\n📡 Issue: ${errorMessage}\n• The server returned an error\n• Contact support if this persists`;
    } else {
      displayError += '\n\n📡 Issue: Network unreachable or CORS blocked\n• Check your internet connection\n• Ensure the server is online\n\n🔴 SERVER API ISSUE: The weather chat API endpoint may be unavailable\n• Contact server administrator\n• API endpoint may have changed\n• Try again later\n\nType `/diag` for detailed diagnostics.';
    }
    
    messages.value.push({
      sender: 'bot',
      text: displayError
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  const messagesContainer = document.querySelector('.overflow-y-auto');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Test API connectivity - SKIPPED because server doesn't support OPTIONS
// The API responds to POST directly, so we'll test during actual message send
async function testAPIConnectivity(): Promise<boolean> {
  // This function is kept for future use but not called
  // The server doesn't support OPTIONS preflight requests, so we skip testing
  // and go straight to POST which works fine
  return true;
}

// Run comprehensive diagnostics to help debug connectivity issues
async function runDiagnostics() {
  const diagResults: string[] = [];
  
  diagResults.push('🔍 GENI DIAGNOSTIC TEST');
  diagResults.push('='.repeat(50));
  diagResults.push('');
  
  // Test device info
  diagResults.push('📱 Device Information:');
  diagResults.push(`User Agent: ${navigator.userAgent}`);
  diagResults.push(`Language: ${navigator.language}`);
  diagResults.push(`Online: ${navigator.onLine}`);
  diagResults.push('');
  
  // Test each diagnostic URL
  diagResults.push('🌐 Testing Connectivity to Each Endpoint:');
  diagResults.push('');
  
  for (let i = 0; i < DIAGNOSTIC_URLS.length; i++) {
    const url = DIAGNOSTIC_URLS[i];
    diagResults.push(`Test ${i + 1}: ${url}`);
    
    // Test with HEAD request
    try {
      const response = await httpRequest('HEAD', url, { timeoutMs: 5000 });
      diagResults.push(`  ✅ HEAD request: ${response.status} ${response.statusText}`);
      
      // If we get a 404, that's actually GOOD - it means we can reach the server!
      if (response.status === 404) {
        diagResults.push(`     📡 Server reachable! API endpoint not found (server-side issue)`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      diagResults.push(`  ❌ HEAD request: ${errorMsg}`);
    }
    
    // Test with GET request
    try {
      const response = await httpRequest('GET', url, { timeoutMs: 5000 });
      diagResults.push(`  ✅ GET request: ${response.status} ${response.statusText}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      diagResults.push(`  ❌ GET request: ${errorMsg}`);
    }
    
    diagResults.push('');
  }
  
  // Test base server connectivity
  diagResults.push('🏠 Testing Base Server Connectivity:');
  try {
    const response = await httpRequest('GET', 'http://152.42.220.20:82/', { timeoutMs: 5000 });
    diagResults.push(`  ✅ Base server: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      diagResults.push(`     📡 Server reachable! No root endpoint (normal for API servers)`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    diagResults.push(`  ❌ Base server: ${errorMsg}`);
  }
  diagResults.push('');
  
  // Test with POST to actual endpoint
  diagResults.push('📡 Testing POST to Weather Chat API:');
  try {
    const response = await httpRequest('POST', CHAT_API_URLS[0], {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      json: {
        message: 'test',
        timestamp: new Date().toISOString(),
      },
      timeoutMs: 8000,
    });
    const data = await response.json();
    diagResults.push(`  ✅ POST successful: ${response.status}`);
    diagResults.push(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    diagResults.push(`  ❌ POST failed: ${errorMsg}`);
  }
  
  diagResults.push('');
  diagResults.push('='.repeat(50));
  diagResults.push('📋 Troubleshooting Steps:');
  diagResults.push('');
  diagResults.push('If all tests show ❌:');
  diagResults.push('1. Check if device has internet connection');
  diagResults.push('2. Try switching between WiFi and mobile data');
  diagResults.push('3. Verify the server at 152.42.220.20:82 is running');
  diagResults.push('4. Check if device can ping the server IP');
  diagResults.push('5. Try opening the URL in device browser directly');
  diagResults.push('');
  diagResults.push('🔴 SERVER ISSUE DETECTED:');
  diagResults.push('• If you see 404 errors: Server is reachable! API not deployed');
  diagResults.push('• Contact server administrator to deploy weather chat API');
  diagResults.push('• API endpoint `/api/weather-chat` needs to be created');
  diagResults.push('• Check server logs for incoming requests');
  diagResults.push('');
  diagResults.push('If tests show ✅ but chat fails:');
  diagResults.push('1. The API might have response format issues');
  diagResults.push('2. Check the actual API response in console');
  diagResults.push('3. Report the response format to developer');
  diagResults.push('');
  
  const fullDiagnostics = diagResults.join('\n');
  
  // Show in chat
  messages.value.push({
    sender: 'bot',
    text: `🔍 Diagnostic Report:\n\n${fullDiagnostics}`
  });
  
  await nextTick();
  scrollToBottom();
}

</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Glassmorphic scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.6);
}
</style>
