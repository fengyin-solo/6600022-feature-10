<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gray-900 rounded-2xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="p-6">
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">
            {{ winnerEmoji }}
          </div>
          <h2 class="text-2xl font-bold" :class="winnerTextColor">
            {{ resultText }}
          </h2>
          <p class="text-gray-500 text-sm mt-1">共 {{ totalMoves }} 手 · 用时 {{ formattedDuration }}</p>
        </div>

        <div v-if="winningLine && winningLine.length > 0" class="mb-6">
          <h3 class="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            连珠位置
          </h3>
          <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(pos, idx) in winningLine"
                :key="idx"
                class="px-3 py-1.5 rounded-lg text-sm font-mono"
                :class="idx === winningLine.length - 1 ? 'bg-red-600/30 text-red-400 border border-red-600/50' : 'bg-gray-700 text-gray-300'"
              >
                {{ positionToLabel(pos) }}
                <span v-if="idx === winningLine.length - 1" class="ml-1 text-xs">★</span>
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-2">方向：{{ directionText }}</p>
          </div>
        </div>

        <div v-if="keyMoves.length > 0" class="mb-6">
          <h3 class="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            关键手
          </h3>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div
              v-for="(km, idx) in keyMoves"
              :key="idx"
              class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                    :class="getKeyMoveBadgeClass(km.type)"
                  >
                    {{ km.moveNumber }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="inline-block w-3 h-3 rounded-full" :class="km.move.player === 1 ? 'bg-gray-300 border border-gray-500' : 'bg-white'"></span>
                    <span class="text-xs text-gray-400">{{ positionToLabel(km.move) }}</span>
                    <span class="text-xs px-1.5 py-0.5 rounded" :class="getKeyMoveTypeClass(km.type)">
                      {{ getKeyMoveTypeLabel(km.type) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-300">{{ km.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="handlePlayAgain"
            class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:shadow-green-500/30"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            再来一局
          </button>
          <button
            v-if="currentRecord"
            @click="handleReplay"
            class="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-500"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            回放对局
          </button>
          <button
            v-if="store.status === 'replaying'"
            @click="handleClose"
            class="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-500"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../store/game';
import type { Position, KeyMoveType } from '../types';

const store = useGameStore();

const currentRecord = computed(() => {
  if (store.status === 'replaying' && store.gameRecords.length > 0) {
    const replayIds = store.replayMoves.map(m => `${m.row},${m.col},${m.timestamp}`).join('|');
    return store.gameRecords.find(r =>
      r.moves.map(m => `${m.row},${m.col},${m.timestamp}`).join('|') === replayIds
    ) || store.gameRecords[0];
  }
  return store.gameRecords[0] || null;
});

const winner = computed(() =>
  store.status === 'replaying'
    ? (currentRecord.value?.winner ?? store.winner)
    : store.winner
);

const winningLine = computed(() =>
  store.status === 'replaying'
    ? (currentRecord.value?.winningLine ?? store.replayWinningLine)
    : store.winningLine
);

const keyMoves = computed(() =>
  store.status === 'replaying'
    ? (currentRecord.value?.keyMoves ?? store.replayKeyMoves)
    : store.keyMoves
);

const totalMoves = computed(() =>
  store.status === 'replaying'
    ? store.replayMoves.length
    : store.currentMoveCount
);

const duration = computed(() => {
  if (currentRecord.value) {
    return currentRecord.value.duration;
  }
  if (store.moves.length > 0) {
    return store.moves[store.moves.length - 1].timestamp - store.moves[0].timestamp;
  }
  return 0;
});

const formattedDuration = computed(() => {
  const seconds = Math.floor(duration.value / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
});

const winnerEmoji = computed(() => {
  if (winner.value === 1) return '⚫';
  if (winner.value === 2) return '⚪';
  return '🤝';
});

const resultText = computed(() => {
  if (winner.value === 1) return '黑棋胜';
  if (winner.value === 2) return '白棋胜';
  return '平局';
});

const winnerTextColor = computed(() => {
  if (winner.value === 1) return 'text-gray-200';
  if (winner.value === 2) return 'text-white';
  return 'text-yellow-400';
});

const directionText = computed(() => {
  if (!winningLine.value || winningLine.value.length < 2) return '';
  const start = winningLine.value[0];
  const end = winningLine.value[winningLine.value.length - 1];
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  if (dr === 0) return '横向';
  if (dc === 0) return '纵向';
  if (dr > 0 && dc > 0) return '右下斜向';
  return '左下斜向';
});

function positionToLabel(pos: Position): string {
  const colLabel = String.fromCharCode(65 + pos.col);
  const rowLabel = pos.row + 1;
  return `${colLabel}${rowLabel}`;
}

function getKeyMoveBadgeClass(type: KeyMoveType): string {
  switch (type) {
    case 'winning':
      return 'bg-red-600 text-white';
    case 'live-four':
      return 'bg-orange-600 text-white';
    case 'live-three':
      return 'bg-yellow-600 text-white';
    case 'block':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

function getKeyMoveTypeClass(type: KeyMoveType): string {
  switch (type) {
    case 'winning':
      return 'bg-red-600/30 text-red-400';
    case 'live-four':
      return 'bg-orange-600/30 text-orange-400';
    case 'live-three':
      return 'bg-yellow-600/30 text-yellow-400';
    case 'block':
      return 'bg-blue-600/30 text-blue-400';
    default:
      return 'bg-gray-600/30 text-gray-400';
  }
}

function getKeyMoveTypeLabel(type: KeyMoveType): string {
  switch (type) {
    case 'winning':
      return '制胜';
    case 'live-four':
      return '活四';
    case 'live-three':
      return '活三';
    case 'block':
      return '防守';
    default:
      return '关键';
  }
}

function handlePlayAgain() {
  if (store.status === 'replaying') {
    store.stopReplay();
  }
  store.startGame();
}

function handleReplay() {
  if (currentRecord.value) {
    if (store.status === 'replaying') {
      store.stopReplay();
    }
    store.startReplay(currentRecord.value);
  }
}

function handleClose() {
  store.stopReplay();
}
</script>
