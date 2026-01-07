// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4",
    authDomain: "manasa-ceaa2.firebaseapp.com",
    projectId: "manasa-ceaa2",
    storageBucket: "manasa-ceaa2.firebasestorage.app",
    messagingSenderId: "847284305108",
    appId: "1:847284305108:web:7a14698f76b3981c6acf41",
    measurementId: "G-CYX6QKJZSR"
};

let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('✅ Firebase initialized for Physics 2');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggleBtn = document.querySelector('.mobile-menu-toggle i');
    navLinks.classList.toggle('active');
    toggleBtn.classList.toggle('fa-chevron-down');
    toggleBtn.classList.toggle('fa-chevron-up');
}

// Theme System
function setTheme(theme) {
    const body = document.body;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme');
    if (theme !== 'default') {
        body.classList.add(theme + '-theme');
    }
    userProfile.theme = theme;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    const toggle = document.querySelector('.theme-toggle i');
    const icons = { 'default': 'fa-moon', 'space': 'fa-rocket', 'ocean': 'fa-water', 'sunset': 'fa-sun', 'pyramids': 'fa-mountain', 'winter': 'fa-snowflake' };
    if (toggle) toggle.className = 'fas ' + (icons[theme] || 'fa-moon');
}

function cycleTheme() {
    const themes = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter'];
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const currentTheme = userProfile.theme || 'default';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
}

function loadSavedTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile?.theme && userProfile.theme !== 'default') {
        setTheme(userProfile.theme);
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', loadSavedTheme);


// Subject Configuration
const SUBJECT_ID = 'physics2';
const SUBJECT_NAME = 'فيزياء 2';
const CHALLENGE_TIME = 300;
const QUESTIONS_PER_CHALLENGE = 15;

// Questions Bank - Bilingual (English main + Arabic translation)
// Format: { questionEn, questionAr, optionsEn, optionsAr, correct }
const hardcodedQuestions = [
    { questionEn: "In Young's double-slit experiment, constructive interference occurs when the path difference is...", questionAr: "في تجربة يونج للشق المزدوج، يحدث التداخل البناء عندما يكون فرق المسار...", optionsEn: ["mλ", "(m+1/2)λ", "1/2 mλ", "Zero"], optionsAr: ["mλ", "(m+1/2)λ", "1/2 mλ", "صفر"], correct: 0 },
    { questionEn: "In an interference pattern, the distance between two adjacent bright fringes is determined by...", questionAr: "في نمط التداخل، المسافة بين هدبتين مضيئتين متجاورتين تتحدد بواسطة...", optionsEn: ["The wavelength of light and the slit separation", "The screen's distance from the slits only", "The intensity of the light", "The angle of incidence"], optionsAr: ["الطول الموجي للضوء والمسافة بين الشقين", "المسافة إلى الشاشة فقط", "شدة الضوء", "زاوية السقوط"], correct: 0 },
    { questionEn: "Which concept did Einstein challenge with his Special Theory of Relativity?", questionAr: "أي مفهوم تحداه أينشتاين بنظريته النسبية الخاصة؟", optionsEn: ["Newtonian mechanics", "The laws of thermodynamics", "Quantum entanglement", "Electromagnetism"], optionsAr: ["ميكانيكا نيوتن", "قوانين الديناميكا الحرارية", "التشابك الكمي", "الكهرومغناطيسية"], correct: 0 },
    { questionEn: "In a rectifier circuit, what is the purpose of the smoothing capacitor?", questionAr: "في دائرة المقوم، ما هي وظيفة مكثف التنعيم؟", optionsEn: ["To filter out the AC component and reduce ripple", "To amplify the signal", "To store data", "To generate light"], optionsAr: ["تصفية المكون المتردد وتقليل التموج", "تضخيم الإشارة", "تخزين البيانات", "توليد الضوء"], correct: 0 },
    { questionEn: "What is the primary function of a p-n junction diode in a rectifier circuit?", questionAr: "ما هي الوظيفة الأساسية للوصلة p-n في دائرة المقوم؟", optionsEn: ["Convert AC voltage to DC voltage", "Amplify signals", "Generate light", "Store data"], optionsAr: ["تحويل الجهد المتردد إلى جهد مستمر", "تضخيم الإشارات", "توليد الضوء", "تخزين البيانات"], correct: 0 },
    { questionEn: "What happens to a diode when it is reverse-biased?", questionAr: "ماذا يحدث للدايود عند انحيازه عكسياً؟", optionsEn: ["No current flows (or extremely small leakage)", "Current flows freely", "Electrons are emitted", "Voltage decreases"], optionsAr: ["لا يمر تيار (أو تسرب ضئيل جداً)", "يتدفق التيار بحرية", "تنبعث الإلكترونات", "ينخفض الجهد"], correct: 0 },
    { questionEn: "Which semiconductor material is commonly used to make diodes?", questionAr: "ما هي مادة شبه الموصل المستخدمة عادة في صنع الدايود؟", optionsEn: ["Silicon", "Aluminum", "Copper", "Gold"], optionsAr: ["السيليكون", "الألومنيوم", "النحاس", "الذهب"], correct: 0 },
    { questionEn: "In a half-wave rectifier circuit, how many diodes are used to convert AC to DC?", questionAr: "في مقوم نصف الموجة، كم عدد الدايودات المستخدمة؟", optionsEn: ["One", "Two", "Three", "Four"], optionsAr: ["واحد", "اثنان", "ثلاثة", "أربعة"], correct: 0 },
    { questionEn: "What is the voltage drop across a germanium diode when it is forward-biased?", questionAr: "ما هو هبوط الجهد عبر دايود الجرمانيوم عند الانحياز الأمامي؟", optionsEn: ["0.3 volts", "0 volts", "0.7 volts", "1 volt"], optionsAr: ["0.3 فولت", "0 فولت", "0.7 فولت", "1 فولت"], correct: 0 },
    { questionEn: "In reverse bias, the N region of a diode is connected to...", questionAr: "في الانحياز العكسي، تتصل منطقة N من الدايود بـ...", optionsEn: ["Positive voltage", "Negative voltage", "Ground", "No voltage"], optionsAr: ["جهد موجب", "جهد سالب", "الأرض", "بدون جهد"], correct: 0 },
    { questionEn: "Semiconductors are typically characterized by atoms with...", questionAr: "تتميز أشباه الموصلات بذرات لها...", optionsEn: ["Four valence electrons", "Two valence electrons", "One valence electron", "Six valence electrons"], optionsAr: ["4 إلكترونات تكافؤ", "2 إلكترونات تكافؤ", "1 إلكترون تكافؤ", "6 إلكترونات تكافؤ"], correct: 0 },
    { questionEn: "In time dilation, the moving clock observed from a stationary frame appears...", questionAr: "في تمدد الزمن، الساعة المتحركة تظهر من إطار ساكن...", optionsEn: ["Slower", "Faster", "Unaffected", "Random"], optionsAr: ["أبطأ", "أسرع", "غير متأثرة", "عشوائية"], correct: 0 },
    { questionEn: "Which of the following is NOT a source of a magnetic field?", questionAr: "أي مما يلي ليس مصدراً للمجال المغناطيسي؟", optionsEn: ["Stationary Electric charge", "Permanent magnets", "Electric charge in motion", "Ferromagnetic materials"], optionsAr: ["شحنة كهربائية ساكنة", "المغناطيس الدائم", "شحنة كهربائية متحركة", "المواد الفيرومغناطيسية"], correct: 0 },
    { questionEn: "The Biot-Savart law describes the magnetic field due to...", questionAr: "قانون بيو-سافار يصف المجال المغناطيسي الناتج عن...", optionsEn: ["A current-carrying conductor", "A stationary charge", "A moving point charge", "A magnetic dipole"], optionsAr: ["موصل يحمل تياراً", "شحنة ساكنة", "شحنة نقطية متحركة", "ثنائي قطب مغناطيسي"], correct: 0 },
    { questionEn: "In a magnetic field, the force on a charged particle is...", questionAr: "في المجال المغناطيسي، القوة على جسيم مشحون تكون...", optionsEn: ["Perpendicular to both velocity and magnetic field", "Opposite to the magnetic field direction", "Zero if the particle is moving", "Along the direction of the magnetic field"], optionsAr: ["عمودية على السرعة والمجال", "معاكسة لاتجاه المجال", "صفر إذا كان الجسيم متحركاً", "في اتجاه المجال"], correct: 0 },
    { questionEn: "What happens to polarized light when it passes through a second polarizer oriented perpendicular to the first one?", questionAr: "ماذا يحدث للضوء المستقطب عندما يمر عبر مستقطب ثانٍ عمودي على الأول؟", optionsEn: ["The light is completely blocked", "The light becomes completely unpolarized", "The light becomes more colorful", "The light becomes brighter"], optionsAr: ["يُحجب الضوء تماماً", "يصبح غير مستقطب", "يصبح أكثر لوناً", "يصبح أكثر سطوعاً"], correct: 0 },
    { questionEn: "The magnetic force vector is _______ to the magnetic field.", questionAr: "متجه القوة المغناطيسية يكون _______ للمجال المغناطيسي", optionsEn: ["Perpendicular", "Parallel", "Helical", "Intersecting"], optionsAr: ["عمودي", "موازٍ", "حلزوني", "متقاطع"], correct: 0 },
    { questionEn: "A semiconductor has generally ... valence electrons", questionAr: "شبه الموصل يحتوي عموماً على ... إلكترونات تكافؤ", optionsEn: ["4", "5", "2", "8"], optionsAr: ["4", "5", "2", "8"], correct: 0 },
    { questionEn: "When a pentavalent impurity is added to a pure semiconductor, it becomes...", questionAr: "عند إضافة شائبة خماسية التكافؤ لشبه موصل نقي، يصبح...", optionsEn: ["n-type semiconductor", "an insulator", "an intrinsic semiconductor", "p-type semiconductor"], optionsAr: ["شبه موصل من النوع n", "عازل", "شبه موصل ذاتي", "شبه موصل من النوع p"], correct: 0 },
    { questionEn: "In double slit experiment we observe...", questionAr: "في تجربة الشق المزدوج نلاحظ...", optionsEn: ["Both interference and diffraction fringes", "Diffraction fringes only", "Interference fringes only", "Polarized fringes"], optionsAr: ["هدب تداخل وحيود معاً", "هدب حيود فقط", "هدب تداخل فقط", "هدب استقطاب"], correct: 0 },
    { questionEn: "A reverse biased pn junction has", questionAr: "الوصلة p-n ذات الانحياز العكسي لها", optionsEn: ["almost no current", "very narrow depletion layer", "very low resistance", "large current flow"], optionsAr: ["تيار شبه معدوم", "منطقة استنزاف ضيقة جداً", "مقاومة منخفضة جداً", "تدفق تيار كبير"], correct: 0 },
    { questionEn: "Phenomenon proves that nature of light is transverse", questionAr: "الظاهرة التي تثبت أن طبيعة الضوء عرضية هي", optionsEn: ["Polarization", "Diffraction", "Scattering", "Interference"], optionsAr: ["الاستقطاب", "الحيود", "التشتت", "التداخل"], correct: 0 },
    { questionEn: "In n-type materials, the minority carriers are", questionAr: "في المواد من النوع n، حاملات الشحنة الأقلية هي", optionsEn: ["Holes", "Free electrons", "Protons", "Mesons"], optionsAr: ["الثقوب", "الإلكترونات الحرة", "البروتونات", "الميزونات"], correct: 0 },
    { questionEn: "The Electric force vector is _______ to the electric field.", questionAr: "متجه القوة الكهربائية يكون _______ للمجال الكهربائي", optionsEn: ["Parallel", "Perpendicular", "Helical", "Intersecting"], optionsAr: ["موازٍ", "عمودي", "حلزوني", "متقاطع"], correct: 0 },
    { questionEn: "Appearance of color in thin films is due to...", questionAr: "ظهور الألوان في الأغشية الرقيقة يرجع إلى...", optionsEn: ["Interference", "Diffraction", "Dispersion", "Polarization"], optionsAr: ["التداخل", "الحيود", "التشتت", "الاستقطاب"], correct: 0 },
    { questionEn: "Light on passing through a Polaroid is.", questionAr: "الضوء بعد مروره عبر بولارويد يصبح", optionsEn: ["plane polarized", "un-polarized", "circularly polarized", "elliptically polarized"], optionsAr: ["مستقطب مستوياً", "غير مستقطب", "مستقطب دائرياً", "مستقطب بيضاوياً"], correct: 0 },
    { questionEn: "The condition for constructive interference of two coherent beams is that the path difference should be...", questionAr: "شرط التداخل البناء لحزمتين متماسكتين هو أن فرق المسار يجب أن يكون...", optionsEn: ["Integral multiple of λ", "Integral multiple of λ/2", "Odd integral multiple of λ/2", "None of above"], optionsAr: ["مضاعف صحيح لـ λ", "مضاعف صحيح لـ λ/2", "مضاعف فردي لـ λ/2", "لا شيء مما سبق"], correct: 0 },
    { questionEn: "The blue colour of the sky is due to...", questionAr: "اللون الأزرق للسماء يرجع إلى...", optionsEn: ["Scattering", "Diffraction", "Reflection", "Polarization"], optionsAr: ["التشتت", "الحيود", "الانعكاس", "الاستقطاب"], correct: 0 },
    { questionEn: "Which one of the following cannot be polarized?", questionAr: "أي مما يلي لا يمكن استقطابه؟", optionsEn: ["Ultrasonic waves", "Radio waves", "Ultraviolet rays", "X-rays"], optionsAr: ["الموجات فوق الصوتية", "موجات الراديو", "الأشعة فوق البنفسجية", "الأشعة السينية"], correct: 0 },
    { questionEn: "In the depletion region of a pn junction, there is a shortage of", questionAr: "في منطقة الاستنزاف للوصلة pn، يوجد نقص في", optionsEn: ["Holes and electrons", "Acceptor ions", "Donor ions", "None of the above"], optionsAr: ["الثقوب والإلكترونات", "أيونات المستقبل", "أيونات المانح", "لا شيء مما سبق"], correct: 0 },
    { questionEn: "If the initial velocity of the charged particle has a component parallel to the magnetic field B, the resulting trajectory will be...", questionAr: "إذا كان للسرعة الابتدائية للجسيم المشحون مركبة موازية للمجال B، فإن المسار الناتج سيكون...", optionsEn: ["A helical", "Parallel", "A perpendicular", "None of these"], optionsAr: ["حلزوني", "موازٍ", "عمودي", "لا شيء من هذه"], correct: 0 },
    { questionEn: "In n-type materials, the majority carriers are", questionAr: "في المواد من النوع n، حاملات الشحنة الأغلبية هي", optionsEn: ["Free electrons", "Holes", "Protons", "Neutrons"], optionsAr: ["الإلكترونات الحرة", "الثقوب", "البروتونات", "النيوترونات"], correct: 0 },
    { questionEn: "In Young's double slit experiment the fringe spacing is equal to...", questionAr: "في تجربة يونج للشق المزدوج، تباعد الهدب يساوي...", optionsEn: ["Lλ/d", "λd/L", "d/Lλ", "L/λd"], optionsAr: ["Lλ/d", "λd/L", "d/Lλ", "L/λd"], correct: 0 },
    { questionEn: "Type-II of superconductors are usually...", questionAr: "الموصلات الفائقة من النوع الثاني عادة ما تكون...", optionsEn: ["Alloys", "Semiconductors", "Insulators", "Pure metals"], optionsAr: ["سبائك", "أشباه موصلات", "عوازل", "فلزات نقية"], correct: 0 },
    { questionEn: "A distribution of electric charge at rest creates...", questionAr: "توزيع الشحنة الكهربائية الساكنة يولد...", optionsEn: ["Electric field", "Magnetic field", "Both", "Neither"], optionsAr: ["مجال كهربائي", "مجال مغناطيسي", "كلاهما", "لا شيء منهما"], correct: 0 },
    { questionEn: "Fringe width is inversely proportional to the...", questionAr: "عرض الهدب يتناسب عكسياً مع...", optionsEn: ["Separation between the two slits", "Wavelength", "Distance to screen", "Intensity"], optionsAr: ["المسافة بين الشقين", "الطول الموجي", "المسافة إلى الشاشة", "الشدة"], correct: 0 },
    { questionEn: "The width of depletion region of a diode", questionAr: "عرض منطقة الاستنزاف للدايود", optionsEn: ["Increases under reverse bias", "Increases under forward bias", "Is independent of bias", "Decreases under reverse bias"], optionsAr: ["يزداد عند الانحياز العكسي", "يزداد عند الانحياز الأمامي", "مستقل عن الانحياز", "يقل عند الانحياز العكسي"], correct: 0 },
    { questionEn: "What is the voltage drop across a silicon diode when it is forward-biased?", questionAr: "ما هو هبوط الجهد عبر دايود السيليكون عند الانحياز الأمامي؟", optionsEn: ["0.7 volts", "0 volts", "0.3 volts", "1 volt"], optionsAr: ["0.7 فولت", "0 فولت", "0.3 فولت", "1 فولت"], correct: 0 },
    { questionEn: "In Full-wave rectification, if Vp = 48V, the average value Vavg is approximately...", questionAr: "في تقويم الموجة الكاملة، إذا كان Vp = 48V، فإن القيمة المتوسطة Vavg تقريباً...", optionsEn: ["30.6 V", "31.6 V", "42 V", "24 V"], optionsAr: ["30.6 V", "31.6 V", "42 V", "24 V"], correct: 0 },
    { questionEn: "In half wave rectification, if Vp = 80V, the average value is approximately...", questionAr: "في تقويم نصف الموجة، إذا كان Vp = 80V، فإن القيمة المتوسطة تقريباً...", optionsEn: ["25.5 V", "35.5 V", "50.9 V", "3.55 V"], optionsAr: ["25.5 V", "35.5 V", "50.9 V", "3.55 V"], correct: 0 },
    { questionEn: "The length contraction equation is L = L₀√(1 - v²/c²). This means moving objects appear...", questionAr: "معادلة تقلص الطول L = L₀√(1 - v²/c²) تعني أن الأجسام المتحركة تظهر...", optionsEn: ["Shorter in the direction of motion", "Longer in the direction of motion", "Unchanged", "Wider"], optionsAr: ["أقصر في اتجاه الحركة", "أطول في اتجاه الحركة", "بدون تغيير", "أعرض"], correct: 0 },
    { questionEn: "The magnetic force on a charged particle moving in a magnetic field is given by...", questionAr: "القوة المغناطيسية على جسيم مشحون يتحرك في مجال مغناطيسي تُعطى بـ...", optionsEn: ["F = qv × B", "F = qE", "F = ma", "F = kq₁q₂/r²"], optionsAr: ["F = qv × B", "F = qE", "F = ma", "F = kq₁q₂/r²"], correct: 0 },
    { questionEn: "In a full-wave bridge rectifier, how many diodes are used?", questionAr: "في مقوم الموجة الكاملة الجسري، كم عدد الدايودات المستخدمة؟", optionsEn: ["Four", "One", "Two", "Three"], optionsAr: ["أربعة", "واحد", "اثنان", "ثلاثة"], correct: 0 },
    { questionEn: "The time dilation equation Δt = Δt₀/√(1 - v²/c²) shows that time...", questionAr: "معادلة تمدد الزمن Δt = Δt₀/√(1 - v²/c²) تُظهر أن الزمن...", optionsEn: ["Runs slower for moving observers", "Runs faster for moving observers", "Is the same for all observers", "Stops completely"], optionsAr: ["يمر أبطأ للمراقبين المتحركين", "يمر أسرع للمراقبين المتحركين", "نفسه لجميع المراقبين", "يتوقف تماماً"], correct: 0 }
];

// Combined questions array (will include Firebase questions)
let questions = [...hardcodedQuestions];

// Load questions from Firebase and merge with hardcoded ones
async function loadQuestionsFromFirebase() {
    if (!db) {
        console.log('⚠️ Firebase not available, using hardcoded questions only');
        return;
    }

    try {
        const snapshot = await db.collection(`questions_${SUBJECT_ID}`).get();

        if (!snapshot.empty) {
            const firebaseQuestions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Convert Firebase question format to our format
                const q = {
                    question: data.question,
                    options: data.options,
                    correct: data.correct,
                    imageUrl: data.imageUrl,
                    source: 'firebase',
                    id: doc.id
                };
                firebaseQuestions.push(q);
            });

            // Merge Firebase questions with hardcoded questions
            questions = [...hardcodedQuestions, ...firebaseQuestions];
            console.log(`✅ Loaded ${firebaseQuestions.length} questions from Firebase`);
            console.log(`📊 Total questions available: ${questions.length}`);

            // Update total questions count if element exists
            const totalQuestionsEl = document.getElementById('totalQuestions');
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = questions.length;
            }
        } else {
            console.log('ℹ️ No Firebase questions found, using hardcoded questions only');
        }
    } catch (error) {
        console.error('❌ Error loading questions from Firebase:', error);
    }
}

// Load Firebase questions when page loads
if (db) {
    loadQuestionsFromFirebase();
}

// Helper functions for bilingual question text
function getQuestionText(q) {
    if (q.questionAr && q.questionEn) {
        return `<div class="bilingual-mcq"><p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p><p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr}</p></div>`;
    }
    return q.question || q.questionEn || q.questionAr || '';
}

function getQuestionTextPlain(q) {
    if (q.questionAr && q.questionEn) return `${q.questionEn} / ${q.questionAr}`;
    return q.question || q.questionEn || q.questionAr || '';
}

// Helper for bilingual options (English main, Arabic below)
function getOptionText(q, index) {
    if (q.optionsEn && q.optionsAr) {
        return `<span class="opt-en">${q.optionsEn[index]}</span><span class="opt-ar">${q.optionsAr[index]}</span>`;
    }
    return q.options ? q.options[index] : '';
}

function getOptions(q) {
    return q.optionsEn || q.options || [];
}

function getCorrectAnswerText(q) {
    if (q.optionsEn && q.optionsAr) {
        return `${q.optionsEn[q.correct]} (${q.optionsAr[q.correct]})`;
    }
    return q.options ? q.options[q.correct] : '';
}


// Challenge State
let challenge = {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    timeLeft: CHALLENGE_TIME,
    timerInterval: null,
    startTime: null,
    userName: ''
};

// Navigation Active State
function updateActiveNav() {
    const sections = ['hero', 'challenge', 'bank', 'essay', 'leaderboard', 'ask-ai'];
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = 'hero';
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150) {
                currentSection = sectionId;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

// Smooth Scroll
document.querySelectorAll('.nav-link, .btn[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.subject-navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

window.addEventListener('scroll', updateActiveNav);

// Challenge Functions
function startChallenge() {
    const nameInput = document.getElementById('challengerName');
    const name = nameInput.value.trim();

    if (!name) {
        alert('من فضلك أدخل اسمك أولاً!');
        nameInput.focus();
        return;
    }

    challenge.userName = name;
    challenge.questions = shuffleArray([...questions]).slice(0, QUESTIONS_PER_CHALLENGE);
    challenge.currentIndex = 0;
    challenge.answers = new Array(QUESTIONS_PER_CHALLENGE).fill(null);
    challenge.score = 0;
    challenge.timeLeft = CHALLENGE_TIME;
    challenge.startTime = Date.now();
    challenge.active = true;

    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    document.getElementById('challengeResult').style.display = 'none';

    showQuestion(0);
    startTimer();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion(index) {
    const q = challenge.questions[index];

    document.getElementById('questionBadge').textContent = `السؤال ${index + 1}`;
    document.getElementById('questionText').innerHTML = getQuestionText(q);
    document.getElementById('questionProgress').textContent = `${index + 1}/${QUESTIONS_PER_CHALLENGE}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    const opts = getOptions(q);
    opts.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (challenge.answers[index] === i) {
            btn.classList.add('selected');
        }
        btn.innerHTML = `
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${getOptionText(q, i)}</span>
        `;
        btn.onclick = () => selectOption(i);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('prevBtn').disabled = index === 0;

    if (index === QUESTIONS_PER_CHALLENGE - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'flex';
    } else {
        document.getElementById('nextBtn').style.display = 'flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

function selectOption(optionIndex) {
    challenge.answers[challenge.currentIndex] = optionIndex;
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });
}

function nextQuestion() {
    if (challenge.currentIndex < QUESTIONS_PER_CHALLENGE - 1) {
        challenge.currentIndex++;
        showQuestion(challenge.currentIndex);
    }
}

function prevQuestion() {
    if (challenge.currentIndex > 0) {
        challenge.currentIndex--;
        showQuestion(challenge.currentIndex);
    }
}

function startTimer() {
    updateTimerDisplay();
    challenge.timerInterval = setInterval(() => {
        challenge.timeLeft--;
        updateTimerDisplay();
        if (challenge.timeLeft <= 60) {
            document.getElementById('timer').classList.add('warning');
        }
        if (challenge.timeLeft <= 0) {
            submitChallenge();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(challenge.timeLeft / 60);
    const seconds = challenge.timeLeft % 60;
    document.getElementById('timerDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function submitChallenge() {
    clearInterval(challenge.timerInterval);
    challenge.active = false;

    let score = 0;
    challenge.questions.forEach((q, i) => {
        if (challenge.answers[i] === q.correct) {
            score++;
        }
    });

    challenge.score = score;
    const timeTaken = CHALLENGE_TIME - challenge.timeLeft;
    const percentage = Math.round((score / QUESTIONS_PER_CHALLENGE) * 100);

    document.getElementById('challengeContainer').style.display = 'none';
    document.getElementById('challengeResult').style.display = 'block';

    document.getElementById('finalScore').textContent = `${score}/${QUESTIONS_PER_CHALLENGE}`;
    document.getElementById('finalTime').textContent = formatTime(timeTaken);
    document.getElementById('percentage').textContent = `${percentage}%`;

    let icon, title;
    if (percentage >= 90) {
        icon = '🏆';
        title = 'ممتاز! أنت نجم!';
    } else if (percentage >= 70) {
        icon = '🌟';
        title = 'أحسنت!';
    } else if (percentage >= 50) {
        icon = '💪';
        title = 'جيد، استمر!';
    } else {
        icon = '📚';
        title = 'تحتاج مراجعة أكثر';
    }

    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('currentScore').textContent = score;

    saveToLeaderboard(score, timeTaken);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function restartChallenge() {
    document.getElementById('challengeResult').style.display = 'none';
    document.getElementById('challengeIntro').style.display = 'block';
    document.getElementById('timer').classList.remove('warning');
    document.getElementById('currentScore').textContent = '0';
}

// Firebase Functions
async function saveToLeaderboard(score, time) {
    if (!db) return;
    try {
        await db.collection(`leaderboard_${SUBJECT_ID}`).add({
            name: challenge.userName,
            score: score,
            time: time,
            date: new Date().toISOString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Score saved to leaderboard');
        loadLeaderboard();
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

async function loadLeaderboard() {
    if (!db) {
        document.getElementById('noRecords').style.display = 'block';
        return;
    }

    try {
        const snapshot = await db.collection(`leaderboard_${SUBJECT_ID}`)
            .orderBy('score', 'desc')
            .orderBy('time', 'asc')
            .limit(20)
            .get();

        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            document.getElementById('noRecords').style.display = 'block';
            return;
        }

        document.getElementById('noRecords').style.display = 'none';
        document.getElementById('totalPlayers').textContent = snapshot.size;

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            const tr = document.createElement('tr');

            let rankDisplay = index + 1;
            if (index === 0) rankDisplay = '🥇';
            else if (index === 1) rankDisplay = '🥈';
            else if (index === 2) rankDisplay = '🥉';

            const date = data.date ? new Date(data.date).toLocaleDateString('ar-EG') : '-';

            tr.innerHTML = `
                <td>${rankDisplay}</td>
                <td>${data.name}</td>
                <td>${data.score}/${QUESTIONS_PER_CHALLENGE}</td>
                <td>${formatTime(data.time)}</td>
                <td>${date}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('noRecords').style.display = 'block';
    }
}

// Questions Bank Functions
const QUESTIONS_PER_PAGE = 5;
let currentBankPage = 1;
let filteredQuestions = [];

function renderQuestionsBank(showAll = false) {
    const container = document.getElementById('questionsList');
    container.innerHTML = '';

    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    filteredQuestions = questions;
    if (searchTerm) {
        filteredQuestions = questions.filter(q =>
            getQuestionTextPlain(q).toLowerCase().includes(searchTerm) ||
            (q.optionsEn && q.optionsEn.some(o => o.toLowerCase().includes(searchTerm))) ||
            (q.optionsAr && q.optionsAr.some(o => o.toLowerCase().includes(searchTerm))) ||
            (q.options && q.options.some(o => o.toLowerCase().includes(searchTerm)))
        );
        currentBankPage = 1;
    }

    document.getElementById('displayedCount').textContent = filteredQuestions.length;

    if (filteredQuestions.length === 0) {
        container.innerHTML = '<p class="no-records">لا توجد نتائج مطابقة</p>';
        return;
    }

    const letters = ['A', 'B', 'C', 'D'];
    const questionsToShow = showAll ? filteredQuestions : filteredQuestions.slice(0, currentBankPage * QUESTIONS_PER_PAGE);

    questionsToShow.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'bank-question-card';
        card.dataset.correct = q.correct;
        card.dataset.answered = 'false';

        let optionsHTML = '';
        const opts = getOptions(q);
        opts.forEach((opt, i) => {
            optionsHTML += `
                <button class="bank-option-btn" data-index="${i}" onclick="selectBankOption(this, ${q.correct})">
                    <span class="option-letter">${letters[i]}</span>
                    <span class="option-text">${getOptionText(q, i)}</span>
                    <span class="option-icon"></span>
                </button>
            `;
        });

        card.innerHTML = `
            <div class="bank-question-header">
                <h4>${index + 1}.</h4>${getQuestionText(q)}
            </div>
            <div class="bank-options">
                ${optionsHTML}
            </div>
            <div class="bank-actions">
                <button class="show-answer-btn" onclick="showBankAnswer(this, ${q.correct})">
                    <i class="fas fa-eye"></i> Show Answer
                </button>
                <div class="answer-reveal" style="display: none;">
                    <i class="fas fa-check-circle"></i>
                    <span>Correct: ${getCorrectAnswerText(q)}</span>
                </div>
            </div>
            <div class="bank-feedback" style="display: none;"></div>
        `;
        container.appendChild(card);
    });

    // Add Show More button if there are more questions
    const remaining = filteredQuestions.length - questionsToShow.length;
    if (remaining > 0 && !showAll) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        showMoreBtn.onclick = () => {
            currentBankPage++;
            renderQuestionsBank();
        };
        container.appendChild(showMoreBtn);
    }
}


function selectBankOption(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');
    if (card.dataset.answered === 'true') return;

    const selectedIndex = parseInt(btn.dataset.index);
    const isCorrect = selectedIndex === correctIndex;

    card.dataset.answered = 'true';

    const allOptions = card.querySelectorAll('.bank-option-btn');
    allOptions.forEach((opt, i) => {
        opt.disabled = true;
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        } else if (i === selectedIndex && !isCorrect) {
            opt.classList.add('wrong');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-times"></i>';
        }
    });

    const feedback = card.querySelector('.bank-feedback');
    feedback.style.display = 'block';

    if (isCorrect) {
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> إجابة صحيحة! أحسنت 🎉';
        feedback.className = 'bank-feedback correct';
    } else {
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> إجابة خاطئة. الإجابة الصحيحة موضحة باللون الأخضر';
        feedback.className = 'bank-feedback wrong';
    }

    card.querySelector('.show-answer-btn').style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

function showBankAnswer(btn, correctIndex, correctAnswer) {
    const card = btn.closest('.bank-question-card');

    const allOptions = card.querySelectorAll('.bank-option-btn');
    allOptions.forEach((opt, i) => {
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        }
    });

    btn.style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

function filterQuestions() {
    renderQuestionsBank();
}


// Ask AI Functions
const GEMINI_API_KEY = 'AIzaSyBaUgHBLPT2VxapoYZ2SSGB7PKpxz45uB8';

async function askAI() {
    const input = document.getElementById('aiInput');
    const question = input.value.trim();

    if (!question) return;

    const messagesContainer = document.getElementById('aiMessages');

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user';
    userMessage.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content"><p>${question}</p></div>
    `;
    messagesContainer.appendChild(userMessage);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'ai-message bot';
    loadingMessage.id = 'loadingMessage';
    loadingMessage.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content"><p>جاري التفكير...</p></div>
    `;
    messagesContainer.appendChild(loadingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت مساعد تعليمي متخصص في فيزياء 2 (الفيزياء الحديثة والكهربية). أجب على السؤال التالي بشكل واضح ومفصل باللغة العربية:\n\n${question}`
                    }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الإجابة. حاول مرة أخرى.';

        loadingMessage.remove();

        const botMessage = document.createElement('div');
        botMessage.className = 'ai-message bot';
        botMessage.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content"><p>${aiResponse.replace(/\n/g, '<br>')}</p></div>
        `;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        console.error('AI Error:', error);
        loadingMessage.remove();

        const errorMessage = document.createElement('div');
        errorMessage.className = 'ai-message bot';
        errorMessage.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content"><p>عذراً، حدث خطأ. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.</p></div>
        `;
        messagesContainer.appendChild(errorMessage);
    }
}

// Enter key for AI input
document.getElementById('aiInput')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askAI();
    }
});

// ===================== ESSAY QUESTIONS SECTION =====================

// Essay Questions Bank (Bilingual: Arabic & English)
const essayQuestions = [
    {
        questionAr: "اشرح قانون مالوس للاستقطاب وكيف يُستخدم لحساب شدة الضوء المستقطب",
        questionEn: "Explain Malus's law for polarization and how it is used to calculate the intensity of polarized light",
        answerAr: "قانون مالوس ينص على أن شدة الضوء المستقطب بعد مروره خلال محلل تساوي الشدة الأصلية مضروبة في مربع جيب تمام الزاوية بين محور الاستقطاب ومحور المحلل. I = I₀ cos²θ",
        answerEn: "Malus's law states that the intensity of polarized light after passing through an analyzer equals the original intensity multiplied by the square of the cosine of the angle between the polarization axis and the analyzer axis. I = I₀ cos²θ"
    },
    {
        questionAr: "ما الفرق بين أشباه الموصلات من النوع n والنوع p؟",
        questionEn: "What is the difference between n-type and p-type semiconductors?",
        answerAr: "النوع n: يتم تنشيطه بإضافة شوائب خماسية التكافؤ (مثل الفوسفور) مما يضيف إلكترونات حرة كحاملات أغلبية. النوع p: يتم تنشيطه بإضافة شوائب ثلاثية التكافؤ (مثل البورون) مما يخلق ثقوبًا كحاملات أغلبية.",
        answerEn: "N-type: Doped with pentavalent impurities (like phosphorus) which adds free electrons as majority carriers. P-type: Doped with trivalent impurities (like boron) which creates holes as majority carriers."
    },
    {
        questionAr: "اشرح ظاهرة تمدد الزمن في النسبية الخاصة وأعطِ مثالاً عليها",
        questionEn: "Explain the phenomenon of time dilation in special relativity and give an example",
        answerAr: "تمدد الزمن يعني أن الساعة المتحركة تبدو أبطأ من ساعة ساكنة. المعادلة: Δt = Δt₀/√(1-v²/c²). مثال: جسيمات الميون التي تعيش أطول عند السرعات العالية.",
        answerEn: "Time dilation means a moving clock appears slower than a stationary clock. Equation: Δt = Δt₀/√(1-v²/c²). Example: Muon particles that live longer at high speeds."
    },
    {
        questionAr: "صف تجربة يونج للشقين المزدوجين واشرح كيف تثبت الطبيعة الموجية للضوء",
        questionEn: "Describe Young's double-slit experiment and explain how it proves the wave nature of light",
        answerAr: "في تجربة يونج، يمر ضوء أحادي اللون خلال شقين ضيقين مما ينتج نمط تداخل من حزم مضيئة ومظلمة على الشاشة. هذا يثبت الطبيعة الموجية لأن التداخل خاصية موجية.",
        answerEn: "In Young's experiment, monochromatic light passes through two narrow slits producing an interference pattern of bright and dark fringes on the screen. This proves the wave nature because interference is a wave property."
    },
    {
        questionAr: "ما هو الوصلة الثنائية p-n؟ اشرح سلوكها في الانحياز الأمامي والعكسي",
        questionEn: "What is a p-n junction diode? Explain its behavior in forward and reverse bias",
        answerAr: "الوصلة p-n هي تقاطع بين أشباه موصلات من النوع p والنوع n. في الانحياز الأمامي: يتدفق التيار بسهولة. في الانحياز العكسي: لا يتدفق تيار تقريبًا بسبب اتساع منطقة الاستنزاف.",
        answerEn: "A p-n junction is a boundary between p-type and n-type semiconductors. In forward bias: current flows easily. In reverse bias: almost no current flows due to the widening of the depletion region."
    },
    {
        questionAr: "اشرح كيف يعمل مقوم نصف الموجة وما هي مميزاته وعيوبه",
        questionEn: "Explain how a half-wave rectifier works and what are its advantages and disadvantages",
        answerAr: "مقوم نصف الموجة يستخدم ثنائي واحد لتحويل AC إلى DC. يسمح بمرور نصف الموجة فقط. المميزات: بسيط ورخيص. العيوب: كفاءة منخفضة وتموج عالٍ.",
        answerEn: "A half-wave rectifier uses one diode to convert AC to DC. It allows only half the wave to pass. Advantages: Simple and cheap. Disadvantages: Low efficiency and high ripple."
    },
    {
        questionAr: "ما هي منطقة الاستنزاف في الوصلة الثنائية وكيف تتشكل؟",
        questionEn: "What is the depletion region in a diode and how is it formed?",
        answerAr: "منطقة الاستنزاف هي منطقة في الوصلة p-n خالية من حاملات الشحنة الحرة. تتشكل عندما تنتشر الإلكترونات من n إلى p والثقوب من p إلى n، تاركة أيونات ثابتة.",
        answerEn: "The depletion region is an area in the p-n junction free of mobile charge carriers. It forms when electrons diffuse from n to p and holes from p to n, leaving behind fixed ions."
    },
    {
        questionAr: "اشرح المجال المغناطيسي الناتج عن موصل يحمل تيارًا كهربائيًا",
        questionEn: "Explain the magnetic field produced by a current-carrying conductor",
        answerAr: "عند مرور تيار في موصل، ينشأ مجال مغناطيسي دائري حول الموصل. اتجاهه يُحدد بقاعدة اليد اليمنى. شدته تتناسب طرديًا مع التيار وعكسيًا مع البعد عن الموصل.",
        answerEn: "When current flows through a conductor, a circular magnetic field is created around it. Its direction is determined by the right-hand rule. Its strength is directly proportional to the current and inversely proportional to the distance from the conductor."
    },
    {
        questionAr: "ما هو تقلص الطول في النسبية الخاصة؟ اشرح العلاقة الرياضية",
        questionEn: "What is length contraction in special relativity? Explain the mathematical relationship",
        answerAr: "تقلص الطول يعني أن الأجسام المتحركة تظهر أقصر في اتجاه الحركة. المعادلة: L = L₀√(1-v²/c²). حيث L₀ هو الطول بالنسبة للراصد الساكن مع الجسم.",
        answerEn: "Length contraction means moving objects appear shorter in the direction of motion. Equation: L = L₀√(1-v²/c²). Where L₀ is the proper length measured by a stationary observer relative to the object."
    },
    {
        questionAr: "اشرح كيف يحدث تشتت الضوء ولماذا السماء زرقاء",
        questionEn: "Explain how light scattering occurs and why the sky is blue",
        answerAr: "تشتت الضوء يحدث عندما يصطدم الضوء بجزيئات الغلاف الجوي. الضوء الأزرق يتشتت أكثر لأن طوله الموجي قصير (تشتت رايلي). لذلك نرى السماء زرقاء.",
        answerEn: "Light scattering occurs when light hits atmospheric particles. Blue light scatters more because it has a shorter wavelength (Rayleigh scattering). That's why we see the sky as blue."
    }
];


// Essay Challenge State
let essayChallenge = {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: [],
    timeLeft: 660,
    timerInterval: null,
    userName: ''
};

const ESSAY_TIME = 660;
const ESSAYS_PER_CHALLENGE = 5;

// Old Essay Challenge Functions (Text-based - kept for backwards compatibility)
function startOldEssayChallenge() {
    const nameInput = document.getElementById('essayPlayerName');
    const name = nameInput.value.trim() || document.getElementById('challengerName').value.trim();

    if (!name) {
        alert('من فضلك أدخل اسمك أولاً!');
        nameInput.focus();
        return;
    }

    if (essayQuestions.length < ESSAYS_PER_CHALLENGE) {
        alert('لا توجد أسئلة مقالية كافية حالياً');
        return;
    }

    essayChallenge.userName = name;
    essayChallenge.questions = shuffleArray([...essayQuestions]).slice(0, ESSAYS_PER_CHALLENGE);
    essayChallenge.currentIndex = 0;
    essayChallenge.answers = new Array(ESSAYS_PER_CHALLENGE).fill('');
    essayChallenge.timeLeft = ESSAY_TIME;
    essayChallenge.active = true;

    document.getElementById('essayIntro').style.display = 'none';
    document.getElementById('essayContainer').style.display = 'block';
    document.getElementById('essayResult').style.display = 'none';

    showEssayQuestion(0);
    startEssayTimer();
}

function showEssayQuestion(index) {
    const q = essayChallenge.questions[index];

    document.getElementById('essayQuestionBadge').textContent = `السؤال ${index + 1}`;
    document.getElementById('essayQuestionText').innerHTML = `
        <div class="bilingual-question">
            <p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr}</p>
            <p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p>
        </div>
    `;
    document.getElementById('essayProgress').textContent = `${index + 1}/${ESSAYS_PER_CHALLENGE}`;
    document.getElementById('essayAnswer').value = essayChallenge.answers[index] || '';


    document.getElementById('essayPrevBtn').disabled = index === 0;

    if (index === ESSAYS_PER_CHALLENGE - 1) {
        document.getElementById('essayNextBtn').style.display = 'none';
        document.getElementById('essaySubmitBtn').style.display = 'flex';
    } else {
        document.getElementById('essayNextBtn').style.display = 'flex';
        document.getElementById('essaySubmitBtn').style.display = 'none';
    }
}

function saveCurrentEssayAnswer() {
    const answer = document.getElementById('essayAnswer').value.trim();
    essayChallenge.answers[essayChallenge.currentIndex] = answer;
}

function nextEssayQuestion() {
    saveCurrentEssayAnswer();
    if (essayChallenge.currentIndex < ESSAYS_PER_CHALLENGE - 1) {
        essayChallenge.currentIndex++;
        showEssayQuestion(essayChallenge.currentIndex);
    }
}

function prevEssayQuestion() {
    saveCurrentEssayAnswer();
    if (essayChallenge.currentIndex > 0) {
        essayChallenge.currentIndex--;
        showEssayQuestion(essayChallenge.currentIndex);
    }
}

function startEssayTimer() {
    updateEssayTimerDisplay();
    essayChallenge.timerInterval = setInterval(() => {
        essayChallenge.timeLeft--;
        updateEssayTimerDisplay();
        if (essayChallenge.timeLeft <= 60) {
            document.getElementById('essayTimer').classList.add('warning');
        }
        if (essayChallenge.timeLeft <= 0) {
            submitOldEssayChallenge();
        }
    }, 1000);
}

function updateEssayTimerDisplay() {
    const minutes = Math.floor(essayChallenge.timeLeft / 60);
    const seconds = essayChallenge.timeLeft % 60;
    document.getElementById('essayTimerDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function submitOldEssayChallenge() {
    saveCurrentEssayAnswer();
    clearInterval(essayChallenge.timerInterval);
    essayChallenge.active = false;

    document.getElementById('essayContainer').style.display = 'none';
    document.getElementById('essayResult').style.display = 'block';
    document.getElementById('gradingStatus').style.display = 'flex';
    document.getElementById('essayScores').style.display = 'none';

    const scoresContainer = document.getElementById('essayScores');
    scoresContainer.innerHTML = '';

    for (let i = 0; i < essayChallenge.questions.length; i++) {
        const q = essayChallenge.questions[i];
        const answer = essayChallenge.answers[i];

        let feedback = '';
        let score = 0;

        if (!answer || answer.trim().length < 10) {
            feedback = 'لم يتم الإجابة على هذا السؤال أو الإجابة قصيرة جداً';
            score = 0;
        } else {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `أنت مصحح امتحانات. قيّم الإجابة التالية من 10.

السؤال: ${q.questionAr}
الإجابة النموذجية: ${q.answerAr}
إجابة الطالب: ${answer}

أعطِ درجة من 10 وتعليق مختصر. الرد بالشكل:
الدرجة: X/10
التعليق: ...`
                            }]
                        }]
                    })
                });

                const data = await response.json();
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                const scoreMatch = aiResponse.match(/الدرجة:\s*(\d+)/);
                score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
                feedback = aiResponse.replace(/الدرجة:\s*\d+\/10\s*/g, '').trim() || 'تم التقييم';
            } catch (error) {
                feedback = 'تعذر التصحيح التلقائي';
                score = 5;
            }
        }

        const card = document.createElement('div');
        card.className = 'essay-score-card';
        card.innerHTML = `
            <h4>السؤال ${i + 1}</h4>
            <p class="question">${q.questionAr}</p>
            <p class="question-en">${q.questionEn}</p>
            <p class="answer">${answer || 'لم يتم الإجابة'}</p>
            <div class="feedback">${feedback}</div>
            <span class="score-badge">${score}/10</span>
        `;
        scoresContainer.appendChild(card);

    }

    document.getElementById('gradingStatus').style.display = 'none';
    document.getElementById('essayScores').style.display = 'flex';
}

function restartOldEssayChallenge() {
    document.getElementById('essayResult').style.display = 'none';
    document.getElementById('essayIntro').style.display = 'block';
    document.getElementById('essayTimer').classList.remove('warning');
}

// Essay Bank Functions
const ESSAYS_PER_PAGE = 3;
let currentEssayPage = 1;
let filteredEssay = [];

function renderEssayBank(showAll = false) {
    const container = document.getElementById('essayQuestionsList');
    if (!container) return;

    container.innerHTML = '';

    const searchTerm = document.getElementById('essaySearchInput')?.value?.toLowerCase() || '';

    filteredEssay = essayQuestions;
    if (searchTerm) {
        filteredEssay = essayQuestions.filter(q =>
            q.questionAr.toLowerCase().includes(searchTerm) ||
            q.questionEn.toLowerCase().includes(searchTerm) ||
            q.answerAr.toLowerCase().includes(searchTerm) ||
            q.answerEn.toLowerCase().includes(searchTerm)
        );
        currentEssayPage = 1;
    }

    if (filteredEssay.length === 0) {
        container.innerHTML = '<p class="no-records">لا توجد نتائج مطابقة</p>';
        return;
    }

    const essaysToShow = showAll ? filteredEssay : filteredEssay.slice(0, currentEssayPage * ESSAYS_PER_PAGE);

    essaysToShow.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'essay-question-item';
        item.innerHTML = `
            <h4>${index + 1}. <span class="lang-label">🇸🇦</span> ${q.questionAr}</h4>
            <p class="question-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p>
            <div class="model-answer">
                <div class="answer-section">
                    <strong><span class="lang-label">🇸🇦</span> الإجابة بالعربي:</strong>
                    <p>${q.answerAr}</p>
                </div>
                <div class="answer-section">
                    <strong><span class="lang-label">🇬🇧</span> Answer in English:</strong>
                    <p>${q.answerEn}</p>
                </div>
            </div>
        `;
        item.onclick = () => item.classList.toggle('expanded');
        container.appendChild(item);
    });

    // Add Show More button if there are more questions
    const remaining = filteredEssay.length - essaysToShow.length;
    if (remaining > 0 && !showAll) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        showMoreBtn.onclick = (e) => {
            e.stopPropagation();
            currentEssayPage++;
            renderEssayBank();
        };
        container.appendChild(showMoreBtn);
    }
}


function filterEssayQuestions() {
    renderEssayBank();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved name
    const savedName = localStorage.getItem('userProfile');
    if (savedName) {
        try {
            const profile = JSON.parse(savedName);
            if (profile.name) {
                document.getElementById('challengerName').value = profile.name;
                const essayName = document.getElementById('essayPlayerName');
                if (essayName) essayName.value = profile.name;
            }
        } catch (e) { }
    }

    // Update stats
    document.getElementById('totalQuestions').textContent = questions.length;
    const totalEssay = document.getElementById('totalEssay');
    if (totalEssay) totalEssay.textContent = essayQuestions.length;

    // Load data
    loadLeaderboard();
    renderQuestionsBank();
    loadEssayBankFromFirebase(); // Load essay questions from Firebase
});

// Load essay questions from Firebase
async function loadEssayBankFromFirebase() {
    const container = document.getElementById('essayQuestionsList');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الأسئلة...</div>';

        if (!db) {
            container.innerHTML = '<div class="no-questions-message"><i class="fas fa-exclamation-circle"></i><h3>لا توجد أسئلة مقالية حالياً</h3><p>سيتم إضافة الأسئلة قريباً</p></div>';
            return;
        }

        const snapshot = await db.collection(`essay_questions_${SUBJECT_ID}`).get();

        if (snapshot.empty) {
            // If no Firebase questions, use hardcoded ones if available
            if (essayQuestions.length > 0) {
                document.getElementById('essayDisplayedCount').textContent = essayQuestions.length;
                renderEssayBank();
                // Initialize Essay Challenge with hardcoded questions
                if (typeof initEssayChallenge === 'function') {
                    initEssayChallenge(SUBJECT_ID, essayQuestions);
                }
            } else {
                container.innerHTML = '<div class="no-questions-message"><i class="fas fa-book-open"></i><h3>لا توجد أسئلة مقالية حالياً</h3><p>سيتم إضافة الأسئلة من لوحة الإدارة</p></div>';
                document.getElementById('essayDisplayedCount').textContent = '0';
            }
            return;
        }

        // Load Firebase questions and merge with hardcoded
        const firebaseEssays = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseEssays.push({
                id: doc.id,
                questionAr: data.question || data.questionAr || '',
                questionEn: data.questionEn || data.question || '',
                answerAr: data.answer || data.answerAr || '',
                answerEn: data.answerEn || data.answer || '',
                source: 'firebase'
            });
        });

        // Merge Firebase questions with hardcoded ones
        essayQuestions.push(...firebaseEssays);

        document.getElementById('essayDisplayedCount').textContent = essayQuestions.length;
        console.log(`✅ Loaded ${firebaseEssays.length} essay questions from Firebase for ${SUBJECT_ID}`);

        renderEssayBank();

        // Initialize Essay Challenge with all loaded questions
        if (typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }

    } catch (error) {
        console.error('Error loading essay questions:', error);
        // Fallback to hardcoded questions
        if (essayQuestions.length > 0) {
            document.getElementById('essayDisplayedCount').textContent = essayQuestions.length;
            renderEssayBank();
            // Initialize Essay Challenge with fallback questions
            if (typeof initEssayChallenge === 'function') {
                initEssayChallenge(SUBJECT_ID, essayQuestions);
            }
        } else {
            container.innerHTML = '<div class="no-questions-message"><i class="fas fa-exclamation-circle"></i><h3>حدث خطأ في تحميل الأسئلة</h3></div>';
        }
    }
}

// =============================================
// SUMMARIES SECTION
// =============================================

// Load summaries from Firebase
async function loadSummaries() {
    const container = document.getElementById('summariesList');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الملخصات...</div>';

        if (!db) {
            container.innerHTML = `
                <div class="no-summaries-message">
                    <i class="fas fa-file-alt"></i>
                    <h3>لا توجد ملخصات حالياً</h3>
                    <p>سيتم إضافة ملخصات قريباً</p>
                </div>
            `;
            return;
        }

        const snapshot = await db.collection(`summaries_${SUBJECT_ID}`).orderBy('order', 'asc').get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="no-summaries-message">
                    <i class="fas fa-file-alt"></i>
                    <h3>لا توجد ملخصات حالياً</h3>
                    <p>سيتم إضافة ملخصات من لوحة الإدارة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = createSummaryCard(data, doc.id);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading summaries:', error);
        container.innerHTML = `
            <div class="no-summaries-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>خطأ في تحميل الملخصات</h3>
                <p>حاول تحديث الصفحة</p>
            </div>
        `;
    }
}

// Create summary card element
function createSummaryCard(summary, docId) {
    const card = document.createElement('div');
    card.className = 'summary-card';

    let actionButton = '';
    if (summary.pdfUrl) {
        actionButton = `<a href="${summary.pdfUrl}" target="_blank" class="summary-btn"><i class="fas fa-download"></i> تحميل PDF</a>`;
    } else if (summary.externalUrl) {
        actionButton = `<a href="${summary.externalUrl}" target="_blank" class="summary-btn external-link"><i class="fas fa-external-link-alt"></i> فتح الرابط</a>`;
    } else if (summary.content) {
        actionButton = `<button class="summary-btn" onclick="viewSummaryContent('${docId}')"><i class="fas fa-eye"></i> عرض المحتوى</button>`;
    }

    card.innerHTML = `
        ${summary.imageUrl ? `<div class="summary-image"><img src="${summary.imageUrl}" alt="${summary.title}" loading="lazy"></div>` : ''}
        <div class="summary-content">
            <h3>${summary.title || 'ملخص'}</h3>
            ${summary.description ? `<p>${summary.description}</p>` : ''}
            <div class="summary-meta">
                ${summary.author ? `<span><i class="fas fa-user"></i> ${summary.author}</span>` : ''}
            </div>
            ${actionButton}
        </div>
    `;

    return card;
}

// View summary content in modal
function viewSummaryContent(docId) {
    console.log('View summary:', docId);
}

// Load summaries on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSummaries();
});
