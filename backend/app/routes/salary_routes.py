# app/routes/salary_routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, date
import calendar
from sqlalchemy import and_, func
from app import db
from app.models import Employee, Attendance
from flask_cors import CORS
import logging

salary_bp = Blueprint('salary', __name__)
CORS(salary_bp)
logger = logging.getLogger(__name__)

@salary_bp.route('/calculate', methods=['GET'])
def calculate_salaries():
    """Calculate monthly salaries for all or single employee based on attendance"""
    try:
        employee_id = request.args.get('employee_id')
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        standard_days = request.args.get('working_days', type=int)  # Optional override
        
        # Determine total calendar days in month
        num_days_in_month = calendar.monthrange(year, month)[1]
        working_days = standard_days if standard_days and standard_days > 0 else 26
        
        emp_query = Employee.query
        if employee_id:
            emp_query = emp_query.filter(Employee.id == employee_id)
            
        employees = emp_query.all()
        salary_reports = []
        
        start_date = date(year, month, 1)
        end_date = date(year, month, num_days_in_month)
        
        for emp in employees:
            # Fetch attendance for this month
            attendances = Attendance.query.filter(
                and_(
                    Attendance.employee_id == emp.id,
                    Attendance.date >= start_date,
                    Attendance.date <= end_date
                )
            ).all()
            
            present_days = sum(1 for a in attendances if a.status == 'present')
            absent_days = sum(1 for a in attendances if a.status == 'absent')
            paid_leave = sum(1 for a in attendances if a.status in ['paid_leave', 'pl', 'leave'])
            half_days = sum(1 for a in attendances if a.status in ['half_day', 'halfday'])
            permissions = sum(1 for a in attendances if a.status == 'permission')
            late_entries = sum(1 for a in attendances if a.status == 'late')
            overtime_hours = sum(a.overtime or 0.0 for a in attendances)
            
            base_salary = emp.monthly_salary or 0.0
            per_day_rate = round(base_salary / working_days, 2) if working_days > 0 else 0.0
            hourly_rate = round(per_day_rate / 8.0, 2)
            overtime_hourly_rate = round(hourly_rate * 1.25, 2)  # 1.25x multiplier
            
            overtime_pay = round(overtime_hours * overtime_hourly_rate, 2)
            present_pay = round((present_days + paid_leave) * per_day_rate, 2)
            half_day_pay = round(half_days * 0.5 * per_day_rate, 2)
            
            absent_deduction = round(absent_days * per_day_rate + (half_days * 0.5 * per_day_rate), 2)
            
            gross_salary = round(present_pay + half_day_pay + overtime_pay, 2)
            net_salary = max(0.0, round(base_salary - absent_deduction + overtime_pay, 2))
            
            salary_reports.append({
                'employee_id': emp.id,
                'employee_code': emp.employee_id,
                'full_name': emp.full_name,
                'department': emp.department,
                'designation': emp.designation,
                'barcode': emp.barcode or f"EMP-BAR-{emp.employee_id}",
                'year': year,
                'month': month,
                'month_name': calendar.month_name[month],
                'base_salary': base_salary,
                'working_days': working_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'paid_leave': paid_leave,
                'half_days': half_days,
                'permissions': permissions,
                'late_entries': late_entries,
                'overtime_hours': overtime_hours,
                'per_day_rate': per_day_rate,
                'overtime_pay': overtime_pay,
                'absent_deduction': absent_deduction,
                'gross_salary': gross_salary,
                'net_salary': net_salary
            })
            
        return jsonify({
            'year': year,
            'month': month,
            'month_name': calendar.month_name[month],
            'working_days': working_days,
            'reports': salary_reports
        }), 200
        
    except Exception as e:
        logger.error(f"Salary calculation error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@salary_bp.route('/payslip', methods=['GET'])
def get_payslip():
    """Get detailed payslip data for single employee"""
    try:
        employee_id = request.args.get('employee_id')
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        if not employee_id:
            return jsonify({'error': 'Employee ID is required'}), 400
            
        emp = Employee.query.get(employee_id)
        if not emp:
            return jsonify({'error': 'Employee not found'}), 404
            
        num_days_in_month = calendar.monthrange(year, month)[1]
        working_days = 26
        
        start_date = date(year, month, 1)
        end_date = date(year, month, num_days_in_month)
        
        attendances = Attendance.query.filter(
            and_(
                Attendance.employee_id == emp.id,
                Attendance.date >= start_date,
                Attendance.date <= end_date
            )
        ).all()
        
        present_days = sum(1 for a in attendances if a.status == 'present')
        absent_days = sum(1 for a in attendances if a.status == 'absent')
        paid_leave = sum(1 for a in attendances if a.status in ['paid_leave', 'pl', 'leave'])
        half_days = sum(1 for a in attendances if a.status in ['half_day', 'halfday'])
        permissions = sum(1 for a in attendances if a.status == 'permission')
        overtime_hours = sum(a.overtime or 0.0 for a in attendances)
        
        base_salary = emp.monthly_salary or 0.0
        per_day_rate = round(base_salary / working_days, 2) if working_days > 0 else 0.0
        hourly_rate = round(per_day_rate / 8.0, 2)
        overtime_hourly_rate = round(hourly_rate * 1.25, 2)
        
        overtime_pay = round(overtime_hours * overtime_hourly_rate, 2)
        absent_deduction = round(absent_days * per_day_rate + (half_days * 0.5 * per_day_rate), 2)
        net_salary = max(0.0, round(base_salary - absent_deduction + overtime_pay, 2))
        
        payslip_data = {
            'payslip_number': f"PAY-{year}{month:02d}-{emp.employee_id}",
            'issue_date': date.today().isoformat(),
            'employee': emp.to_dict(),
            'period': f"{calendar.month_name[month]} {year}",
            'summary': {
                'base_salary': base_salary,
                'working_days': working_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'paid_leave': paid_leave,
                'half_days': half_days,
                'permissions': permissions,
                'overtime_hours': overtime_hours,
                'overtime_pay': overtime_pay,
                'absent_deduction': absent_deduction,
                'net_salary': net_salary
            }
        }
        
        return jsonify(payslip_data), 200
        
    except Exception as e:
        logger.error(f"Payslip error: {str(e)}")
        return jsonify({'error': str(e)}), 500
