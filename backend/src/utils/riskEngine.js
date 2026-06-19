export const evaluateRisk = ({ attendancePercent, backlogCount, cgpa, previousCgpa }) => {
  let score = 0;

  if (attendancePercent < 60) score += 3;
  else if (attendancePercent < 75) score += 2;

  if (backlogCount >= 3) score += 3;
  else if (backlogCount > 0) score += 2;

  if (cgpa < 6) score += 3;
  else if (cgpa < 7) score += 2;

  if (typeof previousCgpa === "number" && previousCgpa - cgpa >= 0.5) {
    score += 1;
  }

  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  return "LOW";
};

/**
 * Calculates Action Priority Score (0-100)
 */
export const calculateActionPriorityScore = (input) => {
  const {
    attendancePercent = 100,
    cgpa = 10,
    sgpa = null,
    previousCgpa = null,
    previousSgpa = null,
    backlogCount = 0,
    failedSubjects = 0,
    placementReadiness = 100,
    accreditationCompletion = 100,
    coCurricularCount = 5,
    coreSubjectAvg = 100
  } = input;

  let score = 0;
  const drivers = [];
  const reasons = [];
  const recommendedActions = [];

  // 1. Attendance risk
  if (attendancePercent < 60) {
    score += 25;
    drivers.push("low_attendance");
    reasons.push("Attendance below safe threshold (<60%)");
    recommendedActions.push("Schedule mentor meeting within 7 days");
  } else if (attendancePercent < 70) {
    score += 18;
    drivers.push("low_attendance");
    reasons.push("Attendance in warning zone (60-70%)");
    recommendedActions.push("Issue attendance warning letter");
  } else if (attendancePercent < 75) {
    score += 10;
    drivers.push("low_attendance");
    reasons.push("Attendance below 75% NBA threshold");
    recommendedActions.push("Counsel student to improve class presence");
  }

  // 2. CGPA/SGPA risk
  if (cgpa < 6) {
    score += 18;
    drivers.push("cgpa_decline");
    reasons.push("CGPA is critically low (<6.0)");
    recommendedActions.push("Assign peer tutor for academic support");
  } else if (cgpa < 7) {
    score += 10;
    drivers.push("cgpa_decline");
    reasons.push("CGPA is marginal (6.0-7.0)");
    recommendedActions.push("Suggest study group involvement");
  }

  // SGPA drop
  const gpDrop = previousCgpa !== null ? previousCgpa - cgpa : (previousSgpa !== null && sgpa !== null ? previousSgpa - sgpa : 0);
  if (gpDrop >= 0.5) {
    score += 12;
    if (!drivers.includes("cgpa_decline")) drivers.push("cgpa_decline");
    reasons.push("Significant academic performance drop detected");
    recommendedActions.push("Conduct root-cause counseling on academic slide");
  } else if (gpDrop > 0.1) {
    score += 8;
    if (!drivers.includes("cgpa_decline")) drivers.push("cgpa_decline");
    reasons.push("Minor decline in semester grades");
  }

  // 3. Backlog risk
  if (backlogCount >= 3) {
    score += 20;
    drivers.push("active_backlogs");
    reasons.push("Critical backlog count (3 or more)");
    recommendedActions.push("Schedule counselor meeting immediately");
  } else if (backlogCount > 0) {
    score += 10;
    drivers.push("active_backlogs");
    reasons.push("Active backlogs increase academic risk");
    recommendedActions.push("Clear backlogs in upcoming supplementary exams");
  }

  // 4. Subject failure concentration (current semester)
  if (failedSubjects >= 3) {
    score += 15;
    drivers.push("subject_failures");
    reasons.push("Multiple subject failures in the current term");
    recommendedActions.push("Assign remedial classes for failed subjects");
  } else if (failedSubjects > 0) {
    score += 8;
    drivers.push("subject_failures");
    reasons.push("Subject failures detected in semester results");
    recommendedActions.push("Enroll in remedial coaching classes");
  }

  // 5. Placement readiness weakness
  if (placementReadiness < 50) {
    score += 12;
    drivers.push("placement_readiness_gap");
    reasons.push("Placement readiness below target recruiter benchmarks");
    recommendedActions.push("Start DSA/Aptitude bootcamp");
  } else if (placementReadiness < 65) {
    score += 7;
    drivers.push("placement_readiness_gap");
    reasons.push("Placement readiness is marginal");
    recommendedActions.push("Schedule mock interviews and resume reviews");
  }

  // 6. Accreditation evidence gap
  if (accreditationCompletion < 70) {
    score += 12;
    drivers.push("accreditation_gap");
    reasons.push("Accreditation evidence uploads are severely lagging");
    recommendedActions.push("Prioritize pending accreditation evidence");
  } else if (accreditationCompletion < 85) {
    score += 6;
    drivers.push("accreditation_gap");
    reasons.push("Accreditation documents require review or uploads");
    recommendedActions.push("Review department-level bottleneck with HOD");
  }

  // 7. Co-curricular / skill proxy weakness
  if (coCurricularCount < 2 || coreSubjectAvg < 60) {
    score += 10;
    drivers.push("low_engagement");
    reasons.push("Low technical workshop/hackathon engagement");
    recommendedActions.push("Enroll in technical skills workshop");
  } else if (coCurricularCount < 4 || coreSubjectAvg < 70) {
    score += 6;
    drivers.push("low_engagement");
    reasons.push("Marginal technical participation or core performance");
  }

  // Clamp score
  score = Math.min(score, 100);

  let severity = "low";
  if (score >= 80) severity = "critical";
  else if (score >= 60) severity = "high";
  else if (score >= 40) severity = "moderate";

  return {
    score,
    severity,
    drivers: drivers.length > 0 ? drivers : ["low_risk"],
    reasons: reasons.length > 0 ? reasons : ["Satisfactory academic performance"],
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : ["Maintain current academic progress"]
  };
};

/**
 * Calculates Placement Readiness Score (0-100)
 */
export const calculatePlacementReadinessScore = (input) => {
  const {
    cgpa = 0,
    backlogCount = 0,
    attendance = 100,
    passedCoreSubjects = 0,
    coCurricularCount = 0,
    deptPlacementRate = 70
  } = input;

  let score = 0;
  const weakAreas = [];
  const reasons = [];

  // Base score from CGPA
  score += cgpa * 8; // e.g. 8.0 CGPA gives 64 points base

  // Eligibility filter penalty
  if (cgpa < 6.0) {
    score -= 20;
    weakAreas.push("academic_standing");
    reasons.push("CGPA is below standard recruiter cut-off (6.0)");
  } else if (cgpa < 6.5) {
    weakAreas.push("academic_standing");
    reasons.push("CGPA is below tier-1 company cut-off (6.5)");
  }

  // Backlogs penalty
  if (backlogCount >= 3) {
    score -= 30;
    weakAreas.push("active_backlogs");
    reasons.push("High active backlog count restricts campus recruitment");
  } else if (backlogCount > 0) {
    score -= 15;
    weakAreas.push("active_backlogs");
    reasons.push("Active backlogs must be cleared for standard drives");
  }

  // Attendance influence
  if (attendance >= 80) {
    score += 10;
  } else if (attendance < 75) {
    score -= 10;
    weakAreas.push("attendance_shortage");
    reasons.push("Low attendance affects career registration status");
  }

  // Co-curricular / Skill proxy
  score += Math.min(coCurricularCount * 4, 16);
  if (coCurricularCount < 2) {
    weakAreas.push("technical_profile");
    reasons.push("Insufficient hackathon, project, or technical event experience");
  }

  // Core Subjects passed
  score += Math.min(passedCoreSubjects * 3, 12);
  if (passedCoreSubjects < 3) {
    weakAreas.push("core_engineering_competency");
    reasons.push("Need stronger performance in core engineering subjects");
  }

  // Dept Placement Rate Context
  score += deptPlacementRate * 0.1;

  // Clamp score
  score = Math.max(0, Math.min(Math.round(score), 100));

  let status = "low";
  if (score >= 75 && backlogCount === 0 && cgpa >= 6.0) {
    status = "ready";
  } else if (score >= 50) {
    status = "moderate";
  }

  return {
    score,
    status,
    weakAreas,
    reasons: reasons.length > 0 ? reasons : ["Eligible for placements"]
  };
};

/**
 * Builds intervention recommendation response
 */
export const buildInterventionRecommendation = (priorityItem) => {
  const { label, score, severity, drivers = [], entityType = "student" } = priorityItem;

  const typeLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const title = `Intervention Strategy for ${typeLabel}: ${label}`;
  const summary = `${typeLabel} '${label}' exhibits ${severity.toUpperCase()} urgency with an Action Priority Score of ${score}/100. Key drivers: ${drivers.join(", ")}.`;

  const immediateActions = [];
  let expectedImpact = "Reduce academic risk and prevent regression";
  let timeline = "Next 7-14 Days";

  if (drivers.includes("low_attendance")) {
    immediateActions.push("Send automated attendance alert to parents and advisors.");
    immediateActions.push("Verify medical certificates or genuine absence reasons.");
    expectedImpact = "Bring attendance back above 75% threshold.";
  }
  if (drivers.includes("active_backlogs") || drivers.includes("subject_failures")) {
    immediateActions.push("Enroll in student-support remedial classes.");
    immediateActions.push("Distribute course materials and past papers.");
    expectedImpact = "Increase pass probability in upcoming examinations.";
  }
  if (drivers.includes("placement_readiness_gap")) {
    immediateActions.push("Recommend placement portal registration and basic coding test.");
    immediateActions.push("Schedule mandatory counseling with placement officer.");
    expectedImpact = "Qualify student for upcoming recruitment drives.";
  }
  if (drivers.includes("accreditation_gap")) {
    immediateActions.push("Flag outstanding NAAC/NBA files to department accreditation coordinator.");
    expectedImpact = "Secure compliance documentation ahead of quality audit audit visits.";
  }
  if (drivers.includes("cgpa_decline")) {
    immediateActions.push("Arrange one-on-one session with academic mentor.");
    expectedImpact = "Identify drop vectors and implement course corrections.";
  }

  if (immediateActions.length === 0) {
    immediateActions.push("Continue monitoring progress during bi-weekly reviews.");
  }

  return {
    title,
    summary,
    immediateActions,
    expectedImpact,
    timeline
  };
};

/**
 * Calculates a numeric dropout risk percentage from academic inputs.
 */
export const calculateDropoutRiskPercent = (attendancePercent, cgpa, backlogCount) => {
  let risk = (100 - attendancePercent) * 0.5 + (8 - cgpa) * 12 + backlogCount * 10;
  return Math.max(0, Math.min(Math.round(risk), 100));
};

/**
 * Simulates intervention impact on metrics.
 */
export const simulateInterventionImpact = (baseMetrics, adjustments) => {
  const {
    attendancePercent = 75,
    cgpa = 7.0,
    sgpa = null,
    previousCgpa = null,
    previousSgpa = null,
    backlogCount = 0,
    failedSubjects = 0,
    placementReadiness = 50,
    accreditationCompletion = 70,
    coCurricularCount = 1,
    coreSubjectAvg = 70
  } = baseMetrics;

  const {
    attendanceDelta = 0,
    mentorMeetings = 0,
    remedialSessions = 0,
    skillBootcamp = false,
    expectedBacklogsCleared = 0,
    evidenceItemsCompleted = 0
  } = adjustments;

  // 1. Current State Calculations
  const currentDropoutRisk = calculateDropoutRiskPercent(attendancePercent, cgpa, backlogCount);
  
  const currentPR = calculatePlacementReadinessScore({
    cgpa,
    backlogCount,
    attendance: attendancePercent,
    passedCoreSubjects: Math.max(0, 5 - failedSubjects),
    coCurricularCount,
    deptPlacementRate: 70
  });

  const currentAPS = calculateActionPriorityScore({
    attendancePercent,
    cgpa,
    sgpa,
    previousCgpa,
    previousSgpa,
    backlogCount,
    failedSubjects,
    placementReadiness: currentPR.score,
    accreditationCompletion,
    coCurricularCount,
    coreSubjectAvg
  });

  // 2. Projected State Calculations
  const projectedAttendance = Math.min(attendancePercent + Number(attendanceDelta), 100);
  const projectedBacklogs = Math.max(backlogCount - Number(expectedBacklogsCleared), 0);
  const projectedFailedSubjects = Math.max(failedSubjects - Number(remedialSessions), 0);
  const projectedAccreditation = Math.min(accreditationCompletion + Number(evidenceItemsCompleted) * 5, 100);
  const projectedCoCurricular = coCurricularCount + (skillBootcamp ? 1 : 0);
  const projectedCoreAvg = coreSubjectAvg + (remedialSessions > 0 ? Math.min(remedialSessions * 2.5, 10) : 0);

  const projectedDropoutRisk = calculateDropoutRiskPercent(projectedAttendance, cgpa, projectedBacklogs);

  const projectedPR = calculatePlacementReadinessScore({
    cgpa,
    backlogCount: projectedBacklogs,
    attendance: projectedAttendance,
    passedCoreSubjects: Math.max(0, 5 - projectedFailedSubjects),
    coCurricularCount: projectedCoCurricular,
    deptPlacementRate: 70
  });

  let finalProjectedPRScore = projectedPR.score;
  if (skillBootcamp) {
    finalProjectedPRScore = Math.min(finalProjectedPRScore + 15, 100);
  }

  const projectedAPS = calculateActionPriorityScore({
    attendancePercent: projectedAttendance,
    cgpa,
    sgpa,
    previousCgpa,
    previousSgpa,
    backlogCount: projectedBacklogs,
    failedSubjects: projectedFailedSubjects,
    placementReadiness: finalProjectedPRScore,
    accreditationCompletion: projectedAccreditation,
    coCurricularCount: projectedCoCurricular,
    coreSubjectAvg: projectedCoreAvg
  });

  let finalProjectedAPSScore = Math.max(projectedAPS.score - Number(mentorMeetings) * 3, 0);
  let finalProjectedDropoutRisk = Math.max(projectedDropoutRisk - Number(mentorMeetings) * 4 - Number(remedialSessions) * 2, 0);

  // 3. Explanation and Recommendation Generation
  const explanation = [];
  if (Number(attendanceDelta) > 0) {
    explanation.push(`Attendance is projected to rise by +${attendanceDelta}%, reducing attendance risk.`);
  }
  if (Number(mentorMeetings) > 0) {
    explanation.push(`Scheduling ${mentorMeetings} mentoring sessions will improve study direction and academic support.`);
  }
  if (Number(remedialSessions) > 0) {
    explanation.push(`Attending ${remedialSessions} remedial tutoring sessions will help address subject-specific difficulties.`);
  }
  if (skillBootcamp) {
    explanation.push(`DSA + Aptitude Bootcamp will improve coding competency and recruiter eligibility.`);
  }
  if (Number(expectedBacklogsCleared) > 0) {
    explanation.push(`Clearing ${expectedBacklogsCleared} backlogs will open eligibility for high-profile recruiting drives.`);
  }
  if (Number(evidenceItemsCompleted) > 0) {
    explanation.push(`Uploading ${evidenceItemsCompleted} evidence documents resolves outstanding NBA/NAAC verification gaps.`);
  }

  if (explanation.length === 0) {
    explanation.push("No interventions simulated yet. Adjust inputs to see impact.");
  }

  let recommendedNextStep = "Monitor performance and record weekly attendance metrics.";
  if (finalProjectedAPSScore >= 70) {
    recommendedNextStep = "Academic priority remains HIGH. Arrange immediate parent-advisor consult.";
  } else if (finalProjectedPRScore < 60 && cgpa >= 6.0) {
    recommendedNextStep = "Enroll in coding bootcamp immediately to bridge the technical gap.";
  } else if (projectedAttendance < 75) {
    recommendedNextStep = "Issue attendance warning letter and prioritize class attendance monitoring.";
  } else if (projectedBacklogs > 0) {
    recommendedNextStep = "Register student for supplementary examinations to clear remaining backlogs.";
  }

  return {
    current: {
      actionPriorityScore: currentAPS.score,
      dropoutRisk: currentDropoutRisk,
      placementReadiness: currentPR.score,
      accreditationReadiness: Math.round(accreditationCompletion)
    },
    projected: {
      actionPriorityScore: Math.round(finalProjectedAPSScore),
      dropoutRisk: Math.round(finalProjectedDropoutRisk),
      placementReadiness: Math.round(finalProjectedPRScore),
      accreditationReadiness: Math.round(projectedAccreditation)
    },
    deltas: {
      actionPriorityScore: Math.round(finalProjectedAPSScore) - currentAPS.score,
      dropoutRisk: Math.round(finalProjectedDropoutRisk) - currentDropoutRisk,
      placementReadiness: Math.round(finalProjectedPRScore) - currentPR.score,
      accreditationReadiness: Math.round(projectedAccreditation) - Math.round(accreditationCompletion)
    },
    explanation,
    recommendedNextStep
  };
};

