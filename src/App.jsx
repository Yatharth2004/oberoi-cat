import { useState, useEffect, useRef, useCallback } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwkblh0vj6_I66dAzORjF6CS1kn53b8JQcmsnsH5adF9dR9B-_z8tz9yb-KNLKBHgFD/exec";
const MAX_ATTEMPTS = 3;
const PASS_MARK = 35;
const EXAM_DURATION = 90 * 60;

// ── LARGE QUESTION POOLS (randomly sampled each attempt) ─────────────────────
const QUESTION_POOLS = {
  abstract: [
    // Number Series
    { q: "What comes next: 2, 4, 8, 16, __?", options: ["24","32","30","36"], answer: 1 },
    { q: "Complete: 1, 4, 9, 16, 25, __?", options: ["30","35","36","49"], answer: 2 },
    { q: "Next: 100, 96, 89, 79, 66, __?", options: ["50","53","49","55"], answer: 0 },
    { q: "Fibonacci — Next: 1, 1, 2, 3, 5, 8, 13, __?", options: ["18","20","21","26"], answer: 2 },
    { q: "Next: 2, 6, 12, 20, 30, __?", options: ["40","42","44","48"], answer: 1 },
    { q: "Next: 3, 6, 11, 18, 27, __? (differences +2 each time)", options: ["36","38","40","42"], answer: 1 },
    { q: "Next: 1, 2, 4, 7, 11, 16, __?", options: ["20","22","24","26"], answer: 1 },
    { q: "Missing: 6, 11, 21, 36, 56, __?", options: ["76","79","81","83"], answer: 2 },
    { q: "Next: 144, 121, 100, 81, __?", options: ["64","68","72","70"], answer: 0 },
    { q: "Next: 7, 14, 28, 56, __?", options: ["98","108","112","116"], answer: 2 },
    { q: "Next: 5, 11, 23, 47, __?", options: ["89","94","95","98"], answer: 2 },
    { q: "Next: 0, 1, 3, 6, 10, 15, __?", options: ["18","20","21","22"], answer: 2 },
    // Letter Series
    { q: "Next? A, C, E, G, __?", options: ["H","I","J","K"], answer: 1 },
    { q: "Next? Z, X, V, T, __?", options: ["R","S","Q","P"], answer: 0 },
    { q: "Next? A, D, G, J, __?", options: ["K","L","M","N"], answer: 2 },
    { q: "Next? B, D, F, H, __?", options: ["I","J","K","L"], answer: 1 },
    { q: "Next? A, Z, B, Y, C, __?", options: ["D","W","X","V"], answer: 2 },
    // Analogy
    { q: "3 : 27 :: 4 : __?  (cube relationship)", options: ["48","64","16","32"], answer: 1 },
    { q: "4 : 64 :: 5 : __?  (cube relationship)", options: ["100","115","125","135"], answer: 2 },
    { q: "Doctor : Hospital :: Teacher : __?", options: ["Office","School","Library","Class"], answer: 1 },
    { q: "Painter : Brush :: Writer : __?", options: ["Paper","Pen","Ink","Book"], answer: 1 },
    { q: "Knife : Sharp :: Pillow : __?", options: ["Hard","Rough","Soft","Flat"], answer: 2 },
    { q: "Bird : Nest :: Human : __?", options: ["Office","Car","House","Garden"], answer: 2 },
    // Odd One Out
    { q: "Odd one out: 144, 169, 196, 225, 250", options: ["144","196","225","250"], answer: 3 },
    { q: "Odd one out: 121, 144, 169, 196, 200", options: ["121","169","196","200"], answer: 3 },
    { q: "Odd one out (3-D): Square, Circle, Triangle, Cube, Rectangle", options: ["Circle","Triangle","Cube","Rectangle"], answer: 2 },
    { q: "Odd one out: Cricket, Football, Chess, Hockey, Tennis", options: ["Cricket","Football","Chess","Hockey"], answer: 2 },
    { q: "Odd one out (not prime): 3, 5, 7, 9, 11", options: ["3","5","9","11"], answer: 2 },
    { q: "Odd one out: Rose, Lotus, Jasmine, Mango, Marigold", options: ["Rose","Lotus","Mango","Marigold"], answer: 2 },
    { q: "Odd one out: Iron, Gold, Silver, Wood, Copper", options: ["Iron","Gold","Wood","Copper"], answer: 2 },
    // Coding-Decoding
    { q: "If MANGO is coded as NBOHP (each letter +1), what is APPLE?", options: ["BQQMF","BPQMF","BQQNF","BQQLF"], answer: 0 },
    { q: "If RED = 27 (R+E+D = 18+5+4), what is BLUE (B+L+U+E)?", options: ["36","38","40","42"], answer: 2 },
    { q: "If CAT = 24 (C+A+T = 3+1+20), what is DOG?", options: ["24","26","28","30"], answer: 1 },
    // Direction Sense
    { q: "A walks 10m North, turns right, walks 5m, turns right, walks 10m. Direction now facing?", options: ["North","East","South","West"], answer: 2 },
    { q: "Sita walks 3km East then 4km North. Shortest distance from start?", options: ["3 km","4 km","5 km","7 km"], answer: 2 },
    { q: "Ram walks South 5m, turns left, walks 3m, turns left, walks 5m. Direction now facing?", options: ["North","South","East","West"], answer: 0 },
    // Blood Relations
    { q: "A is B's father. C is A's sister. What is C to B?", options: ["Mother","Sister","Aunt","Grandmother"], answer: 2 },
    { q: "Pointing to a girl, Raj says 'She is my father's only son's daughter.' Relation to Raj?", options: ["Sister","Daughter","Niece","Cousin"], answer: 1 },
    { q: "If P is Q's mother, and Q is R's sister, what is P to R?", options: ["Grandmother","Aunt","Mother","Sister"], answer: 2 },
    // Syllogism
    { q: "All hotels are buildings. All buildings have roofs. Conclusion: All hotels have roofs?", options: ["Definitely True","Definitely False","Uncertain","Partially True"], answer: 0 },
    { q: "Some managers are leaders. All leaders are motivators. Some managers are motivators?", options: ["Definitely True","Definitely False","Cannot be determined","Partially True"], answer: 0 },
    // Pattern / Matrix
    { q: "If 2★3 = 10 and 3★4 = 24, find 4★5. (Pattern: a★b = a²×b − a×b)", options: ["40","50","60","80"], answer: 2 },
    { q: "In a matrix: Row 1: 1,2,3 | Row 2: 4,5,6 | Row 3: 7,?,9. Missing number:", options: ["6","7","8","9"], answer: 2 },
  ],

  numerical: [
    // Age Problems
    { q: "A is twice as old as B. 10 years ago A was 3 times as old as B. Find A's age now.", options: ["30","35","40","45"], answer: 2 },
    { q: "Ratio of ages P:Q = 3:5. After 6 years ratio = 2:3. Find P's current age.", options: ["12","15","18","21"], answer: 2 },
    { q: "Father is 30 years older than son. In 5 years father = 3× son's age. Son's current age?", options: ["8","10","12","15"], answer: 1 },
    { q: "Average age of 5 employees = 28. New employee joins, average = 29. New employee's age?", options: ["30","32","34","36"], answer: 2 },
    { q: "Sum of ages of mother and daughter = 50. 5 years ago mother = 7× daughter's age. Daughter's age now?", options: ["8","10","12","15"], answer: 2 },
    { q: "The ages of A and B differ by 16 years. 6 years ago A was 3× B's age. Find B's current age.", options: ["10","11","12","14"], answer: 1 },
    // Hotel / Hospitality Maths
    { q: "Hotel has 500 rooms; occupancy = 85%. How many rooms occupied?", options: ["400","425","450","475"], answer: 1 },
    { q: "Restaurant bill ₹2,400 + 10% service charge. Total?", options: ["₹2,600","₹2,640","₹2,680","₹2,720"], answer: 1 },
    { q: "Employee earns ₹18,000/month, gets 15% raise. New salary?", options: ["₹20,700","₹21,000","₹21,500","₹20,000"], answer: 0 },
    { q: "Room ₹8,000/night, 3 nights, 25% corporate discount. Total?", options: ["₹18,000","₹18,500","₹19,000","₹20,000"], answer: 0 },
    { q: "360 of 600 guests rated hotel 'Excellent'. Percentage?", options: ["55%","60%","65%","70%"], answer: 1 },
    { q: "NPS = Promoters − Detractors %. Promoters 45%, Detractors 15%. NPS?", options: ["25","30","35","40"], answer: 1 },
    { q: "Hotel earns ₹3,60,000/month with 200 room-nights. RevPAR?", options: ["₹1,500","₹1,600","₹1,800","₹2,000"], answer: 2 },
    // Speed, Distance, Time
    { q: "Train covers 360 km in 4 hours. Average speed?", options: ["80 km/h","90 km/h","100 km/h","75 km/h"], answer: 1 },
    { q: "Train 150m long passes a pole in 15 seconds. Speed in km/h?", options: ["30","36","40","45"], answer: 1 },
    { q: "Car: 60 km/h for 2 hours, then 80 km/h for 3 hours. Average speed for whole journey?", options: ["68","70","72","74"], answer: 2 },
    // Work and Time
    { q: "5 workers complete a job in 12 days. How long for 4 workers?", options: ["12","13","15","16"], answer: 2 },
    { q: "Two taps fill tank in 3 and 6 hours. Time to fill together?", options: ["1.5 hrs","2 hrs","2.5 hrs","3 hrs"], answer: 1 },
    // Percentage / Profit-Loss
    { q: "What is 15% of 1,200?", options: ["160","170","180","190"], answer: 2 },
    { q: "If 20% of a number is 50, what is 35% of the same number?", options: ["80.5","82.5","87.5","90"], answer: 2 },
    { q: "Bought ₹800, sold ₹1,000. Profit %?", options: ["20%","22%","25%","30%"], answer: 2 },
    { q: "Shopkeeper marks 40% above cost, gives 20% discount. Profit %?", options: ["8%","10%","12%","15%"], answer: 2 },
    { q: "In a class of 40 students, 60% passed. How many failed?", options: ["12","14","16","18"], answer: 2 },
    { q: "Simple interest on ₹5,000 at 8% per annum for 3 years?", options: ["₹1,000","₹1,100","₹1,200","₹1,500"], answer: 2 },
    // Ratio / Proportion
    { q: "Male:Female ratio = 3:2 and total = 120. How many female?", options: ["40","48","72","80"], answer: 1 },
    { q: "If 3 pens cost ₹45, what do 7 pens cost?", options: ["₹95","₹100","₹105","₹110"], answer: 2 },
  ],

  verbal: [
    { q: "Synonym of 'Diligence':", options: ["Laziness","Hard work","Intelligence","Creativity"], answer: 1 },
    { q: "Antonym of 'Profound':", options: ["Deep","Shallow","Thoughtful","Meaningful"], answer: 1 },
    { q: "Fill in: The manager was known for his _____ in handling guest complaints.", options: ["Apathy","Negligence","Proficiency","Ignorance"], answer: 2 },
    { q: "Correctly spelled word:", options: ["Accomodation","Accomadation","Accommodation","Accommadation"], answer: 2 },
    { q: "Grammatical error: 'Each of the employees are required to wear their uniform.'", options: ["Each of the","employees are","required to wear","their uniform"], answer: 1 },
    { q: "Meaning of 'burn the midnight oil':", options: ["Work late at night","Waste resources","Cause a fire","Be careless"], answer: 0 },
    { q: "Synonym of 'Entrepreneur':", options: ["Employee","Businessman","Lawyer","Accountant"], answer: 1 },
    { q: "Fill in: The hotel prides itself on its _____ service standards.", options: ["Mediocre","Impeccable","Ordinary","Average"], answer: 1 },
    { q: "Antonym of 'Turbulent':", options: ["Stormy","Chaotic","Calm","Violent"], answer: 2 },
    { q: "Correct sentence:", options: ["The team have completed their task.","The team has completed its task.","The team has completed their task.","The team have completed its task."], answer: 1 },
    { q: "Book : Library :: Art : __?", options: ["Museum","Gallery","Exhibition","Studio"], answer: 1 },
    { q: "Word meaning 'generous and friendly welcome of guests':", options: ["Hostility","Hospitality","Frugality","Formality"], answer: 1 },
    { q: "Synonym of 'Meticulous':", options: ["Careless","Precise","Hasty","Vague"], answer: 1 },
    { q: "Antonym of 'Verbose':", options: ["Talkative","Wordy","Concise","Elaborate"], answer: 2 },
    { q: "Meaning of 'hit the nail on the head':", options: ["Make a mistake","Be exactly correct","Work hard","Miss an opportunity"], answer: 1 },
    { q: "Correctly spelled word:", options: ["Entrepreneurship","Enterpreneurship","Entrepeneurship","Entreprenurship"], answer: 0 },
    { q: "Grammar: 'Neither the manager nor the staff ___ present.'", options: ["were","was","are","is"], answer: 1 },
    { q: "Synonym of 'Prudent':", options: ["Reckless","Wise","Foolish","Impulsive"], answer: 1 },
    { q: "Antonym of 'Amiable':", options: ["Friendly","Warm","Hostile","Pleasant"], answer: 2 },
    { q: "Fill in: Despite challenges the team showed great _____ in completing the project.", options: ["Lethargy","Resilience","Negligence","Confusion"], answer: 1 },
    { q: "Idiom 'Bite the bullet' means:", options: ["Eat quickly","Endure a painful situation bravely","Shoot a gun","Avoid responsibility"], answer: 1 },
    { q: "Sentence correction: 'He is one of the best employee in the company.'", options: ["best employees","best employed","better employees","better employee"], answer: 0 },
    { q: "Analogy — Knife : Sharp :: Pillow : __?", options: ["Hard","Rough","Soft","Flat"], answer: 2 },
    { q: "Synonym of 'Candid':", options: ["Dishonest","Frank","Secretive","Vague"], answer: 1 },
    { q: "Fill in: The policy was _____ by unanimous consent of the board.", options: ["rejected","ratified","questioned","postponed"], answer: 1 },
    { q: "Antonym of 'Frugal':", options: ["Thrifty","Economical","Extravagant","Careful"], answer: 2 },
    { q: "Correct passive voice: 'The chef prepared the meal.'", options: ["The meal was prepared by the chef.","The meal is prepared by the chef.","The meal were prepared by the chef.","The meal has prepared by the chef."], answer: 0 },
    { q: "Idiom 'Break the ice' means:", options: ["Destroy something","Create an uncomfortable situation","Initiate conversation to ease tension","Win a competition"], answer: 2 },
  ],

  company: [
    { q: "In which year was The Oberoi Group founded?", options: ["1930","1932","1934","1938"], answer: 2 },
    { q: "Where was Rai Bahadur Mohan Singh Oberoi born?", options: ["Delhi","Shimla","Undivided Punjab (now Pakistan)","Lahore"], answer: 2 },
    { q: "First hotel acquired by Mr. M.S. Oberoi?", options: ["Grand Hotel, Calcutta","Cecil Hotel, Shimla","Clarkes Hotel, Shimla","Maidens Hotel, Delhi"], answer: 2 },
    { q: "Title conferred on Mr. M.S. Oberoi by British Government in 1943?", options: ["Padma Bhushan","Rai Bahadur","Padma Vibhushan","Padma Shri"], answer: 1 },
    { q: "The Oberoi Inter Continental, New Delhi opened in:", options: ["1960","1963","1965","1968"], answer: 2 },
    { q: "Flagship company of The Oberoi Group:", options: ["Oberoi Hotels Private Limited","EIH Limited","EIH Associated Hotels Ltd","Trident Hotels Ltd"], answer: 1 },
    { q: "Indian government honour accorded to Rai Bahadur M.S. Oberoi in 2001:", options: ["Padma Shri","Padma Vibhushan","Padma Bhushan","Bharat Ratna"], answer: 2 },
    { q: "Mr. P.R.S. Oberoi was awarded the Padma Vibhushan in:", options: ["2005","2006","2007","2008"], answer: 3 },
    { q: "OCLD stands for:", options: ["Oberoi Centre for Leadership Development","Oberoi Centre of Learning and Development","Oberoi College of Learning and Design","Oberoi Centre for Luxury Development"], answer: 1 },
    { q: "The Oberoi Group's two main brands:", options: ["Oberoi and Hilton","Oberoi and Marriott","Oberoi and Trident","Oberoi and Taj"], answer: 2 },
    { q: "Current Managing Director & CEO of EIH Limited:", options: ["Arjun Oberoi","P.R.S. Oberoi","Vikram Oberoi","Mohit Nirula"], answer: 2 },
    { q: "Guests giving NPS rating 9 or 10 are called:", options: ["Passives","Detractors","Promoters","Advocates"], answer: 2 },
    { q: "OCLD was established in:", options: ["1960","1963","1966","1970"], answer: 2 },
    { q: "APEX stands for:", options: ["Achieving Performance Excellence","Advancing Premium Experience","Applied Professional Excellence","Assurance of Premium Experience"], answer: 0 },
    { q: "The Oberoi Group's CSR partnership for children's education is with:", options: ["UNICEF","SOS Children's Villages","Save the Children","CRY"], answer: 1 },
    { q: "Property management system (PMS) used at Oberoi hotels:", options: ["SAP","Opera","Micros","Salesforce"], answer: 1 },
    { q: "Point-of-sale system used in F&B outlets at Oberoi:", options: ["Opera","SAP","Micros / Symphony","Newgen"], answer: 2 },
    { q: "EIH Limited shares were listed on BSE in:", options: ["1949","1952","1956","1960"], answer: 2 },
    { q: "Oberoi first started flight catering in India in:", options: ["1955","1957","1960","1965"], answer: 1 },
    { q: "EOBO referral incentive amount (after 6 months of joining):", options: ["₹5,000","₹6,000","₹7,500","₹10,000"], answer: 2 },
    { q: "The Supervisory Development Programme (SDP) is:", options: ["1 month","2 months","3 months","6 months"], answer: 2 },
    { q: "Executive Chairman of EIH Limited:", options: ["Vikram Oberoi","Arjun Oberoi","P.R.S. Oberoi","Mohit Nirula"], answer: 1 },
    { q: "Oberoi Beach Resort, Bali, Indonesia opened in:", options: ["1975","1978","1980","1982"], answer: 1 },
    { q: "M.S. Oberoi's first job was as a desk clerk at:", options: ["Clarkes Hotel","Grand Hotel","Cecil Hotel","Maidens Hotel"], answer: 2 },
    { q: "emPower programme allows employees to:", options: ["Apply for promotions","Arrange surprise items for guests up to a certain value","Request hotel transfers","Manage leave balance"], answer: 1 },
    { q: "In 2020, The Oberoi Group formed a strategic alliance with:", options: ["Four Seasons","Mandarin Oriental Hotel Group","Ritz Carlton","Aman Resorts"], answer: 1 },
    { q: "The EIH Limited was incorporated in:", options: ["1944","1947","1949","1952"], answer: 2 },
    { q: "Mr. M.S. Oberoi acquired controlling interest in Associated Hotels of India (AHI) in:", options: ["1938","1940","1943","1945"], answer: 2 },
    { q: "The company intranet where APEX can be accessed is called:", options: ["CONNECT","OPEN","PORTAL","APEX Hub"], answer: 1 },
    { q: "The Oberoi, Mumbai reopened after full renovation in:", options: ["2008","2009","2010","2011"], answer: 2 },
  ],

  awareness: [
    { q: "RevPAR stands for:", options: ["Revenue Per Available Room","Revenue Per Active Rate","Return Per Active Room","Revenue Per Allocated Resource"], answer: 0 },
    { q: "Indian city known as the 'Pink City':", options: ["Agra","Udaipur","Jaipur","Jodhpur"], answer: 2 },
    { q: "Taj Mahal is located in:", options: ["Delhi","Agra","Jaipur","Lucknow"], answer: 1 },
    { q: "GDP stands for:", options: ["Gross Domestic Product","General Development Plan","Gross Development Potential","General Domestic Profit"], answer: 0 },
    { q: "World's highest mountain range:", options: ["Alps","Andes","Himalayas","Rockies"], answer: 2 },
    { q: "Currency of Japan:", options: ["Yuan","Won","Yen","Ringgit"], answer: 2 },
    { q: "Capital city of Morocco:", options: ["Casablanca","Marrakech","Rabat","Fez"], answer: 2 },
    { q: "National animal of India:", options: ["Lion","Elephant","Bengal Tiger","Peacock"], answer: 2 },
    { q: "CSR stands for:", options: ["Customer Service Representative","Corporate Social Responsibility","Central Sales Revenue","Customer Satisfaction Rating"], answer: 1 },
    { q: "River that flows through Egypt:", options: ["Amazon","Congo","Nile","Ganges"], answer: 2 },
    { q: "UNESCO stands for:", options: ["United Nations Educational, Scientific and Cultural Organization","United Nations Economic and Social Council","Universal Nations Education and Science Committee","United Nations Environmental and Social Council"], answer: 0 },
    { q: "Indonesia is the world's largest:", options: ["Peninsula","Archipelago","Continent","Desert"], answer: 1 },
    { q: "Hospitality industry belongs to which sector?", options: ["Manufacturing","Agriculture","Services","Technology"], answer: 2 },
    { q: "G20 is a group of:", options: ["20 richest countries","20 most populous nations","Major world economies","UN Security Council members"], answer: 2 },
    { q: "National flower of India:", options: ["Rose","Lotus","Jasmine","Marigold"], answer: 1 },
    { q: "Headquarters of the United Nations:", options: ["London","Paris","New York","Geneva"], answer: 2 },
    { q: "'Land of the Rising Sun':", options: ["China","South Korea","Japan","Thailand"], answer: 2 },
    { q: "World's largest ocean:", options: ["Atlantic","Indian","Arctic","Pacific"], answer: 3 },
    { q: "Currency of the United Kingdom:", options: ["Euro","Dollar","Pound Sterling","Franc"], answer: 2 },
    { q: "'Discovery of India' was written by:", options: ["Mahatma Gandhi","Jawaharlal Nehru","Rabindranath Tagore","Subhas Chandra Bose"], answer: 1 },
    { q: "2024 Summer Olympics were held in:", options: ["Tokyo","London","Paris","Los Angeles"], answer: 2 },
    { q: "Most abundant gas in Earth's atmosphere:", options: ["Oxygen","Carbon Dioxide","Nitrogen","Hydrogen"], answer: 2 },
    { q: "Bali is an island in:", options: ["Malaysia","Philippines","Indonesia","Thailand"], answer: 2 },
    { q: "Country that hosts the Davos World Economic Forum:", options: ["Germany","USA","Switzerland","France"], answer: 2 },
    { q: "Indian city known as the 'City of Joy':", options: ["Mumbai","Chennai","Kolkata","Hyderabad"], answer: 2 },
    { q: "Full form of FSSAI:", options: ["Food Safety and Standards Authority of India","Food Supply and Standards Association of India","Federal Safety Standards Authority of India","Food Service Standards Agency of India"], answer: 0 },
    { q: "What does 'sustainable tourism' promote?", options: ["Mass tourism","Eco-friendly travel with minimal environmental impact","Luxury travel","Budget backpacking"], answer: 1 },
    { q: "Full form of GST:", options: ["General Sales Tax","Goods and Services Tax","Government Standard Tax","Gross Service Tax"], answer: 1 },
  ],
};

const SECTION_META = [
  { id: "abstract",  name: "Abstract Reasoning",   time: 16, count: 11 },
  { id: "numerical", name: "Numerical Reasoning",   time: 22, count: 11 },
  { id: "verbal",    name: "Verbal Reasoning",       time: 22, count: 12 },
  { id: "company",   name: "Company Knowledge",      time: 13, count: 13 },
  { id: "awareness", name: "General Awareness",      time: 13, count: 13 },
];

const TOTAL_QUESTIONS = SECTION_META.reduce((s, m) => s + m.count, 0);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSections() {
  return SECTION_META.map(m => ({
    ...m,
    questions: shuffle(QUESTION_POOLS[m.id]).slice(0, m.count),
  }));
}

function getAttemptData(name) {
  try {
    const key = "oberoi_cat_" + name.toLowerCase().trim().replace(/\s+/g, "_");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { count: 0, history: [] };
  } catch { return { count: 0, history: [] }; }
}

function saveAttempt(name, score, passed) {
  try {
    const key = "oberoi_cat_" + name.toLowerCase().trim().replace(/\s+/g, "_");
    const data = getAttemptData(name);
    data.count += 1;
    data.history.push({ score, passed, date: new Date().toLocaleString("en-IN") });
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function calcScore(sections, answers) {
  let score = 0;
  sections.forEach((sec, si) =>
    sec.questions.forEach((q, qi) => { if (answers[si]?.[qi] === q.answer) score++; })
  );
  return score;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const G = {
  bg: "#0a0d14", card: "#111620", border: "#1e2740", gold: "#c9a84c",
  goldLight: "#e8c97a", text: "#e8e4d9", muted: "#7a8099", accent: "#1a2a4a",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; color: ${G.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${G.bg}; } ::-webkit-scrollbar-thumb { background: ${G.gold}; border-radius: 4px; }
  .serif { font-family: 'Playfair Display', serif; }
  .btn-gold { background: linear-gradient(135deg,${G.gold},${G.goldLight}); color:#0a0d14; font-weight:600; border:none; cursor:pointer; padding:14px 36px; border-radius:2px; font-size:15px; letter-spacing:.5px; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .btn-gold:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(201,168,76,.3); }
  .btn-gold:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .btn-outline { background:transparent; color:${G.gold}; border:1px solid ${G.gold}; padding:10px 24px; border-radius:2px; cursor:pointer; font-size:14px; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .btn-outline:hover { background:${G.gold}; color:#0a0d14; }
  .card { background:${G.card}; border:1px solid ${G.border}; border-radius:4px; }
  .opt-btn { width:100%; text-align:left; padding:14px 18px; background:${G.accent}; border:1px solid ${G.border}; color:${G.text}; cursor:pointer; border-radius:3px; font-size:14.5px; transition:all .15s; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:12px; }
  .opt-btn:hover { border-color:${G.gold}; background:#1d2f50; }
  .opt-btn.selected { border-color:${G.gold}; background:#1d2f50; }
  .opt-label { width:26px; height:26px; border-radius:50%; border:1px solid ${G.muted}; display:flex; align-items:center; justify-content:center; font-size:12px; color:${G.muted}; flex-shrink:0; font-weight:600; }
  .opt-btn.selected .opt-label { border-color:${G.gold}; color:${G.gold}; background:rgba(201,168,76,.1); }
  .divider { height:1px; background:${G.border}; margin:20px 0; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fade-in { animation:fadeIn .4s ease forwards; }
  input[type=text] { background:${G.accent}; border:1px solid ${G.border}; color:${G.text}; padding:12px 16px; border-radius:3px; font-size:15px; width:100%; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; }
  input[type=text]:focus { border-color:${G.gold}; }
  .sec-tab { padding:8px 16px; border-radius:2px; cursor:pointer; font-size:13px; border:1px solid transparent; transition:all .2s; color:${G.muted}; white-space:nowrap; }
  .sec-tab.active { border-color:${G.gold}; color:${G.gold}; background:rgba(201,168,76,.08); }
  .sec-tab.has-ans { color:${G.text}; }
  .q-nav-btn { width:34px; height:34px; border-radius:3px; border:1px solid ${G.border}; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; color:${G.muted}; transition:all .15s; background:${G.accent}; }
  .q-nav-btn:hover { border-color:${G.gold}; color:${G.gold}; }
  .q-nav-btn.answered { background:rgba(201,168,76,.15); border-color:${G.gold}; color:${G.gold}; }
  .q-nav-btn.current { background:${G.gold}; color:#0a0d14; border-color:${G.gold}; font-weight:700; }
  .timer { font-variant-numeric:tabular-nums; }
  .timer.warn { color:#e8a84c; }
  .timer.danger { color:#e85c4c; animation:pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
  .progress-bar { height:3px; background:${G.border}; border-radius:2px; overflow:hidden; }
  .progress-fill { height:100%; background:linear-gradient(90deg,${G.gold},${G.goldLight}); border-radius:2px; transition:width .3s; }
  .score-circle { width:150px; height:150px; border-radius:50%; border:3px solid ${G.gold}; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(201,168,76,.06); }
  .attempt-dot { width:10px; height:10px; border-radius:50%; }
`;

// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ textAlign: "center", marginBottom: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: 6, color: G.gold, textTransform: "uppercase", marginBottom: 4 }}>✦ The Oberoi Group ✦</div>
      <div className="serif" style={{ fontSize: 22, color: G.text, fontWeight: 700 }}>SDP Candidate Assessment</div>
    </div>
  );
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [attemptInfo, setAttemptInfo] = useState(null);

  function checkName(n) {
    if (!n.trim()) return;
    const data = getAttemptData(n.trim());
    setAttemptInfo(data);
    setErr("");
  }

  function handleStart() {
    if (!name.trim()) { setErr("Please enter your full name."); return; }
    const data = getAttemptData(name.trim());
    if (data.count >= MAX_ATTEMPTS) {
      setErr(`You have used all ${MAX_ATTEMPTS} attempts. Please contact HR.`);
      return;
    }
    onStart(name.trim());
  }

  const attemptsLeft = attemptInfo ? MAX_ATTEMPTS - attemptInfo.count : null;

  return (
    <div className="fade-in" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: `radial-gradient(ellipse at 20% 50%,#0d1a2e 0%,${G.bg} 60%)` }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Logo />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: G.muted, textTransform: "uppercase" }}>Competitive Aptitude Test</div>
        </div>
        <div className="card" style={{ padding: "32px 36px" }}>
          {/* Section overview */}
          <div className="serif" style={{ fontSize: 16, color: G.goldLight, marginBottom: 10 }}>Examination Details</div>
          <div className="divider" style={{ marginTop: 0 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {SECTION_META.map(s => (
              <div key={s.id} style={{ background: G.accent, padding: "9px 12px", borderRadius: 3, borderLeft: `2px solid ${G.gold}` }}>
                <div style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{s.count} questions · {s.time} min</div>
              </div>
            ))}
          </div>
          <div style={{ background: G.accent, padding: "12px 16px", borderRadius: 3, border: `1px solid ${G.border}`, marginBottom: 6 }}>
            {[["Total Questions", TOTAL_QUESTIONS],["Duration","90 minutes"],["Pass Mark",`35 / 60 correct`],["Max Attempts",`${MAX_ATTEMPTS} attempts`]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginTop: i?6:0 }}>
                <span style={{ color:G.muted }}>{k}</span>
                <span style={{ color: k==="Pass Mark"?G.gold:G.text, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.7, marginBottom: 20 }}>
            • Questions are randomised — each attempt has a different set.<br />
            • You may navigate freely across all sections during the exam.<br />
            • The test auto-submits when the timer reaches zero.
          </div>

          {/* Name input */}
          <label style={{ fontSize: 12, color: G.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Full Name</label>
          <input type="text" placeholder="Enter your full name" value={name}
            onChange={e => { setName(e.target.value); checkName(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleStart()} />

          {/* Attempt status */}
          {attemptInfo && attemptsLeft !== null && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: G.muted }}>Attempts used:</span>
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <div key={i} className="attempt-dot" style={{ background: i < attemptInfo.count ? "#e85c4c" : G.border }} />
              ))}
              <span style={{ fontSize: 12, color: attemptsLeft === 0 ? "#e85c4c" : G.gold, marginLeft: 4 }}>
                {attemptsLeft === 0 ? "No attempts left" : `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} remaining`}
              </span>
            </div>
          )}

          {err && <div style={{ color: "#e85c4c", fontSize: 13, marginTop: 8, padding: "8px 12px", background: "rgba(232,92,76,0.1)", borderRadius: 3, border: "1px solid rgba(232,92,76,0.3)" }}>{err}</div>}

          <button className="btn-gold" style={{ width: "100%", marginTop: 18 }}
            disabled={!name.trim() || (attemptInfo && attemptInfo.count >= MAX_ATTEMPTS)}
            onClick={handleStart}>
            Begin Examination
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: G.muted }}>
          Results are automatically recorded to HR upon submission
        </div>
      </div>
    </div>
  );
}

// ── EXAM ──────────────────────────────────────────────────────────────────────
function Exam({ name, sections, onSubmit }) {
  const [secIdx, setSecIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState(() => sections.map(s => Array(s.questions.length).fill(-1)));
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const doSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    onSubmit(answersRef.current);
  }, [submitted, onSubmit]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { doSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const sec = sections[secIdx];
  const q = sec.questions[qIdx];
  const answered = sections.reduce((t, s, si) => t + s.questions.filter((_, qi) => answers[si][qi] !== -1).length, 0);
  const timerClass = timeLeft < 300 ? "timer danger" : timeLeft < 600 ? "timer warn" : "timer";

  function select(oi) {
    const na = answers.map(a => [...a]); na[secIdx][qIdx] = oi; setAnswers(na);
  }
  function goNext() {
    if (qIdx < sec.questions.length - 1) setQIdx(qIdx + 1);
    else if (secIdx < sections.length - 1) { setSecIdx(secIdx + 1); setQIdx(0); }
  }
  function goPrev() {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else if (secIdx > 0) { setSecIdx(secIdx - 1); setQIdx(sections[secIdx - 1].questions.length - 1); }
  }

  const absQ = sections.slice(0, secIdx).reduce((s, x) => s + x.questions.length, 0) + qIdx;

  return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: G.card, borderBottom: `1px solid ${G.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div className="serif" style={{ fontSize: 15, color: G.text }}>{name}</div>
          <div style={{ fontSize: 11, color: G.muted }}>Q {absQ + 1}/{TOTAL_QUESTIONS} · {answered} answered</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className={timerClass} style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2, color: timeLeft < 300 ? "#e85c4c" : G.gold }}>{formatTime(timeLeft)}</div>
          <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1 }}>REMAINING</div>
        </div>
        <button className="btn-gold" style={{ padding: "10px 24px", fontSize: 13 }} onClick={() => { if (window.confirm("Submit exam? This cannot be undone.")) doSubmit(); }}>
          Submit Exam
        </button>
      </div>
      {/* Progress */}
      <div style={{ padding: "6px 24px", background: G.card, borderBottom: `1px solid ${G.border}` }}>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(answered / TOTAL_QUESTIONS) * 100}%` }} /></div>
      </div>
      {/* Section tabs */}
      <div style={{ padding: "8px 24px", background: G.card, borderBottom: `1px solid ${G.border}`, display: "flex", gap: 8, overflowX: "auto" }}>
        {sections.map((s, si) => {
          const sa = answers[si].filter(a => a !== -1).length;
          return (
            <div key={s.id} className={`sec-tab ${si === secIdx ? "active" : ""} ${sa > 0 ? "has-ans" : ""}`} onClick={() => { setSecIdx(si); setQIdx(0); }}>
              {s.name} <span style={{ fontSize: 11, marginLeft: 4, opacity: .7 }}>({sa}/{s.questions.length})</span>
            </div>
          );
        })}
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: "flex", maxWidth: 1100, width: "100%", margin: "0 auto", padding: "24px 20px", gap: 20 }}>
        {/* Question */}
        <div style={{ flex: 1 }} className="fade-in" key={`${secIdx}-${qIdx}`}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ background: G.gold, color: "#0a0d14", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{qIdx + 1}</div>
              <div style={{ fontSize: 12, color: G.muted, letterSpacing: 1, textTransform: "uppercase" }}>{sec.name}</div>
            </div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1.7, color: G.text, marginBottom: 26 }}>{q.q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, oi) => (
                <button key={oi} className={`opt-btn ${answers[secIdx][qIdx] === oi ? "selected" : ""}`} onClick={() => select(oi)}>
                  <div className="opt-label">{String.fromCharCode(65 + oi)}</div>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button className="btn-outline" onClick={goPrev} disabled={secIdx === 0 && qIdx === 0}>← Previous</button>
            <button className="btn-gold" onClick={goNext} disabled={secIdx === sections.length - 1 && qIdx === sec.questions.length - 1}>Next →</button>
          </div>
        </div>
        {/* Navigator */}
        <div style={{ width: 190, flexShrink: 0 }}>
          <div className="card" style={{ padding: 16, position: "sticky", top: 140 }}>
            <div style={{ fontSize: 11, color: G.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Questions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sec.questions.map((_, qi) => (
                <div key={qi} className={`q-nav-btn ${qi === qIdx ? "current" : answers[secIdx][qi] !== -1 ? "answered" : ""}`} onClick={() => setQIdx(qi)}>{qi + 1}</div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ fontSize: 12, color: G.muted }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                <div style={{ width: 12, height: 12, background: G.gold, borderRadius: 2 }} /><span>Answered</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: G.accent, border: `1px solid ${G.border}`, borderRadius: 2 }} /><span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
function Results({ name, sections, answers, savedOk, attemptCount }) {
  const score = calcScore(sections, answers);
  const passed = score >= PASS_MARK;
  const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
  const attemptsLeft = MAX_ATTEMPTS - attemptCount;

  const sectionScores = sections.map((sec, si) => ({
    name: sec.name,
    correct: sec.questions.filter((q, qi) => answers[si][qi] === q.answer).length,
    total: sec.questions.length,
  }));

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 80% 20%,#0d1a2e 0%,${G.bg} 60%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Logo />
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: G.muted, textTransform: "uppercase", marginBottom: 16 }}>Examination Complete</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div className="score-circle">
              <div className="serif" style={{ fontSize: 44, fontWeight: 700, color: passed ? G.gold : "#e85c4c", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 13, color: G.muted }}>out of {TOTAL_QUESTIONS}</div>
            </div>
          </div>
          <div className="serif" style={{ fontSize: 22, color: passed ? G.goldLight : "#e87c6c", marginBottom: 6 }}>
            {passed ? "🎉 Congratulations — Passed!" : "Not Cleared — Better Luck Next Time"}
          </div>
          <div style={{ fontSize: 13, color: G.muted, marginBottom: 4 }}>
            {name} · {pct}% · {passed ? `${score - PASS_MARK} marks above pass` : `${PASS_MARK - score} marks below pass`}
          </div>
          {!passed && (
            <div style={{ fontSize: 12, color: attemptsLeft > 0 ? G.gold : "#e85c4c", marginBottom: 16 }}>
              {attemptsLeft > 0 ? `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} remaining` : "No attempts remaining — please contact HR."}
            </div>
          )}
        </div>

        {/* Section breakdown */}
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <div className="serif" style={{ fontSize: 15, color: G.goldLight, marginBottom: 14 }}>Section-wise Performance</div>
          {sectionScores.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: G.text }}>{s.name}</span>
                <span style={{ color: G.muted }}>{s.correct}/{s.total}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(s.correct / s.total) * 100}%` }} /></div>
            </div>
          ))}
        </div>

        {/* Save status */}
        <div className="card" style={{ padding: "14px 20px", marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{savedOk ? "✅" : "⚠️"}</span>
          <span style={{ fontSize: 13, color: savedOk ? G.text : "#e8a84c" }}>
            {savedOk ? "Results saved to HR Google Sheet." : "Could not reach Google Sheet — please inform HR manually."}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("landing");
  const [name, setName] = useState("");
  const [sections, setSections] = useState(null);
  const [result, setResult] = useState(null);

  function handleStart(n) {
    setName(n);
    setSections(buildSections()); // fresh random questions every attempt
    setPhase("exam");
  }

  async function handleSubmit(answers) {
    const score = calcScore(sections, answers);
    const passed = score >= PASS_MARK;
    const ts = new Date().toLocaleString("en-IN");

    saveAttempt(name, score, passed);
    const newData = getAttemptData(name);

    const sectionBreakdown = sections.map((sec, si) => {
      const correct = sec.questions.filter((q, qi) => answers[si]?.[qi] === q.answer).length;
      return `${sec.name}: ${correct}/${sec.questions.length}`;
    }).join(" | ");

    let savedOk = false;
    try {
      await fetch(SHEETS_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, score, total: TOTAL_QUESTIONS,
          percentage: Math.round((score / TOTAL_QUESTIONS) * 100) + "%",
          passed: passed ? "YES" : "NO",
          attempt: newData.count,
          submittedAt: ts,
          sectionBreakdown,
        }),
      });
      savedOk = true;
    } catch { savedOk = false; }

    setResult({ answers, savedOk, attemptCount: newData.count });
    setPhase("results");
  }

  return (
    <>
      <style>{css}</style>
      {phase === "landing" && <Landing onStart={handleStart} />}
      {phase === "exam" && <Exam name={name} sections={sections} onSubmit={handleSubmit} />}
      {phase === "results" && (
        <Results name={name} sections={sections} answers={result.answers} savedOk={result.savedOk} attemptCount={result.attemptCount} />
      )}
    </>
  );
}
