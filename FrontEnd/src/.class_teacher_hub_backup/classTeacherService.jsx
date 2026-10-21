// =====================================================
// CLASS TEACHER ALLOCATION & ATTENDANCE SERVICE
// =====================================================

import { getAllClasses, addDepartmentNames } from "./classService";
import { getAllSections } from "./sectionService";
import {
  getAllTeachers,
  isTeacherSoftDeleted,
  syncTeacherClassTeacherStatus,
} from "./teacherService";
import { getAllStudents, isStudentSoftDeleted } from "./studentService";
import { getAllAcademicYear } from "./academicYearService";
import { getDepartmentDropdown } from "./departmentService";
import { getSubjectDropdown } from "./subjectService";
import {
  getAllTeacherAssignments,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from "./teacherAssignmentService";
import { getUsername, getRole, getUserId } from "../Utils/auth";

// =====================================================
// HELPER: GET CLASS ID FROM A SECTION RECORD
// =====================================================
export const getSectionClassId = (sec) => {
  if (!sec) return null;
  return (
    sec.schoolClassId ??
    sec.SchoolClassId ??
    sec.classId ??
    sec.ClassId ??
    sec.SchoolClass?.Id ??
    sec.schoolClass?.id ??
    sec.Class?.Id ??
    sec.class?.id ??
    null
  );
};

// =====================================================
// GET ALL ACADEMIC YEARS
// =====================================================
export const getAllAcademicYearsList = async () => {
  try {
    const res = await getAllAcademicYear();
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.filter((y) => y.isActive ?? y.IsActive ?? true);
  } catch (err) {
    console.error("Failed to load academic years:", err);
    return [];
  }
};

// =====================================================
// GET ALL CLASS TEACHER ALLOCATIONS
// Only shows classes and class-related sections that were actually created!
// No Cartesian cross-product (prevents 288 cards bug).
// =====================================================
export const getAllClassTeachersWithDetails = async (
  selectedAcademicYearId = null,
) => {
  try {
    const [
      classesRes,
      sectionsRes,
      teachersRes,
      studentsRes,
      assignmentsRes,
      yearsRes,
      departmentsRes,
      subjectsRes,
    ] = await Promise.allSettled([
      getAllClasses(),
      getAllSections(),
      getAllTeachers(),
      getAllStudents(),
      getAllTeacherAssignments(),
      getAllAcademicYear(),
      getDepartmentDropdown(),
      getSubjectDropdown(),
    ]);

    let rawDepts =
      departmentsRes.status === "fulfilled" &&
      Array.isArray(departmentsRes.value)
        ? departmentsRes.value
        : [];
    if (rawDepts.length === 0) {
      try {
        rawDepts = await getDepartmentDropdown();
      } catch (e) {
        console.warn("getDepartmentDropdown fallback in classTeacherService:", e);
      }
    }
    const deptMap = {};
    (rawDepts || []).forEach((d) => {
      const dId = d.id ?? d.Id ?? d.code ?? d.Code;
      const dName =
        d.text ??
        d.Text ??
        d.name ??
        d.Name ??
        d.departmentName ??
        d.DepartmentName;
      if (dId !== undefined && dId !== null && dName) {
        deptMap[String(dId)] = String(dName);
        deptMap[Number(dId)] = String(dName);
      }
    });

    const rawSubjects =
      subjectsRes.status === "fulfilled" && Array.isArray(subjectsRes.value)
        ? subjectsRes.value
        : [];
    const subjectMap = {};
    rawSubjects.forEach((s) => {
      const sId = s.id ?? s.Id ?? s.code ?? s.Code;
      const sName =
        s.text ??
        s.Text ??
        s.name ??
        s.Name ??
        s.subjectName ??
        s.SubjectName;
      if (sId !== undefined && sId !== null && sName) {
        subjectMap[String(sId)] = String(sName);
      }
    });

    let classesList =
      classesRes.status === "fulfilled" && Array.isArray(classesRes.value)
        ? classesRes.value
        : classesRes.value?.data || [];

    // Ensure classesList has department names attached
    if (classesList.length > 0 && classesList.some((c) => !c.departmentName && !c.DepartmentName)) {
      try {
        classesList = await addDepartmentNames(classesList);
      } catch (err) {
        console.warn("addDepartmentNames on classesList failed:", err);
      }
    }

    const sectionsList =
      sectionsRes.status === "fulfilled" && Array.isArray(sectionsRes.value)
        ? sectionsRes.value
        : sectionsRes.value?.data || [];

    const rawTeachers =
      teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)
        ? teachersRes.value
        : teachersRes.value?.data || [];
    const teachersList = rawTeachers
      .filter((t) => !isTeacherSoftDeleted(t))
      .map((t) => {
        const dId = t.DepartmentId ?? t.departmentId;
        const resolvedDept =
          t.DepartmentName ||
          t.departmentName ||
          (dId ? deptMap[String(dId)] : "") ||
          "";
        return {
          ...t,
          DepartmentId: dId,
          departmentId: dId,
          DepartmentName: resolvedDept,
          departmentName: resolvedDept,
        };
      });

    const rawStudents =
      studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)
        ? studentsRes.value
        : studentsRes.value?.data || [];
    const studentsList = rawStudents.filter((s) => !isStudentSoftDeleted(s));

    const assignmentsList =
      assignmentsRes.status === "fulfilled" &&
      Array.isArray(assignmentsRes.value)
        ? assignmentsRes.value
        : assignmentsRes.value?.data || [];

    const rawYears =
      yearsRes.status === "fulfilled" && Array.isArray(yearsRes.value)
        ? yearsRes.value
        : yearsRes.value?.data || [];
    const yearsList = rawYears.filter((y) => y.isActive ?? y.IsActive ?? true);

    // Identify current academic year or active selection
    const currentYear =
      yearsList.find((y) => y.isCurrent ?? y.IsCurrent) || yearsList[0] || null;

    const activeYearId =
      selectedAcademicYearId && selectedAcademicYearId !== "all"
        ? String(selectedAcademicYearId)
        : currentYear
          ? String(currentYear.id ?? currentYear.Id)
          : null;

    // Map of active class teachers by "classId_sectionId" for the chosen academic year
    const classTeacherMap = {};
    assignmentsList.forEach((assignment) => {
      const isCT =
        assignment.isClassTeacher ?? assignment.IsClassTeacher ?? false;
      const isActive = assignment.isActive ?? assignment.IsActive ?? true;
      const aYearId = String(
        assignment.academicYearId ?? assignment.AcademicYearId ?? "",
      );

      if (isCT && isActive) {
        // If an activeYearId filter is active, check match
        if (
          activeYearId &&
          selectedAcademicYearId !== "all" &&
          aYearId &&
          aYearId !== activeYearId
        ) {
          return;
        }

        const cId = assignment.schoolClassId ?? assignment.SchoolClassId;
        const sId = assignment.sectionId ?? assignment.SectionId;
        const key = `${cId}_${sId}`;

        // Prefer exact academic year match
        if (
          !classTeacherMap[key] ||
          (activeYearId && aYearId === activeYearId)
        ) {
          classTeacherMap[key] = assignment;
        }
      }
    });

    // Build ONLY created (Class, Section) pairs
    const results = [];
    const processedSectionIds = new Set();

    // 1. Iterate over classes and attach ONLY their created sections
    classesList.forEach((cls) => {
      const classId = cls.id ?? cls.Id;
      const className = cls.className ?? cls.ClassName ?? `Class ${classId}`;
      const departmentId = cls.departmentId ?? cls.DepartmentId ?? null;
      const departmentName =
        (cls.departmentName && String(cls.departmentName).trim() !== "General" ? cls.departmentName.trim() : null) ||
        (cls.DepartmentName && String(cls.DepartmentName).trim() !== "General" ? cls.DepartmentName.trim() : null) ||
        (departmentId !== null && departmentId !== undefined
          ? deptMap[String(departmentId)] || deptMap[Number(departmentId)]
          : null) ||
        (cls.departmentName && String(cls.departmentName).trim()) ||
        (cls.DepartmentName && String(cls.DepartmentName).trim()) ||
        "";

      // Find ONLY the sections that actually belong to this class
      const classSections = sectionsList.filter((sec) => {
        const secClassId = getSectionClassId(sec);
        return (
          secClassId !== null &&
          secClassId !== undefined &&
          String(secClassId) === String(classId)
        );
      });

      // If sections exist for this class, create an entry for each created section
      classSections.forEach((sec) => {
        const secId = sec.id ?? sec.Id;
        processedSectionIds.add(String(secId));

        const secName =
          sec.sectionName ??
          sec.SectionName ??
          sec.name ??
          sec.Name ??
          sec.SectionCode ??
          `Section ${secId}`;
        const secCode = sec.sectionCode ?? sec.SectionCode ?? "";
        const key = `${classId}_${secId}`;

        // Count active students in this class and section
        const studentCount = studentsList.filter((st) => {
          const sClassId =
            st.schoolClassId ?? st.SchoolClassId ?? st.classId ?? st.ClassId;
          const sSecId = st.sectionId ?? st.SectionId;
          return (
            String(sClassId) === String(classId) &&
            String(sSecId) === String(secId)
          );
        }).length;

        // Check if there is an assigned class teacher for this class, section, and academic year
        const assignment = classTeacherMap[key] || null;
        let teacherDetails = null;

        if (assignment) {
          const tId = assignment.teacherId ?? assignment.TeacherId;
          teacherDetails =
            teachersList.find((t) => String(t.id ?? t.Id) === String(tId)) ||
            null;
        }

        // Active Academic Year Info
        const matchYear =
          yearsList.find(
            (y) => String(y.id ?? y.Id) === String(activeYearId),
          ) || currentYear;
        const academicYearName =
          assignment?.academicYear ||
          assignment?.AcademicYear ||
          matchYear?.yearName ||
          matchYear?.YearName ||
          "";

        // Group active assignments for this class & section by teacher
        const classSectionAssignments = assignmentsList.filter((a) => {
          const aClassId =
            a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
          const aSecId = a.sectionId ?? a.SectionId;
          const aYearId = a.academicYearId ?? a.AcademicYearId;
          const isActive = a.isActive ?? a.IsActive ?? true;
          return (
            isActive &&
            String(aClassId) === String(classId) &&
            String(aSecId) === String(secId) &&
            (!activeYearId || !aYearId || String(aYearId) === String(activeYearId))
          );
        });

        const teacherGroupMap = {};
        classSectionAssignments.forEach((a) => {
          const tId = a.teacherId ?? a.TeacherId;
          if (!tId) return;
          const tStr = String(tId);
          const tObj = teachersList.find((t) => String(t.id ?? t.Id) === tStr);
          const subId = a.subjectId ?? a.SubjectId;
          const subName =
            a.subjectName ??
            a.SubjectName ??
            (subId ? subjectMap[String(subId)] : "") ||
            (subId ? `Subject ${subId}` : "");
          const aId = a.id ?? a.Id;
          const isCT = !!(a.isClassTeacher ?? a.IsClassTeacher);

          if (!teacherGroupMap[tStr]) {
            const tObjParts = [
              tObj?.FirstName ?? tObj?.firstName,
              tObj?.MiddleName ?? tObj?.middleName,
              tObj?.LastName ?? tObj?.lastName,
            ]
              .filter(Boolean)
              .map((s) => String(s).trim())
              .filter(Boolean)
              .join(" ");

            teacherGroupMap[tStr] = {
              teacherId: tId,
              teacherName:
                tObj?.TeacherName ||
                tObj?.teacherName ||
                tObj?.FullName ||
                tObj?.fullName ||
                tObjParts ||
                a.teacherName ||
                a.TeacherName ||
                `Teacher ${tId}`,
              teacherCode:
                tObj?.TeacherCode ||
                tObj?.teacherCode ||
                a.teacherCode ||
                a.TeacherCode ||
                "",
              photo: tObj?.photo || tObj?.Photo || "",
              isClassTeacher: isCT,
              subjects: [],
              assignmentIds: [],
            };
          }
          if (isCT) {
            teacherGroupMap[tStr].isClassTeacher = true;
          }
          if (aId && !teacherGroupMap[tStr].assignmentIds.includes(aId)) {
            teacherGroupMap[tStr].assignmentIds.push(aId);
          }
          if (
            subName &&
            !teacherGroupMap[tStr].subjects.some(
              (s) => String(s.id) === String(subId),
            )
          ) {
            teacherGroupMap[tStr].subjects.push({
              id: subId,
              name: subName,
              assignmentId: aId,
            });
          }
        });

        const subjectTeachers = Object.values(teacherGroupMap);

        results.push({
          key,
          classId,
          className,
          departmentId,
          departmentName,
          sectionId: secId,
          sectionName: secName,
          sectionCode: secCode,
          studentCount,
          assignment,
          isAssigned: !!assignment,
          teacher: teacherDetails,
          subjectTeachers,
          teacherAssignmentId: assignment?.id ?? assignment?.Id ?? null,
          academicYearId: activeYearId,
          academicYearName,
        });
      });
    });

    // 2. Also check if any sections exist whose parent class was not in classesList
    sectionsList.forEach((sec) => {
      const secId = sec.id ?? sec.Id;
      if (!processedSectionIds.has(String(secId))) {
        const secClassId = getSectionClassId(sec);
        const classId = secClassId || 0;
        const matchedClass = classesList.find((c) => String(c.id ?? c.Id) === String(secClassId));
        const matchedDeptId =
          matchedClass?.departmentId ??
          matchedClass?.DepartmentId ??
          sec.departmentId ??
          sec.DepartmentId ??
          null;
        const matchedDeptName =
          (matchedClass?.departmentName && String(matchedClass.departmentName).trim() !== "General"
            ? matchedClass.departmentName.trim()
            : null) ||
          (matchedClass?.DepartmentName && String(matchedClass.DepartmentName).trim() !== "General"
            ? matchedClass.DepartmentName.trim()
            : null) ||
          (matchedDeptId !== null && matchedDeptId !== undefined
            ? deptMap[String(matchedDeptId)] || deptMap[Number(matchedDeptId)]
            : null) ||
          "";

        const className =
          sec.className ??
          sec.ClassName ??
          matchedClass?.className ??
          matchedClass?.ClassName ??
          (secClassId ? `Class ${secClassId}` : "Class");
        const secName =
          sec.sectionName ??
          sec.SectionName ??
          sec.name ??
          sec.Name ??
          sec.SectionCode ??
          `Section ${secId}`;
        const secCode = sec.sectionCode ?? sec.SectionCode ?? "";
        const key = `${classId}_${secId}`;

        const studentCount = studentsList.filter((st) => {
          const sClassId =
            st.schoolClassId ?? st.SchoolClassId ?? st.classId ?? st.ClassId;
          const sSecId = st.sectionId ?? st.SectionId;
          return (
            String(sClassId) === String(classId) &&
            String(sSecId) === String(secId)
          );
        }).length;

        const assignment = classTeacherMap[key] || null;
        let teacherDetails = null;

        if (assignment) {
          const tId = assignment.teacherId ?? assignment.TeacherId;
          teacherDetails =
            teachersList.find((t) => String(t.id ?? t.Id) === String(tId)) ||
            null;
        }

        const matchYear =
          yearsList.find(
            (y) => String(y.id ?? y.Id) === String(activeYearId),
          ) || currentYear;
        const academicYearName =
          assignment?.academicYear ||
          assignment?.AcademicYear ||
          matchYear?.yearName ||
          matchYear?.YearName ||
          "";

        // Group active assignments for this class & section by teacher
        const classSectionAssignments = assignmentsList.filter((a) => {
          const aClassId =
            a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
          const aSecId = a.sectionId ?? a.SectionId;
          const aYearId = a.academicYearId ?? a.AcademicYearId;
          const isActive = a.isActive ?? a.IsActive ?? true;
          return (
            isActive &&
            String(aClassId) === String(classId) &&
            String(aSecId) === String(secId) &&
            (!activeYearId || !aYearId || String(aYearId) === String(activeYearId))
          );
        });

        const teacherGroupMap = {};
        classSectionAssignments.forEach((a) => {
          const tId = a.teacherId ?? a.TeacherId;
          if (!tId) return;
          const tStr = String(tId);
          const tObj = teachersList.find((t) => String(t.id ?? t.Id) === tStr);
          const subId = a.subjectId ?? a.SubjectId;
          const subName =
            a.subjectName ??
            a.SubjectName ??
            (subId ? subjectMap[String(subId)] : "") ||
            (subId ? `Subject ${subId}` : "");
          const aId = a.id ?? a.Id;
          const isCT = !!(a.isClassTeacher ?? a.IsClassTeacher);

          if (!teacherGroupMap[tStr]) {
            teacherGroupMap[tStr] = {
              teacherId: tId,
              teacherName:
                tObj?.TeacherName ||
                tObj?.teacherName ||
                a.teacherName ||
                a.TeacherName ||
                `Teacher ${tId}`,
              teacherCode:
                tObj?.TeacherCode ||
                tObj?.teacherCode ||
                a.teacherCode ||
                a.TeacherCode ||
                "",
              photo: tObj?.photo || tObj?.Photo || "",
              isClassTeacher: isCT,
              subjects: [],
              assignmentIds: [],
            };
          }
          if (isCT) {
            teacherGroupMap[tStr].isClassTeacher = true;
          }
          if (aId && !teacherGroupMap[tStr].assignmentIds.includes(aId)) {
            teacherGroupMap[tStr].assignmentIds.push(aId);
          }
          if (
            subName &&
            !teacherGroupMap[tStr].subjects.some(
              (s) => String(s.id) === String(subId),
            )
          ) {
            teacherGroupMap[tStr].subjects.push({
              id: subId,
              name: subName,
              assignmentId: aId,
            });
          }
        });

        const subjectTeachers = Object.values(teacherGroupMap);

        results.push({
          key,
          classId,
          className,
          departmentId: matchedDeptId,
          departmentName: matchedDeptName,
          DepartmentName: matchedDeptName,
          sectionId: secId,
          sectionName: secName,
          sectionCode: secCode,
          studentCount,
          assignment,
          isAssigned: !!assignment,
          teacher: teacherDetails,
          subjectTeachers,
          teacherAssignmentId: assignment?.id ?? assignment?.Id ?? null,
          academicYearId: activeYearId,
          academicYearName,
        });
      }
    });

    return {
      allocations: results,
      academicYears: yearsList,
      currentYearId: currentYear?.id ?? currentYear?.Id ?? null,
      currentYearName: currentYear?.yearName ?? currentYear?.YearName ?? "",
    };
  } catch (error) {
    console.error("Error in getAllClassTeachersWithDetails:", error);
    throw error;
  }
};

// =====================================================
// ASSIGN / CHANGE CLASS TEACHER FOR A CLASS & SECTION
// (Only Super Admin, Admin, and Operator)
// =====================================================
export const assignClassTeacher = async ({
  teacherId,
  schoolClassId,
  sectionId,
  academicYearId = 1,
  departmentId = 1,
  subjectId = 1,
}) => {
  const role = (getRole() || "").toLowerCase();
  const allowed =
    role === "super admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "operator";

  if (!allowed) {
    throw new Error(
      "Unauthorized: Only Super Admin, Admin, and Operator can assign a Class Teacher.",
    );
  }

  // 1. Fetch current assignments to see if teacher is already assigned elsewhere or another teacher needs demoting
  let assignments = [];
  try {
    const res = await getAllTeacherAssignments();
    assignments = Array.isArray(res) ? res : res?.data || [];
  } catch {
    assignments = [];
  }

  // Enforce rule: A teacher can only be assigned as Class Teacher to ONE single class and section per Academic Year!
  const alreadyAssignedElsewhere = assignments.find((a) => {
    const cId = a.schoolClassId ?? a.SchoolClassId;
    const sId = a.sectionId ?? a.SectionId;
    const tId = a.teacherId ?? a.TeacherId;
    const isCT = a.isClassTeacher ?? a.IsClassTeacher;
    const aYearId = a.academicYearId ?? a.AcademicYearId;
    const isActive = a.isActive ?? a.IsActive ?? true;

    return (
      String(tId) === String(teacherId) &&
      Boolean(isCT) &&
      Boolean(isActive) &&
      String(aYearId) === String(academicYearId) &&
      !(
        String(cId) === String(schoolClassId) &&
        String(sId) === String(sectionId)
      )
    );
  });

  if (alreadyAssignedElsewhere) {
    throw new Error(
      "This teacher is already assigned as Class Teacher for another class and section in this Academic Year. A teacher can only be assigned to a single class and section as Class Teacher.",
    );
  }

  // If someone else is currently the class teacher for this class & section in this academic year, demote them
  for (const a of assignments) {
    const cId = a.schoolClassId ?? a.SchoolClassId;
    const sId = a.sectionId ?? a.SectionId;
    const isCT = a.isClassTeacher ?? a.IsClassTeacher;
    const aYearId = a.academicYearId ?? a.AcademicYearId;
    const aId = a.id ?? a.Id;
    const tId = a.teacherId ?? a.TeacherId;

    if (
      String(cId) === String(schoolClassId) &&
      String(sId) === String(sectionId) &&
      isCT &&
      String(aYearId) === String(academicYearId) &&
      String(tId) !== String(teacherId)
    ) {
      try {
        await updateTeacherAssignment({
          id: aId,
          teacherId: tId,
          departmentId: a.departmentId ?? a.DepartmentId ?? departmentId,
          schoolClassId: cId,
          sectionId: sId,
          subjectId: a.subjectId ?? a.SubjectId ?? subjectId,
          academicYearId:
            a.academicYearId ?? a.AcademicYearId ?? academicYearId,
          isClassTeacher: false,
          isActive: a.isActive ?? a.IsActive ?? true,
        });

        // If the previous teacher has no other active class teacher assignments, set IsClassTeacher = false in their profile
        const hasOtherCT = assignments.some(
          (other) =>
            String(other.id ?? other.Id) !== String(aId) &&
            String(other.teacherId ?? other.TeacherId) === String(tId) &&
            (other.isClassTeacher ?? other.IsClassTeacher) &&
            (other.isActive ?? other.IsActive ?? true),
        );
        if (!hasOtherCT) {
          syncTeacherClassTeacherStatus(tId, false);
        }
      } catch (e) {
        console.warn("Could not unmark previous class teacher:", e);
      }
    }
  }

  // 2. Check if an assignment already exists for this teacher in this class/section & academic year
  const existingForTeacher = assignments.find((a) => {
    const cId = a.schoolClassId ?? a.SchoolClassId;
    const sId = a.sectionId ?? a.SectionId;
    const tId = a.teacherId ?? a.TeacherId;
    const aYearId = a.academicYearId ?? a.AcademicYearId;
    return (
      String(cId) === String(schoolClassId) &&
      String(sId) === String(sectionId) &&
      String(tId) === String(teacherId) &&
      String(aYearId) === String(academicYearId)
    );
  });

  let assignResult = null;
  if (existingForTeacher) {
    const aId = existingForTeacher.id ?? existingForTeacher.Id;
    assignResult = await updateTeacherAssignment({
      id: aId,
      teacherId: parseInt(teacherId, 10),
      departmentId:
        existingForTeacher.departmentId ??
        existingForTeacher.DepartmentId ??
        departmentId,
      schoolClassId: parseInt(schoolClassId, 10),
      sectionId: parseInt(sectionId, 10),
      subjectId:
        existingForTeacher.subjectId ??
        existingForTeacher.SubjectId ??
        subjectId,
      academicYearId: parseInt(academicYearId, 10),
      isClassTeacher: true,
      isActive: true,
    });
  } else {
    // Create new assignment as Class Teacher
    assignResult = await createTeacherAssignment({
      teacherId: parseInt(teacherId, 10),
      departmentId: parseInt(departmentId, 10),
      schoolClassId: parseInt(schoolClassId, 10),
      sectionId: parseInt(sectionId, 10),
      subjectId: parseInt(subjectId, 10),
      academicYearId: parseInt(academicYearId, 10),
      isClassTeacher: true,
      isActive: true,
    });
  }

  // 3. Automatically sync the newly assigned teacher's profile status to IsClassTeacher = true
  syncTeacherClassTeacherStatus(teacherId, true);

  return assignResult;
};

// =====================================================
// DE-ASSIGN / UNASSIGN CLASS TEACHER FOR A CLASS & SECTION
// (Super Admin, Admin, and Operator)
// =====================================================
export const unassignClassTeacher = async ({
  schoolClassId,
  sectionId,
  academicYearId = null,
  teacherAssignmentId = null,
  teacherId = null,
}) => {
  const role = (getRole() || "").toLowerCase();
  const allowed =
    role === "super admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "operator" ||
    role === "office employee" ||
    role === "officeemployee" ||
    role === "officestaff" ||
    role === "office staff";

  if (!allowed) {
    throw new Error(
      "Unauthorized: Only Super Admin, Admin, and Operator can de-assign a Class Teacher.",
    );
  }

  // 1. Fetch current assignments
  let assignments = [];
  try {
    const res = await getAllTeacherAssignments();
    assignments = Array.isArray(res) ? res : res?.data || [];
  } catch {
    assignments = [];
  }

  // Find the active assignment(s) for this class & section in the specified academic year
  const targetAssignments = assignments.filter((a) => {
    const cId = a.schoolClassId ?? a.SchoolClassId;
    const sId = a.sectionId ?? a.SectionId;
    const isCT = a.isClassTeacher ?? a.IsClassTeacher;
    const aYearId = a.academicYearId ?? a.AcademicYearId;
    const isActive = a.isActive ?? a.IsActive ?? true;
    const aId = a.id ?? a.Id;

    if (teacherAssignmentId && String(aId) === String(teacherAssignmentId)) {
      return true;
    }

    const matchesClassSection =
      String(cId) === String(schoolClassId) &&
      String(sId) === String(sectionId);
    const matchesCT = Boolean(isCT) && Boolean(isActive);
    const matchesYear =
      !academicYearId ||
      String(academicYearId) === "all" ||
      String(aYearId) === String(academicYearId);

    return matchesClassSection && matchesCT && matchesYear;
  });

  if (targetAssignments.length === 0) {
    throw new Error(
      "No active Class Teacher assignment found for this class and section to de-assign.",
    );
  }

  const deassignedTeacherIds = new Set();
  if (teacherId) {
    deassignedTeacherIds.add(String(teacherId));
  }

  for (const a of targetAssignments) {
    const aId = a.id ?? a.Id;
    const tId = a.teacherId ?? a.TeacherId;
    if (tId) deassignedTeacherIds.add(String(tId));

    try {
      await updateTeacherAssignment({
        id: aId,
        teacherId: parseInt(tId, 10),
        departmentId: parseInt(a.departmentId ?? a.DepartmentId ?? 1, 10),
        schoolClassId: parseInt(
          a.schoolClassId ?? a.SchoolClassId ?? schoolClassId,
          10,
        ),
        sectionId: parseInt(a.sectionId ?? a.SectionId ?? sectionId, 10),
        subjectId: parseInt(a.subjectId ?? a.SubjectId ?? 1, 10),
        academicYearId: parseInt(
          a.academicYearId ?? a.AcademicYearId ?? academicYearId ?? 1,
          10,
        ),
        isClassTeacher: false,
        isActive: a.isActive ?? a.IsActive ?? true,
      });
    } catch (err) {
      console.error(
        "Failed to update teacher assignment during de-assign:",
        err,
      );
      throw err;
    }
  }

  // 2. Sync teacher status: if they have no other active CT assignment, set IsClassTeacher = false in their profile
  for (const tId of deassignedTeacherIds) {
    const hasOtherCT = assignments.some((other) => {
      const otherId = other.id ?? other.Id;
      const isThisOne = targetAssignments.some(
        (ta) => String(ta.id ?? ta.Id) === String(otherId),
      );
      if (isThisOne) return false;
      const otherTId = other.teacherId ?? other.TeacherId;
      const isCT = other.isClassTeacher ?? other.IsClassTeacher;
      const isActive = other.isActive ?? other.IsActive ?? true;
      return (
        String(otherTId) === String(tId) && Boolean(isCT) && Boolean(isActive)
      );
    });

    if (!hasOtherCT) {
      syncTeacherClassTeacherStatus(tId, false);
    }
  }

  return { success: true, message: "Class Teacher de-assigned successfully." };
};

// =====================================================
// GET LOGGED-IN TEACHER'S ASSIGNED CLASS (WHERE IS CLASS TEACHER)
// =====================================================
export const getMyClassTeacherAssignment = async (academicYearId = null) => {
  const username = (getUsername() || "").trim().toLowerCase();
  const userId = getUserId();

  if (!username && !userId) {
    throw new Error("User session expired. Please log in.");
  }

  // Fetch teachers, assignments, classes, sections, and academic years
  const [teachersRes, assignmentsRes, classesRes, sectionsRes, yearsRes] =
    await Promise.all([
      getAllTeachers(),
      getAllTeacherAssignments(),
      getAllClasses(),
      getAllSections(),
      getAllAcademicYear(),
    ]);

  const rawTeachers = Array.isArray(teachersRes)
    ? teachersRes
    : teachersRes?.data || [];
  const teachersList = rawTeachers.filter((t) => !isTeacherSoftDeleted(t));

  const assignmentsList = Array.isArray(assignmentsRes)
    ? assignmentsRes
    : assignmentsRes?.data || [];

  const classesList = Array.isArray(classesRes)
    ? classesRes
    : classesRes?.data || [];

  const sectionsList = Array.isArray(sectionsRes)
    ? sectionsRes
    : sectionsRes?.data || [];

  const rawYears = Array.isArray(yearsRes) ? yearsRes : yearsRes?.data || [];
  const currentYear =
    rawYears.find((y) => y.isCurrent ?? y.IsCurrent) || rawYears[0] || null;

  const targetYearId =
    academicYearId ||
    (currentYear ? String(currentYear.id ?? currentYear.Id) : null);

  // Match current teacher by username, code, email, or id
  const currentTeacher = teachersList.find((t) => {
    const tCode = (t.teacherCode || t.TeacherCode || "").toLowerCase();
    const tName = (
      t.teacherName ||
      t.TeacherName ||
      t.name ||
      t.Name ||
      ""
    ).toLowerCase();
    const tEmail = (t.email || t.Email || "").toLowerCase();
    const tId = String(t.id ?? t.Id ?? "");

    return (
      (username &&
        (tCode === username || tName === username || tEmail === username)) ||
      (userId && tId === String(userId))
    );
  });

  if (!currentTeacher) {
    return {
      isClassTeacher: false,
      teacher: null,
      assignment: null,
      message: "Teacher record not found for the logged-in user.",
    };
  }

  const teacherId = currentTeacher.id ?? currentTeacher.Id;

  // Find assignment where isClassTeacher === true and isActive === true
  // Prefer match for targetYearId
  let ctAssignment = assignmentsList.find((a) => {
    const aTeacherId = a.teacherId ?? a.TeacherId;
    const isCT = a.isClassTeacher ?? a.IsClassTeacher;
    const isActive = a.isActive ?? a.IsActive ?? true;
    const aYearId = String(a.academicYearId ?? a.AcademicYearId ?? "");

    return (
      String(aTeacherId) === String(teacherId) &&
      isCT &&
      isActive &&
      (!targetYearId || aYearId === targetYearId)
    );
  });

  // Fallback to any active class teacher assignment for this teacher
  if (!ctAssignment) {
    ctAssignment = assignmentsList.find((a) => {
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const isCT = a.isClassTeacher ?? a.IsClassTeacher;
      const isActive = a.isActive ?? a.IsActive ?? true;
      return String(aTeacherId) === String(teacherId) && isCT && isActive;
    });
  }

  if (!ctAssignment) {
    return {
      isClassTeacher: false,
      teacher: currentTeacher,
      assignment: null,
      message: "You are not assigned as a Class Teacher for any class.",
    };
  }

  const classId = ctAssignment.schoolClassId ?? ctAssignment.SchoolClassId;
  const secId = ctAssignment.sectionId ?? ctAssignment.SectionId;

  const matchedClass = classesList.find(
    (c) => String(c.id ?? c.Id) === String(classId),
  );
  const matchedSec = sectionsList.find(
    (s) => String(s.id ?? s.Id) === String(secId),
  );

  return {
    isClassTeacher: true,
    teacher: currentTeacher,
    assignment: ctAssignment,
    teacherAssignmentId: ctAssignment.id ?? ctAssignment.Id,
    classId,
    className:
      matchedClass?.className ??
      matchedClass?.ClassName ??
      ctAssignment.className ??
      ctAssignment.ClassName ??
      `Class ${classId}`,
    sectionId: secId,
    sectionName:
      matchedSec?.sectionName ??
      matchedSec?.SectionName ??
      ctAssignment.sectionName ??
      ctAssignment.SectionName ??
      `Section ${secId}`,
    academicYearId:
      ctAssignment.academicYearId ?? ctAssignment.AcademicYearId ?? 1,
    academicYearName:
      ctAssignment.academicYear ??
      ctAssignment.AcademicYear ??
      currentYear?.yearName ??
      "",
  };
};

// =====================================================
// DYNAMIC HALF-YEARLY & ANNUAL EXAM CUTOFF DATES & DAY DECLARATIONS
// =====================================================
const HALF_YEARLY_KEY_PREFIX = "half_yearly_cutoff_date_";
const ANNUAL_KEY_PREFIX = "annual_cutoff_date_";
const DAY_DECLARATION_KEY_PREFIX = "attendance_day_declarations_";

export const getHalfYearlyCutoffDate = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${HALF_YEARLY_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    const stored = localStorage.getItem(key);
    if (stored) return stored;

    const fallbackKey = `${HALF_YEARLY_KEY_PREFIX}${classId}_${sectionId}`;
    const fallbackStored = localStorage.getItem(fallbackKey);
    if (fallbackStored) return fallbackStored;

    const generalStored = localStorage.getItem(
      "half_yearly_cutoff_date_general",
    );
    if (generalStored) return generalStored;

    return "";
  } catch {
    return "";
  }
};

export const setHalfYearlyCutoffDate = (
  dateStr,
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${HALF_YEARLY_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    localStorage.setItem(key, dateStr);
    localStorage.setItem(
      `${HALF_YEARLY_KEY_PREFIX}${classId}_${sectionId}`,
      dateStr,
    );
    localStorage.setItem("half_yearly_cutoff_date_general", dateStr);
    return true;
  } catch (err) {
    console.error("Failed to save half yearly cutoff date:", err);
    return false;
  }
};

export const resetHalfYearlyCutoffDate = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${HALF_YEARLY_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${HALF_YEARLY_KEY_PREFIX}${classId}_${sectionId}`);
    localStorage.removeItem("half_yearly_cutoff_date_general");
    return true;
  } catch (err) {
    console.error("Failed to reset half yearly cutoff date:", err);
    return false;
  }
};

export const getAnnualCutoffDate = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${ANNUAL_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    const stored = localStorage.getItem(key);
    if (stored) return stored;

    const fallbackKey = `${ANNUAL_KEY_PREFIX}${classId}_${sectionId}`;
    const fallbackStored = localStorage.getItem(fallbackKey);
    if (fallbackStored) return fallbackStored;

    const generalStored = localStorage.getItem("annual_cutoff_date_general");
    if (generalStored) return generalStored;

    return "";
  } catch {
    return "";
  }
};

export const setAnnualCutoffDate = (
  dateStr,
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${ANNUAL_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    localStorage.setItem(key, dateStr);
    localStorage.setItem(
      `${ANNUAL_KEY_PREFIX}${classId}_${sectionId}`,
      dateStr,
    );
    localStorage.setItem("annual_cutoff_date_general", dateStr);
    return true;
  } catch (err) {
    console.error("Failed to save annual cutoff date:", err);
    return false;
  }
};

export const resetAnnualCutoffDate = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${ANNUAL_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${ANNUAL_KEY_PREFIX}${classId}_${sectionId}`);
    localStorage.removeItem("annual_cutoff_date_general");
    return true;
  } catch (err) {
    console.error("Failed to reset annual cutoff date:", err);
    return false;
  }
};

// =====================================================
// DAY DECLARATIONS: HOLIDAY & EXAM DAYS
// =====================================================
export const getDayDeclarations = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${DAY_DECLARATION_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    const raw = localStorage.getItem(key);
    const specific = raw ? JSON.parse(raw) : {};

    const generalRaw = localStorage.getItem(
      `${DAY_DECLARATION_KEY_PREFIX}general`,
    );
    const general = generalRaw ? JSON.parse(generalRaw) : {};

    return { ...general, ...specific };
  } catch {
    return {};
  }
};

export const setDayDeclaration = (
  dateStr,
  type = "Holiday", // "Holiday" | "Exam"
  remark = "",
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${DAY_DECLARATION_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    const current = getDayDeclarations(classId, sectionId, academicYearId);
    current[dateStr] = {
      type, // "Holiday" or "Exam"
      remark:
        remark || (type === "Holiday" ? "Declared Holiday" : "Examination Day"),
      declaredAt: new Date().toISOString(),
      declaredBy: getUsername() || "Admin",
    };

    localStorage.setItem(key, JSON.stringify(current));
    localStorage.setItem(
      `${DAY_DECLARATION_KEY_PREFIX}general`,
      JSON.stringify(current),
    );
    return true;
  } catch (err) {
    console.error("Failed to save day declaration:", err);
    return false;
  }
};

export const removeDayDeclaration = (
  dateStr,
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${DAY_DECLARATION_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    const current = getDayDeclarations(classId, sectionId, academicYearId);
    if (current[dateStr]) {
      delete current[dateStr];
      localStorage.setItem(key, JSON.stringify(current));
      localStorage.setItem(
        `${DAY_DECLARATION_KEY_PREFIX}general`,
        JSON.stringify(current),
      );
    }
    return true;
  } catch (err) {
    console.error("Failed to remove day declaration:", err);
    return false;
  }
};

export const resetAllDayDeclarations = (
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  try {
    const key = `${DAY_DECLARATION_KEY_PREFIX}${academicYearId}_${classId}_${sectionId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${DAY_DECLARATION_KEY_PREFIX}general`);
    return true;
  } catch (err) {
    console.error("Failed to reset all day declarations:", err);
    return false;
  }
};

// =====================================================
// ATTENDANCE LOCK CHECKER
// Locks attendance prior to declared Half-Yearly and Annual exam dates
// =====================================================
export const checkAttendanceLocked = (
  dateStr,
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
) => {
  if (!dateStr) return { isLocked: false, reason: "" };

  const hyDate = getHalfYearlyCutoffDate(classId, sectionId, academicYearId);
  const annualDate = getAnnualCutoffDate(classId, sectionId, academicYearId);

  const targetTime = new Date(dateStr).getTime();
  const hyTime = hyDate ? new Date(hyDate).getTime() : null;
  const annualTime = annualDate ? new Date(annualDate).getTime() : null;

  // 1. Annual Exam Declaration: If target date is on/before Annual Exam declaration, locked
  if (annualTime && !isNaN(annualTime) && targetTime <= annualTime) {
    // If today is past or at annual exam date
    const todayTime = new Date().setHours(0, 0, 0, 0);
    if (todayTime >= annualTime) {
      return {
        isLocked: true,
        reason: `Annual Examination date (${annualDate}) has been declared. All academic year attendance is locked.`,
        lockType: "Annual",
      };
    }
  }

  // 2. Half-Yearly Exam Declaration: If date is on/before Half-Yearly cutoff date
  if (hyTime && !isNaN(hyTime) && targetTime <= hyTime) {
    const todayTime = new Date().setHours(0, 0, 0, 0);
    if (todayTime >= hyTime) {
      return {
        isLocked: true,
        reason: `Half-Yearly Examination date (${hyDate}) has been declared. Previous attendance up to this date is permanently locked.`,
        lockType: "HalfYearly",
      };
    }
  }

  return { isLocked: false, reason: "", lockType: null };
};

// =====================================================
// ASSIGN TEACHER TO CLASS SUBJECTS (HIERARCHICAL)
// Supports multi-subject assignment and optional CT designation
// =====================================================
export const assignTeacherToClassSubjects = async ({
  classId,
  className = "",
  sectionId,
  sectionName = "",
  teacherId,
  teacherName = "",
  teacherCode = "",
  subjectIds = [],
  academicYearId,
  isClassTeacher = false,
}) => {
  if (!classId) throw new Error("Please select a Class.");
  if (!sectionId) throw new Error("Please select a Section.");
  if (!teacherId) throw new Error("Please select a Faculty/Teacher.");
  if (!subjectIds || subjectIds.length === 0) {
    throw new Error("Please select at least one Subject for this teacher to teach.");
  }
  if (!academicYearId) throw new Error("Academic Year is required.");

  // Fetch current assignments to validate conflicts
  const currentAssignments = await getAllTeacherAssignments().catch(() => []);
  const activeAssignments = (Array.isArray(currentAssignments) ? currentAssignments : []).filter(
    (a) => a.isActive ?? a.IsActive ?? true
  );

  // If user wants to designate as Class Teacher, check strict rules:
  // 1. One CT per class & section
  // 2. One CT per teacher per academic year
  if (isClassTeacher) {
    // Check if another teacher is already CT for this class & section
    const existingCTForClass = activeAssignments.find((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aIsCT = !!(a.isClassTeacher ?? a.IsClassTeacher);
      return (
        aIsCT &&
        String(aClassId) === String(classId) &&
        String(aSecId) === String(sectionId) &&
        String(aYearId) === String(academicYearId) &&
        String(aTeacherId) !== String(teacherId)
      );
    });

    if (existingCTForClass) {
      const otherName =
        existingCTForClass.teacherName ||
        existingCTForClass.TeacherName ||
        `Teacher (ID: ${existingCTForClass.teacherId ?? existingCTForClass.TeacherId})`;
      const err = new Error(
        `Class ${className || classId} - Section ${sectionName || sectionId} already has a designated Class Teacher: ${otherName}. Please de-assign or replace them first.`
      );
      err.conflictType = "CLASS_ALREADY_HAS_CT";
      err.conflictTeacherName = otherName;
      err.conflictTeacherId = existingCTForClass.teacherId ?? existingCTForClass.TeacherId;
      throw err;
    }

    // Check if this teacher is already CT for another class in this academic year
    const existingCTForTeacher = activeAssignments.find((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aIsCT = !!(a.isClassTeacher ?? a.IsClassTeacher);
      const isDifferentClass =
        String(aClassId) !== String(classId) || String(aSecId) !== String(sectionId);
      return (
        aIsCT &&
        String(aTeacherId) === String(teacherId) &&
        String(aYearId) === String(academicYearId) &&
        isDifferentClass
      );
    });

    if (existingCTForTeacher) {
      const otherClass =
        existingCTForTeacher.className ||
        existingCTForTeacher.ClassName ||
        `Class ${existingCTForTeacher.schoolClassId ?? existingCTForTeacher.classId}`;
      const otherSec =
        existingCTForTeacher.sectionName ||
        existingCTForTeacher.SectionName ||
        `Section ${existingCTForTeacher.sectionId}`;
      const err = new Error(
        `${teacherName || "This Teacher"} is already designated as Class Teacher for ${otherClass} - ${otherSec} in this academic year. A teacher can only be Class Teacher for one class.`
      );
      err.conflictType = "TEACHER_ALREADY_CT_ELSEWHERE";
      err.otherClassName = otherClass;
      err.otherSectionName = otherSec;
      throw err;
    }
  }

  // Assign each subject
  const createdAssignments = [];
  for (let i = 0; i < subjectIds.length; i++) {
    const subId = subjectIds[i];
    // Designate CT flag on the first subject assignment (or all)
    const ctFlag = isClassTeacher ? i === 0 : false;

    // Check if an assignment already exists for this teacher, class, section, subject
    const existingAssignment = activeAssignments.find((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aSubId = a.subjectId ?? a.SubjectId;
      return (
        String(aClassId) === String(classId) &&
        String(aSecId) === String(sectionId) &&
        String(aYearId) === String(academicYearId) &&
        String(aTeacherId) === String(teacherId) &&
        String(aSubId) === String(subId)
      );
    });

    if (existingAssignment) {
      // Update isClassTeacher flag if changed
      const aId = existingAssignment.id ?? existingAssignment.Id;
      if (aId) {
        await updateTeacherAssignment(aId, {
          isClassTeacher: ctFlag,
          isActive: true,
        }).catch((e) => console.warn("Failed to update existing assignment CT flag:", e));
      }
      createdAssignments.push(existingAssignment);
    } else {
      // Create new assignment
      const payload = {
        teacherId: Number(teacherId),
        schoolClassId: Number(classId),
        sectionId: Number(sectionId),
        subjectId: Number(subId),
        academicYearId: Number(academicYearId),
        isClassTeacher: ctFlag,
        isActive: true,
      };
      try {
        const res = await createTeacherAssignment(payload);
        createdAssignments.push(res);
      } catch (err) {
        console.warn(`Failed to create assignment for subject ${subId}:`, err);
      }
    }
  }

  // Sync Teacher ClassTeacher Status in profile
  if (isClassTeacher) {
    await syncTeacherClassTeacherStatus(teacherId, true).catch(() => {});
  }

  return createdAssignments;
};

// =====================================================
// REMOVE TEACHER FROM CLASS SUBJECTS
// Removes teacher assignments and syncs CT profile if was CT
// =====================================================
export const removeTeacherFromClassSubjects = async ({
  classId,
  sectionId,
  teacherId,
  academicYearId,
  assignmentIds = [],
}) => {
  if (!classId || !sectionId || !teacherId) {
    throw new Error("Class, Section, and Teacher are required to remove faculty.");
  }

  // 1. Delete by specific assignmentIds if provided
  if (assignmentIds && assignmentIds.length > 0) {
    for (const aId of assignmentIds) {
      if (aId) {
        await deleteTeacherAssignment(aId).catch((e) =>
          console.warn(`Failed to delete assignment ${aId}:`, e)
        );
      }
    }
  } else {
    // Look up assignments for this teacher, class, and section
    const allAssignments = await getAllTeacherAssignments().catch(() => []);
    const matching = (Array.isArray(allAssignments) ? allAssignments : []).filter((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      return (
        String(aClassId) === String(classId) &&
        String(aSecId) === String(sectionId) &&
        String(aTeacherId) === String(teacherId) &&
        (!academicYearId || !aYearId || String(aYearId) === String(academicYearId))
      );
    });

    for (const a of matching) {
      const aId = a.id ?? a.Id;
      if (aId) {
        await deleteTeacherAssignment(aId).catch((e) =>
          console.warn(`Failed to delete assignment ${aId}:`, e)
        );
      }
    }
  }

  // 2. Check if this teacher has any other CT assignments anywhere; if none, sync status
  try {
    const remaining = await getAllTeacherAssignments().catch(() => []);
    const stillHasCT = (Array.isArray(remaining) ? remaining : []).some((a) => {
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aIsCT = !!(a.isClassTeacher ?? a.IsClassTeacher);
      const isActive = a.isActive ?? a.IsActive ?? true;
      return isActive && aIsCT && String(aTeacherId) === String(teacherId);
    });
    if (!stillHasCT) {
      await syncTeacherClassTeacherStatus(teacherId, false).catch(() => {});
    }
  } catch (err) {
    console.warn("Failed to update teacher CT status after removal:", err);
  }

  return true;
};

// =====================================================
// ASSIGN MULTIPLE TEACHERS TO A CLASS (PAGE WORKFLOW)
// Supports assigning multiple faculty members with their subjects
// and designating one of them as the Class Teacher.
// Enforces:
// 1. A teacher can be subject teacher in multiple classes
// 2. A teacher can ONLY be Class Teacher in 1 class per academic year
// =====================================================
export const assignMultipleTeachersToClass = async ({
  classId,
  className = "",
  sectionId,
  sectionName = "",
  academicYearId,
  allocations = [],
}) => {
  if (!classId) throw new Error("Please select a Class.");
  if (!sectionId) throw new Error("Please select a Section.");
  if (!academicYearId) throw new Error("Academic Year is required.");
  if (!allocations || allocations.length === 0) {
    throw new Error("Please add at least one teacher to assign.");
  }

  // 1. Fetch current assignments
  const currentAssignments = await getAllTeacherAssignments().catch(() => []);
  const activeAssignments = (Array.isArray(currentAssignments) ? currentAssignments : []).filter(
    (a) => a.isActive ?? a.IsActive ?? true
  );

  // 2. Validate at most 1 teacher is marked as Class Teacher
  const ctAllocations = allocations.filter((a) => a.isClassTeacher);
  if (ctAllocations.length > 1) {
    throw new Error("Only one teacher can be designated as the Class Teacher for this class.");
  }

  // 3. For any teacher marked as Class Teacher, check if they are already CT in another class
  if (ctAllocations.length === 1) {
    const designatedCT = ctAllocations[0];
    const ctTeacherId = designatedCT.teacherId;

    const existingCTForTeacher = activeAssignments.find((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aIsCT = !!(a.isClassTeacher ?? a.IsClassTeacher);
      const isDifferentClass =
        String(aClassId) !== String(classId) || String(aSecId) !== String(sectionId);
      return (
        aIsCT &&
        String(aTeacherId) === String(ctTeacherId) &&
        String(aYearId) === String(academicYearId) &&
        isDifferentClass
      );
    });

    if (existingCTForTeacher) {
      const otherClass =
        existingCTForTeacher.className ||
        existingCTForTeacher.ClassName ||
        `Class ${existingCTForTeacher.schoolClassId ?? existingCTForTeacher.classId}`;
      const otherSec =
        existingCTForTeacher.sectionName ||
        existingCTForTeacher.SectionName ||
        `Section ${existingCTForTeacher.sectionId}`;
      const err = new Error(
        `${designatedCT.teacherName || "This Teacher"} is already designated as Class Teacher for ${otherClass} - ${otherSec} in this academic year. A teacher can only be Class Teacher for one class.`
      );
      err.conflictType = "TEACHER_ALREADY_CT_ELSEWHERE";
      err.otherClassName = otherClass;
      err.otherSectionName = otherSec;
      throw err;
    }

    // De-assign any previous CT for this class who is not the newly designated CT
    const existingCTForClass = activeAssignments.find((a) => {
      const aClassId = a.schoolClassId ?? a.SchoolClassId ?? a.classId ?? a.ClassId;
      const aSecId = a.sectionId ?? a.SectionId;
      const aYearId = a.academicYearId ?? a.AcademicYearId;
      const aTeacherId = a.teacherId ?? a.TeacherId;
      const aIsCT = !!(a.isClassTeacher ?? a.IsClassTeacher);
      return (
        aIsCT &&
        String(aClassId) === String(classId) &&
        String(aSecId) === String(sectionId) &&
        String(aYearId) === String(academicYearId) &&
        String(aTeacherId) !== String(ctTeacherId)
      );
    });

    if (existingCTForClass) {
      await unassignClassTeacher(classId, sectionId, academicYearId).catch((e) =>
        console.warn("Notice: unassignClassTeacher during CT replacement:", e)
      );
    }
  }

  // 4. Save each teacher's assignments
  const allResults = [];
  for (const alloc of allocations) {
    if (!alloc.teacherId) continue;
    if (!alloc.subjectIds || alloc.subjectIds.length === 0) {
      throw new Error(`Please select at least one subject for ${alloc.teacherName || "each teacher"}.`);
    }

    const res = await assignTeacherToClassSubjects({
      classId,
      className,
      sectionId,
      sectionName,
      teacherId: alloc.teacherId,
      teacherName: alloc.teacherName,
      teacherCode: alloc.teacherCode,
      subjectIds: alloc.subjectIds,
      academicYearId,
      isClassTeacher: Boolean(alloc.isClassTeacher),
    });
    allResults.push(res);
  }

  return allResults;
};

