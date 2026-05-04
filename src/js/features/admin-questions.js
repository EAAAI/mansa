/**
 * Feature: Admin Questions Manager
 * Firestore collection: subject_questions
 */

import { QUESTIONS_COLLECTION } from '../config/subjects-config.js';
import { updateCacheVersion } from '../utils/cache-manager.js';

// ---------------------------------------------------------------------------
// Firestore Helper
// ---------------------------------------------------------------------------

async function loadQuestionsForSubject(subjectId, db) {
    if (!db || !subjectId) return [];
    let snapshot;
    try {
        snapshot = await db.collection(QUESTIONS_COLLECTION)
            .where('subjectId', '==', subjectId).orderBy('order').get();
    } catch {
        try {
            snapshot = await db.collection(QUESTIONS_COLLECTION)
                .where('subjectId', '==', subjectId).get();
        } catch { return []; }
    }
    if (!snapshot || snapshot.empty) return [];
    const questions = [];
    snapshot.forEach((doc) => questions.push({ id: doc.id, ...doc.data() }));
    questions.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return questions;
}

function esc(v) {
    return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

const TYPE_ICONS  = { mcq: '🔘', short: '✍️' };
const TYPE_LABELS = { mcq: 'اختيار من متعدد', short: 'إجابة قصيرة' };

// ---------------------------------------------------------------------------
// HTML Builders
// ---------------------------------------------------------------------------

function renderTypeFields(q = {}) {
    const t = q.type || 'mcq';
    const opts = q.options || ['', '', '', ''];
    const ans = q.answer || '';
    
    // We store actual values, but for the dropdown we need to map to the 4 inputs.
    // If we just store the exact string in `options`, the correct answer must match one.
    // For simplicity in UI, we'll have 4 inputs, and a dropdown showing "الخيار الأول", "الخيار الثاني" etc.
    // When saving, we set the answer to the value of the selected input.
    
    // To populate the select correctly on edit, we find the index of the answer in the options array.
    let ansIndex = opts.indexOf(ans);
    if (ansIndex === -1) ansIndex = 0; // fallback

    return `
    <div id="aqMcqFields" class="roadmap-type-fields" style="display:${t==='mcq'?'block':'none'}">
        <div class="subject-form-grid">
            <div class="subject-form-field">
                <label>الخيار الأول</label>
                <input id="aqOpt0" type="text" value="${esc(opts[0])}">
            </div>
            <div class="subject-form-field">
                <label>الخيار الثاني</label>
                <input id="aqOpt1" type="text" value="${esc(opts[1])}">
            </div>
            <div class="subject-form-field">
                <label>الخيار الثالث</label>
                <input id="aqOpt2" type="text" value="${esc(opts[2])}">
            </div>
            <div class="subject-form-field">
                <label>الخيار الرابع</label>
                <input id="aqOpt3" type="text" value="${esc(opts[3])}">
            </div>
            <div class="subject-form-field" style="grid-column:1/-1">
                <label>الإجابة الصحيحة</label>
                <select id="aqCorrectAns">
                    <option value="0" ${ansIndex===0?'selected':''}>الخيار الأول</option>
                    <option value="1" ${ansIndex===1?'selected':''}>الخيار الثاني</option>
                    <option value="2" ${ansIndex===2?'selected':''}>الخيار الثالث</option>
                    <option value="3" ${ansIndex===3?'selected':''}>الخيار الرابع</option>
                </select>
            </div>
        </div>
    </div>
    <div id="aqShortFields" class="roadmap-type-fields" style="display:${t==='short'?'block':'none'}">
        <div class="subject-form-field" style="grid-column:1/-1">
            <label>الإجابة الصحيحة</label>
            <textarea id="aqShortAns" rows="3">${t==='short' ? esc(q.answer||'') : ''}</textarea>
        </div>
    </div>
    <div class="subject-form-field" style="grid-column:1/-1; margin-top:10px;">
        <label>توضيح الإجابة (اختياري)</label>
        <textarea id="aqExplanation" rows="2" placeholder="يظهر للطالب بعد الإجابة...">${esc(q.explanation||'')}</textarea>
    </div>`;
}

function renderAddForm(nextOrder) {
    return `
    <div class="roadmap-add-form">
        <h3><i class="fas fa-plus-circle"></i> إضافة سؤال جديد</h3>
        <form id="aqAddForm" onsubmit="aqHandleAdd(event)">
            <div class="subject-form-grid">
                <div class="subject-form-field">
                    <label>نوع السؤال <small>*</small></label>
                    <select id="aqType" onchange="aqSwitchTypeFields(this.value)" required>
                        <option value="mcq">🔘 اختيار من متعدد</option>
                        <option value="short">✍️ إجابة قصيرة</option>
                    </select>
                </div>
                <div class="subject-form-field" style="grid-column:1/-1">
                    <label>نص السؤال <small>*</small></label>
                    <input id="aqQuestion" type="text" placeholder="اكتب السؤال هنا..." required>
                </div>
                <div class="subject-form-field">
                    <label>الترتيب</label>
                    <input id="aqOrder" type="number" min="1" value="${nextOrder}">
                </div>
                <div class="subject-form-field">
                    <label>الحالة</label>
                    <select id="aqIsActive">
                        <option value="true">✅ نشط</option>
                        <option value="false">🔒 مخفي</option>
                    </select>
                </div>
            </div>
            ${renderTypeFields()}
            <div style="display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap">
                <button type="submit" id="aqAddBtn" class="admin-tool-btn"
                        style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)">
                    <i class="fas fa-plus"></i> إضافة السؤال
                </button>
                <span id="aqAddStatus" style="font-size:0.88rem"></span>
            </div>
        </form>
    </div>`;
}

function renderQuestionRow(q, isFirst, isLast) {
    const isActive = q.isActive !== false;
    // Truncate question text for display
    let snippet = q.question || 'بدون نص';
    if (snippet.length > 50) snippet = snippet.substring(0, 47) + '...';

    return `
    <div class="roadmap-block-row admin-card" data-question-id="${esc(q.id)}">
        <div class="admin-card-header">
            <div style="display:flex;align-items:center;gap:10px">
                <div class="roadmap-block-move-btns">
                    <button class="admin-tool-btn" style="padding:4px 8px;font-size:0.75rem"
                            onclick="aqHandleMove('${esc(q.id)}','up')" ${isFirst?'disabled':''}>⬆️</button>
                    <button class="admin-tool-btn" style="padding:4px 8px;font-size:0.75rem"
                            onclick="aqHandleMove('${esc(q.id)}','down')" ${isLast?'disabled':''}>⬇️</button>
                </div>
                <span style="font-size:1.4rem">${TYPE_ICONS[q.type]||'❓'}</span>
                <div>
                    <strong>${esc(snippet)}</strong>
                    <span style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-right:6px">${TYPE_LABELS[q.type]||q.type}</span>
                    <br><code style="font-size:0.75rem;color:rgba(255,255,255,0.35)">ترتيب: ${esc(q.order)}</code>
                </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <span class="admin-card-type" style="background:${isActive?'rgba(56,239,125,0.12)':'rgba(255,107,107,0.12)'};color:${isActive?'#38ef7d':'#ff6b6b'}">
                    ${isActive?'نشط':'مخفي'}
                </span>
                <button class="admin-tool-btn" style="padding:5px 10px;font-size:0.8rem"
                        onclick="aqHandleEdit('${esc(q.id)}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="admin-tool-btn"
                        style="padding:5px 10px;font-size:0.8rem;background:rgba(255,107,107,0.2);border-color:rgba(255,107,107,0.4)"
                        onclick="aqHandleDelete('${esc(q.id)}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    </div>`;
}

function renderEditForm(q) {
    const t = q.type || 'mcq';
    const id = esc(q.id);
    const opts = q.options || ['', '', '', ''];
    let ansIndex = opts.indexOf(q.answer);
    if (ansIndex === -1) ansIndex = 0;

    return `
    <div class="roadmap-block-row roadmap-edit-form admin-card" data-question-id="${id}">
        <h4 style="margin-bottom:14px;color:#c9f4ff"><i class="fas fa-edit"></i> تعديل سؤال</h4>
        <div class="subject-form-grid">
            <div class="subject-form-field">
                <label>نوع السؤال</label>
                <select id="aqEditType_${id}" onchange="aqSwitchEditTypeFields('${id}',this.value)">
                    <option value="mcq"  ${t==='mcq' ?'selected':''}>🔘 اختيار من متعدد</option>
                    <option value="short" ${t==='short'?'selected':''}>✍️ إجابة قصيرة</option>
                </select>
            </div>
            <div class="subject-form-field" style="grid-column:1/-1">
                <label>نص السؤال</label>
                <input id="aqEditQuestion_${id}" type="text" value="${esc(q.question||'')}">
            </div>
            <div class="subject-form-field">
                <label>الترتيب</label>
                <input id="aqEditOrder_${id}" type="number" min="1" value="${esc(q.order)}">
            </div>
            <div class="subject-form-field">
                <label>الحالة</label>
                <select id="aqEditIsActive_${id}">
                    <option value="true"  ${q.isActive!==false?'selected':''}>✅ نشط</option>
                    <option value="false" ${q.isActive===false?'selected':''}>🔒 مخفي</option>
                </select>
            </div>
        </div>
        
        <div id="aqEditMcqFields_${id}" class="roadmap-type-fields" style="display:${t==='mcq'?'block':'none'}">
            <div class="subject-form-grid">
                <div class="subject-form-field">
                    <label>الخيار الأول</label>
                    <input id="aqEditOpt0_${id}" type="text" value="${esc(opts[0])}">
                </div>
                <div class="subject-form-field">
                    <label>الخيار الثاني</label>
                    <input id="aqEditOpt1_${id}" type="text" value="${esc(opts[1])}">
                </div>
                <div class="subject-form-field">
                    <label>الخيار الثالث</label>
                    <input id="aqEditOpt2_${id}" type="text" value="${esc(opts[2])}">
                </div>
                <div class="subject-form-field">
                    <label>الخيار الرابع</label>
                    <input id="aqEditOpt3_${id}" type="text" value="${esc(opts[3])}">
                </div>
                <div class="subject-form-field" style="grid-column:1/-1">
                    <label>الإجابة الصحيحة</label>
                    <select id="aqEditCorrectAns_${id}">
                        <option value="0" ${ansIndex===0?'selected':''}>الخيار الأول</option>
                        <option value="1" ${ansIndex===1?'selected':''}>الخيار الثاني</option>
                        <option value="2" ${ansIndex===2?'selected':''}>الخيار الثالث</option>
                        <option value="3" ${ansIndex===3?'selected':''}>الخيار الرابع</option>
                    </select>
                </div>
            </div>
        </div>
        <div id="aqEditShortFields_${id}" class="roadmap-type-fields" style="display:${t==='short'?'block':'none'}">
            <div class="subject-form-field" style="grid-column:1/-1">
                <label>الإجابة الصحيحة</label>
                <textarea id="aqEditShortAns_${id}" rows="3">${t==='short'?esc(q.answer||''):''}</textarea>
            </div>
        </div>
        <div class="subject-form-field" style="grid-column:1/-1; margin-top:10px;">
            <label>توضيح الإجابة (اختياري)</label>
            <textarea id="aqEditExplanation_${id}" rows="2">${esc(q.explanation||'')}</textarea>
        </div>

        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
            <button class="admin-tool-btn"
                    style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)"
                    onclick="aqHandleSaveEdit('${id}')">
                <i class="fas fa-save"></i> حفظ التعديل
            </button>
            <button class="admin-tool-btn"
                    style="background:rgba(148,163,184,0.1);border-color:rgba(148,163,184,0.25)"
                    onclick="aqHandleCancelEdit('${id}')">
                <i class="fas fa-times"></i> إلغاء
            </button>
            <span id="aqEditStatus_${id}" style="font-size:0.88rem;align-self:center"></span>
        </div>
    </div>`;
}

function renderAdminQuestionsPanel(subjects, selectedSubjectId, questions) {
    const subjectOptions = subjects.map((s) =>
        `<option value="${esc(s.id)}" ${s.id===selectedSubjectId?'selected':''}>${esc(s.nameAr||s.id)}</option>`
    ).join('');

    const questionsHtml = questions.length
        ? questions.map((q, i) => renderQuestionRow(q, i===0, i===questions.length-1)).join('')
        : '<div class="admin-empty"><i class="fas fa-question-circle"></i> لا توجد أسئلة — أضف أول سؤال أعلاه</div>';

    return `
    <div class="roadmap-admin-panel">
        <div class="roadmap-subject-selector">
            <label style="color:rgba(255,255,255,0.55);font-size:0.85rem;font-weight:600">اختر المادة</label>
            <select class="roadmap-subject-select" onchange="aqHandleSubjectChange(this.value)">
                ${subjects.length ? subjectOptions : '<option value="">لا توجد مواد — أضف مادة أولاً</option>'}
            </select>
        </div>
        ${selectedSubjectId ? renderAddForm(questions.length + 1) : ''}
        <div class="roadmap-blocks-list" id="aqQuestionsList">
            ${selectedSubjectId ? questionsHtml : '<div class="admin-empty">اختر مادة أولاً</div>'}
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
let _questions = [];

async function reloadAndRender() {
    _questions = await loadQuestionsForSubject(_selectedSubjectId, _db);
    if (_containerEl) {
        _containerEl.innerHTML = renderAdminQuestionsPanel(_subjects, _selectedSubjectId, _questions);
    }
}

// ---------------------------------------------------------------------------
// Handlers (exposed to window.*)
// ---------------------------------------------------------------------------

async function aqHandleSubjectChange(subjectId) {
    _selectedSubjectId = subjectId;
    await reloadAndRender();
}

function aqSwitchTypeFields(type) {
    document.getElementById('aqMcqFields').style.display = type === 'mcq' ? 'block' : 'none';
    document.getElementById('aqShortFields').style.display = type === 'short' ? 'block' : 'none';
}

function aqSwitchEditTypeFields(questionId, type) {
    const elMcq = document.getElementById(`aqEditMcqFields_${questionId}`);
    const elShort = document.getElementById(`aqEditShortFields_${questionId}`);
    if (elMcq) elMcq.style.display = type === 'mcq' ? 'block' : 'none';
    if (elShort) elShort.style.display = type === 'short' ? 'block' : 'none';
}

async function aqHandleAdd(event) {
    event.preventDefault();
    const btn = document.getElementById('aqAddBtn');
    const statusEl = document.getElementById('aqAddStatus');
    const type = document.getElementById('aqType')?.value;
    const question = document.getElementById('aqQuestion')?.value.trim();
    const order = parseInt(document.getElementById('aqOrder')?.value) || (_questions.length + 1);
    const isActive = document.getElementById('aqIsActive')?.value !== 'false';
    const explanation = document.getElementById('aqExplanation')?.value.trim() || '';

    if (!question || !type) {
        if (statusEl) { statusEl.textContent = '⚠️ النوع ونص السؤال مطلوبان'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { subjectId: _selectedSubjectId, type, question, order, isActive, explanation };
    
    if (type === 'mcq') {
        data.options = [
            document.getElementById('aqOpt0')?.value.trim() || '',
            document.getElementById('aqOpt1')?.value.trim() || '',
            document.getElementById('aqOpt2')?.value.trim() || '',
            document.getElementById('aqOpt3')?.value.trim() || ''
        ];
        const correctIndex = parseInt(document.getElementById('aqCorrectAns')?.value) || 0;
        data.answer = data.options[correctIndex];
    } else {
        data.answer = document.getElementById('aqShortAns')?.value.trim() || '';
    }

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...'; }
    if (statusEl) statusEl.textContent = '';

    try {
        await _db.collection(QUESTIONS_COLLECTION).add(data);
        if (statusEl) { statusEl.textContent = `✅ تمت إضافة السؤال!`; statusEl.style.color = '#8effbf'; }
        await updateCacheVersion(_db, 'questions_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> إضافة السؤال'; }
    }
}

function aqHandleEdit(questionId) {
    const q = _questions.find((b) => b.id === questionId);
    if (!q) return;
    const row = document.querySelector(`[data-question-id="${questionId}"]`);
    if (row) row.outerHTML = renderEditForm(q);
}

function aqHandleCancelEdit(questionId) {
    const q = _questions.find((b) => b.id === questionId);
    if (!q) return;
    const index = _questions.indexOf(q);
    const row = document.querySelector(`[data-question-id="${questionId}"]`);
    if (row) row.outerHTML = renderQuestionRow(q, index === 0, index === _questions.length - 1);
}

async function aqHandleSaveEdit(questionId) {
    const type = document.getElementById(`aqEditType_${questionId}`)?.value;
    const question = document.getElementById(`aqEditQuestion_${questionId}`)?.value.trim();
    const order = parseInt(document.getElementById(`aqEditOrder_${questionId}`)?.value) || 1;
    const isActive = document.getElementById(`aqEditIsActive_${questionId}`)?.value !== 'false';
    const explanation = document.getElementById(`aqEditExplanation_${questionId}`)?.value.trim() || '';
    const statusEl = document.getElementById(`aqEditStatus_${questionId}`);

    if (!question) {
        if (statusEl) { statusEl.textContent = '⚠️ نص السؤال مطلوب'; statusEl.style.color = '#ff8f8f'; }
        return;
    }

    const data = { type, question, order, isActive, explanation };
    
    if (type === 'mcq') {
        data.options = [
            document.getElementById(`aqEditOpt0_${questionId}`)?.value.trim() || '',
            document.getElementById(`aqEditOpt1_${questionId}`)?.value.trim() || '',
            document.getElementById(`aqEditOpt2_${questionId}`)?.value.trim() || '',
            document.getElementById(`aqEditOpt3_${questionId}`)?.value.trim() || ''
        ];
        const correctIndex = parseInt(document.getElementById(`aqEditCorrectAns_${questionId}`)?.value) || 0;
        data.answer = data.options[correctIndex];
    } else {
        data.answer = document.getElementById(`aqEditShortAns_${questionId}`)?.value.trim() || '';
        // clear out options for short answer
        data.options = [];
    }

    try {
        await _db.collection(QUESTIONS_COLLECTION).doc(questionId).update(data);
        await updateCacheVersion(_db, 'questions_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) {
        if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = '#ff8f8f'; }
    }
}

async function aqHandleDelete(questionId) {
    if (!confirm(`هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع.`)) return;
    try {
        await _db.collection(QUESTIONS_COLLECTION).doc(questionId).delete();
        await updateCacheVersion(_db, 'questions_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) { alert(`خطأ في الحذف: ${err.message}`); }
}

async function aqHandleMove(questionId, direction) {
    const index = _questions.findIndex((b) => b.id === questionId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= _questions.length) return;

    const qA = _questions[index];
    const qB = _questions[swapIndex];
    const orderA = Number(qA.order) || index + 1;
    const orderB = Number(qB.order) || swapIndex + 1;

    try {
        await Promise.all([
            _db.collection(QUESTIONS_COLLECTION).doc(qA.id).update({ order: orderB }),
            _db.collection(QUESTIONS_COLLECTION).doc(qB.id).update({ order: orderA }),
        ]);
        await updateCacheVersion(_db, 'questions_' + _selectedSubjectId);
        await reloadAndRender();
    } catch (err) { alert(`خطأ في إعادة الترتيب: ${err.message}`); }
}

// ---------------------------------------------------------------------------
// Public Entry Point
// ---------------------------------------------------------------------------

async function initAdminQuestions(subjects, db, containerEl) {
    _db               = db;
    _subjects         = subjects || [];
    _containerEl      = containerEl;
    _selectedSubjectId = _subjects.length ? _subjects[0].id : '';
    _questions = _selectedSubjectId ? await loadQuestionsForSubject(_selectedSubjectId, _db) : [];

    containerEl.innerHTML = renderAdminQuestionsPanel(_subjects, _selectedSubjectId, _questions);

    window.aqHandleSubjectChange  = aqHandleSubjectChange;
    window.aqSwitchTypeFields      = aqSwitchTypeFields;
    window.aqSwitchEditTypeFields  = aqSwitchEditTypeFields;
    window.aqHandleAdd             = aqHandleAdd;
    window.aqHandleEdit            = aqHandleEdit;
    window.aqHandleCancelEdit      = aqHandleCancelEdit;
    window.aqHandleSaveEdit        = aqHandleSaveEdit;
    window.aqHandleDelete          = aqHandleDelete;
    window.aqHandleMove            = aqHandleMove;
}

export { initAdminQuestions };
