import Student from "../models/Student.js";
import Department from "../models/Department.js";
import Mark from "../models/Mark.js";
import StudentEvent from "../models/StudentEvent.js";
import Placement from "../models/Placement.js";
import AccreditationItem from "../models/AccreditationItem.js";
import {
  calculateActionPriorityScore,
  calculatePlacementReadinessScore
} from "./riskEngine.js";

export async function computePriorityQueueAndOverview(filters = {}) {
  const { department, semester, severity } = filters;

  const [depts, students, marks, events, placements, accItems] = await Promise.all([
    Department.find().lean(),
    Student.find().populate("department", "name code").lean(),
    Mark.find().lean(),
    StudentEvent.find().lean(),
    Placement.find().lean(),
    AccreditationItem.find().lean()
  ]);

  const deptMap = {};
  depts.forEach(d => {
    deptMap[d._id.toString()] = d;
  });

  const studentMarksMap = {};
  marks.forEach(m => {
    const sid = m.student.toString();
    if (!studentMarksMap[sid]) studentMarksMap[sid] = [];
    studentMarksMap[sid].push(m);
  });

  const studentEventsMap = {};
  events.forEach(e => {
    const sid = e.student.toString();
    studentEventsMap[sid] = (studentEventsMap[sid] || 0) + 1;
  });

  const accDeptMap = {};
  accItems.forEach(item => {
    if (!item.department) return;
    const did = item.department.toString();
    if (!accDeptMap[did]) accDeptMap[did] = { total: 0, completed: 0 };
    accDeptMap[did].total++;
    if (item.completed) accDeptMap[did].completed++;
  });

  const placementDeptMap = {};
  placements.forEach(p => {
    const did = p.department.toString();
    const rate = p.totalEligible > 0 ? (p.totalPlaced / p.totalEligible) * 100 : 0;
    placementDeptMap[did] = rate;
  });

  const items = [];

  // Students
  students.forEach(s => {
    const did = s.department?._id?.toString() || "";
    const dCode = s.department?.code || "NA";
    const sMarks = studentMarksMap[s._id.toString()] || [];
    const failedSubjects = sMarks.filter(m => !m.passed).length;
    const latestMetric = s.metrics?.at(-1) || {};
    const previousMetric = s.metrics?.length > 1 ? s.metrics[s.metrics.length - 2] : null;
    const coCurricularCount = studentEventsMap[s._id.toString()] || 0;
    const coreSubjectAvg = sMarks.length > 0 ? sMarks.reduce((sum, m) => sum + m.total, 0) / sMarks.length : 100;
    const deptPlacementRate = placementDeptMap[did] || 70;
    const accRate = accDeptMap[did] ? (accDeptMap[did].completed / accDeptMap[did].total) * 100 : 100;

    const prResult = calculatePlacementReadinessScore({
      cgpa: latestMetric.cgpa || 0,
      backlogCount: latestMetric.backlogCount || 0,
      attendance: latestMetric.attendancePercent || 100,
      passedCoreSubjects: sMarks.filter(m => m.passed).length,
      coCurricularCount,
      deptPlacementRate
    });

    const priorityResult = calculateActionPriorityScore({
      attendancePercent: latestMetric.attendancePercent || 100,
      cgpa: latestMetric.cgpa || 10,
      sgpa: latestMetric.sgpa || null,
      previousCgpa: previousMetric?.cgpa || null,
      previousSgpa: previousMetric?.sgpa || null,
      backlogCount: latestMetric.backlogCount || 0,
      failedSubjects,
      placementReadiness: prResult.score,
      accreditationCompletion: accRate,
      coCurricularCount,
      coreSubjectAvg
    });

    items.push({
      id: `student_${s._id}`,
      entityType: "student",
      label: `${s.name} (${s.rollNo})`,
      score: priorityResult.score,
      severity: priorityResult.severity,
      drivers: priorityResult.drivers,
      reasons: priorityResult.reasons,
      recommendedActions: priorityResult.recommendedActions,
      department: dCode,
      semester: s.currentSemester,
      metrics: {
        cgpa: latestMetric.cgpa || null,
        attendancePercent: latestMetric.attendancePercent || null,
        backlogCount: latestMetric.backlogCount || null,
        failedSubjects,
        placementReadiness: prResult.score,
        accreditationCompletion: accRate
      }
    });
  });

  // Cohorts
  const cohortGroups = {};
  students.forEach(s => {
    const did = s.department?._id?.toString() || "";
    const dCode = s.department?.code || "NA";
    const sem = s.currentSemester;
    const key = `${dCode}_Sem${sem}`;
    if (!cohortGroups[key]) {
      cohortGroups[key] = { dCode, did, semester: sem, students: [] };
    }
    cohortGroups[key].students.push(s);
  });

  Object.entries(cohortGroups).forEach(([key, group]) => {
    const gStudents = group.students;
    const count = gStudents.length;
    if (count === 0) return;

    let attSum = 0, cgpaSum = 0, backlogSum = 0, failedSum = 0;
    let previousCgpaSum = 0, previousCount = 0;

    gStudents.forEach(s => {
      const latestMetric = s.metrics?.at(-1) || {};
      const previousMetric = s.metrics?.length > 1 ? s.metrics[s.metrics.length - 2] : null;
      attSum += latestMetric.attendancePercent || 100;
      cgpaSum += latestMetric.cgpa || 10;
      backlogSum += latestMetric.backlogCount || 0;
      const sMarks = studentMarksMap[s._id.toString()] || [];
      failedSum += sMarks.filter(m => !m.passed).length;
      if (previousMetric) {
        previousCgpaSum += previousMetric.cgpa;
        previousCount++;
      }
    });

    const avgAtt = attSum / count;
    const avgCgpa = cgpaSum / count;
    const avgBacklogs = backlogSum / count;
    const avgFailed = failedSum / count;
    const avgPreviousCgpa = previousCount > 0 ? previousCgpaSum / previousCount : null;
    const accRate = accDeptMap[group.did] ? (accDeptMap[group.did].completed / accDeptMap[group.did].total) * 100 : 100;

    const cohortPr = calculatePlacementReadinessScore({
      cgpa: avgCgpa,
      backlogCount: avgBacklogs,
      attendance: avgAtt,
      passedCoreSubjects: 5,
      coCurricularCount: 3,
      deptPlacementRate: placementDeptMap[group.did] || 70
    });

    const cohortPriority = calculateActionPriorityScore({
      attendancePercent: avgAtt,
      cgpa: avgCgpa,
      previousCgpa: avgPreviousCgpa,
      backlogCount: avgBacklogs,
      failedSubjects: avgFailed,
      placementReadiness: cohortPr.score,
      accreditationCompletion: accRate,
      coCurricularCount: 4,
      coreSubjectAvg: 75
    });

    items.push({
      id: `cohort_${group.dCode}_sem${group.semester}`,
      entityType: "cohort",
      label: `${group.dCode} Semester ${group.semester} Cohort`,
      score: cohortPriority.score,
      severity: cohortPriority.severity,
      drivers: cohortPriority.drivers,
      reasons: cohortPriority.reasons,
      recommendedActions: cohortPriority.recommendedActions,
      department: group.dCode,
      semester: group.semester,
      metrics: {
        cgpa: Number(avgCgpa.toFixed(2)),
        attendancePercent: Number(avgAtt.toFixed(1)),
        backlogCount: Number(avgBacklogs.toFixed(1)),
        failedSubjects: Number(avgFailed.toFixed(1)),
        placementReadiness: cohortPr.score,
        accreditationCompletion: accRate
      }
    });
  });

  // Filter items
  let filteredItems = items;
  if (department) {
    filteredItems = filteredItems.filter(item => item.department?.toLowerCase() === department.toLowerCase());
  }
  if (semester) {
    filteredItems = filteredItems.filter(item => Number(item.semester) === Number(semester));
  }
  if (severity) {
    filteredItems = filteredItems.filter(item => item.severity?.toLowerCase() === severity.toLowerCase());
  }

  filteredItems.sort((a, b) => b.score - a.score);

  const criticalCount = filteredItems.filter(item => item.severity === "critical").length;
  const highCount = filteredItems.filter(item => item.severity === "high").length;
  const averageScore = filteredItems.length > 0
    ? Math.round(filteredItems.reduce((sum, item) => sum + item.score, 0) / filteredItems.length)
    : 0;

  const topEntityItem = filteredItems[0] || null;

  return {
    items: filteredItems,
    summary: {
      criticalCount,
      highCount,
      averageScore,
      topEntityItem
    }
  };
}
