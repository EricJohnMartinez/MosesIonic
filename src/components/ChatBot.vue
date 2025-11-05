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

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const isChatOpen = ref(false);
const userMessage = ref('');
const messages = ref<Message[]>([]);
const isLoading = ref(false);

const CHAT_API_URL = 'http://152.42.220.20:82/api/weather-chat';

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

  try {
    // Send to API
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API Response:', data); // Debug log
    
    // Extract bot response from API
    // The API returns response in data.reply.response
    let botResponse = data.reply?.response || data.response || data.reply || data.message || data.text;
    
    // If response is a string that looks like JSON, try to parse it
    if (typeof botResponse === 'string') {
      try {
        const parsed = JSON.parse(botResponse);
        console.log('Parsed response:', parsed); // Debug log
        botResponse = parsed.response || parsed.message || parsed.text || botResponse;
      } catch (e) {
        // If it's not JSON, use as is
        console.log('Response is not JSON, using as string:', botResponse); // Debug log
      }
    }
    
    // Fallback if no response found
    if (!botResponse || (typeof botResponse === 'string' && botResponse.trim() === '')) {
      botResponse = 'Sorry, I could not understand that. Please try again.';
    }
    
    console.log('Final bot response:', botResponse); // Debug log
    
    // Add bot response
    messages.value.push({
      sender: 'bot',
      text: botResponse
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    // Add error message
    messages.value.push({
      sender: 'bot',
      text: 'Sorry, I\'m having trouble connecting. Please try again later.'
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
