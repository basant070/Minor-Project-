export const PORTAL = "Student Portal";

export const INST = [
  ["Far Western University", "Kanchanpur, Nepal", "2,840", "Active"],
  ["Tribhuvan University – IOE", "Kathmandu, Nepal", "12,400", "Active"],
  ["Pokhara University", "Pokhara, Nepal", "5,120", "Pending"],
  ["Kathmandu University", "Dhulikhel, Nepal", "6,300", "Active"],
];

// [name, title, company, city, batch, skills, match%, verified]
export const ALUMNI = [
  [
    "Aarav Joshi",
    "Software Engineer",
    "Leapfrog",
    "Kathmandu",
    2019,
    ["Python", "Machine Learning", "Web Development"],
    82,
    1,
  ],
  [
    "Sita Bohara",
    "Data Analyst",
    "F1Soft",
    "Dhangadhi",
    2020,
    ["SQL", "Python", "Power BI"],
    74,
    1,
  ],
  [
    "Nabin Chaudhary",
    "DevOps Engineer",
    "Cloudfactory",
    "Remote",
    2018,
    ["AWS", "Docker", "Linux"],
    61,
    1,
  ],
  [
    "Pratima Rana",
    "Product Designer",
    "Fusemachines",
    "Lalitpur",
    2021,
    ["Figma", "UX Research", "React"],
    58,
    0,
  ],
  [
    "Rohan Khadka",
    "Backend Developer",
    "Esewa",
    "Kathmandu",
    2017,
    ["Node.js", "MongoDB", "Web Development"],
    77,
    1,
  ],
  [
    "Anita Thapa",
    "ML Engineer",
    "Fusemachines",
    "Pokhara",
    2019,
    ["Machine Learning", "Python", "TensorFlow"],
    88,
    1,
  ],
];

// [title, company, location, type, mode, deadline, skills]
export const JOBS = [
  [
    "Junior MERN Developer",
    "Leapfrog",
    "Kathmandu",
    "Job",
    "On-site",
    "May 30",
    ["React", "Node.js"],
  ],
  [
    "Data Science Intern",
    "Fusemachines",
    "Remote",
    "Internship",
    "Remote",
    "Jun 10",
    ["Python", "Pandas"],
  ],
  [
    "QA Engineer Intern",
    "F1Soft",
    "Kathmandu",
    "Internship",
    "On-site",
    "Jun 02",
    ["Testing", "JS"],
  ],
  [
    "Cloud Support Engineer",
    "Cloudfactory",
    "Remote",
    "Job",
    "Remote",
    "Jun 20",
    ["AWS", "Linux"],
  ],
];

// [title, type, when, where, attending]
export const EVENTS = [
  ["Alumni Meet 2026", "Alumni Meet", "Jun 14 · 4 PM", "FWU Campus", 86],
  ["Breaking into ML", "Webinar", "Jun 18 · 7 PM", "Online", 142],
  ["Resume Clinic", "Workshop", "Jun 25 · 2 PM", "Lab 3", 40],
];

export const INITIAL_NOTIFS = [
  ["New mentorship request from Hari B.", 1],
  ["Job deadline: QA Engineer Intern in 3 days", 1],
  ["Aarav Joshi accepted your connection", 0],
  ["Event reminder: Alumni Meet 2026", 0],
];

// [author, role, category, title, body, likes]
export const INITIAL_POSTS = [
  [
    "Rohan Khadka",
    "Alumni",
    "Career Advice",
    "How I prepared for my first backend interview",
    "Start with one project you can explain end to end, then practise system basics.",
    12,
  ],
  [
    "Binita K.",
    "Student",
    "Higher Studies",
    "Which GRE prep resources actually helped?",
    "Looking for advice from alumni who studied abroad.",
    5,
  ],
];

export const INITIAL_CHAT = [
  ["Hi! I saw your profile, happy to help.", 0],
  ["Thank you! Could we talk about ML careers?", 1],
];

export const FACULTIES = [
  "Engineering",
  "Computer Science & IT",
  "Business & Management",
  "Health Sciences",
  "Humanities & Social Sciences",
];

export const FACULTY_FIELDS = {
  Engineering: [
    "Software Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Electronics & Communication",
  ],
  "Computer Science & IT": [
    "Software Engineering",
    "Data Science & AI",
    "Cybersecurity",
    "Cloud & DevOps",
    "UI/UX Design",
    "Information Systems",
  ],
  "Business & Management": [
    "Marketing",
    "Finance",
    "Human Resource Management",
    "Entrepreneurship",
    "Accounting",
  ],
  "Health Sciences": [
    "Nursing",
    "Public Health",
    "Pharmacy",
    "Medical Laboratory Science",
    "Physiotherapy",
  ],
  "Humanities & Social Sciences": [
    "Psychology",
    "Sociology",
    "Economics",
    "Education",
    "Journalism & Mass Communication",
  ],
};

export const NAV = [
  ["dash", "Dashboard"],
  ["dir", "Alumni Directory"],
  ["mentor", "Mentors"],
  ["jobs", "Jobs & Internships"],
  ["events", "Events"],
  ["forum", "Forum"],
  ["msg", "Messages"],
  ["notif", "Notifications"],
  ["profile", "My Profile"],
  ["settings", "Settings"],
];

export const ROLE_NAV = {
  student: NAV,
  alumni: [
    ["dash", "Dashboard"],
    ["dir", "Alumni Directory"],
    ["jobs", "Jobs & Internships"],
    ["events", "Events"],
    ["forum", "Forum"],
    ["msg", "Messages"],
    ["notif", "Notifications"],
    ["profile", "My Profile"],
    ["settings", "Settings"],
  ],
  admin: [
    ["dash", "Dashboard"],
    ["students", "Students"],
    ["managedAlumni", "Alumni"],
    ["institutions", "Institutions"],
    ["events", "Events"],
    ["forum", "Forum"],
    ["notif", "Notifications"],
    ["profile", "My Profile"],
    ["settings", "Settings"],
  ],
};

export const FEATURES = [
  ["Alumni Directory", "Search verified alumni by batch, company and skill."],
  ["Mentorship", "Get matched on shared skills and goals."],
  ["Jobs & Internships", "Roles posted by alumni and admins."],
  ["Events", "Meets, webinars and career talks."],
  ["Messaging", "Private chats inside your university."],
  ["Discussion Forum", "Career advice and alumni stories."],
  ["Notifications", "Never miss a deadline or request."],
  ["Verified Profiles", "Admins verify every alumnus."],
];
