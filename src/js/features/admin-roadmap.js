/**
 * Feature: Admin Roadmap Manager
 * Firestore collection: roadmap_blocks
 */

import { ROADMAP_BLOCKS_COLLECTION, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/subjects-config.js';

// ---------------------------------------------------------------------------
// Firestore Helper
// ---------------------------------------------------------------------------

async function loadBlocksForSubject(subjectId, db) {
    if (!db || !subjectId) return [];
    let snapshot;
    try {
        snapshot = await db.collection(ROADMAP_BLOCKS_COLLECTION)
            .where('subjectId', '==', subjectId).orderBy('order').get();
    } catch {
        try {
            snapshot = await db.collection(ROADMAP_BLOCKS_COLLECTION)
                .where('subjectId', '==', subjectId).get();
        } catch { return []; }
    }
    if (!snapshot || snapshot.empty) return [];
    const blocks = [];
    snapshot.forEach((doc) => blocks.push({ id: doc.id, ...doc.data() }));
    blocks.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return blocks;
}

function esc(v) {
    return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

const TYPE_ICONS  = { video: '🎬', pdf: '📄', text: '📝', image: '🖼️' };
const TYPE_LABELS = { video: 'فيديو', pdf: 'PDF', text: 'نص', image: 'صورة' };

// ---------------------------------------------------------------------------
// HTML Builders
// ---------------------------------------------------------------------------

function renderTypeFields(block = {}) {
    const t = block.type || 'text';
    return `
    <div id="rmVideoFields" class="roadmap-type-fields" style="display:${t==='video'?'block':'none'}">
        <div class="subject-form-field">
            <label>🔗 رابط يوتيوب</label>
            <input id="rmYoutubeUrl" type="url" placeholder="https://youtube.com/watch?v=..." value="${esc(block.youtubeUrl||'')}">
        </div>
    </div>
    <div id="rmPdfFields" class="roadmap-type-fields" style="display:${t==='pdf'?'block':'none'}">
        <div class="img-source-tabs">
            <button type="button" class="img-tab-btn active" onclick="rmSetPdfTab('url')">🔗 رابط URL</button>
            <button type="button" class="img-tab-btn" onclick="rmSetPdfTab('upload')">📁 رفع من جهازك</button>
        </div>
        <div id="rmPdfUrlPanel" class="subject-form-field">
            <label>🔗 رابط PDF</label>
            <input id="rmPdfUrl" type="url" placeholder="https://..." value="${esc(block.pdfUrl||'')}">
        </div>
        <div id="rmPdfUploadPanel" class="subject-form-field" style="display:none">
            <label>اختر ملف PDF من جهازك</label>
            <input id="rmPdfFile" type="file" accept="application/pdf" onchange="rmOnPdfFileChange(this)">
            <p id="rmPdfUploadStatus" class="rm-upload-status"></p>
        </div>
    </div>
    <div id="rmImageFields" class="roadmap-type-fields" style="display:${t==='image'?'block':'none'}">
        <div class="img-source-tabs">
            <button type="button" class="img-tab-btn active" onclick="rmSetImgTab('url')">🔗 رابط URL</button>
            <button type="button" class="img-tab-btn" onclick="rmSetImgTab('upload')">📁 رفع من جهازك</button>
        </div>
        <div id="rmImgUrlPanel" class="subject-form-field">
            <label>رابط الصورة المباشر</label>
            <input id="rmImageUrl" type="url" placeholder="https://...jpg" value="${esc(block.imageUrl||'')}">
        </div>
        <div id="rmImgUploadPanel" class="subject-form-field" style="display:none">
            <label>اختر صورة من جهازك</label>
            <input id="rmImageFile" type="file" accept="image/*" onchange="rmOnImageFileChange(this)">
            <div id="rmImgPreview" class="rm-img-preview" style="display:none"><img id="rmPreviewImg" alt="معاينة"></div>
            <p id="rmUploadStatus" class="rm-upload-status"></p>
        </div>
        <div class="subject-form-field">
            <label>تعليق الصورة (اختياري)</label>
            <input id="rmCaption" type="text" placeholder="وصف مختصر..." value="${esc(block.caption||'')}">
        </div>
    </div>
    <div id="rmTextFields" class="roadmap-type-fields" style="display:${t!=='video'&&t!=='pdf'&&t!=='image'?'block':'none'}">
        <div class="subject-form-field" style="grid-column:1/-1">
            <label>📝 المحتوى (HTML مسموح)</label>
            <textarea id="rmContent" rows="5">${esc(block.content||'')}</textarea>
        </div>
    </div>`;
}

function renderAddForm(nextOrder) {
    return `
    <div class="roadmap-add-form">
        <h3><i class="fas fa-plus-circle"></i> إضافة خطوة جديدة</h3>
        <form id="rmAddForm" onsubmit="rmHandleAdd(event)">
            <div class="subject-form-grid">
                <div class="subject-form-field">
                    <label>نوع المحتوى <small>*</small></label>
                    <select id="rmType" onchange="rmSwitchTypeFields(this.value)" required>
                        <option value="text">📝 نص</option>
                        <option value="video">🎬 فيديو</option>
                        <option value="pdf">📄 PDF</option>
                        <option value="image">🖼️ صورة</option>
                    </select>
                </div>
                <div class="subject-form-field">
                    <label>العنوان <small>*</small></label>
                    <input id="rmTitle" type="text" placeholder="عنوان الخطوة..." required>
                </div>
                <div class="subject-form-field">
                    <label>الترتيب</label>
                    <input id="rmOrder" type="number" min="1" value="${nextOrder}">
                </div>
                <div class="subject-form-field">
                    <label>الحالة</label>
                    <select id="rmIsActive">
                        <option value="true">✅ نشط</option>
                        <option value="false">🔒 مخفي</option>
                    </select>
                </div>
            </div>
            ${renderTypeFields()}
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap">
                <button type="submit" id="rmAddBtn" class="admin-tool-btn"
                        style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)">
                    <i class="fas fa-plus"></i> إضافة الخطوة
                </button>
                <span id="rmAddStatus" style="font-size:0.88rem"></span>
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
                            onclick="rmHandleMove('${esc(block.id)}','up')" ${isFirst?'disabled':''}>⬆️</button>
                    <button class="admin-tool-btn" style="padding:4px 8px;font-size:0.75rem"
                            onclick="rmHandleMove('${esc(block.id)}','down')" ${isLast?'disabled':''}>⬇️</button>
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
                        onclick="rmHandleEdit('${esc(block.id)}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="admin-tool-btn"
                        style="padding:5px 10px;font-size:0.8rem;background:rgba(255,107,107,0.2);border-color:rgba(255,107,107,0.4)"
                        onclick="rmHandleDelete('${esc(block.id)}','${esc(block.title||block.id)}')">
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
                <select id="rmEditType_${id}" onchange="rmSwitchEditTypeFields('${id}',this.value)">
                    <option value="text"  ${t==='text' ?'selected':''}>📝 نص</option>
                    <option value="video" ${t==='video'?'selected':''}>🎬 فيديو</option>
                    <option value="pdf"   ${t==='pdf'  ?'selected':''}>📄 PDF</option>
                    <option value="image" ${t==='image'?'selected':''}>🖼️ صورة</option>
                </select>
            </div>
            <div class="subject-form-field">
                <label>العنوان</label>
                <input id="rmEditTitle_${id}" type="text" value="${esc(block.title||'')}">
            </div>
            <div class="subject-form-field">
                <label>الترتيب</label>
                <input id="rmEditOrder_${id}" type="number" min="1" value="${esc(block.order)}">
            </div>
            <div class="subject-form-field">
                <label>الحالة</label>
                <select id="rmEditIsActive_${id}">
                    <option value="true"  ${block.isActive!==false?'selected':''}>✅ نشط</option>
                    <option value="false" ${block.isActive===false?'selected':''}>🔒 مخفي</option>
                </select>
            </div>
        </div>
        <div id="rmEditVideoFields_${id}" class="roadmap-type-fields" style="display:${t==='video'?'block':'none'}">
            <div class="subject-form-field">
                <label>🔗 رابط يوتيوب</label>
                <input id="rmEditYoutubeUrl_${id}" type="url" value="${esc(block.youtubeUrl||'')}">
            </div>
        </div>
        <div id="rmEditPdfFields_${id}" class="roadmap-type-fields" style="display:${t==='pdf'?'block':'none'}">
            <div class="img-source-tabs">
                <button type="button" class="img-tab-btn active" onclick="rmSetEditPdfTab('${id}','url')">🔗 رابط URL</button>
                <button type="button" class="img-tab-btn" onclick="rmSetEditPdfTab('${id}','upload')">📁 رفع من جهازك</button>
            </div>
            <div id="rmEditPdfUrlPanel_${id}" class="subject-form-field">
                <label>🔗 رابط PDF</label>
                <input id="rmEditPdfUrl_${id}" type="url" value="${esc(block.pdfUrl||'')}">
            </div>
            <div id="rmEditPdfUploadPanel_${id}" class="subject-form-field" style="display:none">
                <label>اختر ملف PDF جديد</label>
                <input id="rmEditPdfFile_${id}" type="file" accept="application/pdf" onchange="rmOnEditPdfFileChange(this,'${id}')">
                <p id="rmEditPdfUploadStatus_${id}" class="rm-upload-status"></p>
            </div>
        </div>
        <div id="rmEditImageFields_${id}" class="roadmap-type-fields" style="display:${t==='image'?'block':'none'}">
            <div class="img-source-tabs">
                <button type="button" class="img-tab-btn active" onclick="rmSetEditImgTab('${id}','url')">🔗 رابط URL</button>
                <button type="button" class="img-tab-btn" onclick="rmSetEditImgTab('${id}','upload')">📁 رفع من جهازك</button>
            </div>
            <div id="rmEditImgUrlPanel_${id}" class="subject-form-field">
                <label>رابط الصورة المباشر</label>
                <input id="rmEditImageUrl_${id}" type="url" value="${esc(block.imageUrl||'')}">
            </div>
            <div id="rmEditImgUploadPanel_${id}" class="subject-form-field" style="display:none">
                <label>اختر صورة جديدة</label>
                <input id="rmEditImageFile_${id}" type="file" accept="image/*" onchange="rmOnEditImageFileChange(this,'${id}')">
                <div id="rmEditImgPreview_${id}" class="rm-img-preview" style="display:none"><img id="rmEditPreviewImg_${id}" alt="معاينة"></div>
                <p id="rmEditUploadStatus_${id}" class="rm-upload-status"></p>
            </div>
            <div class="subject-form-field">
                <label>تعليق الصورة (اختياري)</label>
                <input id="rmEditCaption_${id}" type="text" value="${esc(block.caption||'')}">
            </div>
        </div>
        <div id="rmEditTextFields_${id}" class="roadmap-type-fields" style="display:${t!=='video'&&t!=='pdf'&&t!=='image'?'block':'none'}">
            <div class="subject-form-field" style="grid-column:1/-1">
                <label>📝 المحتوى</label>
                <textarea id="rmEditContent_${id}" rows="5">${esc(block.content||'')}</textarea>
            </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
            <button class="admin-tool-btn"
                    style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)"
                    onclick="rmHandleSaveEdit('${id}')">
                <i class="fas fa-save"></i> حفظ التعديل
            </button>
            <button class="admin-tool-btn"
                    style="background:rgba(148,163,184,0.1);border-color:rgba(148,163,184,0.25)"
                    onclick="rmHandleCancelEdit('${id}')">
                <i class="fas fa-times"></i> إلغاء
            </button>
            <span id="rmEditStatus_${id}" style="font-size:0.88rem;align-self:center"></span>
        </div>
    </div>`;
}

function renderAdminRoadmapPanel(subjects, selectedSubjectId, blocks) {
    const subjectOptions = subjects.map((s) =>
        `<option value="${esc(s.id)}" ${s.id===selectedSubjectId?'selected':''}>${esc(s.nameAr||s.id)}</option>`
    ).join('');

    const blocksHtml = blocks.length
        ? blocks.map((b, i) => renderBlockRow(b, i===0, i===blocks.length-1)).join('')
        : '<div class="admin-empty"><i class="fas fa-map"></i> لا توجد خطوات — أضف أول خطوة أعلاه</div>';

    return `
    <div class="roadmap-admin-panel">
        <div class="roadmap-subject-selector">
            <label style="color:rgba(255,255,255,0.55);font-size:0.85rem;font-weight:600">اختر المادة</label>
            <select class="roadmap-subject-select" onchange="rmHandleSubjectChange(this.value)">
                ${subjects.length ? subjectOptions : '<option value="">لا توجد مواد — أضف مادة أولاً</option>'}
            </select>
        </div>
        ${selectedSubjectId ? renderAddForm(blocks.length + 1) : ''}
        <div class="roadmap-blocks-list" id="rmBlocksList">
            ${selectedSubjectId ? blocksHtml : '<div class="admin-empty">اختر مادة أولاً</div>'}
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
let _blocks = [];

async function reloadAndRender() {
    _blocks = await loadBlocksForSubject(_selectedSubjectId, _db);
    if (_containerEl) {
        _containerEl.innerHTML = renderAdminRoadmapPanel(_subjects, _selectedSubjectId, _blocks);
    }
}

// ---------------------------------------------------------------------------
// Handlers (exposed to window.*)
// ---------------------------------------------------------------------------

async function rmHandleSubjectChange(subjectId) {
    _selectedSubjectId = subjectId;
    await reloadAndRender();
}

function rmSwitchTypeFields(type) {
    [['video','rmVideoFields'],['pdf','rmPdfFields'],['image','rmImageFields'],['text','rmTextFields']].forEach(([k,id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = k===type ? 'block' : 'none';
    });
}

function rmSwitchEditTypeFields(blockId, type) {
    [['video',`rmEditVideoFields_${blockId}`],['pdf',`rmEditPdfFields_${blockId}`],['image',`rmEditImageFields_${blockId}`],['text',`rmEditTextFields_${blockId}`]]
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

function rmSetImgTab(mode) {
    document.getElementById('rmImgUrlPanel').style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById('rmImgUploadPanel').style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll('#rmImageFields .img-tab-btn').forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

function rmSetEditImgTab(blockId, mode) {
    document.getElementById(`rmEditImgUrlPanel_${blockId}`).style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById(`rmEditImgUploadPanel_${blockId}`).style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll(`#rmEditImageFields_${blockId} .img-tab-btn`).forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

// --- PDF source tab toggles ---

function rmSetPdfTab(mode) {
    document.getElementById('rmPdfUrlPanel').style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById('rmPdfUploadPanel').style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll('#rmPdfFields .img-tab-btn').forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

function rmSetEditPdfTab(blockId, mode) {
    document.getElementById(`rmEditPdfUrlPanel_${blockId}`).style.display    = mode === 'url'    ? '' : 'none';
    document.getElementById(`rmEditPdfUploadPanel_${blockId}`).style.display = mode === 'upload' ? '' : 'none';
    document.querySelectorAll(`#rmEditPdfFields_${blockId} .img-tab-btn`).forEach((btn, i) =>
        btn.classList.toggle('active', (mode === 'url' && i === 0) || (mode === 'upload' && i === 1))
    );
}

// --- Upload handlers (auto-upload on file select, fill URL input) ---

async function rmOnImageFileChange(input) {
    const file = input.files?.[0];
    if (!file) return;

    const previewDiv = document.getElementById('rmImgPreview');
    const previewImg = document.getElementById('rmPreviewImg');
    if (previewDiv && previewImg) { previewImg.src = URL.createObjectURL(file); previewDiv.style.display = ''; }

    const status = document.getElementById('rmUploadStatus');
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById('rmImageUrl');
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — ستُحفظ الصورة عند إضافة الخطوة'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function rmOnEditImageFileChange(input, blockId) {
    const file = input.files?.[0];
    if (!file) return;

    const previewDiv = document.getElementById(`rmEditImgPreview_${blockId}`);
    const previewImg = document.getElementById(`rmEditPreviewImg_${blockId}`);
    if (previewDiv && previewImg) { previewImg.src = URL.createObjectURL(file); previewDiv.style.display = ''; }

    const status = document.getElementById(`rmEditUploadStatus_${blockId}`);
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById(`rmEditImageUrl_${blockId}`);
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — اضغط حفظ التعديل لتطبيقه'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function rmOnPdfFileChange(input) {
    const file = input.files?.[0];
    if (!file) return;

    const status = document.getElementById('rmPdfUploadStatus');
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById('rmPdfUrl');
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — سيُحفظ الرابط عند الإضافة'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function rmOnEditPdfFileChange(input, blockId) {
    const file = input.files?.[0];
    if (!file) return;

    const status = document.getElementById(`rmEditPdfUploadStatus_${blockId}`);
    if (status) { status.textContent = '⬆️ جاري الرفع...'; status.style.color = '#94a3b8'; }

    try {
        const url = await uploadToCloudinary(file);
        const urlInput = document.getElementById(`rmEditPdfUrl_${blockId}`);
        if (urlInput) urlInput.value = url;
        if (status) { status.textContent = '✅ تم الرفع — اضغط حفظ التعديل لتطبيقه'; status.style.color = '#8effbf'; }
    } catch (err) {
        if (status) { status.textContent = `❌ ${err.message}`; status.style.color = '#ff8f8f'; }
    }
}

async function rmHandleAdd(event) {
    event.preventDefault();
    const btn = document.getElementById('rmAddBtn');
    const statusEl = document.getElementById('rmAddStatus');
    const type  = document.getElementById('rmType')?.value;
    const title = document.getElementById('rmTitle')?.value.trim();
    const order = parseInt(document.getElementById('rmOrder')?.value) || (_blocks.length + 1);
    const isActive = document.getElementById('rmIsActive')?.value !== 'false';

    if (!title || !type) {
        if (statusEl) { statusEl.textContent = '⚠️ النوع والعنوان مطلوبان'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { subjectId: _selectedSubjectId, type, title, order, isActive };
    if (type === 'video') data.youtubeUrl = document.getElementById('rmYoutubeUrl')?.value.trim() || '';
    else if (type === 'pdf') data.pdfUrl  = document.getElementById('rmPdfUrl')?.value.trim() || '';
    else if (type === 'image') {
        data.imageUrl = document.getElementById('rmImageUrl')?.value.trim() || '';
        data.caption  = document.getElementById('rmCaption')?.value.trim() || '';
    } else data.content = document.getElementById('rmContent')?.value.trim() || '';

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...'; }
    if (statusEl) statusEl.textContent = '';

    try {
        await _db.collection(ROADMAP_BLOCKS_COLLECTION).add(data);
        if (statusEl) { statusEl.textContent = `✅ تمت إضافة "${title}"!`; statusEl.style.color = '#8effbf'; }
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> إضافة الخطوة'; }
    }
}

function rmHandleEdit(blockId) {
    const block = _blocks.find((b) => b.id === blockId);
    if (!block) return;
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) row.outerHTML = renderEditForm(block);
}

function rmHandleCancelEdit(blockId) {
    const block = _blocks.find((b) => b.id === blockId);
    if (!block) return;
    const index = _blocks.indexOf(block);
    const row = document.querySelector(`[data-block-id="${blockId}"]`);
    if (row) row.outerHTML = renderBlockRow(block, index === 0, index === _blocks.length - 1);
}

async function rmHandleSaveEdit(blockId) {
    const type     = document.getElementById(`rmEditType_${blockId}`)?.value;
    const title    = document.getElementById(`rmEditTitle_${blockId}`)?.value.trim();
    const order    = parseInt(document.getElementById(`rmEditOrder_${blockId}`)?.value) || 1;
    const isActive = document.getElementById(`rmEditIsActive_${blockId}`)?.value !== 'false';
    const statusEl = document.getElementById(`rmEditStatus_${blockId}`);

    if (!title) {
        if (statusEl) { statusEl.textContent = '⚠️ العنوان مطلوب'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { type, title, order, isActive };
    if (type === 'video') {
        data.youtubeUrl = document.getElementById(`rmEditYoutubeUrl_${blockId}`)?.value.trim() || '';
        data.pdfUrl = ''; data.imageUrl = ''; data.caption = ''; data.content = '';
    } else if (type === 'pdf') {
        data.pdfUrl = document.getElementById(`rmEditPdfUrl_${blockId}`)?.value.trim() || '';
        data.youtubeUrl = ''; data.imageUrl = ''; data.caption = ''; data.content = '';
    } else if (type === 'image') {
        data.imageUrl = document.getElementById(`rmEditImageUrl_${blockId}`)?.value.trim() || '';
        data.caption  = document.getElementById(`rmEditCaption_${blockId}`)?.value.trim() || '';
        data.youtubeUrl = ''; data.pdfUrl = ''; data.content = '';
    } else {
        data.content = document.getElementById(`rmEditContent_${blockId}`)?.value.trim() || '';
        data.youtubeUrl = ''; data.pdfUrl = ''; data.imageUrl = ''; data.caption = '';
    }

    try {
        await _db.collection(ROADMAP_BLOCKS_COLLECTION).doc(blockId).update(data);
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
    }
}

async function rmHandleDelete(blockId, blockTitle) {
    if (!confirm(`هل أنت متأكد من حذف "${blockTitle}"؟ لا يمكن التراجع.`)) return;
    try {
        await _db.collection(ROADMAP_BLOCKS_COLLECTION).doc(blockId).delete();
        await reloadAndRender();
    } catch (err) { alert(`خطأ في الحذف: ${err.message}`); }
}

async function rmHandleMove(blockId, direction) {
    const index = _blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= _blocks.length) return;

    const blockA = _blocks[index];
    const blockB = _blocks[swapIndex];
    const orderA = Number(blockA.order) || index + 1;
    const orderB = Number(blockB.order) || swapIndex + 1;

    try {
        await Promise.all([
            _db.collection(ROADMAP_BLOCKS_COLLECTION).doc(blockA.id).update({ order: orderB }),
            _db.collection(ROADMAP_BLOCKS_COLLECTION).doc(blockB.id).update({ order: orderA }),
        ]);
        await reloadAndRender();
    } catch (err) { alert(`خطأ في إعادة الترتيب: ${err.message}`); }
}

// ---------------------------------------------------------------------------
// Public Entry Point
// ---------------------------------------------------------------------------

async function initAdminRoadmap(subjects, db, containerEl) {
    _db               = db;
    _subjects         = subjects || [];
    _containerEl      = containerEl;
    _selectedSubjectId = _subjects.length ? _subjects[0].id : '';
    _blocks = _selectedSubjectId ? await loadBlocksForSubject(_selectedSubjectId, _db) : [];

    containerEl.innerHTML = renderAdminRoadmapPanel(_subjects, _selectedSubjectId, _blocks);

    window.rmHandleSubjectChange  = rmHandleSubjectChange;
    window.rmSwitchTypeFields      = rmSwitchTypeFields;
    window.rmSwitchEditTypeFields  = rmSwitchEditTypeFields;
    window.rmSetImgTab             = rmSetImgTab;
    window.rmSetEditImgTab         = rmSetEditImgTab;
    window.rmSetPdfTab             = rmSetPdfTab;
    window.rmSetEditPdfTab         = rmSetEditPdfTab;
    window.rmOnImageFileChange     = rmOnImageFileChange;
    window.rmOnEditImageFileChange = rmOnEditImageFileChange;
    window.rmOnPdfFileChange       = rmOnPdfFileChange;
    window.rmOnEditPdfFileChange   = rmOnEditPdfFileChange;
    window.rmHandleAdd             = rmHandleAdd;
    window.rmHandleEdit            = rmHandleEdit;
    window.rmHandleCancelEdit      = rmHandleCancelEdit;
    window.rmHandleSaveEdit        = rmHandleSaveEdit;
    window.rmHandleDelete          = rmHandleDelete;
    window.rmHandleMove            = rmHandleMove;
}

export { initAdminRoadmap };
