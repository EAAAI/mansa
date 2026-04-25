<template>
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div class="flex items-center space-x-3">
                <h1 class="text-2xl font-bold text-gray-900">
                    {{ resumeStore.activeResume?.name || t('builder.defaultTitle') }}
                </h1>
                <ResumeLanguageSelector
                    v-if="activeResume"
                    :model-value="activeResume.language"
                    @update="handleLanguageChange"
                />
            </div>
            <div class="flex items-center space-x-2">
                <Button
                    size="sm"
                    variant="outline"
                    @click="settingsStore.expandAllSections()"
                >
                    <ChevronDown class="h-4 w-4" />
                    <span class="ml-1 sm:hidden">{{ t('builder.expand') }}</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    @click="settingsStore.collapseAllSections()"
                >
                    <ChevronUp class="h-4 w-4" />
                    <span class="ml-1 sm:hidden">{{ t('builder.collapse') }}</span>
                </Button>
                <Button
                    class="flex items-center gap-2"
                    size="sm"
                    variant="outline"
                    @click="showStepper = true"
                >
                    <ListIcon class="h-4 w-4" />
                    {{ t('builder.sections') }}
                </Button>
            </div>
        </div>
    </div>
    <ResumeStepper v-model:show-stepper="showStepper" />
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { ChevronDown, ChevronUp, ListIcon } from 'lucide-vue-next';
import ResumeStepper from '~/components/elements/ResumeStepper.vue';
import ResumeLanguageSelector from '~/components/elements/ResumeLanguageSelector.vue';

const resumeStore = useResumeStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();
const showStepper = ref<boolean>(false);
const activeResume = computed(() => resumeStore.activeResume);
const handleLanguageChange = (code: string) => {
    if (!activeResume.value) return;
    resumeStore.setResumeLanguage(activeResume.value.id, code);
};
</script>
