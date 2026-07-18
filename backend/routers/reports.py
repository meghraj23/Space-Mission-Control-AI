import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from config.db import get_db_session
from models.db_models import Mission
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/csv")
async def get_csv_report(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    missions = db.query(Mission).all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(["ID", "NAME", "STATUS", "ROCKET", "DESTINATION", "FUEL", "VELOCITY", "ALTITUDE"])
    
    for m in missions:
        writer.writerow([m.id, m.name, m.status, m.rocket, m.destination, m.fuel, m.velocity, m.altitude])
        
    stream.seek(0)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=missions_flight_log.csv"
    return response

@router.get("/excel")
async def get_excel_report(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    missions = db.query(Mission).all()
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Flight Vectors"
    ws.append(["ID", "MISSION NAME", "FLIGHT STATUS", "LAUNCHER", "DESTINATION TARGET", "FUEL (%)", "VELOCITY (km/h)", "ALTITUDE (km)"])
    
    for m in missions:
        ws.append([m.id, m.name, m.status, m.rocket, m.destination, m.fuel, m.velocity, m.altitude])
        
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    response = StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers["Content-Disposition"] = "attachment; filename=missions_flight_log.xlsx"
    return response

@router.get("/pdf")
async def get_pdf_report(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db_session)):
    missions = db.query(Mission).all()
    
    file_stream = io.BytesIO()
    p = canvas.Canvas(file_stream, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, "MISSION CONTROL AI CORE OPERATIONS LOG")
    p.setFont("Helvetica", 10)
    p.drawString(100, 735, "LAUNCH VEHICLE DATA RECONCILIATION SHEET")
    
    p.setLineWidth(1)
    p.line(100, 725, 500, 725)
    
    y = 690
    for idx, m in enumerate(missions):
        if y < 100:
            p.showPage()
            y = 750
            
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, y, f"{idx+1}. {m.name}")
        p.setFont("Helvetica", 9)
        p.drawString(100, y-15, f"STATUS: {m.status} | LAUNCHER: {m.rocket} | TARGET: {m.destination}")
        p.drawString(100, y-30, f"FUEL RESERVES: {m.fuel}% | VELOCITY: {m.velocity} km/h | ALTITUDE: {m.altitude} km")
        y -= 60
        
    p.save()
    file_stream.seek(0)
    
    response = StreamingResponse(file_stream, media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=missions_flight_log.pdf"
    return response
