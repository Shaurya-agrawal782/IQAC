import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";

// Import all 20 models
import Department from "../models/Department.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Mark from "../models/Mark.js";
import StudentActivity from "../models/StudentActivity.js";
import Announcement from "../models/Announcement.js";
import TeachingAssignment from "../models/TeachingAssignment.js";
import Section from "../models/Section.js";
import DepartmentStat from "../models/DepartmentStat.js";
import StudentAchievement from "../models/StudentAchievement.js";
import FacultyAchievement from "../models/FacultyAchievement.js";
import AccreditationItem from "../models/AccreditationItem.js";
import Achievement from "../models/Achievement.js";
import Faculty from "../models/Faculty.js";
import Placement from "../models/Placement.js";
import Research from "../models/Research.js";
import ReportLog from "../models/ReportLog.js";
import SectionAllocation from "../models/SectionAllocation.js";
import StudentEvent from "../models/StudentEvent.js";

dotenv.config();

// Pre-defined values
const DEPARTMENTS_DATA = [
  { name: "Computer Science and Engineering", code: "CSE" },
  { name: "Artificial Intelligence and Machine Learning", code: "AIML" },
  { name: "Information Technology", code: "IT" },
  { name: "Electronics and Communication Engineering", code: "ECE" },
  { name: "Mechanical Engineering", code: "ME" },
  { name: "Civil Engineering", code: "CE" },
  { name: "Electrical Engineering", code: "EE" }
];

const FIRST_YEAR_SUBJECTS = {
  1: [
    { code: "MATH101", name: "Engineering Mathematics I", credits: 4 },
    { code: "PHYS101", name: "Engineering Physics", credits: 4 },
    { code: "CP101", name: "Computer Programming", credits: 3 },
    { code: "BEE101", name: "Basic Electrical Engineering", credits: 3 },
    { code: "ME101", name: "Engineering Workshop", credits: 2 }
  ],
  2: [
    { code: "MATH201", name: "Engineering Mathematics II", credits: 4 },
    { code: "CHEM201", name: "Engineering Chemistry", credits: 4 },
    { code: "ED201", name: "Engineering Drawing", credits: 3 },
    { code: "ENG201", name: "English Communication Skills", credits: 2 },
    { code: "PPS201", name: "Programming for Problem Solving", credits: 4 }
  ]
};

const DEPT_SUBJECTS_INFO = {
  CSE: {
    prefix: "CS",
    names: {
      3: ["Data Structures", "Digital Logic Design", "Object Oriented Programming", "Computer Organization", "Discrete Mathematics"],
      4: ["Advanced Data Structures", "Software Engineering", "Computer Networks", "Database Management Systems", "Operating Systems"],
      5: ["Design and Analysis of Algorithms", "Formal Languages & Automata Theory", "Web Technology", "Artificial Intelligence", "Professional Elective I"],
      6: ["Compiler Design", "Machine Learning", "Cloud Computing", "Cryptography & Security", "Open Elective I"],
      7: ["Big Data Analytics", "Cyber Security", "Internet of Things", "Professional Elective II", "Project Phase I"],
      8: ["Deep Learning", "Natural Language Processing", "Open Elective II", "Project Phase II"]
    }
  },
  AIML: {
    prefix: "AI",
    names: {
      3: ["Probability and Statistics", "Data Structures", "Object Oriented Programming", "Computer Organization", "Discrete Mathematics"],
      4: ["Introduction to Machine Learning", "Database Management Systems", "Operating Systems", "Advanced Data Structures", "Software Engineering"],
      5: ["Design and Analysis of Algorithms", "Deep Learning Foundations", "Web Technology", "Natural Language Processing", "Professional Elective I"],
      6: ["Computer Vision", "Compiler Design", "Cloud Computing", "Big Data Analytics", "Open Elective I"],
      7: ["Reinforcement Learning", "Cyber Security", "Internet of Things", "Professional Elective II", "Project Phase I"],
      8: ["Generative AI and LLMs", "AI Ethics and Governance", "Open Elective II", "Project Phase II"]
    }
  },
  IT: {
    prefix: "IT",
    names: {
      3: ["Data Structures", "Digital Logic Design", "Object Oriented Programming", "Computer Organization", "Discrete Mathematics"],
      4: ["Advanced Data Structures", "Software Engineering", "Computer Networks", "Database Management Systems", "Operating Systems"],
      5: ["Design and Analysis of Algorithms", "Formal Languages & Automata Theory", "Web Technology", "Artificial Intelligence", "Professional Elective I"],
      6: ["Compiler Design", "Machine Learning", "Cloud Computing", "Cryptography & Security", "Open Elective I"],
      7: ["Big Data Analytics", "Cyber Security", "Internet of Things", "Professional Elective II", "Project Phase I"],
      8: ["Mobile Computing", "E-Commerce", "Open Elective II", "Project Phase II"]
    }
  },
  ECE: {
    prefix: "EC",
    names: {
      3: ["Electronic Devices & Circuits", "Network Theory", "Signals and Systems", "Digital Electronics", "Mathematics III"],
      4: ["Analog Circuits", "Electromagnetic Fields", "Microprocessors & Interfacing", "Control Systems", "Signals II"],
      5: ["Digital Communication", "VLSI Design", "Antennas & Wave Propagation", "Digital Signal Processing", "Embedded Systems"],
      6: ["Wireless Communications", "Microcontrollers", "Fiber Optic Communications", "VLSI II", "Open Elective I"],
      7: ["Microwave Engineering", "Embedded IoT Systems", "Radar Systems", "Professional Elective II", "Project Phase I"],
      8: ["Satellite Communication", "VLSI Testing & Verification", "Open Elective II", "Project Phase II"]
    }
  },
  ME: {
    prefix: "ME",
    names: {
      3: ["Thermodynamics", "Strength of Materials", "Metallurgy & Material Science", "Mechanics of Solids", "Mathematics III"],
      4: ["Fluid Mechanics", "Manufacturing Technology", "Kinematics of Machinery", "Dynamics of Machinery", "Applied Thermodynamics"],
      5: ["Heat Transfer", "Machine Design I", "Turbo Machinery", "Metrology & Instrumentation", "Professional Elective I"],
      6: ["CAD/CAM", "Machine Design II", "Industrial Engineering", "Automobile Engineering", "Open Elective I"],
      7: ["Refrigeration & Air Conditioning", "Power Plant Engineering", "Finite Element Method", "Professional Elective II", "Project Phase I"],
      8: ["Mechatronics", "Robotics & Automation", "Open Elective II", "Project Phase II"]
    }
  },
  CE: {
    prefix: "CE",
    names: {
      3: ["Surveying", "Mechanics of Solids", "Fluid Mechanics", "Engineering Geology", "Mathematics III"],
      4: ["Structural Analysis", "Concrete Technology", "Geotechnical Engineering", "Building Materials", "Hydraulics"],
      5: ["Design of Steel Structures", "Environmental Engineering", "Transportation Engineering", "Water Resources", "Professional Elective I"],
      6: ["RCC Design", "Foundation Engineering", "Construction Management", "GIS & GPS Applications", "Open Elective I"],
      7: ["Estimation & Costing", "Earthquake Engineering", "Prefabricated Structures", "Professional Elective II", "Project Phase I"],
      8: ["Prestressed Concrete", "Smart Infrastructure", "Open Elective II", "Project Phase II"]
    }
  },
  EE: {
    prefix: "EE",
    names: {
      3: ["Network Analysis", "Electromagnetic Fields", "Electrical Machines I", "Analog Electronics", "Mathematics III"],
      4: ["Electrical Machines II", "Power Systems I", "Control Systems", "Digital Electronics", "Electrical Measurements"],
      5: ["Power Electronics", "Power Systems II", "Microprocessors", "Signals & Systems", "Professional Elective I"],
      6: ["Power System Analysis", "Switchgear & Protection", "Electrical Drives", "Renewable Energy Sources", "Open Elective I"],
      7: ["High Voltage Engineering", "Utilization of Electrical Energy", "Smart Grid", "Professional Elective II", "Project Phase I"],
      8: ["Electrical Machine Design", "Power Quality & Facts", "Open Elective II", "Project Phase II"]
    }
  }
};

function getSubjects(deptCode, semester) {
  if (semester === 1 || semester === 2) {
    return FIRST_YEAR_SUBJECTS[semester];
  }
  const info = DEPT_SUBJECTS_INFO[deptCode] || DEPT_SUBJECTS_INFO["CSE"];
  const names = info.names[semester] || [];
  return names.map((name, index) => {
    const code = `${info.prefix}${semester}${String(index + 1).padStart(2, "0")}`;
    const credits = (semester >= 7 && name.includes("Project")) ? 6 : (index === 0 ? 4 : 3);
    return { code, name, credits };
  });
}

function getAcademicYearForSem(batchStart, sem) {
  const yearOffset = Math.floor((sem - 1) / 2);
  const startYear = batchStart + yearOffset;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, "0")}`;
}

const firstNamesM = ["Aarav", "Rohan", "Aditya", "Kunal", "Harsh", "Nikhil", "Aman", "Devansh", "Ayush", "Sajid", "Farhan", "Arjun", "Vignesh", "Sai", "Rajesh", "Ramesh", "Suresh", "Dinesh", "Deepak", "Vivek", "Rohit", "Rahul", "Gaurav", "Sandeep", "Akhil", "Karthik", "Siddharth", "Amit", "Yash", "Manish"];
const firstNamesF = ["Priya", "Ananya", "Sakshi", "Riya", "Neha", "Meera", "Isha", "Kavya", "Anjali", "Sneha", "Divya", "Pooja", "Kiran", "Meena", "Swati", "Shreya", "Harini", "Tanvi", "Aditi", "Rashmi", "Jyoti", "Deepa", "Ritu", "Pragya", "Preeti", "Nisha", "Kirti", "Rupa", "Shalini", "Aarti"];
const lastNames = ["Sharma", "Verma", "Mishra", "Jain", "Rajput", "Patel", "Singh", "Gupta", "Choudhary", "Tiwari", "Saxena", "Yadav", "Nair", "Agarwal", "Soni", "Ali", "Khan", "Iyer", "Kulkarni", "Rao", "Menon", "Reddy", "Joshi", "Trivedi", "Bhat", "Pillai", "Deshmukh", "Patil", "Chatterjee", "Sen"];

const nameSet = new Set();
function generateName() {
  let name = "";
  do {
    const isFemale = Math.random() > 0.5;
    const first = isFemale 
      ? firstNamesF[Math.floor(Math.random() * firstNamesF.length)]
      : firstNamesM[Math.floor(Math.random() * firstNamesM.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    name = `${first} ${last}`;
  } while (nameSet.has(name));
  nameSet.add(name);
  return name;
}

const gradeFromTotal = (total) => {
  if (total >= 90) return "O";
  if (total >= 80) return "A+";
  if (total >= 70) return "A";
  if (total >= 60) return "B+";
  if (total >= 50) return "B";
  if (total >= 40) return "C";
  return "F";
};

const gradePointFromGrade = (grade) => {
  if (grade === "O") return 10;
  if (grade === "A+") return 9;
  if (grade === "A") return 8;
  if (grade === "B+") return 7;
  if (grade === "B") return 6;
  if (grade === "C") return 5;
  return 0;
};

const run = async () => {
  console.log("Connecting to Database...");
  await connectDB();

  console.log("Safely clearing existing data from all 20 collections...");
  await Promise.all([
    Department.deleteMany({}),
    Student.deleteMany({}),
    User.deleteMany({}),
    Attendance.deleteMany({}),
    Mark.deleteMany({}),
    StudentActivity.deleteMany({}),
    Announcement.deleteMany({}),
    TeachingAssignment.deleteMany({}),
    Section.deleteMany({}),
    DepartmentStat.deleteMany({}),
    StudentAchievement.deleteMany({}),
    FacultyAchievement.deleteMany({}),
    AccreditationItem.deleteMany({}),
    Achievement.deleteMany({}),
    Faculty.deleteMany({}),
    Placement.deleteMany({}),
    Research.deleteMany({}),
    ReportLog.deleteMany({}),
    SectionAllocation.deleteMany({}),
    StudentEvent.deleteMany({})
  ]);
  console.log("All collections cleared successfully.");

  // Pre-hash password once
  console.log("Generating password hashes...");
  const password = "Admin@123";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Password hashes generated successfully.");

  // 1. Seed Departments
  console.log("Seeding Departments...");
  const departments = await Department.create(DEPARTMENTS_DATA);
  const deptMap = {};
  departments.forEach((d) => {
    deptMap[d.code] = d;
  });

  // 2. Seed Admins
  console.log("Seeding Admin Users...");
  const adminUser1 = await User.create({
    name: "IQAC System Admin",
    email: "admin@iqac.edu",
    username: "admin",
    password: password, // Mongoose hook will hash this
    role: "admin"
  });

  const adminUser2 = await User.create({
    name: "Accreditation Coordinator",
    email: "admin.audit@iqac.edu",
    username: "admin_audit",
    password: password,
    role: "admin"
  });

  // 3. Seed HODs and Faculty
  console.log("Seeding HODs, Faculty, and profiles...");
  const facultyList = []; // Faculty model records
  const facultyUsers = []; // User role='faculty' records
  const hodUsersMap = {};  // HOD User records by department code

  const facultyNames = [
    "Dr. Rajesh Sharma", "Prof. Amit Tiwari", "Dr. Neha Saxena", "Prof. Priya Menon", 
    "Dr. Kavita Iyer", "Prof. Suresh Rao", "Dr. Farhan Khan", "Prof. Meera Nair", 
    "Dr. Sanjay Kulkarni", "Dr. Anjali Gupta", "Dr. Alok Verma", "Prof. Hema Reddy", 
    "Dr. Santosh Patil", "Prof. Deepa Joshi", "Dr. Vijay Deshmukh", "Prof. Sunita Bhat", 
    "Dr. Naveen Sen", "Prof. Manoj Pillai", "Dr. Ritu Trivedi", "Prof. Kiran Kumar"
  ];

  const designations = ["Assistant Professor", "Associate Professor", "Professor"];
  const qualifications = ["M.Tech", "Ph.D", "Ph.D (IIT)"];
  const researchAreas = ["Artificial Intelligence", "Machine Learning", "Wireless Networks", "Internet of Things", "Smart Grids", "VLSI Design", "Structural Analysis", "Fluid Dynamics", "Image Processing", "Compiler Design"];

  for (const dept of departments) {
    // A. Seed HOD
    const hodUser = await User.create({
      name: `Dr. HOD ${dept.code}`,
      email: `hod.${dept.code.toLowerCase()}@iqac.edu`,
      username: `hod_${dept.code.toLowerCase()}`,
      password: password,
      role: "hod",
      department: dept._id
    });
    hodUsersMap[dept.code] = hodUser;
    
    // Update Department with HOD reference
    dept.hod = hodUser._id;
    dept.vision = `To be a center of excellence in ${dept.name} education and research.`;
    dept.mission = `To provide quality education, nurture innovation, and develop engineering leaders in ${dept.name}.`;
    await dept.save();

    // B. Seed 6 Faculty Members per Department
    for (let f = 1; f <= 6; f++) {
      const idx = (dept.code.charCodeAt(0) + f) % facultyNames.length;
      const fName = facultyNames[idx] + " " + dept.code;
      const fEmail = `faculty.${dept.code.toLowerCase()}0${f}@iqac.edu`;
      const fUsername = `faculty_${dept.code.toLowerCase()}0${f}`;
      const empId = `FAC-${dept.code}-0${f}`;

      // Pick designation and qualification
      const designation = f === 1 ? "Professor" : (f <= 3 ? "Associate Professor" : "Assistant Professor");
      const qualification = designation === "Assistant Professor" ? qualifications[0] : (Math.random() > 0.5 ? qualifications[1] : qualifications[2]);
      const experience = designation === "Professor" ? 18 + f : (designation === "Associate Professor" ? 10 + f : 4 + f);
      const isPhd = qualification.includes("Ph.D");

      // Generate subjects they teach (e.g. 2 subjects in semesters 3-6)
      const taughtSubjects = [];
      const sems = [3, 4, 5, 6];
      sems.forEach((sem) => {
        const subList = getSubjects(dept.code, sem);
        if (subList.length > 0) {
          const sub = subList[Math.floor(Math.random() * subList.length)];
          if (!taughtSubjects.some(ts => ts.subjectName === sub.name)) {
            taughtSubjects.push({ subjectName: sub.name, semester: sem });
          }
        }
      });

      // Special check: ensure faculty.cse@iqac.edu is guaranteed
      const isCSE1 = dept.code === "CSE" && f === 1;
      const finalEmail = isCSE1 ? "faculty.cse@iqac.edu" : fEmail;

      const user = await User.create({
        name: fName,
        email: finalEmail,
        username: fUsername,
        password: password,
        role: "faculty",
        department: dept._id,
        facultyId: empId,
        facultyProfile: {
          designation,
          qualification,
          experienceYears: experience,
          phd: isPhd,
          bio: `Dedicated academician in the field of ${dept.name}.`,
          scholars: [`Scholar ${dept.code} A`, `Scholar ${dept.code} B`],
          recentPapers: ["Outcome Based Engineering Assessment Standards", "Advanced Trends in Engineering Quality Control"],
          expertise: [researchAreas[f % researchAreas.length], researchAreas[(f + 1) % researchAreas.length]]
        }
      });

      const facultyRecord = await Faculty.create({
        user: user._id,
        department: dept._id,
        name: fName,
        employeeId: empId,
        email: finalEmail,
        username: fUsername,
        passwordHash: user.password,
        phone: `9876500${dept.code.charCodeAt(0) % 10}${f}`,
        designation,
        qualification,
        experience,
        officeLocation: `Block ${String.fromCharCode(65 + (dept.code.charCodeAt(0) % 4))}, Room ${100 * f + 5}`,
        joiningDate: new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), 1),
        researchInterests: [researchAreas[f % researchAreas.length], researchAreas[(f + 1) % researchAreas.length]],
        sections: ["A", "B"],
        subjects: taughtSubjects,
        researchArea: researchAreas[f % researchAreas.length],
        publications: 4 + f * 2,
        googleScholarLink: `https://scholar.google.com/citations?user=${empId}`,
        orcidId: `0000-0002-${dept.code.charCodeAt(0)}-${f}000`,
        achievements: [`Received Institutional Research Grant`, `Completed FDP on Outcome Based Education`],
        awards: [`Best Faculty Researcher ${dept.code} Award`],
        patents: [`Patent filed for Smart ${dept.code} System`],
        conferenceParticipation: [`IEEE International Conference on Advanced Engineering`]
      });

      facultyList.push(facultyRecord);
      facultyUsers.push(user);
    }
  }

  // 4. Seed Sections
  console.log("Seeding Section records...");
  const sections = [];
  const activeSems = [2, 4, 6, 8];
  for (const dept of departments) {
    for (const sem of activeSems) {
      const year = getAcademicYearForSem(2025 - sem/2, sem);
      const secA = await Section.create({
        department: dept._id,
        name: "A",
        semester: sem,
        academicYear: year,
        totalStudents: 16
      });
      const secB = await Section.create({
        department: dept._id,
        name: "B",
        semester: sem,
        academicYear: year,
        totalStudents: 16
      });
      sections.push(secA, secB);
    }
  }

  // 5. Seed Students (with consistent risk profiles)
  console.log("Seeding Students, user logins, marks and attendance...");
  const studentsToInsert = [];
  const studentsToInsertUser = [];
  const marksToInsert = [];
  const attendanceToInsert = [];

  const batches = {
    2: { start: 2024, batch: "2024-2028" },
    4: { start: 2023, batch: "2023-2027" },
    6: { start: 2022, batch: "2022-2026" },
    8: { start: 2021, batch: "2021-2025" }
  };

  // Guarantee 'ravi@student.iqac.edu' as requested
  const cseDept = deptMap["CSE"];
  const specialStudent = {
    rollNo: "CSE23999",
    name: "Ravi Kumar",
    email: "ravi@student.iqac.edu",
    department: cseDept._id,
    section: "A",
    currentSemester: 4,
    batch: "2023-2027",
    phone: "9876543210",
    address: "Bhopal, Madhya Pradesh",
    feeDetails: {
      totalFee: 140000,
      paidAmount: 90000,
      pendingAmount: 50000,
      paymentStatus: "PARTIAL"
    },
    riskLevel: "HIGH"
  };

  // Process special student separately first
  const specialMetrics = [];
  for (let s = 1; s <= 4; s++) {
    const ay = getAcademicYearForSem(2023, s);
    const sgpa = s < 4 ? 6.2 : 5.8;
    const cgpa = s < 4 ? 6.2 : 6.0;
    const backlogCount = s === 4 ? 3 : 1;
    const attendancePercent = s === 4 ? 58 : 64;
    specialMetrics.push({ semester: s, academicYear: ay, sgpa, cgpa, backlogCount, attendancePercent });
  }
  specialStudent.metrics = specialMetrics;
  const createdSpecialStudent = await Student.create(specialStudent);

  // User account for Special Student
  const specialStudentUser = await User.create({
    name: specialStudent.name,
    email: specialStudent.email,
    username: "ravi_kumar",
    password: password,
    role: "student",
    department: cseDept._id,
    studentProfile: createdSpecialStudent._id,
    registrationNumber: specialStudent.rollNo
  });

  // Populate marks and attendance for Special Student (HIGH risk)
  for (let s = 1; s <= 4; s++) {
    const ay = getAcademicYearForSem(2023, s);
    const subjects = getSubjects("CSE", s);
    
    // Attendance
    const subAttendanceList = [];
    let totClasses = 0;
    let totAttended = 0;
    for (const sub of subjects) {
      const conducted = 50;
      const attended = 25 + Math.floor(Math.random() * 7); // 50-64%
      totClasses += conducted;
      totAttended += attended;
      subAttendanceList.push({
        subjectCode: sub.code,
        subjectName: sub.name,
        classesConducted: conducted,
        classesAttended: attended,
        percentage: Number(((attended / conducted) * 100).toFixed(2))
      });

      // Marks
      const internal = 12 + Math.floor(Math.random() * 5); // 12-16
      const isFailedSub = s === 4 && (sub.code.endsWith("02") || sub.code.endsWith("03") || sub.code.endsWith("05"));
      const external = isFailedSub ? 10 + Math.floor(Math.random() * 8) : 24 + Math.floor(Math.random() * 10);
      const total = internal + external;
      const passed = total >= 40;
      const grade = gradeFromTotal(total);

      marksToInsert.push({
        student: createdSpecialStudent._id,
        subjectCode: sub.code,
        subjectName: sub.name,
        semester: s,
        academicYear: ay,
        internal,
        external,
        total,
        grade,
        credits: sub.credits,
        passed,
        enteredBy: adminUser1._id
      });
    }

    attendanceToInsert.push({
      student: createdSpecialStudent._id,
      semester: s,
      academicYear: ay,
      totalClasses: totClasses,
      attendedClasses: totAttended,
      percentage: Number(((totAttended / totClasses) * 100).toFixed(2)),
      subjects: subAttendanceList
    });
  }

  // Programmatically generate 448 students (8 students per section, 2 sections, 4 batches, 7 departments)
  let studentCount = 1;
  const addressCities = ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Jaipur", "Lucknow", "Nagpur", "Pune", "Patna", "Ranchi", "Raipur"];
  const feeStatusList = ["PAID", "PARTIAL", "PENDING"];

  for (const dept of departments) {
    for (const sem of activeSems) {
      const batchInfo = batches[sem];
      const sectionsList = ["A", "B"];
      
      for (const section of sectionsList) {
        for (let i = 1; i <= 8; i++) {
          const sName = generateName();
          const sRoll = `${dept.code}${batchInfo.start % 100}${String(studentCount).padStart(3, "0")}`;
          const sEmail = `student.${dept.code.toLowerCase()}${batchInfo.start % 100}${String(studentCount).padStart(3, "0")}@iqac.edu`;
          studentCount++;

          // Risk distribution: ~60% LOW, ~25% MEDIUM, ~15% HIGH
          const rand = Math.random();
          let riskLevel = "LOW";
          if (rand < 0.15) riskLevel = "HIGH";
          else if (rand < 0.40) riskLevel = "MEDIUM";

          // Student address and fee
          const address = `${addressCities[Math.floor(Math.random() * addressCities.length)]}, India`;
          const feeStatus = riskLevel === "HIGH" ? feeStatusList[2] : (Math.random() > 0.3 ? feeStatusList[0] : feeStatusList[1]);
          const paid = feeStatus === "PAID" ? 140000 : (feeStatus === "PARTIAL" ? 80000 : 0);
          const pending = 140000 - paid;

          // Build metrics
          const metrics = [];
          for (let s = 1; s <= sem; s++) {
            const ay = getAcademicYearForSem(batchInfo.start, s);
            
            let sgpa, cgpa, backlogCount, attendancePercent;
            if (riskLevel === "LOW") {
              sgpa = 7.5 + Math.random() * 2.1;
              backlogCount = 0;
              attendancePercent = 76 + Math.floor(Math.random() * 22);
            } else if (riskLevel === "MEDIUM") {
              sgpa = 6.4 + Math.random() * 1.1;
              backlogCount = Math.random() > 0.8 ? 1 : 0;
              attendancePercent = 65 + Math.floor(Math.random() * 11);
            } else {
              sgpa = 4.5 + Math.random() * 1.9;
              backlogCount = 1 + Math.floor(Math.random() * 4);
              attendancePercent = 45 + Math.floor(Math.random() * 20);
            }
            
            // CGPA running average
            const prevCgpa = metrics.length > 0 ? metrics[metrics.length - 1].cgpa : sgpa;
            cgpa = (prevCgpa * (s - 1) + sgpa) / s;

            metrics.push({
              semester: s,
              academicYear: ay,
              sgpa: Number(sgpa.toFixed(2)),
              cgpa: Number(cgpa.toFixed(2)),
              backlogCount,
              attendancePercent: Number(attendancePercent.toFixed(2))
            });
          }

          studentsToInsert.push({
            rollNo: sRoll,
            name: sName,
            email: sEmail,
            department: dept._id,
            section: section,
            currentSemester: sem,
            batch: batchInfo.batch,
            phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
            address,
            feeDetails: {
              totalFee: 140000,
              paidAmount: paid,
              pendingAmount: pending,
              paymentStatus: feeStatus
            },
            metrics,
            riskLevel
          });
        }
      }
    }
  }

  // Bulk Insert Students
  console.log(`Bulk inserting ${studentsToInsert.length} students...`);
  const insertedStudents = await Student.insertMany(studentsToInsert);
  console.log("Students inserted successfully.");

  // Generate User login accounts for 20 demo students
  console.log("Creating user login accounts for demo students...");
  for (let sIdx = 0; sIdx < 20; sIdx++) {
    const student = insertedStudents[sIdx];
    const username = student.name.toLowerCase().replace(/\s+/g, "_");
    studentsToInsertUser.push({
      name: student.name,
      email: student.email,
      username,
      password: hashedPassword, // Pre-hashed
      role: "student",
      department: student.department,
      studentProfile: student._id,
      registrationNumber: student.rollNo
    });
  }
  await User.insertMany(studentsToInsertUser);
  console.log("Student user login accounts created.");

  // Construct Attendance & Marks records for all students
  console.log("Preparing marks and attendance records for bulk insert...");
  insertedStudents.forEach((student) => {
    // Find department code
    const deptCode = departments.find(d => String(d._id) === String(student.department)).code;

    for (let s = 1; s <= student.currentSemester; s++) {
      const ay = getAcademicYearForSem(parseInt(student.batch.split("-")[0]), s);
      const subjects = getSubjects(deptCode, s);
      const subAttendanceList = [];
      let totClasses = 0;
      let totAttended = 0;

      // Find the metric record for this sem
      const semMetric = student.metrics.find(m => m.semester === s) || {};

      subjects.forEach((sub) => {
        // Generate attendance consistent with metric percentage
        const targetPercent = semMetric.attendancePercent || 80;
        const conducted = 50;
        const attended = Math.round(conducted * (targetPercent / 100));
        
        totClasses += conducted;
        totAttended += attended;

        subAttendanceList.push({
          subjectCode: sub.code,
          subjectName: sub.name,
          classesConducted: conducted,
          classesAttended: attended,
          percentage: Number(((attended / conducted) * 100).toFixed(2))
        });

        // Generate marks consistent with risk profile/SGPA
        const targetGpa = semMetric.sgpa || 7.5;
        const targetTotal = 30 + Math.round(targetGpa * 7); // map GPA to out of 100
        
        const internal = 12 + Math.floor(Math.random() * 15);
        const external = Math.max(0, targetTotal - internal);
        const total = internal + external;
        const passed = total >= 40;
        const grade = gradeFromTotal(total);

        marksToInsert.push({
          student: student._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          semester: s,
          academicYear: ay,
          internal,
          external,
          total,
          grade,
          credits: sub.credits,
          passed,
          enteredBy: adminUser1._id
        });
      });

      attendanceToInsert.push({
        student: student._id,
        semester: s,
        academicYear: ay,
        totalClasses: totClasses,
        attendedClasses: totAttended,
        percentage: Number(((totAttended / totClasses) * 100).toFixed(2)),
        subjects: subAttendanceList
      });
    }
  });

  console.log(`Bulk inserting ${marksToInsert.length} Marks records...`);
  await Mark.insertMany(marksToInsert);
  console.log(`Bulk inserting ${attendanceToInsert.length} Attendance records...`);
  await Attendance.insertMany(attendanceToInsert);
  console.log("Marks and Attendance seeded.");

  // 6. Seed Teaching Assignments & Section Allocations
  console.log("Seeding Teaching Assignments and Section Allocations...");
  const teachingAssignments = [];
  const sectionAllocations = [];

  for (const dept of departments) {
    const deptFaculty = facultyList.filter(f => String(f.department) === String(dept._id));
    const activeSems = [2, 4, 6, 8];

    activeSems.forEach((sem) => {
      const year = getAcademicYearForSem(2025 - sem/2, sem);
      const subjects = getSubjects(dept.code, sem);
      const sections = ["A", "B"];

      subjects.forEach((sub, subIdx) => {
        sections.forEach((sec) => {
          // Select a faculty member round-robin
          const fac = deptFaculty[(subIdx + sec.charCodeAt(0)) % deptFaculty.length];
          teachingAssignments.push({
            faculty: fac.user, // references User model ID of faculty
            department: dept._id,
            semester: sem,
            academicYear: year,
            section: sec,
            subjectCode: sub.code,
            subjectName: sub.name
          });

          sectionAllocations.push({
            department: dept._id,
            section: sec,
            semester: sem,
            subject: sub.name,
            facultyId: fac.employeeId,
            facultyUser: fac.user,
            academicYear: year
          });
        });
      });
    });
  }

  await TeachingAssignment.insertMany(teachingAssignments);
  await SectionAllocation.insertMany(sectionAllocations);
  console.log("Teaching Assignments and Section Allocations seeded.");

  // 7. Seed Placements
  console.log("Seeding Placements...");
  const recruiters = ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "Accenture", "HCLTech", "Tech Mahindra", "LTIMindtree", "Persistent Systems", "Deloitte"];
  const placementRecords = [];
  const placementYears = ["2021-22", "2022-23", "2023-24", "2024-25"];

  for (const dept of departments) {
    placementYears.forEach((year, yIdx) => {
      const totalEligible = 50 + Math.floor(Math.random() * 60);
      const rate = 0.55 + Math.random() * 0.3; // 55% - 85%
      const totalPlaced = Math.round(totalEligible * rate);
      const highest = 8 + Math.floor(Math.random() * 12) + (yIdx * 0.5);
      const median = 3.5 + Math.random() * 3 + (yIdx * 0.2);

      placementRecords.push({
        department: dept._id,
        academicYear: year,
        totalEligible,
        totalPlaced,
        highestPackageLPA: Number(highest.toFixed(1)),
        medianPackageLPA: Number(median.toFixed(1)),
        majorRecruiters: [recruiters[yIdx % recruiters.length], recruiters[(yIdx + 1) % recruiters.length], recruiters[(yIdx + 2) % recruiters.length]],
        enteredBy: adminUser1._id
      });
    });
  }
  await Placement.insertMany(placementRecords);
  console.log("Placements seeded.");

  // 8. Seed Faculty Research / Publications
  console.log("Seeding Faculty Research papers...");
  const researchRecords = [];
  const publicationTitles = [
    "AI Based Academic Risk Prediction for Higher Education",
    "Machine Learning Approach for Student Performance Analysis",
    "Blockchain Enabled Certificate Verification System",
    "IoT Based Smart Attendance Monitoring System",
    "Cyber Security Awareness in Indian Higher Education Institutions",
    "Outcome Based Education Analytics for Technical Institutes",
    "Cloud Based Accreditation Evidence Management System",
    "Deep Learning Based Document Classification for IQAC Cells",
    "Optimization of Solar Power Grids Using Deep Learning",
    "Evaluation of Fluid Structure Interaction in Bridge Piers",
    "Automating NAAC Accreditation File Structuring",
    "Vibration Analysis of Hybrid Composite Beams"
  ];
  const publicationTypes = ["Journal", "Conference", "Patent", "Book Chapter"];
  const journals = ["IEEE Access", "Springer Journal of Education Technology", "Elsevier Computers & Structures", "ACM Transactions on Computing Education", "Indian Journal of Technical Education"];

  facultyList.forEach((fac, fIdx) => {
    // 3 research papers per faculty
    for (let r = 1; r <= 3; r++) {
      const idx = (fIdx * 3 + r) % publicationTitles.length;
      const title = publicationTitles[idx] + " - Case Study " + fac.employeeId;
      const type = publicationTypes[(fIdx + r) % publicationTypes.length];
      
      researchRecords.push({
        department: fac.department,
        faculty: fac.user, // User ID of faculty
        title,
        publicationType: type,
        journalOrConference: type === "Journal" ? journals[r % journals.length] : "International Conference on Engineering Systems",
        publishedOn: new Date(2021 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 15),
        accreditationCriteria: "NAAC-C3"
      });
    }
  });
  await Research.insertMany(researchRecords);
  console.log("Research papers seeded.");

  // 9. Seed Accreditation Items
  console.log("Seeding Accreditation Items (NAAC, NBA, AUDIT)...");
  const accreditationItems = [];
  const naacCriteria = ["Criterion 1: Curricular Aspects", "Criterion 2: Teaching-Learning and Evaluation", "Criterion 3: Research, Innovations and Extension", "Criterion 4: Infrastructure and Learning Resources", "Criterion 5: Student Support and Progression", "Criterion 6: Governance, Leadership and Management", "Criterion 7: Institutional Values and Best Practices"];
  const nbaCriteria = ["Vision, Mission and PEOs", "Program Curriculum", "Course Outcomes and Program Outcomes", "Students' Performance", "Faculty Information and Contributions", "Facilities and Technical Support", "Continuous Improvement"];
  const auditCriteria = ["Academic Audit", "Green Audit", "Energy Audit", "Administrative Audit"];

  const evidenceNames = ["Course outcome attainment report", "Program outcome mapping document", "Student feedback analysis", "Faculty publication proof", "Placement summary report", "Mentor-mentee meeting records", "Department academic audit report", "Laboratory utilization record", "ICT enabled classroom proof", "Internal assessment moderation record", "Remedial class report", "Alumni interaction report"];

  for (const dept of departments) {
    const hod = hodUsersMap[dept.code];

    // NAAC Items
    naacCriteria.forEach((criterion, idx) => {
      const completed = Math.random() > 0.35;
      accreditationItems.push({
        title: `${evidenceNames[idx % evidenceNames.length]} - ${dept.code}`,
        body: `NAAC criteria validation files for ${criterion}`,
        type: "NAAC",
        criterion: criterion.split(":")[0],
        department: dept._id,
        academicYear: "2024-25",
        evidenceUrl: completed ? `https://iqac-evidence.s3.amazonaws.com/${dept.code.toLowerCase()}/naac_evidence_c${idx+1}.pdf` : "",
        completed,
        uploadedBy: hod._id
      });
    });

    // NBA Items
    nbaCriteria.forEach((criterion, idx) => {
      const completed = Math.random() > 0.35;
      accreditationItems.push({
        title: `NBA ${criterion} Attainment Proof - ${dept.code}`,
        body: `Assessment evidence for ${criterion} requirements.`,
        type: "NBA",
        criterion,
        department: dept._id,
        academicYear: "2024-25",
        evidenceUrl: completed ? `https://iqac-evidence.s3.amazonaws.com/${dept.code.toLowerCase()}/nba_evidence_c${idx+1}.pdf` : "",
        completed,
        uploadedBy: hod._id
      });
    });

    // AUDIT Items
    auditCriteria.forEach((criterion, idx) => {
      const completed = Math.random() > 0.35;
      accreditationItems.push({
        title: `${criterion} Report - ${dept.code}`,
        body: `Audit validation document for ${criterion}`,
        type: "AUDIT",
        criterion,
        department: dept._id,
        academicYear: "2024-25",
        evidenceUrl: completed ? `https://iqac-evidence.s3.amazonaws.com/${dept.code.toLowerCase()}/audit_report_${idx+1}.pdf` : "",
        completed,
        uploadedBy: hod._id
      });
    });
  }
  await AccreditationItem.insertMany(acacItemsCleanup(accreditationItems));
  console.log("Accreditation items seeded.");

  // Helper to ensure criterion is never empty
  function acacItemsCleanup(items) {
    return items.map(item => {
      if(!item.criterion) item.criterion = "NAAC-C1";
      return item;
    });
  }

  // 10. Seed Achievements (Root, Faculty, Student)
  console.log("Seeding Achievements...");
  
  // A. Seed Root Achievements
  const rootAchievements = [];
  departments.forEach((dept) => {
    rootAchievements.push(
      { department: dept._id, title: "Academic Excellence Award", category: "Department", level: "Institute", date: new Date(2024, 8, 15), accreditationCriteria: "NAAC-C6" },
      { department: dept._id, title: "IEEE Student Branch Innovation Project Winner", category: "Student", level: "National", date: new Date(2025, 1, 20), accreditationCriteria: "NAAC-C5" },
      { department: dept._id, title: "Best Faculty Research Contribution Award", category: "Faculty", level: "State", date: new Date(2024, 11, 5), accreditationCriteria: "NAAC-C3" }
    );
  });
  await Achievement.insertMany(rootAchievements);

  // B. Seed Student Achievements
  const studentAchievements = [];
  const sAchievementsList = [
    { eventName: "Smart India Hackathon 2024", title: "Internal Winner", category: "Hackathon", level: "National" },
    { eventName: "Vignan Project Expo 2025", title: "Best Software Innovation", category: "Project Competition", level: "College" },
    { eventName: "IEEE Conference paper presentation", title: "Best Student Presenter", category: "Research", level: "International" },
    { eventName: "All India University Sports Meet", title: "Gold Medalist (Athletics)", category: "Sports", level: "National" },
    { eventName: "College Cultural Fest - Tarang", title: "First Prize in Group Dance", category: "Cultural", level: "State" }
  ];

  // Assign achievements to first 30 students
  for (let i = 0; i < 30; i++) {
    const student = insertedStudents[i];
    const achInfo = sAchievementsList[i % sAchievementsList.length];
    studentAchievements.push({
      student: student._id,
      department: student.department,
      eventName: achInfo.eventName,
      title: achInfo.title,
      category: achInfo.category,
      level: achInfo.level,
      date: new Date(2024, 6 + (i % 6), 10)
    });
  }
  await StudentAchievement.insertMany(studentAchievements);

  // C. Seed Faculty Achievements
  const facultyAchievements = [];
  const fAchievementsList = [
    { title: "Published Research Paper in IEEE Trans on Big Data", category: "Publication", level: "International" },
    { title: "Smart Healthcare Alert Device Patent Granted", category: "Patent", level: "National" },
    { title: "Best Session Chair at Springer ICCIDS 2024", category: "Conference", level: "International" },
    { title: "Conducted 5-day national workshop on AI Tools in Outcome Based Education", category: "Workshop", level: "National" },
    { title: "Received State Best Teacher Award on Teacher's Day", category: "Award", level: "State" },
    { title: "DST Sanctioned Research Project Grant of 25 Lakhs", category: "Grant", level: "National" }
  ];

  facultyList.forEach((fac, idx) => {
    // 50% of faculty have achievements
    if (idx % 2 === 0) {
      const ach = fAchievementsList[idx % fAchievementsList.length];
      facultyAchievements.push({
        faculty: fac.user,
        department: fac.department,
        title: ach.title,
        category: ach.category,
        level: ach.level,
        date: new Date(2024, 3 + (idx % 8), 10)
      });
    }
  });
  await FacultyAchievement.insertMany(facultyAchievements);
  console.log("Achievements seeded successfully.");

  // 11. Seed Student Activities and Student Events
  console.log("Seeding Student Activities and Events...");
  const studentActivities = [];
  const studentEvents = [];

  const activityList = [
    { category: "Hackathon", title: "Smart India Hackathon", description: "Built student quality analytics portal" },
    { category: "Workshop", title: "Deep Learning Bootcamp", description: "Learned neural network architectures" },
    { category: "Technical Event", title: "CodeSprint Round 2", description: "Secured top-10 in coding speed contest" },
    { category: "Club Participation", title: "NSS Volunteer Drive", description: "Participated in village clean-up campaign" }
  ];

  const eventList = [
    { eventName: "Advanced Cloud Architecture Seminar", eventType: "Seminar", level: "Institute", participationType: "Participant" },
    { eventName: "Inter College Coding Hackathon", eventType: "Hackathon", level: "State", participationType: "Winner" },
    { eventName: "State Level Volleyball Championship", eventType: "Sports", level: "State", participationType: "Participant" },
    { eventName: "Techno Fest Robo-Wars", eventType: "Technical", level: "National", participationType: "Organizer" }
  ];

  // Assign to first 50 students
  for (let i = 0; i < 50; i++) {
    const student = insertedStudents[i];
    const act = activityList[i % activityList.length];
    studentActivities.push({
      student: student._id,
      semester: student.currentSemester,
      category: act.category,
      title: act.title,
      description: act.description,
      date: new Date(2024, 7 + (i % 5), 20)
    });

    const ev = eventList[i % eventList.length];
    studentEvents.push({
      student: student._id,
      department: student.department,
      eventName: ev.eventName,
      eventType: ev.eventType,
      level: ev.level,
      participationType: ev.participationType,
      date: new Date(2024, 7 + (i % 5), 22),
      academicYear: "2024-25",
      enteredBy: adminUser1._id
    });
  }

  await StudentActivity.insertMany(studentActivities);
  await StudentEvent.insertMany(studentEvents);
  console.log("Student Activities and Events seeded.");

  // 12. Seed Announcements
  console.log("Seeding Announcements...");
  const announcements = [
    { title: "Mid-Semester Examination Timetable Released", body: "The mid-sem exam timetable is uploaded on the ERP portal. Exams start next Monday.", category: "Exam", audienceRoles: ["student", "faculty"], active: true },
    { title: "NAAC Accreditation Evidence Submission Deadline", body: "HODs and Criteria Leads must upload final audited evidence files before the 30th of this month.", category: "General", audienceRoles: ["faculty"], active: true },
    { title: "Capgemini Recruitment Drive Registration", body: "Capgemini is visiting for campus placements. Final year B.Tech students (all branches) with CGPA > 6.0 register on placement portal.", category: "Placement", audienceRoles: ["student"], active: true },
    { title: "Internal Hackathon for Smart India Hackathon (SIH)", body: "Registrations are open for the college internal hackathon. Winners represent the college in SIH.", category: "Event", audienceRoles: ["student"], active: true },
    { title: "5-Day FDP on AI Tools in Education", body: "IQAC is organizing a Faculty Development Program on leveraging Large Language Models in technical classrooms.", category: "General", audienceRoles: ["faculty"], active: true },
    { title: "Attendance Shortage List Published", body: "Please review the attendance shortage lists for current semesters. Students with < 75% attendance must meet their mentors.", category: "General", audienceRoles: ["student", "faculty"], active: true }
  ];
  await Announcement.insertMany(announcements);
  console.log("Announcements seeded.");

  // 13. Seed Report Logs
  console.log("Seeding Report Logs...");
  const reportLogs = [
    { reportType: "STUDENT_PROGRESS", generatedBy: adminUser1._id, filters: { department: cseDept._id, semester: 4 }, format: "PDF" },
    { reportType: "DEPARTMENT_PERFORMANCE", generatedBy: adminUser1._id, filters: { department: cseDept._id }, format: "EXCEL" },
    { reportType: "CGPA_DISTRIBUTION", generatedBy: adminUser2._id, filters: {}, format: "PDF" },
    { reportType: "BACKLOG_ANALYSIS", generatedBy: adminUser1._id, filters: { semester: 6 }, format: "PDF" },
    { reportType: "PLACEMENT", generatedBy: adminUser2._id, filters: { academicYear: "2024-25" }, format: "EXCEL" },
    { reportType: "FACULTY_CONTRIBUTION", generatedBy: adminUser1._id, filters: { department: cseDept._id }, format: "PDF" }
  ];
  await ReportLog.insertMany(reportLogs);
  console.log("Report logs seeded.");

  // 14. Seed Department Stats
  console.log("Seeding Department Stats...");
  const deptStats = [];
  const testSems = [3, 4, 5, 6, 7, 8];

  for (const dept of departments) {
    testSems.forEach((sem) => {
      // Calculate realistic metrics
      const averageCgpa = 7.1 + Math.random() * 1.2;
      const backlogRate = 12 + Math.floor(Math.random() * 18);
      const internshipRate = 45 + Math.floor(Math.random() * 40);
      const placementRate = 60 + Math.floor(Math.random() * 30);

      deptStats.push({
        department: dept._id,
        semester: sem,
        academicYear: "2024-25",
        averageCgpa: Number(averageCgpa.toFixed(2)),
        backlogRate: Number(backlogRate.toFixed(2)),
        internshipParticipationPercent: internshipRate,
        placementRate: placementRate
      });
    });
  }
  await DepartmentStat.insertMany(deptStats);
  console.log("Department stats seeded.");

  // Final Output
  console.log("\nSeeding Complete! Summary of seeded database collections:");
  console.log("---------------------------------------------------------");
  console.log(`Departments:           ${await Department.countDocuments()}`);
  console.log(`Students:              ${await Student.countDocuments()}`);
  console.log(`Users:                 ${await User.countDocuments()}`);
  console.log(`Attendance Records:    ${await Attendance.countDocuments()}`);
  console.log(`Marks Records:         ${await Mark.countDocuments()}`);
  console.log(`Student Activities:    ${await StudentActivity.countDocuments()}`);
  console.log(`Announcements:         ${await Announcement.countDocuments()}`);
  console.log(`Teaching Assignments:  ${await TeachingAssignment.countDocuments()}`);
  console.log(`Sections:              ${await Section.countDocuments()}`);
  console.log(`Department Stats:      ${await DepartmentStat.countDocuments()}`);
  console.log(`Student Achievements:  ${await StudentAchievement.countDocuments()}`);
  console.log(`Faculty Achievements:  ${await FacultyAchievement.countDocuments()}`);
  console.log(`Accreditation Items:   ${await AccreditationItem.countDocuments()}`);
  console.log(`Achievements (Root):   ${await Achievement.countDocuments()}`);
  console.log(`Faculty Records:       ${await Faculty.countDocuments()}`);
  console.log(`Placements:            ${await Placement.countDocuments()}`);
  console.log(`Research/Publications: ${await Research.countDocuments()}`);
  console.log(`Report Logs:           ${await ReportLog.countDocuments()}`);
  console.log(`Section Allocations:   ${await SectionAllocation.countDocuments()}`);
  console.log(`Student Events:        ${await StudentEvent.countDocuments()}`);
  console.log("---------------------------------------------------------");

  console.log("\nGuaranteed Demo Test Credentials:");
  console.log("Admin account:     admin@iqac.edu / Admin@123");
  console.log("HOD account:       hod.cse@iqac.edu / Admin@123");
  console.log("Faculty account:   faculty.cse@iqac.edu / Admin@123");
  console.log("Student account:   ravi@student.iqac.edu / Admin@123");

  process.exit(0);
};

run().catch((error) => {
  console.error("Database seeding failed:", error);
  process.exit(1);
});
