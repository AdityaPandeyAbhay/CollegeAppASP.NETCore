// =====================================================
// OFFICIAL STUDENT MARKSHEET & REPORT CARD PDF GENERATOR
// Modes:
// 1. Regular Exams (Unit Test 1, Unit Test 2, etc.): Max & Obtain marks only (with Photo)
// 2. Half Yearly Exam: UT-1 (20), UT-2 (20), AVG (10), HY Exam (40), Total (50) (with Photo)
// 3. Annual Exam: 12 columns, Student Photo with clear 8mm separation, Attendance left blank for Attendance module, and User Remarks
// =====================================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  SCHOOL_LOGO_DATA_URL,
  SCHOOL_EMBLEM_DATA_URL,
  SCHOOL_WATERMARK_DATA_URL,
} from "./schoolLogoData.js";

/**
 * Detect Exam Mode based on Exam Name
 * @param {string} examName
 * @returns {"annual" | "halfYearly" | "regular"}
 */
export const detectExamMode = (examName = "") => {
  const lower = (examName || "").toLowerCase().trim();
  if (
    lower.includes("annual") ||
    lower.includes("anual") ||
    lower.includes("final") ||
    lower.includes("session end") ||
    lower.includes("session-ending") ||
    lower.includes("session-end") ||
    lower.includes("term 2") ||
    lower.includes("term-2") ||
    lower.includes("2nd term")
  ) {
    return "annual";
  }
  if (
    lower.includes("half") ||
    lower.includes("mid term") ||
    lower.includes("mid-term") ||
    lower.includes("midterm") ||
    lower.includes("term 1") ||
    lower.includes("term-1") ||
    lower.includes("1st term") ||
    lower.includes("sem 1") ||
    lower.includes("semester 1")
  ) {
    return "halfYearly";
  }
  return "regular";
};

/**
 * Formats a Date object to DD-MMM-YYYY or DD/MM/YYYY
 */
export const formatMarksheetDate = (date = new Date(), format = "DD-MMM-YYYY") => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toLocaleDateString();
    const day = String(d.getDate()).padStart(2, "0");
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    if (format === "DD/MM/YYYY") {
      const monthNum = String(monthIndex + 1).padStart(2, "0");
      return `${day}/${monthNum}/${year}`;
    }

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${day}-${months[monthIndex]}-${year}`;
  } catch {
    return "08-Sep-2026";
  }
};

/**
 * Convert Image URL to base64 Data URL for jsPDF embedding
 */
export const convertImageToDataUrl = async (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  if (trimmed.startsWith("data:image")) return trimmed;

  const fullUrl =
    trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:")
      ? trimmed
      : `/${trimmed.startsWith("/") ? trimmed.slice(1) : trimmed}`;

  if (typeof window === "undefined" || typeof Image === "undefined") return null;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 100;
          canvas.height = img.naturalHeight || img.height || 100;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUri = canvas.toDataURL("image/jpeg", 0.9);
          resolve(dataUri);
        } catch (e) {
          console.warn("Canvas conversion failed for photo, fallback to placeholder:", e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = fullUrl;
      setTimeout(() => resolve(null), 2500);
    } catch {
      resolve(null);
    }
  });
};

/**
 * Generate Certificate Number
 */
export const generateCertificateNumber = (student, meta = {}) => {
  const yearStr = (meta?.academicYearName || new Date().getFullYear().toString())
    .replace(/[^0-9]/g, "")
    .slice(-4);
  const admNo = (
    student?.admissionNumber ||
    student?.AdmissionNumber ||
    student?.rollNumber ||
    student?.RollNumber ||
    student?.id ||
    student?.Id ||
    "001"
  )
    .toString()
    .replace(/[^a-zA-Z0-9]/g, "")
    .padStart(4, "0");

  return `CERT-${yearStr}-${admNo}`;
};

/**
 * Generate Result Number
 */
export const generateResultNumber = (student, meta = {}) => {
  const batchId = meta.batchId || meta.selectedBatchId || "0";
  const sId = student?.id || student?.Id || "0";
  const examId = meta.examId || meta.selectedExamId || "0";

  return `RES-B${batchId}-S${sId}-E${examId}`;
};

/**
 * Reusable helper to render student photo in any marksheet
 */
export const renderStudentPhoto = (doc, photo, photoX, photoY, photoW, photoH, borderColor = [0, 0, 0]) => {
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.rect(photoX, photoY, photoW, photoH);

  let imageDrawn = false;
  if (photo && typeof photo === "string") {
    try {
      if (photo.startsWith("data:image")) {
        const format = photo.includes("png") ? "PNG" : "JPEG";
        doc.addImage(photo, format, photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
        imageDrawn = true;
      } else if (photo.startsWith("http://") || photo.startsWith("https://") || photo.startsWith("blob:")) {
        doc.addImage(photo, "JPEG", photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
        imageDrawn = true;
      }
    } catch (e) {
      console.warn("Could not draw student photo image in PDF:", e);
    }
  }

  if (!imageDrawn) {
    doc.setFillColor(241, 245, 249);
    doc.rect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1, "F");

    // Camera / Person Silhouette Icon in center
    const centerX = photoX + photoW / 2;
    const centerY = photoY + photoH / 2 - 2;

    doc.setFillColor(203, 213, 225);
    // Head circle
    doc.circle(centerX, centerY - 2.5, 3.5, "F");
    // Body curve / arc
    doc.roundedRect(centerX - 6, centerY + 2, 12, 6, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("PHOTO", centerX, photoY + photoH - 3, { align: "center" });
  }
};

/**
 * Reusable helper to render faint School Logo Watermark in background of marksheet
 */
export const renderMarksheetWatermark = (doc, pageWidth, pageHeight) => {
  try {
    const wmW = 95;
    const wmH = 110;
    const wmX = (pageWidth - wmW) / 2;
    const wmY = (pageHeight - wmH) / 2 + 15;
    doc.addImage(SCHOOL_WATERMARK_DATA_URL, "PNG", wmX, wmY, wmW, wmH);
  } catch (e) {
    console.warn("Could not draw marksheet watermark:", e);
  }
};

// =====================================================
// MODE 1: REGULAR EXAMS (MAX & OBTAIN MARKS ONLY) WITH PHOTO
// =====================================================
const generateRegularExamPdf = (doc, { student, subjects, marks, totals, meta, colors, identifiers }) => {
  const { pageWidth, pageHeight, margin, contentWidth } = identifiers;
  const { primaryNavy, secondaryBlue, darkSlate, mutedText, lightBg, cardBorder, goldAccent } = colors;

  const certificateNo = identifiers.certificateNo;
  const resultNo = identifiers.resultNo;
  const issueDate = formatMarksheetDate(undefined, "DD-MMM-YYYY");

  const studentFullName = identifiers.studentFullName;
  const fatherName = identifiers.fatherName;
  const motherName = identifiers.motherName;
  const rollNumber = identifiers.rollNumber;
  const admissionNumber = identifiers.admissionNumber;
  const departmentName = identifiers.departmentName;
  const classAndSection = identifiers.classAndSection;
  const academicYear = identifiers.academicYear;
  const examName = identifiers.examName;

  // 1. Page Border & Accents
  doc.setDrawColor(...primaryNavy);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.rect(margin + 1.8, margin + 1.8, contentWidth - 3.6, pageHeight - margin * 2 - 3.6);

  // 1.1 Background Watermark
  renderMarksheetWatermark(doc, pageWidth, pageHeight);

  // 2. Top Header Row: Certificate No (Left) & Result No (Right)
  let currentY = margin + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Certificate No. : ${certificateNo}`, margin + 4, currentY);
  doc.text(`Result No. : ${resultNo}`, pageWidth - margin - 4, currentY, { align: "right" });

  currentY += 3.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, currentY, pageWidth - margin - 4, currentY);

  // 3. School Header with Logo on Left Side
  const logoW = 17;
  const logoH = 20;
  const logoX = margin + 6;
  const logoY = currentY + 1.5;
  try {
    doc.addImage(SCHOOL_EMBLEM_DATA_URL, "PNG", logoX, logoY, logoW, logoH);
  } catch (e) {
    console.warn("Could not draw school header logo:", e);
  }

  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryNavy);
  doc.text("APNA SCHOOL PUBLIC SCHOOL", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 4.8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...mutedText);
  doc.text("AFFILIATED TO CENTRAL & STATE BOARD OF SECONDARY EDUCATION", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 5;
  const bannerWidth = 140;
  const bannerHeight = 7.5;
  const bannerX = (pageWidth - bannerWidth) / 2;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...secondaryBlue);
  doc.setLineWidth(0.5);
  doc.roundedRect(bannerX, currentY, bannerWidth, bannerHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text(`STATEMENT OF MARKS - ${examName}`, pageWidth / 2, currentY + 5.2, { align: "center" });

  currentY += bannerHeight + 4;

  // 4. Candidate Details Box with Student Photo on Right
  const detailsBoxHeight = 36;
  const detailsBoxWidth = contentWidth - 8;
  const detailsBoxX = margin + 4;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(detailsBoxX, currentY, detailsBoxWidth, detailsBoxHeight, 2, 2, "FD");

  doc.setFillColor(234, 240, 246);
  doc.rect(detailsBoxX, currentY, detailsBoxWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryNavy);
  doc.text("STUDENT CANDIDATE PARTICULARS", detailsBoxX + 4, currentY + 4.2);

  // Student Photo Frame on Right
  const photoW = 23;
  const photoH = 27;
  const photoX = detailsBoxX + detailsBoxWidth - photoW - 3;
  const photoY = currentY + 7;
  const studentPhoto = student.photo || student.Photo || student.photoUrl || student.PhotoUrl || null;
  renderStudentPhoto(doc, studentPhoto, photoX, photoY, photoW, photoH, cardBorder);

  // 2 Columns of Details
  const col1LabelX = detailsBoxX + 4;
  const col1ValueX = detailsBoxX + 28;
  const col2LabelX = detailsBoxX + 80;
  const col2ValueX = detailsBoxX + 106;
  const rowStartY = currentY + 11;
  const rowSpacing = 5.4;

  // Rows
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(...mutedText);
  doc.text("Student Name:", col1LabelX, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(studentFullName, col1ValueX, rowStartY);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Roll Number:", col2LabelX, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(rollNumber), col2ValueX, rowStartY);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Father's Name:", col1LabelX, rowStartY + rowSpacing);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(fatherName, col1ValueX, rowStartY + rowSpacing);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Mother's Name:", col2LabelX, rowStartY + rowSpacing);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(motherName, col2ValueX, rowStartY + rowSpacing);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Department:", col1LabelX, rowStartY + rowSpacing * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(departmentName, col1ValueX, rowStartY + rowSpacing * 2);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Class & Sec:", col2LabelX, rowStartY + rowSpacing * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(classAndSection, col2ValueX, rowStartY + rowSpacing * 2);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Academic Year:", col1LabelX, rowStartY + rowSpacing * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(academicYear, col1ValueX, rowStartY + rowSpacing * 3);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Adm. Number:", col2LabelX, rowStartY + rowSpacing * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(admissionNumber), col2ValueX, rowStartY + rowSpacing * 3);

  currentY += detailsBoxHeight + 4;

  // 5. Date of Issue Bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(detailsBoxX, currentY, detailsBoxWidth, 6, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...primaryNavy);
  doc.text(`DATE OF ISSUE : ${issueDate}`, detailsBoxX + 4, currentY + 4.2);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text(`EXAMINATION : ${examName}`, detailsBoxX + detailsBoxWidth - 4, currentY + 4.2, { align: "right" });

  currentY += 8;

  // 6. Regular Subject Evaluation Table (Max Mark & Obtain Mark Only)
  const tableRows = subjects.map((sub, idx) => {
    const subId = sub.id || sub.Id;
    const subName = (sub.text || sub.Text || sub.name || sub.Name || sub.subjectName || `Subject ${subId}`).toUpperCase();
    const m = marks[subId] || {};

    const max = Number(sub.maxMarks || m.maxMarks || 100);
    const obt = Number(sub.obtainedMarks ?? m.obtainedMarks ?? 0);
    const grade = sub.grade || m.grade || (obt / max >= 0.33 ? "B" : "D");
    const remarks = sub.remarks || m.remarks || "—";

    return [idx + 1, subName, max, obt, grade, remarks];
  });

  const totMax = Number(totals.totalMax || 100);
  const totObt = Number(totals.totalObtained || 0);
  const overallGrade = totals.overallGrade || totals.grade || (totObt / totMax >= 0.33 ? "B" : "D");

  autoTable(doc, {
    startY: currentY,
    margin: { left: detailsBoxX, right: detailsBoxX },
    head: [["S.N.", "SUBJECT NAME", "MAX MARKS", "OBTAINED MARKS", "GRADE", "REMARKS"]],
    body: tableRows,
    foot: [["", "TOTAL SUMMARY", totMax, totObt, overallGrade, ""]],
    theme: "grid",
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 2.2,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { halign: "left", fontStyle: "bold" },
      2: { cellWidth: 28, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 32, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 32, halign: "center" },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: primaryNavy,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // 7. Overall Result Summary Bar
  const tableFinalY = doc.lastAutoTable?.finalY || currentY + 50;
  const summaryY = tableFinalY + 5;
  const summaryHeight = 14;

  const isPassed = (totals.resultStatus || "").toUpperCase().includes("PASS") || (totObt / totMax >= 0.33);
  const statusBg = isPassed ? [240, 253, 244] : [254, 242, 242];
  const statusBorder = isPassed ? [187, 247, 208] : [254, 202, 202];
  const statusTextColor = isPassed ? [22, 101, 52] : [153, 27, 27];

  doc.setFillColor(...statusBg);
  doc.setDrawColor(...statusBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(detailsBoxX, summaryY, detailsBoxWidth, summaryHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...darkSlate);
  doc.text(`Total Marks: ${totObt} / ${totMax}`, detailsBoxX + 6, summaryY + 5.5);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text(`Percentage: ${totals.percentage || "0.00"}%  |  Overall Grade: ${overallGrade}`, detailsBoxX + 6, summaryY + 10);

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...statusTextColor);
  doc.text(isPassed ? "[ RESULT: PASSED ]" : "[ RESULT: FAILED ]", detailsBoxX + detailsBoxWidth - 6, summaryY + 8, { align: "right" });

  // 8. Dual Signatures
  renderSignatures(doc, pageHeight, margin, pageWidth, primaryNavy, darkSlate, mutedText, goldAccent);
};

// =====================================================
// MODE 2: HALF YEARLY EXAM (UT1 + UT2 AVG + HY EXAM) WITH PHOTO
// =====================================================
const generateHalfYearlyExamPdf = (doc, { student, subjects, marks, totals, meta, colors, identifiers }) => {
  const { pageWidth, pageHeight, margin, contentWidth } = identifiers;
  const { primaryNavy, secondaryBlue, darkSlate, mutedText, lightBg, cardBorder, goldAccent } = colors;

  const certificateNo = identifiers.certificateNo;
  const resultNo = identifiers.resultNo;
  const issueDate = formatMarksheetDate(undefined, "DD-MMM-YYYY");

  const studentFullName = identifiers.studentFullName;
  const fatherName = identifiers.fatherName;
  const motherName = identifiers.motherName;
  const rollNumber = identifiers.rollNumber;
  const admissionNumber = identifiers.admissionNumber;
  const departmentName = identifiers.departmentName;
  const classAndSection = identifiers.classAndSection;
  const academicYear = identifiers.academicYear;

  // 1. Page Border
  doc.setDrawColor(...primaryNavy); doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  doc.setDrawColor(...cardBorder); doc.setLineWidth(0.4);
  doc.rect(margin + 1.8, margin + 1.8, contentWidth - 3.6, pageHeight - margin * 2 - 3.6);

  // 1.1 Background Watermark
  renderMarksheetWatermark(doc, pageWidth, pageHeight);

  // 2. Header Row
  let currentY = margin + 7;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...darkSlate);
  doc.text(`Certificate No. : ${certificateNo}`, margin + 4, currentY);
  doc.text(`Result No. : ${resultNo}`, pageWidth - margin - 4, currentY, { align: "right" });

  currentY += 3.5;
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
  doc.line(margin + 4, currentY, pageWidth - margin - 4, currentY);

  // 3. School Header with Logo on Left Side
  const logoW = 17;
  const logoH = 20;
  const logoX = margin + 6;
  const logoY = currentY + 1.5;
  try {
    doc.addImage(SCHOOL_EMBLEM_DATA_URL, "PNG", logoX, logoY, logoW, logoH);
  } catch (e) {
    console.warn("Could not draw school header logo:", e);
  }

  currentY += 7;
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...primaryNavy);
  doc.text("APNA SCHOOL PUBLIC SCHOOL", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 4.8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(...mutedText);
  doc.text("AFFILIATED TO CENTRAL & STATE BOARD OF SECONDARY EDUCATION", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 5;
  const bannerWidth = 145;
  const bannerHeight = 7.5;
  const bannerX = (pageWidth - bannerWidth) / 2;
  doc.setFillColor(241, 245, 249); doc.setDrawColor(...secondaryBlue); doc.setLineWidth(0.5);
  doc.roundedRect(bannerX, currentY, bannerWidth, bannerHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...primaryNavy);
  doc.text("HALF YEARLY EXAMINATION - STATEMENT OF MARKS", pageWidth / 2, currentY + 5.2, { align: "center" });

  currentY += bannerHeight + 4;

  // 4. Candidate Details with Photo on Right
  const detailsBoxHeight = 36;
  const detailsBoxWidth = contentWidth - 8;
  const detailsBoxX = margin + 4;

  doc.setFillColor(...lightBg); doc.setDrawColor(...cardBorder); doc.setLineWidth(0.4);
  doc.roundedRect(detailsBoxX, currentY, detailsBoxWidth, detailsBoxHeight, 2, 2, "FD");

  doc.setFillColor(234, 240, 246); doc.rect(detailsBoxX, currentY, detailsBoxWidth, 6, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...primaryNavy);
  doc.text("STUDENT CANDIDATE PARTICULARS", detailsBoxX + 4, currentY + 4.2);

  // Photo Frame on Right
  const photoW = 23;
  const photoH = 27;
  const photoX = detailsBoxX + detailsBoxWidth - photoW - 3;
  const photoY = currentY + 7;
  const studentPhoto = student.photo || student.Photo || student.photoUrl || student.PhotoUrl || null;
  renderStudentPhoto(doc, studentPhoto, photoX, photoY, photoW, photoH, cardBorder);

  // 2 Columns of Details
  const col1LabelX = detailsBoxX + 4; const col1ValueX = detailsBoxX + 28;
  const col2LabelX = detailsBoxX + 80; const col2ValueX = detailsBoxX + 106;
  const rowStartY = currentY + 11; const rowSpacing = 5.4;

  // Rows
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(...mutedText);
  doc.text("Student Name:", col1LabelX, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(studentFullName, col1ValueX, rowStartY);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Roll Number:", col2LabelX, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(rollNumber), col2ValueX, rowStartY);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Father's Name:", col1LabelX, rowStartY + rowSpacing);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(fatherName, col1ValueX, rowStartY + rowSpacing);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Mother's Name:", col2LabelX, rowStartY + rowSpacing);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(motherName, col2ValueX, rowStartY + rowSpacing);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Department:", col1LabelX, rowStartY + rowSpacing * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(departmentName, col1ValueX, rowStartY + rowSpacing * 2);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Class & Sec:", col2LabelX, rowStartY + rowSpacing * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(classAndSection, col2ValueX, rowStartY + rowSpacing * 2);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Academic Year:", col1LabelX, rowStartY + rowSpacing * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(academicYear, col1ValueX, rowStartY + rowSpacing * 3);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Adm. Number:", col2LabelX, rowStartY + rowSpacing * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(admissionNumber), col2ValueX, rowStartY + rowSpacing * 3);

  currentY += detailsBoxHeight + 4;

  // 5. Date of Issue Bar
  doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
  doc.rect(detailsBoxX, currentY, detailsBoxWidth, 6, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...primaryNavy);
  doc.text(`DATE OF ISSUE : ${issueDate}`, detailsBoxX + 4, currentY + 4.2);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text("EXAMINATION : HALF YEARLY EVALUATION", detailsBoxX + detailsBoxWidth - 4, currentY + 4.2, { align: "right" });

  currentY += 8;

  // 6. Half Yearly 7-Column Evaluation Table
  let grandTotalMax = 0;
  let grandTotalObt = 0;

  const tableRows = subjects.map((sub, idx) => {
    const subId = sub.id || sub.Id;
    const subName = (sub.text || sub.Text || sub.name || sub.Name || sub.subjectName || `Subject ${subId}`).toUpperCase();
    const m = marks[subId] || {};

    const ut1 = Number(m.ut1 ?? 0);
    const ut2 = Number(m.ut2 ?? 0);
    const avg = Number(m.avg1 ?? Math.round(((ut1 + ut2) / 4) * 10) / 10);
    const hy = Number(m.hyExam ?? m.obtainedMarks ?? 0);
    const total = Number(m.totalHY ?? Math.round((avg + hy) * 10) / 10);
    const grade = m.grade || (total >= 16.5 ? "B" : "D");
    const remarks = m.remarks || "—";

    grandTotalMax += 50;
    grandTotalObt += total;

    return [idx + 1, subName, ut1, ut2, avg, hy, total, grade, remarks];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: detailsBoxX, right: detailsBoxX },
    head: [
      [
        { content: "S.N.", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: "SUBJECT NAME", rowSpan: 2, styles: { valign: "middle", halign: "left" } },
        { content: "UNIT TEST 1\n(Max 20)", styles: { halign: "center" } },
        { content: "UNIT TEST 2\n(Max 20)", styles: { halign: "center" } },
        { content: "AVERAGE\n(Max 10)", styles: { halign: "center" } },
        { content: "HALF YEARLY\n(Max 40)", styles: { halign: "center" } },
        { content: "TOTAL HY\n(Max 50)", styles: { halign: "center" } },
        { content: "GRADE", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: "REMARKS", rowSpan: 2, styles: { valign: "middle", halign: "center" } },
      ],
      [
        { content: "Obt (20)", styles: { halign: "center" } },
        { content: "Obt (20)", styles: { halign: "center" } },
        { content: "", styles: { halign: "center" } },
        { content: "Obt (40)", styles: { halign: "center" } },
        { content: "Avg + HY", styles: { halign: "center" } },
      ],
    ],
    body: tableRows,
    foot: [
      ["", "TOTAL / OVERALL SUMMARY", "", "", "", "", grandTotalObt, totals.overallGrade || "B", ""],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { halign: "left", fontStyle: "bold" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 22, halign: "center" },
      6: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 24, halign: "center" },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: primaryNavy,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // 7. Result Summary Bar
  const tableFinalY = doc.lastAutoTable?.finalY || currentY + 50;
  const summaryY = tableFinalY + 5;
  const summaryHeight = 14;

  const isPassed = (totals.resultStatus || "").toUpperCase().includes("PASS") || (grandTotalObt / grandTotalMax >= 0.33);
  const statusBg = isPassed ? [240, 253, 244] : [254, 242, 242];
  const statusBorder = isPassed ? [187, 247, 208] : [254, 202, 202];
  const statusTextColor = isPassed ? [22, 101, 52] : [153, 27, 27];

  doc.setFillColor(...statusBg); doc.setDrawColor(...statusBorder); doc.setLineWidth(0.4);
  doc.roundedRect(detailsBoxX, summaryY, detailsBoxWidth, summaryHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...darkSlate);
  doc.text(`Total Marks: ${grandTotalObt} / ${grandTotalMax}`, detailsBoxX + 6, summaryY + 5.5);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text(`Percentage: ${totals.percentage || "0.00"}%  |  Overall Grade: ${totals.overallGrade || "—"}`, detailsBoxX + 6, summaryY + 10);

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...statusTextColor);
  doc.text(isPassed ? "[ RESULT: PASSED ]" : "[ RESULT: FAILED ]", detailsBoxX + detailsBoxWidth - 6, summaryY + 8, { align: "right" });

  // 8. Signatures
  renderSignatures(doc, pageHeight, margin, pageWidth, primaryNavy, darkSlate, mutedText, goldAccent);
};

// =====================================================
// MODE 3: ANNUAL EXAM (WITH STUDENT PHOTO, 8MM BUFFER, EMPTY ATTENDANCE & USER REMARKS)
// =====================================================
const generateAnnualExamPdf = (doc, { student, subjects, marks, totals, meta, colors, identifiers, annualMeta = {} }) => {
  const { pageWidth, pageHeight, margin, contentWidth } = identifiers;

  const studentFullName = identifiers.studentFullName;
  const fatherName = identifiers.fatherName;
  const motherName = identifiers.motherName;
  const rollNumber = identifiers.rollNumber;
  const admissionNumber = identifiers.admissionNumber;
  const classAndSection = identifiers.classAndSection;
  const academicYear = identifiers.academicYear;
  const dob = student.dob || student.DOB || student.DateOfBirth || "09-Mar-2019";
  const scholarNo = student.scholarNo || student.ScholarNo || student.code || student.Code || `ES${admissionNumber}`;

  // Outer Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  // 1.1 Background Watermark
  renderMarksheetWatermark(doc, pageWidth, pageHeight);

  // 1.2 School Header with Logo on Left Side
  const logoW = 17;
  const logoH = 20;
  const logoX = margin + 6;
  const logoY = margin + 5;
  try {
    doc.addImage(SCHOOL_EMBLEM_DATA_URL, "PNG", logoX, logoY, logoW, logoH);
  } catch (e) {
    console.warn("Could not draw school header logo:", e);
  }

  let currentY = margin + 8;

  // Title Header: School Name, Academic Performance & Session
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("APNA SCHOOL PUBLIC SCHOOL", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 5.2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text("Academic Performance (Annual Report)", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 4.8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`Session : ${academicYear}`, (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 6;

  // 2. Student Details Layout (2 Columns + Photo Box on right)
  const infoStartY = currentY;
  const col1X = margin + 4;
  const col1ValX = margin + 34;
  const col2X = margin + 82;
  const col2ValX = margin + 112;
  const lineH = 5.2;

  // Left Column
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(0, 0, 0);
  doc.text("ROLL NO.", col1X, infoStartY);
  doc.text(`:  ${rollNumber}`, col1ValX, infoStartY);

  doc.text("STUDENT NAME", col1X, infoStartY + lineH);
  doc.text(`:  ${studentFullName}`, col1ValX, infoStartY + lineH);

  doc.text("FATHER'S NAME", col1X, infoStartY + lineH * 2);
  doc.text(`:  ${fatherName}`, col1ValX, infoStartY + lineH * 2);

  doc.text("MOTHER'S NAME", col1X, infoStartY + lineH * 3);
  doc.text(`:  ${motherName}`, col1ValX, infoStartY + lineH * 3);

  // Middle Column
  doc.text("CLASS", col2X, infoStartY);
  doc.text(`:  ${classAndSection}`, col2ValX, infoStartY);

  doc.text("ADM. NO.", col2X, infoStartY + lineH);
  doc.text(`:  ${admissionNumber}`, col2ValX, infoStartY + lineH);

  doc.text("D. O. B.", col2X, infoStartY + lineH * 2);
  doc.text(`:  ${dob}`, col2ValX, infoStartY + lineH * 2);

  doc.text("SCHOLAR NO.", col2X, infoStartY + lineH * 3);
  doc.text(`:  ${scholarNo}`, col2ValX, infoStartY + lineH * 3);

  // Photo Frame on Right
  const photoW = 24;
  const photoH = 28;
  const photoX = pageWidth - margin - 4 - photoW;
  const photoY = infoStartY - 1;
  const studentPhoto = student.photo || student.Photo || student.photoUrl || student.PhotoUrl || null;
  renderStudentPhoto(doc, studentPhoto, photoX, photoY, photoW, photoH, [0, 0, 0]);

  // CRITICAL FIX: Ensure currentY for 12-column table starts with a generous 8mm gap BELOW the photo frame
  const photoBottom = photoY + photoH;
  currentY = photoBottom + 8;

  // 3. 12-Column Academic Evaluation Table
  let hyGrandObt = 0;
  let hyGrandMax = 0;
  let annGrandObt = 0;
  let annGrandMax = 0;
  let totalGrandObt = 0;
  let totalGrandMax = 0;

  const tableBody = subjects.map((sub) => {
    const subId = sub.id || sub.Id;
    const subName = (sub.text || sub.Text || sub.name || sub.Name || sub.subjectName || `Subject ${subId}`).trim().toUpperCase();
    const m = marks[subId] || {};

    const isGradeOnly = subName.includes("DRAWING") || subName.includes("HANDWORK") || subName.includes("ART") || subName.includes("CRAFT");

    if (isGradeOnly) {
      const hyGrade = m.hyGrade || m.grade || "A";
      const annGrade = m.annGrade || m.grade || "A+";
      return [subName, "—", "—", "—", hyGrade, "—", "—", "—", "—", annGrade, "—", "—"];
    }

    // Pure user values - NO FAKE / DUMMY FALLBACKS
    const ut1Str = m.ut1 !== undefined && m.ut1 !== "" ? String(m.ut1) : "—";
    const ut2Str = m.ut2 !== undefined && m.ut2 !== "" ? String(m.ut2) : "—";

    let avg1Str = "—";
    if (m.avg1 !== undefined && m.avg1 !== "") {
      avg1Str = String(m.avg1);
    } else if (ut1Str !== "—" || ut2Str !== "—") {
      const u1 = ut1Str !== "—" ? parseFloat(ut1Str) : 0;
      const u2 = ut2Str !== "—" ? parseFloat(ut2Str) : 0;
      avg1Str = String(Math.round(((u1 + u2) / 4) * 10) / 10);
    }

    const hyStr = m.hyExam !== undefined && m.hyExam !== "" ? String(m.hyExam) : "—";

    let totHYStr = "—";
    if (m.totalHY !== undefined && m.totalHY !== "") {
      totHYStr = String(m.totalHY);
    } else if (avg1Str !== "—" || hyStr !== "—") {
      const a1 = avg1Str !== "—" ? parseFloat(avg1Str) : 0;
      const h = hyStr !== "—" ? parseFloat(hyStr) : 0;
      totHYStr = String(Math.round((a1 + h) * 10) / 10);
    }

    const ut3Str = m.ut3 !== undefined && m.ut3 !== "" ? String(m.ut3) : "—";
    const ut4Str = m.ut4 !== undefined && m.ut4 !== "" ? String(m.ut4) : "—";

    let avg2Str = "—";
    if (m.avg2 !== undefined && m.avg2 !== "") {
      avg2Str = String(m.avg2);
    } else if (ut3Str !== "—" || ut4Str !== "—") {
      const u3 = ut3Str !== "—" ? parseFloat(ut3Str) : 0;
      const u4 = ut4Str !== "—" ? parseFloat(ut4Str) : 0;
      avg2Str = String(Math.round(((u3 + u4) / 4) * 10) / 10);
    }

    const annStr = m.annExam !== undefined && m.annExam !== "" ? String(m.annExam) : "—";

    let totAnnStr = "—";
    if (m.totalAnn !== undefined && m.totalAnn !== "") {
      totAnnStr = String(m.totalAnn);
    } else if (avg2Str !== "—" || annStr !== "—") {
      const a2 = avg2Str !== "—" ? parseFloat(avg2Str) : 0;
      const an = annStr !== "—" ? parseFloat(annStr) : 0;
      totAnnStr = String(Math.round((a2 + an) * 10) / 10);
    }

    let grandStr = "—";
    if (m.grandTotal !== undefined && m.grandTotal !== "") {
      grandStr = String(m.grandTotal);
    } else if (totHYStr !== "—" || totAnnStr !== "—") {
      const th = totHYStr !== "—" ? parseFloat(totHYStr) : 0;
      const ta = totAnnStr !== "—" ? parseFloat(totAnnStr) : 0;
      grandStr = String(Math.round((th + ta) * 10) / 10);
    }

    if (totHYStr !== "—") {
      hyGrandObt += parseFloat(totHYStr);
      hyGrandMax += 50;
    }
    if (totAnnStr !== "—") {
      annGrandObt += parseFloat(totAnnStr);
      annGrandMax += 50;
    }
    if (grandStr !== "—") {
      totalGrandObt += parseFloat(grandStr);
      totalGrandMax += 100;
    }

    return [
      subName,
      ut1Str,
      ut2Str,
      avg1Str,
      hyStr,
      totHYStr,
      ut3Str,
      ut4Str,
      avg2Str,
      annStr,
      totAnnStr,
      grandStr,
    ];
  });

  const hyGrandStr = hyGrandMax > 0 ? `${hyGrandObt}/${hyGrandMax}` : "—";
  const annGrandStr = annGrandMax > 0 ? `${annGrandObt}/${annGrandMax}` : "—";
  const totalGrandStr = totalGrandMax > 0 ? `${totalGrandObt}/${totalGrandMax}` : "—";

  const tableFoot = [
    [
      "TOTAL",
      "", "", "", "",
      hyGrandStr,
      "", "", "", "",
      annGrandStr,
      totalGrandStr,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    tableWidth: "wrap",
    margin: { left: margin + 3 },
    head: [
      [
        { content: "SUBJECT", rowSpan: 2, styles: { valign: "middle", halign: "center", fontStyle: "bold" } },
        { content: "HALF YEARLY", colSpan: 5, styles: { halign: "center", fontStyle: "bold" } },
        { content: "ANNUAL EXAM", colSpan: 5, styles: { halign: "center", fontStyle: "bold" } },
        { content: "TOTAL\n(100)", rowSpan: 2, styles: { valign: "middle", halign: "center", fontStyle: "bold" } },
      ],
      [
        "U.T - I\n(20)",
        "U.T - II\n(20)",
        "AVG.\n(10)",
        "H.Y.\n(40)",
        "TOTAL\n(50)",
        "U.T - III\n(20)",
        "U.T - IV\n(20)",
        "AVG.\n(10)",
        "ANN.\n(40)",
        "TOTAL\n(50)",
      ],
    ],
    body: tableBody,
    foot: tableFoot,
    theme: "plain",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.35,
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      fontSize: 6.8,
      cellPadding: 1.4,
      valign: "middle",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 6.8,
      lineWidth: 0.35,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 30, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 10, halign: "center" },
      4: { cellWidth: 12.5, halign: "center" },
      5: { cellWidth: 13, halign: "center" },
      6: { cellWidth: 12, halign: "center" },
      7: { cellWidth: 15, halign: "center" },
      8: { cellWidth: 10, halign: "center" },
      9: { cellWidth: 12.5, halign: "center" },
      10: { cellWidth: 13, halign: "center" },
      11: { cellWidth: 14, halign: "center", fontStyle: "bold" },
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 6.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
    },
  });

  // 4. Co-Scholastic Qualities Table
  const afterTableY = doc.lastAutoTable?.finalY || currentY + 70;
  const coStartY = afterTableY + 4;

  const defaultCoScholastics = [
    {
      trait: "APPEARANCE & PERSONALITY", hy: "A", ann: "A",
      attitude: "TO PROGRAMMES", hyAtt: "A", annAtt: "B+",
      activity: "LITERARY, SCIENTIFIC & CULTURAL", hyAct: "A", annAct: "A",
    },
    {
      trait: "CLEANLINESS", hy: "A", ann: "A+",
      attitude: "TO SCHOOL PROPERTY", hyAtt: "A", annAtt: "A",
      activity: "PUNCTUALITY", hyAct: "A", annAct: "A",
    },
    {
      trait: "CO-CURRICULAR", hy: "A", ann: "A",
      attitude: "TO SCHOOLMATES", hyAtt: "A", annAtt: "A",
      activity: "REGULARITY", hyAct: "B+", annAct: "A",
    },
    {
      trait: "DISCIPLINE", hy: "A", ann: "B+",
      attitude: "TO STUDIES", hyAtt: "A+", annAtt: "A+",
      activity: "SOCIAL SERVICE", hyAct: "A", annAct: "A+",
    },
    {
      trait: "HOBBY", hy: "A", ann: "A",
      attitude: "TO TEACHERS", hyAtt: "A", annAtt: "A",
      activity: "SPORTS & GAMES", hyAct: "A", annAct: "B+",
    },
  ];

  const coList = Array.isArray(annualMeta.coScholastics) && annualMeta.coScholastics.length === 5
    ? annualMeta.coScholastics
    : defaultCoScholastics;

  const coScholasticRows = coList.map((row, idx) => {
    const d = defaultCoScholastics[idx] || {};
    return [
      row.trait || d.trait,
      row.hy !== undefined && row.hy !== "" ? row.hy : (d.hy || "—"),
      row.ann !== undefined && row.ann !== "" ? row.ann : (d.ann || "—"),
      row.attitude || d.attitude,
      row.hyAtt !== undefined && row.hyAtt !== "" ? row.hyAtt : (d.hyAtt || "—"),
      row.annAtt !== undefined && row.annAtt !== "" ? row.annAtt : (d.annAtt || "—"),
      row.activity || d.activity,
      row.hyAct !== undefined && row.hyAct !== "" ? row.hyAct : (d.hyAct || "—"),
      row.annAct !== undefined && row.annAct !== "" ? row.annAct : (d.annAct || "—"),
    ];
  });

  autoTable(doc, {
    startY: coStartY,
    tableWidth: "wrap",
    margin: { left: margin + 3 },
    head: [
      [
        { content: "PERSONAL & SOCIAL TRAITS", colSpan: 3, styles: { halign: "center", fontStyle: "bold" } },
        { content: "ATTITUDES & VALUES", colSpan: 3, styles: { halign: "center", fontStyle: "bold" } },
        { content: "ACTIVITIES", colSpan: 3, styles: { halign: "center", fontStyle: "bold" } },
      ],
      [
        "TRAITS", "HY", "ANN",
        "ATTITUDE TOWARDS", "HY", "ANN",
        "CO-CURRICULAR ACTIVITIES", "HY", "ANN",
      ],
    ],
    body: coScholasticRows,
    theme: "plain",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.3,
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      fontSize: 6,
      cellPadding: 1,
      valign: "middle",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 6.2,
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 38, halign: "left" },
      1: { cellWidth: 8.5, halign: "center" },
      2: { cellWidth: 8.5, halign: "center" },
      3: { cellWidth: 35, halign: "left" },
      4: { cellWidth: 8.5, halign: "center" },
      5: { cellWidth: 8.5, halign: "center" },
      6: { cellWidth: 42, halign: "left" },
      7: { cellWidth: 8.5, halign: "center" },
      8: { cellWidth: 8.5, halign: "center" },
    },
  });

  // 5. Attendance & Teacher Remarks (Keep attendance blank for future attendance module; print user remarks)
  const afterCoY = doc.lastAutoTable?.finalY || (currentY + 115);
  let metaY = afterCoY + 5;

  // Attendance line: "Attendance : H.Y.  —     Annual  —"
  const attHY = (annualMeta.attendanceHY || "").trim();
  const attAnn = (annualMeta.attendanceAnn || "").trim();
  const attHYDisplay = attHY ? attHY : "—";
  const attAnnDisplay = attAnn ? attAnn : "—";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Attendance :", margin + 4, metaY);

  doc.setFont("helvetica", "normal");
  doc.text("H.Y. : ", margin + 26, metaY);
  doc.setFont("helvetica", "bold");
  doc.text(attHYDisplay, margin + 35, metaY);

  doc.setFont("helvetica", "normal");
  doc.text("Annual : ", margin + 55, metaY);
  doc.setFont("helvetica", "bold");
  doc.text(attAnnDisplay, margin + 68, metaY);

  // Remarks line: "Remarks : [User entered remarks]"
  metaY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Remarks :", margin + 4, metaY);

  const remarksText = (annualMeta.remarks || "").trim() || "—";
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text(remarksText, margin + 22, metaY);

  // Underline for remarks line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.line(margin + 22, metaY + 1, pageWidth - margin - 4, metaY + 1);

  // 6. Bottom Section: Date, Result, Tri-Signatures
  const isPassed = totalGrandMax > 0 ? (totalGrandObt / totalGrandMax >= 0.33) : true;
  const userResultStatus = (annualMeta.resultStatus || "").trim() || (isPassed ? "Passed, II-D" : "Essential Repeat");
  const bottomStartY = Math.max(metaY + 8, pageHeight - margin - 22);

  // Date on Left
  const issueDateFormatted = formatMarksheetDate(undefined, "DD/MM/YYYY");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Date :", margin + 4, bottomStartY);
  doc.setFont("helvetica", "normal");
  doc.text(issueDateFormatted, margin + 15, bottomStartY);

  // Result in Center
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Result : ", pageWidth / 2 - 20, bottomStartY);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(10);
  doc.text(userResultStatus, pageWidth / 2 - 5, bottomStartY);
  const resultTextWidth = doc.getTextWidth(userResultStatus);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 5, bottomStartY + 0.8, pageWidth / 2 - 5 + resultTextWidth, bottomStartY + 0.8);

  // Signatures Row: CLASS TEACHER | HEADMISTRESS | PARENT/GUARDIAN
  const sigY = pageHeight - margin - 6;
  const colW = (contentWidth - 8) / 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);

  // Class Teacher
  const sig1X = margin + 4 + colW / 2;
  doc.line(sig1X - 22, sigY - 4, sig1X + 22, sigY - 4);
  doc.text("CLASS TEACHER", sig1X, sigY, { align: "center" });

  // Headmistress / Principal
  const sig2X = margin + 4 + colW + colW / 2;
  doc.line(sig2X - 22, sigY - 4, sig2X + 22, sigY - 4);
  doc.text("HEADMISTRESS", sig2X, sigY, { align: "center" });

  // Parent / Guardian
  const sig3X = margin + 4 + colW * 2 + colW / 2;
  doc.line(sig3X - 22, sigY - 4, sig3X + 22, sigY - 4);
  doc.text("PARENT/GUARDIAN", sig3X, sigY, { align: "center" });
};

// Helper to render dual signatures for regular and half-yearly
const renderSignatures = (doc, pageHeight, margin, pageWidth, primaryNavy, darkSlate, mutedText, goldAccent) => {
  const sigY = pageHeight - margin - 22;
  const leftSigX = margin + 14;
  const leftSigWidth = 48;
  doc.setDrawColor(...darkSlate); doc.setLineWidth(0.4);
  doc.line(leftSigX, sigY, leftSigX + leftSigWidth, sigY);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...primaryNavy);
  doc.text("Class Teacher Signature", leftSigX + leftSigWidth / 2, sigY + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...mutedText);
  doc.text("Class In-Charge", leftSigX + leftSigWidth / 2, sigY + 8, { align: "center" });

  // Seal
  const sealCenterX = pageWidth / 2;
  const sealCenterY = sigY - 2;
  doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.5);
  doc.circle(sealCenterX, sealCenterY, 9, "D");
  doc.circle(sealCenterX, sealCenterY, 7.5, "D");

  doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); doc.setTextColor(...primaryNavy);
  doc.text("APNA SCHOOL", sealCenterX, sealCenterY - 2.5, { align: "center" });
  doc.setFontSize(4.5); doc.setTextColor(...goldAccent);
  doc.text("★ OFFICIAL SEAL ★", sealCenterX, sealCenterY + 0.5, { align: "center" });
  doc.setFontSize(5); doc.setTextColor(...primaryNavy);
  doc.text("PUBLIC SCHOOL", sealCenterX, sealCenterY + 3.5, { align: "center" });

  // Principal
  const rightSigWidth = 48;
  const rightSigX = pageWidth - margin - 14 - rightSigWidth;
  doc.setDrawColor(...darkSlate); doc.setLineWidth(0.4);
  doc.line(rightSigX, sigY, rightSigX + rightSigWidth, sigY);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...primaryNavy);
  doc.text("Principal Signature", rightSigX + rightSigWidth / 2, sigY + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...mutedText);
  doc.text("Head of Institution", rightSigX + rightSigWidth / 2, sigY + 8, { align: "center" });

  // Disclaimer
  const footerY = pageHeight - margin - 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(148, 163, 184);
  doc.text("This is an official system-generated Marksheet issued by Apna School Public School.", pageWidth / 2, footerY, { align: "center" });
};

/**
 * Main Generator Function Supporting All 3 Modes
 */
export const generateMarksheetPdf = async ({
  student = {},
  subjects = [],
  marks = {},
  totals = {},
  meta = {},
  examMode = null,
  annualMeta = {},
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const colors = {
    primaryNavy: [26, 54, 93],
    secondaryBlue: [37, 99, 235],
    darkSlate: [30, 41, 59],
    mutedText: [100, 116, 139],
    lightBg: [248, 250, 252],
    cardBorder: [203, 213, 225],
    goldAccent: [217, 119, 6],
  };

  const certificateNo = meta.certificateNo || generateCertificateNumber(student, meta);
  const resultNo = meta.resultNo || generateResultNumber(student, meta);

  const studentFirstName = student.firstName || student.FirstName || "";
  const studentLastName = student.lastName || student.LastName || "";
  const studentFullName = (
    `${studentFirstName} ${studentLastName}`.trim() ||
    student.name ||
    student.Name ||
    "Student"
  ).toUpperCase();

  const fatherName = (student.fatherName || student.FatherName || student.Father_Name || "—").toUpperCase();
  const motherName = (student.motherName || student.MotherName || student.Mother_Name || "—").toUpperCase();
  const rollNumber =
    student.rollNumber ||
    student.RollNumber ||
    student.RollNo ||
    student.rollNo ||
    student.roll_number ||
    student.Roll_Number ||
    (student.id && !isNaN(student.id) ? String(student.id) : "—");
  const admissionNumber = student.admissionNumber || student.AdmissionNumber || student.code || student.Code || "—";

  const departmentName = (meta.departmentName || student.departmentName || student.DepartmentName || "General Studies").toUpperCase();
  const className = meta.className || student.className || student.ClassName || "Class";
  const sectionName = meta.sectionName || student.sectionName || student.SectionName || "Section";
  const classAndSection = `${className} - ${sectionName}`.toUpperCase();
  const academicYear = (meta.academicYearName || student.academicYearName || student.AcademicYearName || new Date().getFullYear().toString()).toUpperCase();
  const examName = (meta.examName || meta.selectedExamName || "Examination").toUpperCase();

  // Resolve Student Photo: If URL, convert to Base64 Data URL for jsPDF
  let resolvedPhoto =
    student.photo ||
    student.Photo ||
    student.photoUrl ||
    student.PhotoUrl ||
    student.UserPhoto ||
    null;

  if (resolvedPhoto && typeof resolvedPhoto === "string") {
    try {
      const converted = await convertImageToDataUrl(resolvedPhoto);
      if (converted) {
        resolvedPhoto = converted;
      }
    } catch (e) {
      console.warn("Could not pre-convert student photo:", e);
    }
  }

  const studentWithResolvedPhoto = {
    ...student,
    photo: resolvedPhoto,
  };

  const identifiers = {
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    certificateNo,
    resultNo,
    studentFullName,
    fatherName,
    motherName,
    rollNumber,
    admissionNumber,
    departmentName,
    className,
    sectionName,
    classAndSection,
    academicYear,
    examName,
  };

  // Determine Effective Mode
  const effectiveMode = examMode || detectExamMode(examName);

  if (effectiveMode === "annual") {
    generateAnnualExamPdf(doc, {
      student: studentWithResolvedPhoto,
      subjects,
      marks,
      totals,
      meta,
      colors,
      identifiers,
      annualMeta,
    });
  } else if (effectiveMode === "halfYearly") {
    generateHalfYearlyExamPdf(doc, {
      student: studentWithResolvedPhoto,
      subjects,
      marks,
      totals,
      meta,
      colors,
      identifiers,
    });
  } else {
    generateRegularExamPdf(doc, {
      student: studentWithResolvedPhoto,
      subjects,
      marks,
      totals,
      meta,
      colors,
      identifiers,
    });
  }

  // Create Blob & File Object for Upload and Preview
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const cleanStudentName = studentFullName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanExam = examName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Marksheet_${cleanStudentName}_${cleanExam}.pdf`;

  let pdfFile = null;
  try {
    pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
  } catch {
    pdfFile = pdfBlob;
    pdfFile.name = fileName;
  }

  return {
    doc,
    pdfBlob,
    pdfUrl,
    pdfFile,
    fileName,
    certificateNo,
    resultNo,
  };
};

export default generateMarksheetPdf;
