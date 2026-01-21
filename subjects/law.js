// Firebase Configuration
const firebaseConfig = { apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4", authDomain: "manasa-ceaa2.firebaseapp.com", projectId: "manasa-ceaa2", storageBucket: "manasa-ceaa2.firebasestorage.app", messagingSenderId: "847284305108", appId: "1:847284305108:web:7a14698f76b3981c6acf41" };
let db; try { firebase.initializeApp(firebaseConfig); db = firebase.firestore(); } catch (e) { }

// Mobile Menu Toggle
function toggleMobileMenu() { const navLinks = document.querySelector('.nav-links'); const toggleBtn = document.querySelector('.mobile-menu-toggle i'); navLinks.classList.toggle('active'); toggleBtn.classList.toggle('fa-chevron-down'); toggleBtn.classList.toggle('fa-chevron-up'); }

// Theme System
function setTheme(theme) { const body = document.body; const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {}; body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme'); if (theme !== 'default') { body.classList.add(theme + '-theme'); } userProfile.theme = theme; localStorage.setItem('userProfile', JSON.stringify(userProfile)); const toggle = document.querySelector('.theme-toggle i'); const icons = { 'default': 'fa-moon', 'space': 'fa-rocket', 'ocean': 'fa-water', 'sunset': 'fa-sun', 'pyramids': 'fa-mountain', 'winter': 'fa-snowflake' }; if (toggle) toggle.className = 'fas ' + (icons[theme] || 'fa-moon'); }
function cycleTheme() { const themes = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter']; const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {}; const currentTheme = userProfile.theme || 'default'; const currentIndex = themes.indexOf(currentTheme); setTheme(themes[(currentIndex + 1) % themes.length]); }
function loadSavedTheme() { const userProfile = JSON.parse(localStorage.getItem('userProfile')); if (userProfile?.theme && userProfile.theme !== 'default') { setTheme(userProfile.theme); } }
document.addEventListener('DOMContentLoaded', loadSavedTheme);

const SUBJECT_ID = 'law';
const SUBJECT_NAME = 'قوانين الحاسب';
const CHALLENGE_TIME = 300;
const QUESTIONS_PER_CHALLENGE = 15;
const GEMINI_API_KEY = 'AIzaSyBaUgHBLPT2VxapoYZ2SSGB7PKpxz45uB8';

// MCQ Questions - Bilingual Format (questionAr, questionEn, options, correct)
// Add your questions here in this format:
// { questionAr: "السؤال بالعربية", questionEn: "Question in English", options: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: 0 }
const questions = [
    // Cybercrime & Cyber Law Questions
    {
        questionAr: "ما هو تعريف الجريمة الإلكترونية؟",
        questionEn: "Definition of cybercrime?",
        options: ["Offense targeting data", "Physical crimes with computers", "Writing malicious software", "Ethical hacking for security"],
        correct: 0
    },
    {
        questionAr: "أي من هؤلاء ليس مهنة في مجال الجرائم الإلكترونية؟",
        questionEn: "NOT a profession in cybercrimes?",
        options: ["Network Engineers", "Cyber Law Experts", "Cyber Forensic Pros", "Environmental Scientists"],
        correct: 3
    },
    {
        questionAr: "ما هو دور خبراء القانون السيبراني؟",
        questionEn: "Role of cyber law experts?",
        options: ["Conducting forensics", "Handling online fraud", "Designing hardware", "Developing anti-virus"],
        correct: 1
    },
    {
        questionAr: "كيف تساعد ضوابط الأجهزة المادية في تأمين أنظمة المعلومات؟",
        questionEn: "How can physical hardware controls help secure information systems?",
        options: ["Enabling dynamic web services", "Ensuring equipment security and functionality", "Simplifying database structures", "Limiting software installations"],
        correct: 1
    },
    {
        questionAr: "مثال على جريمة إلكترونية ضد شخص؟",
        questionEn: "Example of cybercrime against a person?",
        options: ["Hacking govt. systems", "Cyber-stalking via emails", "Installing software", "Attacking public databases"],
        correct: 1
    },
    {
        questionAr: "ما التحدي الذي تشكله الإدارة السيئة للأمن؟",
        questionEn: "What challenge does poor management pose to security?",
        options: ["Encouraging network monitoring", "Increasing backup redundancy", "Adding risks to organizational and environmental factors", "Reducing administrative controls"],
        correct: 2
    },
    {
        questionAr: "ما الغرض من انتحال البريد الإلكتروني؟",
        questionEn: "Purpose of email spoofing?",
        options: ["Tracking activities", "Misrepresenting email origin", "Encrypting contents", "Using emails for ransomware"],
        correct: 1
    },
    {
        questionAr: "ما هو الهدف الرئيسي لمجرمي الإنترنت الذين يستخدمون برامج تسجيل ضغطات المفاتيح؟",
        questionEn: "What is the primary goal of cybercriminals using keyloggers?",
        options: ["Destroying files", "Installing spyware", "To capture and steal keystroke data", "Encrypting devices"],
        correct: 2
    },
    {
        questionAr: "ما هو مثال على جريمة إلكترونية تستهدف البنية التحتية؟",
        questionEn: "What is an example of a cybercrime targeting infrastructure?",
        options: ["Distributed Denial-of-Service (DDoS) attack", "Phishing email", "Keylogging", "Social engineering"],
        correct: 0
    },
    {
        questionAr: "أي مما يلي يصف فيروس الفدية بشكل أفضل؟",
        questionEn: "Which of the following best describes ransomware?",
        options: ["Malware for stealing passwords", "A type of malware that encrypts data and demands payment", "Software vulnerability", "A phishing attack"],
        correct: 1
    },
    {
        questionAr: "ما هو دور محترف تكنولوجيا المعلومات في الجريمة الإلكترونية؟",
        questionEn: "IT professional's role in cybercrime?",
        options: ["Protecting data", "Unauthorized intrusion", "Legal framework design", "Filing copyright violations"],
        correct: 0
    },
    {
        questionAr: "من يتعامل مع انتهاكات حقوق النشر؟",
        questionEn: "Handles copyright infringement?",
        options: ["Ethical hackers", "Cyber forensic labs", "Cyber law experts", "IT Governance Professionals"],
        correct: 2
    },
    {
        questionAr: "في سياق الجريمة الإلكترونية، على ماذا تعتمد الهندسة الاجتماعية؟",
        questionEn: "In the context of cybercrime, what does 'social engineering' rely on?",
        options: ["Manipulating human behavior", "Software vulnerabilities", "Hardware malfunctions", "Encryption"],
        correct: 0
    },
    {
        questionAr: "ما هو دور خلية أبحاث الجرائم الإلكترونية؟",
        questionEn: "Role of cybercrime research cell?",
        options: ["Preventing dev errors", "Researching crime patterns", "Data sharing enforcement", "Monitoring environmental impacts"],
        correct: 1
    },
    {
        questionAr: "أي جهة ليست منخرطة في القانون السيبراني؟",
        questionEn: "Agency NOT involved in cyber law?",
        options: ["Cyber forensic labs", "Law enforcement agencies", "Academic institutions", "e-Governance bodies"],
        correct: 3
    },
    {
        questionAr: "ما هو محور المطاردة الإلكترونية؟",
        questionEn: "Focus of cyberstalking?",
        options: ["Digital physical threats", "Sending unwanted ads", "Credit card theft", "Masking a mobile number"],
        correct: 0
    },
    {
        questionAr: "ماذا يتضمن الاختراق بشكل أساسي؟",
        questionEn: "Hacking primarily involves?",
        options: ["Authorized data access", "Unauthorized system access", "Writing email scripts", "Developing encryption tools"],
        correct: 1
    },
    {
        questionAr: "ما هو الهدف من انتحال الرسائل القصيرة؟",
        questionEn: "Target of SMS spoofing?",
        options: ["Encrypting messages", "Impersonating phone identity", "Fake mobile networks", "Enforcing digital regulations"],
        correct: 1
    },
    {
        questionAr: "ما هو محور الأمن السيبراني؟",
        questionEn: "Focus of cybersecurity?",
        options: ["Strong passwords", "Combating system threats", "Writing anti-virus", "Patent protections"],
        correct: 1
    },
    {
        questionAr: "ما هي الجريمة الإلكترونية المستخدمة للاحتيال المالي؟",
        questionEn: "Cybercrime for financial fraud?",
        options: ["Defamation", "Carding", "Cyberstalking", "Spoofing"],
        correct: 1
    },
    // Questions 21-40
    {
        questionAr: "ما هو الشكل الشائع لجرائم الملكية الفكرية؟",
        questionEn: "What is a common form of intellectual property crime?",
        options: ["Domain squatting", "Cyber stalking", "Software piracy", "Online banking fraud"],
        correct: 2
    },
    {
        questionAr: "ماذا يتضمن التخريب الإلكتروني؟",
        questionEn: "Cyber vandalism involves?",
        options: ["Deliberate damage to computer data", "Illegal credit card use", "Online gambling", "Unauthorized login"],
        correct: 0
    },
    {
        questionAr: "ماذا يتضمن الاستيلاء على النطاقات؟",
        questionEn: "What does cyber squatting involve?",
        options: ["Unauthorized system access", "Dispute over domain names", "Malware creation", "File encryption"],
        correct: 1
    },
    {
        questionAr: "ماذا يعني التعدي الإلكتروني؟",
        questionEn: "What does cyber trespass mean?",
        options: ["Financial fraud", "Unauthorized access to a computer", "Phishing attacks", "Trafficking human beings"],
        correct: 1
    },
    {
        questionAr: "كيف يتم تحديد سرقة وقت الإنترنت؟",
        questionEn: "Internet time theft is identified by?",
        options: ["Cyber terrorism", "Delayed network connectivity", "Frequent recharging despite low usage", "Unauthorized logins"],
        correct: 2
    },
    {
        questionAr: "أي جريمة تصنف ضد الحكومة؟",
        questionEn: "Which crime is classified against the government?",
        options: ["Cyber terrorism", "Phishing", "Spyware attacks", "Online auctions"],
        correct: 0
    },
    {
        questionAr: "ماذا تتضمن المواد الإباحية للأطفال؟",
        questionEn: "Child pornography involves?",
        options: ["Creation and distribution of exploitative materials", "Internet credit card fraud", "Cyberstalking", "Gambling with underage accounts"],
        correct: 0
    },
    {
        questionAr: "أي مما يلي ليس تقنية احتيال عبر الإنترنت؟",
        questionEn: "Which is NOT an online fraud technique?",
        options: ["Phishing", "Spyware", "Domain squatting", "Internet banking fraud"],
        correct: 2
    },
    {
        questionAr: "ما هو هدف التصيد الاحتيالي؟",
        questionEn: "Phishing aims to?",
        options: ["Steal personal identity information", "Disable banking software", "Distribute fake emails", "Hack into devices"],
        correct: 0
    },
    {
        questionAr: "ما هو الإجراء الوقائي ضد الاحتيال عبر الإنترنت؟",
        questionEn: "What is a preventative measure against online fraud?",
        options: ["Avoiding online purchases", "Avoiding antivirus updates", "Sharing personal data online", "Using a separate low-limit card"],
        correct: 3
    },
    {
        questionAr: "ما هو منع الجريمة من المستوى الثالث؟",
        questionEn: "What is tertiary crime prevention?",
        options: ["Focus on at-risk youth", "Prevent successive incidents after crime", "Stop online frauds", "Analyze criminal psychology"],
        correct: 1
    },
    {
        questionAr: "ماذا تتضمن الجريمة الإلكترونية ضد المجتمع ككل؟",
        questionEn: "What does 'cybercrime against society at large' include?",
        options: ["Cyber vandalism", "Cyber stalking", "Cyber trafficking", "Domain disputes"],
        correct: 2
    },
    {
        questionAr: "ما هو الدور الأساسي لجدار الحماية؟",
        questionEn: "What is the primary role of a firewall?",
        options: ["Block unauthorized access", "Encrypt sensitive files", "Remove spyware", "Prevent phishing attacks"],
        correct: 0
    },
    {
        questionAr: "كيف يحمي برنامج مكافحة الفيروسات جهاز الكمبيوتر الخاص بك؟",
        questionEn: "How does antivirus software protect your computer?",
        options: ["Managing passwords", "Securing Wi-Fi networks", "Monitoring online activity for malicious software", "Blocking spam emails"],
        correct: 2
    },
    {
        questionAr: "لماذا يجب تأمين شبكات Wi-Fi؟",
        questionEn: "Why should Wi-Fi networks be secured?",
        options: ["To prevent unauthorized intrusion", "To encrypt files", "To prevent software updates", "To disable unwanted emails"],
        correct: 0
    },
    {
        questionAr: "ما الذي يجعل كلمة المرور قوية؟",
        questionEn: "What makes a strong password?",
        options: ["Using dictionary words", "Avoiding numbers", "Combination of letters, numbers, and special characters", "Password longer than four digits"],
        correct: 2
    },
    {
        questionAr: "لماذا من المهم مراجعة البيانات المالية؟",
        questionEn: "Why is it important to review financial statements?",
        options: ["To avoid taxes", "To detect fraudulent activities early", "To manage your credit score", "To backup data"],
        correct: 1
    },
    {
        questionAr: "ما هو الاحتياط لاستخدام وسائل التواصل الاجتماعي؟",
        questionEn: "What is a precaution for social media usage?",
        options: ["Set profiles to private", "Always post your location", "Share passwords with close friends", "Disable privacy settings"],
        correct: 0
    },
    {
        questionAr: "ما هي ميزة إيقاف تشغيل الكمبيوتر؟",
        questionEn: "What is an advantage of turning off the computer?",
        options: ["Keeps Wi-Fi secure", "Encrypts all data", "Scans files for viruses", "Severs attack connections"],
        correct: 3
    },
    {
        questionAr: "ما الذي يجب التأكد منه بشأن المواقع قبل إعطاء المعلومات الشخصية؟",
        questionEn: "What should you ensure about websites before giving personal information?",
        options: ["They load quickly", "They have many users", "They are secure", "They offer free services"],
        correct: 2
    },
    // Questions 41-60
    {
        questionAr: "أي إجراء يمكن أن يساعد في تجنب عمليات الاحتيال عبر الإنترنت؟",
        questionEn: "Which action can help avoid scams online?",
        options: ["Always click on offers quickly", "Verify sources of emails and links", "Share personal details freely", "Respond to all messages"],
        correct: 1
    },
    {
        questionAr: "لمن يجب الإبلاغ عن المحتوى غير القانوني عبر الإنترنت؟",
        questionEn: "Who should you report illegal online content to?",
        options: ["Local police", "Antivirus providers", "Social media platforms", "Internet service providers"],
        correct: 2
    },
    {
        questionAr: "ما هي الممارسة الأساسية لأمان الأجهزة المحمولة؟",
        questionEn: "Which is a key practice for mobile device security?",
        options: ["Disabling software updates", "Downloading apps from trusted sources", "Sharing login details", "Avoiding use of firewalls"],
        correct: 1
    },
    {
        questionAr: "ماذا يتضمن 'الذكاء في وسائل التواصل الاجتماعي'؟",
        questionEn: "What does 'being social-media savvy' involve?",
        options: ["Sharing personal information freely", "Turning off privacy settings", "Posting frequently to stay active", "Being cautious with shared information and adjusting security settings"],
        correct: 3
    },
    {
        questionAr: "ما الذي يحدد المخترق في أنظمة الكمبيوتر؟",
        questionEn: "What defines a hacker in computer systems?",
        options: ["Exploits weaknesses in systems", "Writes antivirus programs", "Encrypts online data", "Manages networks"],
        correct: 0
    },
    {
        questionAr: "ما هو الدافع الأساسي للمخترق الخبيث (Cracker)؟",
        questionEn: "What is a cracker's primary motive?",
        options: ["Enhancing software performance", "Writing secure code", "Destroying or breaching systems", "Upgrading firewalls"],
        correct: 2
    },
    {
        questionAr: "إلى ماذا يشير مصطلح البرامج الضارة (Malware)؟",
        questionEn: "What does malware refer to?",
        options: ["Malicious software", "Secure encryption tools", "Firewall programs", "System optimization software"],
        correct: 0
    },
    {
        questionAr: "كيف ينتشر الفيروس؟",
        questionEn: "How does a virus spread?",
        options: ["Through emails only", "By inserting itself into other code or documents", "By directly accessing the user's network", "Via unauthorized remote login"],
        correct: 1
    },
    {
        questionAr: "ما الذي يميز الدودة عن الفيروس؟",
        questionEn: "What is unique about a worm compared to a virus?",
        options: ["It spreads without user intervention", "It cannot self-replicate", "It requires manual activation", "It attaches to system files directly"],
        correct: 0
    },
    {
        questionAr: "ما هي السمة الرئيسية لحصان طروادة؟",
        questionEn: "What is the primary trait of a Trojan Horse?",
        options: ["Encrypts all data", "Deletes unnecessary files", "Appears benign but contains harmful content", "Functions as antivirus software"],
        correct: 2
    },
    {
        questionAr: "بماذا ترتبط البرامج الإضافية (Bonus software) عادةً؟",
        questionEn: "What is bonus software commonly associated with?",
        options: ["Boosting system performance", "Being included unknowingly in other packages", "Virus replication", "Collecting user data"],
        correct: 1
    },
    {
        questionAr: "ما الوظيفة الشائعة التي تستخدمها البرامج الضارة للانتشار؟",
        questionEn: "What common function do malware programs use to spread?",
        options: ["Sending email attachments", "Sharing system settings", "Encrypting sensitive data", "Monitoring ISP traffic"],
        correct: 0
    },
    {
        questionAr: "كيف يمكن للبرامج الضارة جمع معلومات المستخدم؟",
        questionEn: "How can malware gather user information?",
        options: ["By increasing system performance", "By scanning shared online files", "By sending computer data back to its creator", "By isolating critical networks"],
        correct: 2
    },
    {
        questionAr: "ما الإجراء الذي قد تقوم به البرامج الضارة فور إصابة النظام؟",
        questionEn: "Which action might malware perform immediately upon infecting a system?",
        options: ["Encrypt sensitive data", "Redirect user email", "Deactivate security settings", "Erase or overwrite hard disk files"],
        correct: 2
    },
    {
        questionAr: "ماذا تتضمن الجدولة في البرامج الضارة عادةً؟",
        questionEn: "What does scheduling in malware commonly involve?",
        options: ["Preventing future updates", "Activating harmful actions on a later date", "Securing backup files", "Enhancing scheduled scans"],
        correct: 1
    },
    {
        questionAr: "ما هما النوعان الرئيسيان لأنظمة كشف التسلل (IDS)؟",
        questionEn: "What are the two main types of Intrusion Detection Systems (IDS)?",
        options: ["Network-based and Host-based", "Firewall and malware-based", "Antivirus and Trojan monitoring", "Real-time and delayed alerts"],
        correct: 0
    },
    {
        questionAr: "ما هي وظيفة برنامج الحمولة (Payload)؟",
        questionEn: "What is a function of payload software?",
        options: ["Runs during system or program startup", "Strengthens system firewalls", "Deletes unnecessary system files", "Manages user access"],
        correct: 0
    },
    {
        questionAr: "ماذا يفعل برنامج تتبع/تعديل الويب؟",
        questionEn: "What does web tracking/modification software do?",
        options: ["Prevents pop-up ads", "Secures website transactions", "Tracks visited websites and displays ads", "Encrypts user sessions"],
        correct: 2
    },
    {
        questionAr: "ما هو الغرض من برنامج الباب الخلفي (Backdoor)؟",
        questionEn: "What is the purpose of backdoor software?",
        options: ["Enables unauthorized remote access", "Removes malicious files", "Blocks malicious ads", "Optimizes application performance"],
        correct: 0
    },
    {
        questionAr: "لماذا تُستهدف أجهزة Windows بالبرامج الضارة أكثر من أنظمة Unix أو Macintosh؟",
        questionEn: "Why are Windows machines more targeted by malware than Unix or Macintosh systems?",
        options: ["They have stronger firewalls", "Their large user base makes them more attractive targets", "They have superior plug-ins", "They lack dynamic program support"],
        correct: 1
    },
    // Questions 61-80
    {
        questionAr: "ما المخاطر التي يشكلها تشغيل البرامج الديناميكية (مثل Javascript) في المتصفحات؟",
        questionEn: "What risk does running dynamic programs (e.g., Javascript) in browsers pose?",
        options: ["Enhances page speed", "Automatically applies patches", "Allows programs to execute harmful actions", "Prevents unauthorized file sharing"],
        correct: 2
    },
    {
        questionAr: "ما الذي يجعل الإضافات والملحقات خطرة على المتصفحات؟",
        questionEn: "What makes plug-ins and add-ons risky for browsers?",
        options: ["They slow down system performance", "They monitor system usage", "They manage file sharing policies", "They can perform any action allowed by the base program"],
        correct: 3
    },
    {
        questionAr: "ما هي الثغرات الأمنية في نظام التشغيل؟",
        questionEn: "What are security holes in an operating system?",
        options: ["Programs managing security settings", "Bugs allowing unauthorized access", "Firewall breaches caused by users", "Invalid application patches"],
        correct: 1
    },
    {
        questionAr: "كيف يمكن جعل مشاركة الملفات أكثر أماناً؟",
        questionEn: "How can file sharing be made more secure?",
        options: ["Removing file permissions entirely", "Using dynamic Java programs", "Applying robust user credentials and limited privileges", "Increasing bandwidth"],
        correct: 2
    },
    {
        questionAr: "ما هو هجوم تواطؤ تطبيقات Android؟",
        questionEn: "What is an Android application collusion attack?",
        options: ["Single apps breaching permissions", "Two or more apps working together maliciously", "Unauthorized use of external storage", "Eavesdropping solely on device settings"],
        correct: 1
    },
    {
        questionAr: "ما الأذونات التي يتم تقسيمها في مثال هجوم التواطؤ؟",
        questionEn: "What permissions are split in a collusion attack example?",
        options: ["Call eavesdropping via intent-based communication and external storage", "System shutdown control", "Mobile encryption settings", "Web tracking and ad-blocking controls"],
        correct: 0
    },
    {
        questionAr: "كيف يمكن للمستخدمين تقليل المخاطر المرتبطة بالثغرات الأمنية؟",
        questionEn: "How can users mitigate risks associated with security holes?",
        options: ["Disabling system patches", "Removing file-sharing features", "Increasing plug-in usage", "Regularly applying patches"],
        correct: 3
    },
    {
        questionAr: "ما الذي يمكن أن يفعله المحتوى الديناميكي للويب (مثل ActiveX) عند السماح به من المتصفحات؟",
        questionEn: "What can dynamic web content (e.g., ActiveX) potentially do when allowed by browsers?",
        options: ["Perform objectionable actions", "Improve site encryption", "Manage file sharing settings", "Block unwanted ads"],
        correct: 0
    },
    {
        questionAr: "لماذا تكون بيئات العميل/الخادم متعددة المستويات عرضة للخطر؟",
        questionEn: "Why are multitier client/server environments vulnerable?",
        options: ["Lack of user training", "Frequent software updates", "Overuse of encryption protocols", "Vulnerabilities at each layer and communication between layers"],
        correct: 3
    },
    {
        questionAr: "ما الذي يزيد من الثغرات أثناء نقل البيانات؟",
        questionEn: "What increases vulnerability during data transmission?",
        options: ["Lack of encryption", "Regular system backups", "Constant firewall monitoring", "Automated software updates"],
        correct: 0
    },
    {
        questionAr: "أي مما يلي ليس ثغرة إنترنت؟",
        questionEn: "Which of the following is not an internet vulnerability?",
        options: ["Open access by users", "Use of DSL with fixed IPs", "Local storage of passwords", "Widespread email and instant messaging use"],
        correct: 2
    },
    {
        questionAr: "لماذا تعتبر الشبكات اللاسلكية أقل أماناً؟",
        questionEn: "Why are wireless networks considered less secure?",
        options: ["Limited data transmission", "Radio frequencies are easy to scan", "Dependence on proprietary devices", "High cost of secure configurations"],
        correct: 1
    },
    {
        questionAr: "ما الأداة التي يستخدمها المخترقون لاكتشاف شبكات Wi-Fi غير المحمية؟",
        questionEn: "What tool do hackers use to detect unprotected Wi-Fi networks?",
        options: ["Laptops with external antennae and hacking software", "Encrypted hard drives", "Fingerprint scanners", "Virus-scanning utilities"],
        correct: 0
    },
    {
        questionAr: "ما أهمية تقييم المخاطر في تأمين أنظمة المعلومات؟",
        questionEn: "What is the significance of risk assessment in securing information systems?",
        options: ["Improving hardware lifespan", "Optimizing file sharing", "Identifying vulnerable assets and determining cost-effective controls", "Automating management processes"],
        correct: 2
    },
    {
        questionAr: "كيف تساهم الرقابة الإدارية في الأمن؟",
        questionEn: "How does administrative control contribute to security?",
        options: ["Detecting unauthorized emails", "Establishing and enforcing rules and standards", "Updating data encryption methods", "Automating system alerts"],
        correct: 1
    },
    {
        questionAr: "ما الذي يجعل مرفقات البريد الإلكتروني خطرة بشكل خاص؟",
        questionEn: "What makes e-mail attachments particularly risky?",
        options: ["Disabling operating systems", "Slowing down network traffic", "Serving as springboards for malicious software", "Preventing antivirus updates"],
        correct: 2
    },
    {
        questionAr: "ما هي الميزة الرئيسية لضوابط البرامج العامة؟",
        questionEn: "What is a primary feature of general software controls?",
        options: ["Monitoring system software use", "Encrypting data backups", "Disabling unused devices", "Checking hardware malfunctions"],
        correct: 0
    },
    {
        questionAr: "كيف تزيد الثغرات الأمنية من نقاط ضعف النظام؟",
        questionEn: "How do security holes increase system vulnerabilities?",
        options: ["Allow attackers unauthorized access", "Facilitate faster data transfers", "Enable data synchronization", "Optimize system updates"],
        correct: 0
    },
    {
        questionAr: "ما الذي يجعل خدمات الهاتف القائمة على تقنية الإنترنت عرضة للخطر؟",
        questionEn: "What makes telephone services based on Internet technology vulnerable?",
        options: ["Constant monitoring by firewalls", "Lack of private secure networks", "Overuse of hardware controls", "Dependency on system patches"],
        correct: 1
    },
    {
        questionAr: "لماذا تعتبر ضوابط أمن البيانات العامة مهمة؟",
        questionEn: "Why do general data security controls matter?",
        options: ["They monitor email usage", "Enable remote system access", "Manage updates automatically", "Protect against unauthorized data access or changes"],
        correct: 3
    }
];

// Essay Questions (Bilingual)
const essayQuestions = [
    // Empty - Add essay questions here
    // Format: { questionAr: "...", questionEn: "...", answerAr: "...", answerEn: "..." }
];

// Challenge State
let challenge = { active: false, questions: [], currentIndex: 0, answers: [], score: 0, timeLeft: CHALLENGE_TIME, timerInterval: null, userName: '' };
let essayChallenge = { active: false, questions: [], currentIndex: 0, answers: [], timeLeft: 660, timerInterval: null, userName: '' };
const ESSAY_TIME = 660;
const ESSAYS_PER_CHALLENGE = 5;
const QUESTIONS_PER_PAGE = 5;
const ESSAYS_PER_PAGE = 3;
let currentBankPage = 1;
let currentEssayPage = 1;
let filteredQuestions = [];
let filteredEssay = [];

// Helper to get question text (supports both old and new format)
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

// Navigation
function updateActiveNav() { const sections = ['hero', 'summaries', 'bank', 'challenge', 'essay-bank', 'essay-challenge', 'leaderboard', 'ask-ai']; const navLinks = document.querySelectorAll('.nav-link'); let current = 'hero'; sections.forEach(id => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= 150) current = id; }); navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current)); }
document.querySelectorAll('.nav-link, .btn[href^="#"]').forEach(l => { l.addEventListener('click', function (e) { const h = this.getAttribute('href'); if (h.startsWith('#')) { e.preventDefault(); const t = document.querySelector(h); if (t) { const nav = document.querySelector('.subject-navbar').offsetHeight; window.scrollTo({ top: t.offsetTop - nav, behavior: 'smooth' }); } } }); });
window.addEventListener('scroll', updateActiveNav);

// Challenge Functions
function shuffleArray(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

function startChallenge() {
    const n = document.getElementById('challengerName'), name = n.value.trim();
    if (!name) { alert('من فضلك أدخل اسمك!'); n.focus(); return; }
    if (questions.length < QUESTIONS_PER_CHALLENGE) { alert('لا توجد أسئلة كافية في البنك'); return; }
    challenge.userName = name;
    challenge.questions = shuffleArray([...questions]).slice(0, QUESTIONS_PER_CHALLENGE);
    challenge.currentIndex = 0;
    challenge.answers = new Array(QUESTIONS_PER_CHALLENGE).fill(null);
    challenge.score = 0;
    challenge.timeLeft = CHALLENGE_TIME;
    challenge.active = true;
    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    showQuestion(0);
    startTimer();
}

function showQuestion(i) {
    const q = challenge.questions[i];
    document.getElementById('questionBadge').textContent = `السؤال ${i + 1}`;
    document.getElementById('questionText').innerHTML = getQuestionText(q);
    document.getElementById('questionProgress').textContent = `${i + 1}/${QUESTIONS_PER_CHALLENGE}`;
    const c = document.getElementById('optionsContainer');
    c.innerHTML = '';
    ['أ', 'ب', 'ج', 'د'].forEach((l, j) => {
        if (j < q.options.length) {
            const b = document.createElement('button');
            b.className = 'option-btn' + (challenge.answers[i] === j ? ' selected' : '');
            b.innerHTML = `<span class="option-letter">${l}</span><span>${q.options[j]}</span>`;
            b.onclick = () => selectOption(j);
            c.appendChild(b);
        }
    });
    document.getElementById('prevBtn').disabled = i === 0;
    document.getElementById('nextBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'none' : 'flex';
    document.getElementById('submitBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'flex' : 'none';
}

function selectOption(j) { challenge.answers[challenge.currentIndex] = j; document.querySelectorAll('.option-btn').forEach((b, k) => b.classList.toggle('selected', k === j)); }
function nextQuestion() { if (challenge.currentIndex < QUESTIONS_PER_CHALLENGE - 1) showQuestion(++challenge.currentIndex); }
function prevQuestion() { if (challenge.currentIndex > 0) showQuestion(--challenge.currentIndex); }
function startTimer() { updateTimerDisplay(); challenge.timerInterval = setInterval(() => { challenge.timeLeft--; updateTimerDisplay(); if (challenge.timeLeft <= 60) document.getElementById('timer').classList.add('warning'); if (challenge.timeLeft <= 0) submitChallenge(); }, 1000); }
function updateTimerDisplay() { const m = Math.floor(challenge.timeLeft / 60), s = challenge.timeLeft % 60; document.getElementById('timerDisplay').textContent = `${m}:${s.toString().padStart(2, '0')}`; }
function submitChallenge() { clearInterval(challenge.timerInterval); let score = 0; challenge.questions.forEach((q, i) => { if (challenge.answers[i] === q.correct) score++; }); challenge.score = score; const time = CHALLENGE_TIME - challenge.timeLeft, pct = Math.round((score / QUESTIONS_PER_CHALLENGE) * 100); document.getElementById('challengeContainer').style.display = 'none'; document.getElementById('challengeResult').style.display = 'block'; document.getElementById('finalScore').textContent = `${score}/${QUESTIONS_PER_CHALLENGE}`; document.getElementById('finalTime').textContent = formatTime(time); document.getElementById('percentage').textContent = `${pct}%`; let icon, title; if (pct >= 90) { icon = '🏆'; title = 'ممتاز!'; } else if (pct >= 70) { icon = '🌟'; title = 'أحسنت!'; } else if (pct >= 50) { icon = '💪'; title = 'جيد!'; } else { icon = '📚'; title = 'حاول مرة أخرى'; } document.getElementById('resultIcon').textContent = icon; document.getElementById('resultTitle').textContent = title; saveToLeaderboard(score, time); }
function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; }
function restartChallenge() { document.getElementById('challengeResult').style.display = 'none'; document.getElementById('challengeIntro').style.display = 'block'; document.getElementById('timer').classList.remove('warning'); }

// Firebase
async function saveToLeaderboard(score, time) { if (!db) return; try { await db.collection(`leaderboard_${SUBJECT_ID}`).add({ name: challenge.userName, score, time, date: new Date().toISOString(), timestamp: firebase.firestore.FieldValue.serverTimestamp() }); loadLeaderboard(); } catch (e) { } }
async function loadLeaderboard() { if (!db) { document.getElementById('noRecords').style.display = 'block'; return; } try { const snap = await db.collection(`leaderboard_${SUBJECT_ID}`).orderBy('score', 'desc').orderBy('time', 'asc').limit(20).get(); const tb = document.getElementById('leaderboardBody'); tb.innerHTML = ''; if (snap.empty) { document.getElementById('noRecords').style.display = 'block'; return; } document.getElementById('noRecords').style.display = 'none'; document.getElementById('totalPlayers').textContent = snap.size; snap.docs.forEach((d, i) => { const data = d.data(); const tr = document.createElement('tr'); let r = i + 1; if (i === 0) r = '🥇'; else if (i === 1) r = '🥈'; else if (i === 2) r = '🥉'; tr.innerHTML = `<td>${r}</td><td>${data.name}</td><td>${data.score}/${QUESTIONS_PER_CHALLENGE}</td><td>${formatTime(data.time)}</td><td>${data.date ? new Date(data.date).toLocaleDateString('ar-EG') : '-'}</td>`; tb.appendChild(tr); }); } catch (e) { document.getElementById('noRecords').style.display = 'block'; } }

// Interactive Questions Bank - Supports Bilingual
function renderQuestionsBank(showAll = false) {
    const container = document.getElementById('questionsList');
    container.innerHTML = '';
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredQuestions = questions;
    if (searchTerm) {
        filteredQuestions = questions.filter(q =>
            getQuestionTextPlain(q).toLowerCase().includes(searchTerm) ||
            q.options.some(o => o.toLowerCase().includes(searchTerm))
        );
        currentBankPage = 1;
    }
    document.getElementById('displayedCount').textContent = filteredQuestions.length;
    if (!filteredQuestions.length) { container.innerHTML = '<p class="no-records">لا توجد أسئلة حالياً</p>'; return; }
    const letters = ['أ', 'ب', 'ج', 'د'];
    const questionsToShow = showAll ? filteredQuestions : filteredQuestions.slice(0, currentBankPage * QUESTIONS_PER_PAGE);
    questionsToShow.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'bank-question-card';
        card.dataset.correct = q.correct;
        card.dataset.answered = 'false';
        let optionsHTML = '';
        q.options.forEach((opt, i) => { optionsHTML += `<button class="bank-option-btn" data-index="${i}" onclick="selectBankOption(this, ${q.correct})"><span class="option-letter">${letters[i]}</span><span class="option-text">${opt}</span><span class="option-icon"></span></button>`; });
        card.innerHTML = `<div class="bank-question-header"><h4>${index + 1}.</h4>${getQuestionText(q)}</div><div class="bank-options">${optionsHTML}</div><div class="bank-actions"><button class="show-answer-btn" onclick="showBankAnswer(this, ${q.correct})"><i class="fas fa-eye"></i> إظهار الإجابة</button><div class="answer-reveal" style="display: none;"><i class="fas fa-check-circle"></i><span>الإجابة الصحيحة: ${q.options[q.correct]}</span></div></div><div class="bank-feedback" style="display: none;"></div>`;
        container.appendChild(card);
    });
    const remaining = filteredQuestions.length - questionsToShow.length;
    if (remaining > 0 && !showAll) {
        const btn = document.createElement('button');
        btn.className = 'show-more-btn';
        btn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        btn.onclick = () => { currentBankPage++; renderQuestionsBank(); };
        container.appendChild(btn);
    }
}
function selectBankOption(btn, correctIndex) { const card = btn.closest('.bank-question-card'); if (card.dataset.answered === 'true') return; const selectedIndex = parseInt(btn.dataset.index); const isCorrect = selectedIndex === correctIndex; card.dataset.answered = 'true'; card.querySelectorAll('.bank-option-btn').forEach((opt, i) => { opt.disabled = true; if (i === correctIndex) { opt.classList.add('correct'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>'; } else if (i === selectedIndex && !isCorrect) { opt.classList.add('wrong'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-times"></i>'; } }); const feedback = card.querySelector('.bank-feedback'); feedback.style.display = 'block'; feedback.innerHTML = isCorrect ? '<i class="fas fa-check-circle"></i> إجابة صحيحة! 🎉' : '<i class="fas fa-times-circle"></i> إجابة خاطئة.'; feedback.className = 'bank-feedback ' + (isCorrect ? 'correct' : 'wrong'); card.querySelector('.show-answer-btn').style.display = 'none'; card.querySelector('.answer-reveal').style.display = 'flex'; }
function showBankAnswer(btn, correctIndex) { const card = btn.closest('.bank-question-card'); card.querySelectorAll('.bank-option-btn').forEach((opt, i) => { if (i === correctIndex) { opt.classList.add('correct'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>'; } }); btn.style.display = 'none'; card.querySelector('.answer-reveal').style.display = 'flex'; }
function filterQuestions() { currentBankPage = 1; renderQuestionsBank(); }

// Old Essay Challenge Functions (Text-based - kept for backwards compatibility)
function startOldEssayChallenge() { const nameInput = document.getElementById('essayPlayerName'); const name = nameInput.value.trim() || document.getElementById('challengerName').value.trim(); if (!name) { alert('من فضلك أدخل اسمك!'); nameInput.focus(); return; } if (essayQuestions.length < ESSAYS_PER_CHALLENGE) { alert('لا توجد أسئلة مقالية كافية'); return; } essayChallenge.userName = name; essayChallenge.questions = shuffleArray([...essayQuestions]).slice(0, ESSAYS_PER_CHALLENGE); essayChallenge.currentIndex = 0; essayChallenge.answers = new Array(ESSAYS_PER_CHALLENGE).fill(''); essayChallenge.timeLeft = ESSAY_TIME; essayChallenge.active = true; document.getElementById('essayIntro').style.display = 'none'; document.getElementById('essayContainer').style.display = 'block'; document.getElementById('essayResult').style.display = 'none'; showEssayQuestion(0); startEssayTimer(); }
function showEssayQuestion(index) { const q = essayChallenge.questions[index]; document.getElementById('essayQuestionBadge').textContent = `السؤال ${index + 1}`; document.getElementById('essayQuestionText').innerHTML = `<div class="bilingual-question"><p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr}</p><p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p></div>`; document.getElementById('essayProgress').textContent = `${index + 1}/${ESSAYS_PER_CHALLENGE}`; document.getElementById('essayAnswer').value = essayChallenge.answers[index] || ''; document.getElementById('essayPrevBtn').disabled = index === 0; document.getElementById('essayNextBtn').style.display = index === ESSAYS_PER_CHALLENGE - 1 ? 'none' : 'flex'; document.getElementById('essaySubmitBtn').style.display = index === ESSAYS_PER_CHALLENGE - 1 ? 'flex' : 'none'; }
function saveCurrentEssayAnswer() { essayChallenge.answers[essayChallenge.currentIndex] = document.getElementById('essayAnswer').value.trim(); }
function nextEssayQuestion() { saveCurrentEssayAnswer(); if (essayChallenge.currentIndex < ESSAYS_PER_CHALLENGE - 1) { essayChallenge.currentIndex++; showEssayQuestion(essayChallenge.currentIndex); } }
function prevEssayQuestion() { saveCurrentEssayAnswer(); if (essayChallenge.currentIndex > 0) { essayChallenge.currentIndex--; showEssayQuestion(essayChallenge.currentIndex); } }
function startEssayTimer() { updateEssayTimerDisplay(); essayChallenge.timerInterval = setInterval(() => { essayChallenge.timeLeft--; updateEssayTimerDisplay(); if (essayChallenge.timeLeft <= 60) document.getElementById('essayTimer').classList.add('warning'); if (essayChallenge.timeLeft <= 0) submitEssayChallenge(); }, 1000); }
function updateEssayTimerDisplay() { const m = Math.floor(essayChallenge.timeLeft / 60), s = essayChallenge.timeLeft % 60; document.getElementById('essayTimerDisplay').textContent = `${m}:${s.toString().padStart(2, '0')}`; }
async function submitEssayChallenge() { saveCurrentEssayAnswer(); clearInterval(essayChallenge.timerInterval); essayChallenge.active = false; document.getElementById('essayContainer').style.display = 'none'; document.getElementById('essayResult').style.display = 'block'; document.getElementById('gradingStatus').style.display = 'flex'; document.getElementById('essayScores').style.display = 'none'; const scoresContainer = document.getElementById('essayScores'); scoresContainer.innerHTML = ''; for (let i = 0; i < essayChallenge.questions.length; i++) { const q = essayChallenge.questions[i]; const answer = essayChallenge.answers[i]; let feedback = '', score = 0; if (!answer || answer.trim().length < 10) { feedback = 'لم يتم الإجابة أو قصيرة'; score = 0; } else { try { const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `أنت مصحح امتحانات. قيّم الإجابة من 10.\n\nالسؤال: ${q.questionAr}\nالإجابة النموذجية: ${q.answerAr}\nإجابة الطالب: ${answer}\n\nالدرجة: X/10\nالتعليق: ...` }] }] }) }); const data = await response.json(); const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''; const scoreMatch = aiResponse.match(/الدرجة:\s*(\d+)/); score = scoreMatch ? parseInt(scoreMatch[1]) : 5; feedback = aiResponse.replace(/الدرجة:\s*\d+\/10\s*/g, '').trim() || 'تم التقييم'; } catch (e) { feedback = 'تعذر التصحيح'; score = 5; } } const card = document.createElement('div'); card.className = 'essay-score-card'; card.innerHTML = `<h4>السؤال ${i + 1}</h4><p class="question">${q.questionAr}</p><p class="question-en">${q.questionEn}</p><p class="answer">${answer || 'لم يتم الإجابة'}</p><div class="feedback">${feedback}</div><span class="score-badge">${score}/10</span>`; scoresContainer.appendChild(card); } document.getElementById('gradingStatus').style.display = 'none'; document.getElementById('essayScores').style.display = 'flex'; }
function restartEssayChallenge() { document.getElementById('essayResult').style.display = 'none'; document.getElementById('essayIntro').style.display = 'block'; document.getElementById('essayTimer').classList.remove('warning'); }

// Essay Bank
function renderEssayBank(showAll = false) { const container = document.getElementById('essayQuestionsList'); if (!container) return; container.innerHTML = ''; const searchTerm = document.getElementById('essaySearchInput')?.value?.toLowerCase() || ''; filteredEssay = essayQuestions; if (searchTerm) { filteredEssay = essayQuestions.filter(q => q.questionAr.toLowerCase().includes(searchTerm) || q.questionEn.toLowerCase().includes(searchTerm) || q.answerAr.toLowerCase().includes(searchTerm) || q.answerEn.toLowerCase().includes(searchTerm)); currentEssayPage = 1; } if (!filteredEssay.length) { container.innerHTML = '<p class="no-records">لا توجد أسئلة مقالية حالياً</p>'; return; } const essaysToShow = showAll ? filteredEssay : filteredEssay.slice(0, currentEssayPage * ESSAYS_PER_PAGE); essaysToShow.forEach((q, index) => { const item = document.createElement('div'); item.className = 'essay-question-item'; item.innerHTML = `<h4>${index + 1}. <span class="lang-label">🇸🇦</span> ${q.questionAr}</h4><p class="question-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p><div class="model-answer"><div class="answer-section"><strong><span class="lang-label">🇸🇦</span> الإجابة بالعربي:</strong><p>${q.answerAr}</p></div><div class="answer-section"><strong><span class="lang-label">🇬🇧</span> Answer in English:</strong><p>${q.answerEn}</p></div></div>`; item.onclick = () => item.classList.toggle('expanded'); container.appendChild(item); }); const remaining = filteredEssay.length - essaysToShow.length; if (remaining > 0 && !showAll) { const btn = document.createElement('button'); btn.className = 'show-more-btn'; btn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`; btn.onclick = (e) => { e.stopPropagation(); currentEssayPage++; renderEssayBank(); }; container.appendChild(btn); } }
function filterEssayQuestions() { currentEssayPage = 1; renderEssayBank(); }

// AI
async function askAI() { const i = document.getElementById('aiInput'), q = i.value.trim(); if (!q) return; const m = document.getElementById('aiMessages'); m.innerHTML += `<div class="ai-message user"><div class="message-avatar"><i class="fas fa-user"></i></div><div class="message-content"><p>${q}</p></div></div>`; i.value = ''; m.scrollTop = m.scrollHeight; const ld = document.createElement('div'); ld.id = 'loading'; ld.className = 'ai-message bot'; ld.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>جاري التفكير...</p></div>'; m.appendChild(ld); m.scrollTop = m.scrollHeight; try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `أنت مساعد تعليمي متخصص في قوانين الحاسب والملكية الفكرية. أجب بالعربية:\n\n${q}` }] }] }) }); const d = await r.json(); const ans = d.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حاول مرة أخرى.'; ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${ans.replace(/\n/g, '<br>')}</p></div></div>`; m.scrollTop = m.scrollHeight; } catch (e) { ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>عذراً، حدث خطأ.</p></div></div>`; } }
document.getElementById('aiInput')?.addEventListener('keypress', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } });

// Init
document.addEventListener('DOMContentLoaded', async () => {
    const s = localStorage.getItem('userProfile');
    if (s) {
        try {
            const p = JSON.parse(s);
            if (p.name) {
                document.getElementById('challengerName').value = p.name;
                const en = document.getElementById('essayPlayerName');
                if (en) en.value = p.name;
                const ecn = document.getElementById('essayChallengerName');
                if (ecn) ecn.value = p.name;
            }
        } catch (e) { }
    }
    document.getElementById('totalQuestions').textContent = questions.length;
    const te = document.getElementById('totalEssay');
    if (te) te.textContent = essayQuestions.length;
    loadLeaderboard();
    renderQuestionsBank();
    renderEssayBank();
    loadSummaries();
    await loadEssayChallengeQuestions();
});

async function loadEssayChallengeQuestions() {
    if (!db) {
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
        return;
    }
    try {
        const snapshot = await db.collection(`essay_questions_${SUBJECT_ID}`).get();
        if (snapshot.empty) {
            if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
                initEssayChallenge(SUBJECT_ID, essayQuestions);
            }
            return;
        }
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
        essayQuestions.push(...firebaseEssays);
        const countEl = document.getElementById('essayDisplayedCount');
        if (countEl) countEl.textContent = essayQuestions.length;
        if (typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
        console.log(`✅ Loaded ${firebaseEssays.length} essay questions for ${SUBJECT_ID}`);
    } catch (error) {
        console.error('Error loading essay questions:', error);
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
    }
}

// =============================================
// SUMMARIES SECTION
// =============================================
async function loadSummaries() {
    const container = document.getElementById('summariesList');
    if (!container) return;
    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الملخصات...</div>';
        if (!db) { container.innerHTML = '<div class="no-summaries-message"><i class="fas fa-file-alt"></i><h3>لا توجد ملخصات حالياً</h3><p>سيتم إضافة ملخصات قريباً</p></div>'; return; }
        const snapshot = await db.collection(`summaries_${SUBJECT_ID}`).orderBy('order', 'asc').get();
        if (snapshot.empty) { container.innerHTML = '<div class="no-summaries-message"><i class="fas fa-file-alt"></i><h3>لا توجد ملخصات حالياً</h3><p>سيتم إضافة ملخصات من لوحة الإدارة</p></div>'; return; }
        container.innerHTML = '';
        snapshot.forEach(doc => { container.appendChild(createSummaryCard(doc.data(), doc.id)); });
    } catch (error) { console.error('Error loading summaries:', error); container.innerHTML = '<div class="no-summaries-message"><i class="fas fa-exclamation-circle"></i><h3>خطأ في تحميل الملخصات</h3><p>حاول تحديث الصفحة</p></div>'; }
}

function createSummaryCard(summary, docId) {
    const card = document.createElement('div');
    card.className = 'summary-card';
    let actionButton = '';
    if (summary.pdfUrl) actionButton = `<a href="${summary.pdfUrl}" target="_blank" class="summary-btn"><i class="fas fa-download"></i> تحميل PDF</a>`;
    else if (summary.externalUrl) actionButton = `<a href="${summary.externalUrl}" target="_blank" class="summary-btn external-link"><i class="fas fa-external-link-alt"></i> فتح الرابط</a>`;
    card.innerHTML = `${summary.imageUrl ? `<div class="summary-image"><img src="${summary.imageUrl}" alt="${summary.title}" loading="lazy"></div>` : ''}<div class="summary-content"><h3>${summary.title || 'ملخص'}</h3>${summary.description ? `<p>${summary.description}</p>` : ''}<div class="summary-meta">${summary.author ? `<span><i class="fas fa-user"></i> ${summary.author}</span>` : ''}</div>${actionButton}</div>`;
    return card;
}
