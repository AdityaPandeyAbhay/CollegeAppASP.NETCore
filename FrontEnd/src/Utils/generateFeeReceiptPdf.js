// =====================================================
// OFFICIAL STUDENT FEE PAYMENT RECEIPT & STATEMENT PDF GENERATOR
// Professional A4 Receipt with School Emblem, Watermark & Signatures
// =====================================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  SCHOOL_EMBLEM_DATA_URL,
  SCHOOL_WATERMARK_DATA_URL,
} from "./schoolLogoData.js";

/**
 * Format date to DD-MMM-YYYY
 */
const formatDate = (dateStr) => {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return new Date().toLocaleDateString();
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  } catch {
    return new Date().toLocaleDateString();
  }
};

/**
 * Convert number to words (Indian Currency Format)
 */
const numberToWords = (num) => {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ",
    "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const n = ("000000000" + Math.floor(Number(num) || 0))
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "Zero Rupees Only";

  let str = "";
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += Number(n[5]) !== 0
    ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
    : "";

  return (str.trim() || "Zero") + " Rupees Only";
};

/**
 * Generate Single Fee Receipt PDF
 */
export const generateFeeReceiptPdf = async ({ student, feeItem, currentYearFees }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryNavy = [15, 23, 42]; // #0f172a
  const secondaryBlue = [37, 99, 235]; // #2563eb
  const darkSlate = [30, 41, 59];
  const mutedText = [100, 116, 139];
  const cardBorder = [203, 213, 225];

  // Outer Border
  doc.setDrawColor(...primaryNavy);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  // Inner Border
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2, margin + 2, contentWidth - 4, pageHeight - margin * 2 - 4);

  // Background Watermark
  try {
    const wmW = 90;
    const wmH = 105;
    const wmX = (pageWidth - wmW) / 2;
    const wmY = (pageHeight - wmH) / 2;
    doc.addImage(SCHOOL_WATERMARK_DATA_URL, "PNG", wmX, wmY, wmW, wmH);
  } catch (e) {
    console.warn("Watermark render error:", e);
  }

  // Top Identifier Bar
  let currentY = margin + 8;
  const invoiceNo = feeItem?.invoiceNo || `INV-${feeItem?.id || Date.now()}`;
  const receiptNo = `REC-${invoiceNo.replace(/[^a-zA-Z0-9]/g, "")}`;
  const paymentDate = formatDate(feeItem?.paymentDate);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Receipt No. : ${receiptNo}`, margin + 5, currentY);
  doc.text(`Invoice No. : ${invoiceNo}`, pageWidth - margin - 5, currentY, { align: "right" });

  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, currentY, pageWidth - margin - 5, currentY);

  // School Header with Logo
  const logoW = 18;
  const logoH = 21;
  const logoX = margin + 6;
  const logoY = currentY + 2;

  try {
    doc.addImage(SCHOOL_EMBLEM_DATA_URL, "PNG", logoX, logoY, logoW, logoH);
  } catch (e) {
    console.warn("School logo error:", e);
  }

  currentY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...primaryNavy);
  doc.text("APNA SCHOOL PUBLIC SCHOOL", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text("AFFILIATED TO CENTRAL & STATE BOARD OF SECONDARY EDUCATION", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Main Campus, Institutional Area, Knowledge City | Phone: +91 9876543210", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 6;
  // Receipt Banner Box
  const bannerW = 135;
  const bannerH = 7.5;
  const bannerX = (pageWidth - bannerW) / 2;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(...secondaryBlue);
  doc.setLineWidth(0.5);
  doc.roundedRect(bannerX, currentY, bannerW, bannerH, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryNavy);
  doc.text("STUDENT FEE PAYMENT RECEIPT", pageWidth / 2, currentY + 5.2, { align: "center" });

  currentY += bannerH + 5;

  // Student Particulars Box
  const boxW = contentWidth - 10;
  const boxH = 36;
  const boxX = margin + 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, currentY, boxW, boxH, 2, 2, "FD");

  doc.setFillColor(234, 240, 246);
  doc.rect(boxX, currentY, boxW, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryNavy);
  doc.text("STUDENT DETAILS & ACADEMIC SESSION", boxX + 4, currentY + 4.2);

  const studentName =
    student?.name ||
    student?.studentName ||
    [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") ||
    "Student";
  const rollNumber = student?.rollNumber || student?.RollNumber || "N/A";
  const admNumber = student?.admissionNumber || student?.AdmissionNumber || "N/A";
  const className = student?.className || student?.ClassName || "Class";
  const sectionName = student?.sectionName || student?.SectionName || "";
  const fatherName = student?.fatherName || student?.FatherName || "—";
  const deptName = student?.departmentName || student?.DepartmentName || "General";
  const academicSession =
    currentYearFees?.currentAcademicYearName ||
    student?.academicYearName ||
    "Current Session";

  const col1X = boxX + 4;
  const col1ValX = boxX + 32;
  const col2X = boxX + 95;
  const col2ValX = boxX + 126;
  const rowStartY = currentY + 11;
  const rowH = 5.6;

  // Row 1
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text("Student Name:", col1X, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(studentName).toUpperCase(), col1ValX, rowStartY);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Admission No.:", col2X, rowStartY);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(admNumber), col2ValX, rowStartY);

  // Row 2
  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Class & Section:", col1X, rowStartY + rowH);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(`${className} ${sectionName ? `(${sectionName})` : ""}`, col1ValX, rowStartY + rowH);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Roll Number:", col2X, rowStartY + rowH);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(rollNumber), col2ValX, rowStartY + rowH);

  // Row 3
  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Father's Name:", col1X, rowStartY + rowH * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(fatherName), col1ValX, rowStartY + rowH * 2);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Academic Year:", col2X, rowStartY + rowH * 2);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(academicSession), col2ValX, rowStartY + rowH * 2);

  // Row 4
  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Department:", col1X, rowStartY + rowH * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(deptName), col1ValX, rowStartY + rowH * 3);

  doc.setFont("helvetica", "normal"); doc.setTextColor(...mutedText);
  doc.text("Receipt Date:", col2X, rowStartY + rowH * 3);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...darkSlate);
  doc.text(String(paymentDate), col2ValX, rowStartY + rowH * 3);

  currentY += boxH + 6;

  // Fee Particulars Table using autoTable
  const feeName = feeItem?.feeName || "Tuition & Academic Fee";
  const totalAmount = Number(feeItem?.totalAmount || feeItem?.amountPaid || 0);
  const amountPaid = Number(feeItem?.amountPaid || 0);
  const balanceDue = Number(feeItem?.balanceDue || 0);
  const status = feeItem?.status || (balanceDue <= 0 ? "PAID" : "PARTIAL");

  autoTable(doc, {
    startY: currentY,
    margin: { left: boxX, right: boxX },
    head: [
      [
        "S.N.",
        "FEE PARTICULARS / HEAD",
        "TOTAL APPLICABLE (INR)",
        "AMOUNT PAID (INR)",
        "BALANCE DUE (INR)",
        "STATUS",
      ],
    ],
    body: [
      [
        "1",
        feeName.toUpperCase(),
        `Rs. ${totalAmount.toLocaleString()}`,
        `Rs. ${amountPaid.toLocaleString()}`,
        balanceDue > 0 ? `Rs. ${balanceDue.toLocaleString()}` : "NIL",
        status,
      ],
    ],
    foot: [
      [
        "",
        "TOTAL AMOUNT RECEIVED IN THIS RECEIPT",
        `Rs. ${totalAmount.toLocaleString()}`,
        `Rs. ${amountPaid.toLocaleString()}`,
        balanceDue > 0 ? `Rs. ${balanceDue.toLocaleString()}` : "NIL",
        status,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 2.4,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { halign: "left", fontStyle: "bold" },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 32, halign: "center", fontStyle: "bold", textColor: [22, 101, 52] },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 26, halign: "center", fontStyle: "bold" },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: primaryNavy,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 2.4,
    },
  });

  const tableFinalY = doc.lastAutoTable?.finalY || currentY + 30;
  let summaryY = tableFinalY + 5;

  // Amount in Words & Mode Box
  const summaryBoxH = 18;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, summaryY, boxW, summaryBoxH, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text("Amount Received in Words :", boxX + 4, summaryY + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryBlue);
  doc.text(numberToWords(amountPaid), boxX + 48, summaryY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text("Payment Mode: Online ERP / Digital Banking  |  Transaction Status: SUCCESSFUL & RECONCILED", boxX + 4, summaryY + 12);

  // Overall Session Ledger Strip
  summaryY += summaryBoxH + 5;
  const ledgerH = 12;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, summaryY, boxW, ledgerH, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text(
    `Annual Session Summary (${academicSession}): Total Fee: Rs. ${(currentYearFees?.totalFee || totalAmount).toLocaleString()} | Total Paid So Far: Rs. ${(currentYearFees?.paidAmount || amountPaid).toLocaleString()} | Outstanding Balance: Rs. ${(currentYearFees?.remainderDue || balanceDue).toLocaleString()}`,
    boxX + boxW / 2,
    summaryY + 7.5,
    { align: "center" }
  );

  // Dual Signatures Row
  const sigY = pageHeight - margin - 22;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);

  // Left Signature
  doc.line(boxX + 10, sigY + 10, boxX + 60, sigY + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkSlate);
  doc.text("Student / Depositor Signature", boxX + 35, sigY + 14, { align: "center" });

  // Right Signature
  const rightSigX = boxX + boxW - 60;
  doc.line(rightSigX, sigY + 10, rightSigX + 50, sigY + 10);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Accounts Officer", rightSigX + 25, sigY + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text("Apna School Public School", rightSigX + 25, sigY + 17.5, { align: "center" });

  // Bottom Disclaimer Bar
  const footerY = pageHeight - margin - 3;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text(
    "Note: This is a system-generated official fee receipt. Please retain this receipt for future reference.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Save the PDF
  const safeFilename = `Fee_Receipt_${invoiceNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFilename);
};

/**
 * Generate Consolidated Full Session Fee Statement PDF
 */
export const generateFeeStatementPdf = async ({ student, currentYearFees }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const primaryNavy = [15, 23, 42];
  const secondaryBlue = [37, 99, 235];
  const darkSlate = [30, 41, 59];
  const mutedText = [100, 116, 139];
  const cardBorder = [203, 213, 225];

  doc.setDrawColor(...primaryNavy);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2, margin + 2, contentWidth - 4, pageHeight - margin * 2 - 4);

  try {
    doc.addImage(SCHOOL_WATERMARK_DATA_URL, "PNG", (pageWidth - 90) / 2, (pageHeight - 105) / 2, 90, 105);
  } catch (_) {}

  let currentY = margin + 8;
  const issueDate = formatDate(new Date());

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Statement Date: ${issueDate}`, margin + 5, currentY);
  doc.text(`Academic Session: ${currentYearFees?.currentAcademicYearName || "Current"}`, pageWidth - margin - 5, currentY, { align: "right" });

  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, currentY, pageWidth - margin - 5, currentY);

  const logoW = 18;
  const logoH = 21;
  try {
    doc.addImage(SCHOOL_EMBLEM_DATA_URL, "PNG", margin + 6, currentY + 2, logoW, logoH);
  } catch (_) {}

  currentY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...primaryNavy);
  doc.text("APNA SCHOOL PUBLIC SCHOOL", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text("CONSOLIDATED ANNUAL STUDENT FEE STATEMENT & LEDGER", (pageWidth + logoW) / 2 - 2, currentY, { align: "center" });

  currentY += 10;
  const boxW = contentWidth - 10;
  const boxH = 28;
  const boxX = margin + 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...cardBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, currentY, boxW, boxH, 2, 2, "FD");

  const studentName =
    student?.name ||
    student?.studentName ||
    [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") ||
    "Student";
  const rollNumber = student?.rollNumber || student?.RollNumber || "N/A";
  const admNumber = student?.admissionNumber || student?.AdmissionNumber || "N/A";
  const className = student?.className || student?.ClassName || "Class";
  const sectionName = student?.sectionName || student?.SectionName || "";

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...darkSlate);
  doc.text(`Student: ${studentName.toUpperCase()}`, boxX + 4, currentY + 8);
  doc.text(`Roll No: ${rollNumber}`, boxX + 90, currentY + 8);
  doc.text(`Adm No: ${admNumber}`, boxX + 130, currentY + 8);

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...mutedText);
  doc.text(`Class & Section: ${className} ${sectionName ? `(${sectionName})` : ""}`, boxX + 4, currentY + 15);
  doc.text(`Total Session Fee: Rs. ${(currentYearFees?.totalFee || 0).toLocaleString()}`, boxX + 90, currentY + 15);

  doc.text(`Total Paid: Rs. ${(currentYearFees?.paidAmount || 0).toLocaleString()}`, boxX + 4, currentY + 22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(Number(currentYearFees?.remainderDue || 0) > 0 ? 185 : 22, Number(currentYearFees?.remainderDue || 0) > 0 ? 28 : 101, Number(currentYearFees?.remainderDue || 0) > 0 ? 28 : 52);
  doc.text(`Remaining Balance Due: Rs. ${(currentYearFees?.remainderDue || 0).toLocaleString()}`, boxX + 90, currentY + 22);

  currentY += boxH + 6;

  // Build statement table rows
  const allPaid = currentYearFees?.paid || [];
  const allUnpaid = currentYearFees?.unpaid || [];

  const tableRows = [
    ...allPaid.map((p, idx) => [
      idx + 1,
      p.feeName || "Tuition Fee",
      p.invoiceNo || "-",
      formatDate(p.paymentDate),
      `Rs. ${(p.amountPaid || 0).toLocaleString()}`,
      `Rs. ${(p.balanceDue || 0).toLocaleString()}`,
      "PAID",
    ]),
    ...allUnpaid.map((u, idx) => [
      allPaid.length + idx + 1,
      u.feeName || "Pending Fee",
      "PENDING",
      `Due: ${u.dueDate || "-"}`,
      `Rs. ${(u.paidSoFar || 0).toLocaleString()}`,
      `Rs. ${(u.balanceDue || 0).toLocaleString()}`,
      u.status || "UNPAID",
    ]),
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: boxX, right: boxX },
    head: [
      [
        "S.N.",
        "FEE HEAD / PARTICULARS",
        "INVOICE / RECEIPT",
        "DATE",
        "PAID AMOUNT",
        "BALANCE DUE",
        "STATUS",
      ],
    ],
    body: tableRows,
    foot: [
      [
        "",
        "CONSOLIDATED TOTALS",
        "",
        "",
        `Rs. ${(currentYearFees?.paidAmount || 0).toLocaleString()}`,
        `Rs. ${(currentYearFees?.remainderDue || 0).toLocaleString()}`,
        currentYearFees?.status || "COMPLETED",
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.2,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { halign: "left", fontStyle: "bold" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 26, halign: "center" },
      4: { cellWidth: 28, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 26, halign: "center" },
      6: { cellWidth: 24, halign: "center", fontStyle: "bold" },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: primaryNavy,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
  });

  const sigY = pageHeight - margin - 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(boxX + boxW - 60, sigY + 10, boxX + boxW - 10, sigY + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkSlate);
  doc.text("Accounts Department", boxX + boxW - 35, sigY + 14, { align: "center" });

  const safeFilename = `Fee_Statement_${studentName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFilename);
};
