<script lang="ts" setup>
interface Props {
    size?: number;
}

withDefaults(defineProps<Props>(), {
    size: 28,
});
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-primary"
    >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5" />
    </svg>
</template>
