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
 
const TOTAL_QUESTIONS = SECTION_META.reduce((s, m) => s + m.count, 0);
 
// ── COMMON QUESTION POOLS (All Departments) ───────────────────────────────────
const COMMON = {
  abstract: [
    { q: "Series: 2, 4, 8, 16, __?", options: ["24","32","30","36"], answer: 1 },
    { q: "Series: 1, 4, 9, 16, 25, __?", options: ["30","35","36","49"], answer: 2 },
    { 
      q: "Which of the options completes the non-verbal visual sequence pattern shown below?", 
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", 
      options: ["Pattern A", "Pattern B", "Pattern C", "Pattern D"], 
      answer: 1 
    },
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
    {
      q: "Examine the quarterly hotel operational performance report chart below. Which tracking month observed the sharpest drop in overall room revenue margins?",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", 
      options: ["January", "March", "June", "August"],
      answer: 1
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
    { q: "Fill in: Supervisors must _____ communicate clear instructions to their team.", options: ["withhold","communicate","ignore","confuse"], answer: 1 },
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
      { q: "P&L stands for:", options: ["Production & Labour","Profit & Loss","Price & Leverage","Payment & Liability"], answer: 1 },
      { q: "MIS report in finance stands for:", options: ["Management Information System","Monthly Income Statement","Market Intelligence Survey","Macro Investment Strategy"], answer: 0 },
      { q: "ROI stands for:", options: ["Return on Investment","Rate of Interest","Revenue on Insurance","Record of Inventory"], answer: 0 },
      { q: "An asset in business is:", options: ["Money owed to suppliers","Any resource owned that has economic value","Tax paid to government","Employee salary expense"], answer: 1 },
      { q: "A liability means:", options: ["Profits earned","Cash in bank","Amounts owed to external parties / debts","Purchased stock items"], answer: 2 },
      { q: "Working capital formula is:", options: ["Fixed Assets − Liabilities","Current Assets − Current Liabilities","Total Revenue − Expenses","Cash + Inventory"], answer: 1 },
      { q: "Auditing primarily means:", options: ["Calculating employee bonuses","Official inspection of an organization's accounts","Designing marketing plans","Setting up software systems"], answer: 1 },
      { q: "CAPEX stands for:", options: ["Capital Expenditure","Cash Allocation Plan","Corporate Asset Purchase","Current Account Profit"], answer: 0 },
    ],
    verbal: [
      { q: "Fill in: Financial reports must be perfectly _____ to avoid compliance audits.", options: ["estimated","accurate","creative","delayed"], answer: 1 },
      { q: "The term 'fiduciary duty' implies an obligation of:", options: ["Technical skill","Trust and financial responsibility","Rapid speed","Marketing expertise"], answer: 1 },
    ],
  },
 
  engineering: {
    numerical: [
      { q: "Generator consumes 15L diesel/hr. Shift runs 8 hrs. Total fuel consumed?", options: ["100 L","110 L","120 L","130 L"], answer: 2 },
      { q: "AC repair checklist: 12 units done in 3 hrs. Speed per hour?", options: ["2 units","3 units","4 units","5 units"], answer: 2 },
      { q: "LED bulb saves 40W compared to incandescent. 50 bulbs running for 10 hours saves?", options: ["15 kWh","18 kWh","20 kWh","25 kWh"], answer: 2 },
      { q: "Water pump moves 500L in 20 mins. Flow rate per minute?", options: ["20 L","22 L","25 L","30 L"], answer: 2 },
      { q: "Engineering team received 80 tasks, resolved 64. Resolution rate?", options: ["75%","78%","80%","85%"], answer: 2 },
      { q: "Server room cooling target is 21°C ± 2°C. Which reading is out of bounds?", options: ["19°C","20°C","22°C","24°C"], answer: 3 },
      { q: "Hotel solar array matches 15% of 4,000 kWh daily demand. Solar generation?", options: ["500 kWh","550 kWh","600 kWh","650 kWh"], answer: 2 },
      { q: "10 boilers checked; each takes 25 minutes. Total inspection time (hours)?", options: ["3.5 hrs","4.17 hrs","4.5 hrs","5 hrs"], answer: 1 },
    ],
    awareness: [
      { q: "BMS in building operations stands for:", options: ["Boiler Maintenance System","Building Management System","Basement Monitoring Structure","Battery Management Software"], answer: 1 },
      { q: "Preventive maintenance means:", options: ["Fixing things after they break","Scheduled inspection and servicing to prevent failure","Upgrading aesthetic designs","Reducing engineering team size"], answer: 1 },
      { q: "HVAC stands for:", options: ["High Voltage Alternating Current","Heating, Ventilation, and Air Conditioning","Hydraulic Volume Automation Control","Building Moisture Safety System"], answer: 1 },
      { q: "CFL stands for:", options: ["Compact Fluorescent Lamp","Centralized Fuel Line","Current Flow Limit","Cooling Fluid Level"], answer: 0 },
      { q: "An electrical circuit breaker's primary function is to:", options: ["Increase voltage supply","Automatically interrupt current flow during overload","Store backup battery charge","Generate static electricity"], answer: 1 },
      { q: "UPS system provides:", options: ["Instant water heating","Continuous backup power during outages","Elevator speed tracking","Fire safety alerts"], answer: 1 },
      { q: "Chiller plant in a luxury hotel is used for:", options: ["Freezing meats","Centralized air conditioning cooling","Laundry washing","Swimming pool heating"], answer: 1 },
      { q: "STP in hotel environmental systems stands for:", options: ["Steam Temperature Pipe","Sewage Treatment Plant","Standard Thermal Power","Safety Test Protocol"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: Technical logs must be maintained _____ to preserve historical safety records.", options: ["haphazardly","chronologically","optionally","seasonally"], answer: 1 },
      { q: "The term 'hazardous' directly translates to:", options: ["Extremely convenient","Dangerous or risky","Highly advanced","Cost efficient"], answer: 1 },
    ],
  },
 
  "Spa & Recreation": {
    numerical: [
      { q: "Spa slot: 60 mins treatment + 15 mins turnaround setup. 6 hours shift handles how many slots?", options: ["4","5","4.8","5.5"], answer: 2 },
      { q: "Massage oil package costs ₹1,500, marked up by 40%. Retail price?", options: ["₹1,900","₹2,000","₹2,100","₹2,200"], answer: 2 },
      { q: "Spa targets 60% capacity. 20 slots open, 14 booked. Realized occupancy?", options: ["65%","68%","70%","72%"], answer: 2 },
      { q: "Gym attendance: 140 entries across a 7-day tracking cycle. Average daily entries?", options: ["15","18","20","25"], answer: 2 },
      { q: "Therapist does 4 sessions @ ₹3,500 each. Total dynamic session revenue?", options: ["₹12,000","₹13,000","₹14,000","₹15,000"], answer: 2 },
      { q: "Treatment takes 90 mins. Guest arrives 15 mins late. Remaining session window (mins)?", options: ["60","70","75","80"], answer: 2 },
      { q: "A group booking of 8 guests gets 10% off structural pricing of ₹4,000 each. Total group yield?", options: ["₹28,000","₹28,400","₹28,800","₹29,200"], answer: 2 },
      { q: "Locker room holds 120 towels. 85 in active circulation. Remaining pristine towel stock?", options: ["30","32","35","38"], answer: 2 },
    ],
    awareness: [
      { q: "Aroma therapy utilizes:", options: ["Sound waves","Essential plant oils and fragrances","Deep tissue adjustments","Thermal mud wraps"], answer: 1 },
      { q: "Swedish massage is mostly known for:", options: ["Intense acupressure","Long, fluid, relaxing strokes","Hot volcanic stones","Dry structural stretching"], answer: 1 },
      { q: "Sauna room operations leverage:", options: ["Freezing sub-zero air","Dry, intense heat environment","Deep hot water immersion","Mud exfoliation"], answer: 1 },
      { q: "Reflexology therapy focuses maps directly onto the:", options: ["Scalp and shoulders","Feet, hands, and ears","Spinal alignment points","Facial skin cells"], answer: 1 },
      { q: "Gym treadmill maintenance checks focus crucially on:", options: ["Audio speaker setups","Belt alignment and lubrication","Digital interface graphics","Frame color updates"], answer: 1 },
      { q: "Exfoliation in a luxury facial or body script means:", options: ["Applying sun blocking creams","Removing dead surface skin cells","Deep tissue rhythmic percussion","Hydration misting"], answer: 1 },
      { q: "Detoxification refers to the programmatic process of:", options: ["Muscle tightening","Cleansing tracking toxins from body profiles","Increasing caloric intake","Skin tan acceleration"], answer: 1 },
      { q: "Hydrotherapy systems utilize:", options: ["Air pressure chambers","Water for pain relief and physical wellness","Static electrical fields","Infrared laser rays"], answer: 1 },
    ],
    verbal: [
      { q: "Fill in: A quiet, tranquil ambiance helps guests _____ completely during an organic massage session.", options: ["energize","unwind","exercise","hesitate"], answer: 1 },
      { q: "The term 'rejuvenation' is closest in core intent to:", options: ["Exhaustion","Renewal and revitalization","Intervention","Relocation"], answer: 1 },
    ],
  },
};
 
// ── ANALYTICS UTILS ──────────────────────────────────────────────────────────
function getSectionQuestions(deptId, secId) {
  const commonPool = COMMON[secId] || [];
  const meta = SECTION_META.find(m => m.id === secId);
  if (!meta) return [];
  
  let pool = [...commonPool];
  if (DEPT_Q[deptId]?.[secId]) {
    pool = [...pool, ...DEPT_Q[deptId][secId]];
  }
 
  const subset = [];
  for (let i = 0; i < meta.count; i++) {
    const idx = (i * 7) % pool.length;
    subset.push(pool[idx]);
  }
  return subset;
}
 
const ALL_EXAM_QUESTIONS = {};
DEPARTMENTS.forEach(d => {
  ALL_EXAM_QUESTIONS[d.id] = SECTION_META.map(sec => ({
    sectionId: sec.id,
    questions: getSectionQuestions(d.id, sec.id)
  }));
});
 
// ── INLINE GLOBAL CSS STYLES ─────────────────────────────────────────────────
const G = {
  bg: "#fcfbfa",
  cardBg: "#ffffff",
  text: "#292724",
  muted: "#7c756e",
  accent: "#8c764d",
  border: "#eae6df",
  lightBg: "#f5f3ef",
  success: "#4a6b53",
  error: "#9c4a4a",
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};
 
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: ${G.font}; color: ${G.text}; }
  body { background: ${G.bg}; }
  .btn {
    background: ${G.accent}; color: white; border: none; padding: 12px 24px;
    border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s;
    font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn:disabled { background: ${G.border}; color: ${G.muted}; cursor: not-allowed; transform: none; }
  .card {
    background: ${G.cardBg}; border: 1px solid ${G.border};
    border-radius: 8px; padding: 32px; box-shadow: 0 4px 20px rgba(140,118,77,0.06);
  }
  .input-field {
    width: 100%; padding: 12px; border: 1px solid ${G.border};
    border-radius: 4px; font-size: 15px; margin-top: 6px; outline: none; transition: border 0.2s;
  }
  .input-field:focus { border-color: ${G.accent}; }
`;
 
// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────
 
function Landing({ onStart }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [err, setErr] = useState("");
 
  function handleAuthenticate() {
    if (!name.trim()) return setErr("Please state your candidate name profile configuration.");
    if (!dept) return setErr("Please specify your target specialized department loop mapping.");
    setErr("");
    onStart(name.trim(), dept);
  }
 
  return (
    <div style={{ maxWidth: 520, margin: "100px auto", padding: 16 }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: "600", letterSpacing: 1, color: G.accent, marginBottom: 6 }}>THE OBEROI GROUP</div>
        <div style={{ fontSize: 13, color: G.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 32 }}>Candidate Assessment Portal</div>
        
        {err && <div style={{ background: "#fdf3f3", color: G.error, padding: 12, borderRadius: 4, fontSize: 13, marginBottom: 16, border: `1px solid ${G.border}` }}>{err}</div>}
        
        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: "600", color: G.muted, textTransform: "uppercase" }}>Full Name</label>
          <input className="input-field" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full candidate identity details..." />
        </div>
 
        <div style={{ textAlign: "left", marginBottom: 32 }}>
          <label style={{ fontSize: 12, fontWeight: "600", color: G.muted, textTransform: "uppercase" }}>Department Selection</label>
          <select className="input-field" value={dept} onChange={e => setDept(e.target.value)} style={{ background: "white" }}>
            <option value="">-- Choose Assigned Department Track --</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
 
        <button className="btn" style={{ width: "100%" }} onClick={handleAuthenticate}>
          Authenticate & Start Session
        </button>
      </div>
    </div>
  );
}
 
function Exam({ name, deptId, onSubmit }) {
  const sections = ALL_EXAM_QUESTIONS[deptId];
  const [secIdx, setSecIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secTimeLeft, setSecTimeLeft] = useState(sections[0].time * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef(null);
 
  const currentSection = sections[secIdx];
  const currentQuestion = currentSection.questions[qIdx];
 
  const moveToNextSection = useCallback(() => {
    if (secIdx < sections.length - 1) {
      const nextIdx = secIdx + 1;
      setSecIdx(nextIdx);
      setQIdx(0);
      setSecTimeLeft(sections[nextIdx].time * 60);
    } else {
      clearInterval(timerRef.current);
      if (!isSubmitting) {
        setIsSubmitting(true);
        onSubmit(answers);
      }
    }
  }, [secIdx, sections, answers, onSubmit, isSubmitting]);
 
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          moveToNextSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [secIdx, moveToNextSection]);
 
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }
 
  function handleSelectOption(optIdx) {
    setAnswers(prev => ({
      ...prev,
      [secIdx]: { ...(prev[secIdx] || {}), [qIdx]: optIdx }
    }));
  }
 
  let cumulativeQuestionIndex = 1;
  for (let s = 0; s < secIdx; s++) {
    cumulativeQuestionIndex += sections[s].questions.length;
  }
  cumulativeQuestionIndex += qIdx;
 
  return (
    <div style={{ maxWidth: 840, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "white", padding: "16px 24px", borderRadius: 8, border: `1px solid ${G.border}` }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: "600", color: G.accent }}>{currentSection.name}</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Candidate Identity System mapping: {name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: "700", color: secTimeLeft < 60 ? G.error : G.success }}>{formatTime(secTimeLeft)}</div>
          <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Section Timer Remaining</div>
        </div>
      </div>
 
      <div className="card" style={{ minHeight: 400, position: "relative", paddingBottom: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: G.muted, borderBottom: `1px solid ${G.border}`, paddingBottom: 12, marginBottom: 24 }}>
          <span style={{ fontWeight: "600", textTransform: "uppercase" }}>Question {cumulativeQuestionIndex} of {TOTAL_QUESTIONS}</span>
          <span>Section Track: {secIdx + 1}/{sections.length}</span>
        </div>
 
        <div style={{ fontSize: 17, fontWeight: "500", lineHeight: "1.6", marginBottom: 20 }}>
          {currentQuestion.q}
        </div>
 
        {currentQuestion.img && (
          <div className="question-diagram-container" style={{ margin: "20px 0", textAlign: "center", background: G.lightBg, padding: 16, borderRadius: 6, border: `1px solid ${G.border}` }}>
            <img 
              src={currentQuestion.img} 
              alt="Visual reference exam item pattern asset layout" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "300px", 
                objectFit: "contain",
                borderRadius: "4px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
              }} 
            />
          </div>
        )}
 
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}>
          {currentQuestion.options.map((opt, idx) => {
            const isChecked = answers[secIdx]?.[qIdx] === idx;
            return (
              <label key={idx} style={{
                display: "flex", alignItems: "center", padding: "14px 18px",
                borderRadius: 6, border: `1px solid ${isChecked ? G.accent : G.border}`,
                background: isChecked ? "#fbfaf7" : "white", cursor: "pointer", transition: "all 0.2s"
              }}>
                <input type="radio" name={`q-${secIdx}-${qIdx}`} checked={isChecked} onChange={() => handleSelectOption(idx)} style={{ marginRight: 14, accentColor: G.accent, transform: "scale(1.1)" }} />
                <span style={{ fontSize: 15, fontWeight: isChecked ? "500" : "400" }}>{opt}</span>
              </label>
            );
          })}
        </div>
 
        <div style={{ position: "absolute", bottom: 32, left: 32, right: 32, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${G.border}`, paddingTop: 20 }}>
          <button className="btn" style={{ background: G.lightBg, color: G.text, border: `1px solid ${G.border}` }} onClick={() => setQIdx(prev => Math.max(0, prev - 1))} disabled={qIdx === 0}>
            Previous Layout
          </button>
 
          {qIdx < currentSection.questions.length - 1 ? (
            <button className="btn" onClick={() => setQIdx(prev => prev + 1)}>
              Next Stream
            </button>
          ) : (
            <button className="btn" style={{ background: G.success }} onClick={moveToNextSection}>
              {secIdx === sections.length - 1 ? "Complete Examination Evaluation" : "Proceed Next Category Section"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
function Results({ name }) {
  return (
    <div style={{ maxWidth: 500, margin: "120px auto", padding: 16 }}>
      <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉</div>
        <div style={{ fontSize: 22, fontWeight: "600", marginBottom: 12, color: G.accent }}>Assessment Pack Transmitted</div>
        <div style={{ fontSize: 15, color: G.muted, lineHeight: "1.6", marginBottom: 32 }}>
          Thank you, <strong style={{ color: G.text }}>{name}</strong>. Your metrics data logs have been safely delivered to our human resources processing ledger parameters for systematic analysis.
        </div>
        <div style={{ fontSize: 12, color: G.muted, borderTop: `1px solid ${G.border}`, paddingTop: 16 }}>
          You may safely secure or disconnect this window terminal space.
        </div>
      </div>
    </div>
  );
}
 
// ── MAIN CORE ENTRY CONTAINER COMPONENT ──────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("landing");
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [finalAnswers, setFinalAnswers] = useState({});
 
  function calcScore(allAnswers) {
    let score = 0;
    const sections = ALL_EXAM_QUESTIONS[deptId];
    if (!sections) return 0;
 
    sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        if (allAnswers[si]?.[qi] === q.answer) {
          score++;
        }
      });
    });
    return score;
  }
 
  async function handleStart(n, d) {
    setName(n);
    setDeptId(d);
    setPhase("exam");
  }
 
  async function handleSubmit(answers) {
    const score = calcScore(answers);
    const ts = new Date().toLocaleString("en-IN");
    setSavedAt(ts);
    setFinalAnswers(answers);
 
    const sections = ALL_EXAM_QUESTIONS[deptId];
    const sectionBreakdown = sections.map((sec, si) => {
      const correct = sec.questions.filter((q, qi) => answers[si]?.[qi] === q.answer).length;
      return `• ${sec.name}: ${correct} / ${sec.questions.length}`;
    }).join("\n");
 
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
 
    const emailPayload = {
      Candidate_Name: name,
      Final_Score: `${score} / ${TOTAL_QUESTIONS} (${percentage}%)`,
      Status: score >= PASS_MARK ? "PASSED ✅" : "FAILED ❌",
      Submitted_At: ts,
      Section_Performance: "\n" + sectionBreakdown
    };
 
    // Send form payload score summaries directly to the Formspree tracking stream
    try {
      await fetch("https://formspree.io/f/mgobvpee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
    } catch (e) { console.error("Formspree data transmission error:", e); }
 
    setPhase("results");
  }
 
  return (
    <>
      <style>{css}</style>
      {phase === "landing" && (
        <Landing onStart={handleStart} />
      )}
      {phase === "exam" && <Exam name={name} deptId={deptId} onSubmit={handleSubmit} />}
      {phase === "results" && <Results name={name} />}
    </>
  );
}
