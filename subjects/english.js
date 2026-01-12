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

const SUBJECT_ID = 'english';
const SUBJECT_NAME = 'لغة إنجليزية';
const CHALLENGE_TIME = 300;
const QUESTIONS_PER_CHALLENGE = 15;
const GROQ_API_KEY = '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';

// MCQ Questions - Bilingual Format (questionAr, questionEn, options, correct)
// Add your questions here in this format:
// { questionAr: "السؤال بالعربية", questionEn: "Question in English", options: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: 0 }
const questions = [
    // Ice Hotel Questions
    { question: "Where is the Ice Hotel located?", options: ["Quebec, Canada", "Alaska, USA", "Norway", "Switzerland"], correct: 0 },
    { question: "Why can you only check into the Ice Hotel during winter?", options: ["Because it is made entirely of ice and snow", "Because it is too expensive in summer", "Because the owners go on vacation", "Because there are no flights in summer"], correct: 0 },
    { question: "What is NOT made of ice in the Ice Hotel?", options: ["Winter coats", "Furniture", "Drinking glasses", "Art in the gallery"], correct: 0 },
    { question: "What temperature is it inside the Ice Hotel?", options: ["-2 to -5°C", "20-25°C", "0-5°C", "-10 to -15°C"], correct: 0 },
    { question: "What helps guests sleep warmly in the cold rooms?", options: ["Special sleeping bags and fur blankets", "Electric heaters", "Hot water bottles", "Thick pajamas"], correct: 0 },
    { question: "What does the idiom 'be into' mean as used in the reading?", options: ["To enjoy doing something", "To be inside something", "To be interested in learning", "To be part of a group"], correct: 0 },
    { question: "What does the word 'unique' mean in the context of the Ice Hotel?", options: ["One of a kind", "Very cold", "Expensive", "Temporary"], correct: 0 },
    { question: "True or False: The Ice Hotel has a church where people can get married.", options: ["True", "False"], correct: 0 },
    { question: "What facilities does the Ice Hotel have?", options: ["Movie theater, art gallery, and church", "Only bedrooms", "Bedrooms and a restaurant", "Bedrooms, restaurant, and swimming pool"], correct: 0 },
    { question: "What material are the drinking glasses made of at the Ice Hotel?", options: ["Ice", "Glass", "Plastic", "Crystal"], correct: 0 },

    // Food Origins Questions
    { question: "According to the passage, where did curry really come from?", options: ["England", "India", "Persia", "Thailand"], correct: 0 },
    { question: "When was the word 'curry' first found in an English cookbook?", options: ["1377", "1600", "1891", "500"], correct: 0 },
    { question: "Where was pizza probably first made?", options: ["Persia (Iran)", "Italy", "United States", "Greece"], correct: 0 },
    { question: "When were Persians eating round, flat bread with cheese?", options: ["500s", "1300s", "1800s", "1900s"], correct: 0 },
    { question: "Who created the first hamburger?", options: ["A German named Otto Kuasw", "An American chef", "English sailors", "Persian cooks"], correct: 0 },
    { question: "Who introduced hamburgers to Americans?", options: ["German sailors", "Italian immigrants", "English colonists", "Persian traders"], correct: 0 },
    { question: "What does the idiom 'find out' mean in the passage?", options: ["To learn or discover", "To search for something", "To understand completely", "To ask about something"], correct: 0 },
    { question: "What does 'catch on' mean in the context of pizza?", options: ["To become popular", "To be caught by someone", "To be understood", "To be made quickly"], correct: 0 },
    { question: "True or False: Wealthy English people were eating dishes with curry in the 1377.", options: ["True", "False"], correct: 0 },
    { question: "Which city in Italy is famous for pizza?", options: ["Naples", "Rome", "Milan", "Venice"], correct: 0 },

    // Hurricane Questions
    { question: "What are tropical cyclones called in Asia?", options: ["Typhoons", "Hurricanes", "Cyclones", "Storms"], correct: 0 },
    { question: "What is the minimum wind speed for these storms?", options: ["60 kph", "30 kph", "100 kph", "120 kph"], correct: 0 },
    { question: "Which organization decides hurricane names?", options: ["World Meteorological Organization (WMO)", "United Nations", "National Weather Service", "Tropical Prediction Center"], correct: 0 },
    { question: "Which letters are NOT used to start hurricane names?", options: ["Q, U, X, Y, Z", "A, E, I, O, U", "X, Y, Z", "Q, V, X"], correct: 0 },
    { question: "What type of names do Asian countries use for typhoons?", options: ["Names of flowers, animals, trees", "Only male names", "Only female names", "Names of cities"], correct: 0 },
    { question: "What does the idiom 'keep an eye out for' mean?", options: ["To watch for trouble or danger", "To look carefully", "To watch something interesting", "To protect something"], correct: 0 },
    { question: "What does 'meteorologist' mean?", options: ["A scientist who studies weather", "A storm chaser", "A weather reporter", "A disaster manager"], correct: 0 },
    { question: "True or False: Hurricanes always have female names.", options: ["False", "True"], correct: 0 },
    { question: "Where is the Tropical Prediction Center located?", options: ["Miami, Florida", "Washington D.C.", "New York City", "Los Angeles, California"], correct: 0 },
    { question: "How often are the lists of hurricane names recycled?", options: ["Every 6 years", "Every year", "Every 10 years", "Never"], correct: 0 },

    // Idioms Questions
    { question: "What does the idiom 'A-1' mean?", options: ["Excellent, superior", "First in order", "Average quality", "Quickly done"], correct: 0 },
    { question: "'ABC' in 'the ABC of cooking' means:", options: ["Fundamentals, basics", "Simple recipes", "Advanced techniques", "Alphabetical order"], correct: 0 },
    { question: "True or False: 'Above board' means something is done openly and honestly.", options: ["True", "False"], correct: 0 },
    { question: "'About-face' means to:", options: ["Turn in the opposite direction", "Face a problem", "Confront someone", "Accept a challenge"], correct: 0 },
    { question: "'About to' means:", options: ["Prepared, ready", "Near something", "Approximately", "Planning to"], correct: 0 },
    { question: "'Above all' means:", options: ["Especially, mainly", "Higher than everything", "More important", "First priority"], correct: 0 },
    { question: "True or False: 'According to Hoyle' means done incorrectly.", options: ["False", "True"], correct: 0 },
    { question: "'According to Hoyle' means:", options: ["Correct, proper", "According to rules", "Traditional way", "Officially approved"], correct: 0 },
    { question: "'After one's own heart' means:", options: ["With similar interests", "Loving someone", "Kind-hearted", "Close friend"], correct: 0 },
    { question: "'Against the grain' means:", options: ["Annoying, irritating", "Opposite direction", "Difficult to do", "Unnatural"], correct: 0 },
    { question: "'All along' means:", options: ["From the beginning", "All together", "For a long time", "Continuously"], correct: 0 },
    { question: "What does the idiom 'dig in' mean?", options: ["To begin eating with excitement", "To start digging", "To search for something", "To prepare food"], correct: 0 },
    { question: "What does 'play a role in' mean?", options: ["To have some part in", "To act in a play", "To be important", "To help someone"], correct: 0 },
    { question: "What does 'get rid of' mean?", options: ["To throw away; to put out of use", "To hide something", "To clean something", "To organize something"], correct: 0 },
    { question: "What does 'shut down' mean?", options: ["To stop", "To close a door", "To turn off lights", "To go to sleep"], correct: 0 },
    { question: "What does 'keep up with' mean?", options: ["To continue getting useful information", "To hold something", "To stay awake", "To remember something"], correct: 0 },
    { question: "What does 'check in' mean?", options: ["To go to the hotel's front desk and get the room key", "To look inside", "To examine something", "To arrive at a place"], correct: 0 },
    { question: "What does 'made of' mean?", options: ["Built or constructed from", "Created by", "Designed for", "To become something"], correct: 0 },
    { question: "What does 'be into' mean?", options: ["To enjoy doing", "To be inside something", "To be interested in learning", "To be part of a group"], correct: 0 },
    { question: "What does 'catch on' mean?", options: ["To become popular", "To catch something", "To understand something", "To hold onto something"], correct: 0 },

    // Paragraph & Essay Writing Questions
    { question: "What are the three parts of a paragraph?", options: ["Topic sentence, supporting sentences, concluding sentence", "Introduction, body, conclusion", "Thesis, examples, summary", "Beginning, middle, end"], correct: 0 },
    { question: "What is the purpose of a topic sentence?", options: ["To state the main idea of the paragraph", "To introduce the topic", "To provide examples", "To conclude the paragraph"], correct: 0 },
    { question: "What does 'unity' mean in paragraph writing?", options: ["The paragraph discusses one main idea only", "All sentences are the same length", "The paragraph has good vocabulary", "All sentences are connected"], correct: 0 },
    { question: "True or False: Coherence means that sentences should hold together logically.", options: ["True", "False"], correct: 0 },
    { question: "What are the three parts of an essay?", options: ["Introduction, body, conclusion", "Topic, development, ending", "Beginning, middle, end", "Thesis, arguments, summary"], correct: 0 },
    { question: "What is the purpose of an introduction in an essay?", options: ["To present the thesis statement", "To provide detailed examples", "To summarize the main points", "To ask questions"], correct: 0 },
    { question: "What is the purpose of the body paragraphs in an essay?", options: ["To develop and support the thesis", "To introduce new topics", "To conclude the essay", "To ask questions"], correct: 0 },
    { question: "What is the purpose of the conclusion in an essay?", options: ["To summarize the main points and restate the thesis", "To introduce new ideas", "To provide more examples", "To ask the reader questions"], correct: 0 },
    { question: "Which of these is a good topic sentence?", options: ["Dogs make excellent pets for three main reasons.", "Many people like dogs.", "I have a dog named Max.", "Dogs are animals."], correct: 0 },
    { question: "What is a thesis statement?", options: ["The main idea of an essay", "The first sentence of a paragraph", "A question at the end of an essay", "The title of an essay"], correct: 0 },
    { question: "Which sentence is a good supporting sentence for 'Exercise has many health benefits.'?", options: ["Regular exercise can reduce the risk of heart disease.", "Some people don't like to exercise.", "I exercise every morning.", "Exercise is good."], correct: 0 },
    { question: "What is a good concluding sentence for a paragraph about the benefits of reading?", options: ["For these reasons, reading is a valuable activity for people of all ages.", "Reading is when you look at words.", "Some people prefer watching movies.", "I like to read mystery novels."], correct: 0 },
    { question: "What should you avoid in a paragraph to maintain unity?", options: ["Irrelevant sentences", "Long sentences", "Short sentences", "Complex vocabulary"], correct: 0 },
    { question: "Which transition word shows contrast?", options: ["However", "First", "Additionally", "For example"], correct: 0 },
    { question: "Which transition word adds information?", options: ["Furthermore", "Therefore", "Nevertheless", "In conclusion"], correct: 0 },
    { question: "Which transition word shows cause and effect?", options: ["As a result", "On the other hand", "For instance", "Similarly"], correct: 0 },
    { question: "Which transition word shows time order?", options: ["Meanwhile", "Consequently", "Likewise", "Specifically"], correct: 0 },
    { question: "Which sentence has a grammatical error?", options: ["They was happy to see their friends.", "The students are studying for the exam.", "She goes to school every day.", "I have two brothers and one sister."], correct: 0 },
    { question: "Which sentence is punctuated correctly?", options: ["I like apples, oranges, and bananas.", "I like apples oranges and bananas.", "I like apples, oranges and bananas.", "I like apples oranges, and bananas."], correct: 0 },
    { question: "Which sentence has correct subject-verb agreement?", options: ["The team is playing well.", "The team are playing well.", "The team were playing well.", "The team am playing well."], correct: 0 },
    { question: "Which sentence is in the passive voice?", options: ["The mouse was chased by the cat.", "The cat chased the mouse.", "The cat is chasing the mouse.", "The cat will chase the mouse."], correct: 0 },
    { question: "Which sentence is in the active voice?", options: ["The teacher graded the papers.", "The papers were graded by the teacher.", "The papers have been graded.", "The papers will be graded."], correct: 0 },
    { question: "Which sentence uses correct capitalization?", options: ["I went to Paris last summer.", "i went to paris last summer.", "I went to paris last Summer.", "i went to Paris last summer."], correct: 0 },
    { question: "Which sentence has correct comma usage?", options: ["Although it was raining, we went for a walk.", "Although it was raining we went for a walk.", "Although, it was raining we went for a walk.", "Although it was raining we went, for a walk."], correct: 0 },
    { question: "Which sentence has correct apostrophe usage?", options: ["The dog's bowl is empty.", "The dogs bowl is empty.", "The dogs' bowl is empty.", "The dogs's bowl is empty."], correct: 0 },
    { question: "Which sentence uses correct verb tense?", options: ["Yesterday, I went to the store.", "Yesterday, I go to the store.", "Yesterday, I will go to the store.", "Yesterday, I going to the store."], correct: 0 },
    { question: "Which sentence has correct pronoun usage?", options: ["My friend and I went to the movies.", "Me and my friend went to the movies.", "I and my friend went to the movies.", "My friend and me went to the movies."], correct: 0 },
    { question: "Which sentence is a compound sentence?", options: ["The dog barked, and the cat ran away.", "The dog barked.", "The barking dog scared the cat.", "Because the dog barked, the cat ran away."], correct: 0 },
    { question: "Which sentence is a complex sentence?", options: ["Although I like pizza, I prefer pasta.", "I like pizza and pasta.", "I like pizza; I also like pasta.", "I like pizza, but I prefer pasta."], correct: 0 },
    { question: "Which sentence has correct parallel structure?", options: ["I like swimming, running, and biking.", "I like swimming, to run, and biking.", "I like to swim, running, and to bike.", "I like swimming, run, and biking."], correct: 0 },

    // Grammar Questions
    { question: "Which sentence is correct?", options: ["The students are studying for the exam.", "The students is studying for the exam.", "The students am studying for the exam.", "The students was studying for the exam."], correct: 0 },
    { question: "Identify the error: 'Each of the boys have their own book.'", options: ["have", "Each of", "the boys", "their own book"], correct: 0 },
    { question: "Which is the correct connector? 'I want to go to the movies, ______ I don't have enough money.'", options: ["but", "and", "so", "or"], correct: 0 },
    { question: "True or False: In the sentence 'The book on the table is mine,' 'on the table' is the subject.", options: ["False", "True"], correct: 0 },
    { question: "Which sentence has correct subject-verb agreement?", options: ["The group of students is going on a trip.", "The group of students are going on a trip.", "The groups of students is going on a trip.", "The group of students were going on a trip."], correct: 0 },
    { question: "Identify the error: 'The data shows that smoking is harmful to health.'", options: ["shows", "that", "smoking", "harmful"], correct: 0 },
    { question: "Which sentence has the correct word order?", options: ["I have never seen such a beautiful sunset.", "Never I have seen such a beautiful sunset.", "I never have seen such a beautiful sunset.", "I have seen never such a beautiful sunset."], correct: 0 },
    { question: "Identify the error: 'If I was you, I would study harder.'", options: ["was", "you", "would", "study"], correct: 0 },
    { question: "Which sentence uses the correct preposition?", options: ["I'm good at math.", "I'm good in math.", "I'm good with math.", "I'm good on math."], correct: 0 },
    { question: "Identify the error: 'She don't like coffee.'", options: ["don't", "like", "coffee"], correct: 0 },
    { question: "Which sentence is correct?", options: ["He speaks English well.", "He speaks English good.", "He speaks English goodly.", "He speaks English best."], correct: 0 },
    { question: "Identify the error: 'Between you and I, this is a bad idea.'", options: ["I", "this", "is", "bad idea"], correct: 0 },
    { question: "Which sentence uses the correct comparative form?", options: ["This book is more interesting than that one.", "This book is interestinger than that one.", "This book is interesting than that one.", "This book is more interesting as that one."], correct: 0 },
    { question: "Identify the error: 'I look forward to meet you.'", options: ["meet", "you"], correct: 0 },
    { question: "Which sentence has the correct article usage?", options: ["He is a doctor.", "He is doctor.", "He is the doctor.", "He is an doctor."], correct: 0 },
    { question: "Identify the error: 'The childrens are playing in the park.'", options: ["childrens", "are", "playing", "in the park"], correct: 0 },
    { question: "Which sentence uses the correct tense?", options: ["I have lived here since 2010.", "I live here since 2010.", "I am living here since 2010.", "I was living here since 2010."], correct: 0 },
    { question: "Identify the error: 'She asked me where do I live.'", options: ["do I live", "asked", "me", "where"], correct: 0 },
    { question: "Which sentence has correct parallel structure?", options: ["She likes reading, swimming, and hiking.", "She likes reading, to swim, and hiking.", "She likes to read, swimming, and to hike.", "She likes reading, swim, and hiking."], correct: 0 },
    { question: "Identify the error: 'The reason is because I was tired.'", options: ["because", "I was", "tired"], correct: 0 },

    // Vocabulary Fill-in Questions
    { question: "The man owns three hotels. He is very ______.", options: ["wealthy", "comfortable", "tired", "unique"], correct: 0 },
    { question: "People think snakes are dangerous, ______ most snakes are not.", options: ["Surprisingly", "Unusually", "Finally", "First"], correct: 0 },
    { question: "He knows ______ all of his relatives' birthdays, except for his aunt and uncle's.", options: ["nearly", "in reality", "before", "behind"], correct: 0 },
    { question: "______ my mother, washing clothes by hand is better than using a washing machine.", options: ["According to", "Before", "After", "In reality"], correct: 0 },
    { question: "This soup does not ______ right. Did you forget to put in onions?", options: ["taste", "cook", "make", "create"], correct: 0 },
    { question: "I do not have enough ______ to make this dish.", options: ["spices", "fur", "hamburgers", "stories"], correct: 0 },
    { question: "We ______ how the magician did the amazing trick.", options: ["found out", "created", "introduced", "thought"], correct: 0 },
    { question: "The teacher decides her students' grades ______ their test scores and homework.", options: ["according to", "creating", "deciding", "naming"], correct: 0 },
    { question: "He often uses the Internet to get ______.", options: ["information", "danger", "taste", "people"], correct: 0 },
    { question: "My house is very small. Surprisingly it does not ______ a bathroom.", options: ["include", "keep up", "catch on", "list"], correct: 0 },
    { question: "We named our dog George. Then we found out she was a ______ dog!", options: ["female", "possible", "easy", "freezing"], correct: 0 },
    { question: "______ countries like Singapore are hot all the time.", options: ["Tropical", "Fantastic", "Male", "International"], correct: 0 },
    { question: "This street is very busy. You should ______ for cars when you walk across it.", options: ["watch out", "keep up with", "find out", "check in"], correct: 0 },
    { question: "Hurricanes usually ______ in summer.", options: ["occur", "go around", "make", "detect"], correct: 0 },
    { question: "What is the main idea of the reading about the Ice Hotel?", options: ["What makes the Ice Hotel special", "How the Ice Hotel is built", "Why the Ice Hotel is made of Ice", "The services of the Ice Hotel"], correct: 0 },
    { question: "What can you do in the Ice Hotel?", options: ["All of the above", "Watch a movie", "Get married", "Eat an interesting meal"], correct: 0 },
    { question: "Why is sleeping NOT a problem at the Ice Hotel?", options: ["The sleeping bags are warm", "The rooms are warm", "The temperature is -2°C", "The furniture is warm"], correct: 0 },
    { question: "In which part of the Ice Hotel would you probably find the ice plates?", options: ["The restaurant", "The church", "The rooms", "The art gallery"], correct: 0 },
    { question: "What do you think happens to the Ice Hotel in the spring?", options: ["It melts", "It freezes", "It stays open", "It moves"], correct: 0 },
    { question: "What is the main idea of the reading about butterflies in the stomach?", options: ["The cause of butterflies in the stomach", "A new kind of medicine called cortisol", "An illness that nervous people get", "The stress that actors have"], correct: 0 },
    { question: "According to the reading, what is NOT true about cortisol?", options: ["It is found in many kinds of food", "In small amounts, it benefits the body", "It can shut down the stomach", "It is produced by the body"], correct: 0 },
    { question: "What helps a body respond well to exercise?", options: ["Cortisol", "Butterflies", "Stomach acid", "Stress"], correct: 0 },
    { question: "According to the passage, what makes some people feel sick?", options: ["When the stomach shuts down", "When situations return to normal", "When the stomach works too fast", "When there is too little cortisol"], correct: 0 },
    { question: "Which may help a person get over butterflies in the stomach?", options: ["Doing the thing that makes him or her nervous", "Not talking while the butterflies are there", "Shutting down his or her stomach for some time", "Taking a small amount of cortisol"], correct: 0 },
    { question: "What is the main idea of the reading about hurricanes?", options: ["How tropical cyclones are named", "Why tropical cyclones are named", "What tropical cyclones can do", "Who watches for tropical cyclones"], correct: 0 },
    { question: "In which direction do tropical cyclones go around in the northern part of the planet?", options: ["The opposite direction of a clock", "Down", "The same direction as a clock", "Up"], correct: 0 },
    { question: "The fifth hurricane of 2015 might have the name ______.", options: ["Eric", "Diana", "Darren", "Connie"], correct: 0 },
    { question: "Which name would a hurricane NOT have?", options: ["Yanni", "Rita", "Veronica", "William"], correct: 0 },
    { question: "Why should tropical cyclones have names?", options: ["The names help people", "It sounds interesting", "The names are a code for the WMO", "It is traditional"], correct: 0 },
    { question: "What is the main idea of the 'Food Firsts' reading?", options: ["Some facts about foods are surprising", "Curry was created in England", "There are many foods that help your body", "People created fast food long ago"], correct: 0 },
    { question: "Which is probably true about British curry dishes in the 1400s?", options: ["The spices cost a lot", "The dishes did not have meat", "People ate curry on special days", "British sailors first made curry"], correct: 0 },
    { question: "What did people in Naples learn from Persians?", options: ["How to make flat bread", "How to make pizza", "How to cook cheese", "How to use spices from Iran"], correct: 0 },
    { question: "Who introduced hamburgers to America?", options: ["German sailors", "Persians", "Otto Klasov", "Italians"], correct: 0 },
    { question: "Which food was probably made first?", options: ["Cheesy Persian bread", "Hamburgers", "Italian pizza", "English curry"], correct: 0 },
    { question: "He ______ J.K. Rowling. He has every book she has written.", options: ["is into", "hates", "checks in", "experiences"], correct: 0 },
    { question: "It's so cold outside that the water has turned to ______.", options: ["ice", "freezing", "cold", "temperature"], correct: 0 },
    { question: "Picasso painted ______ pictures.", options: ["unique", "designer", "cozy", "warm"], correct: 0 },
    { question: "Many people enjoy the ______ in that restaurant.", options: ["atmosphere", "ice", "world", "drinking glasses"], correct: 0 },
    { question: "I really like The Matrix. It is a ______ movie.", options: ["fantastic", "drinking", "freezing", "warm"], correct: 0 },
    { question: "That house is ______ wood.", options: ["made of", "built by", "looked like", "gotten to"], correct: 0 },
    { question: "In very cold countries, people sometimes wear ______ coats.", options: ["fur", "experience", "inside", "sleeping bag"], correct: 0 },
    { question: "I gave her some flowers. She was ______.", options: ["surprised", "surprising", "surprisingly"], correct: 0 },
    { question: "'It is so cold today.' 'Yes, it's ______!'", options: ["freezing", "frozen", "freeze"], correct: 0 },
    { question: "It is ______ for me to go dancing. Actually, I don't dance well.", options: ["unusual", "usual", "usually"], correct: 0 },
    { question: "What does cortisol do in the body during stressful situations?", options: ["It prepares the body to respond", "It makes people hungry", "It helps people sleep", "It improves memory"], correct: 0 },
    { question: "How does the body return to normal after a stressful situation?", options: ["By stopping cortisol production", "By producing more cortisol", "By eating food", "By going to sleep"], correct: 0 },
    { question: "What is the main purpose of naming hurricanes?", options: ["To make communication about them easier", "To honor famous meteorologists", "To scare people", "To follow ancient traditions"], correct: 0 },
    { question: "When were hamburgers first introduced to America?", options: ["1895", "1891", "1900", "1910"], correct: 0 }
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
async function askAI() { const i = document.getElementById('aiInput'), q = i.value.trim(); if (!q) return; const m = document.getElementById('aiMessages'); m.innerHTML += `<div class="ai-message user"><div class="message-avatar"><i class="fas fa-user"></i></div><div class="message-content"><p>${q}</p></div></div>`; i.value = ''; m.scrollTop = m.scrollHeight; const ld = document.createElement('div'); ld.id = 'loading'; ld.className = 'ai-message bot'; ld.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>جاري التفكير...</p></div>'; m.appendChild(ld); m.scrollTop = m.scrollHeight; try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `أنت مساعد تعليمي متخصص في اللغة الإنجليزية. أجب بالعربية:\n\n${q}` }] }] }) }); const d = await r.json(); const ans = d.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حاول مرة أخرى.'; ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${ans.replace(/\n/g, '<br>')}</p></div></div>`; m.scrollTop = m.scrollHeight; } catch (e) { ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>عذراً، حدث خطأ.</p></div></div>`; } }
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
