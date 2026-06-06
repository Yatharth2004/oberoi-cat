import { useState, useRef, useCallback, useEffect } from "react";

const MAX_ATTEMPTS = 3;
const PASS_MARK = 35;
const EXAM_DURATION = 90 * 60;

const DEPARTMENTS = [
  { id: "frontoffice",   label: "Front Office" },
  { id: "housekeeping",  label: "Housekeeping" },
  { id: "fnb",           label: "Food & Beverage Service" },
  { id: "kitchen",       label: "Kitchen" },
  { id: "finance",       label: "Finance" },
  { id: "engineering",   label: "Engineering" },
  { id: "Spa & Recreation",   label: "Spa & Recreation" },
];

const SECTION_META = [
  { id: "abstract",   name: "Abstract Reasoning",  time: 16, count: 11 },
  { id: "numerical",  name: "Numerical Reasoning",  time: 22, count: 11 },
  { id: "verbal",     name: "Verbal Reasoning",      time: 22, count: 12 },
  { id: "company",    name: "Company Knowledge",     time: 13, count: 13 },
  { id: "awareness",  name: "General Awareness",     time: 13, count: 13 },
];

const TOTAL_QUESTIONS_CALC = SECTION_META.reduce((s, m) => s + m.count, 0);

// ── COMMON QUESTION POOLS (Drawings added via custom Draw functions) ─────────
const COMMON = {
  abstract: [
    /* Drawn Pattern Reasoning Example 1 */
    { 
      q: "Pattern Reasoning: Look closely at the sequence of matrices below. What logically completes the pattern inside the final box?", 
      options: ["A square with 4 dots", "A triangle with 3 dots", "A circle with 1 dot", "An empty hexagon"], 
      answer: 1,
      draw: () => (
        <svg viewBox="0 0 400 100" style={{ width: "100%", maxWidth: "400px", background: "#111723", padding: "10px", borderRadius: "4px", border: "1px solid #1e2638" }}>
          {/* Box 1 */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#c9a84c" strokeWidth="2"/>
          <line x1="10" y1="10" x2="90" y2="90" stroke="#7e8a9f" strokeWidth="1" />
          <circle cx="30" cy="30" r="4" fill="#c9a84c" />
          {/* Box 2 */}
          <rect x="110" y="10" width="80" height="80" fill="none" stroke="#c9a84c" strokeWidth="2"/>
          <line x1="110" y1="10" x2="190" y2="90" stroke="#7e8a9f" strokeWidth="1" />
          <line x1="190" y1="10" x2="110" y2="90" stroke="#7e8a9f" strokeWidth="1" />
          <circle cx="130" cy="30" r="4" fill="#c9a84c" />
          <circle cx="170" cy="30" r="4" fill="#c9a84c" />
          {/* Box 3 */}
          <rect x="210" y="10" width="80" height="80" fill="none" stroke="#c9a84c" strokeWidth="2"/>
          <circle cx="250" cy="50" r="25" fill="none" stroke="#7e8a9f" strokeWidth="2" />
          {/* Arrow */}
          <text x="305" y="55" fill="#c9a84c" fontSize="20" fontWeight="bold">➔</text>
          {/* Target Box */}
          <rect x="340" y="10" width="50" height="80" fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="4"/>
          <text x="360" y="55" fill="#7e8a9f" fontSize="24">?</text>
        </svg>
      )
    },
    { q: "Series: 2, 4, 8, 16, __?", options: ["24","32","30","36"], answer: 1 },
    { q: "Series: 1, 4, 9, 16, 25, __?", options: ["30","35","36","49"], answer: 2 },
    { q: "Series: 100, 96, 89, 79, 66, __?", options: ["50","53","49","55"], answer: 0 },
    { q: "Fibonacci — 1, 1, 2, 3, 5, 8, 13, __?", options: ["18","20","21","26"], answer: 2 },
    { q: "Series: 2, 6, 12, 20, 30, __?", options: ["40","42","44","48"], answer: 1 },
    { q: "Series: 3, 6, 11, 18, 27, __?", options: ["36","38","40","42"], answer: 1 },
    { q: "Series: 1, 2, 4, 7, 11, 16, __?", options: ["20","22","24","26"], answer: 1 },
    { q: "Series: 6, 11, 21, 36, 56, __?", options: ["76","79","81","83"], answer: 2 },
    { q: "Series: 144, 121, 100, 81, __?", options: ["64","68","72","70"], answer: 0 },
    { q: "Series: 7, 14, 28, 56, __?", options: ["98","108","112","116"], answer: 2 },
    { q: "Series: 5, 11, 23, 47, __?", options: ["89","94","95","98"], answer: 2 },
    { q: "Series: 0, 1, 3, 6, 10, 15, __?", options: ["18","20","21","22"], answer: 2 },
    { q: "Letter series: A, C, E, G, __?", options: ["H","I","J","K"], answer: 1 },
    { q: "Letter series: Z, X, V, T, __?", options: ["R","S","Q","P"], answer: 0 },
    { q: "Letter series: A, D, G, J, __?", options: ["K","L","M","N"], answer: 2 },
    { q: "Letter series: A, Z, B, Y, C, __?", options: ["D","W","X","V"], answer: 2 },
    { q: "Analogy — 3 : 27 :: 4 : __?", options: ["48","64","16","32"], answer: 1 },
    { q: "Analogy — 4 : 64 :: 5 : __?", options: ["100","115","125","135"], answer: 2 },
    { q: "Analogy — Doctor : Hospital :: Teacher : __?", options: ["Office","School","Library","Class"], answer: 1 },
    { q: "Analogy — Painter : Brush :: Writer : __?", options: ["Paper","Pen","Ink","Book"], answer: 1 },
    { q: "Analogy — Bird : Nest :: Human : __?", options: ["Office","Car","House","Garden"], answer: 2 },
    { q: "Odd one out: 144, 169, 196, 225, 250", options: ["144","196","225","250"], answer: 3 },
    { q: "Odd one out: 121, 144, 169, 196, 200", options: ["121","169","196","200"], answer: 3 },
    { q: "Odd one out (3-D): Square, Circle, Triangle, Cube, Rectangle", options: ["Circle","Triangle","Cube","Rectangle"], answer: 2 },
    { q: "Odd one out: Cricket, Football, Chess, Hockey, Tennis", options: ["Cricket","Football","Chess","Hockey"], answer: 2 },
    { q: "Odd one out (not prime): 3, 5, 7, 9, 11", options: ["3","5","9","11"], answer: 2 },
    { q: "Odd one out: Rose, Lotus, Jasmine, Mango, Marigold", options: ["Rose","Lotus","Mango","Marigold"], answer: 2 },
    { q: "Coding: MANGO → NBOHP. APPLE = ?", options: ["BQQMF","BPQMF","BQQNF","BQQLF"], answer: 0 },
    { q: "If RED = 27, what is BLUE?", options: ["36","38","40","42"], answer: 2 },
    { q: "Direction: Walks 10m North, turns right 5m, turns right 10m. Facing?", options: ["North","East","South","West"], answer: 2 },
    { q: "Sita walks 3km East then 4km North. Shortest distance from start?", options: ["3 km","4 km","5 km","7 km"], answer: 2 },
    { q: "A walks South 5m, left 3m, left 5m. Now facing?", options: ["North","South","East","West"], answer: 0 },
    { q: "A is B's father. C is A's sister. C's relation to B?", options: ["Mother","Sister","Aunt","Grandmother"], answer: 2 },
    { q: "Pointing to a girl, Raj says 'She is my father's only son's daughter.' Relation to Raj?", options: ["Sister","Daughter","Niece","Cousin"], answer: 1 },
    { q: "All hotels are buildings. All buildings have roofs. All hotels have roofs?", options: ["Definitely True","Definitely False","Uncertain","Partially True"], answer: 0 },
    { q: "Some managers are leaders. All leaders are motivators. Some managers are motivators?", options: ["Definitely True","Definitely False","Cannot be determined","Partially True"], answer: 0 },
    { q: "In a matrix: Row1: 2,4,6 | Row2: 3,6,9 | Row3: 4,8,__?", options: ["10","11","12","14"], answer: 2 },
    { q: "If P is Q's mother and Q is R's sister, what is P to R?", options: ["Grandmother","Aunt","Mother","Sister"], answer: 2 },
  ],

  numerical: [
    /* Drawn Data Representation Example 1 (Custom Line Graph) */
    { 
      q: "Data Representation: Analyze the room performance metrics chart drawn below. Between which two operational quarters did the hotel register the highest net increase in overall Occupancy %?", 
      options: ["Q1 to Q2", "Q2 to Q3", "Q3 to Q4", "The occupancy performance remained completely stagnant"], 
      answer: 1,
      draw: () => (
        <svg viewBox="0 0 450 180" style={{ width: "100%", maxWidth: "450px", background: "#111723", padding: "15px", borderRadius: "4px", border: "1px solid #1e2638" }}>
          {/* Grid lines */}
          <line x1="40" y1="20" x2="420" y2="20" stroke="#1e2638" strokeWidth="1" />
          <line x1="40" y1="60" x2="420" y2="60" stroke="#1e2638" strokeWidth="1" />
          <line x1="40" y1="100" x2="420" y2="100" stroke="#1e2638" strokeWidth="1" />
          <line x1="40" y1="140" x2="420" y2="140" stroke="#1e2638" strokeWidth="1" />
          
          {/* Y Axis Labels */}
          <text x="10" y="25" fill="#7e8a9f" fontSize="10">80%</text>
          <text x="10" y="65" fill="#7e8a9f" fontSize="10">60%</text>
          <text x="10" y="105" fill="#7e8a9f" fontSize="10">40%</text>
          <text x="10" y="145" fill="#7e8a9f" fontSize="10">20%</text>

          {/* Graph Axis */}
          <line x1="40" y1="10" x2="40" y2="150" stroke="#7e8a9f" strokeWidth="1.5" />
          <line x1="40" y1="150" x2="430" y2="150" stroke="#7e8a9f" strokeWidth="1.5" />

          {/* Graph Plots / Trend Line (Q1: 45%, Q2: 50%, Q3: 75%, Q4: 70%) */}
          {/* Calculated coordinates: Q1=70,110 | Q2=170,100 | Q3=270,30 | Q4=370,40 */}
          <path d="M 70 110 L 170 100 L 270 30 L 370 40" fill="none" stroke="#c9a84c" strokeWidth="3" />
          
          {/* Node points */}
          <circle cx="70" cy="110" r="4" fill="#dfc475" />
          <circle cx="170" cy="100" r="4" fill="#dfc475" />
          <circle cx="270" cy="30" r="4" fill="#dfc475" />
          <circle cx="370" cy="40" r="4" fill="#dfc475" />

          {/* Node labels */}
          <text x="65" y="125" fill="#d1d7e0" fontSize="11" fontWeight="bold">45%</text>
          <text x="165" y="115" fill="#d1d7e0" fontSize="11" fontWeight="bold">50%</text>
          <text x="265" y="20" fill="#dfc475" fontSize="11" fontWeight="bold">75%</text>
          <text x="365" y="30" fill="#d1d7e0" fontSize="11" fontWeight="bold">70%</text>

          {/* X Axis Labels */}
          <text x="60" y="168" fill="#7e8a9f" fontSize="11">Quarter 1</text>
          <text x="160" y="168" fill="#7e8a9f" fontSize="11">Quarter 2</text>
          <text x="260" y="168" fill="#7e8a9f" fontSize="11">Quarter 3</text>
          <text x="360" y="168" fill="#7e8a9f" fontSize="11">Quarter 4</text>
        </svg>
      )
    },
    { q: "A is twice B's age. 10 yrs ago A was 3× B's age. A's current age?", options: ["30","35","40","45"], answer: 2 },
    { q: "Ratio of ages P:Q = 3:5. After 6 yrs = 2:3. P's current age?", options: ["12","15","18","21"], answer: 2 },
    { q: "Father is 30 yrs older than son. In 5 yrs father = 3× son's age. Son's current age?", options: ["8","10","12","15"], answer: 1 },
    { q: "Average age of 5 employees = 28. New employee joins, average = 29. New employee's age?", options: ["30","32","34","36"], answer: 2 },
    { q: "Sum of ages of mother & daughter = 50. 5 yrs ago mother = 7× daughter's age. Daughter's age?", options: ["8","10","12","15"], answer: 2 },
    { q: "Train covers 360 km in 4 hrs. Average speed?", options: ["80 km/h","90 km/h","100 km/h","75 km/h"], answer: 1 },
    { q: "5 workers finish job in 12 days. 4 workers need how many days?", options: ["12","13","15","16"], answer: 2 },
    { q: "What is 15% of 1,200?", options: ["160","170","180","190"], answer: 2 },
    { q: "If 20% of a number is 50, what is 35% of the same number?", options: ["80.5","82.5","87.5","90"], answer: 2 },
    { q: "Male:Female ratio = 3:2, total = 120. How many female?", options: ["40","48","72","80"], answer: 1 },
    { q: "Two taps fill a tank in 3 and 6 hrs respectively. Together?", options: ["1.5 hrs","2 hrs","2.5 hrs","3 hrs"], answer: 1 },
    { q: "Car: 60 km/h × 2 hrs, then 80 km/h × 3 hrs. Average speed?", options: ["68","70","72","74"], answer: 2 },
    { q: "Bought ₹800, sold ₹1,000. Profit %?", options: ["20%","22%","25%","30%"], answer: 2 },
    { q: "Simple interest: ₹5,000 at 8% p.a. for 3 years?", options: ["₹1,000","₹1,100","₹1,200","₹1,500"], answer: 2 },
    { q: "NPS = Promoters% − Detractors%. Promoters 45%, Detractors 15%. NPS?", options: ["25","30","35","40"], answer: 1 },
  ],

  verbal: [
    { q: "Synonym of 'Diligence':", options: ["Laziness","Hard work","Intelligence","Creativity"], answer: 1 },
    { q: "Antonym of 'Profound':", options: ["Deep","Shallow","Thoughtful","Meaningful"], answer: 1 },
    { q: "Correctly spelled:", options: ["Accomodation","Accomadation","Accommodation","Accommadation"], answer: 2 },
    { q: "Error in: 'Each of the employees are required to wear their uniform.'", options: ["Each of the","employees are","required to wear","their uniform"], answer: 1 },
    { q: "Meaning of 'burn the midnight oil':", options: ["Work late at night","Waste resources","Cause fire","Be careless"], answer: 0 },
    { q: "Antonym of 'Turbulent':", options: ["Stormy","Chaotic","Calm","Violent"], answer: 2 },
    { q: "Correct: 'The team ___ completed its task.'", options: ["have","has","are","were"], answer: 1 },
    { q: "Book : Library :: Art : __?", options: ["Museum","Gallery","Exhibition","Studio"], answer: 1 },
    { q: "Synonym of 'Meticulous':", options: ["Careless","Precise","Hasty","Vague"], answer: 1 },
    { q: "Antonym of 'Verbose':", options: ["Talkative","Wordy","Concise","Elaborate"], answer: 2 },
    { q: "Meaning of 'hit the nail on the head':", options: ["Make a mistake","Be exactly correct","Work hard","Miss opportunity"], answer: 1 },
    { q: "Correctly spelled:", options: ["Entrepreneurship","Enterpreneurship","Entrepeneurship","Entreprenurship"], answer: 0 },
    { q: "Grammar: 'Neither manager nor staff ___ present.'", options: ["were","was","are","is"], answer: 1 },
    { q: "Synonym of 'Prudent':", options: ["Reckless","Wise","Foolish","Impulsive"], answer: 1 },
    { q: "Antonym of 'Amiable':", options: ["Friendly","Warm","Hostile","Pleasant"], answer: 2 },
    { q: "Fill in: Despite challenges, team showed great _____ in completing the project.", options: ["Lethargy","Resilience","Negligence","Confusion"], answer: 1 },
    { q: "Idiom 'Bite the bullet' means:", options: ["Eat quickly","Endure pain bravely","Shoot a gun","Avoid responsibility"], answer: 1 },
    { q: "Correction: 'He is one of the best employee in the company.'", options: ["best employees","best employed","better employees","better employee"], answer: 0 },
    { q: "Synonym of 'Candid':", options: ["Dishonest","Frank","Secretive","Vague"], answer: 1 },
    { q: "Antonym of 'Frugal':", options: ["Thrifty","Economical","Extravagant","Careful"], answer: 2 },
    { q: "Passive: 'The chef prepared the meal.'", options: ["The meal was prepared by the chef.","The meal is prepared by the chef.","The meal were prepared by the chef.","The meal has prepared by the chef."], answer: 0 },
    { q: "Idiom 'Break the ice' means:", options: ["Destroy something","Create awkwardness","Initiate conversation to ease tension","Win a competition"], answer: 2 },
    { q: "Fill in: The policy was _____ by the board unanimously.", options: ["rejected","ratified","questioned","postponed"], answer: 1 },
    { q: "Synonym of 'Entrepreneur':", options: ["Employee","Businessman","Lawyer","Accountant"], answer: 1 },
    { q: "Fill in: The hotel prides itself on _____ service standards.", options: ["Mediocre","Impeccable","Ordinary","Average"], answer: 1 },
    { q: "Word meaning 'generous and friendly welcome':", options: ["Hostility","Hospitality","Frugality","Formality"], answer: 1 },
    { q: "Analogy — Knife : Sharp :: Pillow : __?", options: ["Hard","Rough","Soft","Flat"], answer: 2 },
    { q: "Fill in: Supervisors must _____ clear instructions to their team.", options: ["withhold","communicate","ignore","confuse"], answer: 1 },
  ],

  company: [
    { q: "In which year was The Oberoi Group founded?", options: ["1930","1932","1934","1938"], answer: 2 },
    { q: "Where was Rai Bahadur M.S. Oberoi born?", options: ["Delhi","Shimla","Undivided Punjab (now Pakistan)","Lahore"], answer: 2 },
    { q: "First hotel acquired by Mr. M.S. Oberoi?", options: ["Grand Hotel Calcutta","Cecil Hotel Shimla","Clarkes Hotel Shimla","Maidens Hotel Delhi"], answer: 2 },
    { q: "Title conferred on Mr. M.S. Oberoi by British Government in 1943?", options: ["Padma Bhushan","Rai Bahadur","Padma Vibhushan","Padma Shri"], answer: 1 },
    { q: "The Oberoi Inter Continental, New Delhi opened in:", options: ["1960","1963","1965","1968"], answer: 2 },
    { q: "Flagship company of The Oberoi Group:", options: ["Oberoi Hotels Pvt Ltd","EIH Limited","EIH Associated Hotels","Trident Hotels Ltd"], answer: 1 },
    { q: "Indian government honour to Rai Bahadur M.S. Oberoi in 2001:", options: ["Padma Shri","Padma Vibhushan","Padma Bhushan","Bharat Ratna"], answer: 2 },
    { q: "Mr. P.R.S. Oberoi awarded the Padma Vibhushan in:", options: ["2005","2006","2007","2008"], answer: 3 },
    { q: "OCLD stands for:", options: ["Oberoi Centre for Leadership Dev","Oberoi Centre of Learning & Development","Oberoi College of Learning & Design","Oberoi Centre for Luxury Dev"], answer: 1 },
    { q: "Oberoi Group's two main brands:", options: ["Oberoi & Hilton","Oberoi & Marriott","Oberoi & Trident","Oberoi & Taj"], answer: 2 },
    { q: "Current MD & CEO of EIH Limited:", options: ["Arjun Oberoi","P.R.S. Oberoi","Vikram Oberoi","Mohit Nirula"], answer: 2 },
    { q: "Guests giving NPS rating 9 or 10 are called:", options: ["Passives","Detractors","Promoters","Advocates"], answer: 2 },
    { q: "OCLD was established in:", options: ["1960","1963","1966","1970"], answer: 2 },
    { q: "APEX stands for:", options: ["Achieving Performance Excellence","Advancing Premium Experience","Applied Professional Excellence","Assurance of Premium Experience"], answer: 0 },
    { q: "Oberoi Group's CSR children's education partner:", options: ["UNICEF","SOS Children's Villages","Save the Children","CRY"], answer: 1 },
    { q: "Property management system (PMS) at Oberoi:", options: ["SAP","Opera","Micros","Salesforce"], answer: 1 },
    { q: "Point-of-sale system in F&B outlets at Oberoi:", options: ["Opera","SAP","Micros / Symphony","Newgen"], answer: 2 },
    { q: "EIH Limited shares listed on BSE in:", options: ["1949","1952","1956","1960"], answer: 2 },
    { q: "Oberoi's first flight catering year in India:", options: ["1955","1957","1960","1965"], answer: 1 },
    { q: "EOBO referral incentive after 6 months:", options: ["₹5,000","₹6,000","₹7,500","₹10,000"], answer: 2 },
    { q: "Supervisory Development Programme (SDP) duration:", options: ["1 month","2 months","3 months","6 months"], answer: 2 },
    { q: "Executive Chairman of EIH Limited:", options: ["Vikram Oberoi","Arjun Oberoi","P.R.S. Oberoi","Mohit Nirula"], answer: 1 },
    { q: "Oberoi Beach Resort Bali opened in:", options: ["1975","1978","1980","1982"], answer: 1 },
    { q: "Mr. M.S. Oberoi's first job was as desk clerk at:", options: ["Clarkes Hotel","Grand Hotel","Cecil Hotel","Maidens Hotel"], answer: 2 },
    { q: "emPower allows employees to:", options: ["Apply for promotions","Arrange surprise items for guests up to a value","Request hotel transfers","Manage leave balance"], answer: 1 },
    { q: "2020 strategic alliance partner of Oberoi Hotels:", options: ["Four Seasons","Mandarin Oriental","Ritz Carlton","Aman Resorts"], answer: 1 },
    { q: "EIH Limited was incorporated in:", options: ["1944","1947","1949","1952"], answer: 2 },
    { q: "M.S. Oberoi acquired controlling interest in AHI in:", options: ["1938","1940","1943","1945"], answer: 2 },
    { q: "Company intranet where APEX can be accessed:", options: ["CONNECT","OPEN","PORTAL","HUB"], answer: 1 },
    { q: "The Oberoi, Mumbai reopened after renovation in:", options: ["2008","2009","2010","2011"], answer: 2 },
  ],

  awareness: [
    { q: "G20 is a group of:", options: ["20 richest countries","20 most populous nations","Major world economies","UN Security Council members"], answer: 2 },
    { q: "National flower of India:", options: ["Rose","Lotus","Jasmine","Marigold"], answer: 1 },
    { q: "United Nations headquarters:", options: ["London","Paris","New York","Geneva"], answer: 2 },
    { q: "'Land of the Rising Sun':", options: ["China","South Korea","Japan","Thailand"], answer: 2 },
    { q: "World's largest ocean:", options: ["Atlantic","Indian","Arctic","Pacific"], answer: 3 },
    { q: "Currency of the United Kingdom:", options: ["Euro","Dollar","Pound Sterling","Franc"], answer: 2 },
    { q: "'Discovery of India' author:", options: ["Mahatma Gandhi","Jawaharlal Nehru","Rabindranath Tagore","Subhas Chandra Bose"], answer: 1 },
    { q: "2024 Summer Olympics host city:", options: ["Tokyo","London","Paris","Los Angeles"], answer: 2 },
    { q: "Most abundant gas in Earth's atmosphere:", options: ["Oxygen","Carbon Dioxide","Nitrogen","Hydrogen"], answer: 2 },
    { q: "Country hosting the Davos World Economic Forum:", options: ["Germany","USA","Switzerland","France"], answer: 2 },
    { q: "Indian city known as 'City of Joy':", options: ["Mumbai","Chennai","Kolkata","Hyderabad"], answer: 2 },
    { q: "GST stands for:", options: ["General Sales Tax","Goods and Services Tax","Government Standard Tax","Gross Service Tax"], answer: 1 },
    { q: "CSR stands for:", options: ["Customer Service Representative","Corporate Social Responsibility","Central Sales Revenue","Customer Satisfaction Rating"], answer: 1 },
    { q: "Which river flows through Egypt?", options: ["Amazon","Congo","Nile","Ganges"], answer: 2 },
    { q: "Bali is in:", options: ["Malaysia","Philippines","Indonesia","Thailand"], answer: 2 },
  ],
};

// ── DEPARTMENT-SPECIFIC QUESTION POOLS ───────────────────────────────────────
const DEPT_Q = {
  frontoffice: {
    numerical: [
      { q: "RevPAR = Occupancy% × ADR. Occupancy 75%, ADR ₹8,000. RevPAR?", options: ["₹5,000","₹5,500","₹6,000","₹6,500"], answer: 2 },
      { q: "Room priced ₹10,000/night with 15% corporate discount. Guest pays?", options: ["₹8,000","₹8,200","₹8,500","₹9,000"], answer: 2 },
      { q: "Hotel: 300 rooms, 240 occupied. Occupancy rate?", options: ["70%","75%","80%","85%"], answer: 2 },
      { q: "Front desk: 180 calls in a 9-hour shift. Calls per hour?", options: ["15","18","20","25"], answer: 2 },
      { q: "60 rooms @ ₹5,000 + 40 rooms @ ₹8,000. Total room revenue?", options: ["₹5,80,000","₹6,00,000","₹6,20,000","₹6,40,000"], answer: 2 },
      { q: "Guest checks in Monday, checks out Thursday. Number of nights?", options: ["2","3","4","5"], answer: 1 },
      { q: "100 rooms, avg occupancy 70% for 30 days. Total room-nights sold?", options: ["1,800","2,000","2,100","2,400"], answer: 2 },
      { q: "Room rate ₹12,000 + 10% GST. Final bill?", options: ["₹12,200","₹12,800","₹13,200","₹13,500"], answer: 2 },
    ],
    awareness: [
      { q: "PMS in hotel stands for:", options: ["Property Management System","Pricing Model Software","Personnel Management System","Performance Metric System"], answer: 0 },
      { q: "A 'no-show' in hotel means:", options: ["Guest who cancelled","Guest with reservation who doesn't arrive","Overbooking situation","Late check-out"], answer: 1 },
      { q: "GDS stands for:", options: ["Global Distribution System","Guest Data System","General Desk Service","Guaranteed Deposit Scheme"], answer: 0 },
      { q: "ADR stands for:", options: ["Annual Daily Rate","Average Daily Revenue","Average Daily Rate","Actual Daily Rate"], answer: 2 },
      { q: "CRS in hotels stands for:", options: ["Customer Relations System","Central Reservation System","Complimentary Room Service","Checkout Rate System"], answer: 1 },
      { q: "Upselling at front desk means:", options: ["Offering a refund","Encouraging a higher-priced room or package","Checking guest out early","Upgrading staff"], answer: 1 },
      { q: "A 'walk-in' guest is:", options: ["A VIP guest","A guest transferred from another hotel","A guest who arrives without a reservation","A guest on long stay"], answer: 2 },
      { q: "Overbooking in hotels means:", options: ["Too few rooms","Accepting more reservations than available rooms","Double-charging guests","System overload"], answer: 1 },
    ],
    verbal: [
      { q: "Best greeting for a guest at the front desk:", options: ["What do you want?","Good evening — welcome! How may I assist you?","Yes?","Tell me your name."], answer: 1 },
      { q: "Fill in: A _____ manner is essential when dealing with guest complaints.", options: ["aggressive","passive","calm and professional","dismissive"], answer: 2 },
    ],
  },

  housekeeping: {
    numerical: [
      { q: "120 occupied rooms; housekeeper cleans 15 rooms/shift. Housekeepers needed?", options: ["6","7","8","9"], answer: 2 },
      { q: "Each room needs 3 towels. 80 rooms occupied. Total towels needed?", options: ["180","200","240","260"], answer: 2 },
      { q: "10 checkout rooms (30 min each) + 5 stay-overs (20 min each). Total time (hrs)?", options: ["5.5","6","6.67","7"], answer: 2 },
      { q: "Housekeeping supply cost: ₹250/room/month. 60 occupied rooms. Monthly cost?", options: ["₹12,000","₹13,500","₹15,000","₹18,000"], answer: 2 },
      { q: "24 rooms, 5 min inspection each. Total inspection time (hours)?", options: ["1.5","2","2.5","3"], answer: 1 },
      { q: "Housekeeper cleans 12 rooms in 4 hours. Rooms cleaned in 7 hours?", options: ["18","20","21","24"], answer: 2 },
      { q: "PAR level = 3 sets/room, hotel has 80 rooms. Total linen sets at full PAR?", options: ["160","200","240","280"], answer: 2 },
      { q: "50 kg linen/week received. Each set = 2.5 kg. Sets per week?", options: ["15","18","20","25"], answer: 2 },
    ],
    awareness: [
      { q: "DND stands for:", options: ["Do Not Disturb","Do Not Deliver","Department Night Duty","Daily Needs Done"], answer: 0 },
      { q: "'Turn-down service' in housekeeping refers to:", options: ["Early morning cleaning","Evening preparation of room for sleeping","Deep cleaning","Linen change only"], answer: 1 },
      { q: "PAR stock in housekeeping means:", options: ["Periodic Automatic Replenishment","Partial Annual Requirement","Permanent Asset Record","Purchase And Refill"], answer: 0 },
      { q: "MSDS stands for:", options: ["Material Safety Data Sheet","Monthly Supply Detail Sheet","Maximum Standard Duty Schedule","Maintenance Service Documentation System"], answer: 0 },
      { q: "'OOO room' in housekeeping means:", options: ["Over-occupied","Out Of Order — not available","Overbooked","On-going cleaning"], answer: 1 },
      { q: "Correct way to enter an occupied guest room:", options: ["Walk in directly","Knock, announce, wait, then enter","Use master key without warning","Call the guest first"], answer: 1 },
      { q: "Colour-coded cleaning cloths are used to prevent:", options: ["Waste","Cross-contamination","Extra spending","Colour confusion"], answer: 1 },
      { q: "'Departure room' in housekeeping is:", options: ["A newly renovated room","A room vacated by checked-out guest","A VIP room","A room for early arrivals"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: Housekeeping staff must maintain _____ standards in every guest room.", options: ["average","impeccable","minimal","basic"], answer: 1 },
      { q: "The word 'sanitation' most closely means:", options: ["Decoration","Cleanliness and hygiene","Security","Inventory management"], answer: 1 },
    ],
  },

  fnb: {
    numerical: [
      { q: "40 tables × 4 covers = 160 total. 75% occupied. Guests dining?", options: ["100","110","120","130"], answer: 2 },
      { q: "Food cost ₹40,000, revenue ₹1,60,000. Food cost %?", options: ["20%","22%","25%","28%"], answer: 2 },
      { q: "Avg check per cover ₹900 × 80 covers for dinner. Total revenue?", options: ["₹60,000","₹66,000","₹72,000","₹80,000"], answer: 2 },
      { q: "Banquet for 250 guests. Each needs 2 water glasses. Total glasses?", options: ["350","400","500","600"], answer: 2 },
      { q: "Server: 5 tables × 4 covers × ₹800/cover. Section revenue?", options: ["₹12,000","₹14,000","₹16,000","₹18,000"], answer: 2 },
      { q: "15% service charge on ₹4,000 bill. Charge amount?", options: ["₹400","₹500","₹600","₹700"], answer: 2 },
      { q: "Restaurant wastes 10% of ₹3,00,000 monthly purchase. Waste value?", options: ["₹20,000","₹25,000","₹30,000","₹35,000"], answer: 2 },
      { q: "Table turnover = 45 min. 4-hour dinner service. Max turns per table?", options: ["4","5","6","7"], answer: 1 },
    ],
    awareness: [
      { q: "'Mise en place' in F&B means:", options: ["Final menu","Everything in its place / advance preparation","A French dessert","A service style"], answer: 1 },
      { q: "FIFO in F&B stands for:", options: ["First In First Out","Food Inventory For Operations","Formal Invoice For Orders","Fixed Income For Outlets"], answer: 0 },
      { q: "'Sommelier' is a specialist in:", options: ["Pastry","Wine and beverages","Kitchen management","Guest relations"], answer: 1 },
      { q: "'À la carte' means:", options: ["Fixed price set menu","Ordering individual items at separate prices","Breakfast buffet","Chef's special"], answer: 1 },
      { q: "'Table d'hôte' means:", options: ["A fixed-price meal with set courses","Individual item ordering","Outdoor dining","Buffet service"], answer: 0 },
      { q: "A 'cover' in F&B refers to:", options: ["A table cover cloth","One guest / one place setting","The restaurant entrance","A menu cover"], answer: 1 },
      { q: "'Upselling' in F&B means:", options: ["Offering discounts","Suggesting premium items to increase average spend","Reducing menu options","Speeding up service"], answer: 1 },
      { q: "'Degustation menu' means:", options: ["A vegetarian menu","A children's menu","A tasting menu with multiple small courses","A seasonal menu"], answer: 2 },
    ],
    verbal: [
      { q: "'Cordial' service in F&B means:", options: ["Slow and careless","Warm and friendly","Formal and cold","Quick and rough"], answer: 1 },
      { q: "Fill in: F&B team must _____ guests' dietary requirements before serving.", options: ["ignore","clarify","assume","forget"], answer: 1 },
    ],
  },

  kitchen: {
    numerical: [
      { q: "Recipe serves 8, scale to 24. Original: 400g flour. New amount?", options: ["800g","1,000g","1,200g","1,600g"], answer: 2 },
      { q: "Food cost target = 30%. Dish costs ₹90 to make. Minimum selling price?", options: ["₹200","₹250","₹300","₹350"], answer: 2 },
      { q: "250g butter for 10 portions. Amount for 35 portions?", options: ["700g","800g","875g","900g"], answer: 2 },
      { q: "Chef uses 4 kg chicken/day. Weekly requirement?", options: ["20 kg","24 kg","28 kg","35 kg"], answer: 2 },
      { q: "Dish sells at ₹600. Food cost % = 35%. Food cost in ₹?", options: ["₹180","₹195","₹210","₹225"], answer: 2 },
      { q: "200 covers: 40% set menu @ ₹1,500 + 60% à la carte @ ₹2,000. Total revenue?", options: ["₹3,00,000","₹3,30,000","₹3,60,000","₹4,00,000"], answer: 2 },
      { q: "2 kg chicken yields 70% edible meat. Edible weight?", options: ["1,200g","1,300g","1,400g","1,600g"], answer: 2 },
      { q: "500ml stock for 4 portions. Amount for 18 portions?", options: ["1,800ml","2,000ml","2,250ml","2,500ml"], answer: 2 },
    ],
    awareness: [
      { q: "HACCP stands for:", options: ["Hazard Analysis Critical Control Points","Hygiene And Cleanliness Control Procedures","Hotel And Catering Compliance Policy","Hazardous Allergen Checklist Control Points"], answer: 0 },
      { q: "Food temperature danger zone (approx):", options: ["0°C to 100°C","0°C to 40°C","5°C to 63°C","10°C to 80°C"], answer: 2 },
      { q: "'Mise en place' in kitchen means:", options: ["Final plating","Everything prepared and in its place before service","A French sauce","A cooking technique"], answer: 1 },
      { q: "'Al dente' means pasta is cooked:", options: ["Very soft","Overcooked","Firm to the bite","Half-cooked"], answer: 2 },
      { q: "'Blanching' involves:", options: ["Deep-frying","Briefly boiling then cooling in ice water","Slow roasting","Steaming only"], answer: 1 },
      { q: "'Bain-marie' is used for:", options: ["Deep frying","Grilling","Gentle cooking or keeping food warm in hot water","Baking bread"], answer: 2 },
      { q: "Safe internal cooking temperature for chicken:", options: ["55°C","65°C","75°C","85°C"], answer: 2 },
      { q: "FIFO in kitchen means:", options: ["First In First Out — oldest stock used first","Food Is Fresh Often","Freezer Inventory For Operations","Fresh Items For Ordering"], answer: 0 },
    ],
    verbal: [
      { q: "The word 'culinary' refers to:", options: ["Hotel management","The art of cooking","Financial planning","Guest relations"], answer: 1 },
      { q: "Fill in: All kitchen staff must follow _____ procedures to ensure food safety.", options: ["casual","optional","hygiene","decorative"], answer: 2 },
    ],
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSections(deptId) {
  return SECTION_META.map(m => {
    const common = COMMON[m.id] || [];
    const deptExtra = DEPT_Q[deptId]?.[m.id] || [];
    const pool = [...common, ...deptExtra];
    return {
      ...m,
      questions: shuffle(pool).slice(0, m.count)
    };
  });
}

function getAttemptData(name) {
  try {
    const key = "oberoi_cat_" + name.toLowerCase().trim().replace(/\s+/g, "_");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { count: 0, history: [] };
  } catch {
    return { count: 0, history: [] };
  }
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
  sections.forEach((s, si) => {
    s.questions.forEach((q, qi) => {
      if (answers[si]?.[qi] === q.answer) score++;
    });
  });
  return score;
}

const G = {
  bg: "#06080c",
  card: "#0b0f17",
  accent: "#111723",
  border: "#1e2638",
  gold: "#c9a84c",
  goldLight: "#dfc475",
  text: "#d1d7e0",
  muted: "#7e8a9f",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:${G.bg}; color:${G.text}; font-family:'DM Sans',sans-serif; }
  ::-webkit-scrollbar { width:4px }
  ::-webkit-scrollbar-thumb { background:${G.gold}; border-radius:4px }
  .serif { font-family:'Playfair Display',serif }
  .btn-gold { background:linear-gradient(135deg,${G.gold},${G.goldLight}); color:#0a0d14; font-weight:600; border:none; cursor:pointer; padding:13px 32px; border-radius:2px; font-size:14px; letter-spacing:.4px; transition:all .2s; font-family:'DM Sans',sans-serif }
  .btn-gold:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 24px rgba(201,168,76,.3) }
  .btn-gold:disabled { opacity:.35; cursor:not-allowed; transform:none }
  .btn-outline { background:transparent; color:${G.gold}; border:1px solid ${G.gold}; padding:10px 22px; border-radius:2px; cursor:pointer; font-size:13px; transition:all .2s; font-family:'DM Sans',sans-serif }
  .btn-outline:hover { background:${G.gold}; color:#0a0d14 }
  .card { background:${G.card}; border:1px solid ${G.border}; border-radius:4px }
  .opt-btn { width:100%; text-align:left; padding:13px 16px; background:${G.accent}; border:1px solid ${G.border}; color:${G.text}; cursor:pointer; border-radius:3px; font-size:14px; transition:all .15s; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:12px }
  .opt-btn:hover { border-color:${G.gold}; background:#1d2f50 }
  .opt-btn.sel { border-color:${G.gold}; background:#1d2f50 }
  .olbl { width:26px; height:26px; border-radius:50%; border:1px solid ${G.muted}; display:flex; align-items:center; justify-content:center; font-size:12px; color:${G.muted}; flex-shrink:0; font-weight:600 }
  .opt-btn.sel .olbl { border-color:${G.gold}; color:${G.gold}; background:rgba(201,168,76,.1) }
  .div { height:1px; background:${G.border}; margin:18px 0 }
  @keyframes fi { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .fi { animation:fi .4s cubic-bezier(0.16,1,0.3,1) both }
  input, select { width:100%; padding:12px 14px; background:${G.accent}; border:1px solid ${G.border}; color:${G.text}; font-size:14px; border-radius:2px; transition:all .2s; outline:none; font-family:'DM Sans',sans-serif }
  input:focus, select:focus { border-color:${G.gold} }
  .sbtn { background:${G.accent}; border:1px solid ${G.border}; color:${G.muted}; padding:6px 12px; font-size:11px; border-radius:2px; cursor:pointer; transition:all .15s }
  .sbtn.act { background:rgba(201,168,76,.08); border-color:${G.gold}; color:${G.gold} }
  .sbtn.dn { border-color:rgba(201,168,76,.3); color:${G.text} }
  .pbar { background:${G.accent}; height:3px; border-radius:2px; overflow:hidden }
  .pfill { background:${G.gold}; height:100%; transition:width .3s ease }
  .adot { width:8px; height:8px; border-radius:50% }
  .dept-badge { background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.2); color:${G.gold}; font-size:10px; padding:2px 8px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; border-radius:10px }
  .tmr { transition:color .3s }
  .tmr.warn { color:#e85c4c !important }
  .tmr.dng { color:#e85c4c !important; animation: blink 1s infinite }
  @keyframes blink { 50% { opacity: 0.5 } }
  .drawing-container { margin: 16px 0; width: 100%; display: flex; justify-content: flex-start; }
`;

export default function AssessmentSystem() {
  const [phase, setPhase] = useState("auth"); // auth, test, results
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [err, setErr] = useState("");

  const [sections, setSections] = useState([]);
  const [si, setSi] = useState(0);
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

  const timerRef = useRef(null);

  const attemptInfo = name.trim() ? getAttemptData(name) : null;
  const attemptsUsed = attemptInfo ? attemptInfo.count : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

  useEffect(() => {
    if (phase === "test" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            clearInterval(timerRef.current);
            autoSubmit();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timeLeft]);

  const handleNameChange = (val) => {
    setName(val);
    setErr("");
  };

  const handleStart = () => {
    if (!name.trim()) return setErr("Please state your full designation identity.");
    if (!dept) return setErr("Please specify your targeted operational track.");
    
    const info = getAttemptData(name);
    if (info.count >= MAX_ATTEMPTS) {
      return setErr("Maximum allowed portal authentications (3/3) have been reached for this profile.");
    }

    const built = buildSections(dept);
    const answersMatrix = built.map(s => Array(s.questions.length).fill(null));

    setSections(built);
    setAns(answersMatrix);
    setSi(0);
    setQi(0);
    setTimeLeft(EXAM_DURATION);
    setPhase("test");
  };

  const autoSubmit = () => {
    handleCompleteSubmit(true);
  };

  const submit = () => {
    handleCompleteSubmit(false);
  };

  const handleCompleteSubmit = async (wasAuto) => {
    clearInterval(timerRef.current);
    
    const totalScore = calcScore(sections, ans);
    const isPassed = totalScore >= PASS_MARK;
    saveAttempt(name, totalScore, isPassed);

    setPhase("results");

    const sectionBreakdown = sections.map((sec, idx) => {
      const correct = sec.questions.filter((q, qidx) => ans[idx]?.[qidx] === q.answer).length;
      return `• ${sec.name}: ${correct} / ${sec.questions.length}`;
    }).join("\n");

    const percentage = Math.round((totalScore / TOTAL_QUESTIONS_CALC) * 100);
    const ts = new Date().toLocaleString("en-IN");

    const emailPayload = {
      Candidate_Name: name,
      Final_Score: `${totalScore} / ${TOTAL_QUESTIONS_CALC} (${percentage}%)`,
      Status: isPassed ? "PASSED ✅" : "FAILED ❌",
      Submitted_At: ts,
      Submission_Mode: wasAuto ? "AUTOMATIC (TIMEOUT) ⏳" : "MANUAL USER SUBMISSION 📑",
      Section_Performance: "\n" + sectionBreakdown
    };

    try {
      await fetch("https://formspree.io/f/mgobvpee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
    } catch (e) {
      console.error("Transmission error:", e);
    }
  };

  const Logo = () => (
    <div style={{ textAlign:"center", marginBottom:8 }}>
      <div className="serif" style={{ fontSize:22, color:G.gold, letterSpacing:2, fontWeight:700 }}>THE OBEROI GROUP</div>
      <div style={{ fontSize:9, color:G.muted, letterSpacing:3, marginTop:2, textTransform:"uppercase" }}>Talent Assessment Portal</div>
    </div>
  );

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (phase === "auth") {
    const deptLabel = DEPARTMENTS.find(d => d.id === dept)?.label || "";
    return (
      <>
        <style>{css}</style>
        <div className="fi" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div className="card" style={{ maxWidth:420, width:"100%", padding:32 }}>
            <Logo />
            <div className="div" />
            
            <div style={{ background:G.accent, border:`1px solid ${G.border}`, padding:14, borderRadius:2, marginBottom:18 }}>
              {[
                ["Total Duration", `${EXAM_DURATION / 60} Minutes`],
                ["Total Items", `${TOTAL_QUESTIONS_CALC} Tasks`],
                ["Pass Mark", `${PASS_MARK} Correct`]
              ].map(([k,v], i)=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginTop:i?5:0 }}>
                  <span style={{ color:G.muted }}>{k}</span>
                  <span style={{ color:k==="Pass Mark"?G.gold:G.text, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize:11, color:G.muted, lineHeight:1.7, marginBottom:18 }}>
              • Questions are randomized and department-relevant — each attempt differs.<br/>
              • Navigate freely across all sections. Auto-submits when time runs out.
            </div>

            <label style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e => handleNameChange(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleStart()}
            />

            {attemptInfo && name.trim() && (
              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:G.muted }}>Attempts used:</span>
                {Array.from({ length:MAX_ATTEMPTS }).map((_,i)=>(
                  <div key={i} className="adot" style={{ background:i<attemptsUsed?"#e85c4c":G.border }} />
                ))}
                <span style={{ fontSize:11, color:attemptsLeft===0?"#e85c4c":G.gold }}>
                  {attemptsLeft === 0 ? "No attempts left" : `${attemptsLeft} remaining`}
                </span>
              </div>
            )}

            <label style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6, marginTop:14 }}>Department</label>
            <select value={dept} onChange={e => { setDept(e.target.value); setErr(""); }}>
              <option value="">-- Select your department --</option>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>

            {dept && (
              <div style={{ marginTop:8, fontSize:12, color:G.muted }}>
                ✦ Questions will include <span style={{ color:G.gold }}>{deptLabel}</span>-specific scenarios.
              </div>
            )}

            {err && (
              <div style={{ color:"#e85c4c", fontSize:12, marginTop:12, textAlign:"center", fontWeight:500 }}>
                ⚠️ {err}
              </div>
            )}

            <button className="btn-gold" style={{ width:"100%", marginTop:20 }} onClick={handleStart} disabled={attemptsLeft===0}>
              Begin Evaluation
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase === "test") {
    const sec = sections[si];
    const q = sec.questions[qi];
    const selectedOption = ans[si]?.[qi];

    const totalAns = ans.reduce((sum, row) => sum + row.filter(x => x !== null).length, 0);
    const tc = timeLeft < 120 ? "tmr dng" : timeLeft < 600 ? "tmr warn" : "tmr";
    const absQ = sections.slice(0, si).reduce((t, x) => t + x.questions.length, 0) + qi;

    function pick(oi) {
      const a = ans.map(r => [...r]);
      a[si][qi] = oi;
      setAns(a);
    }

    function next() {
      if (qi < sec.questions.length - 1) setQi(qi + 1);
      else if (si < sections.length - 1) { setSi(si + 1); setQi(0); }
    }

    function prev() {
      if (qi > 0) setQi(qi - 1);
      else if (si > 0) { setSi(si - 1); setQi(sections[si - 1].questions.length - 1); }
    }

    const deptLabel = DEPARTMENTS.find(d => d.id === dept)?.label || "";

    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:"100vh", background:G.bg, display:"flex", flexDirection:"column" }}>
          {/* Header */}
          <div style={{ background:G.card, borderBottom:`1px solid ${G.border}`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, position:"sticky", top:0, zIndex:100 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <div className="serif" style={{ fontSize:14, color:G.text }}>{name}</div>
                <div className="dept-badge">{deptLabel}</div>
              </div>
              <div style={{ fontSize:11, color:G.muted }}>Q {absQ + 1}/{TOTAL_QUESTIONS_CALC} · {totalAns} answered</div>
            </div>
            
            <div style={{ textAlign:"center" }}>
              <div className={tc} style={{ fontSize:26, fontWeight:700, letterSpacing:2, color:timeLeft<300?"#e85c4c":G.gold }}>{fmtTime(timeLeft)}</div>
              <div style={{ fontSize:10, color:G.muted, letterSpacing:1 }}>REMAINING</div>
            </div>

            <button className="btn-gold" style={{ padding:"9px 22px", fontSize:13 }} onClick={() => window.confirm("Submit exam? This will lock your final responses.") && submit()}>
              Submit Exam
            </button>
          </div>

          <div style={{ padding:"5px 20px", background:G.card, borderBottom:`1px solid ${G.border}` }}>
            <div className="pbar"><div className="pfill" style={{ width:`${(totalAns/TOTAL_QUESTIONS_CALC)*100}%` }} /></div>
          </div>

          <div style={{ flex:1, display:"flex", flexWrap:"wrap" }}>
            {/* Left Question Body */}
            <div style={{ flex:"1 1 500px", padding:32, borderRight:`1px solid ${G.border}` }}>
              <div className="card fi" key={`${si}-${qi}`} style={{ padding:28 }}>
                <span style={{ fontSize:10, color:G.gold, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>{sec.name}</span>
                <p style={{ fontSize:16, marginTop:8, color:G.text, lineHeight:1.6, fontWeight:400 }}>{q.q}</p>

                {/* ── SEAMLESS VECTOR DRAWING SUPPORT ── */}
                {q.draw && (
                  <div className="drawing-container">
                    {q.draw()}
                  </div>
                )}

                <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
                  {q.options.map((opt, oi) => {
                    const isSel = selectedOption === oi;
                    return (
                      <button key={oi} className={`opt-btn ${isSel?'sel':''}`} onClick={() => pick(oi)}>
                        <div className="olbl">{String.fromCharCode(65+oi)}</div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
                <button className="btn-outline" onClick={prev} disabled={si===0 && qi===0}>Previous</button>
                <button className="btn-gold" style={{ padding:"10px 28px" }} onClick={next} disabled={si===sections.length-1 && qi===sec.questions.length-1}>Next</button>
              </div>
            </div>

            {/* Right Map Navigation */}
            <div style={{ width:280, padding:24, background:`linear-gradient(to bottom, ${G.card}, ${G.bg})` }}>
              <div style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>Section Outline Map</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {sections.map((s, sidx) => {
                  const itemsDone = ans[sidx]?.filter(x => x !== null).length || 0;
                  const totalItems = s.questions.length;
                  const isSectionActive = sidx === si;

                  return (
                    <div key={s.id} style={{ background:isSectionActive?"rgba(201,168,76,0.03)":"transparent", padding:isSectionActive?10:0, borderRadius:4, border:isSectionActive?`1px solid ${G.border}`:"1px solid transparent" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:isSectionActive?G.gold:G.text }}>{s.name}</span>
                        <span style={{ fontSize:10, color:G.muted }}>{itemsDone}/{totalItems}</span>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {s.questions.map((_, qidx) => {
                          const isDone = ans[sidx]?.[qidx] !== null;
                          const isCurrent = sidx === si && qidx === qi;
                          let cl = "sbtn";
                          if (isCurrent) cl += " act";
                          else if (isDone) cl += " dn";

                          return (
                            <button key={qidx} className={cl} style={{ width:28, height:26, padding:0 }} onClick={() => { setSi(sidx); setQi(qidx); }}>
                              {qidx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="div" />
              <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:11, color:G.muted }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:12, height:12, background:"rgba(201,168,76,0.08)", border:`1px solid ${G.gold}`, borderRadius:2 }} /><span>Current Item Position</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:12, height:12, background:G.accent, border:`1px solid ${G.gold}`, borderRadius:2 }} /><span>Answered Frame</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:12, height:12, background:G.accent, border:`1px solid ${G.border}`, borderRadius:2 }} /><span>Not answered</span></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "results") {
    const totalScore = calcScore(sections, ans);
    const passed = totalScore >= PASS_MARK;
    const pct = Math.round((totalScore / TOTAL_QUESTIONS_CALC) * 100);
    const attLeft = Math.max(0, MAX_ATTEMPTS - (attemptInfo ? attemptInfo.count : 0));
    const deptLabel = DEPARTMENTS.find(d => d.id === dept)?.label || "";

    return (
      <>
        <style>{css}</style>
        <div className="fi" style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 80% 20%,#0d1a2e 0%,${G.bg} 60%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ maxWidth:520, width:"100%" }}>
            <Logo />
            <div style={{ textAlign:"center", marginTop:24 }}>
              <div style={{ fontSize:10, letterSpacing:4, color:G.muted, textTransform:"uppercase", marginBottom:10 }}>Examination Complete</div>
              <div style={{ marginBottom:8 }}>
                {passed ? (
                  <span style={{ color:"#52c41a", background:"rgba(82,196,26,0.1)", border:"1px solid rgba(82,196,26,0.2)", padding:"4px 12px", fontSize:11, fontWeight:600, letterSpacing:1, borderRadius:2 }}>SUFFICIENT SCORE VALIDATED</span>
                ) : (
                  <span style={{ color:"#e85c4c", background:"rgba(232,92,76,0.1)", border:"1px solid rgba(232,92,76,0.2)", padding:"4px 12px", fontSize:11, fontWeight:600, letterSpacing:1, borderRadius:2 }}>CRITERIA MARGIN NOT MET</span>
                )}
              </div>
            </div>

            <div className="card" style={{ padding:32, marginTop:20, textAlign:"center" }}>
              <div style={{ fontSize:13, color:G.muted }}>Logged Response Candidate</div>
              <div className="serif" style={{ fontSize:22, color:G.text, marginTop:4, fontWeight:600 }}>{name}</div>
              <div style={{ display:"inline-block", marginTop:6 }} className="dept-badge">{deptLabel}</div>
              
              <div className="div" />
              
              <div style={{ display:"flex", justifyContent:"center", gap:40, margin:"10px 0" }}>
                <div>
                  <div style={{ fontSize:36, fontWeight:700, color:passed?G.gold:"#e85c4c" }}>{totalScore}</div>
                  <div style={{ fontSize:10, color:G.muted, letterSpacing:1, marginTop:2 }}>TOTAL SCORE</div>
                </div>
                <div>
                  <div style={{ fontSize:36, fontWeight:700, color:G.text }}>{pct}%</div>
                  <div style={{ fontSize:10, color:G.muted, letterSpacing:1, marginTop:2 }}>PERCENTAGE</div>
                </div>
              </div>

              <div className="div" />

              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>Modular Performance Summary</div>
                {sections.map((s, si) => {
                  const correct = s.questions.filter((q, qi) => ans[si]?.[qi] === q.answer).length;
                  const ratio = (correct / s.questions.length) * 100;
                  return (
                    <div key={s.id} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                        <span style={{ color:G.text }}>{s.name}</span>
                        <span style={{ color:G.muted, fontWeight:600 }}>{correct} / {s.questions.length}</span>
                      </div>
                      <div style={{ background:G.accent, height:2, borderRadius:1, overflow:"hidden" }}>
                        <div style={{ background:ratio>=50?G.gold:"#e85c4c", width:`${ratio}%`, height:"100%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:G.muted, lineHeight:1.6 }}>
              Your full grading breakdown metric has been cleanly dispatched to the review desk via fallback tracking relays.<br/>
              {attLeft > 0 ? (
                <span>You have <strong style={{ color:G.gold }}>{attLeft}</strong> profile authentications left in your reservation queue.</span>
              ) : (
                <span style={{ color:"#e85c4c" }}>All allotted attempts for this specific evaluation sequence are now exhausted.</span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
