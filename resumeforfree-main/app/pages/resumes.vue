<script lang="ts" setup>
import ConfirmationModal from '~/components/elements/ConfirmationModal.vue';
import CreateResumeModal from '~/components/elements/CreateResumeModal.vue';
import CopyResumeModal from '~/components/elements/CopyResumeModal.vue';
import ExportModal from '~/components/elements/ExportModal.vue';
import ImportConfirmationModal from '~/components/elements/ImportConfirmationModal.vue';
import { Button } from '~/components/ui/button';
import type { Resume, ImportResumePreview } from '~/types/resume';

const { t } = useI18n();
const localePath = useLocalePath();
const resumeStore = useResumeStore();
const router = useRouter();
const confirmation = useConfirmation();
const { exportResumes, exportSingleResume, parseImportFile, importSelectedResumes } = useResumeImportExport();
const searchQuery = ref('');
onMounted(() => {
    resumeStore.initialize();
});

const resumes = computed(() => {
    const allResumes = resumeStore.resumesList;
    if (!searchQuery.value.trim()) {
        return allResumes;
    }
    const query = searchQuery.value.toLowerCase().trim();
    return allResumes.filter(resume =>
        resume.name.toLowerCase().includes(query),
    );
});
const resumeCount = computed(() => resumeStore.resumeCount);
const filteredCount = computed(() => resumes.value.length);
const showCreateModal = ref(false);
const showCopyModal = ref(false);
const resumeToCopy = ref<Resume | null>(null);
const showExportModal = ref(false);
const showImportModal = ref(false);
const importPreviews = ref<ImportResumePreview[]>([]);
const importInputRef = ref<HTMLInputElement>();
const createNewResume = () => {
    showCreateModal.value = true;
};
const getDefaultResumeName = () => {
    return 'Untitled Resume';
};
const handleCreateResume = async (name: string, language: string, navigateToBuilder: boolean) => {
    const { toast } = await import('vue-sonner');
    const { defaultResumeSettings, getDefaultFontForLanguage } = await import('~/types/resume');
    const resumeName = name.trim() || getDefaultResumeName();
    const seededSettings = {
        ...defaultResumeSettings,
        selectedFont: getDefaultFontForLanguage(language),
    };
    const newResumeId = resumeStore.createResume({ name: resumeName, language, settings: seededSettings });
    resumeStore.setActiveResume(newResumeId);
    showCreateModal.value = false;
    toast.success(t('resumes.toast.created').replace('{name}', resumeName));
    if (navigateToBuilder) {
        router.push(localePath('/builder'));
    }
};
const editResume = (id: string) => {
    resumeStore.setActiveResume(id);
    router.push(localePath('/builder'));
};
const showCopyResumeModal = (id: string) => {
    const resume = resumeStore.resumesList.find(r => r.id === id);
    if (resume) {
        resumeToCopy.value = resume;
        showCopyModal.value = true;
    }
};
const handleCopyResume = (name: string, navigateToBuilder: boolean) => {
    if (resumeToCopy.value) {
        const resumeName = name.trim() || getDefaultResumeName();
        const newResumeId = resumeStore.duplicateResume(resumeToCopy.value.id, resumeName);
        if (newResumeId) {
            resumeStore.setActiveResume(newResumeId);
            showCopyModal.value = false;
            resumeToCopy.value = null;
            if (navigateToBuilder) {
                router.push(localePath('/builder'));
            }
        }
    }
};
const deleteResume = async (id: string) => {
    const { toast } = await import('vue-sonner');
    const resume = resumeStore.resumesList.find(r => r.id === id);
    const resumeName = resume?.name || 'this resume';
    const confirmed = await confirmation.confirm({
        title: t('resumes.modals.delete.title'),
        message: t('resumes.modals.delete.message').replace('{name}', resumeName),
        confirmText: t('resumes.modals.delete.confirmButton'),
        cancelText: t('resumes.modals.cancel'),
    });
    if (confirmed) {
        resumeStore.deleteResume(id);
        toast.success(t('resumes.toast.deleted').replace('{name}', resumeName));
    }
};
const clearSearch = () => {
    searchQuery.value = '';
};
const triggerImport = () => {
    importInputRef.value?.click();
};
const handleExportModal = () => {
    showExportModal.value = true;
};
const handleExport = (resumeIds: string[]) => {
    exportResumes(resumeIds);
    showExportModal.value = false;
};
const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await parseImportFile(file);
    if (result.success && result.previews) {
        importPreviews.value = result.previews;
        showImportModal.value = true;
    }
    else {
        console.error('Failed to parse file:', result.error);
    }
    input.value = '';
};
const handleImportConfirm = (selectedIndexes: number[]) => {
    const importedCount = importSelectedResumes(importPreviews.value, selectedIndexes);
    console.log(`Successfully imported ${importedCount} resume${importedCount !== 1 ? 's' : ''}`);
    showImportModal.value = false;
    importPreviews.value = [];
};
useHead({
    title: t('resumes.pageTitle'),
    meta: [
        {
            name: 'description',
            content: t('resumes.pageDescription'),
        },
        {
            name: 'keywords',
            content: 'resume management, multiple resumes, organize resumes, duplicate resume, resume dashboard, free resume storage',
        },
        {
            name: 'robots',
            content: 'index, follow',
        },
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:site_name',
            content: 'NewCv',
        },
        {
            property: 'og:title',
            content: t('resumes.pageTitle'),
        },
        {
            property: 'og:description',
            content: t('resumes.pageDescription'),
        },
        {
            property: 'og:url',
            content: 'https://newcv.com/resumes',
        },
        {
            property: 'og:image',
            content: 'https://newcv.com/og-image.png',
        },
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: t('resumes.pageTitle'),
        },
        {
            name: 'twitter:description',
            content: t('resumes.pageDescription'),
        },
        {
            name: 'twitter:image',
            content: 'https://newcv.com/og-image.png',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://newcv.com/resumes',
        },
    ],
});
</script>

<template>
    <div class="px-4 py-8 pb-20">
        <div class="container mx-auto">
            <ResumesHeader
                v-model:search-query="searchQuery"
                :resume-count="resumeCount"
                :filtered-count="filteredCount"
                @import="triggerImport"
                @export="handleExportModal"
                @create="createNewResume"
            />
            <ClientOnly>
                <div
                    v-if="resumeStore.isLoading"
                    class="flex items-center justify-center py-12"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div class="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" />
                        <p class="text-gray-600">
                            {{ $t('resumes.status.loading') }}
                        </p>
                    </div>
                </div>
                <div
                    v-else-if="resumeStore.error"
                    class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                >
                    <div class="flex items-start gap-3">
                        <div class="w-5 h-5 text-red-600 mt-0.5">
                            ⚠️
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-red-900 mb-1">
                                {{ $t('resumes.status.failed') }}
                            </h3>
                            <p class="text-sm text-red-700">
                                {{ resumeStore.error }}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                class="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                                @click="resumeStore.initialize()"
                            >
                                {{ $t('common.tryAgain') }}
                            </Button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <ResumesEmptyState
                        v-if="resumeCount === 0"
                        type="no-resumes"
                        @create="createNewResume"
                    />
                    <ResumesEmptyState
                        v-else-if="filteredCount === 0 && searchQuery"
                        type="no-search-results"
                        :search-query="searchQuery"
                        @create="createNewResume"
                        @clear-search="clearSearch"
                    />
                    <ResumesGrid
                        v-else
                        :resumes="resumes"
                        :active-resume-id="resumeStore.activeResumeId"
                        @edit="editResume"
                        @copy="showCopyResumeModal"
                        @export="exportSingleResume"
                        @delete="deleteResume"
                    />
                </div>
                <CreateResumeModal
                    :is-open="showCreateModal"
                    @close="showCreateModal = false"
                    @confirm="handleCreateResume"
                />
                <CopyResumeModal
                    :is-open="showCopyModal"
                    :resume-name="resumeToCopy ? `${resumeToCopy.name} (Copy)` : ''"
                    @close="showCopyModal = false; resumeToCopy = null"
                    @confirm="handleCopyResume"
                />
                <ExportModal
                    :is-open="showExportModal"
                    :resumes="resumes"
                    @close="showExportModal = false"
                    @export="handleExport"
                />
                <ImportConfirmationModal
                    :is-open="showImportModal"
                    :resumes-to-import="importPreviews"
                    @close="showImportModal = false; importPreviews = []"
                    @import="handleImportConfirm"
                />

                <ConfirmationModal
                    :cancel-text="confirmation.cancelText.value"
                    :confirm-text="confirmation.confirmText.value"
                    :is-open="confirmation.isOpen.value"
                    :message="confirmation.message.value"
                    :title="confirmation.title.value"
                    @cancel="confirmation.handleCancel"
                    @confirm="confirmation.handleConfirm"
                />
                <input
                    ref="importInputRef"
                    accept=".json"
                    class="hidden"
                    type="file"
                    @change="handleFileSelect"
                >
            </ClientOnly>
        </div>
    </div>
</template>
