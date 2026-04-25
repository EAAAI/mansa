<script lang="ts" setup>
import Logo from './Logo.vue';

interface Props {
    showIcon?: boolean;
    iconSize?: number;
}

withDefaults(defineProps<Props>(), {
    showIcon: true,
    iconSize: 24,
});
</script>

<template>
    <div class="flex items-center gap-2">
        <Logo
            v-if="showIcon"
            :size="iconSize"
        />
        <span class="text-[15px] font-bold tracking-tight text-ink">
            New<span class="text-green-700">Cv</span>
        </span>
    </div>
</template>
