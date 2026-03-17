// ═══════════════════════════════════════════════════════════
// Learn Smart – Frontend (connects to Python smart backend)
// Backend must be running on http://localhost:3001
// ═══════════════════════════════════════════════════════════

const API = 'http://localhost:3001/api';

var APP = {
  token: localStorage.getItem('pf_token') || null,
  user: null,
  careers: [],
  roadmap: [],
  courses: [],
  market: null,
  skillGaps: { have:[], need:[], learning:[] },
  compareList: [],
  skillStates: {},
  charts: {},
  topCareerId: 1,
  learnProgress: JSON.parse(localStorage.getItem('pf_learn')||'{}'),
  learnXP: parseInt(localStorage.getItem('pf_xp')||'0')
};
// ─────────────────────────────────────────
// FIELD → CAREER MAPPING
// Maps each field of study to relevant career IDs and market data
// ─────────────────────────────────────────
var FIELD_DATA = {
  cs: {
    careerIds: [1,2,3,4,5,8,10],
    salaryRoles: ['Data Analyst','ML Engineer','Cloud Architect','Full Stack Dev','QA Engineer'],
    salaryMin:   [5, 8, 10, 6, 4],
    salaryMax:   [12,22, 32, 18, 10],
    demandLabels:['Data Analyst','ML Engineer','Cloud Architect','DevOps','QA Engineer','Full Stack','Cybersecurity','BI Analyst'],
    demandValues:[48, 38, 29, 35, 12, 42, 24, 22],
    insights:[
      {label:'Top Role',       val:'ML Engineer',  sub:'↑ 42% demand in 2025'},
      {label:'Avg CS Salary',  val:'₹10.5 LPA',    sub:'Freshers: ₹5–8 LPA'},
      {label:'Top Skill',      val:'Python',        sub:'Listed in 80% of JDs'},
      {label:'Remote Jobs',    val:'38%',           sub:'Of all IT roles'},
      {label:'Top City',       val:'Bengaluru',     sub:'Highest CS openings'},
      {label:'Fresher Roles',  val:'22,000+',       sub:'Entry-level this month'}
    ],
    whatsNew:[
      'ML Engineer demand up 42% — fastest growing CS role in India',
      'Cloud certifications (AWS/Azure) adding ₹2–3 LPA to fresher packages',
      'Full Stack developers with React + Node.js top hiring list in Bengaluru',
      'Python overtook Java as most-listed skill in Indian IT job postings',
      'Cybersecurity roles grew 24% — NASSCOM reports shortage of 1 lakh professionals'
    ]
  },
  engg: {
    careerIds: [3,4,6,10,14,17],
    salaryRoles: ['Embedded SW Eng','Data Engineer','Cloud Architect','ML Engineer','Medical Device SW','IoT Developer'],
    salaryMin:   [5, 6, 8, 7, 7, 5],
    salaryMax:   [14,18,32,22,22,15],
    demandLabels:['Embedded Systems','Cloud/DevOps','ML Engineer','Data Engineer','IoT Developer','Automation Eng','Robotics','Cybersecurity'],
    demandValues:[28, 35, 38, 29, 22, 25, 15, 24],
    insights:[
      {label:'Top Role',       val:'Cloud/DevOps',  sub:'↑ 35% demand in 2025'},
      {label:'Avg Engg Salary',val:'₹9.5 LPA',      sub:'Freshers: ₹5–7 LPA'},
      {label:'Top Skill',      val:'C/C++ + Python', sub:'Core to 70% of roles'},
      {label:'Hot Domain',     val:'EV & Robotics',  sub:'Growing 40% YoY'},
      {label:'Top City',       val:'Pune & Bengaluru',sub:'Manufacturing + IT hub'},
      {label:'Fresher Roles',  val:'18,000+',        sub:'Entry-level openings'}
    ],
    whatsNew:[
      'EV industry creating 15,000+ embedded software jobs in India',
      'C++ developers with RTOS experience seeing 30% salary premium',
      'Cloud DevOps engineers now required in core manufacturing firms',
      'IEC 62304 certified medical device engineers in high demand',
      'ISRO and DRDO expanding hiring for embedded systems engineers'
    ]
  },
  medical: {
    careerIds: [11,13,14,15,16,17,18],
    salaryRoles: ['Health Informatics','Clinical Data Eng','AI Diagnostics','Telemedicine Dev','Biomedical AI','Healthcare Analyst'],
    salaryMin:   [6, 6, 9, 6, 8, 4],
    salaryMax:   [18,20,26,18,24,12],
    demandLabels:['Health Informatics','AI Diagnostics','Clinical Data','Telemedicine Dev','Biomedical AI','Healthcare Analyst','Medical Device SW','Digital Health'],
    demandValues:[32, 28, 22, 35, 18, 30, 25, 40],
    insights:[
      {label:'Top Role',       val:'Telemedicine Dev', sub:'↑ 38% demand in 2025'},
      {label:'Avg Med-Tech Sal',val:'₹11 LPA',         sub:'Freshers: ₹6–9 LPA'},
      {label:'Top Skill',      val:'HL7 / FHIR',       sub:'Standard for health IT'},
      {label:'Hot Domain',     val:'AI Diagnostics',   sub:'Growing 48% YoY'},
      {label:'Top City',       val:'Bengaluru & Mumbai',sub:'Health-tech hubs'},
      {label:'Fresher Roles',  val:'9,000+',            sub:'Health IT openings'}
    ],
    whatsNew:[
      'AIIMS and Apollo launching AI diagnostics projects — 5000 jobs expected',
      'HL7 FHIR developers among top 5 highest-paid health-tech roles',
      'Telemedicine platforms grew 300% post-COVID — demand still rising',
      'Clinical data engineers with SAS certification earn 25% more',
      'National Digital Health Mission creating 20,000 health IT roles'
    ]
  },
  commerce: {
    careerIds: [2,5,7,9,12,1],
    salaryRoles: ['BI Analyst','Product Analyst','Digital Marketer','Govt Data Officer','Financial Analyst','Freelance Consultant'],
    salaryMin:   [5, 5, 3.5, 4, 5, 3],
    salaryMax:   [15,15, 10, 11, 18, 18],
    demandLabels:['BI Analyst','Digital Marketing','Product Analyst','Financial Analyst','Govt Data','E-commerce Analyst','CRM Specialist','Freelance Consultant'],
    demandValues:[22, 24, 15, 28, 8, 20, 14, 18],
    insights:[
      {label:'Top Role',        val:'Financial Analyst', sub:'↑ 28% demand in 2025'},
      {label:'Avg Commerce Sal',val:'₹7.5 LPA',          sub:'Freshers: ₹4–6 LPA'},
      {label:'Top Skill',       val:'Excel + Power BI',  sub:'Required in 75% of JDs'},
      {label:'Hot Domain',      val:'Fintech',            sub:'Growing 35% YoY'},
      {label:'Top City',        val:'Mumbai & Delhi',     sub:'Finance & commerce hubs'},
      {label:'Fresher Roles',   val:'14,000+',            sub:'Commerce openings'}
    ],
    whatsNew:[
      'Fintech sector added 12,000 commerce graduate roles in Q1 2025',
      'Power BI certified commerce graduates earning ₹2 LPA more on average',
      'E-commerce analyst roles growing 20% as D2C brands expand',
      'CA + Data Analytics combo now most sought-after in BFSI sector',
      'Digital marketing freshers with Google certification getting 40% more calls'
    ]
  },
  science: {
    careerIds: [1,3,11,15,18,9],
    salaryRoles: ['Data Scientist','ML Researcher','Biomedical AI','Clinical Data Eng','Research Analyst','Govt Data Officer'],
    salaryMin:   [6, 8, 8, 6, 5, 4],
    salaryMax:   [20,24,24,20,15,11],
    demandLabels:['Data Scientist','ML Researcher','Biomedical AI','Research Analyst','Climate Data Sci','Bioinformatics','Govt Scientist','Clinical Data'],
    demandValues:[32, 28, 18, 20, 15, 14, 10, 22],
    insights:[
      {label:'Top Role',        val:'Data Scientist',  sub:'↑ 32% demand in 2025'},
      {label:'Avg Science Sal', val:'₹10 LPA',         sub:'Freshers: ₹5–8 LPA'},
      {label:'Top Skill',       val:'Python + R',      sub:'Core research tools'},
      {label:'Hot Domain',      val:'Bioinformatics',  sub:'Growing 45% YoY'},
      {label:'Top City',        val:'Bengaluru & Pune',sub:'R&D and pharma hubs'},
      {label:'Research Roles',  val:'8,000+',          sub:'Science grad openings'}
    ],
    whatsNew:[
      'Bioinformatics roles grew 45% — genomics and drug discovery driving demand',
      'IIT and IISc research labs hiring Python + R specialists at ₹8–12 LPA',
      'Climate data scientists in high demand as ESG reporting becomes mandatory',
      'ISRO expanding data science team for satellite data analysis',
      'CSIR labs offering ₹50,000/month stipends for science graduates'
    ]
  },
  arts: {
    careerIds: [7,5,12,9,6],
    salaryRoles: ['Digital Marketer','Content Strategist','UX Writer','Product Analyst','Social Media Manager'],
    salaryMin:   [3.5, 4, 4, 5, 3],
    salaryMax:   [10, 12, 14, 15, 9],
    demandLabels:['Digital Marketing','Content Strategy','UX Writing','Social Media','Product Analyst','SEO Specialist','Brand Manager','PR & Comms'],
    demandValues:[24, 18, 16, 22, 15, 20, 12, 10],
    insights:[
      {label:'Top Role',       val:'Digital Marketer', sub:'↑ 28% demand in 2025'},
      {label:'Avg Arts Salary',val:'₹6 LPA',           sub:'Freshers: ₹3.5–5 LPA'},
      {label:'Top Skill',      val:'Content + SEO',    sub:'Required in 70% of JDs'},
      {label:'Hot Domain',     val:'UX Writing',       sub:'Growing 40% YoY'},
      {label:'Top City',       val:'Mumbai & Delhi',   sub:'Media & marketing hubs'},
      {label:'Fresher Roles',  val:'10,000+',          sub:'Arts grad openings'}
    ],
    whatsNew:[
      'UX Writers now earning ₹8–14 LPA — highest-paying arts career in tech',
      'Content marketing budgets doubled — 18,000 new roles created in 2025',
      'Social media managers with Meta ads certification earning 35% more',
      'D2C brands hiring arts graduates for brand strategy at ₹6–10 LPA',
      'Google Digital Garage certification doubling interview callback rates'
    ]
  },
  law: {
    careerIds: [9,5,12,6],
    salaryRoles: ['Legal Tech Analyst','Compliance Officer','Policy Analyst','Govt Data Officer','Legal Researcher'],
    salaryMin:   [5, 6, 5, 4, 4],
    salaryMax:   [15,18,14,11,10],
    demandLabels:['Legal Tech','Compliance','Policy Analyst','Govt Data','IP Lawyer','Contract Manager','Legal Researcher','LegalOps'],
    demandValues:[18, 22, 15, 8, 20, 16, 10, 14],
    insights:[
      {label:'Top Role',      val:'Compliance Officer', sub:'↑ 22% demand in 2025'},
      {label:'Avg Law Salary',val:'₹8 LPA',             sub:'Freshers: ₹4–6 LPA'},
      {label:'Top Skill',     val:'Legal + Data',       sub:'LegalTech is booming'},
      {label:'Hot Domain',    val:'Compliance Tech',    sub:'Growing 30% YoY'},
      {label:'Top City',      val:'Delhi & Mumbai',     sub:'Legal hubs of India'},
      {label:'Fresher Roles', val:'6,000+',             sub:'Law grad openings'}
    ],
    whatsNew:[
      'LegalTech startups raised $200M in 2025 — hiring law + tech graduates',
      'SEBI and RBI expanding compliance teams — 3000 new roles',
      'Contract management software skills adding ₹2 LPA to law graduate packages',
      'India IP filings grew 20% — IP lawyers in high demand',
      'Government legal data roles growing under Digital India initiative'
    ]
  },
  other: {
    careerIds: [1,5,7,9,12],
    salaryRoles: ['Data Analyst','Digital Marketer','Product Analyst','Govt Officer','Freelancer'],
    salaryMin:   [4.5, 3.5, 5, 4, 3],
    salaryMax:   [12, 10, 15, 11, 18],
    demandLabels:['Data Analyst','Digital Marketing','Product Analyst','Govt Data','Freelance','Content Creator','Operations','Customer Success'],
    demandValues:[48, 24, 15, 8, 18, 16, 20, 12],
    insights:[
      {label:'Top Role',      val:'Data Analyst',   sub:'↑ 22% demand in 2025'},
      {label:'Avg Salary',    val:'₹7 LPA',         sub:'Freshers: ₹4–6 LPA'},
      {label:'Top Skill',     val:'Excel + Python', sub:'Most versatile combo'},
      {label:'Hot Domain',    val:'Freelancing',    sub:'Growing 40% YoY'},
      {label:'Top City',      val:'Bengaluru',      sub:'Most openings'},
      {label:'Fresher Roles', val:'20,000+',        sub:'Cross-domain openings'}
    ],
    whatsNew:[
      'Freelance data consultants earning ₹15–35 LPA working remotely',
      'Excel + Power BI skills remain most in-demand across all industries',
      'Product analyst roles open to all graduates — communication key skill',
      'Government data roles growing under Digital India initiative',
      'Upskilling with one certification adding ₹1.5 LPA on average'
    ]
  }
}; 
// ═══════════════════════════════════════════════════════════
// IN-APP LEARNING ENGINE
// ═══════════════════════════════════════════════════════════

// Learning modules database — keyed by career field
var LEARN_MODULES = {

  // ── COMMON modules (shown for all fields) ──────────────────────────────
  common: [
    {
      id:'comm-1', nsqf:'NSQF Level 3', title:'Resume & LinkedIn Mastery',
      desc:'Build a job-winning resume and LinkedIn profile that gets recruiter attention.',
      xp:60, duration:'45 min', lessons:[
        {id:'c1-l1', title:'What Recruiters Look For in 6 Seconds',
         videoId:'Tt08KmFfIYQ',
         content:'Recruiters spend an average of 6–7 seconds scanning a resume. Your name, current title, current company, previous title, previous company, education and start/end dates are the 7 things they check first.',
         keypoints:['Use a clean single-column layout','Put your strongest achievement first','Quantify everything: "Increased sales by 30%"','Keep it to 1 page for under 3 years experience'],
         resources:[{title:'Resume Template (Google Docs)',url:'https://docs.google.com/'}]},
        {id:'c1-l2', title:'Writing Bullet Points That Get Interviews',
         videoId:null,
         content:'The STAR method (Situation, Task, Action, Result) transforms weak bullet points into powerful achievement statements that hiring managers remember.',
         keypoints:['Start every bullet with a strong action verb','Include a number in at least 60% of bullets','Show impact, not just responsibility','Tailor bullets to each job description'],
         resources:[]},
        {id:'c1-l3', title:'LinkedIn Profile Optimisation',
         videoId:'BcfGWi8-2pE',
         content:'LinkedIn is your digital resume. A complete profile gets 21x more profile views and 36x more messages from recruiters.',
         keypoints:['Professional photo increases views by 21x','Headline should say what you do + who you help','Summary should tell your story in first person','Add all skills — recruiters filter by skills'],
         resources:[{title:'LinkedIn Profile Checklist',url:'https://linkedin.com'}]},
      ],
      quiz:[
        {q:'What is the average time a recruiter spends on a resume?',
         options:['30 seconds','6-7 seconds','2 minutes','1 minute'], answer:1},
        {q:'Which format is best for writing resume bullet points?',
         options:['SMART','STAR','ABC','XYZ'], answer:1},
      ]
    },
    {
      id:'comm-2', nsqf:'NSQF Level 3', title:'Interview Skills & Communication',
      desc:'Master common interview questions, body language and salary negotiation.',
      xp:70, duration:'1 hr', lessons:[
        {id:'c2-l1', title:'Tell Me About Yourself — The Perfect Answer',
         videoId:'MmFuWmzeiDs',
         content:'This is the most asked interview question. A perfect answer follows the Present-Past-Future formula: where you are now, how you got here, and where you want to go.',
         keypoints:['Keep it to 90 seconds','Focus on professional highlights only','End with why you are excited about this role','Practice until it sounds natural, not memorised'],
         resources:[]},
        {id:'c2-l2', title:'Salary Negotiation — Get What You Deserve',
         videoId:null,
         content:'80% of employers have room to negotiate. Research the market rate, anchor high, and always negotiate in writing.',
         keypoints:['Always let employer name first number','Counter with 10-20% above their offer','Use data: "Glassdoor shows ₹X for this role"','Never apologize for negotiating'],
         resources:[]},
      ],
      quiz:[
        {q:'What is the Present-Past-Future formula used for?',
         options:['Writing resumes','Answering Tell Me About Yourself','Salary negotiation','LinkedIn bios'], answer:1},
        {q:'How much above the first offer should you counter-negotiate?',
         options:['Exactly the same','5%','10-20%','50%'], answer:2},
      ]
    }
  ],

  cs: [
    {
      id:'cs-1', nsqf:'NSQF Level 4', title:'Python for Data Science — Foundations',
      desc:'Learn Python basics, data structures, and your first data analysis scripts.',
      xp:100, duration:'3 hrs', lessons:[
        {id:'cs1-l1', title:'Python Basics: Variables, Lists, Loops',
         videoId:'rfscVS0vtbw',
         content:'Python is the #1 language in data science. Master variables, lists, dictionaries, and for loops — these 4 concepts cover 80% of data scripts.',
         keypoints:['Variables store data: x = 10','Lists store multiple items: [1,2,3]','Dictionaries store key-value pairs: {"name":"Priya"}','For loops iterate: for item in list:'],
         resources:[{title:'Python.org Official Docs',url:'https://docs.python.org/3/tutorial/'}]},
        {id:'cs1-l2', title:'NumPy & Pandas — Working with Data',
         videoId:'vmEHCJofslg',
         content:'NumPy handles numerical computation, Pandas handles structured data. Together they are the foundation of every data science project.',
         keypoints:['import numpy as np; import pandas as pd','pd.DataFrame() creates a table','df.head() shows first 5 rows','df.describe() gives statistics'],
         resources:[{title:'Pandas Documentation',url:'https://pandas.pydata.org/docs/'}]},
        {id:'cs1-l3', title:'Data Visualisation with Matplotlib',
         videoId:'3Xc3CA655Y4',
         content:'Matplotlib turns raw data into charts. Mastering plt.plot(), plt.bar() and plt.scatter() covers 90% of data visualization needs.',
         keypoints:['import matplotlib.pyplot as plt','plt.plot(x,y) for line charts','plt.bar(x,y) for bar charts','plt.show() renders the chart'],
         resources:[]},
      ],
      quiz:[
        {q:'Which library is used for data tables in Python?',
         options:['NumPy','Matplotlib','Pandas','Scikit-learn'], answer:2},
        {q:'Which command shows the first 5 rows of a dataframe?',
         options:['df.show()','df.head()','df.top()','df.preview()'], answer:1},
      ]
    },
    {
      id:'cs-2', nsqf:'NSQF Level 5', title:'SQL — From Zero to Job-Ready',
      desc:'Master SELECT, JOIN, GROUP BY and window functions used in real data jobs.',
      xp:90, duration:'2.5 hrs', lessons:[
        {id:'cs2-l1', title:'SQL Basics: SELECT, WHERE, ORDER BY',
         videoId:'HXV3zeQKqGY',
         content:'SQL is used in 95% of data analyst job descriptions. The SELECT statement is the foundation of all SQL queries.',
         keypoints:['SELECT * FROM table — gets all columns','WHERE filters rows: WHERE age > 18','ORDER BY sorts: ORDER BY salary DESC','LIMIT restricts rows: LIMIT 10'],
         resources:[{title:'SQLZoo Interactive Practice',url:'https://sqlzoo.net'}]},
        {id:'cs2-l2', title:'JOINs — Combining Tables',
         videoId:'9yeOJ0ZMUYw',
         content:'JOINs are the most tested SQL concept in interviews. INNER JOIN returns matching rows, LEFT JOIN returns all rows from left table.',
         keypoints:['INNER JOIN — only matching rows','LEFT JOIN — all from left + matching right','RIGHT JOIN — all from right + matching left','ON clause specifies the matching condition'],
         resources:[]},
      ],
      quiz:[
        {q:'Which SQL clause filters rows based on a condition?',
         options:['SELECT','FROM','WHERE','ORDER BY'], answer:2},
        {q:'Which JOIN returns all rows from the left table?',
         options:['INNER JOIN','RIGHT JOIN','LEFT JOIN','FULL JOIN'], answer:2},
      ]
    },
    {
      id:'cs-3', nsqf:'NSQF Level 5', title:'Machine Learning Fundamentals',
      desc:'Understand supervised learning, model training, and scikit-learn basics.',
      xp:120, duration:'4 hrs', lessons:[
        {id:'cs3-l1', title:'What is Machine Learning?',
         videoId:'ukzFI9rgwfU',
         content:'Machine learning is teaching computers to learn from data instead of explicit programming. There are 3 types: supervised, unsupervised, and reinforcement learning.',
         keypoints:['Supervised: learn from labelled data','Unsupervised: find patterns in unlabelled data','Features are input variables (X)','Labels are output variables (y)'],
         resources:[]},
        {id:'cs3-l2', title:'Your First ML Model with Scikit-Learn',
         videoId:'0B5eIE_1vpU',
         content:'Scikit-learn makes building ML models 10x faster. The fit-predict pattern works for every algorithm.',
         keypoints:['from sklearn.linear_model import LinearRegression','model = LinearRegression()','model.fit(X_train, y_train)','predictions = model.predict(X_test)'],
         resources:[{title:'Scikit-Learn Docs',url:'https://scikit-learn.org/stable/'}]},
      ],
      quiz:[
        {q:'What type of ML uses labelled training data?',
         options:['Unsupervised','Reinforcement','Supervised','Deep'], answer:2},
        {q:'Which method trains a scikit-learn model?',
         options:['model.train()','model.fit()','model.learn()','model.run()'], answer:1},
      ]
    }
  ],

  engg: [
    {
      id:'engg-1', nsqf:'NSQF Level 4', title:'C Programming for Embedded Systems',
      desc:'Master pointers, memory management and microcontroller programming in C.',
      xp:100, duration:'3 hrs', lessons:[
        {id:'engg1-l1', title:'Pointers and Memory in C',
         videoId:'zuegQmMdy8M',
         content:'Pointers are the most important concept in C for embedded programming. A pointer stores the memory address of another variable.',
         keypoints:['int *ptr = &variable stores address','*ptr dereferences (reads the value)','malloc() allocates heap memory','free() releases memory — always pair with malloc'],
         resources:[]},
        {id:'engg1-l2', title:'GPIO and Microcontroller Basics',
         videoId:'d8_xXNcGYgo',
         content:'GPIO (General Purpose Input/Output) is the foundation of all embedded systems. Setting pins HIGH/LOW controls LEDs, motors, and sensors.',
         keypoints:['DDRB = 0xFF sets all Port B pins as output','PORTB |= (1<<PB0) sets pin HIGH','PORTB &= ~(1<<PB0) sets pin LOW','_delay_ms(1000) waits 1 second'],
         resources:[]},
      ],
      quiz:[
        {q:'What does a pointer store?',
         options:['A value','A memory address','A string','A function'], answer:1},
        {q:'Which function allocates heap memory in C?',
         options:['alloc()','new()','malloc()','create()'], answer:2},
      ]
    },
    {
      id:'engg-2', nsqf:'NSQF Level 5', title:'Cloud & DevOps for Engineers',
      desc:'Learn AWS basics, Docker containers, and CI/CD pipelines.',
      xp:110, duration:'3.5 hrs', lessons:[
        {id:'engg2-l1', title:'AWS Core Services: EC2, S3, IAM',
         videoId:'ulprqHHWlng',
         content:'EC2 provides virtual servers, S3 stores files, IAM manages access control. These 3 services are used in 90% of AWS deployments.',
         keypoints:['EC2 = Elastic Compute Cloud (virtual server)','S3 = Simple Storage Service (file storage)','IAM = Identity Access Management (permissions)','Regions and Availability Zones ensure uptime'],
         resources:[{title:'AWS Free Tier',url:'https://aws.amazon.com/free/'}]},
        {id:'engg2-l2', title:'Docker Containers from Zero',
         videoId:'pTFZFxd5eq8',
         content:'Docker packages your application with all its dependencies into a container that runs identically everywhere.',
         keypoints:['docker build -t myapp . builds image','docker run -p 8080:80 myapp runs container','Dockerfile defines the environment','docker-compose manages multi-container apps'],
         resources:[]},
      ],
      quiz:[
        {q:'What does AWS S3 store?',
         options:['Virtual servers','Files and objects','User permissions','Databases'], answer:1},
        {q:'Which command builds a Docker image?',
         options:['docker run','docker push','docker build','docker start'], answer:2},
      ]
    }
  ],

  medical: [
    {
      id:'med-1', nsqf:'NSQF Level 4', title:'Health Informatics Fundamentals',
      desc:'Understand EHR systems, HL7 standards, and healthcare data workflows.',
      xp:90, duration:'2.5 hrs', lessons:[
        {id:'med1-l1', title:'Electronic Health Records (EHR) Basics',
         videoId:null,
         content:'EHR (Electronic Health Record) is a digital version of a patient\'s paper chart. It contains medical history, diagnoses, medications, treatment plans, immunisation dates, allergies, radiology images, and lab results.',
         keypoints:['EHR vs EMR: EHR is shared across providers','Key EHR vendors: Epic, Cerner, Meditech','HL7 FHIR is the standard for data exchange','HIPAA governs patient data privacy in US (similar to India\'s DPDP Act)'],
         resources:[{title:'HL7 FHIR Overview',url:'https://www.hl7.org/fhir/overview.html'}]},
        {id:'med1-l2', title:'ICD-10 Medical Coding Introduction',
         videoId:null,
         content:'ICD-10 (International Classification of Diseases, 10th edition) is used to code diagnoses, symptoms and procedures for billing and statistics.',
         keypoints:['ICD-10 codes have up to 7 characters','First character is always a letter','E.g. J06.9 = Acute upper respiratory infection','Clinical data engineers must understand coding for data quality'],
         resources:[]},
      ],
      quiz:[
        {q:'What does EHR stand for?',
         options:['Electronic Health Record','Emergency Health Response','Electronic Hospital Report','External Health Registry'], answer:0},
        {q:'Which standard is used for healthcare data exchange?',
         options:['HTTP','HL7 FHIR','SQL','XML'], answer:1},
      ]
    },
    {
      id:'med-2', nsqf:'NSQF Level 5', title:'AI in Medical Diagnostics',
      desc:'Learn how deep learning is transforming radiology, pathology and diagnostics.',
      xp:120, duration:'3 hrs', lessons:[
        {id:'med2-l1', title:'How AI Reads Medical Images',
         videoId:'ACmydtFDTGs',
         content:'Convolutional Neural Networks (CNNs) can detect cancer in X-rays with accuracy matching specialist radiologists. The key is training on large labelled datasets like ChestX-ray14.',
         keypoints:['DICOM is the format for medical images','CNNs extract features automatically','Data augmentation increases training data','FDA requires clinical validation before deployment'],
         resources:[]},
        {id:'med2-l2', title:'DICOM Format and Medical Imaging Tools',
         videoId:null,
         content:'DICOM (Digital Imaging and Communications in Medicine) is the standard for medical imaging data. Understanding it is essential for any AI diagnostic role.',
         keypoints:['Every DICOM file contains image + patient metadata','pydicom is the Python library for DICOM','SimpleITK handles 3D medical volumes','3D Slicer is free open-source medical imaging software'],
         resources:[{title:'pydicom Documentation',url:'https://pydicom.github.io/'}]},
      ],
      quiz:[
        {q:'What format are medical images stored in?',
         options:['JPEG','PNG','DICOM','TIFF'], answer:2},
        {q:'Which neural network architecture is used for image classification?',
         options:['RNN','CNN','LSTM','GAN'], answer:1},
      ]
    }
  ],

  commerce: [
    {
      id:'comm-biz-1', nsqf:'NSQF Level 4', title:'Excel & Power BI for Business',
      desc:'Master VLOOKUP, pivot tables, and build your first interactive dashboard.',
      xp:80, duration:'2.5 hrs', lessons:[
        {id:'biz1-l1', title:'Excel VLOOKUP, INDEX-MATCH & Pivot Tables',
         videoId:'d3BYVQ6xIE4',
         content:'VLOOKUP and Pivot Tables are the two most-tested Excel skills in business analyst interviews. Master these and you can handle 80% of business data tasks.',
         keypoints:['=VLOOKUP(lookup_value, table, col_index, 0)','INDEX-MATCH is more flexible than VLOOKUP','Pivot Tables summarise thousands of rows in seconds','Always CTRL+T to format as Table first'],
         resources:[]},
        {id:'biz1-l2', title:'Power BI Dashboard in 30 Minutes',
         videoId:'AGrl-H87pRU',
         content:'Power BI transforms Excel data into interactive dashboards. Connect data, create visuals, publish reports — the core workflow takes under an hour to learn.',
         keypoints:['Import data: Get Data → Excel/CSV','Drag fields onto canvas to create visuals','DAX formula: Total Sales = SUM(Sales[Amount])','Publish to Power BI Service for sharing'],
         resources:[{title:'Microsoft Power BI Learn',url:'https://learn.microsoft.com/en-us/power-bi/'}]},
      ],
      quiz:[
        {q:'What is the syntax start of a VLOOKUP formula?',
         options:['=HLOOKUP(','=VLOOKUP(','=LOOKUP(','=FIND('], answer:1},
        {q:'What does DAX stand for in Power BI?',
         options:['Data Analysis Expressions','Digital Analytics Extension','Data Aggregate XML','Dynamic Analysis Exchange'], answer:0},
      ]
    }
  ],

  science: [
    {
      id:'sci-1', nsqf:'NSQF Level 5', title:'Python & R for Research',
      desc:'Statistical analysis, data visualization and research workflows in Python and R.',
      xp:100, duration:'3 hrs', lessons:[
        {id:'sci1-l1', title:'Statistical Analysis with Python',
         videoId:'r-txMSpNnMY',
         content:'scipy.stats and statsmodels are the two main libraries for statistical analysis in Python. They cover everything from basic t-tests to complex regression.',
         keypoints:['from scipy import stats','stats.ttest_ind(group1, group2)','p < 0.05 means statistically significant','import statsmodels.api as sm for regression'],
         resources:[{title:'SciPy Documentation',url:'https://scipy.org/'}]},
        {id:'sci1-l2', title:'R for Bioinformatics',
         videoId:'_V8eKsto3Ug',
         content:'R is the leading language for bioinformatics and statistical research. Bioconductor provides 2000+ biology-specific packages.',
         keypoints:['library(dplyr) for data manipulation','ggplot2 creates publication-quality plots','BiocManager::install() installs bio packages','DESeq2 for RNA-seq differential expression'],
         resources:[]},
      ],
      quiz:[
        {q:'What p-value threshold is considered statistically significant?',
         options:['p < 0.5','p < 0.05','p < 0.005','p < 5'], answer:1},
        {q:'Which R library is used for bioinformatics packages?',
         options:['CRAN','Bioconductor','tidyverse','ggplot2'], answer:1},
      ]
    }
  ],

  arts: [
    {
      id:'arts-1', nsqf:'NSQF Level 4', title:'Digital Marketing Essentials',
      desc:'SEO, Google Ads, social media strategy and content marketing fundamentals.',
      xp:80, duration:'2.5 hrs', lessons:[
        {id:'arts1-l1', title:'SEO Fundamentals — Rank on Google',
         videoId:'DvwS7cV9GmQ',
         content:'SEO (Search Engine Optimisation) is the practice of getting web pages to rank higher on Google. On-page SEO focuses on content and keywords, off-page SEO focuses on backlinks.',
         keypoints:['Keyword research: Google Keyword Planner is free','Title tag and H1 must contain primary keyword','Page speed is a ranking factor — aim for < 3 seconds','1 quality backlink > 100 low-quality ones'],
         resources:[{title:'Google Search Console (Free)',url:'https://search.google.com/search-console'}]},
        {id:'arts1-l2', title:'Content Marketing Strategy',
         videoId:'YZT8iFJjTbg',
         content:'Content marketing generates 3x more leads than outbound marketing at 62% less cost. The key is creating content that solves your audience\'s problems.',
         keypoints:['Define your target audience first','Content pillar: 1 long post → 10 short posts','SEO + social + email = content distribution triangle','Measure: Traffic, time on page, conversions'],
         resources:[]},
      ],
      quiz:[
        {q:'What does SEO stand for?',
         options:['Search Engine Operation','Search Engine Optimisation','Social Engagement Optimisation','Site Engagement Overview'], answer:1},
        {q:'Content marketing generates how many times more leads than outbound?',
         options:['1x','2x','3x','5x'], answer:2},
      ]
    }
  ],

  law: [
    {
      id:'law-1', nsqf:'NSQF Level 4', title:'Legal Tech & Compliance Fundamentals',
      desc:'LegalTech tools, contract management, and compliance frameworks for modern lawyers.',
      xp:80, duration:'2 hrs', lessons:[
        {id:'law1-l1', title:'LegalTech Tools Every Lawyer Needs',
         videoId:null,
         content:'LegalTech is transforming the legal profession. Document automation, e-discovery, and contract analysis AI are now standard in top firms.',
         keypoints:['DocuSign for e-signatures — legally binding in India','Relativity for e-discovery in litigation','Kira AI for contract review automation','Westlaw and LexisNexis for legal research'],
         resources:[]},
        {id:'law1-l2', title:'GDPR and India DPDP Act Compliance',
         videoId:null,
         content:'India\'s Digital Personal Data Protection Act 2023 is the country\'s first comprehensive data privacy law. Compliance roles are booming.',
         keypoints:['DPDP Act applies to all digital personal data','Data Fiduciary = organisation collecting data','Consent is mandatory before processing','Penalty: up to ₹250 crore for violations'],
         resources:[]},
      ],
      quiz:[
        {q:'What is the maximum penalty under India\'s DPDP Act?',
         options:['₹10 crore','₹50 crore','₹250 crore','₹500 crore'], answer:2},
        {q:'Which tool is used for e-signatures?',
         options:['Relativity','DocuSign','Kira','Westlaw'], answer:1},
      ]
    }
  ]
};

// ─── Current lesson state ──────────────────────────────────────────────────
var CL = { moduleId:null, lessonIdx:0, module:null };

// ─── Get modules for current user ─────────────────────────────────────────
function getUserModules(){
  var field = (APP.user&&APP.user.profile&&APP.user.profile.field)||'other';
  var fieldMods = LEARN_MODULES[field] || LEARN_MODULES['cs'] || [];
  // Always include common modules
  return [...LEARN_MODULES.common, ...fieldMods];
}

// ─── Count completed lessons in a module ──────────────────────────────────
function moduleCompletedCount(mod){
  return mod.lessons.filter(function(l){ return APP.learnProgress[l.id]; }).length;
}

// ─── Save progress to localStorage + backend ──────────────────────────────
function saveLearnProgress(){
  localStorage.setItem('pf_learn', JSON.stringify(APP.learnProgress));
  localStorage.setItem('pf_xp', APP.learnXP);
  // Update XP badge in sidebar
  var badge = document.getElementById('learn-xp-badge');
  if(badge) badge.textContent = APP.learnXP + ' XP';
  var disp = document.getElementById('learn-xp-display');
  if(disp) disp.textContent = APP.learnXP + ' XP earned';
}

// ─── Render the learn page ─────────────────────────────────────────────────
function renderLearnPage(){
  var modules = getUserModules();
  var field = (APP.user&&APP.user.profile&&APP.user.profile.field)||'other';
  var FM = {cs:'Computer Science',engg:'Engineering',medical:'Medical / Health Tech',
            commerce:'Commerce & Business',science:'Sciences',arts:'Arts & Media',
            law:'Law',other:'Your Field'};

  // Update subtitle
  var sub = document.getElementById('learn-page-sub');
  if(sub) sub.textContent = 'AI-curated lessons for ' + (FM[field]||'your field') + ' — learn at your own pace';

  // Total progress
  var totalLessons = modules.reduce(function(s,m){return s+m.lessons.length;},0);
  var doneLessons  = modules.reduce(function(s,m){return s+moduleCompletedCount(m);},0);
  var pct = totalLessons ? Math.round(doneLessons/totalLessons*100) : 0;
  var bar = document.getElementById('learn-overall-bar');
  var pctEl = document.getElementById('learn-overall-pct');
  if(bar) setTimeout(function(){bar.style.width=pct+'%';},100);
  if(pctEl) pctEl.textContent = pct + '%';

  // Badges
  renderLearnBadges(pct, doneLessons);

  // Module cards
  var grid = document.getElementById('learn-modules-grid');
  if(!grid) return;
  var prevDone = true; // first module always unlocked
  grid.innerHTML = modules.map(function(mod, idx){
    var done = moduleCompletedCount(mod);
    var total = mod.lessons.length;
    var modPct = total ? Math.round(done/total*100) : 0;
    var isComplete = done === total;
    var isLocked = false; // no locking — all accessible

    return '<div class="learn-module-card'+(isComplete?' completed':'')+'" onclick="openModule(\''+mod.id+'\')">'+
      '<div class="lm-tag">'+mod.nsqf+' · '+mod.duration+' · '+mod.xp+' XP</div>'+
      '<div class="lm-title">'+(isComplete?'✅ ':'')+mod.title+'</div>'+
      '<div class="lm-desc">'+mod.desc+'</div>'+
      '<div class="lm-meta">'+
        '<span class="lm-badge">📖 '+total+' lessons</span>'+
        '<span class="lm-badge">🧠 Quiz included</span>'+
        (isComplete?'<span class="lm-badge" style="color:var(--green);border-color:rgba(77,216,154,.3)">✓ Complete</span>':
          done>0?'<span class="lm-badge" style="color:var(--gold);border-color:rgba(244,185,66,.3)">'+done+'/'+total+' done</span>':'')+
      '</div>'+
      '<div class="lm-progress-track"><div class="lm-progress-fill" style="width:'+modPct+'%"></div></div>'+
      '<div class="lm-progress-label"><span>'+done+' / '+total+' lessons</span><span style="color:var(--gold)">'+modPct+'%</span></div>'+
      '<button class="btn-primary" style="margin-top:14px;padding:9px 20px;font-size:13px;">'+
        (done===0?'Start Learning →':isComplete?'Review Module →':'Continue →')+
      '</button>'+
    '</div>';
  }).join('');
}

function renderLearnBadges(pct, doneLessons){
  var row = document.getElementById('learn-badges-row');
  if(!row) return;
  var badges = [];
  if(doneLessons >= 1)  badges.push({icon:'🌱',label:'First Lesson'});
  if(doneLessons >= 5)  badges.push({icon:'🔥',label:'5 Lessons Done'});
  if(doneLessons >= 10) badges.push({icon:'⚡',label:'10 Lessons Done'});
  if(pct >= 25)         badges.push({icon:'🥉',label:'25% Complete'});
  if(pct >= 50)         badges.push({icon:'🥈',label:'Halfway There'});
  if(pct >= 100)        badges.push({icon:'🏆',label:'Course Complete'});
  if(APP.learnXP >= 100) badges.push({icon:'💎',label:'100 XP Earned'});
  if(APP.learnXP >= 500) badges.push({icon:'👑',label:'500 XP Legend'});
  row.innerHTML = badges.length
    ? badges.map(function(b){return'<span class="learn-badge">'+b.icon+' '+b.label+'</span>';}).join('')
    : '<span style="font-size:13px;color:var(--muted);">Complete your first lesson to earn badges!</span>';
}

// ─── Open a module ────────────────────────────────────────────────────────
function openModule(moduleId){
  var modules = getUserModules();
  var mod = modules.find(function(m){return m.id===moduleId;});
  if(!mod) return;
  CL.moduleId = moduleId;
  CL.module = mod;
  // Open at first uncompleted lesson, or first lesson
  var firstUndone = mod.lessons.findIndex(function(l){return !APP.learnProgress[l.id];});
  CL.lessonIdx = firstUndone >= 0 ? firstUndone : 0;
  showLessonViewer();
  openLesson(CL.lessonIdx);
}

// ─── Show/hide lesson viewer ───────────────────────────────────────────────
function showLessonViewer(){
  document.getElementById('learn-modules-grid').style.display = 'none';
  document.querySelector('#page-learn > .page-header').style.display = 'none';
  document.querySelector('#page-learn > div:nth-child(2)').style.display = 'none'; // progress bar
  document.getElementById('lesson-viewer').style.display = 'block';
}

function closeLessonViewer(){
  document.getElementById('lesson-viewer').style.display = 'none';
  document.getElementById('learn-modules-grid').style.display = 'grid';
  document.querySelector('#page-learn > .page-header').style.display = 'flex';
  document.querySelector('#page-learn > div:nth-child(2)').style.display = 'block';
  renderLearnPage(); // refresh progress
}

// ─── Open a specific lesson ────────────────────────────────────────────────
function openLesson(idx){
  var mod = CL.module;
  if(!mod || idx < 0 || idx >= mod.lessons.length) return;
  CL.lessonIdx = idx;
  var lesson = mod.lessons[idx];

  // Breadcrumb
  var bc = document.getElementById('lesson-viewer-breadcrumb');
  if(bc) bc.textContent = mod.title + ' → Lesson '+(idx+1)+' of '+mod.lessons.length;

  // Video
  var iframe = document.getElementById('lesson-video');
  var placeholder = document.getElementById('lesson-video-placeholder');
  if(lesson.videoId){
    iframe.src = 'https://www.youtube.com/embed/'+lesson.videoId+'?rel=0';
    iframe.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    iframe.src = '';
    iframe.style.display = 'none';
    placeholder.style.display = 'flex';
  }

  // NSQF tag, title, desc
  document.getElementById('lesson-nsqf-tag').textContent = mod.nsqf;
  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-desc').textContent = lesson.content;

  // Key points
  var kpEl = document.getElementById('lesson-keypoints');
  if(lesson.keypoints && lesson.keypoints.length){
    kpEl.innerHTML = '<div style="font-family:\'Syne\',sans-serif;font-size:14px;font-weight:700;margin-bottom:10px;color:var(--accent);">🔑 Key Points</div>'+
      lesson.keypoints.map(function(k){return'<div class="keypoint-item">'+k+'</div>';}).join('');
  } else { kpEl.innerHTML = ''; }

  // Resources
  var resEl = document.getElementById('lesson-resources');
  if(lesson.resources && lesson.resources.length){
    resEl.innerHTML = '<div style="font-family:\'Syne\',sans-serif;font-size:14px;font-weight:700;margin-bottom:10px;color:var(--accent2);">📎 Resources</div>'+
      lesson.resources.map(function(r){
        return '<a href="'+r.url+'" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:rgba(92,225,200,.1);border:1px solid rgba(92,225,200,.2);border-radius:8px;padding:8px 14px;font-size:13px;color:var(--accent2);text-decoration:none;margin-right:8px;">🔗 '+r.title+'</a>';
      }).join('');
  } else { resEl.innerHTML = ''; }

  // XP badge
  document.getElementById('lesson-xp').textContent = Math.round(mod.xp / mod.lessons.length);

  // Complete button state
  var isDone = !!APP.learnProgress[lesson.id];
  document.getElementById('lesson-complete-btn').style.display = isDone ? 'none' : 'inline-block';
  document.getElementById('lesson-already-done').style.display = isDone ? 'block' : 'none';

  // Quiz — only show on last lesson
  var isLastLesson = idx === mod.lessons.length - 1;
  var quizWrap = document.getElementById('lesson-quiz-wrap');
  if(isLastLesson && mod.quiz && mod.quiz.length){
    quizWrap.style.display = 'block';
    renderQuiz(mod.quiz);
  } else {
    quizWrap.style.display = 'none';
  }

  // Module sidebar list
  renderModuleSidebar(mod, idx);
}

// ─── Render module lesson list in sidebar ─────────────────────────────────
function renderModuleSidebar(mod, activeIdx){
  var title = document.getElementById('module-sidebar-title');
  if(title) title.textContent = mod.title;
  var list = document.getElementById('module-lessons-list');
  if(!list) return;
  list.innerHTML = mod.lessons.map(function(l, i){
    var done = !!APP.learnProgress[l.id];
    var active = i === activeIdx;
    return '<div class="lesson-list-item'+(active?' active':'')+(done?' done':'')+'" onclick="openLesson('+i+')">'+
      '<div class="lesson-dot'+(done?' done':active?' active':'')+'"></div>'+
      '<span style="flex:1">'+(i+1)+'. '+l.title+'</span>'+
      (done?'<span style="color:var(--green);font-size:11px;">✓</span>':'')+
    '</div>';
  }).join('');
  // Module progress
  var done = moduleCompletedCount(mod);
  var pct = Math.round(done/mod.lessons.length*100);
  var pb = document.getElementById('module-progress-bar');
  var pt = document.getElementById('module-progress-text');
  if(pb) setTimeout(function(){pb.style.width=pct+'%';},100);
  if(pt) pt.textContent = done+' of '+mod.lessons.length+' lessons done';
}

// ─── Render quiz ───────────────────────────────────────────────────────────
function renderQuiz(questions){
  var el = document.getElementById('quiz-questions');
  if(!el) return;
  document.getElementById('quiz-result').style.display = 'none';
  el.innerHTML = questions.map(function(q,qi){
    return '<div class="quiz-question">'+
      '<div class="quiz-q-text">'+(qi+1)+'. '+q.q+'</div>'+
      q.options.map(function(opt,oi){
        return '<label class="quiz-option">'+
          '<input type="radio" name="q'+qi+'" value="'+oi+'">'+opt+
        '</label>';
      }).join('')+
    '</div>';
  }).join('');
}

function submitQuiz(){
  var mod = CL.module;
  if(!mod || !mod.quiz) return;
  var correct = 0;
  mod.quiz.forEach(function(q,qi){
    var sel = document.querySelector('input[name="q'+qi+'"]:checked');
    var opts = document.querySelectorAll('input[name="q'+qi+'"]');
    opts.forEach(function(opt,oi){
      var label = opt.parentElement;
      if(oi === q.answer) label.classList.add('correct');
      else if(sel && +sel.value === oi) label.classList.add('wrong');
      opt.disabled = true;
    });
    if(sel && +sel.value === q.answer) correct++;
  });
  var pct = Math.round(correct/mod.quiz.length*100);
  var res = document.getElementById('quiz-result');
  res.style.display = 'block';
  res.innerHTML = '<div style="padding:16px;border-radius:12px;background:'+(pct>=60?'rgba(77,216,154,.1)':'rgba(255,87,87,.1)')+';border:1px solid '+(pct>=60?'rgba(77,216,154,.3)':'rgba(255,87,87,.3)')+';">'+
    '<div style="font-family:\'Syne\',sans-serif;font-size:18px;font-weight:800;color:'+(pct>=60?'var(--green)':'var(--red)')+'">'+
    (pct>=60?'🎉 Great job! ':'😅 Keep studying! ')+correct+' / '+mod.quiz.length+' correct ('+pct+'%)</div>'+
    '<div style="font-size:13px;color:var(--muted);margin-top:4px;">'+
    (pct>=60?'You\'re ready to mark this module complete!':'Review the key points and try again.')+
    '</div></div>';
  if(pct>=60) toast('🎉','Quiz passed! Mark the lesson complete for XP.');
  else toast('📖','Review the material and try again!');
}

// ─── Mark lesson complete ──────────────────────────────────────────────────
function completeLesson(){
  var mod = CL.module;
  if(!mod) return;
  var lesson = mod.lessons[CL.lessonIdx];
  if(APP.learnProgress[lesson.id]) return; // already done

  // Award XP
  var xpEarned = Math.round(mod.xp / mod.lessons.length);
  APP.learnProgress[lesson.id] = { done:true, ts: Date.now() };
  APP.learnXP += xpEarned;
  saveLearnProgress();

  // Update UI
  document.getElementById('lesson-complete-btn').style.display = 'none';
  document.getElementById('lesson-already-done').style.display = 'block';
  toast('✅', '+'+xpEarned+' XP! Lesson complete 🎓');

  // Check if full module done
  var allDone = mod.lessons.every(function(l){ return !!APP.learnProgress[l.id]; });
  if(allDone){
    toast('🏆', mod.title+' module complete! +'+mod.xp+' total XP!');
    // Mark the linked skill as completed in skill tracker
    try{
      var skillName = mod.title.split('—')[0].trim().split(':')[0].trim();
      APP.skillStates[skillName] = 'completed';
      api('/user/skills',{method:'PATCH',body:JSON.stringify({[skillName]:'completed'})}).catch(function(){});
    }catch(e){}
  }

  // Auto-advance to next lesson
  var nextIdx = CL.lessonIdx + 1;
  if(nextIdx < mod.lessons.length){
    setTimeout(function(){
      openLesson(nextIdx);
      renderModuleSidebar(mod, nextIdx);
    }, 800);
  } else {
    renderModuleSidebar(mod, CL.lessonIdx);
  }
}

// Career ID → backend career ID mapping for salary calculator
var CAREER_ID_MAP = {
  1:'Data Analyst', 2:'BI Analyst', 3:'AI/ML Engineer', 4:'Data Engineer',
  5:'Product Analyst', 6:'IT Systems Analyst', 7:'Digital Marketing Analyst',
  8:'QA Test Analyst', 9:'Govt Data Officer', 10:'Cloud Architect',
  11:'Healthcare Data Analyst', 12:'Freelance Consultant',
  13:'Health Informatics Eng', 14:'Medical Device SW Eng',
  15:'Clinical Data Engineer', 16:'AI Diagnostics Engineer',
  17:'Telemedicine Developer', 18:'Biomedical AI Researcher'
};

// ─────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────
async function api(path, opts) {
  opts = opts || {};
  const headers = { 'Content-Type': 'application/json' };
  if (APP.token) headers['Authorization'] = 'Bearer ' + APP.token;
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─────────────────────────────────────────
// CURSOR
// ─────────────────────────────────────────
var cur  = document.getElementById('cursor');
var ring = document.getElementById('cursor-ring');
var cx = innerWidth/2, cy = innerHeight/2, rx = cx, ry = cy;

document.addEventListener('mousemove', function(e){ cx=e.clientX; cy=e.clientY; cur.style.left=cx+'px'; cur.style.top=cy+'px'; });
(function animRing(){ rx+=(cx-rx)*0.12; ry+=(cy-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); })();
document.addEventListener('mousedown', function(){ cur.style.width='8px'; cur.style.height='8px'; ring.style.width='48px'; ring.style.height='48px'; });
document.addEventListener('mouseup',   function(){ cur.style.width='12px'; cur.style.height='12px'; ring.style.width='36px'; ring.style.height='36px'; });

// ─────────────────────────────────────────
// PARTICLES
// ─────────────────────────────────────────
(function(){
  var canvas=document.getElementById('particle-canvas');
  var ctx=canvas.getContext('2d');
  var W=canvas.width=innerWidth, H=canvas.height=innerHeight;
  window.addEventListener('resize',function(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
  var mouse={x:W/2,y:H/2,px:W/2,py:H/2};
  var lastSpawn=0, sparkAccum=0, glowA=0, frame=0;
  var BC=[[244,185,66],[124,111,255],[92,225,200],[77,216,154],[255,140,100],[255,200,80]];
  var SC=[[255,230,120],[200,180,255],[160,255,220],[255,255,255]];
  var ambient=[], trail=[], sparks=[];
  function rnd(a,b){return a+Math.random()*(b-a);}
  function rc(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function mkA(){return{x:rnd(0,W),y:rnd(0,H),r:rnd(4,20),vx:rnd(-0.3,0.3),vy:-rnd(0.12,0.55),alpha:rnd(0.06,0.22),col:rc(BC),phase:rnd(0,Math.PI*2),wob:rnd(0.005,0.03),hollow:Math.random()<0.4};}
  for(var i=0;i<30;i++) ambient.push(mkA());
  window.addEventListener('mousemove',function(e){
    mouse.px=mouse.x; mouse.py=mouse.y; mouse.x=e.clientX; mouse.y=e.clientY;
    var dx=mouse.x-mouse.px,dy=mouse.y-mouse.py,spd=Math.sqrt(dx*dx+dy*dy),now=performance.now();
    if(spd>2&&now-lastSpawn>28){var n=Math.min(4,Math.floor(spd/7)+1);for(var k=0;k<n;k++){var col=rc(BC),ang=rnd(0,Math.PI*2),sp=Math.min(spd*0.35,3.2);trail.push({x:mouse.x,y:mouse.y,vx:Math.cos(ang)*sp*0.5+rnd(-1,1),vy:Math.sin(ang)*sp*0.5-rnd(0.4,2),r:rnd(3,12),alpha:rnd(0.3,0.7),life:1,decay:rnd(0.01,0.022),col:col,phase:rnd(0,Math.PI*2),wob:rnd(0.02,0.07),hollow:Math.random()<0.4});}lastSpawn=now;}
    sparkAccum+=spd;
    if(sparkAccum>70){var sn=Math.min(6,Math.floor(sparkAccum/45));for(var sk=0;sk<sn;sk++){var sang=rnd(0,Math.PI*2);sparks.push({x:mouse.x+rnd(-20,20),y:mouse.y+rnd(-20,20),vx:Math.cos(sang)*rnd(0.5,2.2),vy:Math.sin(sang)*rnd(0.5,2.2)-rnd(0.2,1),size:rnd(2,6),alpha:1,life:1,decay:rnd(0.018,0.03),rot:rnd(0,Math.PI),rotspd:rnd(-0.12,0.12),col:rc(SC),star:Math.random()<0.55});}sparkAccum=0;}
    glowA=Math.min(1,glowA+spd*0.035);
  });
  function drawB(b,t){if(b.alpha<=0||b.r<=0)return;var wx=b.x+Math.sin(t*b.wob+b.phase)*b.r*0.55,cr=b.col[0],cg=b.col[1],cb=b.col[2],al=(b.life===undefined?1:b.life)*b.alpha;if(al<=0)return;ctx.save();ctx.globalAlpha=al;if(b.hollow){ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgb('+cr+','+cg+','+cb+')';ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(wx-b.r*.28,b.y-b.r*.28,b.r*.18,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.45)';ctx.fill();}else{ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.fillStyle='rgba('+cr+','+cg+','+cb+',0.22)';ctx.fill();ctx.beginPath();ctx.arc(wx,b.y,b.r*.6,0,Math.PI*2);ctx.fillStyle='rgba('+cr+','+cg+','+cb+',0.14)';ctx.fill();ctx.beginPath();ctx.arc(wx-b.r*.3,b.y-b.r*.3,b.r*.24,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.38)';ctx.fill();ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgba('+cr+','+cg+','+cb+',0.55)';ctx.lineWidth=0.8;ctx.stroke();}ctx.restore();}
  function drawS(sp){ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(sp.rot);ctx.globalAlpha=sp.alpha;ctx.strokeStyle='rgb('+sp.col[0]+','+sp.col[1]+','+sp.col[2]+')';ctx.lineWidth=1.6;ctx.lineCap='round';var s=sp.size;if(sp.star){for(var i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-s);ctx.stroke();ctx.restore();}for(var i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2+Math.PI/4);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-s*.5);ctx.stroke();ctx.restore();}}else{ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.stroke();}ctx.restore();}
  function tick(){ctx.clearRect(0,0,W,H);frame++;var t=frame*.5;if(glowA>0.005){var grd=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,90);grd.addColorStop(0,'rgba(244,185,66,'+(0.13*glowA)+')');grd.addColorStop(0.45,'rgba(124,111,255,'+(0.055*glowA)+')');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(mouse.x,mouse.y,90,0,Math.PI*2);ctx.fill();ctx.save();ctx.globalAlpha=0.28*glowA;ctx.strokeStyle='rgba(244,185,66,0.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(mouse.x,mouse.y,20,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=0.14*glowA;ctx.beginPath();ctx.arc(mouse.x,mouse.y,36,0,Math.PI*2);ctx.stroke();ctx.restore();glowA*=0.93;}
    for(var i=0;i<ambient.length;i++){var b=ambient[i];b.x+=b.vx+Math.sin(t*b.wob+b.phase)*.3;b.y+=b.vy;if(b.y+b.r<0||b.x<-b.r*2||b.x>W+b.r*2){ambient[i]=mkA();ambient[i].y=H+ambient[i].r;}drawB(b,t);}
    for(var i=trail.length-1;i>=0;i--){var b=trail[i];b.x+=b.vx+Math.sin(t*b.wob+b.phase)*.4;b.y+=b.vy;b.vy+=0.035;b.vx*=0.978;b.life-=b.decay;b.r+=0.07;if(b.life<=0){trail.splice(i,1);continue;}drawB(b,t);}
    for(var i=sparks.length-1;i>=0;i--){var sp=sparks[i];sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=0.05;sp.rot+=sp.rotspd;sp.life-=sp.decay;sp.alpha=sp.life*sp.life;sp.size*=0.984;if(sp.life<=0){sparks.splice(i,1);continue;}drawS(sp);}
    for(var i=0;i<ambient.length;i++){for(var j=i+1;j<ambient.length;j++){var dx=ambient[i].x-ambient[j].x,dy=ambient[i].y-ambient[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<100){ctx.beginPath();ctx.moveTo(ambient[i].x,ambient[i].y);ctx.lineTo(ambient[j].x,ambient[j].y);ctx.strokeStyle='rgba(244,185,66,'+(0.045*(1-d/100))+')';ctx.lineWidth=0.4;ctx.stroke();}}}
    requestAnimationFrame(tick);}
  tick();
})();

// ─────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────
(function(){
  var el=document.getElementById('hero-title'); if(!el) return;
  var text='Your Future Career\nStarts Here', i=0;
  function type(){ if(i<=text.length){el.innerHTML=text.slice(0,i).replace('\n','<br>')+'<span style="display:inline-block;width:3px;height:.85em;background:var(--gold);margin-left:3px;vertical-align:middle;animation:blink 1s step-end infinite;"></span>';i++;setTimeout(type,i<20?80:45);}else{el.innerHTML=text.replace('\n','<br>');}}
  setTimeout(type,500);
})();

// ─────────────────────────────────────────
// STAT COUNTERS
// ─────────────────────────────────────────
function animateCounters(){
  [{el:'stat1',target:2.4,suffix:'M+',dec:true},{el:'stat2',target:850,suffix:'+',dec:false},{el:'stat3',target:98,suffix:'%',dec:false}].forEach(function(item){
    var el=document.getElementById(item.el); if(!el) return;
    var s=0;var timer=setInterval(function(){s+=item.target/(1400/16);if(s>=item.target){s=item.target;clearInterval(timer);}el.textContent=(item.dec?s.toFixed(1):Math.floor(s))+item.suffix;},16);
  });
}
setTimeout(animateCounters,600);

// ─────────────────────────────────────────
// TILT
// ─────────────────────────────────────────
document.addEventListener('mousemove',function(e){document.querySelectorAll('.tilt-card').forEach(function(c){var r=c.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/r.width*16,dy=(e.clientY-r.top-r.height/2)/r.height*16;c.style.transform='perspective(600px) rotateY('+dx+'deg) rotateX('+(-dy)+'deg) translateZ(6px)';});});
document.addEventListener('mouseleave',function(){document.querySelectorAll('.tilt-card').forEach(function(c){c.style.transform='';});});

// ─────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────
function launchConfetti(){
  var colors=['#F4B942','#7C6FFF','#5CE1C8','#4DD89A','#FF5757','#FFD700','#FF69B4'];
  for(var i=0;i<80;i++){var el=document.createElement('div');el.className='confetti-piece';var size=Math.random()*8+4;el.style.cssText='left:'+Math.random()*100+'vw;top:-10px;background:'+colors[Math.floor(Math.random()*colors.length)]+';width:'+size+'px;height:'+size+'px;border-radius:'+(Math.random()<.5?'50%':'2px')+';animation-duration:'+(Math.random()*2+1.5)+'s;animation-delay:'+(Math.random()*.8)+'s;';document.body.appendChild(el);setTimeout(function(e){e.remove();},3500,el);}
}

// ─────────────────────────────────────────
// THEME
// ─────────────────────────────────────────
function toggleTheme(){var isLight=document.documentElement.getAttribute('data-theme')==='light';if(isLight)document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme','light');toast('🎨',isLight?'Dark mode on':'Light mode on');}

// ─────────────────────────────────────────
// SCREENS & PAGES
// ─────────────────────────────────────────
function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});document.getElementById('screen-'+id).classList.add('active');window.scrollTo(0,0);}

function switchPage(id,el){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.getElementById('page-'+id).classList.add('active');
  if(el){document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});el.classList.add('active');}
  if(id==='market'){
  var field=(APP.user&&APP.user.profile&&APP.user.profile.field)||'other';
  var FM={cs:'Computer Science',engg:'Engineering',medical:'Medical & Health Tech',commerce:'Commerce & Business',science:'Sciences',arts:'Arts & Humanities',law:'Law',other:'All Fields'};
  var mSub=document.querySelector('#page-market .page-sub');
  if(mSub) mSub.textContent='Job demand & salary insights for '+( FM[field]||'your field');
  setTimeout(buildMarketCharts,100);
}
if(id==='learn') { renderLearnPage(); }
  if(id==='skills')  setTimeout(buildSkillsChart,100);
  if(id==='overview')setTimeout(buildRadarChart,100);
  if(id==='salary')  setTimeout(function(){loadSalaryData();buildGrowthChart();},100);
  if(id==='careers') setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);
}
function updateMobNav(idx){document.querySelectorAll('.mob-nav-btn').forEach(function(b,i){b.classList.toggle('active',i===idx);});}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
function switchTab(tab){
  document.getElementById('tab-login').classList.toggle('active',tab==='login');
  document.getElementById('tab-register').classList.toggle('active',tab==='register');
  document.getElementById('login-form').style.display=tab==='login'?'block':'none';
  document.getElementById('register-form').style.display=tab==='register'?'block':'none';
}

async function handleLogin(){
  var email=document.getElementById('login-email').value.trim();
  var password=document.getElementById('login-pwd').value;
  if(!email||!password){toast('⚠️','Please enter email and password.');return;}
  try{
    var data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    APP.token=data.token; APP.user=data.user; APP.skillStates=data.user.skillStates||{};
    localStorage.setItem('pf_token',data.token);
    if(data.user.hasProfile){await loadAllData();launchDashboard();}
    else{showScreen('onboarding');initSteps();}
  }catch(e){toast('⚠️',e.message);}
}

async function handleRegister(){
  var name=document.getElementById('reg-name').value.trim();
  var email=document.getElementById('reg-email').value.trim();
  var password=document.getElementById('reg-pwd').value;
  var phone=document.getElementById('reg-phone')?.value.trim()||'';
  if(!name||!email||!password||!phone){toast('⚠️','Please fill all fields.');return;}
  try{
    var data=await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password,phone})});
    APP.token=data.token; APP.user=data.user; APP.skillStates={};
    localStorage.setItem('pf_token',data.token);
    showScreen('onboarding');initSteps();toast('🎉','Account created! Let\'s build your profile.');
  }catch(e){toast('⚠️',e.message);}
}

function demoLogin(){
  document.getElementById('login-email').value='priya@example.com';
  document.getElementById('login-pwd').value='password';
  handleLogin();
}

// ─────────────────────────────────────────
// GOOGLE SIGN-IN
// ─────────────────────────────────────────
async function handleGoogleLogin(response) {
  try {
    toast('⏳', 'Signing in with Google...');
    var data = await api('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: response.credential })
    });
    APP.token = data.token;
    APP.user = data.user;
    APP.skillStates = data.user.skillStates || {};
    localStorage.setItem('pf_token', data.token);
    toast('🎉', 'Welcome, ' + data.user.name + '!');
    if (data.user.hasProfile) {
      await loadAllData();
      launchDashboard();
    } else {
      showScreen('onboarding');
      initSteps();
    }
  } catch(e) {
    toast('⚠️', 'Google sign-in failed: ' + e.message);
  }
}

function handleLogout(){
  APP.token=null;APP.user=null;APP.charts={};APP.compareList=[];APP.skillStates={};
  localStorage.removeItem('pf_token');
  showScreen('landing');toast('👋','Signed out. See you soon!');
}

// ─────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────
var currentStep=1;
document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){c.classList.toggle('selected');});});

function initSteps(){currentStep=0;updateProgress();for(var i=0;i<=5;i++){var el=document.getElementById('step-'+i);if(el)el.style.display=i===0?'block':'none';}}
function updateProgress(){var bar=document.getElementById('step-progress');if(!bar)return;bar.innerHTML='';var dStep=currentStep===0?1:currentStep;for(var i=1;i<=5;i++){var d=document.createElement('div');d.className='step-dot'+(i<dStep?' done':i===dStep?' active':'');bar.appendChild(d);}var lbl=document.createElement('div');lbl.className='step-label';lbl.textContent=(dStep)+'/5';bar.appendChild(lbl);}
function nextStep(n){var curr=document.getElementById('step-'+currentStep);if(curr)curr.style.display='none';currentStep=n;var nxt=document.getElementById('step-'+n);if(nxt)nxt.style.display='block';updateProgress();window.scrollTo(0,0);}
function getChips(id){return Array.from(document.querySelectorAll('#'+id+' .chip.selected')).map(function(c){return c.getAttribute('data-val');});}

async function handleResumeUpload(){
  var file=document.getElementById('resume-file').files[0];
  if(!file)return;
  document.getElementById('resume-upload-zone').innerHTML='<div style="font-size:2em;margin-bottom:10px;">⏳</div><div>Analyzing Resume with AI...</div>';
  setTimeout(function(){
    toast('✨','Resume parsed successfully!');
    // Auto-fill some default values for the demo
    document.getElementById('field').value='cs';
    document.getElementById('qualification').value='ug';
    nextStep(1);
    document.getElementById('resume-upload-zone').innerHTML='<div style="font-size:2em;margin-bottom:10px;">📄</div><div>Click to upload or drag and drop</div><div style="font-size:12px;color:var(--muted);margin-top:5px;">PDF, DOC, DOCX (Max 5MB)</div><input type="file" id="resume-file" accept=".pdf,.doc,.docx" style="display:none" onchange="handleResumeUpload()">';
  },1500);
}

// ─────────────────────────────────────────
// DYNAMIC SKILLS BASED ON FIELD
// ─────────────────────────────────────────
var FIELD_CONFIG = {
  cs: {
    sub: 'Rate your proficiency in Computer Science & IT skills',
    labels: { prog:'Programming', data:'Data Analysis', comm:'Communication', prob:'Problem Solving', tech:'Technical Skills' },
    defaults: { prog:60, data:40, comm:60, prob:70, tech:50 },
    toolsLabel: 'Languages & Technologies you know',
    tools: [
      {val:'Python',sel:false},{val:'Java',sel:false},{val:'C',sel:false},
      {val:'C++',sel:false},{val:'JavaScript',sel:false},{val:'SQL',sel:false},
      {val:'React',sel:false},{val:'Node.js',sel:false},{val:'Git',sel:false},
      {val:'Excel',sel:true},{val:'Power BI',sel:false},{val:'Cloud',sel:false},
      {val:'ML',sel:false},{val:'Docker',sel:false},{val:'Linux',sel:false}
    ]
  },
  engg: {
    sub: 'Rate your proficiency in Engineering skills',
    labels: { prog:'Programming / Coding', data:'Data & Analysis', comm:'Communication', prob:'Problem Solving', tech:'Technical / Domain Skills' },
    defaults: { prog:50, data:40, comm:60, prob:70, tech:60 },
    toolsLabel: 'Engineering Tools & Languages you know',
    tools: [
      {val:'C',sel:false},{val:'C++',sel:false},{val:'Python',sel:false},
      {val:'MATLAB',sel:false},{val:'AutoCAD',sel:false},{val:'SolidWorks',sel:false},
      {val:'Excel',sel:true},{val:'Statistics',sel:true},{val:'Embedded Systems',sel:false},
      {val:'PLC Programming',sel:false},{val:'Circuit Design',sel:false},{val:'CAD Software',sel:false},
      {val:'SQL',sel:false},{val:'Cloud',sel:false},{val:'Project Management',sel:false}
    ]
  },
  commerce: {
    sub: 'Rate your proficiency in Commerce & Business skills',
    labels: { prog:'Digital / Tech Skills', data:'Data & Financial Analysis', comm:'Communication & Presentation', prob:'Problem Solving', tech:'Business & Domain Knowledge' },
    defaults: { prog:30, data:50, comm:70, prob:60, tech:65 },
    toolsLabel: 'Business Tools you know',
    tools: [
      {val:'Excel',sel:true},{val:'Tally',sel:false},{val:'Statistics',sel:true},
      {val:'Power BI',sel:false},{val:'Google Analytics',sel:false},{val:'SQL',sel:false},
      {val:'Accounting Software',sel:false},{val:'MS Office',sel:true},{val:'CRM Tools',sel:false},
      {val:'Tableau',sel:false},{val:'Python',sel:false},{val:'QuickBooks',sel:false},
      {val:'SAP',sel:false},{val:'Salesforce',sel:false},{val:'Financial Modeling',sel:false}
    ]
  },
  science: {
    sub: 'Rate your proficiency in Science & Research skills',
    labels: { prog:'Programming / Coding', data:'Data Analysis & Statistics', comm:'Communication & Writing', prob:'Problem Solving & Research', tech:'Lab & Technical Skills' },
    defaults: { prog:40, data:60, comm:60, prob:65, tech:55 },
    toolsLabel: 'Science & Research Tools you know',
    tools: [
      {val:'Python',sel:false},{val:'R Programming',sel:false},{val:'SPSS',sel:false},
      {val:'MATLAB',sel:false},{val:'Excel',sel:true},{val:'Statistics',sel:true},
      {val:'C',sel:false},{val:'Lab Equipment',sel:false},{val:'LaTeX',sel:false},
      {val:'SQL',sel:false},{val:'Tableau',sel:false},{val:'Jupyter Notebook',sel:false},
      {val:'Bioinformatics Tools',sel:false},{val:'ImageJ',sel:false},{val:'Origin',sel:false}
    ]
  },
  arts: {
    sub: 'Rate your proficiency in Arts & Humanities skills',
    labels: { prog:'Digital & Tech Skills', data:'Research & Analysis', comm:'Communication & Writing', prob:'Critical Thinking', tech:'Creative & Domain Skills' },
    defaults: { prog:25, data:40, comm:75, prob:60, tech:65 },
    toolsLabel: 'Tools & Platforms you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Google Workspace',sel:true},{val:'Social Media',sel:false},
      {val:'Content Writing',sel:false},{val:'Canva',sel:false},{val:'WordPress',sel:false},
      {val:'Excel',sel:false},{val:'Photography',sel:false},{val:'Video Editing',sel:false},
      {val:'SEO',sel:false},{val:'Adobe Photoshop',sel:false},{val:'Figma',sel:false},
      {val:'Premiere Pro',sel:false},{val:'Copywriting',sel:false},{val:'Public Speaking',sel:false}
    ]
  },
  medical: {
    sub: 'Rate your proficiency in Healthcare & Medical skills',
    labels: { prog:'Digital / Tech Skills', data:'Data & Clinical Analysis', comm:'Patient Communication', prob:'Clinical Problem Solving', tech:'Medical & Domain Knowledge' },
    defaults: { prog:25, data:45, comm:70, prob:65, tech:70 },
    toolsLabel: 'Medical & Healthcare Tools you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Excel',sel:true},{val:'HMIS Systems',sel:false},
      {val:'Medical Coding ICD-10',sel:false},{val:'Statistics',sel:false},{val:'EHR Software',sel:false},
      {val:'Lab Equipment',sel:false},{val:'SQL',sel:false},{val:'Power BI',sel:false},
      {val:'Python',sel:false},{val:'R Programming',sel:false},{val:'SPSS',sel:false},
      {val:'HL7 FHIR',sel:false},{val:'DICOM',sel:false},{val:'SAS',sel:false}
    ]
  },
  law: {
    sub: 'Rate your proficiency in Legal & Professional skills',
    labels: { prog:'Digital & Tech Skills', data:'Research & Analysis', comm:'Communication & Advocacy', prob:'Legal Problem Solving', tech:'Legal Domain Knowledge' },
    defaults: { prog:25, data:50, comm:75, prob:65, tech:70 },
    toolsLabel: 'Legal & Professional Tools you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Legal Research Tools',sel:false},{val:'Excel',sel:true},
      {val:'Case Management Software',sel:false},{val:'Documentation',sel:false},{val:'Google Workspace',sel:true},
      {val:'Statistics',sel:false},{val:'Presentation Tools',sel:false},{val:'Contract Drafting',sel:false},
      {val:'LexisNexis',sel:false},{val:'Westlaw',sel:false},{val:'Compliance Tools',sel:false},
      {val:'SQL',sel:false},{val:'Python',sel:false},{val:'Canva',sel:false}
    ]
  },
  other: {
    sub: 'Rate your proficiency in key skill areas',
    labels: { prog:'Digital & Tech Skills', data:'Data & Analysis', comm:'Communication', prob:'Problem Solving', tech:'Domain / Specialist Skills' },
    defaults: { prog:35, data:35, comm:65, prob:60, tech:55 },
    toolsLabel: 'Tools & Skills you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Excel',sel:true},{val:'Google Workspace',sel:true},
      {val:'Python',sel:false},{val:'SQL',sel:false},{val:'Canva',sel:false},
      {val:'Social Media',sel:false},{val:'Statistics',sel:false},{val:'Project Management',sel:false},
      {val:'C',sel:false},{val:'C++',sel:false},{val:'Communication',sel:false},
      {val:'Video Editing',sel:false},{val:'WordPress',sel:false},{val:'Figma',sel:false}
    ]
  }
};
  

function goToSkills() {
  var field = document.getElementById('field').value || 'cs';
  var config = FIELD_CONFIG[field] || FIELD_CONFIG['other'];

  // Update subtitle
  var subEl = document.getElementById('step2-sub');
  if (subEl) subEl.textContent = config.sub;

  // Update slider labels
  document.getElementById('lbl-prog').innerHTML = config.labels.prog + ' <span id="s-prog-val">' + config.defaults.prog + '</span>%';
  document.getElementById('lbl-data').innerHTML = config.labels.data + ' <span id="s-data-val">' + config.defaults.data + '</span>%';
  document.getElementById('lbl-comm').innerHTML = config.labels.comm + ' <span id="s-comm-val">' + config.defaults.comm + '</span>%';
  document.getElementById('lbl-prob').innerHTML = config.labels.prob + ' <span id="s-prob-val">' + config.defaults.prob + '</span>%';
  document.getElementById('lbl-tech').innerHTML = config.labels.tech + ' <span id="s-tech-val">' + config.defaults.tech + '</span>%';

  // Update slider default values
  document.getElementById('s-prog').value = config.defaults.prog;
  document.getElementById('s-data').value = config.defaults.data;
  document.getElementById('s-comm').value = config.defaults.comm;
  document.getElementById('s-prob').value = config.defaults.prob;
  document.getElementById('s-tech').value = config.defaults.tech;

  // Re-attach oninput handlers since innerHTML replaced the spans
  document.getElementById('s-prog').oninput = function(){ document.getElementById('s-prog-val').textContent = this.value; };
  document.getElementById('s-data').oninput = function(){ document.getElementById('s-data-val').textContent = this.value; };
  document.getElementById('s-comm').oninput = function(){ document.getElementById('s-comm-val').textContent = this.value; };
  document.getElementById('s-prob').oninput = function(){ document.getElementById('s-prob-val').textContent = this.value; };
  document.getElementById('s-tech').oninput = function(){ document.getElementById('s-tech-val').textContent = this.value; };

  // Update tools label
  var toolsLabel = document.getElementById('tools-label');
  if (toolsLabel) toolsLabel.textContent = config.toolsLabel;

  // Render tool chips dynamically
  var chipsContainer = document.getElementById('tools-chips');
  chipsContainer.innerHTML = config.tools.map(function(t) {
    return '<div class="chip' + (t.sel ? ' selected' : '') + '" data-val="' + t.val + '">' + t.val + '</div>';
  }).join('');

  // Re-attach chip click handlers
  chipsContainer.querySelectorAll('.chip').forEach(function(c) {
    c.addEventListener('click', function() { c.classList.toggle('selected'); });
  });

  nextStep(2);
}

async function submitProfile(){
  var profile={
    qualification:document.getElementById('qualification').value,
    field:document.getElementById('field').value,
    year:document.getElementById('grad-year').value,
    skills:{prog:+document.getElementById('s-prog').value,data:+document.getElementById('s-data').value,comm:+document.getElementById('s-comm').value,prob:+document.getElementById('s-prob').value,tech:+document.getElementById('s-tech').value},
    tools:getChips('tools-chips'),interests:getChips('interest-chips'),goals:getChips('goal-chips'),
    timeline:document.getElementById('timeline').value,learning:getChips('learn-chips'),hours:document.getElementById('hours').value
  };

  document.getElementById('loading').style.display='flex';
  [100,700,1400,2100,2700].forEach(function(t,i){setTimeout(function(){var el=document.getElementById('ls'+(i+1));if(el)el.classList.add('show');},t);});

  try{
    await api('/user/profile',{method:'POST',body:JSON.stringify(profile)});
    APP.user.profile=profile; APP.user.hasProfile=true;
    await loadAllData();
  }catch(e){
    APP.user.profile=profile;APP.user.hasProfile=true;
    await loadAllData();
  }

  setTimeout(function(){
    document.getElementById('loading').style.display='none';
    launchDashboard();launchConfetti();toast('✨','Your personalised career path is ready!');
  },3400);
}

// ─────────────────────────────────────────
// LOAD ALL DATA FROM BACKEND
// ─────────────────────────────────────────

async function loadAllData(){
  try{
    var [careersData, skillsData, roadmapData, coursesData, marketData, tipData] = await Promise.all([
      api('/careers/match'),
      api('/skills/analysis'),
      api('/roadmap'),
      api('/courses'),
      api('/market'),
      api('/tips')
    ]);
    APP.careers    = careersData.careers;
    APP.skillGaps  = { have: skillsData.have||[], need: skillsData.need||[], learning: skillsData.learning||[] };
    APP.matchScore = skillsData.match_score || 85;
    APP.topCareerName = skillsData.career ? skillsData.career.name : 'Career';
    APP.topCareerId   = skillsData.career ? skillsData.career.id  : 1;
    APP.roadmap    = roadmapData.roadmap;
    APP.courses    = coursesData.courses;
    APP.market     = marketData;
    APP.dailyTip   = tipData.tip;

    // ── Inject field-specific market data ──────────────────────────────
    var field = (APP.user && APP.user.profile && APP.user.profile.field) || 'other';
    var fd = FIELD_DATA[field] || FIELD_DATA['other'];
    // Override market insights and whatsNew with field-relevant data
    APP.market.insights = fd.insights;
    APP.market.whatsNew = fd.whatsNew;
    APP.market.trends.demandLabels = fd.demandLabels;
    APP.market.trends.demandValues = fd.demandValues;
    APP.market.trends.salaryRoles  = fd.salaryRoles;
    APP.market.trends.salaryMin    = fd.salaryMin;
    APP.market.trends.salaryMax    = fd.salaryMax;
    APP.fieldData = fd;
    // ──────────────────────────────────────────────────────────────────

  }catch(e){
    console.warn('Backend unreachable, using fallback:', e.message);
    useFallbackData();
  }
}
// ─────────────────────────────────────────
// LAUNCH DASHBOARD
// ─────────────────────────────────────────
function launchDashboard(){
  var u=APP.user, name=u?u.name:'Learner', first=name.split(' ')[0];
  var returning=!!(u&&u.hasProfile);
  // Restore XP badge
var badge = document.getElementById('learn-xp-badge');
if(badge) badge.textContent = APP.learnXP + ' XP';
var disp = document.getElementById('learn-xp-display');
if(disp) disp.textContent = APP.learnXP + ' XP earned';
  document.getElementById('welcome-title').textContent=(returning?'Welcome back, ':'Welcome, ')+first+' 👋';
  document.getElementById('sidebar-name').textContent=name;
  document.getElementById('sidebar-avatar').textContent=first[0];
  document.getElementById('profile-avatar').textContent=first[0];
  document.getElementById('profile-name').textContent=name;
  document.getElementById('profile-email').textContent=u?u.email:'';

  var QM={ug:"Bachelor's Degree",pg:"Master's Degree",diploma:"Diploma/ITI",'10th':'Class 10','12th':'Class 12',phd:'PhD'};
  var FM={cs:'Computer Science / IT',engg:'Engineering',commerce:'Commerce',science:'Sciences',arts:'Arts',medical:'Medical',law:'Law',other:'Other'};
  var p=u&&u.profile;
  if(p){
    document.getElementById('p-qual').textContent=QM[p.qualification]||p.qualification||'—';
    document.getElementById('p-field').textContent=FM[p.field]||p.field||'—';
    document.getElementById('p-year').textContent=p.year||'—';
    document.getElementById('p-goal').textContent=(p.goals||[]).join(', ')||'—';
    document.getElementById('p-timeline').textContent=p.timeline==='6m'?'6 months':p.timeline||'—';
    document.getElementById('p-learn').textContent=(p.learning||[]).join(', ')||'—';
    document.getElementById('p-hours').textContent=p.hours==='10'?'5–10 hrs':(p.hours?p.hours+' hrs':'—');
  }

  // Update top match metric
  var topCareer=APP.careers[0];
  if(topCareer){
    var topMatchEl=document.getElementById('top-match-val');
    if(topMatchEl) topMatchEl.textContent=topCareer.score+'%';
    // Update subtext
    var topEl=topMatchEl&&topMatchEl.nextElementSibling;
    if(topEl) topEl.textContent=topCareer.name;
  }

  // Update skill match score display
  var msEl=document.getElementById('match-score-live');
  if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
  var targetEl=document.querySelector('.skills-target');
  if(targetEl) targetEl.textContent='Target: '+APP.topCareerName;

  renderStreak(u?(u.streak||1):1);
  renderDailyTip();
  renderWhatsNew();
  renderTopCareers();
  renderAllCareers();
  renderMiniRoadmap();
  renderFullRoadmap();
  renderSkillsBoxes();
  renderCourses();
  renderMarketInsights();
  renderHeatmap();
  renderCompletionRing(p?82:30);

  showScreen('dashboard');
  setTimeout(function(){buildRadarChart();},300);
  setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},600);
  if(returning) toast('👋','Welcome back! Career matches updated from your profile.');
}

// ─────────────────────────────────────────
// RENDER HELPERS
// ─────────────────────────────────────────
function renderStreak(n){
  var c=document.getElementById('streak-count'),d=document.getElementById('streak-dots');
  if(c) c.textContent=n+' Day Streak!';
  if(d){d.innerHTML='';for(var i=0;i<7;i++){var dot=document.createElement('div');dot.className='streak-day'+(i<n?' active':'');d.appendChild(dot);}}
}
function renderDailyTip(){var el=document.getElementById('daily-tip');if(el)el.textContent=APP.dailyTip||'Keep learning every day!';}
function renderWhatsNew(){
  var el=document.getElementById('whats-new-list');
  var items=(APP.market&&APP.market.whatsNew)||FALLBACK_WHATS_NEW;
  if(el) el.innerHTML=items.map(function(w){return'<div class="new-item"><div class="new-dot"></div><span>'+w+'</span></div>';}).join('');
}
function renderCompletionRing(pct){
  setTimeout(function(){
    var ring=document.getElementById('comp-ring'),pctEl=document.getElementById('comp-pct'),lbl=document.getElementById('comp-label');
    if(ring) ring.style.strokeDashoffset=213.6-(213.6*pct/100);
    if(pctEl) pctEl.textContent=pct+'%';
    if(lbl)  lbl.textContent=pct>=80?'Looking great! 🌟':pct>=50?'Coming along nicely':'Getting started';
  },600);
}

function careerCard(c){
  var inCmp=APP.compareList.indexOf(c.id)>=0;
  return '<div class="career-card tilt-card">'
    +'<div class="career-rank">Match #'+(c.rank||c.id)+' · '+c.nsqf+' · '+c.openings+' openings</div>'
    +'<div class="career-name">'+c.name+'</div>'
    +'<div class="match-bar-track"><div class="match-bar" data-w="'+c.score+'" style="width:0%"></div></div>'
    +'<div class="match-score"><span class="lbl">Match Score</span><span class="val">'+c.score+'%</span></div>'
    +'<div class="career-tags">'+c.tags.map(function(t){return'<span class="career-tag">'+t+'</span>';}).join('')
    +'<span class="career-tag" style="color:var(--green)">'+c.salary+'</span>'
    +'<span class="career-tag" style="color:var(--accent2)">'+c.growth+'</span></div>'
    +'<button class="compare-btn'+(inCmp?' selected':'')+'" onclick="toggleCompare('+c.id+')">'+(inCmp?'✓ In Compare':'+ Compare')+'</button>'
    +'</div>';
}
function renderTopCareers(){var el=document.getElementById('top-careers');if(el&&APP.careers.length)el.innerHTML=APP.careers.slice(0,3).map(careerCard).join('');}
function renderAllCareers(){var el=document.getElementById('all-careers');if(el&&APP.careers.length)el.innerHTML=APP.careers.map(careerCard).join('');}

function toggleCompare(id){
  var idx=APP.compareList.indexOf(id);
  if(idx>=0)APP.compareList.splice(idx,1);
  else if(APP.compareList.length<2)APP.compareList.push(id);
  else{toast('ℹ️','Select up to 2 careers to compare.');return;}
  renderAllCareers();
  setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);
  if(APP.compareList.length===2)buildCompare();
  else document.getElementById('compare-panel').classList.remove('active');
}
function clearCompare(){APP.compareList=[];renderAllCareers();document.getElementById('compare-panel').classList.remove('active');setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);}
function buildCompare(){
  var a=APP.careers.find(function(c){return c.id===APP.compareList[0];}),b=APP.careers.find(function(c){return c.id===APP.compareList[1];});
  if(!a||!b)return;
  var panel=document.getElementById('compare-panel'),grid=document.getElementById('compare-grid');
  panel.classList.add('active');
  function col(c){return'<div class="compare-col"><div class="compare-col-title">'+c.name+'</div>'
    +'<div class="compare-row"><span class="compare-lbl">Match Score</span><span>'+c.score+'%</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">NSQF Level</span><span>'+c.nsqf+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Salary Range</span><span>'+c.salary+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Demand Growth</span><span style="color:var(--green)">'+c.growth+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Open Roles</span><span>'+c.openings+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Key Skills</span><span>'+c.tags.join(', ')+'</span></div>'
    +'</div>';}
  grid.innerHTML=col(a)+col(b);
}

function renderMiniRoadmap(){
  var el=document.getElementById('mini-roadmap');if(!el)return;
  el.innerHTML=(APP.roadmap||[]).slice(0,3).map(function(s){return'<div class="roadmap-step"><div class="step-circle '+s.state+'">'+(s.state==='done'?'✓':s.step)+'</div><div class="step-body"><div class="step-nsqf">'+s.nsqf+'</div><div class="step-title">'+s.title+'</div></div></div>';}).join('');
}
function renderFullRoadmap(){
  var el=document.getElementById('full-roadmap');if(!el)return;
  el.innerHTML=(APP.roadmap||[]).map(function(s){return'<div class="roadmap-step"><div class="step-circle '+s.state+'">'+(s.state==='done'?'✓':s.step)+'</div><div class="step-body"><div class="step-nsqf">'+s.nsqf+'</div><div class="step-title">'+s.title+'</div><div class="step-desc">'+s.desc+'</div></div></div>';}).join('');
}

// ─── SKILLS - driven by backend gap analysis ───
function renderSkillsBoxes(){
  var haveEl=document.getElementById('skills-have'),needEl=document.getElementById('skills-need');
  if(haveEl) haveEl.innerHTML=APP.skillGaps.have.map(function(s){
    return'<div class="skill-pill"><span class="skill-check has">✓</span>'+(s.name||s)+'</div>';
  }).join('');
  var allNeed=[...APP.skillGaps.need,...APP.skillGaps.learning];
  if(needEl) needEl.innerHTML=allNeed.map(function(s){
    var sname=s.name||s, state=APP.skillStates[sname]||s.state||'needs';
    var icon=state==='completed'?'✓':state==='learning'?'~':'✗';
    var cls=state==='completed'?'has':state==='learning'?'learning-icon':'needs';
    return'<div class="skill-pill '+state+'"><span class="skill-check '+cls+'">'+icon+'</span>'+sname
      +'<button class="skill-action" onclick="cycleSkill(\''+sname+'\')">'+
      (state==='needs'?'Start Learning':state==='learning'?'Mark Done':'Reset')+'</button></div>';
  }).join('');
  updateMatchScore();
}

async function cycleSkill(sname){
  var cur=APP.skillStates[sname]||'needs';
  APP.skillStates[sname]=cur==='needs'?'learning':cur==='learning'?'completed':'needs';
  renderSkillsBoxes();
  if(APP.charts.skillsBar){APP.charts.skillsBar.destroy();delete APP.charts.skillsBar;buildSkillsChart();}
  toast(APP.skillStates[sname]==='learning'?'📖':'✅',sname+' marked as '+APP.skillStates[sname]+'!');
  try{
    await api('/user/skills',{method:'PATCH',body:JSON.stringify({[sname]:APP.skillStates[sname]})});
    // Reload skill analysis to get updated score from backend
    var updated=await api('/skills/analysis');
    APP.matchScore=updated.match_score||APP.matchScore;
    var msEl=document.getElementById('match-score-live');
    if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
  }catch(e){}
}

function updateMatchScore(){
  var msEl=document.getElementById('match-score-live');
  if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
}

function renderCourses(){
  var el=document.getElementById('courses-grid');if(!el)return;
  el.innerHTML=(APP.courses||[]).map(function(c){return'<div class="course-card"><div class="course-provider">'+c.provider+'</div><div class="course-name">'+c.name+'</div><div class="course-meta"><span class="cbadge nsqf">'+c.nsqf+'</span><span class="cbadge dur">⏱ '+c.dur+'</span>'+(c.free?'<span class="cbadge free">Free</span>':'')+'</div></div>';}).join('');
}
function renderMarketInsights(){
  var el=document.getElementById('market-insights');if(!el||!APP.market)return;
  el.innerHTML=APP.market.insights.map(function(i){return'<div class="insight-card"><div class="insight-label">'+i.label+'</div><div class="insight-val">'+i.val+'</div><div class="insight-sub">'+i.sub+'</div></div>';}).join('');
}
function renderHeatmap(){
  var el=document.getElementById('heatmap-grid');if(!el||!APP.market)return;
  el.innerHTML=APP.market.heatmap.map(function(c){var r=Math.floor(30+(244-30)*c.heat),g=Math.floor(30+(185-30)*c.heat*.5),b=Math.floor(50+(66-50)*c.heat*.3);return'<div class="heatmap-city" style="background:rgba('+r+','+g+','+b+',0.25);border:1px solid rgba(244,185,66,'+(c.heat*0.4)+')">'+'<div class="city-name">'+c.city+'</div><div class="city-jobs">'+c.jobs+' jobs</div></div>';}).join('');
}

// ─────────────────────────────────────────
// SALARY CALCULATOR  - calls backend
// ─────────────────────────────────────────
var salaryData = null;

async function loadSalaryData(){
  var field = (APP.user && APP.user.profile && APP.user.profile.field) || 'other';
  var fd = FIELD_DATA[field] || FIELD_DATA['other'];

  // Rebuild the role dropdown based on field of study
  var roleSelect = document.getElementById('calc-role');
  if(roleSelect){
    roleSelect.innerHTML = fd.careerIds.map(function(id){
      return '<option value="'+id+'">'+(CAREER_ID_MAP[id]||'Role '+id)+'</option>';
    }).join('');
  }

  var careerId = roleSelect ? roleSelect.value : fd.careerIds[0];
  var city = document.getElementById('calc-city')?.value || 'bangalore';
  try{
    var data = await api('/salary?career_id='+careerId+'&city='+city);
    salaryData = data;
    renderSalaryResult(data);
    renderSalaryBreakdown(data);
    if(APP.charts.growth){APP.charts.growth.destroy(); delete APP.charts.growth;}
    buildGrowthChart(data.growth_projection);
  }catch(e){calcSalaryFallback();}
}



function renderSalaryResult(data){
  var resEl=document.getElementById('salary-result'),noteEl=document.getElementById('salary-note');
  if(resEl) resEl.textContent='₹'+data.salary_range.lo+' – '+data.salary_range.hi+' LPA';
  if(noteEl) noteEl.textContent='Based on '+data.experience_years+' yrs experience in '+data.city.charAt(0).toUpperCase()+data.city.slice(1)+'. NSQF-aligned package.';
}
function renderSalaryBreakdown(data){
  var bd=document.getElementById('salary-breakdown');
  if(!bd)return;
  bd.innerHTML=[{label:'Monthly (Avg)',val:'₹'+data.monthly_avg.toLocaleString('en-IN')},{label:'In-hand (~70%)',val:'₹'+data.monthly_inhand.toLocaleString('en-IN')},{label:'With Bonus',val:'₹'+data.with_bonus+' LPA'}]
    .map(function(x){return'<div class="breakdown-card"><div class="breakdown-label">'+x.label+'</div><div class="breakdown-val">'+x.val+'</div></div>';}).join('');
}

function calcSalary(){loadSalaryData();}

// Fallback if backend is down
var SALARY_BASE_FB={da:{0:[5.5,8],2:[8,12],4:[12,18],7:[18,28]},bi:{0:[6,9],2:[9,14],4:[14,22],7:[22,35]},ds:{0:[8,12],2:[12,20],4:[20,30],7:[30,45]},ml:{0:[8,13],2:[13,22],4:[22,35],7:[35,55]},de:{0:[7,11],2:[11,18],4:[18,28],7:[28,42]},ca:{0:[10,16],2:[16,26],4:[26,40],7:[40,60]}};
var CITY_MULT_FB={bangalore:1.15,hyderabad:1.05,mumbai:1.1,delhi:1.08,pune:1.0,chennai:0.95,tier2:0.75};
function calcSalaryFallback(){
  var role=document.getElementById('calc-role')?.value||'da';
  var city=document.getElementById('calc-city')?.value||'bangalore';
  var exp=document.getElementById('calc-exp')?.value||'0';
  var cityEl=document.getElementById('calc-city');
  var cityName=cityEl?cityEl.options[cityEl.selectedIndex].text:'Bengaluru';
  var base=SALARY_BASE_FB[role][exp],mult=CITY_MULT_FB[city];
  var lo=(base[0]*mult).toFixed(1),hi=(base[1]*mult).toFixed(1);
  var avg=(+lo+(+hi))/2;
  var resEl=document.getElementById('salary-result'),noteEl=document.getElementById('salary-note');
  if(resEl) resEl.textContent='₹'+lo+' – '+hi+' LPA';
  if(noteEl) noteEl.textContent='Estimated for '+cityName+'.';
  var bd=document.getElementById('salary-breakdown');
  if(bd) bd.innerHTML=[{label:'Monthly (Avg)',val:'₹'+Math.round(avg*100000/12).toLocaleString('en-IN')},{label:'In-hand (~70%)',val:'₹'+Math.round(avg*0.7*100000/12).toLocaleString('en-IN')},{label:'With Bonus',val:'₹'+(+hi*1.15).toFixed(1)+' LPA'}].map(function(x){return'<div class="breakdown-card"><div class="breakdown-label">'+x.label+'</div><div class="breakdown-val">'+x.val+'</div></div>';}).join('');
}

// ─────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────
var CD={grid:'rgba(255,255,255,0.06)',tick:'rgba(255,255,255,0.4)',font:{family:'DM Sans,sans-serif',size:12}};

function buildRadarChart(){
  if(APP.charts.radar)return;
  var el=document.getElementById('radar-chart');if(!el)return;
  var p=APP.user&&APP.user.profile&&APP.user.profile.skills||{prog:60,data:40,comm:75,prob:70,tech:45};
  APP.charts.radar=new Chart(el,{type:'radar',data:{labels:['Programming','Data Analysis','Communication','Problem Solving','Tech Writing'],datasets:[{label:'Your Level',data:[p.prog,p.data,p.comm,p.prob,p.tech],fill:true,backgroundColor:'rgba(124,111,255,0.2)',borderColor:'rgba(124,111,255,0.8)',pointBackgroundColor:'#7C6FFF',pointRadius:4},{label:'Required',data:[80,85,70,80,60],fill:true,backgroundColor:'rgba(244,185,66,0.1)',borderColor:'rgba(244,185,66,0.6)',borderDash:[5,4],pointBackgroundColor:'#F4B942',pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},scales:{r:{grid:{color:CD.grid},ticks:{display:false},pointLabels:{color:CD.tick,font:CD.font},suggestedMin:0,suggestedMax:100}}}});
}
function buildSkillsChart(){
  if(APP.charts.skillsBar){APP.charts.skillsBar.destroy();delete APP.charts.skillsBar;}
  var el=document.getElementById('skills-bar-chart');if(!el)return;

  // Show ALL skills — both have and need — for a complete picture
  var allSkills=[...APP.skillGaps.have,...APP.skillGaps.need,...APP.skillGaps.learning];
  if(!allSkills.length) return;

  var labels=allSkills.map(function(s){return s.name||s;}).slice(0,10);
  var yourVals=labels.map(function(n){
    var st=APP.skillStates[n]||'needs';
    // If in "have" list, show high value
    var inHave=APP.skillGaps.have.find(function(s){return(s.name||s)===n;});
    if(inHave) return 85;
    return st==='completed'?95:st==='learning'?50:15;
  });
  var reqVals=labels.map(function(){return 80;});

  APP.charts.skillsBar=new Chart(el,{
    type:'bar',
    data:{
      labels:labels,
      datasets:[
        {label:'Your Level',data:yourVals,backgroundColor:'rgba(124,111,255,0.7)',borderRadius:6,borderSkipped:false},
        {label:'Required',data:reqVals,backgroundColor:'rgba(244,185,66,0.3)',borderRadius:6,borderSkipped:false}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,indexAxis:'y',
      plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},
      scales:{
        x:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font},suggestedMax:100},
        y:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}}
      }
    }
  });
}
function buildMarketCharts(){
  var t = APP.market && APP.market.trends;
  if(!t) return;

  // Always destroy and rebuild so field-specific data shows
  if(APP.charts.demand){ APP.charts.demand.destroy(); delete APP.charts.demand; }
  if(APP.charts.salaryChart){ APP.charts.salaryChart.destroy(); delete APP.charts.salaryChart; }

  var el = document.getElementById('demand-chart');
  if(el) APP.charts.demand = new Chart(el,{
    type:'bar',
    data:{
      labels: t.demandLabels,
      datasets:[{
        label:'Job Postings (thousands)',
        data: t.demandValues,
        backgroundColor:['rgba(244,185,66,.85)','rgba(124,111,255,.85)','rgba(92,225,200,.85)','rgba(255,87,87,.7)','rgba(244,185,66,.6)','rgba(124,111,255,.6)','rgba(92,225,200,.6)','rgba(77,216,154,.6)'],
        borderRadius:8, borderSkipped:false
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{x:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font}}}}
  });

  var el2 = document.getElementById('salary-chart');
  if(el2) APP.charts.salaryChart = new Chart(el2,{
    type:'bar',
    data:{
      labels: t.salaryRoles,
      datasets:[
        {label:'Min LPA', data:t.salaryMin, backgroundColor:'rgba(124,111,255,0.5)', borderRadius:4},
        {label:'Max LPA', data:t.salaryMax, backgroundColor:'rgba(244,185,66,0.75)', borderRadius:4}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},
      scales:{x:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font}}}}
  });
}


function buildGrowthChart(proj){
  if(APP.charts.growth)return;
  var el=document.getElementById('growth-chart');if(!el)return;
  var labels=proj?proj.map(function(p){return p.label;}):['Now','Year 1','Year 2','Year 3','Year 4','Year 5'];
  var vals=proj?proj.map(function(p){return p.avg;}):[6.5,8,10.5,14,18,24];
  APP.charts.growth=new Chart(el,{type:'line',data:{labels:labels,datasets:[{label:'Projected Salary (₹ LPA)',data:vals,fill:true,backgroundColor:'rgba(244,185,66,0.12)',borderColor:'rgba(244,185,66,0.9)',pointBackgroundColor:'#F4B942',pointRadius:5,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font}}},scales:{x:{grid:{color:CD.grid},ticks:{color:CD.tick}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,callback:function(v){return'₹'+v+' L';}}}}}});
}

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────
var toastTimer;
function toast(icon,msg){clearTimeout(toastTimer);document.getElementById('toast-icon').textContent=icon;document.getElementById('toast-msg').textContent=msg;var el=document.getElementById('toast');el.classList.add('show');toastTimer=setTimeout(function(){el.classList.remove('show');},3500);}

// ─────────────────────────────────────────
// FALLBACK DATA (if backend is offline)
// ─────────────────────────────────────────
function generateResume() {
  var user = APP.user;
  if (!user || !user.profile) {
    toast('⚠️', 'Please complete your profile first.');
    return;
  }
  var p = user.profile;
  
  // Format education
  var qualMap = { '10th': '10th Standard', '12th': '12th Standard', 'diploma': 'Diploma', 'ug': "Bachelor's Degree", 'pg': "Master's Degree", 'phd': 'PhD/Doctorate' };
  var fieldMap = { 'cs': 'Computer Science / IT', 'engg': 'Engineering', 'commerce': 'Commerce / Business', 'science': 'Sciences', 'arts': 'Arts & Humanities', 'medical': 'Medical', 'law':'Law', 'other':'Other' };
  
  var edu = `${qualMap[p.qualification] || p.qualification} in ${fieldMap[p.field] || p.field}\nGraduation: ${p.year || 'N/A'}`;
  
  // Formatting skills 
  var skillsObj = p.skills || {};
  var skillsList = [
    `Programming/Tech: ${skillsObj.prog || 0}%`,
    `Data Analysis: ${skillsObj.data || 0}%`,
    `Communication: ${skillsObj.comm || 0}%`,
    `Problem Solving: ${skillsObj.prob || 0}%`,
    `Domain Skills: ${skillsObj.tech || 0}%`
  ].join('\n  • ');

  // Tools & Technologies
  var toolsList = (p.tools && p.tools.length > 0) ? p.tools.join(', ') : 'None specified';
  
  // Goals & Interests
  var objList = [];
  if (p.goals && p.goals.length) objList.push("Goals: " + p.goals.join(', '));
  if (p.interests && p.interests.length) objList.push("Interests: " + p.interests.join(', '));
  var objText = objList.join('\n') || "Seeking opportunities to apply my skills.";

  var resumeText = `
======================================================
                 ${user.name.toUpperCase()}
           ${user.email} | ${user.phone || 'Phone not provided'} | PathForge Profile
======================================================

[ PROFESSIONAL SUMMARY & OBJECTIVES ]
${objText}

[ EDUCATION ]
${edu}

[ CORE SKILLS & PROFICIENCIES ]
  • ${skillsList}

[ TOOLS & TECHNOLOGIES ]
${toolsList}

[ PREFERRED LEARNING STYLE ]
${(p.learning && p.learning.length > 0) ? p.learning.join(', ') : 'Online Learning'}

[ AVAILABILITY ]
Time Commitment: ${p.hours || 0} hours/week
Target Timeline: ${p.timeline === '1m' ? '1 Month' : p.timeline === '3m' ? '3 Months' : p.timeline === '6m' ? '6 Months' : p.timeline === '1y' ? '1 Year' : p.timeline === '2y' ? '2 Years' : '3+ Years'}

======================================================
* Auto-generated by PathForge AI based on user data *
  `;
  
  document.getElementById('resume-output').textContent = resumeText.trim();
  document.getElementById('resume-modal').style.display = 'flex';
  setTimeout(()=>document.getElementById('resume-modal').style.opacity = '1', 10);
  setTimeout(()=>document.getElementById('resume-modal').style.pointerEvents = 'all', 10);
}

var FALLBACK_WHATS_NEW=['Data Analyst demand ↑ 22% in last 30 days','New NSQF Level 5 cert launched by NASSCOM','Bengaluru surpassed Hyderabad as top hiring city','ML fresher salaries crossed ₹8 LPA'];

function useFallbackData(){
  APP.careers=[{id:1,rank:1,name:'Data Analyst',score:85,nsqf:'Level 5',tags:['SQL','Excel','Analytics'],salary:'₹5–12 LPA',growth:'+22%',openings:'48,000'},{id:2,rank:2,name:'BI Analyst',score:78,nsqf:'Level 5',tags:['Power BI','SQL'],salary:'₹7–15 LPA',growth:'+18%',openings:'22,000'},{id:3,rank:3,name:'AI/ML Technician',score:72,nsqf:'Level 6',tags:['Python','ML'],salary:'₹8–20 LPA',growth:'+42%',openings:'38,000'}];
  APP.skillGaps={have:['Excel','Statistics','Communication'],need:[{name:'Python',weight:'high'},{name:'SQL',weight:'high'},{name:'Data Visualization',weight:'high'}],learning:[]};
  APP.roadmap=[{step:1,nsqf:'NSQF Level 3',title:'Foundation Training',desc:'Python basics, statistics, data handling. Duration: 4–6 weeks.',state:'done'},{step:2,nsqf:'NSQF Level 4',title:'Core Data Skills',desc:'SQL, Excel advanced, data cleaning. Duration: 6–8 weeks.',state:'active'},{step:3,nsqf:'NSQF Level 5',title:'Advanced Certification',desc:'Power BI, Tableau, advanced Python. Duration: 8 weeks.',state:'pending'},{step:4,nsqf:'NSQF Level 5',title:'Apprenticeship',desc:'Real-world project under NCVET. Duration: 3 months.',state:'pending'},{step:5,nsqf:'NSQF Level 5–6',title:'Entry-Level Job Ready',desc:'Portfolio review and interview prep.',state:'pending'}];
  APP.courses=[{provider:'NIELIT / NSDC',name:'Data Analytics Fundamentals',nsqf:'NSQF Level 4',dur:'8 weeks',free:true},{provider:'NPTEL (IIT)',name:'Python for Data Science',nsqf:'NSQF Level 5',dur:'12 weeks',free:true},{provider:'Skill India Portal',name:'SQL & Database Basics',nsqf:'NSQF Level 4',dur:'4 weeks',free:true},{provider:'Microsoft x NSDC',name:'Power BI Visualisation',nsqf:'NSQF Level 5',dur:'6 weeks',free:false}];
  APP.market={insights:[{label:'Avg. Salary',val:'₹7.5 LPA',sub:'↑ 18% YoY'},{label:'Job Postings',val:'48,000+',sub:'This month'},{label:'Top City',val:'Bengaluru',sub:'↑ Fastest growth'}],heatmap:[{city:'Bengaluru',jobs:'48,200',heat:1.0},{city:'Hyderabad',jobs:'32,500',heat:0.85},{city:'Mumbai',jobs:'28,100',heat:0.75}],trends:{demandLabels:['Data Analyst','ML Engineer','BI Analyst','DevOps'],demandValues:[48,38,22,35],salaryRoles:['Data Analyst','BI Analyst','ML Engineer'],salaryMin:[5,7,12],salaryMax:[12,15,28]},whatsNew:FALLBACK_WHATS_NEW};
  APP.dailyTip='Python is the #1 skill for Data Analyst roles in India in 2025.';
  APP.matchScore=85;APP.topCareerName='Data Analyst';APP.topCareerId=1;
}

// ─────────────────────────────────────────
// AUTO LOGIN ON PAGE LOAD
// ─────────────────────────────────────────
(async function init(){
  if(APP.token){
    try{
      var data=await api('/user/me');
      APP.user=data; APP.skillStates=data.skillStates||{};
      if(data.hasProfile){await loadAllData();launchDashboard();return;}
    }catch(e){localStorage.removeItem('pf_token');APP.token=null;}
  }
  useFallbackData();
  animateCounters();
})();