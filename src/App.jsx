import { useState, useRef, useCallback, useEffect } from "react";
 
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwkblh0vj6_I66dAzORjF6CS1kn53b8JQcmsnsH5adF9dR9B-_z8tz9yb-KNLKBHgFD/exec";
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
  { id: "spa_recreation", label: "Spa & Recreation" }, // Fixed ID string typo
];
 
const SECTION_META = [
  { id: "abstract",   name: "Abstract Reasoning",  time: 16, count: 11 },
  { id: "numerical",  name: "Numerical Reasoning",  time: 22, count: 11 },
  { id: "verbal",     name: "Verbal Reasoning",      time: 22, count: 12 },
  { id: "company",    name: "Company Knowledge",     time: 13, count: 13 },
  { id: "awareness",  name: "General Awareness",     time: 13, count: 13 },
];
 
const TOTAL_QUESTIONS = SECTION_META.reduce((s, m) => s + m.count, 0);
 
// ── COMMON QUESTION POOLS (all departments) ───────────────────────────────────
const COMMON = {
  abstract: [
    { q: "Series: 2, 4, 8, 16, __?", options: ["24","32","30","36"], answer: 1 },
    { q: "Series: 1, 4, 9, 16, 25, __?", options: ["30","35","36","49"], answer: 2 },
    { q: "Series: 100, 96, 89, 79, 66, __?", options: ["50","53","49","55"], answer: 0 },
    { q: "Fibonacci — 1, 1, 2, 3, 5, 8, 13, __?", options: ["18","20","21","26"], answer: 2 },
    { q: "Series: 2, 6, 12, 20, 30, __?", options: ["40","42","44","48"], answer: 1 },
    { q: "Series: 3, 6, 11, 18, 27, __? (differences +2)", options: ["36","38","40","42"], answer: 1 },
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
    { q: "Analogy — 3 : 27 :: 4 : __? (cubes)", options: ["48","64","16","32"], answer: 1 },
    { q: "Analogy — 4 : 64 :: 5 : __? (cubes)", options: ["100","115","125","135"], answer: 2 },
    { q: "Analogy — Doctor : Hospital :: Teacher : __?", options: ["Office","School","Library","Class"], answer: 1 },
    { q: "Analogy — Painter : Brush :: Writer : __?", options: ["Paper","Pen","Ink","Book"], answer: 1 },
    { q: "Analogy — Bird : Nest :: Human : __?", options: ["Office","Car","House","Garden"], answer: 2 },
    { q: "Odd one out: 144, 169, 196, 225, 250", options: ["144","196","225","250"], answer: 3 },
    { q: "Odd one out: 121, 144, 169, 196, 200", options: ["121","169","196","200"], answer: 3 },
    { q: "Odd one out (3-D): Square, Circle, Triangle, Cube, Rectangle", options: ["Circle","Triangle","Cube","Rectangle"], answer: 2 },
    { q: "Odd one out: Cricket, Football, Chess, Hockey, Tennis", options: ["Cricket","Football","Chess","Hockey"], answer: 2 },
    { q: "Odd one out (not prime): 3, 5, 7, 9, 11", options: ["3","5","9","11"], answer: 2 },
    { q: "Odd one out: Rose, Lotus, Jasmine, Mango, Marigold", options: ["Rose","Lotus","Mango","Marigold"], answer: 2 },
    { q: "Coding: MANGO → NBOHP (+1 each). APPLE = ?", options: ["BQQMF","BPQMF","BQQNF","BQQLF"], answer: 0 },
    { q: "If RED = 27 (R+E+D=18+5+4), what is BLUE (B+L+U+E)?", options: ["36","38","40","42"], answer: 2 },
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
 
  finance: {
    numerical: [
      { q: "Monthly revenue ₹50L, expenses ₹35L. Net profit margin?", options: ["20%","25%","30%","35%"], answer: 2 },
      { q: "Budgeted ₹2,00,000, Actual ₹2,30,000. Variance %?", options: ["10%","12%","15%","18%"], answer: 2 },
      { q: "GST at 18% on ₹50,000 invoice. GST amount?", options: ["₹6,000","₹7,500","₹9,000","₹10,000"], answer: 2 },
      { q: "Equipment ₹5,00,000 depreciated over 5 yrs (straight line). Annual depreciation?", options: ["₹80,000","₹90,000","₹1,00,000","₹1,20,000"], answer: 2 },
      { q: "Revenue ₹10L, COGS ₹6L. Gross profit %?", options: ["30%","35%","40%","45%"], answer: 2 },
      { q: "TDS 10% on professional service ₹80,000. Net payment after TDS?", options: ["₹68,000","₹70,000","₹72,000","₹75,000"], answer: 2 },
      { q: "Loan ₹10L at 12% p.a. Annual interest?", options: ["₹1,00,000","₹1,10,000","₹1,20,000","₹1,30,000"], answer: 2 },
      { q: "Occupancy revenue ₹40L + F&B revenue ₹20L. Total revenue variance if budget was ₹55L?", options: ["5%","7.5%","9.1%財","11.1%"], answer: 3 },
    ],
    awareness: [
      { q: "P&L Statement stands for:", options: ["Productivity & Labor","Profit and Loss","Performance & Liability","Pricing & Licensing"], answer: 1 },
      { q: "CAPEX stands for:", options: ["Capital Expenditure","Cash Allocation Plan","Cost Analysis Program","Corporate Asset Portfolio"], answer: 0 },
      { q: "OPEX stands for:", options: ["Operational Expenditure","Opportunity Cost Index","Overhead Price Estimate","Optimal Product Exchange"], answer: 0 },
      { q: "ROI stands for:", options: ["Rate of Inflation","Return on Investment","Revenue Option Index","Risk Optimization Insurance"], answer: 1 },
      { q: "Auditing in finance means:", options: ["Increasing prices","Official inspection of an organization's accounts","Hiring staff","Creating advertisements"], answer: 1 },
      { q: "Break-even point is where:", options: ["Profits are maximized","Total revenue equals total costs","Losses are greatest","Expenses are zero"], answer: 1 },
      { q: "Working Capital is calculated as:", options: ["Current Assets + Current Liabilities","Current Assets − Current Liabilities","Fixed Assets − Depreciation","Total Revenue − Gross Profit"], answer: 1 },
      { q: "TDS stands for:", options: ["Total Tax Standard","Tax Deducted at Source","Tax Delivery System","Tariff Duty Scheme"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: Financial records must be kept strictly _____ and accurate.", options: ["casual","confidential","public","flexible"], answer: 1 },
      { q: "The term 'liquidity' refers to:", options: ["Company debt","Ability to convert assets into cash quickly","F&B beverage storage","Stock market valuation"], answer: 1 },
    ],
  },
 
  engineering: {
    numerical: [
      { q: "Generator runs 4 hrs on 20L fuel. Fuel consumed in 7 hours?", options: ["30L","32L","35L","40L"], answer: 2 },
      { q: "Power bill ₹80,000 drops by 15% after LED switch. Savings in ₹?", options: ["₹10,000","₹11,000","₹12,000","₹15,000"], answer: 2 },
      { q: "AC maintenance: 45 mins/unit. Time for 12 units (hours)?", options: ["7","8","9","10"], answer: 2 },
      { q: "Water flow: 50L/min. Time to fill 2,500L tank (minutes)?", options: ["40","45","50","60"], answer: 2 },
      { q: "Daily water consumption = 15,000L. Tank holds 60,000L. Reserves last for how many days?", options: ["2","3","4","5"], answer: 2 },
      { q: "3 pumps run 8 hours each daily. Total operational hours per week?", options: ["160","164","168","172"], answer: 2 },
      { q: "Boiler efficiency drops from 85% to 78%. What is the drop percentage?", options: ["5%","6%","7%","8%"], answer: 2 },
      { q: "100 light fixtures, 12% are defective. How many working lights?", options: ["84","86","88","90"], answer: 2 },
    ],
    awareness: [
      { q: "HVAC stands for:", options: ["High Voltage Alternating Current","Heating, Ventilation, and Air Conditioning","Hydro-Vacuum Air Circulation","Heavy Volume Appliance Control"], answer: 1 },
      { q: "BMS in hotel engineering stands for:", options: ["Boiler Maintenance System","Building Management System","Budget Management Software","Battery Monitoring Standard"], answer: 1 },
      { q: "Preventive maintenance means:", options: ["Fixing broken items","Routine inspection to prevent equipment failure","Replacing old assets entirely","Upgrading software"], answer: 1 },
      { q: "CFL stands for:", options: ["Compact Fluorescent Lamp","Central Fuel Line","Current Flow Limiter","Cool Fan Lever"], answer: 0 },
      { q: "STP in hotel utility stands for:", options: ["Standard Temperature Pressure","Sewage Treatment Plant","System Transfer Protocol","Safety Testing Procedure"], answer: 1 },
      { q: "LED stands for:", options: ["Light Emitting Diode","Luminescent Energy Device","Low Energy Distribution","Liquid Electron Unit"], answer: 0 },
      { q: "A multimeter is used to measure:", options: ["Water flow rate","Voltage, current, and resistance","Boiler pressure","Room humidity"], answer: 1 },
      { q: "Chiller plant in a hotel is primarily used for:", options: ["Kitchen freezing","Central air conditioning","Laundry drying","Swimming pool heating"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: Technical logs must be updated _____ to track equipment health.", options: ["monthly","randomly","diligently","rarely"], answer: 2 },
      { q: "The word 'redundancy' in engineering means:", options: ["Firing staff","Inclusion of backup components to ensure continuous operation","System error","Wasting power"], answer: 1 },
    ],
  },
 
  spa_recreation: { // Formatted matching ID
    numerical: [
      { q: "Massage priced ₹4,000 + 18% GST. Final bill?", options: ["₹4,500","₹4,600","₹4,720","₹4,800"], answer: 2 },
      { q: "Spa room takes 15 mins to reset. Time for 8 resets (hours)?", options: ["1.5","2","2.5","3"], answer: 1 },
      { q: "Therapist does 4 sessions of 60 mins and 2 sessions of 90 mins. Total hours worked?", options: ["5","6","7","8"], answer: 2 },
      { q: "Spa product usage: 30ml oil per guest. 500ml bottle lasts for how many full sessions?", options: ["14","15","16","18"], answer: 2 },
      { q: "Spa occupancy: 6 out of 10 rooms utilized over an 8-hour day. Occupancy rate?", options: ["50%","55%","60%","65%"], answer: 2 },
      { q: "Gym instructor trains 12 guests on Mon, 15 on Tue, 18 on Wed. Average daily trainees?", options: ["14","15","16","17"], answer: 1 },
      { q: "Spa package offers a 20% discount on a ₹6,000 facial. Package price?", options: ["₹4,500","₹4,600","₹4,800","₹5,000"], answer: 2 },
      { q: "Pool chlorine check: 4 tests a day. Total tests in November?", options: ["100","110","120","130"], answer: 2 },
    ],
    awareness: [
      { q: "Aroma therapy primarily uses:", options: ["Chemical pills","Essential oils derived from plants","Hot stones only","Acoustic sound waves"], answer: 1 },
      { q: "Detoxification refers to:", options: ["Weight gain","Removal of toxins from the body","Muscle training","Cardio exercises"], answer: 1 },
      { q: "Swedish massage is best known for:", options: ["Deep pressure on bone surfaces","Long, fluid stroking strokes to reduce tension","Acupuncture style needles","Using intense heat only"], answer: 1 },
      { q: "Reflexology is mapped primarily to which parts of the body?", options: ["Spine and lower back","Feet, hands, and ears","Shoulders and neck","Face only"], answer: 1 },
      { q: "Sauna room uses what type of environment?", options: ["Cold water immersion","Dry heat","Steam and humidity only","High altitude air simulation"], answer: 1 },
      { q: "Steam room environments differ from Saunas because they have:", options: ["Lower temperature settings","High humidity and moisture","No wood panels","Zero water utilization"], answer: 1 },
      { q: "Exfoliation in skincare means:", options: ["Applying sunscreen creams","Removing dead skin cells","Deep tissue tissue massaging","Skin tanning"], answer: 1 },
      { q: "Hydrotherapy utilizes which element for wellness?", options: ["Air currents","Water","Mud packs","Herbal tea infusions"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: A _____ environment must be preserved throughout the spa treatment zones.", options: ["vibrant","serene and peaceful","loud","busy"], answer: 1 },
      { q: "The term 'rejuvenation' most closely means:", options: ["Tiring out","Making young or energetic again","Closing down operations","Scheduling appointments"], answer: 1 },
    ],
  },
};
 
// CSS Styles
const css = `
  :root {
    --bg: #0f172a; --card: #1e293b; --border: #334155;
    --text: #f8fafc; --muted: #94a3b8; --accent: #3b82f6;
    --accent-hover: #2563eb; --success: #10b981; --danger: #ef4444;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
  body { background: var(--bg); color: var(--text); padding: 20px; display: flex; justify-content: center; }
  .container { max-width: 700px; width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); margin: 40px auto; }
  h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.5px; }
  p.subtitle { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
  .form-group { margin-bottom: 20px; }
  label { display: block; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  input, select { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; color: var(--text); font-size: 15px; transition: border 0.15s ease; }
  input:focus, select:focus { outline: none; border-color: var(--accent); }
  button { width: 100%; background: var(--accent); color: white; border: none; border-radius: 6px; padding: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s ease; display: flex; justify-content: center; align-items: center; gap: 8px; }
  button:hover { background: var(--accent-hover); }
  button:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
  .sec-card { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .sec-info h3 { font-size: 16px; font-weight: 600; }
  .sec-info p { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .badge { background: var(--border); color: var(--text); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
  .badge.locked { color: var(--muted); }
  .badge.active { background: rgba(59,130,246,0.15); color: var(--accent); border: 1px solid rgba(59,130,246,0.3); }
  .badge.done { background: rgba(16,185,129,0.15); color: var(--success); border: 1px solid rgba(16,185,129,0.3); }
  .q-text { font-size: 17px; font-weight: 500; margin-bottom: 18px; line-height: 1.4; }
  .opt-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .opt-btn { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; text-align: left; color: var(--text); font-size: 15px; cursor: pointer; transition: all 0.15s ease; }
  .opt-btn:hover { border-color: var(--muted); }
  .opt-btn.selected { background: rgba(59,130,246,0.1); border-color: var(--accent); color: var(--accent); font-weight: 500; }
  .nav-row { display: flex; justify-content: space-between; gap: 12px; }
  .progress-bar { width: 100%; height: 4px; background: var(--border); border-radius: 2px; margin-bottom: 24px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; }
  .score-big { font-size: 48px; font-weight: 700; text-align: center; margin: 24px 0 8px 0; color: var(--accent); }
  .status-text { text-align: center; font-size: 18px; font-weight: 600; margin-bottom: 24px; }
  .status-text.pass { color: var(--success); }
  .status-text.fail { color: var(--danger); }
  .breakdown-box { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .breakdown-row { display: flex; justify-content: space-between; font-size: 14px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .breakdown-row:last-child { border: none; padding-bottom: 0; }
  .breakdown-row:first-child { padding-top: 0; }
`;
 
export default function App() {
  const [phase, setPhase] = useState("landing"); // landing, setup, lobby, exam, results, admin
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("frontoffice");
  const [attempt, setAttempt] = useState(1);
  const [secAnswers, setSecAnswers] = useState({}); // { secIndex: { qIndex: optIndex } }
  const [currentSec, setCurrentSec] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [secTimeLeft, setSecTimeLeft] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState(null);
  const [savedAt, setSavedAt] = useState("");
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading interaction toggle state
 
  const timerRef = useRef(null);
 
  // Generate question pool dynamically for the user session
  const getQuestionsForSection = useCallback((secId) => {
    const meta = SECTION_META.find(m => m.id === secId);
    if (!meta) return [];
    const commonPool = COMMON[secId] || [];
    const deptPool = DEPT_Q[deptId]?.[secId] || [];
    const combined = [...commonPool, ...deptPool];
    
    // Deterministic selection based on candidate parameters
    const seed = name.length + deptId.charCodeAt(0) + (attempt * 7);
    const selected = [];
    const poolCopy = [...combined];
    
    for (let i = 0; i < meta.count; i++) {
      if (poolCopy.length === 0) break;
      const index = (seed + i * 13) % poolCopy.length;
      selected.push(poolCopy.splice(index, 1)[0]);
    }
    return selected;
  }, [deptId, name, attempt]);
 
  // Cache generated questions for current active exam session
  const [SECTIONS, setSECTIONS] = useState([]);
 
  const startExamFlow = () => {
    if (!name.trim()) return alert("Please enter candidate name.");
    const sectionsData = SECTION_META.map(meta => ({
      ...meta,
      questions: getQuestionsForSection(meta.id)
    }));
    setSECTIONS(sectionsData);
    setSecAnswers({});
    setCurrentSec(0);
    setCurrentQ(0);
    setSecTimeLeft(sectionsData[0].time * 60);
    setPhase("exam");
  };
 
  const calcScore = (answersObj) => {
    let score = 0;
    SECTIONS.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        if (answersObj[si]?.[qi] === q.answer) score++;
      });
    });
    return score;
  };
 
  // Handle moving sections or ending the assessment setup cleanly
  const advanceSection = useCallback((answersData) => {
    if (currentSec < SECTIONS.length - 1) {
      const next = currentSec + 1;
      setCurrentSec(next);
      setCurrentQ(0);
      setSecTimeLeft(SECTIONS[next].time * 60);
    } else {
      handleSubmit(answersData);
    }
  }, [currentSec, SECTIONS]);
 
  // Countdown execution hook
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setSecTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          advanceSection(secAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentSec, secAnswers, advanceSection]);
 
  async function handleSubmit(answers) {
    setIsSubmitting(true);
    const score = calcScore(answers);
    const ts = new Date().toLocaleString("en-IN");
    setSavedAt(ts);
    setFinalAnswers(answers);
 
    const sectionBreakdown = SECTIONS.map((sec, si) => {
      const correct = sec.questions.filter((q, qi) => answers[si]?.[qi] === q.answer).length;
      return `• ${sec.name}: ${correct} / ${sec.questions.length}`;
    }).join("\n");
 
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    const statusText = score >= PASS_MARK ? "PASSED ✅" : "FAILED ❌";
    const deptLabel = DEPARTMENTS.find(d => d.id === deptId)?.label || deptId;
 
    const emailPayload = {
      Candidate_Name: name,
      Department: deptLabel,
      Attempt_Number: attempt,
      Final_Score: `${score} / ${TOTAL_QUESTIONS} (${percentage}%)`,
      Status: statusText,
      Submitted_At: ts,
      Section_Performance: "\n" + sectionBreakdown
    };
 
    // Dispatch to pipeline integrations synchronously
    try {
      await Promise.all([
        fetch(SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, dept: deptId, attempt, score, max: TOTAL_QUESTIONS, pct: percentage, status: score >= PASS_MARK ? "PASS" : "FAIL" })
        }),
        fetch("https://formspree.io/f/mgobvpee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload)
        })
      ]);
    } catch (e) {
      console.error("Transmission logs error:", e);
    }
 
    setIsSubmitting(false);
    setPhase("results");
  }
 
  const deptLabel = DEPARTMENTS.find(d => d.id === deptId)?.label || "";
 
  return (
    <>
      <style>{css}</style>
      
      {phase === "landing" && (
        <div className="container" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>✨</div>
          <h1>Oberoi CAT Exam</h1>
          <p className="subtitle">Cognitive Assessment Test for Trainees & Interns</p>
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: 20, border: "1px solid var(--border)", textAlign: "left", marginBottom: 28, fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: 6 }}>Exam Instructions:</strong>
            • The test consists of 5 timed sections containing a total of {TOTAL_QUESTIONS} questions.<br/>
            • Each section has a hard time limit. Unsaved questions auto-submit when the timer hits zero.<br/>
            • Ensure you have a stable network connection before starting.
          </div>
          <button onClick={() => setPhase("setup")}>Configure Candidate Profile →</button>
        </div>
      )}
 
      {phase === "setup" && (
        <div className="container">
          <h1>Candidate Setup</h1>
          <p className="subtitle">Enter the assessment parameters below</p>
          
          <div className="form-group">
            <label>Candidate Full Name</label>
            <input type="text" placeholder="e.g. Manik Sharma" value={name} onChange={e => setName(e.target.value)} />
          </div>
 
          <div className="form-group">
            <label>Target Department</label>
            <select value={deptId} onChange={e => setDeptId(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
 
          <div className="form-group">
            <label>Attempt Number</label>
            <select value={attempt} onChange={e => setAttempt(Number(e.target.value))}>
              {[1, 2, 3].map(n => <option key={n} value={n}>Attempt {n} {n === MAX_ATTEMPTS ? "(Final Match)" : ""}</option>)}
            </select>
          </div>
 
          <div className="nav-row" style={{ marginTop: 28 }}>
            <button style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} onClick={() => setPhase("landing")}>Back</button>
            <button onClick={() => setPhase("lobby")}>Review Profile →</button>
          </div>
        </div>
      )}
 
      {phase === "lobby" && (
        <div className="container">
          <h1>Confirm Details</h1>
          <p className="subtitle">Verify the timeline structures before initializing token</p>
          
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyBetween: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}><span style={{ color: "var(--muted)" }}>Candidate Name:</span><strong>{name}</strong></div>
            <div style={{ display: "flex", justifyBetween: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}><span style={{ color: "var(--muted)" }}>Core Track:</span><strong>{deptLabel}</strong></div>
            <div style={{ display: "flex", justifyBetween: "space-between", paddingBottom: 4 }}><span style={{ color: "var(--muted)" }}>Execution Level:</span><strong>Attempt Allocation {attempt}</strong></div>
          </div>
 
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", marginBottom: 12 }}>Assessment Breakdown Map</h2>
          {SECTION_META.map((meta, idx) => (
            <div className="sec-card" key={meta.id}>
              <div className="sec-info">
                <h3>{meta.name}</h3>
                <p>{meta.count} Questions selected out of shared matrices</p>
              </div>
              <span className="badge">{meta.time} Mins</span>
            </div>
          ))}
 
          <div className="nav-row" style={{ marginTop: 28 }}>
            <button style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} onClick={() => setPhase("setup")}>Modify</button>
            <button style={{ background: "var(--success)" }} onClick={startExamFlow}>Begin Official Examination 🚀</button>
          </div>
        </div>
      )}
 
      {phase === "exam" && SECTIONS[currentSec] && (
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--accent)", fontWeight: 6 }}>{SECTIONS[currentSec].name}</span>
            <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 7, color: secTimeLeft < 60 ? "var(--danger)" : "var(--text)", background: "var(--bg)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)" }}>
              ⏳ {Math.floor(secTimeLeft / 60)}:{(secTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 5, marginBottom: 20, color: "var(--muted)" }}>Question {currentQ + 1} of {SECTIONS[currentSec].questions.length}</h2>
          
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQ + 1) / SECTIONS[currentSec].questions.length) * 100}%` }}></div>
          </div>
 
          {SECTIONS[currentSec].questions[currentQ] && (
            <>
              <div className="q-text">{SECTIONS[currentSec].questions[currentQ].q}</div>
              <div className="opt-grid">
                {SECTIONS[currentSec].questions[currentQ].options.map((opt, oIdx) => (
                  <button 
                    key={oIdx} 
                    className={`opt-btn ${secAnswers[currentSec]?.[currentQ] === oIdx ? "selected" : ""}`}
                    onClick={() => {
                      setSecAnswers(prev => ({
                        ...prev,
                        [currentSec]: { ...(prev[currentSec] || {}), [currentQ]: oIdx }
                      }));
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
 
          <div className="nav-row">
            <button 
              disabled={currentQ === 0} 
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} 
              onClick={() => setCurrentQ(prev => prev - 1)}
            >
              Previous Question
            </button>
            
            {currentQ < SECTIONS[currentSec].questions.length - 1 ? (
              <button onClick={() => setCurrentQ(prev => prev + 1)}>Next Question →</button>
            ) : currentSec < SECTIONS.length - 1 ? (
              <button style={{ background: "var(--accent)" }} onClick={() => advanceSection(secAnswers)}>Complete Section ➡️</button>
            ) : (
              <button style={{ background: "var(--success)" }} disabled={isSubmitting} onClick={() => advanceSection(secAnswers)}>
                {isSubmitting ? "Submitting Exam..." : "Submit Final Assessment 🏁"}
              </button>
            )
          }
          </div>
        </div>
      )}
 
      {phase === "results" && finalAnswers && (
        <div className="container">
          <h1>Assessment Completed</h1>
          <p className="subtitle">Your scores have been safely compiled and dispatched to the Cloud</p>
          
          <div className="score-big">{calcScore(finalAnswers)} / {TOTAL_QUESTIONS}</div>
          <div className={`status-text ${calcScore(finalAnswers) >= PASS_MARK ? "pass" : "fail"}`}>
            {calcScore(finalAnswers) >= PASS_MARK ? "PASSED ✅" : "FAILED ❌"}
          </div>
 
          <div className="breakdown-box">
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", marginBottom: 12 }}>Sectional Scoring Overview</h3>
            {SECTIONS.map((sec, si) => {
              const correct = sec.questions.filter((q, qi) => finalAnswers[si]?.[qi] === q.answer).length;
              return (
                <div className="breakdown-row" key={sec.id}>
                  <span>{sec.name}</span>
                  <strong>{correct} / {sec.questions.length}</strong>
                </div>
              );
            })}
          </div>
 
          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            Security Signature ID Reference: token_cat_{Date.now().toString(16)}<br/>
            Saved into operational matrix log at: {savedAt}
          </div>
        </div>
      )}
    </>
  );
}
