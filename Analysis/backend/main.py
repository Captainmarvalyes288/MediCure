# backend/main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from datetime import datetime
from typing import Optional
import numpy as np
from pydantic import BaseModel
import calendar
import os
import sys

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup data paths
# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(backend_dir, "data")

# Print the paths for debugging
print(f"Backend directory: {backend_dir}")
print(f"Data directory: {data_dir}")
print(f"Current working directory: {os.getcwd()}")

# Global variables
appointments = None
patients = None
slots = None
df = None

# Load data function
def load_data():
    global appointments, patients, slots, df
    
    try:
        # Check if data directory exists
        if not os.path.exists(data_dir):
            print(f"Data directory does not exist: {data_dir}")
            return False
        
        # List files in data directory for debugging
        print(f"Files in data directory: {os.listdir(data_dir)}")
        
        # Load data files
        appointments_path = os.path.join(data_dir, "clean_appointments.csv")
        patients_path = os.path.join(data_dir, "patients_cleaned.csv")
        slots_path = os.path.join(data_dir, "slots_cleaned_with_doctor_info.csv")
        
        print(f"Loading appointments from: {appointments_path}")
        appointments = pd.read_csv(appointments_path, parse_dates=['appointment_date', 'scheduling_date'])
        
        print(f"Loading patients from: {patients_path}")
        patients = pd.read_csv(patients_path)
        
        print(f"Loading slots from: {slots_path}")
        slots = pd.read_csv(slots_path, parse_dates=['appointment_date'])
        
        # Merge data
        df = appointments.merge(patients, on='patient_id', how='left')
        df = df.merge(slots, on=['appointment_date', 'appointment_time'], how='left')
        
        # Convert time columns
        time_cols = ['appointment_time', 'check_in_time', 'start_time', 'end_time']
        for col in time_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], format='%H:%M:%S').dt.time
        
        return True
    
    except FileNotFoundError as e:
        print(f"Error loading data files: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error loading data: {e}")
        return False

# Load the data on startup
data_loaded = load_data()

# Error handler for when data is not loaded
@app.exception_handler(500)
async def data_not_loaded_handler(request: Request, exc: Exception):
    if not data_loaded and "name 'appointments' is not defined" in str(exc):
        return JSONResponse(
            status_code=500,
            content={"detail": "Data files could not be loaded. Please check the data directory path."},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Helper functions
def convert_time_to_minutes(t):
    if pd.isna(t) or t == datetime.strptime('00:00:00', '%H:%M:%S').time():
        return 0
    return t.hour * 60 + t.minute + t.second / 60

@app.get("/")
async def root():
    """Root endpoint to check API status and data loading status"""
    if data_loaded:
        return {"status": "API is running", "data_loaded": True}
    else:
        return {"status": "API is running", "data_loaded": False, 
                "message": "Data files could not be loaded. Check server logs for details."}

@app.get("/reload_data")
async def reload_data_endpoint():
    """Endpoint to reload data files"""
    global data_loaded
    data_loaded = load_data()
    if data_loaded:
        return {"status": "success", "message": "Data reloaded successfully"}
    else:
        return {"status": "error", "message": "Failed to reload data. Check server logs for details."}

@app.get("/appointment_volume")
async def get_appointment_volume(timeframe: str = 'day'):
    """Get appointment volume by day, week, or month"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    if timeframe == 'day':
        result = df.groupby('appointment_date').size().reset_index(name='count')
    elif timeframe == 'week':
        result = df.groupby(df['appointment_date'].dt.isocalendar().week).size().reset_index(name='count')
        result.rename(columns={'week': 'date'}, inplace=True)
    elif timeframe == 'month':
        result = df.groupby(df['appointment_date'].dt.month).size().reset_index(name='count')
        result['date'] = result['month'].apply(lambda x: calendar.month_abbr[x])
    else:
        raise HTTPException(status_code=400, detail="Invalid timeframe. Use 'day', 'week', or 'month'.")
    
    return result.to_dict(orient='records')

@app.get("/slot_utilization")
async def get_slot_utilization():
    """Get slot utilization metrics"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    slot_usage = df.groupby(['appointment_date', 'appointment_time', 'is_available']).size().unstack(fill_value=0).reset_index()
    slot_usage['utilization_rate'] = slot_usage[False] / (slot_usage[False] + slot_usage.get(True, 0)) * 100
    
    no_show_by_slot = df[df['status'] == 'did not attend'].groupby(['appointment_time']).size() / df.groupby(['appointment_time']).size() * 100
    no_show_by_slot = no_show_by_slot.reset_index(name='no_show_rate')
    
    return {
        "slot_usage": slot_usage.to_dict(orient='records'),
        "no_show_by_slot": no_show_by_slot.to_dict(orient='records')
    }

@app.get("/attendance_patterns")
async def get_attendance_patterns():
    """Get attendance patterns including no-show rates"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    attendance = df.groupby(['appointment_date', 'status']).size().unstack(fill_value=0).reset_index()
    attendance['no_show_rate'] = attendance['did not attend'] / (attendance['attended'] + attendance['did not attend']) * 100
    
    # By time of day
    df['time_of_day'] = pd.to_datetime(df['appointment_time'].astype(str)).dt.hour
    time_of_day_bins = [0, 12, 17, 24]
    time_of_day_labels = ['Morning', 'Afternoon', 'Evening']
    df['time_of_day_category'] = pd.cut(df['time_of_day'], bins=time_of_day_bins, labels=time_of_day_labels, right=False)
    
    no_show_by_time = df.groupby('time_of_day_category')['status'].apply(lambda x: (x == 'did not attend').mean() * 100).reset_index(name='no_show_rate')
    
    # By scheduling interval
    df['scheduling_interval_bin'] = pd.cut(df['scheduling_interval'], bins=[0, 1, 3, 7, 14, 30, 90, 365])
    no_show_by_interval = df.groupby('scheduling_interval_bin')['status'].apply(lambda x: (x == 'did not attend').mean() * 100).reset_index(name='no_show_rate')
    no_show_by_interval['scheduling_interval_bin'] = no_show_by_interval['scheduling_interval_bin'].astype(str)
    
    return {
        "daily_attendance": attendance.to_dict(orient='records'),
        "no_show_by_time": no_show_by_time.to_dict(orient='records'),
        "no_show_by_interval": no_show_by_interval.to_dict(orient='records')
    }

@app.get("/patient_demographics")
async def get_patient_demographics():
    """Get patient demographics insights"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    # Age and sex distribution
    age_sex_dist = df.groupby(['age_group', 'sex_x']).size().unstack(fill_value=0).reset_index()
    
    # No-show by age and sex
    no_show_age_sex = df.groupby(['age_group', 'sex_x'])['status'].apply(lambda x: (x == 'did not attend').mean() * 100).unstack(fill_value=0).reset_index()
    
    # Insurance patterns
    insurance_stats = df.groupby('insurance')['status'].apply(lambda x: (x == 'did not attend').mean() * 100).reset_index(name='no_show_rate')
    
    return {
        "age_sex_distribution": age_sex_dist.to_dict(orient='records'),
        "no_show_age_sex": no_show_age_sex.to_dict(orient='records'),
        "insurance_stats": insurance_stats.to_dict(orient='records')
    }

@app.get("/operational_efficiency")
async def get_operational_efficiency():
    """Get operational efficiency metrics"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    # Filter only attended appointments
    attended = df[df['status'] == 'attended'].copy()
    
    # Calculate time differences in minutes
    attended['waiting_minutes'] = attended['waiting_time']
    attended['duration_minutes'] = attended['appointment_duration']
    
    # Waiting time analysis
    waiting_stats = attended.groupby('appointment_date')['waiting_minutes'].mean().reset_index()
    
    # Duration analysis
    duration_stats = attended.groupby('doctor_specialty')['duration_minutes'].agg(['mean', 'median', 'std']).reset_index()
    
    # Check-in time analysis
    attended['scheduled_time'] = pd.to_datetime(attended['appointment_time'].astype(str))
    attended['actual_check_in'] = pd.to_datetime(attended['check_in_time'].astype(str))
    attended['check_in_diff'] = (attended['actual_check_in'] - attended['scheduled_time']).dt.total_seconds() / 60
    
    check_in_stats = attended.groupby('appointment_date')['check_in_diff'].mean().reset_index()
    
    return {
        "waiting_stats": waiting_stats.to_dict(orient='records'),
        "duration_stats": duration_stats.to_dict(orient='records'),
        "check_in_stats": check_in_stats.to_dict(orient='records')
    }

@app.get("/slot_availability")
async def get_slot_availability():
    """Get slot availability analysis"""
    if not data_loaded:
        raise HTTPException(status_code=500, detail="Data files not loaded")
    
    # Compare booked slots with availability
    slot_availability = slots.groupby(['appointment_date', 'is_available']).size().unstack(fill_value=0).reset_index()
    slot_availability['utilization'] = slot_availability[False] / (slot_availability[False] + slot_availability[True]) * 100
    
    # By time of day
    slots['hour'] = pd.to_datetime(slots['appointment_time'].astype(str)).dt.hour
    availability_by_hour = slots.groupby(['hour', 'is_available']).size().unstack(fill_value=0).reset_index()
    availability_by_hour['utilization'] = availability_by_hour[False] / (availability_by_hour[False] + availability_by_hour[True]) * 100
    
    return {
        "daily_availability": slot_availability.to_dict(orient='records'),
        "hourly_availability": availability_by_hour.to_dict(orient='records')
    }