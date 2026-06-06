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
  { id: "Spa & Recreation",   label: "Spa & Recreation" },
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
    // Age problems
    { q: "A is twice B's age. 10 yrs ago A was 3× B's age. A's current age?", options: ["30","35","40","45"], answer: 2 },
    { q: "Ratio of ages P:Q = 3:5. After 6 yrs = 2:3. P's current age?", options: ["12","15","18","21"], answer: 2 },
    { q: "Father is 30 yrs older than son. In 5 yrs father = 3× son's age. Son's current age?", options: ["8","10","12","15"], answer: 1 },
    { q: "Average age of 5 employees = 28. New employee joins, average = 29. New employee's age?", options: ["30","32","34","36"], answer: 2 },
    { q: "Sum of ages of mother & daughter = 50. 5 yrs ago mother = 7× daughter's age. Daughter's age?", options: ["8","10","12","15"], answer: 2 },
    // General maths
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
      { q: "Loan ₹10L at 12% p.a. Annual interest?", options: ["₹1,00,000","₹1,10,000","₹1,20,000","₹1,40,000"], answer: 2 },
      { q: "Fixed cost ₹40,000/month, contribution per unit ₹40. Break-even quantity?", options: ["800","900","1,000","1,200"], answer: 2 },
    ],
    awareness: [
      { q: "P&L stands for:", options: ["Production & Labour","Profit and Loss","Purchase & Logistics","Planning & Logistics"], answer: 1 },
      { q: "EBITDA stands for:", options: ["Earnings Before Interest Tax Depreciation Amortisation","Estimated Budget Including Tax Depreciation Allowance","Earnings Balance Including Total Dues Allowance","Extended Budget Income Tax Depreciation Allowance"], answer: 0 },
      { q: "ROI stands for:", options: ["Rate of Interest","Return on Investment","Record of Income","Revenue on Invoice"], answer: 1 },
      { q: "'Working capital' is:", options: ["Total revenue","Fixed assets","Current assets minus current liabilities","Annual salary budget"], answer: 2 },
      { q: "A balance sheet shows:", options: ["Only profits","Only expenses","Assets, Liabilities and Equity","Revenue and costs only"], answer: 2 },
      { q: "'Accrual accounting' records transactions:", options: ["Only when cash is received","When earned or incurred, regardless of cash flow","At year-end only","When approved by management"], answer: 1 },
      { q: "'Depreciation' in accounting is:", options: ["Interest on a loan","Increase in asset value","Reduction in asset value over time","A type of tax"], answer: 2 },
      { q: "TDS stands for:", options: ["Tax Deducted at Source","Total Deposit Summary","Transaction Data Sheet","Tax Deposit Schedule"], answer: 0 },
    ],
    verbal: [
      { q: "An 'audit' in finance means:", options: ["A team meeting","Formal examination of accounts","A guest complaint","A staff appraisal"], answer: 1 },
      { q: "Fill in: The finance team ensures _____ and accuracy in all financial records.", options: ["ambiguity","transparency","confusion","delay"], answer: 1 },
    ],
  },
 
  engineering: {
    numerical: [
      { q: "200 rooms × 100W bulb × 10 hrs/day. Daily energy consumption (kWh)?", options: ["150","175","200","250"], answer: 2 },
      { q: "AC uses 2.5 kW × 12 hrs/day × 30 days × ₹8/kWh. Monthly cost?", options: ["₹5,400","₹6,400","₹7,200","₹8,000"], answer: 2 },
      { q: "3 workers complete maintenance in 8 hours. How long for 4 workers?", options: ["4","5","6","7"], answer: 2 },
      { q: "Pool: 20m × 8m × 2m deep. Volume in litres?", options: ["2,40,000","2,80,000","3,20,000","3,60,000"], answer: 2 },
      { q: "Load: 4 ACs (2 kW each) + 10 fans (80W each) + 20 lights (40W each). Total kW?", options: ["8.4","9.0","9.6","10.2"], answer: 2 },
      { q: "Monthly electricity bill ₹1,20,000 for 150 rooms. Cost per room/month?", options: ["₹600","₹700","₹800","₹900"], answer: 2 },
      { q: "Pipe A fills tank in 4 hrs, Pipe B empties in 6 hrs. Net fill time?", options: ["10 hrs","12 hrs","14 hrs","16 hrs"], answer: 1 },
      { q: "Generator 500 kVA at 0.8 power factor. Output in kW?", options: ["300","350","400","450"], answer: 2 },
    ],
    awareness: [
      { q: "PPM in maintenance stands for:", options: ["Planned Preventive Maintenance","Partial Performance Monitoring","Periodic Parts Management","Preventive Problem Measurement"], answer: 0 },
      { q: "HVAC stands for:", options: ["Hot and Ventilated Air Conditioning","Heating, Ventilation and Air Conditioning","High Voltage Air Control","Humidity, Ventilation and Air Cooling"], answer: 1 },
      { q: "BMS in engineering stands for:", options: ["Building Management System","Basic Mechanical Support","Budget Monitoring System","Building Maintenance Schedule"], answer: 0 },
      { q: "RCD stands for:", options: ["Residual Current Device (protects from electric shock)","Remote Control Dashboard","Routine Circuit Diagnostics","Rated Current Distribution"], answer: 0 },
      { q: "kWh is a unit of:", options: ["Electrical power","Electrical energy consumption","Voltage","Frequency"], answer: 1 },
      { q: "Preventive maintenance is done:", options: ["Only when equipment breaks down","Randomly","Regularly, to prevent failure before it occurs","Only once a year"], answer: 2 },
      { q: "SOP in engineering stands for:", options: ["Standard Operating Procedure","System Output Protocol","Scheduled Operations Plan","Safety Override Process"], answer: 0 },
      { q: "A 'snag list' in engineering refers to:", options: ["Spare parts list","A list of defects or pending tasks to be completed","Maintenance schedule","Staff duty roster"], answer: 1 },
    ],
    verbal: [
      { q: "The word 'retrofit' in engineering means:", options: ["Demolishing old equipment","Adding new components to existing/older systems","Renting equipment","Outsourcing maintenance"], answer: 1 },
      { q: "Fill in: Regular _____ maintenance prevents unexpected equipment breakdowns.", options: ["delayed","preventive","minimal","expensive"], answer: 1 },
    ],
  },
};
 
// ── HELPERS ───────────────────────────────────────────────────────────────────
const TOTAL_QUESTIONS_CALC = SECTION_META.reduce((s, m) => s + m.count, 0);
 
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
    return { ...m, questions: shuffle(pool).slice(0, m.count) };
  });
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
 
function fmtTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
 
// ── STYLES ────────────────────────────────────────────────────────────────────
const G = {
  bg: "#0a0d14", card: "#111620", border: "#1e2740",
  gold: "#c9a84c", goldLight: "#e8c97a", text: "#e8e4d9", muted: "#7a8099", accent: "#1a2a4a",
};
 
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};color:${G.text};font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${G.gold};border-radius:4px}
  .serif{font-family:'Playfair Display',serif}
  .btn-gold{background:linear-gradient(135deg,${G.gold},${G.goldLight});color:#0a0d14;font-weight:600;border:none;cursor:pointer;padding:13px 32px;border-radius:2px;font-size:14px;letter-spacing:.4px;transition:all .2s;font-family:'DM Sans',sans-serif}
  .btn-gold:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 6px 24px rgba(201,168,76,.3)}
  .btn-gold:disabled{opacity:.35;cursor:not-allowed;transform:none}
  .btn-outline{background:transparent;color:${G.gold};border:1px solid ${G.gold};padding:10px 22px;border-radius:2px;cursor:pointer;font-size:13px;transition:all .2s;font-family:'DM Sans',sans-serif}
  .btn-outline:hover{background:${G.gold};color:#0a0d14}
  .card{background:${G.card};border:1px solid ${G.border};border-radius:4px}
  .opt-btn{width:100%;text-align:left;padding:13px 16px;background:${G.accent};border:1px solid ${G.border};color:${G.text};cursor:pointer;border-radius:3px;font-size:14px;transition:all .15s;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:12px}
  .opt-btn:hover{border-color:${G.gold};background:#1d2f50}
  .opt-btn.sel{border-color:${G.gold};background:#1d2f50}
  .olbl{width:26px;height:26px;border-radius:50%;border:1px solid ${G.muted};display:flex;align-items:center;justify-content:center;font-size:12px;color:${G.muted};flex-shrink:0;font-weight:600}
  .opt-btn.sel .olbl{border-color:${G.gold};color:${G.gold};background:rgba(201,168,76,.1)}
  .div{height:1px;background:${G.border};margin:18px 0}
  @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fi{animation:fi .35s ease forwards}
  input[type=text],select{background:${G.accent};border:1px solid ${G.border};color:${G.text};padding:11px 14px;border-radius:3px;font-size:14px;width:100%;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  input[type=text]:focus,select:focus{border-color:${G.gold}}
  select option{background:${G.card}}
  .stab{padding:7px 14px;border-radius:2px;cursor:pointer;font-size:12px;border:1px solid transparent;transition:all .2s;color:${G.muted};white-space:nowrap}
  .stab.act{border-color:${G.gold};color:${G.gold};background:rgba(201,168,76,.08)}
  .stab.has{color:${G.text}}
  .qnav{width:32px;height:32px;border-radius:3px;border:1px solid ${G.border};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;color:${G.muted};transition:all .15s;background:${G.accent}}
  .qnav:hover{border-color:${G.gold};color:${G.gold}}
  .qnav.ans{background:rgba(201,168,76,.15);border-color:${G.gold};color:${G.gold}}
  .qnav.cur{background:${G.gold};color:#0a0d14;border-color:${G.gold};font-weight:700}
  .tmr{font-variant-numeric:tabular-nums}
  .tmr.warn{color:#e8a84c}
  .tmr.dng{color:#e85c4c;animation:pulse 1s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
  .pbar{height:3px;background:${G.border};border-radius:2px;overflow:hidden}
  .pfill{height:100%;background:linear-gradient(90deg,${G.gold},${G.goldLight});border-radius:2px;transition:width .3s}
  .scircle{width:144px;height:144px;border-radius:50%;border:3px solid ${G.gold};display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(201,168,76,.06)}
  .adot{width:10px;height:10px;border-radius:50%}
  .dept-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.3);color:${G.gold}}
`;
 
// ── LOGO ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ textAlign:"center", marginBottom:8 }}>
      <div style={{ fontSize:10, letterSpacing:6, color:G.gold, textTransform:"uppercase", marginBottom:4 }}>✦ The Oberoi Group ✦</div>
      <div className="serif" style={{ fontSize:22, color:G.text, fontWeight:700 }}>SDP Candidate Assessment</div>
    </div>
  );
}
 
// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [err, setErr] = useState("");
  const [attemptInfo, setAttemptInfo] = useState(null);
 
  function handleNameChange(n) {
    setName(n);
    if (n.trim()) setAttemptInfo(getAttemptData(n.trim()));
    else setAttemptInfo(null);
    setErr("");
  }
 
  function handleStart() {
    if (!name.trim()) { setErr("Please enter your full name."); return; }
    if (!dept) { setErr("Please select your department."); return; }
    const data = getAttemptData(name.trim());
    if (data.count >= MAX_ATTEMPTS) {
      setErr(`You have exhausted all ${MAX_ATTEMPTS} attempts. Please contact HR.`);
      return;
    }
    onStart(name.trim(), dept);
  }
 
  const attemptsUsed = attemptInfo?.count ?? 0;
  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;
  const deptLabel = DEPARTMENTS.find(d => d.id === dept)?.label;
 
  return (
    <div className="fi" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:`radial-gradient(ellipse at 20% 50%,#0d1a2e 0%,${G.bg} 60%)` }}>
      <div style={{ maxWidth:560, width:"100%" }}>
        <Logo />
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:G.muted, textTransform:"uppercase" }}>Competitive Aptitude Test</div>
        </div>
 
        <div className="card" style={{ padding:"28px 32px" }}>
          {/* Section overview */}
          <div className="serif" style={{ fontSize:15, color:G.goldLight, marginBottom:8 }}>Examination Details</div>
          <div className="div" style={{ marginTop:0 }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            {SECTION_META.map(s => (
              <div key={s.id} style={{ background:G.accent, padding:"8px 12px", borderRadius:3, borderLeft:`2px solid ${G.gold}` }}>
                <div style={{ fontSize:12, color:G.text, fontWeight:500 }}>{s.name}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{s.count} questions · {s.time} min</div>
              </div>
            ))}
          </div>
          <div style={{ background:G.accent, padding:"10px 14px", borderRadius:3, border:`1px solid ${G.border}`, marginBottom:8 }}>
            {[["Total Questions",TOTAL_QUESTIONS_CALC],["Duration","90 minutes"],["Pass Mark","35 / 60 correct"],["Max Attempts",`${MAX_ATTEMPTS} total`]].map(([k,v],i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginTop:i?5:0 }}>
                <span style={{ color:G.muted }}>{k}</span>
                <span style={{ color:k==="Pass Mark"?G.gold:G.text, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, color:G.muted, lineHeight:1.7, marginBottom:18 }}>
            • Questions are randomised and department-relevant — each attempt differs.<br/>
            • Navigate freely across all sections. Auto-submits when time runs out.
          </div>
 
          {/* Full Name */}
          <label style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Name</label>
          <input type="text" placeholder="Enter your full name" value={name}
            onChange={e => handleNameChange(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleStart()} />
 
          {/* Attempt indicator */}
          {attemptInfo && name.trim() && (
            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:G.muted }}>Attempts used:</span>
              {Array.from({ length:MAX_ATTEMPTS }).map((_,i)=>(
                <div key={i} className="adot" style={{ background:i<attemptsUsed?"#e85c4c":G.border }} />
              ))}
              <span style={{ fontSize:11, color:attemptsLeft===0?"#e85c4c":G.gold }}>
                {attemptsLeft===0?"No attempts left":`${attemptsLeft} remaining`}
              </span>
            </div>
          )}
 
          {/* Department */}
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
            <div style={{ color:"#e85c4c", fontSize:12, marginTop:10, padding:"8px 12px", background:"rgba(232,92,76,.1)", borderRadius:3, border:"1px solid rgba(232,92,76,.3)" }}>{err}</div>
          )}
 
          <button className="btn-gold" style={{ width:"100%", marginTop:16 }}
            disabled={!name.trim() || !dept || attemptsLeft===0}
            onClick={handleStart}>
            Begin Examination
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:G.muted }}>
          Results are automatically recorded to HR upon submission
        </div>
      </div>
    </div>
  );
}
 
// ── EXAM ──────────────────────────────────────────────────────────────────────
function Exam({ name, deptLabel, sections, onSubmit }) {
  const [si, setSi] = useState(0);
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState(() => sections.map(s => Array(s.questions.length).fill(-1)));
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const ansRef = useRef(ans);
  ansRef.current = ans;
 
  const submit = useCallback(() => {
    if (done) return;
    setDone(true);
    clearInterval(timerRef.current);
    onSubmit(ansRef.current);
  }, [done, onSubmit]);
 
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { submit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);
 
  const sec = sections[si];
  const q = sec.questions[qi];
  const totalAns = sections.reduce((t, s, x) => t + s.questions.filter((_, y) => ans[x][y] !== -1).length, 0);
  const tc = timeLeft < 300 ? "tmr dng" : timeLeft < 600 ? "tmr warn" : "tmr";
  const absQ = sections.slice(0, si).reduce((t, x) => t + x.questions.length, 0) + qi;
 
  function pick(oi) { const a = ans.map(r=>[...r]); a[si][qi]=oi; setAns(a); }
  function next() { qi<sec.questions.length-1?setQi(qi+1):si<sections.length-1?(setSi(si+1),setQi(0)):null; }
  function prev() { qi>0?setQi(qi-1):si>0?(setSi(si-1),setQi(sections[si-1].questions.length-1)):null; }
 
  return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:G.card, borderBottom:`1px solid ${G.border}`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, position:"sticky", top:0, zIndex:100 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
            <div className="serif" style={{ fontSize:14, color:G.text }}>{name}</div>
            <div className="dept-badge">{deptLabel}</div>
          </div>
          <div style={{ fontSize:11, color:G.muted }}>Q {absQ+1}/{TOTAL_QUESTIONS_CALC} · {totalAns} answered</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div className={tc} style={{ fontSize:26, fontWeight:700, letterSpacing:2, color:timeLeft<300?"#e85c4c":G.gold }}>{fmtTime(timeLeft)}</div>
          <div style={{ fontSize:10, color:G.muted, letterSpacing:1 }}>REMAINING</div>
        </div>
        <button className="btn-gold" style={{ padding:"9px 22px", fontSize:13 }}
          onClick={() => window.confirm("Submit exam? Cannot be undone.") && submit()}>
          Submit Exam
        </button>
      </div>
 
      {/* Progress */}
      <div style={{ padding:"5px 20px", background:G.card, borderBottom:`1px solid ${G.border}` }}>
        <div className="pbar"><div className="pfill" style={{ width:`${(totalAns/TOTAL_QUESTIONS_CALC)*100}%` }} /></div>
      </div>
 
      {/* Section tabs */}
      <div style={{ padding:"8px 20px", background:G.card, borderBottom:`1px solid ${G.border}`, display:"flex", gap:6, overflowX:"auto" }}>
        {sections.map((s,x)=>{
          const sa=ans[x].filter(a=>a!==-1).length;
          return <div key={s.id} className={`stab ${x===si?"act":""} ${sa>0?"has":""}`} onClick={()=>{setSi(x);setQi(0);}}>{s.name} <span style={{fontSize:10,opacity:.7}}>({sa}/{s.questions.length})</span></div>;
        })}
      </div>
 
      {/* Body */}
      <div style={{ flex:1, display:"flex", maxWidth:1100, width:"100%", margin:"0 auto", padding:"20px 16px", gap:18 }}>
        {/* Question card */}
        <div style={{ flex:1 }} className="fi" key={`${si}-${qi}`}>
          <div className="card" style={{ padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ background:G.gold, color:"#0a0d14", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{qi+1}</div>
              <div style={{ fontSize:11, color:G.muted, letterSpacing:1, textTransform:"uppercase" }}>{sec.name}</div>
            </div>
            <div className="serif" style={{ fontSize:17, lineHeight:1.7, color:G.text, marginBottom:22 }}>{q.q}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {q.options.map((opt,oi)=>(
                <button key={oi} className={`opt-btn ${ans[si][qi]===oi?"sel":""}`} onClick={()=>pick(oi)}>
                  <div className="olbl">{String.fromCharCode(65+oi)}</div>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
            <button className="btn-outline" onClick={prev} disabled={si===0&&qi===0}>← Previous</button>
            <button className="btn-gold" onClick={next} disabled={si===sections.length-1&&qi===sec.questions.length-1}>Next →</button>
          </div>
        </div>
 
        {/* Navigator */}
        <div style={{ width:180, flexShrink:0 }}>
          <div className="card" style={{ padding:14, position:"sticky", top:130 }}>
            <div style={{ fontSize:10, color:G.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Questions</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {sec.questions.map((_,x)=>(
                <div key={x} className={`qnav ${x===qi?"cur":ans[si][x]!==-1?"ans":""}`} onClick={()=>setQi(x)}>{x+1}</div>
              ))}
            </div>
            <div className="div" />
            <div style={{ fontSize:11, color:G.muted }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:5 }}>
                <div style={{ width:12, height:12, background:G.gold, borderRadius:2 }} /><span>Answered</span>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <div style={{ width:12, height:12, background:G.accent, border:`1px solid ${G.border}`, borderRadius:2 }} /><span>Not answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── RESULTS ───────────────────────────────────────────────────────────────────
function Results({ name, deptLabel, sections, answers, savedOk, attemptCount }) {
  const score = calcScore(sections, answers);
  const passed = score >= PASS_MARK;
  const pct = Math.round((score / TOTAL_QUESTIONS_CALC) * 100);
  const attLeft = MAX_ATTEMPTS - attemptCount;
 
  const secScores = sections.map((s,si)=>({
    name:s.name,
    correct:s.questions.filter((q,qi)=>answers[si][qi]===q.answer).length,
    total:s.questions.length,
  }));
 
  return (
    <div className="fi" style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 80% 20%,#0d1a2e 0%,${G.bg} 60%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:520, width:"100%" }}>
        <Logo />
        <div style={{ textAlign:"center", marginTop:24 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:G.muted, textTransform:"uppercase", marginBottom:10 }}>Examination Complete</div>
          <div style={{ marginBottom:8 }}><div className="dept-badge">{deptLabel}</div></div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
            <div className="scircle">
              <div className="serif" style={{ fontSize:44, fontWeight:700, color:passed?G.gold:"#e85c4c", lineHeight:1 }}>{score}</div>
              <div style={{ fontSize:12, color:G.muted }}>out of {TOTAL_QUESTIONS_CALC}</div>
            </div>
          </div>
          <div className="serif" style={{ fontSize:21, color:passed?G.goldLight:"#e87c6c", marginBottom:6 }}>
            {passed?"🎉 Congratulations — Passed!":"Not Cleared — Better Luck Next Time"}
          </div>
          <div style={{ fontSize:13, color:G.muted, marginBottom:6 }}>
            {name} · {pct}% · {passed?`${score-PASS_MARK} above pass mark`:`${PASS_MARK-score} below pass mark`}
          </div>
          {!passed && attLeft>0 && (
            <div style={{ fontSize:12, color:G.gold }}>{attLeft} attempt{attLeft>1?"s":""} remaining</div>
          )}
          {!passed && attLeft===0 && (
            <div style={{ fontSize:12, color:"#e85c4c" }}>No attempts remaining — please contact HR.</div>
          )}
        </div>
 
        <div className="card" style={{ padding:22, marginTop:20 }}>
          <div className="serif" style={{ fontSize:14, color:G.goldLight, marginBottom:12 }}>Section-wise Performance</div>
          {secScores.map((s,i)=>(
            <div key={i} style={{ marginBottom:11 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ color:G.text }}>{s.name}</span>
                <span style={{ color:G.muted }}>{s.correct}/{s.total}</span>
              </div>
              <div className="pbar"><div className="pfill" style={{ width:`${(s.correct/s.total)*100}%` }} /></div>
            </div>
          ))}
        </div>
 
        <div className="card" style={{ padding:"12px 18px", marginTop:10, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>{savedOk?"✅":"⚠️"}</span>
          <span style={{ fontSize:12, color:savedOk?G.text:"#e8a84c" }}>
            {savedOk?"Results saved to HR Google Sheet successfully.":"Could not reach Google Sheet — please inform HR manually."}
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
  const [deptId, setDeptId] = useState("");
  const [sections, setSections] = useState(null);
  const [result, setResult] = useState(null);
 
  function handleStart(n, d) {
    setName(n); setDeptId(d);
    setSections(buildSections(d));
    setPhase("exam");
  }
 
  async function handleSubmit(answers) {
    // 1. Calculate score and timestamp early
    const score = calcScore(answers);
    const ts = new Date().toLocaleString("en-IN");
    setSavedAt(ts);
    setFinalAnswers(answers);

    // 2. Format section-wise breakdown for a clean email read
    const sectionBreakdown = SECTIONS.map((sec, si) => {
      const correct = sec.questions.filter((q, qi) => answers[si]?.[qi] === q.answer).length;
      return `• ${sec.name}: ${correct} / ${sec.questions.length}`;
    }).join("\n");

    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);

    // 3. Prepare optimized data payload
    const emailPayload = {
      Candidate_Name: name,
      Final_Score: `${score} / ${TOTAL_QUESTIONS} (${percentage}%)`,
      Status: score >= PASS_MARK ? "PASSED ✅" : "FAILED ❌",
      Submitted_At: ts,
      Section_Performance: "\n" + sectionBreakdown
    };

    // 4. Send directly to Formspree
    try {
      await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
    } catch (e) {
      console.error("Formspree delivery error:", e);
    }

    // 5. Instantly transition to the score screen for the user
    setPhase("results");
  }
 
  const deptLabel = DEPARTMENTS.find(d => d.id === deptId)?.label || "";
 
  return (
    <>
      <style>{css}</style>
      {phase==="landing" && <Landing onStart={handleStart} />}
      {phase==="exam" && <Exam name={name} deptLabel={deptLabel} sections={sections} onSubmit={handleSubmit} />}
      {phase==="results" && <Results name={name} deptLabel={deptLabel} sections={sections} answers={result.answers} savedOk={result.savedOk} attemptCount={result.attemptCount} />}
    </>
  );
}
