// =====================================================
// CREATE STUDENT FEE
// Supports Class/Department-dependent fee structure filtering,
// Academic calendar ordering (Non-monthly -> Apr..Sep ->
// Half Yearly Exam -> Oct..Feb -> Annual Exam -> Mar),
// and Student Submitted vs Remainder Fee status tracking.
// =====================================================

import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import {
  getStudentFeeDepartmentDropdown,
  getStudentFeeClassDropdown,
  getStudentFeeSectionDropdown,
  getStudentFeeStudentDropdown,
  getStudentFeeByStudentId,
  createMultipleStudentFees,
  updateStudentFee,
  parseStudentFeeErrorMessage,
} from "../../Services/studentFeeService";
import { getStudentById } from "../../Services/studentService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import FeePopupModal from "../FeeStructure/FeePopupModal";

import "./CreateStudentFee.css";

// =====================================================
// ACADEMIC CALENDAR ORDERING HELPER
// Requirement:
// 1. Non-monthly fee structures first
// 2. Monthly: April, May, June, July, August, September
// 3. After September: Half Yearly Exam fee structure
// 4. Monthly: October, November, December, January, February
// 5. After February: Annual Exam fee structure
// 6. Then after March
// =====================================================

export const getFeeStructureSortOrder = (item) => {
  const text = (
    item.text ||
    item.Name ||
    item.FeeCategoryName ||
    item.Description ||
    ""
  ).toLowerCase();

  // 1. Half Yearly Exam (immediately after September = 60)
  if (
    text.includes("half yearly") ||
    text.includes("half-yearly") ||
    text.includes("halfyearly") ||
    text.includes("mid term") ||
    text.includes("mid-term") ||
    text.includes("midterm")
  ) {
    return 65;
  }

  // 2. Annual Exam (immediately after February = 110)
  if (
    text.includes("annual exam") ||
    text.includes("final exam") ||
    text.includes("annual examination") ||
    text.includes("yearly exam") ||
    text.includes("term 2 exam")
  ) {
    return 115;
  }

  // 3. Monthly sequence (April to March)
  if (text.includes("april") || text.includes("apr")) return 10;
  if (text.includes("may")) return 20;
  if (text.includes("june") || text.includes("jun")) return 30;
  if (text.includes("july") || text.includes("jul")) return 40;
  if (text.includes("august") || text.includes("aug")) return 50;
  if (
    text.includes("september") ||
    text.includes("sept") ||
    text.includes("sep")
  )
    return 60;
  if (text.includes("october") || text.includes("oct")) return 70;
  if (text.includes("november") || text.includes("nov")) return 80;
  if (text.includes("december") || text.includes("dec")) return 90;
  if (text.includes("january") || text.includes("jan")) return 100;
  if (text.includes("february") || text.includes("feb")) return 110;
  if (text.includes("march") || text.includes("mar")) return 120;

  // 4. Non-monthly fee structures (Admission, Library, Transport, Sports, Development, etc.)
  return 1;
};

export const sortFeeStructuresByAcademicCalendar = (items) => {
  return [...items].sort((a, b) => {
    const orderA = getFeeStructureSortOrder(a);
    const orderB = getFeeStructureSortOrder(b);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const nameA = a.text || a.Name || "";
    const nameB = b.text || b.Name || "";
    return nameA.localeCompare(nameB);
  });
};

const CreateStudentFee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [academicYears, setAcademicYears] = useState([]);
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  // Raw fee structures across all classes (cached for client-side filtering)
  const [rawFeeStructures, setRawFeeStructures] = useState([]);
  // Fee structures filtered by selected Class and Department, sorted by academic calendar
  const [feeStructures, setFeeStructures] = useState([]);

  // Student Fee History (submitted fees for the selected student)
  const [studentFeeHistory, setStudentFeeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [includePreviousBalance, setIncludePreviousBalance] = useState(false);

  // Auto-filled info banner
  const [autoFilledInfo, setAutoFilledInfo] = useState(null);

  const [formData, setFormData] = useState({
    AcademicYearId: "",
    DepartmentId: "",
    ClassId: "",
    SectionId: "",
    StudentId: "",
    Discount: 0,
    Fine: 0,
    PaidAmount: 0,
    DueDate: "",
  });

  const [selectedFeeStructures, setSelectedFeeStructures] = useState([]);
  const [currentFeeStructureId, setCurrentFeeStructureId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // FILTER FEE STRUCTURES BY CLASS, DEPARTMENT & ACADEMIC YEAR
  // =====================================================

  const filterAndSortFeeStructures = (
    classId,
    deptId,
    rawList,
    academicYearId,
  ) => {
    if (!classId) {
      setFeeStructures([]);
      return [];
    }

    const source = Array.isArray(rawList) ? rawList : rawFeeStructures;
    const targetYear =
      academicYearId !== undefined ? academicYearId : formData.AcademicYearId;

    const filtered = source.filter((f) => {
      const matchClass = String(f.ClassId ?? f.classId) === String(classId);
      const matchDept =
        !deptId || String(f.DepartmentId ?? f.departmentId) === String(deptId);
      const matchYear =
        !targetYear ||
        !f.AcademicYearId ||
        String(f.AcademicYearId ?? f.academicYearId) === String(targetYear);
      const isActive = f.IsActive !== false && f.isActive !== false;
      return matchClass && matchDept && matchYear && isActive;
    });

    const mapped = filtered.map((item) => ({
      id: item.Id ?? item.id,
      text: `${item.FeeCategoryName || item.categoryName || "Fee"} - ₹${Number(
        item.Amount ?? item.amount ?? 0,
      ).toFixed(2)}`,
      amount: Number(item.Amount ?? item.amount ?? 0),
      feeCategoryName: item.FeeCategoryName || item.categoryName || "",
      description: item.Description || item.description || "",
      dueDate: item.DueDate || item.dueDate || "",
      classId: item.ClassId ?? item.classId,
      departmentId: item.DepartmentId ?? item.departmentId,
      academicYearId: item.AcademicYearId ?? item.academicYearId,
    }));

    const sorted = sortFeeStructuresByAcademicCalendar(mapped);
    setFeeStructures(sorted);
    return sorted;
  };

  // =====================================================
  // LOAD ACADEMIC YEARS, DEPARTMENTS & ALL FEE STRUCTURES ON MOUNT
  // (Plus Auto-Fill Hydration from Navigation State / Params)
  // =====================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError("");

        const [academicYearData, departmentData, allFeesData] =
          await Promise.all([
            getAllAcademicYear().catch(() => []),
            getStudentFeeDepartmentDropdown(),
            getAllFeeStructures().catch(() => []),
          ]);

        const yearList = Array.isArray(academicYearData)
          ? academicYearData
          : [];
        setAcademicYears(yearList);

        // Find latest/last created academic year (highest ID)
        let latestYearId = "";
        if (yearList.length > 0) {
          const sorted = [...yearList].sort((a, b) => {
            const idA = Number(a.Id ?? a.id ?? 0);
            const idB = Number(b.Id ?? b.id ?? 0);
            return idB - idA;
          });
          latestYearId = String(sorted[0].Id ?? sorted[0].id ?? "");
        }

        setDefaultAcademicYearId(latestYearId);
        const depts = Array.isArray(departmentData) ? departmentData : [];
        setDepartments(depts);
        const rawFees = Array.isArray(allFeesData) ? allFeesData : [];
        setRawFeeStructures(rawFees);

        // Detect if coming from Student Fee detail / breakdown views with prefill context
        const prefillState =
          location.state ||
          (searchParams.get("studentId")
            ? {
                studentId: searchParams.get("studentId"),
                academicYearId: searchParams.get("academicYearId"),
                departmentId: searchParams.get("departmentId"),
                classId: searchParams.get("classId"),
                sectionId: searchParams.get("sectionId"),
                feeStructureIds: searchParams.get("feeStructureIds")
                  ? searchParams.get("feeStructureIds").split(",")
                  : [],
              }
            : null);

        if (prefillState && prefillState.studentId) {
          const targetStudentId = String(prefillState.studentId);
          let targetAyId = prefillState.academicYearId
            ? String(prefillState.academicYearId)
            : latestYearId;
          let targetDeptId = prefillState.departmentId
            ? String(prefillState.departmentId)
            : "";
          let targetClassId = prefillState.classId
            ? String(prefillState.classId)
            : "";
          let targetSecId = prefillState.sectionId
            ? String(prefillState.sectionId)
            : "";
          let studentProfile = null;

          // If any cascading parent filter is missing, fetch full student profile
          if (!targetDeptId || !targetClassId || !targetSecId) {
            try {
              studentProfile = await getStudentById(targetStudentId);
              if (studentProfile) {
                if (!targetDeptId)
                  targetDeptId = String(
                    studentProfile.DepartmentId ||
                      studentProfile.departmentId ||
                      "",
                  );
                if (!targetClassId)
                  targetClassId = String(
                    studentProfile.SchoolClassId ||
                      studentProfile.schoolClassId ||
                      studentProfile.ClassId ||
                      studentProfile.classId ||
                      "",
                  );
                if (!targetSecId)
                  targetSecId = String(
                    studentProfile.SectionId || studentProfile.sectionId || "",
                  );
                if (
                  !targetAyId &&
                  (studentProfile.AcademicYearId ||
                    studentProfile.academicYearId)
                ) {
                  targetAyId = String(
                    studentProfile.AcademicYearId ||
                      studentProfile.academicYearId,
                  );
                }
              }
            } catch (err) {
              console.warn(
                "Could not fetch student profile details for auto-fill:",
                err,
              );
            }
          }

          // 1. Load classes for department
          let loadedClasses = [];
          if (targetDeptId) {
            try {
              const cls = await getStudentFeeClassDropdown(targetDeptId);
              loadedClasses = Array.isArray(cls) ? cls : [];
              setClasses(loadedClasses);
            } catch (e) {
              console.warn("Could not load classes:", e);
            }
          }

          // 2. Load sections for class
          let loadedSections = [];
          if (targetClassId) {
            try {
              const secs = await getStudentFeeSectionDropdown(targetClassId);
              loadedSections = Array.isArray(secs) ? secs : [];
              setSections(loadedSections);
            } catch (e) {
              console.warn("Could not load sections:", e);
            }
          }

          // 3. Filter and sort fee structures for this class, department & academic year
          let sortedFees = [];
          if (targetClassId) {
            sortedFees = filterAndSortFeeStructures(
              targetClassId,
              targetDeptId,
              rawFees,
              targetAyId,
            );
          }

          // 4. Load students for section
          let loadedStudents = [];
          if (targetDeptId && targetClassId && targetSecId) {
            try {
              const stus = await getStudentFeeStudentDropdown(
                targetDeptId,
                targetClassId,
                targetSecId,
              );
              loadedStudents = Array.isArray(stus) ? stus : [];
              setStudents(loadedStudents);
            } catch (e) {
              console.warn("Could not load students:", e);
            }
          }

          // 5. Load student fee history (calculates submitted fees & previous unpaid dues)
          let historyList = [];
          try {
            setLoadingHistory(true);
            const history = await getStudentFeeByStudentId(targetStudentId);
            historyList = Array.isArray(history) ? history : [];
            setStudentFeeHistory(historyList);
          } catch (err) {
            console.warn("Could not fetch student fee history:", err);
          } finally {
            setLoadingHistory(false);
          }

          // 6. Set form data
          setFormData({
            AcademicYearId: targetAyId || latestYearId,
            DepartmentId: targetDeptId,
            ClassId: targetClassId,
            SectionId: targetSecId,
            StudentId: targetStudentId,
            Discount: 0,
            Fine: 0,
            PaidAmount: 0,
            DueDate: new Date().toISOString().split("T")[0],
          });

          // 7. Auto-select requested fee structures
          const requestedIds =
            prefillState.feeStructureIds ||
            (prefillState.feeStructureId
              ? [prefillState.feeStructureId]
              : []) ||
            (prefillState.autoSelectFeeStructureId
              ? [prefillState.autoSelectFeeStructureId]
              : []);

          let autoSelected = [];
          if (requestedIds && requestedIds.length > 0) {
            const reqSet = new Set(requestedIds.map(String));
            autoSelected = sortedFees
              .filter((fs) => reqSet.has(String(fs.id)))
              .map((fs) => ({
                id: fs.id,
                text: fs.text || `Fee Structure #${fs.id}`,
                amount: Number(fs.amount) || 0,
              }));
          } else {
            // Auto-select unsubmitted remainder structures if none specified
            const submittedIds = new Set(
              historyList.map((sf) =>
                String(sf.FeeStructureId ?? sf.feeStructureId),
              ),
            );
            autoSelected = sortedFees
              .filter((fs) => !submittedIds.has(String(fs.id)))
              .map((fs) => ({
                id: fs.id,
                text: fs.text || `Fee Structure #${fs.id}`,
                amount: Number(fs.amount) || 0,
              }));
          }

          if (autoSelected.length > 0) {
            setSelectedFeeStructures(autoSelected);
          }

          // Determine student display name for notification banner
          const foundStudent =
            loadedStudents.find(
              (s) => String(s.Id ?? s.id ?? s.value) === targetStudentId,
            ) || studentProfile;
          const studentDisplayName =
            foundStudent?.Name ||
            foundStudent?.StudentName ||
            (foundStudent?.FirstName
              ? `${foundStudent.FirstName} ${foundStudent.LastName || ""}`.trim()
              : `Student #${targetStudentId}`);

          setAutoFilledInfo({
            studentName: studentDisplayName,
            structuresCount: autoSelected.length,
          });
        } else {
          // Default initialization
          setFormData((prev) => ({
            ...prev,
            AcademicYearId: latestYearId,
          }));
        }
      } catch (err) {
        setError(parseStudentFeeErrorMessage(err));
      }
    };

    loadInitialData();
  }, [location.state, searchParams]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setMessage("");
    setError("");

    // Requirement 2: Discount in whole % (0-100) and Fine in whole integers
    if (name === "Discount") {
      const sanitized =
        value === ""
          ? ""
          : Math.max(0, Math.min(100, Math.floor(Number(value) || 0)));
      setFormData((prev) => ({
        ...prev,
        Discount: sanitized,
      }));
      return;
    }

    if (name === "Fine") {
      const sanitized =
        value === "" ? "" : Math.max(0, Math.floor(Number(value) || 0));
      setFormData((prev) => ({
        ...prev,
        Fine: sanitized,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ===================================================
    // ACADEMIC YEAR -> RE-FILTER FEE STRUCTURES
    // ===================================================

    if (name === "AcademicYearId") {
      if (formData.ClassId) {
        filterAndSortFeeStructures(
          formData.ClassId,
          formData.DepartmentId,
          rawFeeStructures,
          value,
        );
      }
    }

    // ===================================================
    // DEPARTMENT -> CLASS
    // ===================================================

    if (name === "DepartmentId") {
      setClasses([]);
      setSections([]);
      setStudents([]);
      setFeeStructures([]);
      setSelectedFeeStructures([]);
      setCurrentFeeStructureId("");
      setStudentFeeHistory([]);

      setFormData((prev) => ({
        ...prev,
        DepartmentId: value,
        ClassId: "",
        SectionId: "",
        StudentId: "",
      }));

      if (value) {
        try {
          const data = await getStudentFeeClassDropdown(value);
          setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      }
    }

    // ===================================================
    // CLASS -> SECTION & LOAD CLASS-SPECIFIC FEE STRUCTURES
    // ===================================================

    if (name === "ClassId") {
      setSections([]);
      setStudents([]);
      setSelectedFeeStructures([]);
      setCurrentFeeStructureId("");
      setStudentFeeHistory([]);

      setFormData((prev) => ({
        ...prev,
        ClassId: value,
        SectionId: "",
        StudentId: "",
      }));

      if (value) {
        // Filter fee structures specifically for this selected Class and Department
        filterAndSortFeeStructures(
          value,
          formData.DepartmentId,
          rawFeeStructures,
        );

        try {
          const data = await getStudentFeeSectionDropdown(value);
          setSections(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      } else {
        setFeeStructures([]);
      }
    }

    // ===================================================
    // SECTION -> STUDENT
    // ===================================================

    if (name === "SectionId") {
      setStudents([]);
      setSelectedFeeStructures([]);
      setCurrentFeeStructureId("");
      setStudentFeeHistory([]);

      setFormData((prev) => ({
        ...prev,
        SectionId: value,
        StudentId: "",
      }));

      if (value && formData.DepartmentId && formData.ClassId) {
        try {
          const data = await getStudentFeeStudentDropdown(
            formData.DepartmentId,
            formData.ClassId,
            value,
          );
          setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      }
    }

    // ===================================================
    // STUDENT -> LOAD EXISTING SUBMITTED FEES
    // ===================================================

    if (name === "StudentId") {
      setSelectedFeeStructures([]);
      setCurrentFeeStructureId("");
      setStudentFeeHistory([]);
      setIncludePreviousBalance(false);

      if (value) {
        setLoadingHistory(true);
        try {
          const history = await getStudentFeeByStudentId(value);
          setStudentFeeHistory(Array.isArray(history) ? history : []);
        } catch (err) {
          console.warn("Could not fetch student fee history:", err);
          setStudentFeeHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      }
    }
  };

  // Requirement 2: Stepper controls for Discount (%) and Fine (₹) with whole integers
  const handleStepDiscount = (delta) => {
    const current = Math.floor(Number(formData.Discount) || 0);
    const next = Math.max(0, Math.min(100, current + delta));
    setFormData((prev) => ({ ...prev, Discount: next }));
  };

  const handleStepFine = (delta) => {
    const current = Math.floor(Number(formData.Fine) || 0);
    const next = Math.max(0, current + delta);
    setFormData((prev) => ({ ...prev, Fine: next }));
  };

  // =====================================================
  // ADD FEE STRUCTURE TO SELECTION
  // =====================================================

  const handleAddFeeStructure = () => {
    if (!currentFeeStructureId) {
      setError("Please select a fee structure from the dropdown to add.");
      return;
    }

    const alreadyAdded = selectedFeeStructures.some(
      (item) => String(item.id) === String(currentFeeStructureId),
    );

    if (alreadyAdded) {
      setError("This fee structure is already added to the list.");
      return;
    }

    const feeObj = feeStructures.find(
      (item) => String(item.id) === String(currentFeeStructureId),
    );

    if (!feeObj) {
      setError("Selected fee structure details not found.");
      return;
    }

    setSelectedFeeStructures((prev) => [
      ...prev,
      {
        id: feeObj.id,
        text: feeObj.text || `Fee Structure #${feeObj.id}`,
        amount: Number(feeObj.amount) || 0,
      },
    ]);

    setCurrentFeeStructureId("");
    setError("");
  };

  // =====================================================
  // REMOVE FEE STRUCTURE FROM SELECTION
  // =====================================================

  const handleRemoveFeeStructure = (id) => {
    setSelectedFeeStructures((prev) =>
      prev.filter((item) => String(item.id) !== String(id)),
    );
  };

  // =====================================================
  // SUBMITTED VS REMAINDER FEE STRUCTURES
  // =====================================================

  const submittedFeeStructures = useMemo(() => {
    return studentFeeHistory.map((sf) => {
      const matchedFs = feeStructures.find(
        (f) => String(f.id) === String(sf.FeeStructureId),
      );
      const baseAmount = Number(
        sf.TotalAmount || sf.Amount || matchedFs?.amount || 0,
      );
      const paidAmount = Number(sf.PaidAmount || 0);
      const rawBalance = Number(
        sf.BalanceAmount !== undefined
          ? sf.BalanceAmount
          : Math.max(0, baseAmount - paidAmount),
      );

      // Requirement 3: If balance < 20 and > 0, round to 0.00 and show as Paid
      const isUnder20 = rawBalance > 0 && rawBalance < 20;
      const balanceAmount = isUnder20 ? 0 : rawBalance;
      const status =
        balanceAmount <= 0 || isUnder20
          ? "Paid"
          : sf.Status || (paidAmount > 0 ? "Partial" : "Pending");

      return {
        id: sf.Id,
        feeStructureId: sf.FeeStructureId,
        name:
          matchedFs?.text ||
          matchedFs?.feeCategoryName ||
          sf.InvoiceNo ||
          `Fee Structure #${sf.FeeStructureId}`,
        invoiceNo: sf.InvoiceNo || "-",
        totalAmount: baseAmount,
        paidAmount: paidAmount,
        balanceAmount: balanceAmount,
        status: status,
        isUnder20Waived: isUnder20,
      };
    });
  }, [studentFeeHistory, feeStructures]);

  // Previous unpaid fee structures & balance (Pichla Bakaya)
  const previousUnpaidFees = useMemo(() => {
    return submittedFeeStructures.filter((sf) => sf.balanceAmount > 0);
  }, [submittedFeeStructures]);

  const previousUnpaidBalance = useMemo(() => {
    return previousUnpaidFees.reduce(
      (sum, sf) => sum + (Number(sf.balanceAmount) || 0),
      0,
    );
  }, [previousUnpaidFees]);

  const remainderFeeStructures = useMemo(() => {
    const submittedIds = new Set(
      studentFeeHistory.map((sf) => String(sf.FeeStructureId)),
    );
    return feeStructures.filter((f) => !submittedIds.has(String(f.id)));
  }, [feeStructures, studentFeeHistory]);

  // =====================================================
  // DYNAMIC CALCULATIONS & ALLOCATIONS
  // =====================================================

  const totalBaseFee = useMemo(() => {
    return selectedFeeStructures.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [selectedFeeStructures]);

  // Requirement 2: Discount in percentage (%) with whole number integers
  const discountPercent = Math.max(
    0,
    Math.min(100, Math.floor(Number(formData.Discount) || 0)),
  );

  const discountVal = useMemo(() => {
    return Math.round(((totalBaseFee * discountPercent) / 100) * 100) / 100;
  }, [totalBaseFee, discountPercent]);

  // Requirement 2: Fine in whole number (complete integer, no decimals)
  const fineVal = Math.max(0, Math.floor(Number(formData.Fine) || 0));

  const paidVal = Math.max(0, Number(formData.PaidAmount) || 0);

  // Net payable for current selected fee structures
  const currentStructuresPayable = useMemo(() => {
    return Math.max(0, totalBaseFee - discountVal + fineVal);
  }, [totalBaseFee, discountVal, fineVal]);

  // Requirement 1: Total payable including previous unpaid balance if selected
  const totalPayable = useMemo(() => {
    const prevDue = includePreviousBalance ? previousUnpaidBalance : 0;
    return Math.max(0, currentStructuresPayable + prevDue);
  }, [currentStructuresPayable, includePreviousBalance, previousUnpaidBalance]);

  // Raw mathematical remaining balance for current transaction
  const rawRemainingBalance = useMemo(() => {
    return Math.max(0, totalPayable - paidVal);
  }, [totalPayable, paidVal]);

  // Requirement 3: If remaining balance is < 20 and > 0, waive to 0.00 and mark as Paid
  const isWaivedUnder20 = useMemo(() => {
    return rawRemainingBalance > 0 && rawRemainingBalance < 20;
  }, [rawRemainingBalance]);

  const remainingBalance = useMemo(() => {
    return isWaivedUnder20 ? 0 : rawRemainingBalance;
  }, [isWaivedUnder20, rawRemainingBalance]);

  const paymentStatus = useMemo(() => {
    if (selectedFeeStructures.length === 0 && !includePreviousBalance)
      return "N/A";
    if (paidVal === 0 && totalPayable > 0) return "Pending";
    if (
      remainingBalance === 0 ||
      isWaivedUnder20 ||
      (paidVal >= totalPayable && totalPayable > 0)
    ) {
      return "Paid";
    }
    return "Partial";
  }, [
    selectedFeeStructures,
    includePreviousBalance,
    paidVal,
    totalPayable,
    remainingBalance,
    isWaivedUnder20,
  ]);

  // Current Structure Remaining Balance (Current Bakaya)
  const currentRemainingBalance = useMemo(() => {
    if (includePreviousBalance) {
      return remainingBalance;
    }
    const rawCurrent = Math.max(0, currentStructuresPayable - paidVal);
    return rawCurrent > 0 && rawCurrent < 20 ? 0 : rawCurrent;
  }, [
    includePreviousBalance,
    remainingBalance,
    currentStructuresPayable,
    paidVal,
  ]);

  // Total Combined Remaining Balance (Kul Bakaya = Pichla Bakaya + Current Bakaya)
  const totalCombinedRemainingBalance = useMemo(() => {
    if (includePreviousBalance) {
      return remainingBalance;
    }
    const rawCombined = previousUnpaidBalance + currentRemainingBalance;
    return rawCombined > 0 && rawCombined < 20 ? 0 : rawCombined;
  }, [
    includePreviousBalance,
    remainingBalance,
    previousUnpaidBalance,
    currentRemainingBalance,
  ]);

  // Waterfall allocation across selected fee structures
  const allocatedFeeItems = useMemo(() => {
    let remainingDiscount = discountVal;
    let remainingFine = fineVal;
    let remainingPaid = paidVal;

    return selectedFeeStructures.map((fee, index) => {
      const base = Number(fee.amount) || 0;

      // Allocate discount up to base amount
      const itemDiscount = Math.min(base, remainingDiscount);
      remainingDiscount = Math.max(0, remainingDiscount - itemDiscount);

      // Allocate fine to first fee item
      const itemFine = index === 0 ? remainingFine : 0;
      if (index === 0) remainingFine = 0;

      const itemPayable = Math.max(0, base - itemDiscount + itemFine);

      // Allocate paid amount sequentially
      let itemPaid = 0;
      if (index === selectedFeeStructures.length - 1) {
        itemPaid = Math.min(itemPayable, remainingPaid);
        remainingPaid = Math.max(0, remainingPaid - itemPaid);
      } else {
        itemPaid = Math.min(itemPayable, remainingPaid);
        remainingPaid = Math.max(0, remainingPaid - itemPaid);
      }

      const rawItemBalance = Math.max(0, itemPayable - itemPaid);
      // Requirement 3: If item balance < 20 and > 0, waive to 0 and mark Paid
      const isItemWaived = rawItemBalance > 0 && rawItemBalance < 20;
      const itemBalance = isItemWaived ? 0 : rawItemBalance;

      let itemStatus = "Pending";
      if ((itemBalance <= 0 || isItemWaived) && itemPayable > 0) {
        itemStatus = "Paid";
      } else if (itemPaid > 0) {
        itemStatus = "Partial";
      }

      return {
        ...fee,
        baseAmount: base,
        discount: itemDiscount,
        fine: itemFine,
        totalAmount: itemPayable,
        paidAmount: isItemWaived ? itemPayable : itemPaid,
        balanceAmount: itemBalance,
        status: itemStatus,
        isWaived: isItemWaived,
      };
    });
  }, [selectedFeeStructures, discountVal, fineVal, paidVal]);

  const handleAddAllRemainderFees = () => {
    const newItems = remainderFeeStructures
      .filter(
        (rem) =>
          !selectedFeeStructures.some((s) => String(s.id) === String(rem.id)),
      )
      .map((rem) => ({
        id: rem.id,
        text: rem.text,
        amount: rem.amount,
      }));

    if (newItems.length === 0) {
      setError(
        "All remainder fee structures are already added to your selection.",
      );
      return;
    }

    setSelectedFeeStructures((prev) => [...prev, ...newItems]);
    setError("");
  };

  // =====================================================
  // PRINT UTILITIES & HANDLERS (3 PRINT FEATURES)
  // =====================================================

  const getStudentPrintDetails = () => {
    const student = students.find(
      (s) =>
        String(s.id ?? s.Id ?? s.value ?? s.Value) ===
        String(formData.StudentId),
    );
    const dept = departments.find(
      (d) => String(d.id ?? d.Id) === String(formData.DepartmentId),
    );
    const cls = classes.find(
      (c) => String(c.id ?? c.Id) === String(formData.ClassId),
    );
    const sec = sections.find(
      (s) => String(s.id ?? s.Id) === String(formData.SectionId),
    );
    const yr = academicYears.find(
      (y) => String(y.id ?? y.Id) === String(formData.AcademicYearId),
    );

    const studentName = student
      ? String(
          student.text ??
            student.Text ??
            student.name ??
            student.Name ??
            student.FirstName ??
            "",
        )
      : autoFilledInfo?.studentName || "N/A";

    const studentId = formData.StudentId || "N/A";
    const deptName = dept
      ? dept.name ?? dept.Name ?? dept.text ?? dept.Text ?? ""
      : "N/A";
    const className = cls
      ? cls.name ?? cls.Name ?? cls.text ?? cls.Text ?? ""
      : "N/A";
    const sectionName = sec
      ? sec.name ?? sec.Name ?? sec.text ?? sec.Text ?? ""
      : "N/A";
    const yearName = yr
      ? yr.YearName ?? yr.yearName ?? yr.name ?? yr.text ?? ""
      : "N/A";
    const printDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const printTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      studentName,
      studentId,
      deptName,
      className,
      sectionName,
      yearName,
      printDate,
      printTime,
    };
  };

  const printDocument = (title, contentHtml) => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      alert("Please allow popups in your browser to print the fee document.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { margin: 0; padding: 25px; color: #1e293b; background: #fff; font-size: 13px; }
            .receipt-container { max-width: 780px; margin: 0 auto; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 24px; }
            .receipt-header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px; }
            .receipt-header h1 { margin: 0 0 4px; font-size: 22px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .receipt-header p { margin: 0; color: #64748b; font-size: 12px; }
            .receipt-title-badge { display: inline-block; margin-top: 8px; padding: 4px 16px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            .receipt-title-badge.submitted { background: #16a34a; }
            .receipt-title-badge.remainder { background: #dc2626; }
            .receipt-title-badge.transaction { background: #2563eb; }
            .student-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; }
            .info-item { display: flex; font-size: 12.5px; }
            .info-item strong { width: 130px; color: #475569; }
            .info-item span { color: #0f172a; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th { background: #f1f5f9; color: #334155; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid #cbd5e1; padding: 8px 10px; }
            td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12.5px; color: #1e293b; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-row td { font-weight: 700; background: #f8fafc; border-top: 2px solid #cbd5e1; font-size: 13px; }
            .badge-paid { color: #16a34a; font-weight: 700; background: #dcfce7; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
            .badge-pending { color: #dc2626; font-weight: 700; background: #fee2e2; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
            .badge-partial { color: #d97706; font-weight: 700; background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
            .summary-boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
            .summary-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #f8fafc; }
            .summary-box .label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
            .summary-box .val { font-size: 16px; font-weight: 800; color: #0f172a; }
            .summary-box.paid .val { color: #16a34a; }
            .summary-box.due .val { color: #dc2626; }
            .receipt-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 35px; padding-top: 20px; }
            .signature-box { text-align: center; width: 200px; border-top: 1.5px dashed #64748b; padding-top: 6px; font-size: 12px; font-weight: 600; color: #475569; }
            .stamp-box { text-align: center; width: 140px; height: 50px; border: 1.5px dashed #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
            .print-meta { font-size: 10.5px; color: #94a3b8; margin-top: 14px; text-align: center; }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; padding: 0; }
              @page { margin: 1.2cm; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${contentHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 1. Print Submitted Fee Structures
  const handlePrintSubmittedFees = () => {
    if (!formData.StudentId) {
      setError("Please select a student first.");
      return;
    }
    if (submittedFeeStructures.length === 0) {
      setError("No submitted fee structures found to print for this student.");
      return;
    }

    const info = getStudentPrintDetails();
    const totalSubmittedPayable = submittedFeeStructures.reduce(
      (sum, s) => sum + (Number(s.totalAmount) || 0),
      0,
    );
    const totalSubmittedPaid = submittedFeeStructures.reduce(
      (sum, s) => sum + (Number(s.paidAmount) || 0),
      0,
    );
    const totalSubmittedBal = submittedFeeStructures.reduce(
      (sum, s) => sum + (Number(s.balanceAmount) || 0),
      0,
    );

    const rowsHtml = submittedFeeStructures
      .map(
        (sf, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${sf.name}</strong></td>
          <td class="text-right">₹${sf.totalAmount.toFixed(2)}</td>
          <td class="text-right" style="color: #16a34a; font-weight: 600;">₹${sf.paidAmount.toFixed(2)}</td>
          <td class="text-right" style="color: ${sf.balanceAmount > 0 ? "#dc2626" : "#16a34a"}; font-weight: 600;">₹${sf.balanceAmount.toFixed(2)}</td>
          <td class="text-center">
            <span class="badge-${sf.status.toLowerCase()}">${sf.status}</span>
          </td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <div class="receipt-header">
        <h1>College / School Fee Management</h1>
        <p>Empowering Education, Enhancing Futures</p>
        <div class="receipt-title-badge submitted">✅ Submitted Fee Structures Statement</div>
      </div>

      <div class="student-info-grid">
        <div class="info-item"><strong>Student Name:</strong> <span>${info.studentName}</span></div>
        <div class="info-item"><strong>Student ID:</strong> <span>${info.studentId}</span></div>
        <div class="info-item"><strong>Academic Year:</strong> <span>${info.yearName}</span></div>
        <div class="info-item"><strong>Department:</strong> <span>${info.deptName}</span></div>
        <div class="info-item"><strong>Class & Section:</strong> <span>${info.className} - ${info.sectionName}</span></div>
        <div class="info-item"><strong>Statement Date:</strong> <span>${info.printDate} ${info.printTime}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Fee Structure</th>
            <th class="text-right">Payable Amount</th>
            <th class="text-right">Paid Amount</th>
            <th class="text-right">Remaining Balance</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr class="totals-row">
            <td colspan="2">TOTAL (${submittedFeeStructures.length} Structure${submittedFeeStructures.length === 1 ? "" : "s"})</td>
            <td class="text-right">₹${totalSubmittedPayable.toFixed(2)}</td>
            <td class="text-right" style="color: #16a34a;">₹${totalSubmittedPaid.toFixed(2)}</td>
            <td class="text-right" style="color: ${totalSubmittedBal > 0 ? "#dc2626" : "#16a34a"};">₹${totalSubmittedBal.toFixed(2)}</td>
            <td class="text-center">${totalSubmittedBal === 0 ? "CLEAR" : "DUE"}</td>
          </tr>
        </tfoot>
      </table>

      <div class="summary-boxes">
        <div class="summary-box">
          <div class="label">Total Fee Payable</div>
          <div class="val">₹${totalSubmittedPayable.toFixed(2)}</div>
        </div>
        <div class="summary-box paid">
          <div class="label">Total Amount Paid</div>
          <div class="val">₹${totalSubmittedPaid.toFixed(2)}</div>
        </div>
        <div class="summary-box ${totalSubmittedBal > 0 ? "due" : "paid"}">
          <div class="label">Remaining Balance</div>
          <div class="val">₹${totalSubmittedBal.toFixed(2)}</div>
        </div>
      </div>

      <div class="receipt-footer">
        <div class="stamp-box">Official Seal</div>
        <div class="signature-box">Accountant / Cashier Signature</div>
      </div>

      <div class="print-meta">Generated on ${info.printDate} at ${info.printTime} • Verified by College Administration System</div>
    `;

    printDocument("Submitted Fee Structures Statement", html);
  };

  // 2. Print Remainder Fee Structures
  const handlePrintRemainderFees = () => {
    if (!formData.StudentId) {
      setError("Please select a student first.");
      return;
    }
    if (remainderFeeStructures.length === 0) {
      setError("No remainder fee structures found for this student.");
      return;
    }

    const info = getStudentPrintDetails();
    const totalRemainderPending = remainderFeeStructures.reduce(
      (sum, r) => sum + (Number(r.amount) || 0),
      0,
    );
    const grandPending = totalRemainderPending + (previousUnpaidBalance || 0);

    const rowsHtml = remainderFeeStructures
      .map(
        (rf, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${rf.text}</strong></td>
          <td class="text-right" style="color: #b91c1c; font-weight: 700;">₹${rf.amount.toFixed(2)}</td>
          <td class="text-center">${rf.dueDate || "As Per Calendar"}</td>
          <td class="text-center"><span class="badge-pending">Pending</span></td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <div class="receipt-header">
        <h1>College / School Fee Management</h1>
        <p>Empowering Education, Enhancing Futures</p>
        <div class="receipt-title-badge remainder">⏳ Remainder / Due Fee Notice</div>
      </div>

      <div class="student-info-grid">
        <div class="info-item"><strong>Student Name:</strong> <span>${info.studentName}</span></div>
        <div class="info-item"><strong>Student ID:</strong> <span>${info.studentId}</span></div>
        <div class="info-item"><strong>Academic Year:</strong> <span>${info.yearName}</span></div>
        <div class="info-item"><strong>Department:</strong> <span>${info.deptName}</span></div>
        <div class="info-item"><strong>Class & Section:</strong> <span>${info.className} - ${info.sectionName}</span></div>
        <div class="info-item"><strong>Notice Date:</strong> <span>${info.printDate} ${info.printTime}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Remaining Fee Structure</th>
            <th class="text-right">Pending Amount</th>
            <th class="text-center">Due Date</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr class="totals-row">
            <td colspan="2">TOTAL REMAINDER FEES (${remainderFeeStructures.length} Structure${remainderFeeStructures.length === 1 ? "" : "s"})</td>
            <td class="text-right" style="color: #b91c1c;">₹${totalRemainderPending.toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
          ${
            previousUnpaidBalance > 0
              ? `
          <tr class="totals-row" style="background: #fff1f2;">
            <td colspan="2" style="color: #991b1b;">+ Previous Unpaid Balance (Pichla Bakaya)</td>
            <td class="text-right" style="color: #991b1b;">₹${previousUnpaidBalance.toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
          <tr class="totals-row" style="background: #fee2e2; font-size: 14px;">
            <td colspan="2" style="color: #b91c1c;">GRAND TOTAL PENDING / DUE</td>
            <td class="text-right" style="color: #b91c1c; font-weight: 800;">₹${grandPending.toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
          `
              : ""
          }
        </tfoot>
      </table>

      <div class="summary-boxes">
        <div class="summary-box due">
          <div class="label">Total Remainder Fee</div>
          <div class="val">₹${totalRemainderPending.toFixed(2)}</div>
        </div>
        <div class="summary-box">
          <div class="label">Pichla Bakaya</div>
          <div class="val">₹${previousUnpaidBalance.toFixed(2)}</div>
        </div>
        <div class="summary-box due">
          <div class="label">Total Due Amount</div>
          <div class="val">₹${grandPending.toFixed(2)}</div>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px 14px; margin-top: 14px; font-size: 12px; color: #475569;">
        <strong>Important Notice:</strong> Kindly clear the above pending fee structures before the stipulated due date to avoid late fine charges.
      </div>

      <div class="receipt-footer">
        <div class="stamp-box">Official Seal</div>
        <div class="signature-box">Accountant / Cashier Signature</div>
      </div>

      <div class="print-meta">Generated on ${info.printDate} at ${info.printTime} • Verified by College Administration System</div>
    `;

    printDocument("Remainder Fee Structures Statement", html);
  };

  // 3. Print Current Fee Slip (Beside Reset Button)
  const handlePrintCurrentFeeSlip = () => {
    if (!formData.StudentId) {
      setError("Please select a student first.");
      return;
    }
    if (selectedFeeStructures.length === 0 && !includePreviousBalance) {
      setError(
        "Please select at least one fee structure or include previous balance to print fee slip.",
      );
      return;
    }

    const info = getStudentPrintDetails();
    const rowsHtml = allocatedFeeItems
      .map(
        (item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${item.text}</strong></td>
          <td class="text-right">₹${item.baseAmount.toFixed(2)}</td>
          <td class="text-right">₹${item.totalAmount.toFixed(2)}</td>
          <td class="text-right" style="color: #16a34a; font-weight: 600;">₹${item.paidAmount.toFixed(2)}</td>
          <td class="text-right" style="color: ${item.balanceAmount > 0 ? "#dc2626" : "#16a34a"}; font-weight: 600;">₹${item.balanceAmount.toFixed(2)}</td>
          <td class="text-center"><span class="badge-${item.status.toLowerCase()}">${item.status}</span></td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <div class="receipt-header">
        <h1>College / School Fee Management</h1>
        <p>Empowering Education, Enhancing Futures</p>
        <div class="receipt-title-badge transaction">🧾 Student Fee Transaction Slip</div>
      </div>

      <div class="student-info-grid">
        <div class="info-item"><strong>Student Name:</strong> <span>${info.studentName}</span></div>
        <div class="info-item"><strong>Student ID:</strong> <span>${info.studentId}</span></div>
        <div class="info-item"><strong>Academic Year:</strong> <span>${info.yearName}</span></div>
        <div class="info-item"><strong>Department:</strong> <span>${info.deptName}</span></div>
        <div class="info-item"><strong>Class & Section:</strong> <span>${info.className} - ${info.sectionName}</span></div>
        <div class="info-item"><strong>Receipt Date:</strong> <span>${info.printDate} ${info.printTime}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Fee Structure</th>
            <th class="text-right">Base Fee</th>
            <th class="text-right">Payable</th>
            <th class="text-right">Paid Now</th>
            <th class="text-right">Remaining</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr class="totals-row">
            <td colspan="2">TOTAL BASE FEE</td>
            <td class="text-right">₹${totalBaseFee.toFixed(2)}</td>
            <td class="text-right" style="color: #1e3a8a;">₹${totalPayable.toFixed(2)}</td>
            <td class="text-right" style="color: #16a34a;">₹${paidVal.toFixed(2)}</td>
            <td class="text-right" style="color: ${remainingBalance > 0 ? "#dc2626" : "#16a34a"};">₹${remainingBalance.toFixed(2)}</td>
            <td class="text-center"><span class="badge-${paymentStatus.toLowerCase()}">${paymentStatus}</span></td>
          </tr>
        </tfoot>
      </table>

      <div class="summary-boxes" style="grid-template-columns: repeat(4, 1fr);">
        <div class="summary-box">
          <div class="label">Discount (${discountPercent}%)</div>
          <div class="val" style="color: #2563eb;">₹${discountVal.toFixed(2)}</div>
        </div>
        <div class="summary-box">
          <div class="label">Late Fine (₹)</div>
          <div class="val" style="color: #ea580c;">₹${fineVal.toFixed(2)}</div>
        </div>
        <div class="summary-box paid">
          <div class="label">Paid Amount Now</div>
          <div class="val">₹${paidVal.toFixed(2)}</div>
        </div>
        <div class="summary-box ${remainingBalance > 0 ? "due" : "paid"}">
          <div class="label">Remaining Balance</div>
          <div class="val">₹${remainingBalance.toFixed(2)}</div>
        </div>
      </div>

      ${
        includePreviousBalance && previousUnpaidBalance > 0
          ? `<div style="font-size: 12px; color: #475569; margin: 8px 0; background: #fefce8; padding: 6px 12px; border-radius: 4px; border: 1px solid #fde047;">
              ℹ️ Includes Previous Unpaid Balance (Pichla Bakaya) of <strong>₹${previousUnpaidBalance.toFixed(2)}</strong>.
            </div>`
          : ""
      }

      <div class="receipt-footer">
        <div class="signature-box" style="text-align: left;">Student / Parent Signature</div>
        <div class="stamp-box">Official Seal</div>
        <div class="signature-box">Authorized Cashier Signature</div>
      </div>

      <div class="print-meta">Generated on ${info.printDate} at ${info.printTime} • Verified by College Administration System</div>
    `;

    printDocument("Student Fee Transaction Slip", html);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.DepartmentId) {
      setError("Please select a Department.");
      return;
    }
    if (!formData.ClassId) {
      setError("Please select a Class.");
      return;
    }
    if (!formData.SectionId) {
      setError("Please select a Section.");
      return;
    }
    if (!formData.StudentId) {
      setError("Please select a Student.");
      return;
    }
    if (selectedFeeStructures.length === 0) {
      setError("Please select and add at least one Fee Structure.");
      return;
    }
    if (!formData.DueDate) {
      setError("Please specify a Due Date.");
      return;
    }

    setLoading(true);

    try {
      const payloads = allocatedFeeItems.map((item) => ({
        StudentId: Number(formData.StudentId),
        FeeStructureId: Number(item.id),
        FeeStructureName: item.text,
        Discount: Number(item.discount.toFixed(2)),
        Fine: Number(item.fine.toFixed(2)),
        PaidAmount: Number(item.paidAmount.toFixed(2)),
        DueDate: formData.DueDate,
      }));

      const { results, errors } = await createMultipleStudentFees(payloads);

      if (errors.length === 0) {
        // If previous unpaid balance was included and student paid extra to cover prior dues
        if (includePreviousBalance && previousUnpaidFees.length > 0) {
          let excessPaid = Math.max(0, paidVal - currentStructuresPayable);
          for (const prevFee of previousUnpaidFees) {
            if (excessPaid <= 0) break;
            const needed = prevFee.balanceAmount;
            const payToPrev = Math.min(needed, excessPaid);
            excessPaid -= payToPrev;
            try {
              await updateStudentFee(prevFee.id, {
                StudentId: Number(formData.StudentId),
                FeeStructureId: prevFee.feeStructureId,
                PaidAmount: Number((prevFee.paidAmount + payToPrev).toFixed(2)),
                DueDate: formData.DueDate,
              });
            } catch (prevErr) {
              console.warn(
                `Could not update previous fee #${prevFee.id}:`,
                prevErr,
              );
            }
          }
        }

        const studentObj = students.find(
          (s) => String(s.id) === String(formData.StudentId),
        );
        const studentName =
          studentObj?.text || `Student #${formData.StudentId}`;

        const successMsg = `Successfully assigned ${results.length} fee structure(s) to ${studentName}! Total Payable: ₹${totalPayable.toFixed(2)} | Paid: ₹${paidVal.toFixed(2)} | Remaining Balance: ₹${remainingBalance.toFixed(2)}`;

        setMessage(successMsg);
        setPopup({
          show: true,
          type: "success",
          title: "Fee Assigned Successfully!",
          message: successMsg,
        });

        // Reset form selections
        setSelectedFeeStructures([]);
        setCurrentFeeStructureId("");
        setIncludePreviousBalance(false);
        setFormData({
          AcademicYearId: defaultAcademicYearId,
          DepartmentId: "",
          ClassId: "",
          SectionId: "",
          StudentId: "",
          Discount: 0,
          Fine: 0,
          PaidAmount: 0,
          DueDate: "",
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        setStudentFeeHistory([]);
      } else if (results.length > 0) {
        const failedIds = errors.map((err) => String(err.feeStructureId));
        setSelectedFeeStructures((prev) =>
          prev.filter((fee) => failedIds.includes(String(fee.id))),
        );

        const partialMsg = `${results.length} fee structure(s) assigned successfully. ${errors.length} failed: ${errors.map((e) => `${e.feeStructureName}: ${e.error}`).join("; ")}`;

        setError(partialMsg);
        setPopup({
          show: true,
          type: "error",
          title: "Partial Fee Assignment",
          message: partialMsg,
        });
      } else {
        const allFailedMsg = errors
          .map((e) => `${e.feeStructureName}: ${e.error}`)
          .join("\n");

        setError(allFailedMsg);
        setPopup({
          show: true,
          type: "error",
          title: "Fee Assignment Failed",
          message: allFailedMsg,
        });
      }
    } catch (err) {
      const errorMsg = parseStudentFeeErrorMessage(err);
      setError(errorMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Creation Failed",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData({
      AcademicYearId: defaultAcademicYearId,
      DepartmentId: "",
      ClassId: "",
      SectionId: "",
      StudentId: "",
      Discount: 0,
      Fine: 0,
      PaidAmount: 0,
      DueDate: "",
    });

    setSelectedFeeStructures([]);
    setCurrentFeeStructureId("");
    setIncludePreviousBalance(false);
    setAutoFilledInfo(null);
    setClasses([]);
    setSections([]);
    setStudents([]);
    setFeeStructures([]);
    setStudentFeeHistory([]);
    setMessage("");
    setError("");
  };

  return (
    <div className="create-student-fee-page">
      <div className="create-student-fee-container">
        <div className="create-student-fee-header">
          <h2>Create Student Fee</h2>
          <p>
            Assign one or more fee structures to a student with real-time
            payable, paid, and remaining balance calculations.
          </p>
        </div>

        {message && <div className="create-student-fee-success">{message}</div>}

        {error && <div className="create-student-fee-error">{error}</div>}

        {/* Auto-fill notification banner */}
        {autoFilledInfo && (
          <div className="fee-autofill-banner">
            <div className="fee-autofill-icon">✨</div>
            <div className="fee-autofill-content">
              <strong>Filters Auto-Filled for Student:</strong>{" "}
              <span className="fee-autofill-student-name">
                {autoFilledInfo.studentName}
              </span>
              {autoFilledInfo.structuresCount > 0 ? (
                <span>
                  {" "}
                  &bull; {autoFilledInfo.structuresCount} remainder fee
                  structure
                  {autoFilledInfo.structuresCount === 1 ? "" : "s"}{" "}
                  automatically selected.
                </span>
              ) : (
                <span>
                  {" "}
                  &bull; Student academic profile & fee ledger loaded.
                </span>
              )}
            </div>
            <button
              type="button"
              className="fee-autofill-dismiss"
              onClick={() => setAutoFilledInfo(null)}
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        <form className="create-student-fee-form" onSubmit={handleSubmit}>
          {/* 1. Student Details */}
          <div className="form-section-title">1. Student Details</div>
          <div className="create-student-fee-grid">
            <div className="create-student-fee-field">
              <label>Academic Year *</label>
              <select
                name="AcademicYearId"
                value={formData.AcademicYearId}
                onChange={handleChange}
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((ay) => (
                  <option key={ay.Id ?? ay.id} value={ay.Id ?? ay.id}>
                    {ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-student-fee-field">
              <label>Department *</label>
              <select
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-student-fee-field">
              <label>Class *</label>
              <select
                name="ClassId"
                value={formData.ClassId}
                onChange={handleChange}
                disabled={!formData.DepartmentId}
                required
              >
                <option value="">Select Class</option>
                {classes.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-student-fee-field">
              <label>Section *</label>
              <select
                name="SectionId"
                value={formData.SectionId}
                onChange={handleChange}
                disabled={!formData.ClassId}
                required
              >
                <option value="">Select Section</option>
                {sections.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-student-fee-field">
              <label>Student *</label>
              <select
                name="StudentId"
                value={formData.StudentId}
                onChange={handleChange}
                disabled={!formData.SectionId}
                required
              >
                <option value="">Select Student</option>
                {students.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Existing Fee History & Remainder Breakdown */}
          {formData.StudentId && (
            <div className="student-fee-history-card">
              <div className="student-fee-history-header">
                <div>
                  <h4>Student Fee Status & Ledger</h4>
                  <p>
                    Submitted fees vs remaining fee structures for this student.
                  </p>
                </div>
                {remainderFeeStructures.length > 0 && (
                  <button
                    type="button"
                    className="add-all-remainder-btn"
                    onClick={handleAddAllRemainderFees}
                  >
                    + Add All Remainder Fees ({remainderFeeStructures.length})
                  </button>
                )}
              </div>

              {loadingHistory ? (
                <div className="fee-history-loading">
                  Loading student fee records...
                </div>
              ) : (
                <div className="student-fee-history-tables">
                  {/* Submitted Fees Table */}
                  <div className="history-sub-table">
                    <div className="history-table-caption caption-submitted">
                      <span className="caption-title-text">
                        ✅ Submitted Fee Structures ({submittedFeeStructures.length})
                      </span>
                      {submittedFeeStructures.length > 0 && (
                        <button
                          type="button"
                          className="fee-section-print-btn btn-print-submitted"
                          onClick={handlePrintSubmittedFees}
                          title="Print Submitted Fee Structures Statement / Receipt"
                        >
                          🖨️ Print Submitted Fees
                        </button>
                      )}
                    </div>
                    {submittedFeeStructures.length === 0 ? (
                      <div className="history-empty-note">
                        No fee structures submitted yet for this student.
                      </div>
                    ) : (
                      <div className="history-table-scroll">
                        <table className="fee-mini-history-table">
                          <thead>
                            <tr>
                              <th>Fee Structure</th>
                              <th style={{ textAlign: "right" }}>Payable</th>
                              <th style={{ textAlign: "right" }}>Paid</th>
                              <th style={{ textAlign: "right" }}>Remaining</th>
                              <th style={{ textAlign: "center" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submittedFeeStructures.map((sf, sIdx) => (
                              <tr key={sIdx}>
                                <td className="fee-mini-name">{sf.name}</td>
                                <td style={{ textAlign: "right" }}>
                                  ₹{sf.totalAmount.toFixed(2)}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    color: "#16a34a",
                                    fontWeight: "600",
                                  }}
                                >
                                  ₹{sf.paidAmount.toFixed(2)}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    color:
                                      sf.balanceAmount > 0
                                        ? "#dc2626"
                                        : "#16a34a",
                                    fontWeight: "600",
                                  }}
                                >
                                  ₹{sf.balanceAmount.toFixed(2)}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <span
                                    className={`fee-mini-badge status-${sf.status.toLowerCase()}`}
                                  >
                                    {sf.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Remainder Fees Table */}
                  <div className="history-sub-table">
                    <div className="history-table-caption caption-remainder">
                      <span className="caption-title-text">
                        ⏳ Remainder Fee Structures ({remainderFeeStructures.length})
                      </span>
                      {remainderFeeStructures.length > 0 && (
                        <button
                          type="button"
                          className="fee-section-print-btn btn-print-remainder"
                          onClick={handlePrintRemainderFees}
                          title="Print Remainder / Due Fee Notice"
                        >
                          🖨️ Print Remainder Fees
                        </button>
                      )}
                    </div>
                    {remainderFeeStructures.length === 0 ? (
                      <div className="history-empty-note all-cleared">
                        🎉 All applicable fee structures have been submitted for
                        this student!
                      </div>
                    ) : (
                      <div className="history-table-scroll">
                        <table className="fee-mini-history-table">
                          <thead>
                            <tr>
                              <th>Fee Structure</th>
                              <th style={{ textAlign: "right" }}>
                                Pending Amount
                              </th>
                              <th style={{ textAlign: "center" }}>Status</th>
                              <th style={{ textAlign: "center" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {remainderFeeStructures.map((rf) => {
                              const isAdded = selectedFeeStructures.some(
                                (s) => String(s.id) === String(rf.id),
                              );
                              return (
                                <tr key={rf.id}>
                                  <td className="fee-mini-name">{rf.text}</td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      color: "#b91c1c",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ₹{rf.amount.toFixed(2)}
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span className="fee-mini-badge status-pending">
                                      Pending
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <button
                                      type="button"
                                      className="add-single-remainder-btn"
                                      disabled={isAdded}
                                      onClick={() => {
                                        setSelectedFeeStructures((prev) => [
                                          ...prev,
                                          {
                                            id: rf.id,
                                            text: rf.text,
                                            amount: rf.amount,
                                          },
                                        ]);
                                      }}
                                    >
                                      {isAdded ? "✓ Added" : "+ Add"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Previous Unpaid Balance (Pichla Bakaya) Card */}
          {formData.StudentId && previousUnpaidBalance > 0 && (
            <div className="previous-balance-card">
              <div className="previous-balance-content">
                <div className="previous-balance-left">
                  <div className="previous-balance-badge-row">
                    <span className="previous-balance-badge">
                      ⚠️ Previous Unpaid Balance (Pichla Bakaya)
                    </span>
                    {includePreviousBalance ? (
                      <span className="previous-balance-status-badge status-included">
                        ✓ Included in Current Payment
                      </span>
                    ) : (
                      <span className="previous-balance-status-badge status-excluded">
                        Excluded (Not Added)
                      </span>
                    )}
                  </div>
                  <div className="previous-balance-title">
                    Previous Unpaid Balance:{" "}
                    <span className="previous-balance-amount">
                      ₹{previousUnpaidBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="previous-balance-desc">
                    This student has an unpaid balance of{" "}
                    <strong>₹{previousUnpaidBalance.toFixed(2)}</strong> from
                    previous fee submissions. Would you like to include it in
                    this payment?
                  </div>
                </div>
                <div className="previous-balance-action">
                  <label className="previous-balance-toggle-label">
                    <input
                      type="checkbox"
                      checked={includePreviousBalance}
                      onChange={(e) =>
                        setIncludePreviousBalance(e.target.checked)
                      }
                    />
                    <span className="toggle-text">
                      {includePreviousBalance
                        ? "✓ Included in Payment"
                        : "+ Include in Current Payment"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 2. Select Fee Structures */}
          <div className="form-section-title">
            2. Fee Structures ({selectedFeeStructures.length} Selected)
            {!formData.ClassId && (
              <span className="section-title-hint">
                (Please select Class above to view applicable fee structures)
              </span>
            )}
          </div>

          <div className="fee-picker-container">
            <div className="fee-picker-controls">
              <div className="fee-picker-select-wrapper">
                <select
                  value={currentFeeStructureId}
                  onChange={(e) => setCurrentFeeStructureId(e.target.value)}
                  disabled={!formData.ClassId}
                >
                  <option value="">
                    {!formData.ClassId
                      ? "-- Select Class First to View Fee Structures --"
                      : feeStructures.length === 0
                        ? "-- No Fee Structures Found for this Class --"
                        : "-- Select Fee Structure to Add --"}
                  </option>
                  {feeStructures.map((item) => {
                    const isSubmitted = submittedFeeStructures.find(
                      (s) => String(s.feeStructureId) === String(item.id),
                    );
                    const isAdded = selectedFeeStructures.some(
                      (s) => String(s.id) === String(item.id),
                    );
                    const isDisabled = Boolean(isSubmitted || isAdded);

                    return (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={isDisabled}
                      >
                        {item.text}
                        {isSubmitted
                          ? ` (Already Submitted - ${isSubmitted.status}${
                              isSubmitted.balanceAmount > 0
                                ? `: Pending ₹${isSubmitted.balanceAmount.toFixed(2)}`
                                : ""
                            })`
                          : isAdded
                            ? " (Already Added to List)"
                            : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                className="fee-picker-add-btn"
                onClick={handleAddFeeStructure}
                disabled={!currentFeeStructureId || !formData.ClassId}
              >
                + Add Fee Structure
              </button>

              {remainderFeeStructures.length > 0 && formData.StudentId && (
                <button
                  type="button"
                  className="fee-picker-add-all-btn"
                  onClick={handleAddAllRemainderFees}
                  title="Add all remaining unsubmitted fee structures for this student"
                >
                  + Add All Remainder Fees
                </button>
              )}
            </div>

            {selectedFeeStructures.length === 0 ? (
              <div className="fee-picker-empty-notice">
                <span>⚠️ No fee structures added to creation list yet.</span>{" "}
                Select an unsubmitted fee structure from the dropdown above and
                click <strong>"+ Add Fee Structure"</strong> or click{" "}
                <strong>"+ Add All Remainder Fees"</strong>.
              </div>
            ) : (
              <div className="fee-selected-table-wrapper">
                <table className="fee-selected-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Fee Structure</th>
                      <th style={{ textAlign: "right" }}>Base Amount</th>
                      <th style={{ textAlign: "right" }}>Payable Amount</th>
                      <th style={{ textAlign: "right" }}>Paid Amount</th>
                      <th style={{ textAlign: "right" }}>Remaining Amount</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center", width: "80px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocatedFeeItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td className="fee-item-name">{item.text}</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{item.baseAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: "600",
                            color: "#1e293b",
                          }}
                        >
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: "600",
                            color: "#16a34a",
                          }}
                        >
                          ₹{item.paidAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: "600",
                            color:
                              item.balanceAmount > 0 ? "#dc2626" : "#16a34a",
                          }}
                        >
                          ₹{item.balanceAmount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`fee-mini-badge status-${item.status.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="fee-item-remove-btn"
                            title="Remove this fee structure"
                            onClick={() => handleRemoveFeeStructure(item.id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="fee-table-totals-row">
                      <td colSpan="2">
                        <strong>
                          Total ({selectedFeeStructures.length} items)
                        </strong>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <strong>₹{totalBaseFee.toFixed(2)}</strong>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "#1e3a8a",
                          fontWeight: "700",
                        }}
                      >
                        ₹{totalPayable.toFixed(2)}
                        {includePreviousBalance &&
                          previousUnpaidBalance > 0 && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: "normal",
                                color: "#64748b",
                              }}
                            >
                              (incl. ₹{previousUnpaidBalance.toFixed(2)} prev)
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: "#15803d",
                          fontWeight: "700",
                        }}
                      >
                        ₹{paidVal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          color: remainingBalance > 0 ? "#b91c1c" : "#15803d",
                          fontWeight: "700",
                        }}
                      >
                        ₹{remainingBalance.toFixed(2)}
                        {isWaivedUnder20 && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "normal",
                              color: "#16a34a",
                            }}
                          >
                            (&lt; ₹20 Waived)
                          </div>
                        )}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* 3. Payment & Adjustments */}
          <div className="form-section-title">3. Payment & Adjustments</div>
          <div className="create-student-fee-grid">
            <div className="create-student-fee-field">
              <label>Discount (%)</label>
              <div className="number-stepper-wrapper">
                <button
                  type="button"
                  className="stepper-btn stepper-btn-decrement"
                  onClick={() => handleStepDiscount(-1)}
                  disabled={Number(formData.Discount) <= 0}
                  title="Decrease 1%"
                >
                  −
                </button>
                <input
                  type="number"
                  name="Discount"
                  value={formData.Discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  className="stepper-input"
                />
                <button
                  type="button"
                  className="stepper-btn stepper-btn-increment"
                  onClick={() => handleStepDiscount(1)}
                  disabled={Number(formData.Discount) >= 100}
                  title="Increase 1%"
                >
                  +
                </button>
              </div>
              <small className="field-hint">
                {discountPercent}% = ₹{discountVal.toFixed(2)} discount off base
                fee
              </small>
            </div>

            <div className="create-student-fee-field">
              <label>Fine / Late Fee (₹)</label>
              <div className="number-stepper-wrapper">
                <button
                  type="button"
                  className="stepper-btn stepper-btn-decrement"
                  onClick={() => handleStepFine(-1)}
                  disabled={Number(formData.Fine) <= 0}
                  title="Decrease ₹1"
                >
                  −
                </button>
                <input
                  type="number"
                  name="Fine"
                  value={formData.Fine}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="0"
                  className="stepper-input"
                />
                <button
                  type="button"
                  className="stepper-btn stepper-btn-increment"
                  onClick={() => handleStepFine(1)}
                  title="Increase ₹1"
                >
                  +
                </button>
              </div>
              <small className="field-hint">
                Late fee added to total payable fee
              </small>
            </div>

            <div className="create-student-fee-field">
              <label>Paid Amount (₹)</label>
              <input
                type="number"
                name="PaidAmount"
                value={formData.PaidAmount}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
              />
              <small className="field-hint">Amount paid by student now</small>
            </div>

            <div className="create-student-fee-field">
              <label>Due Date *</label>
              <input
                type="date"
                name="DueDate"
                value={formData.DueDate}
                onChange={handleChange}
                required
              />
              <small className="field-hint">Final date for payment</small>
            </div>
          </div>

          {/* 4. Live Dynamic Calculation Summary Dashboard */}
          <div className="fee-calc-summary-section">
            <div className="calc-summary-header">
              <span>Payment Calculation Summary</span>
              <span className="calc-summary-hint">
                Calculated dynamically from selected fees & inputs
              </span>
            </div>

            <div className="calc-cards-grid">
              <div className="calc-card card-base">
                <span className="calc-card-label">Total Base Fee</span>
                <span className="calc-card-value">
                  ₹{totalBaseFee.toFixed(2)}
                </span>
                <span className="calc-card-sub">
                  {selectedFeeStructures.length} Structure(s)
                </span>
              </div>

              <div className="calc-card card-pichla">
                <span className="calc-card-label">Pichla Bakaya</span>
                <span className="calc-card-value">
                  ₹{previousUnpaidBalance.toFixed(2)}
                </span>
                <span className="calc-card-sub">
                  {includePreviousBalance
                    ? "✓ Included in Payment"
                    : "Excluded"}
                </span>
              </div>

              <div className="calc-card card-payable">
                <span className="calc-card-label">Total Payable</span>
                <span className="calc-card-value">
                  ₹{totalPayable.toFixed(2)}
                </span>
                <span className="calc-card-sub">
                  {includePreviousBalance
                    ? "Base - Disc + Fine + Prev"
                    : "Base - Discount + Fine"}
                </span>
              </div>

              <div className="calc-card card-paid">
                <span className="calc-card-label">Paid Amount</span>
                <span className="calc-card-value">₹{paidVal.toFixed(2)}</span>
                <span className="calc-card-sub">Entered by admin</span>
              </div>

              <div
                className={`calc-card card-current-bal ${
                  currentRemainingBalance > 0 ? "has-balance" : "zero-balance"
                }`}
              >
                <span className="calc-card-label">Current Bakaya</span>
                <span className="calc-card-value">
                  ₹{currentRemainingBalance.toFixed(2)}
                </span>
                <span className="calc-card-sub">
                  Current selection remaining
                </span>
              </div>

              <div
                className={`calc-card card-kul-bakaya ${
                  totalCombinedRemainingBalance > 0
                    ? "has-balance"
                    : "zero-balance"
                }`}
              >
                <span className="calc-card-label">Kul Bakaya</span>
                <span className="calc-card-value">
                  ₹{totalCombinedRemainingBalance.toFixed(2)}
                </span>
                <span className="calc-card-sub">Pichla + Current Bakaya</span>
              </div>

              <div className="calc-card card-status">
                <span className="calc-card-label">Payment Status</span>
                <span
                  className={`calc-status-pill pill-${paymentStatus.toLowerCase()}`}
                >
                  {paymentStatus}
                </span>
                <span className="calc-card-sub">
                  {isWaivedUnder20
                    ? "< ₹20 Waived to 0.00"
                    : paymentStatus === "Paid"
                      ? "Full payment cleared"
                      : paymentStatus === "Partial"
                        ? "Partial payment received"
                        : "No payment received"}
                </span>
              </div>
            </div>

            {/* Under ₹20 Waiver Rule Informational Alert */}
            {isWaivedUnder20 && (
              <div className="calc-waiver-notice">
                <span className="waiver-icon">✨</span>
                <div>
                  <strong>&lt; ₹20 Waiver Rule Applied:</strong> Remaining
                  balance of ₹{rawRemainingBalance.toFixed(2)} (under ₹20) was
                  automatically waived to ₹0.00 and status recorded as{" "}
                  <strong>Paid</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="create-student-fee-actions">
            <button
              type="submit"
              className="create-student-fee-submit"
              disabled={loading || selectedFeeStructures.length === 0}
            >
              {loading
                ? "Saving Records..."
                : `Assign Fee (${selectedFeeStructures.length} Structure${
                    selectedFeeStructures.length === 1 ? "" : "s"
                  })`}
            </button>

            <button
              type="button"
              className="create-student-fee-reset"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="button"
              className="create-student-fee-print-btn"
              onClick={handlePrintCurrentFeeSlip}
              disabled={selectedFeeStructures.length === 0 && !formData.StudentId}
              title="Print current fee transaction summary & breakdown slip"
            >
              🖨️ Print Fee Slip
            </button>

            {/* Quick Live Summary Display showing total fee student submitted now with paid and remain amount */}
            {formData.StudentId && (selectedFeeStructures.length > 0 || includePreviousBalance) && (
              <div className="actions-live-fee-summary">
                <span className="summary-pill total" title="Total Payable Amount">
                  Total: <strong>₹{totalPayable.toFixed(2)}</strong>
                </span>
                <span className="summary-pill paid" title="Paid Amount Entered">
                  Paid Now: <strong>₹{paidVal.toFixed(2)}</strong>
                </span>
                <span
                  className={`summary-pill balance ${
                    remainingBalance > 0 ? "due" : "clear"
                  }`}
                  title="Remaining Amount to be paid"
                >
                  Remain: <strong>₹{remainingBalance.toFixed(2)}</strong>
                </span>
              </div>
            )}
          </div>
        </form>
      </div>

      <FeePopupModal
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default CreateStudentFee;
