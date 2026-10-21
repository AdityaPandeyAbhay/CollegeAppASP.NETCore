import React, { useState, useEffect, useRef } from "react";
import {
  getDeclaredHolidays,
  saveDeclaredHoliday,
  removeDeclaredHoliday,
  syncHolidayAttendanceToDatabase,
  ymdToDmy,
  dmyToYmd,
} from "../../Services/classTeacherService";
import "./DeclareHolidayModal.css";

const getTodayDmy = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const getTodayYmd = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function DeclareHolidayModal({
  onClose,
  onSaved,
  classId = "default",
  sectionId = "default",
  academicYearId = "default",
  departmentList = [],
  classList = [],
  students = null,
  teacherAssignmentId = null,
}) {
  const [holidays, setHolidays] = useState(() =>
    getDeclaredHolidays(classId, sectionId, academicYearId),
  );

  const [dateInput, setDateInput] = useState(() => getTodayDmy());
  const [datePickerValue, setDatePickerValue] = useState(() => getTodayYmd());
  const [holidayType, setHolidayType] = useState("Holiday"); // 'Holiday' | 'WO' | 'Exam'
  const [holidayTitle, setHolidayTitle] = useState("");
  const [appliedTo, setAppliedTo] = useState("All Departments & Classes");
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });
  const [savingDb, setSavingDb] = useState(false);

  const datePickerRef = useRef(null);

  const reloadHolidays = () => {
    const list = getDeclaredHolidays(classId, sectionId, academicYearId);
    setHolidays(list);
  };

  const handleDateTextChange = (text) => {
    setDateInput(text);
    const ymd = dmyToYmd(text);
    if (ymd && ymd.length === 10) {
      setDatePickerValue(ymd);
    }
  };

  const handleDatePickerChange = (ymd) => {
    if (!ymd) return;
    setDatePickerValue(ymd);
    const dmy = ymdToDmy(ymd);
    setDateInput(dmy);
  };

  const setQuickDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const pad = (n) => String(n).padStart(2, "0");
    const dmy = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    setDateInput(dmy);
    setDatePickerValue(ymd);
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    const dmy = dateInput.trim();
    if (!dmy || !holidayTitle.trim()) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter both date (DD/MM/YYYY) and holiday / occasion name.",
      });
      return;
    }

    // Validate DD/MM/YYYY format
    const parts = dmy.split("/");
    if (
      parts.length !== 3 ||
      isNaN(parts[0]) ||
      isNaN(parts[1]) ||
      isNaN(parts[2])
    ) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter a valid date in DD/MM/YYYY format (e.g. 15/10/2026).",
      });
      return;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      setFeedbackMsg({
        type: "error",
        text: "Please enter a valid calendar date in DD/MM/YYYY format.",
      });
      return;
    }

    const cleanTitle = holidayTitle.trim();
    const savedItem = saveDeclaredHoliday({
      dateStr: dmy,
      type: holidayType,
      title: cleanTitle,
      remark: cleanTitle,
      appliedTo,
      classId,
      sectionId,
      academicYearId,
    });

    // 1. Immediately update state so newly declared holiday is guaranteed to show in the list
    if (savedItem) {
      setHolidays((prev) => {
        const filtered = (prev || []).filter(
          (h) =>
            h.dateStr !== savedItem.dateStr &&
            h.displayDate !== savedItem.displayDate &&
            h.dateStr !== savedItem.displayDate,
        );
        return [...filtered, savedItem].sort(
          (a, b) => new Date(a.dateStr) - new Date(b.dateStr),
        );
      });
    } else {
      reloadHolidays();
    }

    const typeLabel =
      holidayType === "Holiday"
        ? "Official Holiday"
        : holidayType === "WO"
          ? "Special Week-Off"
          : "Examination Day";

    setSavingDb(true);
    setFeedbackMsg({
      type: "info",
      text: `⏳ Declared ${dmy} as ${typeLabel}. Saving attendance to student database...`,
    });

    // 2. Save to Database for Every Student
    const dbRes = await syncHolidayAttendanceToDatabase({
      dateStr: dmy,
      holidayTitle: cleanTitle,
      classId,
      sectionId,
      academicYearId,
      appliedTo,
      students,
      teacherAssignmentId,
    });

    setSavingDb(false);
    setHolidayTitle("");

    if (dbRes?.success && dbRes?.count > 0) {
      setFeedbackMsg({
        type: "success",
        text: `✓ Successfully declared ${dmy} as ${typeLabel} & saved to database for ${dbRes.count} students!`,
      });
    } else {
      setFeedbackMsg({
        type: "success",
        text: `✓ Successfully declared ${dmy} as ${typeLabel}!`,
      });
    }

    if (onSaved) onSaved();

    setTimeout(() => {
      setFeedbackMsg({ type: "", text: "" });
    }, 4500);
  };

  const handleDeleteHoliday = (dateStr) => {
    removeDeclaredHoliday(dateStr, classId, sectionId, academicYearId);
    setHolidays((prev) =>
      (prev || []).filter(
        (h) => h.dateStr !== dateStr && h.displayDate !== dateStr,
      ),
    );
    setFeedbackMsg({
      type: "success",
      text: `Declaration for ${dateStr} cancelled successfully.`,
    });
    if (onSaved) onSaved();
    setTimeout(() => {
      setFeedbackMsg({ type: "", text: "" });
    }, 3500);
  };

  return (
    <div className="ath-holiday-modal-overlay" onClick={onClose}>
      <div
        className="ath-holiday-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="ath-modal-header">
          <div className="ath-modal-title-box">
            <div className="ath-holiday-icon-circle">🏖️</div>
            <div>
              <h3 className="ath-modal-title">
                Declare School / College Holiday &amp; Special Day
              </h3>
              <p className="ath-modal-subtitle">
                Admin Holiday Declaration Master • Applies automatically to
                Attendance Matrix &amp; Register
              </p>
            </div>
          </div>
          <button
            className="ath-modal-close-btn"
            onClick={onClose}
            title="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="ath-modal-body">
          {/* New Declaration Form Card */}
          <form onSubmit={handleAddHoliday} className="ath-holiday-form-card">
            <div className="ath-holiday-form-header">
              <span>✨</span>
              <span className="ath-form-header-title">
                Declare New Date as Holiday or Weekly-Off
              </span>
            </div>

            {feedbackMsg.text && (
              <div
                className={`ath-holiday-feedback-banner ${feedbackMsg.type}`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <div className="ath-holiday-grid-inputs">
              {/* Date Input in DD/MM/YYYY Format */}
              <div className="ath-holiday-field">
                <label>Select Date (DD/MM/YYYY)</label>
                <div className="ath-holiday-dual-date-box">
                  <input
                    type="text"
                    value={dateInput}
                    onChange={(e) => handleDateTextChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="ath-holiday-date-text-input"
                    title="Type Date in DD/MM/YYYY format"
                    required
                  />
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="ath-holiday-picker-btn"
                      title="Open Calendar Picker"
                      onClick={() => datePickerRef.current?.showPicker?.()}
                    >
                      📅
                    </button>
                    <input
                      ref={datePickerRef}
                      type="date"
                      value={datePickerValue}
                      onChange={(e) => handleDatePickerChange(e.target.value)}
                      className="ath-native-date-hidden"
                      tabIndex={-1}
                    />
                  </div>
                </div>

                <div className="ath-holiday-quick-chips">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="ath-quick-chip"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="ath-quick-chip"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    className="ath-quick-chip"
                  >
                    +2 Days
                  </button>
                </div>
              </div>

              {/* Type Selection */}
              <div className="ath-holiday-field">
                <label>Declaration Type</label>
                <div className="ath-holiday-type-radios">
                  <label
                    className={`ath-type-chip ${holidayType === "Holiday" ? "active-h" : ""}`}
                  >
                    <input
                      type="radio"
                      name="holidayType"
                      value="Holiday"
                      checked={holidayType === "Holiday"}
                      onChange={() => setHolidayType("Holiday")}
                    />
                    <span>🎉</span>
                    <span>Official Holiday</span>
                  </label>

                  <label
                    className={`ath-type-chip ${holidayType === "WO" ? "active-wo" : ""}`}
                  >
                    <input
                      type="radio"
                      name="holidayType"
                      value="WO"
                      checked={holidayType === "WO"}
                      onChange={() => setHolidayType("WO")}
                    />
                    <span>🛋️</span>
                    <span>Special Week-Off</span>
                  </label>

                  <label
                    className={`ath-type-chip ${holidayType === "Exam" ? "active-exam" : ""}`}
                  >
                    <input
                      type="radio"
                      name="holidayType"
                      value="Exam"
                      checked={holidayType === "Exam"}
                      onChange={() => setHolidayType("Exam")}
                    />
                    <span>📝</span>
                    <span>Exam Day</span>
                  </label>
                </div>
              </div>

              {/* Occasion / Reason */}
              <div className="ath-holiday-field full-width">
                <label>Festival / Occasion / Reason</label>
                <input
                  type="text"
                  value={holidayTitle}
                  onChange={(e) => setHolidayTitle(e.target.value)}
                  placeholder="e.g. Diwali Vacation, Holi Festival, Gandhi Jayanti, Sports Meet"
                  className="ath-holiday-text-input"
                  required
                />
              </div>

              {/* Applicable Scope */}
              <div className="ath-holiday-field full-width">
                <label>Applicable Scope</label>
                <select
                  value={appliedTo}
                  onChange={(e) => setAppliedTo(e.target.value)}
                  className="ath-holiday-select"
                >
                  <option value="All Departments & Classes">
                    All Departments &amp; Classes (Entire School / College)
                  </option>
                  {departmentList.map((d) => {
                    const dName =
                      d.departmentName ||
                      d.DepartmentName ||
                      d.text ||
                      d.name ||
                      `Department ${d.id}`;
                    return (
                      <option
                        key={d.id ?? dName}
                        value={`Department: ${dName}`}
                      >
                        {dName} Only
                      </option>
                    );
                  })}
                  {classList.map((c) => {
                    const cName =
                      c.className || c.ClassName || `Class ${c.id}`;
                    return (
                      <option key={c.id ?? cName} value={`Class: ${cName}`}>
                        {cName} Only
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="ath-btn-add-holiday"
              disabled={savingDb}
            >
              <span>
                {savingDb
                  ? "⏳ Saving Holiday to Database..."
                  : "+ Declare Date on Attendance Matrix"}
              </span>
            </button>
          </form>

          {/* Declared Holidays List */}
          <div className="ath-declared-list-section">
            <div className="ath-declared-list-header">
              <h4 className="ath-declared-list-title">
                Currently Declared School / College Holidays &amp; Special Days
              </h4>
              <span className="ath-declared-count-tag">
                {holidays.length} Declared
              </span>
            </div>

            {holidays.length === 0 ? (
              <div className="ath-declared-empty">
                No custom holidays or exam days declared yet. Use the form above
                to declare.
              </div>
            ) : (
              <div className="ath-declared-items-list">
                {holidays.map((h) => {
                  const isH = h.type === "Holiday" || h.type === "H";
                  const isWO = h.type === "WO";
                  const isExam = h.type === "Exam";

                  const itemClass = isH
                    ? "holiday-h"
                    : isWO
                      ? "holiday-wo"
                      : "holiday-exam";
                  const pillClass = isH
                    ? "pill-h"
                    : isWO
                      ? "pill-wo"
                      : "pill-exam";
                  const pillText = isH
                    ? "🎉 Holiday"
                    : isWO
                      ? "🛋️ Week-Off"
                      : "📝 Exam";

                  return (
                    <div
                      key={h.dateStr || h.displayDate}
                      className={`ath-declared-item ${itemClass}`}
                    >
                      <div className="ath-declared-left">
                        <span
                          className={`ath-declared-type-pill ${pillClass}`}
                        >
                          {pillText}
                        </span>
                        <div>
                          <p className="ath-declared-title">
                            {h.title || h.remark}
                          </p>
                          <p className="ath-declared-meta">
                            Date:{" "}
                            <strong style={{ color: "#0f172a" }}>
                              {h.displayDate || h.dateStr}
                            </strong>{" "}
                            • Scope: {h.appliedTo || "All Departments & Classes"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteHoliday(h.dateStr || h.displayDate)
                        }
                        className="ath-btn-delete-holiday"
                        title="Cancel this holiday declaration"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="ath-modal-footer">
          <button
            className="ath-btn-primary"
            onClick={() => {
              if (onSaved) onSaved();
              onClose();
            }}
          >
            ✓ Done &amp; Apply to Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
