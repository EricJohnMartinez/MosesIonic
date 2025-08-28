<script setup lang="ts">
import { ref, defineExpose } from 'vue';

const isShowing = ref(false);

async function show(opts: { title?: string; text?: string; html?: string; icon?: any; confirmButtonText?: string } = {}) {
  const SwalModule = await import('sweetalert2').then(m => m.default || m);
  isShowing.value = true;

  const defaultOptions = {
    title: opts.title || 'Heat Index Alert',
    text: opts.text || undefined,
    html: opts.html || undefined,
    icon: opts.icon || 'warning',
    confirmButtonText: opts.confirmButtonText || 'Got it'
  };

  try {
    await SwalModule.fire(defaultOptions as any);
  } finally {
    isShowing.value = false;
  }
}

function showHeat(payload: { station?: string; heatIndex?: number }) {
  const title = 'Heat Index Alert';
  const html = `<div style="text-align:left"><p><strong>${payload.heatIndex ?? 'N/A'}°C</strong> heat index detected at <strong>${payload.station ?? 'Station'}</strong>.</p><p>Please take necessary precautions and stay hydrated.</p></div>`;
  return show({ title, html, icon: 'warning', confirmButtonText: 'OK' });
}

defineExpose({ show, showHeat, isShowing });
</script>

<template>
  <div style="display:none" aria-hidden="true"></div>
</template>
