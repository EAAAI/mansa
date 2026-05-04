/**
 * Feature: Admin Summaries Manager
 * Firestore collection: subject_summaries
 */

import { SUMMARIES_COLLECTION, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/subjects-config.js';
import { updateCacheVersion } from '../utils/cache-manager.js';

// ---------------------------------------------------------------------------
// Firestore Helper
// ---------------------------------------------------------------------------

async function loadSummariesForSubject(subjectId, db) {
    if (!db || !subjectId) return [];
    let snapshot;
    try {
        snapshot = await db.collection(SUMMARIES_COLLECTION)
            .where('subjectId', '==', subjectId).orderBy('order').get();
    } catch {
        try {
            snapshot = await db.collection(SUMMARIES_COLLECTION)
                .where('subjectId', '==', subjectId).get();
        } catch { return []; }
    }
    if (!snapshot || snapshot.empty) return [];
    const summaries = [];
    snapshot.forEach((doc) => summaries.push({ id: doc.id, ...doc.data() }));
    summaries.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return summaries;
}

function esc(v) {
    return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

const TYPE_ICONS  = { pdf: '📄', text: '📝', image: '🖼️' };
const TYPE_LABELS = { pdf: 'PDF', text: 'نص', image: 'صورة' };

// ---------------------------------------------------------------------------
// HTML Builders
// ---------------------------------------------------------------------------

function renderTypeFields(block = {}) {
    const t = block.type || 'text';
    return `
    <div id="asPdfFields" class="roadmap-type-fields" style="display:${t==='pdf'?'block':'none'}">
        <div class="img-source-tabs">
            <button type="button" class="img-tab-btn active" onclick="asSetPdfTab('url')">🔗 رابط URL</button>
            <button type="button" class="img-tab-btn" onclick="asSetPdfTab('upload')">📁 رفع من جهازك</button>
        </div>
        <div id="asPdfUrlPanel" class="subject-form-field">
            <label>🔗 رابط PDF</label>
            <input id="asPdfUrl" type="url" placeholder="https://..." value="${esc(block.pdfUrl||'')}">
        </div>
        <div id="asPdfUploadPanel" class="subject-form-field" style="display:none">
            <label>اختر ملف PDF من جهازك</label>
            <input id="asPdfFile" type="file" accept="application/pdf" onchange="asOnPdfFileChange(this)">
            <p id="asPdfUploadStatus" class="rm-upload-status"></p>
        </div>
    </div>
    <div id="asImageFields" class="roadmap-type-fields" style="display:${t==='image'?'block':'none'}">
        <div class="img-source-tabs">
            <button type="button" class="img-tab-btn active" onclick="asSetImgTab('url')">🔗 رابط URL</button>
            <button type="button" class="img-tab-btn" onclick="asSetImgTab('upload')">📁 رفع من جهازك</button>
        </div>
        <div id="asImgUrlPanel" class="subject-form-field">
            <label>رابط الصورة المباشر</label>
            <input id="asImageUrl" type="url" placeholder="https://...jpg" value="${esc(block.imageUrl||'')}">
        </div>
        <div id="asImgUploadPanel" class="subject-form-field" style="display:none">
            <label>اختر صورة من جهازك</label>
            <input id="asImageFile" type="file" accept="image/*" onchange="asOnImageFileChange(this)">
            <div id="asImgPreview" class="rm-img-preview" style="display:none"><img id="asPreviewImg" alt="معاينة"></div>
            <p id="asUploadStatus" class="rm-upload-status"></p>
        </div>
        <div class="subject-form-field">
            <label>تعليق الصورة (اختياري)</label>
            <input id="asCaption" type="text" placeholder="وصف مختصر..." value="${esc(block.caption||'')}">
        </div>
    </div>
    <div id="asTextFields" class="roadmap-type-fields" style="display:${t!=='pdf'&&t!=='image'?'block':'none'}">
        <div class="subject-form-field" style="grid-column:1/-1">
            <label>📝 المحتوى (HTML مسموح)</label>
            <textarea id="asContent" rows="5">${esc(block.content||'')}</textarea>
        </div>
    </div>`;
}

function renderAddForm(nextOrder) {
    return `
    <div class="roadmap-add-form">
        <h3><i class="fas fa-plus-circle"></i> إضافة ملخص جديد</h3>
        <form id="asAddForm" onsubmit="asHandleAdd(event)">
            <div class="subject-form-grid">
                <div class="subject-form-field">
                    <label>نوع المحتوى <small>*</small></label>
                    <select id="asType" onchange="asSwitchTypeFields(this.value)" required>
                        <option value="text">📝 نص</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="image">🖼️ صورة</option>
                    </select>
                </div>
                <div class="subject-form-field">
                    <label>العنوان <small>*</small></label>
                    <input id="asTitle" type="text" placeholder="عنوان الملخص..." required>
                </div>
                <div class="subject-form-field">
                    <label>الترتيب</label>
                    <input id="asOrder" type="number" min="1" value="${nextOrder}">
                </div>
                <div class="subject-form-field">
                    <label>الحالة</label>
                    <select id="asIsActive">
                        <option value="true">✅ نشط</option>
                        <option value="false">🔒 مخفي</option>
                    </select>
                </div>
            </div>
            ${renderTypeFields()}
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap">
                <button type="submit" id="asAddBtn" class="admin-tool-btn"
                        style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)">
                    <i class="fas fa-plus"></i> إضافة الملخص
                </button>
                <span id="asAddStatus" style="font-size:0.88rem"></span>
            </div>
        </form>
    </div>`;
}

function renderBlockRow(block, isFirst, isLast) {
    const isActive = block.isActive !== false;
    return `
    <div class="roadmap-block-row admin-card" data-block-id="${esc(block.id)}">
        <div class="admin-card-header">
            <div style="display:flex;align-items:center;gap:10px">
                <div class="roadmap-block-move-btns">
                    <button class="admin-tool-btn" style="padding:4px 8px;font-size:0.75rem"
                            onclick="asHandleMove('${esc(block.id)}','up')" ${isFirst?'disabled':''}>⬆️</button>
                    <button class="admin-tool-btn" style="padding:4px 8px;font-size:0.75rem"
                            onclick="asHandleMove('${esc(block.id)}','down')" ${isLast?'disabled':''}>⬇️</button>
                </div>
                <span style="font-size:1.4rem">${TYPE_ICONS[block.type]||'📝'}</span>
                <div>
                    <strong>${esc(block.title||block.id)}</strong>
                    <span style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-right:6px">${TYPE_LABELS[block.type]||block.type}</span>
                    <br><code style="font-size:0.75rem;color:rgba(255,255,255,0.35)">ترتيب: ${esc(block.order)}</code>
                </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span class="admin-card-type" style="background:${isActive?'rgba(56,239,125,0.12)':'rgba(255,107,107,0.12)'};color:${isActive?'#38ef7d':'#ff6b6b'}">
                    ${isActive?'نشط':'مخفي'}
                </span>
                <button class="admin-tool-btn" style="padding:5px 10px;font-size:0.8rem"
                        onclick="asHandleEdit('${esc(block.id)}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="admin-tool-btn"
                        style="padding:5px 10px;font-size:0.8rem;background:rgba(255,107,107,0.2);border-color:rgba(255,107,107,0.4)"
                        onclick="asHandleDelete('${esc(block.id)}','${esc(block.title||block.id)}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    </div>`;
}

function renderEditForm(block) {
    const t = block.type || 'text';
    const id = esc(block.id);
    return `
    <div class="roadmap-block-row roadmap-edit-form admin-card" data-block-id="${id}">
        <h4 style="margin-bottom:14px;color:#c9f4ff"><i class="fas fa-edit"></i> تعديل: ${esc(block.title)}</h4>
        <div class="subject-form-grid">
            <div class="subject-form-field">
                <label>نوع المحتوى</label>
                <select id="asEditType_${id}" onchange="asSwitchEditTypeFields('${id}',this.value)">
                    <option value="text"  ${t==='text' ?'selected':''}>📝 نص</option>
                    <option value="pdf"   ${t==='pdf'  ?'selected':''}>📄 PDF</option>
                    <option value="image" ${t==='image'?'selected':''}>🖼️ صورة</option>
                </select>
            </div>
            <div class="subject-form-field">
                <label>العنوان</label>
                <input id="asEditTitle_${id}" type="text" value="${esc(block.title||'')}">
            </div>
            <div class="subject-form-field">
                <label>الترتيب</label>
                <input id="asEditOrder_${id}" type="number" min="1" value="${esc(block.order)}">
            </div>
            <div class="subject-form-field">
                <label>الحالة</label>
                <select id="asEditIsActive_${id}">
                    <option value="true"  ${block.isActive!==false?'selected':''}>✅ نشط</option>
                    <option value="false" ${block.isActive===false?'selected':''}>🔒 مخفي</option>
                </select>
            </div>
        </div>
        <div id="asEditPdfFields_${id}" class="roadmap-type-fields" style="display:${t==='pdf'?'block':'none'}">
            <div class="img-source-tabs">
                <button type="button" class="img-tab-btn active" onclick="asSetEditPdfTab('${id}','url')">🔗 رابط URL</button>
                <button type="button" class="img-tab-btn" onclick="asSetEditPdfTab('${id}','upload')">📁 رفع من جهازك</button>
            </div>
            <div id="asEditPdfUrlPanel_${id}" class="subject-form-field">
                <label>🔗 رابط PDF</label>
                <input id="asEditPdfUrl_${id}" type="url" value="${esc(block.pdfUrl||'')}">
            </div>
            <div id="asEditPdfUploadPanel_${id}" class="subject-form-field" style="display:none">
                <label>اختر ملف PDF جديد</label>
                <input id="asEditPdfFile_${id}" type="file" accept="application/pdf" onchange="asOnEditPdfFileChange(this,'${id}')">
                <p id="asEditPdfUploadStatus_${id}" class="rm-upload-status"></p>
            </div>
        </div>
        <div id="asEditImageFields_${id}" class="roadmap-type-fields" style="display:${t==='image'?'block':'none'}">
            <div class="img-source-tabs">
                <button type="button" class="img-tab-btn active" onclick="asSetEditImgTab('${id}','url')">🔗 رابط URL</button>
                <button type="button" class="img-tab-btn" onclick="asSetEditImgTab('${id}','upload')">📁 رفع من جهازك</button>
            </div>
            <div id="asEditImgUrlPanel_${id}" class="subject-form-field">
                <label>رابط الصورة المباشر</label>
                <input id="asEditImageUrl_${id}" type="url" value="${esc(block.imageUrl||'')}">
            </div>
            <div id="asEditImgUploadPanel_${id}" class="subject-form-field" style="display:none">
                <label>اختر صورة جديدة</label>
                <input id="asEditImageFile_${id}" type="file" accept="image/*" onchange="asOnEditImageFileChange(this,'${id}')">
                <div id="asEditImgPreview_${id}" class="rm-img-preview" style="display:none"><img id="asEditPreviewImg_${id}" alt="معاينة"></div>
                <p id="asEditUploadStatus_${id}" class="rm-upload-status"></p>
            </div>
            <div class="subject-form-field">
                <label>تعليق الصورة (اختياري)</label>
                <input id="asEditCaption_${id}" type="text" value="${esc(block.caption||'')}">
            </div>
        </div>
        <div id="asEditTextFields_${id}" class="roadmap-type-fields" style="display:${t!=='pdf'&&t!=='image'?'block':'none'}">
            <div class="subject-form-field" style="grid-column:1/-1">
                <label>📝 المحتوى</label>
                <textarea id="asEditContent_${id}" rows="5">${esc(block.content||'')}</textarea>
            </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
            <button class="admin-tool-btn"
                    style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)"
                    onclick="asHandleSaveEdit('${id}')">
                <i class="fas fa-save"></i> حفظ التعديل
            </button>
            <button class="admin-tool-btn"
                    style="background:rgba(148,163,184,0.1);border-color:rgba(148,163,184,0.25)"
                    onclick="asHandleCancelEdit('${id}')">
                <i class="fas fa-times"></i> إلغاء
            </button>
            <span id="asEditStatus_${id}" style="font-size:0.88rem;align-self:center"></span>
        </div>
    </div>`;
}

function renderAdminSummariesPanel(subjects, selectedSubjectId, summaries) {
    const subjectOptions = subjects.map((s) =>
        `<option value="${esc(s.id)}" ${s.id===selectedSubjectId?'selected':''}>${esc(s.nameAr||s.id)}</option>`
    ).join('');

    const summariesHtml = summaries.length
        ? summaries.map((b, i) => renderBlockRow(b, i===0, i===summaries.length-1)).join('')
        : '<div class="admin-empty"><i class="fas fa-file-alt"></i> لا توجد ملخصات — أضف أول ملخص أعلاه</div>';

    return `
    <div class="roadmap-admin-panel">
        <div class="roadmap-subject-selector">
            <label style="color:rgba(255,255,255,0.55);font-size:0.85rem;font-weight:600">اختر المادة</label>
            <select class="roadmap-subject-select" onchange="asHandleSubjectChange(this.value)">
                ${subjects.length ? subjectOptions : '<option value="">لا توجد مواد — أضف مادة أولاً</option>'}
            </select>
        </div>
        ${selectedSubjectId ? renderAddForm(summaries.length + 1) : ''}
        <div class="roadmap-blocks-list" id="asBlocksList">
            ${selectedSubjectId ? summariesHtml : '<div class="admin-empty">اختر مادة أولاً</div>'}
        </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Module State
// ---------------------------------------------------------------------------

let _db = null;
let _containerEl = null;
let _subjects = [];
let _selectedSubjectId = '';
let _summaries = [];

async function reloadAndRender() {
    _summaries = await loadSummariesForSubject(_selectedSubjectId, _db);
    if (_containerEl) {
        _containerEl.innerHTML = renderAdminSummariesPanel(_subjects, _selectedSubjectId, _summaries);
    }
}

// ---------------------------------------------------------------------------
// Handlers (exposed to window.*)
// ---------------------------------------------------------------------------

async function asHandleSubjectChange(subjectId) {
    _selectedSubjectId = subjectId;
    await reloadAndRender();
}

function asSwitchTypeFields(type) {
    [['pdf','asPdfFields'],['image','asImageFields'],['text','asTextFields']].forEach(([k,id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = k===type ? 'block' : 'none';
    });
}

function asSwitchEditTypeFields(blockId, type) {
    [['pdf',`asEditPdfFields_${blockId}`],['image',`asEditImageFields_${blockId}`],['text',`asEditTextFields_${blockId}`]]
        .forEach(([k,id]) => { const el = document.getElementById(id); if (el) el.style.display = k===type?'block':'none'; });
}

// --- Cloudinary upload helper ---

async function uploadToCloudinary(file) {
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
        throw new Error('لم يتم ضبط Cloudinary بعد — عدّل subjects-config.js');
    }
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: form }
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.secure_url;
}

// --- Image source tab toggles ---

function asSetImgTab(mode) {
    document.getElementById('asImgUrlPanel').style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById('asImgUploadPanel').style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll('#asImageFields .img-tab-btn').forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

function asSetEditImgTab(blockId, mode) {
    document.getElementById(`asEditImgUrlPanel_${blockId}`).style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById(`asEditImgUploadPanel_${blockId}`).style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll(`#asEditImageFields_${blockId} .img-tab-btn`).forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

// --- PDF source tab toggles ---

function asSetPdfTab(mode) {
    document.getElementById('asPdfUrlPanel').style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById('asPdfUploadPanel').style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll('#asPdfFields .img-tab-btn').forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

function asSetEditPdfTab(blockId, mode) {
    document.getElementById(`asEditPdfUrlPanel_${blockId}`).style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById(`asEditPdfUploadPanel_${blockId}`).style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll(`#asEditPdfFields_${blockId} .img-tab-btn`).forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

// --- Upload handlers ---

async function asOnImageFileChange(input) {
    const file = input.files?.[0];
    if (!file) return;

    const previewDiv = document.getElementById('asImgPreview');
    const previewImg = document.getElementById('asPreviewImg');
    if (previewDiv && previewImg) { previewImg.src = URL.createObjectURL(file); previewDiv.style.display = ''; }

    const status = document.getElementById('asUploadStatus');
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById('asImageUrl');
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — ستُحفظ الصورة عند إضافة الملخص'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function asOnEditImageFileChange(input, blockId) {
    const file = input.files?.[0];
    if (!file) return;

    const previewDiv = document.getElementById(`asEditImgPreview_${blockId}`);
    const previewImg = document.getElementById(`asEditPreviewImg_${blockId}`);
    if (previewDiv && previewImg) { previewImg.src = URL.createObjectURL(file); previewDiv.style.display = ''; }

    const status = document.getElementById(`asEditUploadStatus_${blockId}`);
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById(`asEditImageUrl_${blockId}`);
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — اضغط حفظ التعديل لتطبيقه'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function asOnPdfFileChange(input) {
    const file = input.files?.[0];
    if (!file) return;

    const status = document.getElementById('asPdfUploadStatus');
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById('asPdfUrl');
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — سيُحفظ الرابط عند الإضافة'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function asOnEditPdfFileChange(input, blockId) {
    const file = input.files?.[0];
    if (!file) return;

    const status = document.getElementById(`asEditPdfUploadStatus_${blockId}`);
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById(`asEditPdfUrl_${blockId}`);
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — اضغط حفظ التعديل لتطبيقه'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function asHandleAdd(event) {
    event.preventDefault();
    const btn = document.getElementById('asAddBtn');
    const statusEl = document.getElementById('asAddStatus');
    const type  = document.getElementById('asType')?.value;
    const title = document.getElementById('asTitle')?.value.trim();
    const order = parseInt(document.getElementById('asOrder')?.value) || (_summaries.length + 1);
    const isActive = document.getElementById('asIsActive')?.value !== 'false';

    if (!title || !type) {
        if (statusEl) { statusEl.textContent = '⚠️ النوع والعنوان مطلوبان'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { subjectId: _selectedSubjectId, type, title, order, isActive };
    if (type === 'pdf') data.pdfUrl  = document.getElementById('asPdfUrl')?.value.trim() || '';
    else if (type === 'image') {
        data.imageUrl = document.getElementById('asImageUrl')?.value.trim() || '';
        data.caption  = document.getElementById('asCaption')?.value.trim() || '';
    } else data.content = document.getElementById('asContent')?.value.trim() || '';

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...'; }
    if (statusEl) statusEl.textContent = '';

    try {
        await _db.collection(SUMMARIES_COLLECTION).add(data);
        if (statusEl) { statusEl.textContent = `✅ تمت إضافة "${title}"!`; statusEl.style.color = '#8effbf'; }
        await updateCacheVersion(_db, 'summaries_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> إضافة الملخص'; }
    }
}

function asHandleEdit(blockId) {
    const block = _summaries.find((b) => b.id === blockId);
    if (!block) return;
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) row.outerHTML = renderEditForm(block);
}

function asHandleCancelEdit(blockId) {
    const block = _summaries.find((b) => b.id === blockId);
    if (!block) return;
    const index = _summaries.indexOf(block);
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) row.outerHTML = renderBlockRow(block, index === 0, index === _summaries.length - 1);
}

async function asHandleSaveEdit(blockId) {
    const type     = document.getElementById(`asEditType_${blockId}`)?.value;
    const title    = document.getElementById(`asEditTitle_${blockId}`)?.value.trim();
    const order    = parseInt(document.getElementById(`asEditOrder_${blockId}`)?.value) || 1;
    const isActive = document.getElementById(`asEditIsActive_${blockId}`)?.value !== 'false';
    const statusEl = document.getElementById(`asEditStatus_${blockId}`);

    if (!title) {
        if (statusEl) { statusEl.textContent = '⚠️ العنوان مطلوب'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { type, title, order, isActive };
    if (type === 'pdf') {
        data.pdfUrl = document.getElementById(`asEditPdfUrl_${blockId}`)?.value.trim() || '';
        data.imageUrl = ''; data.caption = ''; data.content = '';
    } else if (type === 'image') {
        data.imageUrl = document.getElementById(`asEditImageUrl_${blockId}`)?.value.trim() || '';
        data.caption  = document.getElementById(`asEditCaption_${blockId}`)?.value.trim() || '';
        data.pdfUrl = ''; data.content = '';
    } else {
        data.content = document.getElementById(`asEditContent_${blockId}`)?.value.trim() || '';
        data.pdfUrl = ''; data.imageUrl = ''; data.caption = '';
    }

    try {
        await _db.collection(SUMMARIES_COLLECTION).doc(blockId).update(data);
        await updateCacheVersion(_db, 'summaries_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
    }
}

async function asHandleDelete(blockId, blockTitle) {
    if (!confirm(`هل أنت متأكد من حذف "${blockTitle}"؟ لا يمكن التراجع.`)) return;
    try {
        await _db.collection(SUMMARIES_COLLECTION).doc(blockId).delete();
        await updateCacheVersion(_db, 'summaries_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) { alert(`خطأ في الحذف: ${err.message}`); }
}

async function asHandleMove(blockId, direction) {
    const index = _summaries.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= _summaries.length) return;

    const blockA = _summaries[index];
    const blockB = _summaries[swapIndex];
    const orderA = Number(blockA.order) || index + 1;
    const orderB = Number(blockB.order) || swapIndex + 1;

    try {
        await Promise.all([
            _db.collection(SUMMARIES_COLLECTION).doc(blockA.id).update({ order: orderB }),
            _db.collection(SUMMARIES_COLLECTION).doc(blockB.id).update({ order: orderA }),
        ]);
        await updateCacheVersion(_db, 'summaries_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) { alert(`خطأ في إعادة الترتيب: ${err.message}`); }
}

// ---------------------------------------------------------------------------
// Public Entry Point
// ---------------------------------------------------------------------------

async function initAdminSummaries(subjects, db, containerEl) {
    _db               = db;
    _subjects         = subjects || [];
    _containerEl      = containerEl;
    _selectedSubjectId = _subjects.length ? _subjects[0].id : '';
    _summaries = _selectedSubjectId ? await loadSummariesForSubject(_selectedSubjectId, _db) : [];

    containerEl.innerHTML = renderAdminSummariesPanel(_subjects, _selectedSubjectId, _summaries);

    window.asHandleSubjectChange  = asHandleSubjectChange;
    window.asSwitchTypeFields      = asSwitchTypeFields;
    window.asSwitchEditTypeFields  = asSwitchEditTypeFields;
    window.asSetImgTab             = asSetImgTab;
    window.asSetEditImgTab         = asSetEditImgTab;
    window.asSetPdfTab             = asSetPdfTab;
    window.asSetEditPdfTab         = asSetEditPdfTab;
    window.asOnImageFileChange     = asOnImageFileChange;
    window.asOnEditImageFileChange = asOnEditImageFileChange;
    window.asOnPdfFileChange       = asOnPdfFileChange;
    window.asOnEditPdfFileChange   = asOnEditPdfFileChange;
    window.asHandleAdd             = asHandleAdd;
    window.asHandleEdit            = asHandleEdit;
    window.asHandleCancelEdit      = asHandleCancelEdit;
    window.asHandleSaveEdit        = asHandleSaveEdit;
    window.asHandleDelete          = asHandleDelete;
    window.asHandleMove            = asHandleMove;
}

export { initAdminSummaries };
