# College Digital Twin: Intelligence Layer Data Mapping

This document maps the existing Internal Quality Assurance Cell (IQAC) / College Digital Twin data structures into high-level intelligence metrics, defining immediate calculations, fallback needs, mathematical formulas, and the implementation roadmap.

---

## 1. Existing Data Sources Found

The database contains a rich schema spanning academic, placement, faculty research, and accreditation data. The following primary sources are available:

1. **`Student` (Mongoose Model: `backend/src/models/Student.js`)**
   - **Fields**: `rollNo`, `name`, `email`, `department` (ObjectId), `section`, `currentSemester`, `batch`, `riskLevel` (`LOW`, `MEDIUM`, `HIGH`).
   - **Metrics History (`metrics` array)**: `semester`, `academicYear`, `sgpa`, `cgpa`, `backlogCount`, `attendancePercent`.

2. **`Mark` (Mongoose Model: `backend/src/models/Mark.js`)**
   - **Fields**: `student` (ObjectId), `subjectCode`, `subjectName`, `semester`, `academicYear`, `internal`, `external`, `total` marks, `grade`, `credits`, `passed` (Boolean).

3. **`Attendance` (Mongoose Model: `backend/src/models/Attendance.js`)**
   - **Fields**: `student` (ObjectId), `semester`, `academicYear`, `totalClasses`, `attendedClasses`, `percentage`.
   - **Subject-wise Details (`subjects` array)**: `subjectCode`, `subjectName`, `classesConducted`, `classesAttended`, `percentage`.

4. **`Placement` (Mongoose Model: `backend/src/models/Placement.js`)**
   - *Note: This is a department-level aggregate model, not individual-level.*
   - **Fields**: `department` (ObjectId), `academicYear`, `totalEligible`, `totalPlaced`, `highestPackageLPA`, `medianPackageLPA`, `majorRecruiters`.

5. **`Faculty` (Mongoose Model: `backend/src/models/Faculty.js`)**
   - **Fields**: `user` (ObjectId), `department` (ObjectId), `name`, `employeeId`, `designation`, `qualification`, `experience`, `sections`, `subjects` handled, `publications` count, `patents`.

6. **`Research` (Mongoose Model: `backend/src/models/Research.js`)**
   - **Fields**: `department` (ObjectId), `faculty` (ObjectId), `title`, `publicationType` (`Journal`, `Conference`, `Patent`, `Book Chapter`), `journalOrConference`, `publishedOn`, `accreditationCriteria`.

7. **`StudentAchievement` (Mongoose Model: `backend/src/models/StudentAchievement.js`)**
   - **Fields**: `student` (ObjectId), `department` (ObjectId), `eventName`, `title`, `category` (`Hackathon`, `Research`, `Project Competition`, `Sports`, `Cultural`), `level` (`College`, `State`, `National`, `International`), `date`.

8. **`StudentActivity` & `StudentEvent` (Mongoose Models)**
   - **Fields**: Event participation, event category (`Workshop`, `Seminar`, `Hackathon`, etc.), levels, and dates.

9. **`AccreditationItem` (Mongoose Model: `backend/src/models/AccreditationItem.js`)**
   - **Fields**: `title`, `body`, `type` (`NAAC`, `NBA`, `AUDIT`), `criterion`, `department` (ObjectId), `academicYear`, `evidenceUrl`, `completed` (Boolean).

---

## 2. Metrics Calculation Analysis

### Metrics Calculable Immediately
* **Dropout / Academic Risk**: Can be immediately derived from student metrics (`attendancePercent < 75%`, `backlogCount > 0`, and negative CGPA trend/drop between semesters).
* **Accreditation Gap Intelligence**: Calculated at the department/year level by taking the ratio of completed vs. total items from the `AccreditationItem` model.
* **Academic Bottlenecks**: Identifies subject-wise failure rates using the `Mark` model (`passed === false` aggregated by `subjectCode`) and semester-wise pass rates.
* **Faculty Workload & Contribution**: Calculated using the publications count in `Faculty.publications`, research papers in `Research`, and classes allocated.
* **Co-curricular Engagement**: Derived from `StudentEvent` and `StudentAchievement` counts per student.

### Metrics Requiring Fallback / Static Values
* **Student-Level Skills**: The `Student` model does not store specific programming or technical skills (e.g. "React", "Python").
  * *Fallback*: Map technical skills based on the subjects completed under `Mark.subjectName` (e.g. if passed "Data Structures", assign Java/C++ skill) or co-curricular workshop titles in `StudentEvent`, with standard default fallbacks.
* **Certifications**: Individual student certification records are not modeled.
  * *Fallback*: Treat workshops/seminars from `StudentEvent` or activities from `StudentActivity` as proxies, or supply a default average status.
* **Individual Placement Readiness (Aptitude & Interview Scores)**: Database models do not store mock interview performance or aptitude scores.
  * *Fallback*: Use static placeholders or calculate an inferred aptitude factor (e.g. proportional to CGPA and core subject grades).

---

## 3. Suggested Formulas for Intelligence Metrics

### A. Action Priority Score (APS)
Helps administrators identify students needing immediate intervention (scaled from 0 to 100).
$$APS = w_1 \cdot (100 - \text{Attendance}\%) + w_2 \cdot (100 - \text{CGPA} \times 10) + w_3 \cdot \min(\text{Backlogs} \times 25, 100) + w_4 \cdot (100 - \text{EngagementBonus})$$

*Where:*
- $w_1 = 0.35$ (Attendance Weight)
- $w_2 = 0.30$ (CGPA Weight)
- $w_3 = 0.25$ (Backlogs Weight)
- $w_4 = 0.10$ (Extra-curricular Activity Gap Weight)
- $\text{EngagementBonus} = \min(\text{TechnicalEventsCount} \times 20, 100)$ (from `StudentEvent` / `StudentAchievement`)
- *Penalty Boost*: If Attendance < 60% OR Backlogs $\ge$ 3, apply a static $+15$ risk multiplier penalty (capped at 100).

---

### B. Placement Readiness Score (PRS)
Calculates placement probability at the individual student level (scaled from 0% to 100%).
$$PRS = \mathbb{I}(\text{CGPA} \ge 6.0) \times [ v_1 \cdot (\text{CGPA} \times 10) + v_2 \cdot \text{Attendance}\% - v_3 \cdot \min(\text{Backlogs} \times 30, 100) + v_4 \cdot \text{CoCurricularBonus} ]$$

*Where:*
- $\mathbb{I}(\text{CGPA} \ge 6.0)$ is an eligibility indicator (1 if CGPA $\ge$ 6.0, 0 otherwise), mirroring typical corporate cut-offs.
- $v_1 = 0.40$ (CGPA component)
- $v_2 = 0.30$ (Attendance consistency/discipline component)
- $v_3 = 0.20$ (Active backlog penalty component)
- $v_4 = 0.10$ (Skills / Co-curricular bonus from Hackathons / Projects in `StudentAchievement`)
- PRS is capped between 0% and 100%.

---

### C. What-If Simulator (Academic & Placement Forecasts)
Allows HODs and admins to forecast outcomes under simulated improvements:

1. **Attendance Simulation**:
   $$\text{Simulated Attendance}_i = \min(\text{Current Attendance}_i + \Delta A, 100)$$
   Re-evaluate academic risk levels using `riskEngine.evaluateRisk()` and count the reduction in "High Risk" status.

2. **Backlog Clearance Simulation**:
   $$\text{Simulated Backlogs}_i = \max(\text{Current Backlogs}_i - \Delta B, 0)$$
   Re-assess student-level eligibility for placements. The department's projected placement rate changes as follows:
   $$\text{Projected Placements} = \text{Count of Eligible Students (Simulated)} \times \text{Historical Department placement rate}$$

---

## 4. Execution Plan: Recommended Next Files to Edit

To implement this intelligence layer without modifying UI or existing APIs, the following changes should occur in the next step:

1. **`backend/src/utils/riskEngine.js`**
   - Integrate calculations for `calculateActionPriorityScore` and `calculatePlacementReadinessScore` using the formulas described.

2. **`backend/src/controllers/analyticsController.js`**
   - Add backend analytics handler methods for `/action-priority`, `/placement-readiness`, `/skill-gaps`, `/academic-bottlenecks`, and `/what-if-simulator`.
   - Leverage Mongoose aggregation pipelines to calculate bottlenecks (e.g. subject pass rates) and accreditation gap quotients immediately.

3. **`backend/src/routes/analyticsRoutes.js`**
   - Define the routes matching the new analytics handlers:
     - `GET /analytics/action-priority`
     - `GET /analytics/placement-readiness`
     - `GET /analytics/skill-gaps`
     - `GET /analytics/academic-bottlenecks`
     - `POST /analytics/what-if-simulator`

4. **`frontend/src/api/client.js`**
   - Add relevant client query functions if needed to hit the new intelligence endpoints.
