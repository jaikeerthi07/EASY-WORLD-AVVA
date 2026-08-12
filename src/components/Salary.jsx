import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
import { API_BASE_URL } from '../config';
  FaMoneyBillWave,
  FaFileExcel,
  FaPrint,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaChartLine,
  FaCalculator,
  FaRegFileAlt
} from "react-icons/fa";

const API_BASE_URL = `${API_BASE_URL}/api`;

export default function Salary() {
  // Shared Data States
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  // Salary States
  const [salaryReports, setSalaryReports] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  // Axios instance
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth, selectedYear, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      const data = Array.isArray(res.data) ? res.data : (res.data.employees || []);
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth
      });
      if (selectedEmployee) params.append("employee_id", selectedEmployee);

      const res = await api.get(`/salary/calculate?${params.toString()}`);
      setSalaryReports(res.data.reports || []);
    } catch (err) {
      console.error("Error calculating salary:", err);
      showToast("Failed to fetch salary records", true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (empId) => {
    try {
      const res = await api.get(`/salary/payslip?employee_id=${empId}&year=${selectedYear}&month=${selectedMonth}`);
      setSelectedPayslip(res.data);
      setShowPayslipModal(true);
    } catch (err) {
      showToast("Error loading payslip details", true);
    }
  };

  const handleExportExcel = () => {
    if (salaryReports.length === 0) {
      showToast("No salary data to export", true);
      return;
    }

    const exportData = salaryReports.map(r => ({
      "Emp ID": r.employee_code,
      "Employee Name": r.full_name,
      "Department": r.department,
      "Monthly Base Salary (₹)": r.base_salary,
      "Working Days": r.working_days,
      "Present Days": r.present_days,
      "Absent Days": r.absent_days,
      "Paid Leave": r.paid_leave,
      "Half Days": r.half_days,
      "Overtime Hours": r.overtime_hours,
      "Overtime Pay (₹)": r.overtime_pay,
      "Deductions (₹)": r.absent_deduction,
      "Net Salary (₹)": r.net_salary
    }));

    const filename = `Salary_Report_${selectedYear}_${selectedMonth}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Report");
    XLSX.writeFile(workbook, filename);
    showToast("Excel report exported successfully!");
  };

  // Filtered reports search
  const filteredReports = salaryReports.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.employee_code?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  // Overview metrics
  const totalPayroll = filteredReports.reduce((acc, curr) => acc + (curr.net_salary || 0), 0);
  const totalBase = filteredReports.reduce((acc, curr) => acc + (curr.base_salary || 0), 0);
  const totalDeductions = filteredReports.reduce((acc, curr) => acc + (curr.absent_deduction || 0), 0);
  const totalOvertime = filteredReports.reduce((acc, curr) => acc + (curr.overtime_pay || 0), 0);

  return (
    <div style={styles.container}>
      {/* Top Header Card */}
      <div style={styles.headerCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={styles.pageTitle}>Salary & Payslip Module</h1>
            <p style={styles.pageSubtitle}>Calculate monthly employee salaries, view payroll summaries, and generate payslips</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleExportExcel} style={styles.excelButton}>
              <FaFileExcel style={{ marginRight: "6px" }} /> Export Excel
            </button>
            <button onClick={() => window.print()} style={styles.pdfButton}>
              <FaPrint style={{ marginRight: "6px" }} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: toast.isError ? "#ef4444" : "#10b981" }}>
          {toast.msg}
        </div>
      )}

      {/* Filter Card */}
      <div style={styles.filterCard}>
        <div style={styles.filterGrid}>
          <div>
            <label style={styles.filterLabel}>Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.filterLabel}>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={styles.filterSelect}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.filterLabel}>Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={styles.filterSelect}
            />
          </div>

          <div>
            <label style={styles.filterLabel}>Search</label>
            <input
              type="text"
              placeholder="Search Name / ID / Dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.filterSelect}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "5px solid #3b82f6" }}>
          <div style={styles.statTitle}>Total Base Salary</div>
          <div style={{ ...styles.statValue, color: "#3b82f6" }}>₹{totalBase.toLocaleString()}</div>
          <div style={styles.statDesc}>Gross fixed payroll</div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "5px solid #eab308" }}>
          <div style={styles.statTitle}>Total Overtime Pay</div>
          <div style={{ ...styles.statValue, color: "#eab308" }}>+₹{totalOvertime.toLocaleString()}</div>
          <div style={styles.statDesc}>Total OT compensation</div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "5px solid #ef4444" }}>
          <div style={styles.statTitle}>Total Deductions</div>
          <div style={{ ...styles.statValue, color: "#ef4444" }}>-₹{totalDeductions.toLocaleString()}</div>
          <div style={styles.statDesc}>Absenteeism deductions</div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "5px solid #10b981" }}>
          <div style={styles.statTitle}>Net Payable Payroll</div>
          <div style={{ ...styles.statValue, color: "#10b981" }}>₹{totalPayroll.toLocaleString()}</div>
          <div style={styles.statDesc}>Final discursable total</div>
        </div>
      </div>

      {/* Main Content Salary Table */}
      <div style={styles.contentCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Emp ID</th>
                <th style={styles.th}>Employee Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Base Salary (₹)</th>
                <th style={styles.th}>Work Days</th>
                <th style={styles.th}>Present</th>
                <th style={styles.th}>Absent</th>
                <th style={styles.th}>PL</th>
                <th style={styles.th}>Half Day</th>
                <th style={styles.th}>Overtime Pay (₹)</th>
                <th style={styles.th}>Deductions (₹)</th>
                <th style={styles.th}>Net Salary (₹)</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    Calculating salary records...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No salary records found for this period.
                  </td>
                </tr>
              ) : (
                filteredReports.map((s) => (
                  <tr key={s.employee_id} style={styles.tableRow}>
                    <td style={styles.td}>{s.employee_code}</td>
                    <td style={styles.td}><strong style={{ color: "#f8fafc" }}>{s.full_name}</strong></td>
                    <td style={styles.td}>{s.department || "-"}</td>
                    <td style={styles.td}>₹{s.base_salary?.toLocaleString()}</td>
                    <td style={styles.td}>{s.working_days}</td>
                    <td style={{ ...styles.td, color: "#10b981", fontWeight: "bold" }}>{s.present_days}</td>
                    <td style={{ ...styles.td, color: "#ef4444", fontWeight: "bold" }}>{s.absent_days}</td>
                    <td style={styles.td}>{s.paid_leave}</td>
                    <td style={styles.td}>{s.half_days}</td>
                    <td style={{ ...styles.td, color: "#eab308" }}>+₹{s.overtime_pay}</td>
                    <td style={{ ...styles.td, color: "#ef4444" }}>-₹{s.absent_deduction}</td>
                    <td style={{ ...styles.td, color: "#38bdf8", fontWeight: "bold", fontSize: "15px" }}>₹{s.net_salary?.toLocaleString()}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleViewPayslip(s.employee_id)}
                        style={styles.actionButton}
                      >
                        🧾 Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {showPayslipModal && selectedPayslip && (
        <div style={styles.modalOverlay} onClick={() => setShowPayslipModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: "650px", padding: "0" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "24px", color: "#fff", borderBottom: "2px solid #334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "#38bdf8" }}>EAZYWORLD</h2>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>OFFICIAL SALARY PAYSLIP</div>
                </div>
                <button onClick={() => setShowPayslipModal(false)} style={styles.modalClose}>×</button>
              </div>
            </div>

            <div style={{ padding: "24px", color: "#f8fafc", backgroundColor: "#0f172a" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px" }}>
                <div><span style={{ color: "#94a3b8" }}>Payslip No:</span> <strong>{selectedPayslip.payslip_number}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Pay Period:</span> <strong>{selectedPayslip.period}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Employee:</span> <strong>{selectedPayslip.employee?.full_name}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Emp ID:</span> <strong>{selectedPayslip.employee?.employee_id}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Department:</span> <strong>{selectedPayslip.employee?.department || "N/A"}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>Designation:</span> <strong>{selectedPayslip.employee?.designation || "N/A"}</strong></div>
              </div>

              {/* Earnings & Deductions Table */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px" }}>
                  <h4 style={{ color: "#10b981", margin: "0 0 10px 0", fontSize: "14px" }}>EARNINGS</h4>
                  <div style={styles.slipRow}><span>Base Salary:</span> <span>₹{selectedPayslip.summary?.base_salary?.toLocaleString()}</span></div>
                  <div style={styles.slipRow}><span>Overtime Pay:</span> <span>₹{selectedPayslip.summary?.overtime_pay?.toLocaleString()}</span></div>
                </div>

                <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "10px" }}>
                  <h4 style={{ color: "#ef4444", margin: "0 0 10px 0", fontSize: "14px" }}>DEDUCTIONS</h4>
                  <div style={styles.slipRow}><span>Absent Deductions:</span> <span>₹{selectedPayslip.summary?.absent_deduction?.toLocaleString()}</span></div>
                </div>
              </div>

              <div style={{ backgroundColor: "#0284c7", padding: "16px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>NET PAYABLE SALARY:</span>
                <span style={{ fontSize: "22px", fontWeight: "bold" }}>₹{selectedPayslip.summary?.net_salary?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ padding: "16px 24px", backgroundColor: "#1e293b", borderTop: "1px solid #334155", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => window.print()} style={styles.primaryButton}>
                <FaPrint style={{ marginRight: "6px" }} /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  headerCard: {
    backgroundColor: "#1e293b",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "20px",
    border: "1px solid #334155",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#f8fafc",
    margin: 0
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginTop: "4px",
    margin: 0
  },
  excelButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  pdfButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  toast: {
    padding: "12px 20px",
    color: "#fff",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "bold",
    fontSize: "14px"
  },
  filterCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    border: "1px solid #334155"
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  filterLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    textTransform: "uppercase"
  },
  filterSelect: {
    width: "100%",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginBottom: "20px"
  },
  statCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #334155"
  },
  statTitle: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "8px 0 4px 0",
    color: "#f8fafc"
  },
  statDesc: {
    color: "#64748b",
    fontSize: "12px"
  },
  contentCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #334155",
    marginBottom: "20px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },
  tableHeaderRow: {
    borderBottom: "2px solid #334155",
    backgroundColor: "#0f172a"
  },
  th: {
    padding: "12px 14px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  tableRow: {
    borderBottom: "1px solid #334155"
  },
  td: {
    padding: "12px 14px",
    color: "#cbd5e1",
    fontSize: "13px"
  },
  actionButton: {
    backgroundColor: "#0284c7",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
    border: "1px solid #334155"
  },
  modalClose: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer"
  },
  slipRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: "13px",
    borderBottom: "1px dashed #334155"
  }
};
