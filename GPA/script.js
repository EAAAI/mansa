// نظام التقديرات حسب لائحة كلية الحاسبات والمعلومات - جامعة كفر الشيخ
const gradeSystem = {
    'A+': { points: 4.0, percentage: 96 },
    'A': { points: 3.7, percentage: 92 },
    'A-': { points: 3.4, percentage: 88 },
    'B+': { points: 3.2, percentage: 84 },
    'B': { points: 3.0, percentage: 80 },
    'B-': { points: 2.8, percentage: 76 },
    'C+': { points: 2.6, percentage: 72 },
    'C': { points: 2.4, percentage: 68 },
    'C-': { points: 2.2, percentage: 64 },
    'D+': { points: 2.0, percentage: 60 },
    'D': { points: 1.5, percentage: 55 },
    'D-': { points: 1.0, percentage: 50 },
    'F': { points: 0.0, percentage: 0 },
    'Abs': { points: 0.0, percentage: 0 },
    'W': { points: null, percentage: null },
    'I': { points: null, percentage: null },
    'Con': { points: null, percentage: null }
};

// المواد (بدون Math 0)
const courses = [
    { name: 'Math 1', hours: 3, counted: true },
    { name: 'تاريخ حوسبة', hours: 2, counted: true },
    { name: 'قوانين حوسبة', hours: 2, counted: true },
    { name: 'إنجليزي', hours: 2, counted: true },
    { name: 'فيزياء', hours: 3, counted: true },
    { name: 'إلكترونيات', hours: 3, counted: true },
    { name: 'IT', hours: 3, counted: true }
];

// مواد الأمن السيبراني
const cyberCourses = [
    { name: 'المسئولية القانونية عن جرائم الأمن السيبراني', hours: 3, counted: true },
    { name: 'فيزياء عامة', hours: 3, counted: true },
    { name: 'Math 1', hours: 3, counted: true },
    { name: 'مقدمة في الحاسبات وأمن المعلومات', hours: 3, counted: true },
    { name: 'تراكيب محددة', hours: 3, counted: true },
    { name: 'تصميم منطقي', hours: 3, counted: true }
];

// مواد الأهلية CS
const ahliaCourses = [
    { name: 'فيزياء', hours: 3, counted: true },
    { name: 'الالكترونيات', hours: 3, counted: true },
    { name: 'Math 1', hours: 3, counted: true },
    { name: 'اساسيات تكنولوجيا المعلومات', hours: 3, counted: true },
    { name: 'قوانين الكمبيوتر', hours: 2, counted: true },
    { name: 'الانجليزي', hours: 2, counted: true },
    { name: 'تاريخ الحوسبه', hours: 2, counted: true }
];

let currentSpecialization = 'general';

// عرض حاسبة GPA
function showGPACalculator(specialization) {
    currentSpecialization = specialization;

    // تحديث الثيم حسب التخصص
    if (specialization === 'cyber') {
        document.body.classList.remove('ahlia-theme');
        document.body.classList.add('cyber-theme');
        document.getElementById('coursesTitle').innerHTML = '<i class="fas fa-shield-alt"></i> المواد الدراسية - الأمن السيبراني';
    } else if (specialization === 'ahlia') {
        document.body.classList.remove('cyber-theme');
        document.body.classList.add('ahlia-theme');
        document.getElementById('coursesTitle').innerHTML = '<i class="fas fa-bullseye"></i> المواد الدراسية - الأهلية CS';
    } else {
        document.body.classList.remove('cyber-theme');
        document.body.classList.remove('ahlia-theme');
        document.getElementById('coursesTitle').innerHTML = '<i class="fas fa-book-open"></i> المواد الدراسية - الترم الأول';
    }

    // إظهار جميع الأقسام
    document.getElementById('previousGPASection').classList.remove('hidden');
    document.getElementById('coursesSection').classList.remove('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    // تحميل المواد
    loadCourses();

    // إخفاء قسم الخيارات الرئيسية
    document.querySelector('.main-options-section').classList.add('hidden');

    // التمرير للأسفل
    setTimeout(() => {
        document.getElementById('coursesSection').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// تحميل المواد
function loadCourses() {
    const container = document.getElementById('coursesContainer');
    container.innerHTML = '';

    // اختيار المواد حسب التخصص
    let selectedCourses;
    if (currentSpecialization === 'cyber') {
        selectedCourses = cyberCourses;
    } else if (currentSpecialization === 'ahlia') {
        selectedCourses = ahliaCourses;
    } else {
        selectedCourses = courses;
    }

    selectedCourses.forEach((course, index) => {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-card';
        courseDiv.id = `course-${index}`;

        courseDiv.innerHTML = `
            <div class="course-card-header">
                <div class="course-number">${index + 1}</div>
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-hours">${course.hours} ساعة معتمدة</div>
                </div>
            </div>
            <select id="courseGrade-${index}" class="course-select" required>
                <option value="">اختر التقدير</option>
                <optgroup label="ممتاز">
                    <option value="A+">A+ (4.0) - 96% فأكثر</option>
                    <option value="A">A (3.7) - 92% - 96%</option>
                    <option value="A-">A- (3.4) - 88% - 92%</option>
                </optgroup>
                <optgroup label="جيد جداً">
                    <option value="B+">B+ (3.2) - 84% - 88%</option>
                    <option value="B">B (3.0) - 80% - 84%</option>
                    <option value="B-">B- (2.8) - 76% - 80%</option>
                </optgroup>
                <optgroup label="جيد">
                    <option value="C+">C+ (2.6) - 72% - 76%</option>
                    <option value="C">C (2.4) - 68% - 72%</option>
                    <option value="C-">C- (2.2) - 64% - 68%</option>
                </optgroup>
                <optgroup label="مقبول">
                    <option value="D+">D+ (2.0) - 60% - 64%</option>
                    <option value="D">D (1.5) - 55% - 60%</option>
                    <option value="D-">D- (1.0) - 50% - 55%</option>
                </optgroup>
                <optgroup label="راسب">
                    <option value="F">F (0.0) - أقل من 50%</option>
                </optgroup>
                <optgroup label="حالات خاصة">
                    <option value="Abs">Abs - غياب</option>
                    <option value="W">W - انسحاب</option>
                    <option value="I">I - غير مكتمل</option>
                    <option value="Con">Con - مستمر</option>
                </optgroup>
            </select>
        `;

        // حفظ بيانات المادة
        courseDiv.dataset.courseName = course.name;
        courseDiv.dataset.courseHours = course.hours;
        courseDiv.dataset.courseCounted = course.counted;

        container.appendChild(courseDiv);
    });
}

// حساب المعدل
function calculateGPA() {
    let totalPoints = 0;
    let totalHours = 0;
    let isValid = true;
    let errorMessages = [];

    // اختيار المواد حسب التخصص
    let selectedCourses;
    if (currentSpecialization === 'cyber') {
        selectedCourses = cyberCourses;
    } else if (currentSpecialization === 'ahlia') {
        selectedCourses = ahliaCourses;
    } else {
        selectedCourses = courses;
    }

    selectedCourses.forEach((course, index) => {
        const gradeSelect = document.getElementById(`courseGrade-${index}`);
        const grade = gradeSelect.value;

        // التحقق من إدخال التقدير
        if (!grade) {
            errorMessages.push(`❌ ${course.name}: الرجاء اختيار التقدير`);
            gradeSelect.style.borderColor = 'red';
            isValid = false;
        } else {
            gradeSelect.style.borderColor = '';

            // حساب النقاط والساعات (فقط للمواد المحتسبة)
            if (course.counted && gradeSystem[grade].points !== null) {
                totalPoints += gradeSystem[grade].points * course.hours;
                totalHours += course.hours;
            }
        }
    });

    if (!isValid) {
        alert(errorMessages.join('\n'));
        return;
    }

    if (totalHours === 0) {
        alert('⚠️ لا توجد مواد محتسبة');
        return;
    }

    // حساب المعدل الفصلي (GPA)
    const semesterGPA = (totalPoints / totalHours).toFixed(2);

    // حساب المعدل التراكمي (CGPA)
    const previousGPA = parseFloat(document.getElementById('previousGPA').value) || 0;
    const previousHours = parseFloat(document.getElementById('previousHours').value) || 0;

    let cumulativeGPA;
    let totalCumulativeHours;

    if (previousGPA > 0 && previousHours > 0) {
        const previousTotalPoints = previousGPA * previousHours;
        const newTotalPoints = previousTotalPoints + totalPoints;
        totalCumulativeHours = previousHours + totalHours;
        cumulativeGPA = (newTotalPoints / totalCumulativeHours).toFixed(2);
    } else {
        cumulativeGPA = semesterGPA;
        totalCumulativeHours = totalHours;
    }

    // تحديد التقدير العام
    const overallGrade = getGradeDescription(parseFloat(cumulativeGPA));

    // عرض النتائج
    document.getElementById('semesterGPA').textContent = semesterGPA;
    document.getElementById('cumulativeGPA').textContent = cumulativeGPA;
    document.getElementById('totalHours').textContent = totalCumulativeHours;
    document.getElementById('overallGrade').textContent = overallGrade;

    // إضافة ألوان للتقديرات
    const gradeElement = document.getElementById('overallGrade');
    gradeElement.className = 'result-grade';

    if (parseFloat(cumulativeGPA) >= 3.4) {
        gradeElement.style.color = '#16a34a';
    } else if (parseFloat(cumulativeGPA) >= 2.8) {
        gradeElement.style.color = '#2563eb';
    } else if (parseFloat(cumulativeGPA) >= 2.2) {
        gradeElement.style.color = '#eab308';
    } else if (parseFloat(cumulativeGPA) >= 1.0) {
        gradeElement.style.color = '#ea580c';
    } else {
        gradeElement.style.color = '#dc2626';
    }

    // إظهار قسم النتائج
    document.getElementById('results').classList.remove('hidden');

    // التمرير إلى النتائج
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// الحصول على وصف التقدير
function getGradeDescription(gpa) {
    if (gpa >= 3.4) return 'ممتاز 🌟';
    if (gpa >= 2.8) return 'جيد جداً ⭐';
    if (gpa >= 2.2) return 'جيد ✓';
    if (gpa >= 1.0) return 'مقبول';
    return 'راسب';
}

// إعادة تعيين الحاسبة
function resetCalculator() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
        location.reload();
    }
}

// إظهار/إخفاء جدول التقديرات
function toggleGradeTable() {
    const table = document.getElementById('gradeTable');
    table.classList.toggle('hidden');

    if (!table.classList.contains('hidden')) {
        table.scrollIntoView({ behavior: 'smooth' });
    }
}

// إضافة تأثيرات عند التحميل
document.addEventListener('DOMContentLoaded', function () {
    // إضافة أنيميشن للعناصر
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideIn 0.5s ease-out';
            }
        });
    });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});
