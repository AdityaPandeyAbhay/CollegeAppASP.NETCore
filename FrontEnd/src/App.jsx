import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import useDashboardScroll from "./Utils/useDashboardScroll.js";

// =====================================================
// NAVBAR
// =====================================================

import Navbar from "./Component/Navbar/Navbar.jsx";

// =====================================================
// PAGE NAVIGATION
// =====================================================

import PageNavigation from "./Component/PageNavigation/PageNavigation.jsx";

// =====================================================
// FOOTER
// =====================================================

import Footer from "./Component/Footer/Footer.jsx";

// =====================================================
// ATTENDANCE & CLASS TEACHER PAGES
// =====================================================

import ClassTeacherList from "./PageStructure/ClassTeacher/ClassTeacherList.jsx";
import AssignClassTeachersPage from "./PageStructure/ClassTeacher/AssignClassTeachersPage.jsx";
import TakeAttendance from "./PageStructure/Attendance/TakeAttendance.jsx";
import AttendanceRegister from "./PageStructure/Attendance/AttendanceRegister.jsx";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./PageStructure/HomePage/Home.jsx";

import AboutUs from "./PageStructure/AboutUs/AboutUs.jsx";

import ContactUs from "./PageStructure/ContactUs/ContactUs.jsx";

import Login from "./PageStructure/Login/Login.jsx";

import Notice from "./PageStructure/Notice/Notice.jsx";

// =====================================================
// DASHBOARDS
// =====================================================

import SuperAdminDashboard from "./Deshboard/SuperAdmin/SuperAdminDashboard.jsx";

import AdminDashboard from "./Deshboard/Admin/AdminDashboard.jsx";

import TeacherDashboard from "./Deshboard/Teacher/TeacherDashboard.jsx";

import StudentDashboard from "./Deshboard/Student/StudentDashboard.jsx";

import OperatorDashboard from "./Deshboard/Operator/OperatorDashboard.jsx";

import OfficeEmployeeDashboard from "./Deshboard/OfficeEmployee/OfficeEmployeeDashboard.jsx";

// =====================================================
// USER PAGES
// =====================================================

import CreateUser from "./PageStructure/Users/CreateUser/CreateUser.jsx";

import GetAllUser from "./PageStructure/Users/GetAllUser/GetAllUser.jsx";

import GetUserById from "./PageStructure/Users/GetUserById/GetUserById.jsx";

import GetUserByName from "./PageStructure/Users/GetUserByName/GetUserByName.jsx";

import UserDropdown from "./PageStructure/Users/UserDropdown/UserDropdown.jsx";

import UserDropdownByRole from "./PageStructure/Users/UserDropdownByRole/UserDropdownByRole.jsx";

import UpdateUser from "./PageStructure/Users/UpdateUser/UpdateUser.jsx";

import DeleteUser from "./PageStructure/Users/DeleteUser/DeleteUser.jsx";

// =====================================================
// NON TEACHING STAFF PAGES
// =====================================================

import CreateNonTeachingStaff from "./PageStructure/nonTeachingStaffService/CreateNonTeachingStaff/CreateNonTeachingStaff.jsx";

import GetAllNonTeachingStaff from "./PageStructure/nonTeachingStaffService/GetAllNonTeachingStaff/GetAllNonTeachingStaff.jsx";

import GetNonTeachingStaffByCode from "./PageStructure/nonTeachingStaffService/GetNonTeachingStaffByCode/GetNonTeachingStaffByCode.jsx";

import GetNonTeachingStaffByName from "./PageStructure/nonTeachingStaffService/GetNonTeachingStaffByName/GetNonTeachingStaffByName.jsx";

import GetNonTeachingStaffDropdown from "./PageStructure/nonTeachingStaffService/GetNonTeachingStaffDropdown/GetNonTeachingStaffDropdown.jsx";

import UpdateNonTeachingStaff from "./PageStructure/nonTeachingStaffService/UpdateNonTeachingStaff/UpdateNonTeachingStaff.jsx";

import DeleteNonTeachingStaff from "./PageStructure/nonTeachingStaffService/DeleteNonTeachingStaff/DeleteNonTeachingStaff.jsx";

// =====================================================
// NOTICE MANAGEMENT PAGES
// =====================================================

import CreateNotice from "./PageStructure/Notice/CreateNotice.jsx";

import GetNonPublishedNotice from "./PageStructure/Notice/GetNonPublishedNotice.jsx";

import GetNonPublishedNoticeById from "./PageStructure/Notice/GetNonPublishedNoticeById.jsx";

import GetNonPublishedNoticeDropdown from "./PageStructure/Notice/GetNonPublishedNoticeDropdown.jsx";

import PublishNotice from "./PageStructure/Notice/PublishNotice.jsx";

// =====================================================
// TEACHER PAGES
// =====================================================

import CreateTeacher from "./PageStructure/Teacher/CreateTeacher/CreateTeacher.jsx";

import GetAllTeacher from "./PageStructure/Teacher/GetAllTeacher/GetAllTeacher.jsx";

import GetTeacherByCode from "./PageStructure/Teacher/GetTeacherByCode/GetTeacherByCode.jsx";

import GetTeacherByName from "./PageStructure/Teacher/GetTeacherByName/GetTeacherByName.jsx";

import UpdateTeacher from "./PageStructure/Teacher/UpdateTeacher/UpdateTeacher.jsx";

import DeleteTeacher from "./PageStructure/Teacher/DeleteTeacher/DeleteTeacher.jsx";

// =====================================================
// DEPARTMENT PAGES
// =====================================================

import CreateDepartment from "./PageStructure/Department/CreateDepartment.jsx";

import GetAllDepartment from "./PageStructure/Department/GetAllDepartment.jsx";

import GetDepartmentByCode from "./PageStructure/Department/GetDepartmentByCode.jsx";

import GetDepartmentByName from "./PageStructure/Department/GetDepartmentByName.jsx";

import UpdateDepartment from "./PageStructure/Department/UpdateDepartment.jsx";

import DeleteDepartment from "./PageStructure/Department/DeleteDepartment.jsx";

// =====================================================
// CLASS PAGES
// =====================================================

import CreateClass from "./PageStructure/Classe/CreateClass.jsx";

import GetAllClass from "./PageStructure/Classe/GetAllClass.jsx";

import GetClassByCode from "./PageStructure/Classe/GetClassByCode.jsx";

import GetClassByName from "./PageStructure/Classe/GetClassByName.jsx";

import UpdateClass from "./PageStructure/Classe/UpdateClass.jsx";

import DeleteClass from "./PageStructure/Classe/DeleteClass.jsx";

// =====================================================
// Section PAGES
// =====================================================

import CreateSection from "./PageStructure/Section/CreateSection";
import GetAllSection from "./PageStructure/Section/GetAllSection";
import GetSectionByCode from "./PageStructure/Section/GetSectionByCode";

import UpdateSection from "./PageStructure/Section/UpdateSection";
import DeleteSection from "./PageStructure/Section/DeleteSection";

// =====================================================
// SUBJECT PAGES
// =====================================================

import CreateSubject from "./PageStructure/Subject/CreateSubject.jsx";

import GetAllSubject from "./PageStructure/Subject/GetAllSubject.jsx";

import GetSubjectByCode from "./PageStructure/Subject/GetSubjectByCode.jsx";

import GetSubjectByName from "./PageStructure/Subject/GetSubjectByName.jsx";

import UpdateSubject from "./PageStructure/Subject/UpdateSubject.jsx";

import DeleteSubject from "./PageStructure/Subject/DeleteSubject.jsx";

// =====================================================
// TEACHER ASSIGNMENT PAGES
// =====================================================

import GetAllTeacherAssignment from "./PageStructure/TeacherAssignment/GetAllTeacherAssignment/GetAllTeacherAssignment.jsx";

import GetTeacherAssignmentById from "./PageStructure/TeacherAssignment/GetTeacherAssignmentById/GetTeacherAssignmentById.jsx";

import GetTeacherAssignmentByTeacher from "./PageStructure/TeacherAssignment/GetTeacherAssignmentByTeacher/GetTeacherAssignmentByTeacher.jsx";

import GetTeacherAssignmentByClass from "./PageStructure/TeacherAssignment/GetTeacherAssignmentByClass/GetTeacherAssignmentByClass.jsx";

import GetTeacherAssignmentBySubject from "./PageStructure/TeacherAssignment/GetTeacherAssignmentBySubject/GetTeacherAssignmentBySubject.jsx";

import UpdateTeacherAssignment from "./PageStructure/TeacherAssignment/UpdateTeacherAssignment/UpdateTeacherAssignment.jsx";

import DeleteTeacherAssignment from "./PageStructure/TeacherAssignment/DeleteTeacherAssignment/DeleteTeacherAssignment.jsx";

// =====================================================
// STUDENT PAGES
// =====================================================

import CreateStudent from "./PageStructure/Student/CreateStudent.jsx";

import GetAllStudent from "./PageStructure/Student/GetAllStudent.jsx";

import GetStudentById from "./PageStructure/Student/GetStudentById.jsx";

import GetStudentByName from "./PageStructure/Student/GetStudentByName.jsx";

import UpdateStudent from "./PageStructure/Student/UpdateStudent.jsx";

import DeleteStudent from "./PageStructure/Student/DeleteStudent.jsx";

import PromoteStudent from "./PageStructure/Student/PromoteStudent.jsx";

// =====================================================
// FEE CATEGORY PAGES
// =====================================================

import CreateFeeCategory from "./PageStructure/FeeCategory/CreateFeeCategory.jsx";

import GetAllFeeCategory from "./PageStructure/FeeCategory/GetAllFeeCategory.jsx";

import GetFeeCategoryById from "./PageStructure/FeeCategory/GetFeeCategoryById.jsx";

import GetFeeCategoryByName from "./PageStructure/FeeCategory/GetFeeCategoryByName.jsx";

import UpdateFeeCategory from "./PageStructure/FeeCategory/UpdateFeeCategory.jsx";

import DeleteFeeCategory from "./PageStructure/FeeCategory/DeleteFeeCategory.jsx";

// =====================================================
// FEE STRUCTURE PAGES
// =====================================================

import CreateFeeStructure from "./PageStructure/FeeStructure/CreateFeeStructure.jsx";

import GetAllFeeStructures from "./PageStructure/FeeStructure/GetAllFeeStructures.jsx";

import GetFeeStructureById from "./PageStructure/FeeStructure/GetFeeStructureById.jsx";

import GetFeeStructureByClass from "./PageStructure/FeeStructure/GetFeeStructureByClass.jsx";

import GetFeeStructureByCategory from "./PageStructure/FeeStructure/GetFeeStructureByCategory.jsx";

import UpdateFeeStructure from "./PageStructure/FeeStructure/UpdateFeeStructure.jsx";

import DeleteFeeStructure from "./PageStructure/FeeStructure/DeleteFeeStructure.jsx";

// =====================================================
// STUDENT FEE PAGES
// =====================================================

import CreateStudentFee from "./PageStructure/StudentFee/CreateStudentFee.jsx";

import GetAllStudentFee from "./PageStructure/StudentFee/GetAllStudentFee.jsx";

import GetStudentFeeByStudent from "./PageStructure/StudentFee/GetStudentFeeByStudent.jsx";

import UpdateStudentFee from "./PageStructure/StudentFee/UpdateStudentFee.jsx";

import DeleteStudentFee from "./PageStructure/StudentFee/DeleteStudentFee.jsx";

// =====================================================
// RESULT - EXAM PAGES
// =====================================================

import CreateExam from "./PageStructure/Result/Exam/CreateExam.jsx";
import GetAllExam from "./PageStructure/Result/Exam/GetAllExam.jsx";
import UpdateExam from "./PageStructure/Result/Exam/UpdateExam.jsx";
import DeleteExam from "./PageStructure/Result/Exam/DeleteExam.jsx";

// =====================================================
// RESULT - BATCH PAGES
// =====================================================

import CreateResultBatch from "./PageStructure/Result/ResultBatch/CreateResultBatch.jsx";
import GetAllResultBatch from "./PageStructure/Result/ResultBatch/GetAllResultBatch.jsx";
import GetResultBatchById from "./PageStructure/Result/ResultBatch/GetResultBatchById.jsx";
import UpdateResultBatch from "./PageStructure/Result/ResultBatch/UpdateResultBatch.jsx";
import PublishResultBatch from "./PageStructure/Result/ResultBatch/PublishResultBatch.jsx";

// =====================================================
// RESULT - STUDENT RESULT PAGES
// =====================================================

import UploadStudentResult from "./PageStructure/Result/StudentResult/UploadStudentResult.jsx";
import GetStudentResult from "./PageStructure/Result/StudentResult/GetStudentResult.jsx";
import GetBatchResult from "./PageStructure/Result/StudentResult/GetBatchResult.jsx";
import UpdateStudentResult from "./PageStructure/Result/StudentResult/UpdateStudentResult.jsx";
import PreviousResult from "./PageStructure/Result/StudentResult/PreviousResult.jsx";

// =====================================================
// RESULT - DETAIL PAGES
// =====================================================

import GetResultDetails from "./PageStructure/Result/ResultDetail/GetResultDetails.jsx";

// =====================================================
// ACADEMIC YEAR PAGES
// =====================================================

import CreateAcademicYear from "./PageStructure/AcademicYear/CreateAcademicYear.jsx";
import GetAllAcademicYear from "./PageStructure/AcademicYear/GetAllAcademicYear.jsx";
import GetAcademicYearByName from "./PageStructure/AcademicYear/GetAcademicYearByName.jsx";
import UpdateAcademicYear from "./PageStructure/AcademicYear/UpdateAcademicYear.jsx";
import DeleteAcademicYear from "./PageStructure/AcademicYear/DeleteAcademicYear.jsx";

// =====================================================
// CONDITIONAL FOOTER
// =====================================================

function AppFooter() {
  const location = useLocation();
  const rawPath = (location.pathname || "").toLowerCase().trim();
  const path =
    rawPath.endsWith("/") && rawPath.length > 1
      ? rawPath.slice(0, -1)
      : rawPath;

  // Render on navbar pages (Home, About Us, Contact Us, Notice) and Dashboard pages
  const isNavbarPage =
    path === "" ||
    path === "/" ||
    path === "/home" ||
    path === "/about" ||
    path === "/contact" ||
    path === "/notice";

  const isDashboardPage = path.startsWith("/dashboard");

  if (isDashboardPage) {
    return (
      <div className="dashboard-footer-wrapper">
        <Footer />
      </div>
    );
  }

  if (isNavbarPage) {
    return (
      <div className="public-footer-wrapper">
        <Footer />
      </div>
    );
  }

  return null;
}

// =====================================================
// DASHBOARD SCROLL MANAGER
// =====================================================

function DashboardScrollManager() {
  useDashboardScroll();
  return null;
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      {/* Dashboard Custom Scroll Coordinator */}
      <DashboardScrollManager />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          PAGE NAVIGATION
      ===================================================== */}

      <PageNavigation />

      {/* =====================================================
          APPLICATION ROUTES
      ===================================================== */}

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/login" element={<Login />} />
        {/* =====================================================
            DASHBOARD ROUTES
        ===================================================== */}
        <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/operator" element={<OperatorDashboard />} />
        <Route
          path="/dashboard/office-employee"
          element={<OfficeEmployeeDashboard />}
        />
        <Route path="/dashboard/office" element={<OfficeEmployeeDashboard />} />
        <Route
          path="/dashboard/office-staff"
          element={<OfficeEmployeeDashboard />}
        />
        {/* =====================================================
            USER MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE USER */}
        <Route path="/user/create" element={<CreateUser />} />
        {/* GET ALL USERS */}
        <Route path="/user/all" element={<GetAllUser />} />
        {/* GET USER BY ID */}
        <Route path="/user/id" element={<GetUserById />} />
        {/* GET USER BY NAME */}
        <Route path="/user/name" element={<GetUserByName />} />
        {/* USER DROPDOWN */}
        <Route path="/user/dropdown" element={<UserDropdown />} />
        {/* USER DROPDOWN BY ROLE */}
        <Route path="/user/dropdown/role" element={<UserDropdownByRole />} />
        {/* UPDATE USER */}
        <Route path="/user/update" element={<UpdateUser />} />
        {/* DELETE USER */}
        <Route path="/user/delete" element={<DeleteUser />} />
        {/* =====================================================
            NON TEACHING STAFF ROUTES
        ===================================================== */}
        {/* CREATE STAFF */}
        <Route
          path="/non-teaching-staff/create"
          element={<CreateNonTeachingStaff />}
        />
        {/* GET ALL STAFF */}
        <Route
          path="/non-teaching-staff/all"
          element={<GetAllNonTeachingStaff />}
        />
        {/* GET STAFF BY CODE */}
        <Route
          path="/non-teaching-staff/code"
          element={<GetNonTeachingStaffByCode />}
        />
        {/* GET STAFF BY NAME */}
        <Route
          path="/non-teaching-staff/name"
          element={<GetNonTeachingStaffByName />}
        />
        {/* STAFF DROPDOWN */}
        <Route
          path="/non-teaching-staff/dropdown"
          element={<GetNonTeachingStaffDropdown />}
        />
        {/* UPDATE STAFF */}
        <Route
          path="/non-teaching-staff/update"
          element={<UpdateNonTeachingStaff />}
        />
        {/* DELETE STAFF */}
        <Route
          path="/non-teaching-staff/delete"
          element={<DeleteNonTeachingStaff />}
        />
        {/* =====================================================
            NOTICE MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE NOTICE */}
        <Route path="/notice/create" element={<CreateNotice />} />
        {/* NON PUBLISHED NOTICES */}
        <Route
          path="/notice/non-published"
          element={<GetNonPublishedNotice />}
        />
        {/* GET NON PUBLISHED NOTICE BY ID */}
        <Route
          path="/notice/non-published/id"
          element={<GetNonPublishedNoticeById />}
        />
        {/* NON PUBLISHED NOTICE DROPDOWN */}
        <Route
          path="/notice/non-published/dropdown"
          element={<GetNonPublishedNoticeDropdown />}
        />
        {/* PUBLISH NOTICE */}
        <Route path="/notice/publish" element={<PublishNotice />} />
        {/* =====================================================
            TEACHER MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE TEACHER */}
        <Route path="/teacher/create" element={<CreateTeacher />} />
        {/* GET ALL TEACHERS */}
        <Route path="/teacher/all" element={<GetAllTeacher />} />
        {/* GET TEACHER BY CODE */}
        <Route path="/teacher/code" element={<GetTeacherByCode />} />
        {/* GET TEACHER BY NAME */}
        <Route path="/teacher/name" element={<GetTeacherByName />} />
        {/* UPDATE TEACHER */}
        <Route path="/teacher/update" element={<UpdateTeacher />} />
        {/* DELETE TEACHER */}
        <Route path="/teacher/delete" element={<DeleteTeacher />} />
        {/* =====================================================
            DEPARTMENT MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE DEPARTMENT */}
        <Route path="/department/create" element={<CreateDepartment />} />
        {/* GET ALL DEPARTMENTS */}
        <Route path="/department/all" element={<GetAllDepartment />} />
        {/* GET DEPARTMENT BY CODE */}
        <Route path="/department/code" element={<GetDepartmentByCode />} />
        {/* GET DEPARTMENT BY NAME */}
        <Route path="/department/name" element={<GetDepartmentByName />} />
        {/* UPDATE DEPARTMENT */}
        <Route path="/department/update" element={<UpdateDepartment />} />
        {/* DELETE DEPARTMENT */}
        <Route path="/department/delete" element={<DeleteDepartment />} />
        {/* =====================================================
            CLASS MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE CLASS */}
        <Route path="/class/create" element={<CreateClass />} />
        {/* GET ALL CLASSES */}
        <Route path="/class/all" element={<GetAllClass />} />
        {/* GET CLASS BY CODE */}
        <Route path="/class/code" element={<GetClassByCode />} />
        {/* GET CLASS BY NAME */}
        <Route path="/class/name" element={<GetClassByName />} />
        {/* UPDATE CLASS */}
        <Route path="/class/update" element={<UpdateClass />} />
        {/* DELETE CLASS */}
        <Route path="/class/delete" element={<DeleteClass />} />
        {/* =====================================================
            SECTION MANAGEMENT ROUTES
        ===================================================== */}
        <Route path="/section/create" element={<CreateSection />} />
        <Route path="/section/all" element={<GetAllSection />} />
        <Route path="/section/by-code" element={<GetSectionByCode />} />
        <Route path="/section/update" element={<UpdateSection />} />
        <Route path="/section/delete" element={<DeleteSection />} />
        {/* =====================================================
    SUBJECT MANAGEMENT ROUTES
===================================================== */}
        {/* CREATE SUBJECT */}
        <Route path="/subject/create" element={<CreateSubject />} />
        {/* GET ALL SUBJECTS */}
        <Route path="/subject/all" element={<GetAllSubject />} />
        {/* GET SUBJECT BY CODE */}
        <Route path="/subject/code" element={<GetSubjectByCode />} />
        {/* GET SUBJECT BY NAME */}
        <Route path="/subject/name" element={<GetSubjectByName />} />
        {/* UPDATE SUBJECT */}
        <Route path="/subject/update" element={<UpdateSubject />} />
        {/* DELETE SUBJECT */}
        <Route path="/subject/delete" element={<DeleteSubject />} />
        {/* =====================================================
            TEACHER ASSIGNMENT MANAGEMENT ROUTES
        ===================================================== */}
        {/* REDIRECT DEPRECATED CREATE TEACHER ASSIGNMENT */}
        <Route
          path="/teacher-assignment/create"
          element={<Navigate to="/class-teachers/assign" replace />}
        />
        {/* GET ALL TEACHER ASSIGNMENTS */}
        <Route
          path="/teacher-assignment/all"
          element={<GetAllTeacherAssignment />}
        />
        {/* GET TEACHER ASSIGNMENT BY ID */}
        <Route
          path="/teacher-assignment/id"
          element={<GetTeacherAssignmentById />}
        />
        {/* GET TEACHER ASSIGNMENT BY TEACHER */}
        <Route
          path="/teacher-assignment/teacher"
          element={<GetTeacherAssignmentByTeacher />}
        />
        {/* GET TEACHER ASSIGNMENT BY CLASS */}
        <Route
          path="/teacher-assignment/class"
          element={<GetTeacherAssignmentByClass />}
        />
        {/* GET TEACHER ASSIGNMENT BY SUBJECT */}
        <Route
          path="/teacher-assignment/subject"
          element={<GetTeacherAssignmentBySubject />}
        />
        {/* UPDATE TEACHER ASSIGNMENT */}
        <Route
          path="/teacher-assignment/update"
          element={<UpdateTeacherAssignment />}
        />
        {/* DELETE TEACHER ASSIGNMENT */}
        <Route
          path="/teacher-assignment/delete"
          element={<DeleteTeacherAssignment />}
        />
        {/* =====================================================
            STUDENT MANAGEMENT ROUTES
        ===================================================== */}
        {/* CREATE STUDENT */}
        <Route path="/student/create" element={<CreateStudent />} />
        {/* GET ALL STUDENTS */}
        <Route path="/student/all" element={<GetAllStudent />} />
        {/* GET STUDENT BY ID */}
        <Route path="/student/id" element={<GetStudentById />} />
        {/* GET STUDENT BY NAME */}
        <Route path="/student/name" element={<GetStudentByName />} />
        {/* UPDATE STUDENT */}
        <Route path="/student/update" element={<UpdateStudent />} />
        {/* DELETE STUDENT */}
        <Route path="/student/delete" element={<DeleteStudent />} />
        {/* PROMOTE STUDENT / ACADEMIC PROGRESSION */}
        <Route path="/student/promote" element={<PromoteStudent />} />

        {/* =====================================================
            FEE CATEGORY MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE FEE CATEGORY */}
        <Route path="/fee-category/create" element={<CreateFeeCategory />} />
        {/* GET ALL FEE CATEGORIES */}
        <Route path="/fee-category/all" element={<GetAllFeeCategory />} />
        {/* GET FEE CATEGORY BY ID */}
        <Route path="/fee-category/id" element={<GetFeeCategoryById />} />
        {/* GET FEE CATEGORY BY NAME */}
        <Route path="/fee-category/name" element={<GetFeeCategoryByName />} />
        {/* UPDATE FEE CATEGORY */}
        <Route path="/fee-category/update" element={<UpdateFeeCategory />} />
        {/* DELETE FEE CATEGORY */}
        <Route path="/fee-category/delete" element={<DeleteFeeCategory />} />

        {/* =====================================================
            FEE STRUCTURE MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE FEE STRUCTURE */}
        <Route path="/fee-structure/create" element={<CreateFeeStructure />} />
        {/* GET ALL FEE STRUCTURES */}
        <Route path="/fee-structure/all" element={<GetAllFeeStructures />} />
        {/* GET FEE STRUCTURE BY ID */}
        <Route path="/fee-structure/id" element={<GetFeeStructureById />} />
        {/* GET FEE STRUCTURE BY CLASS */}
        <Route
          path="/fee-structure/class"
          element={<GetFeeStructureByClass />}
        />
        <Route
          path="/fee-structure/by-class"
          element={<GetFeeStructureByClass />}
        />
        {/* GET FEE STRUCTURE BY CATEGORY */}
        <Route
          path="/fee-structure/category"
          element={<GetFeeStructureByCategory />}
        />
        <Route
          path="/fee-structure/by-category"
          element={<GetFeeStructureByCategory />}
        />
        {/* UPDATE FEE STRUCTURE */}
        <Route path="/fee-structure/update" element={<UpdateFeeStructure />} />
        {/* DELETE FEE STRUCTURE */}
        <Route path="/fee-structure/delete" element={<DeleteFeeStructure />} />

        {/* =====================================================
            STUDENT FEE MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE STUDENT FEE */}
        <Route path="/student-fee/create" element={<CreateStudentFee />} />
        {/* GET ALL STUDENT FEES */}
        <Route path="/student-fee/all" element={<GetAllStudentFee />} />
        {/* GET STUDENT FEE BY STUDENT */}
        <Route
          path="/student-fee/student"
          element={<GetStudentFeeByStudent />}
        />
        <Route
          path="/student-fee/by-student"
          element={<GetStudentFeeByStudent />}
        />
        {/* UPDATE STUDENT FEE */}
        <Route path="/student-fee/update" element={<UpdateStudentFee />} />
        {/* DELETE STUDENT FEE */}
        <Route path="/student-fee/delete" element={<DeleteStudentFee />} />

        {/* =====================================================
            RESULT - EXAM MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE EXAM */}
        <Route path="/exam/create" element={<CreateExam />} />
        {/* GET ALL EXAMS */}
        <Route path="/exam/all" element={<GetAllExam />} />
        {/* UPDATE EXAM */}
        <Route path="/exam/update" element={<UpdateExam />} />
        {/* DELETE EXAM */}
        <Route path="/exam/delete" element={<DeleteExam />} />

        {/* =====================================================
            RESULT - BATCH MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE RESULT BATCH */}
        <Route path="/result-batch/create" element={<CreateResultBatch />} />
        {/* GET ALL RESULT BATCHES */}
        <Route path="/result-batch/all" element={<GetAllResultBatch />} />
        {/* GET RESULT BATCH BY ID */}
        <Route path="/result-batch/id" element={<GetResultBatchById />} />
        <Route path="/result-batch/by-id" element={<GetResultBatchById />} />
        {/* UPDATE RESULT BATCH */}
        <Route path="/result-batch/update" element={<UpdateResultBatch />} />
        {/* GET RESULT BATCH BY ID (Mapped to UpdateResultBatch to prevent ID exposure) */}
        <Route path="/result-batch/id" element={<UpdateResultBatch />} />
        <Route path="/result-batch/by-id" element={<UpdateResultBatch />} />
        {/* PUBLISH RESULT BATCH */}
        <Route path="/result-batch/publish" element={<PublishResultBatch />} />

        {/* =====================================================
            RESULT - STUDENT RESULT MANAGEMENT ROUTES
          ====================================================== */}
        {/* UPLOAD STUDENT RESULT */}
        <Route
          path="/student-result/upload"
          element={<UploadStudentResult />}
        />
        <Route
          path="/student-result/create"
          element={<UploadStudentResult />}
        />
        {/* GET STUDENT RESULT */}
        <Route path="/student-result/student" element={<GetStudentResult />} />
        <Route
          path="/student-result/by-student"
          element={<GetStudentResult />}
        />
        {/* GET BATCH RESULTS */}
        <Route path="/student-result/batch" element={<GetBatchResult />} />
        <Route path="/student-result/by-batch" element={<GetBatchResult />} />
        {/* UPDATE STUDENT RESULT */}
        <Route
          path="/student-result/update"
          element={<UpdateStudentResult />}
        />
        {/* PREVIOUS & PREVIEW RESULTS */}
        <Route path="/student-result/previous" element={<PreviousResult />} />
        <Route
          path="/student-result/by-previous"
          element={<PreviousResult />}
        />
        <Route path="/student-result/preview" element={<PreviousResult />} />
        <Route path="/student-result/by-preview" element={<PreviousResult />} />

        {/* =====================================================
            RESULT - DETAIL ROUTES
          ====================================================== */}
        {/* GET RESULT DETAILS */}
        <Route path="/result-detail/details" element={<GetResultDetails />} />
        <Route path="/result-detail/id" element={<GetResultDetails />} />
        <Route path="/result-detail/all" element={<GetResultDetails />} />

        {/* =====================================================
            ACADEMIC YEAR MANAGEMENT ROUTES
          ====================================================== */}
        {/* CREATE ACADEMIC YEAR */}
        <Route path="/academic-year/create" element={<CreateAcademicYear />} />
        {/* GET ALL ACADEMIC YEARS */}
        <Route path="/academic-year/all" element={<GetAllAcademicYear />} />
        {/* GET ACADEMIC YEAR BY NAME */}
        <Route path="/academic-year/name" element={<GetAcademicYearByName />} />
        <Route
          path="/academic-year/by-name"
          element={<GetAcademicYearByName />}
        />
        <Route path="/academic-year/year" element={<GetAcademicYearByName />} />
        {/* UPDATE ACADEMIC YEAR */}
        <Route path="/academic-year/update" element={<UpdateAcademicYear />} />
        {/* DELETE ACADEMIC YEAR */}
        <Route path="/academic-year/delete" element={<DeleteAcademicYear />} />

        {/* =====================================================
            CLASS TEACHER & ATTENDANCE ROUTES
          ====================================================== */}
        <Route path="/class-teachers" element={<ClassTeacherList />} />
        <Route
          path="/class-teachers/assign"
          element={<AssignClassTeachersPage />}
        />
        <Route path="/attendance/take" element={<TakeAttendance />} />
        <Route path="/attendance/register" element={<AttendanceRegister />} />
        <Route path="/attendance" element={<TakeAttendance />} />
      </Routes>

      {/* =====================================================
          FOOTER (Conditional for Navbar and Dashboard Pages)
      ===================================================== */}

      <AppFooter />
    </BrowserRouter>
  );
}

export default App;
