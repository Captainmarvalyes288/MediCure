# frontend/app.py
import streamlit as st
import pandas as pd
import requests
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# Configuration
st.set_page_config(layout="wide", page_title="Appointment Analytics Dashboard")
API_BASE_URL = "http://localhost:8000"

# Initialize session state for data caching if not already present
if 'data_cache' not in st.session_state:
    st.session_state.data_cache = {}
if 'last_tab' not in st.session_state:
    st.session_state.last_tab = None

# Helper functions
@st.cache_data(ttl=300)  # Cache data for 5 minutes
def fetch_data(endpoint):
    """Fetch data from API with caching"""
    try:
        # Check session state cache first
        if endpoint in st.session_state.data_cache:
            return st.session_state.data_cache[endpoint]
        
        # If not in cache, fetch from API
        response = requests.get(f"{API_BASE_URL}/{endpoint}")
        response.raise_for_status()
        data = response.json()
        
        # Store in session state cache
        st.session_state.data_cache[endpoint] = data
        return data
    except requests.exceptions.RequestException as e:
        st.error(f"Error fetching data: {e}")
        return None

# Create a loading spinner for the entire app
with st.spinner("Loading dashboard data..."):
    # Check API availability first
    try:
        root_response = requests.get(f"{API_BASE_URL}/")
        api_available = True
    except:
        api_available = False
        st.error("⚠️ API server is not responding. Please check if the backend service is running.")

    # Dashboard layout
    st.title("Healthcare Appointment Analytics Dashboard")

    # Tabs for different analysis sections
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "Appointment Volume", 
        "Slot Utilization", 
        "Attendance Patterns", 
        "Patient Demographics", 
        "Operational Efficiency", 
        "Slot Availability"
    ])

    # Only proceed with data loading if API is available
    if api_available:
        # Tab 1: Appointment Volume
        with tab1:
            st.header("Appointment Volume Analysis")
            
            # Only load data when this tab is active for the first time or parameters change
            timeframe = st.selectbox("Select Timeframe", ["day", "week", "month"], key="timeframe")
            
            # Check if we need to reload data
            endpoint = f"appointment_volume?timeframe={timeframe}"
            
            # Only fetch data when needed
            if st.session_state.last_tab != "tab1" or f"appointment_volume?timeframe={timeframe}" not in st.session_state.data_cache:
                with st.spinner("Loading appointment volume data..."):
                    volume_data = fetch_data(endpoint)
                    st.session_state.last_tab = "tab1"
            else:
                volume_data = st.session_state.data_cache[endpoint]
            
            if volume_data:
                df_volume = pd.DataFrame(volume_data)
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader(f"Appointments by {timeframe.capitalize()}")
                    if timeframe == 'day':
                        fig = px.line(df_volume, x='appointment_date', y='count', 
                                    title=f"Daily Appointment Volume")
                    elif timeframe == 'week':
                        fig = px.bar(df_volume, x='date', y='count', 
                                    title="Weekly Appointment Volume")
                    else:  # month
                        fig = px.bar(df_volume, x='date', y='count', 
                                    title="Monthly Appointment Volume")
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    st.subheader("Statistics")
                    st.metric("Total Appointments", df_volume['count'].sum())
                    st.metric("Average Daily Appointments", round(df_volume['count'].mean(), 1))
                    
                    if timeframe == 'day':
                        peak_day = df_volume.loc[df_volume['count'].idxmax()]
                        st.metric("Peak Day", 
                                f"{peak_day['appointment_date']} ({peak_day['count']} appointments)")

        # Tab 2: Slot Utilization
        with tab2:
            st.header("Slot Utilization Analysis")
            
            # Only fetch data when this tab is selected
            if st.session_state.last_tab != "tab2":
                with st.spinner("Loading slot utilization data..."):
                    util_data = fetch_data("slot_utilization")
                    st.session_state.last_tab = "tab2"
            else:
                util_data = st.session_state.data_cache.get("slot_utilization")
            
            if util_data:
                df_slot_usage = pd.DataFrame(util_data["slot_usage"])
                df_no_show = pd.DataFrame(util_data["no_show_by_slot"])
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Slot Utilization Rates")
                    fig = px.bar(df_slot_usage, x='appointment_time', y='utilization_rate',
                                title="Slot Utilization by Time of Day")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    avg_util = df_slot_usage['utilization_rate'].mean()
                    st.metric("Average Utilization Rate", f"{avg_util:.1f}%")
                
                with col2:
                    st.subheader("No-Show Rates by Time Slot")
                    fig = px.bar(df_no_show, x='appointment_time', y='no_show_rate',
                                title="No-Show Rates by Appointment Time")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    avg_no_show = df_no_show['no_show_rate'].mean()
                    st.metric("Average No-Show Rate", f"{avg_no_show:.1f}%")

        # Tab 3: Attendance Patterns
        with tab3:
            st.header("Attendance Patterns")
            
            # Only fetch data when this tab is selected
            if st.session_state.last_tab != "tab3":
                with st.spinner("Loading attendance pattern data..."):
                    attend_data = fetch_data("attendance_patterns")
                    st.session_state.last_tab = "tab3"
            else:
                attend_data = st.session_state.data_cache.get("attendance_patterns")
            
            if attend_data:
                df_daily = pd.DataFrame(attend_data["daily_attendance"])
                df_time = pd.DataFrame(attend_data["no_show_by_time"])
                df_interval = pd.DataFrame(attend_data["no_show_by_interval"])
                
                st.subheader("Daily Attendance Patterns")
                fig = px.line(df_daily, x='appointment_date', y=['attended', 'did not attend'],
                            title="Daily Appointment Attendance")
                st.plotly_chart(fig, use_container_width=True)
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("No-Show Rates by Time of Day")
                    fig = px.bar(df_time, x='time_of_day_category', y='no_show_rate',
                                title="No-Show Rates by Time of Day")
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    st.subheader("No-Show Rates by Scheduling Interval")
                    fig = px.bar(df_interval, x='scheduling_interval_bin', y='no_show_rate',
                                title="No-Show Rates by Scheduling Interval (Days)")
                    st.plotly_chart(fig, use_container_width=True)

        # Tab 4: Patient Demographics
        with tab4:
            st.header("Patient Demographics")
            
            # Only fetch data when this tab is selected
            if st.session_state.last_tab != "tab4":
                with st.spinner("Loading patient demographics data..."):
                    demo_data = fetch_data("patient_demographics")
                    st.session_state.last_tab = "tab4"
            else:
                demo_data = st.session_state.data_cache.get("patient_demographics")
            
            if demo_data:
                df_age_sex = pd.DataFrame(demo_data["age_sex_distribution"])
                df_no_show = pd.DataFrame(demo_data["no_show_age_sex"])
                df_insurance = pd.DataFrame(demo_data["insurance_stats"])
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Age and Sex Distribution")
                    fig = px.bar(df_age_sex, x='age_group', y=['Female', 'Male'],
                                barmode='group', title="Appointments by Age Group and Sex")
                    st.plotly_chart(fig, use_container_width=True)
                
                with col2:
                    st.subheader("No-Show Rates by Age and Sex")
                    fig = px.bar(df_no_show, x='age_group', y=['Female', 'Male'],
                                barmode='group', title="No-Show Rates by Age Group and Sex")
                    st.plotly_chart(fig, use_container_width=True)
                
                st.subheader("No-Show Rates by Insurance Provider")
                fig = px.bar(df_insurance, x='insurance', y='no_show_rate',
                            title="No-Show Rates by Insurance Provider")
                st.plotly_chart(fig, use_container_width=True)

        # Tab 5: Operational Efficiency
        with tab5:
            st.header("Operational Efficiency")
            
            # Only fetch data when this tab is selected
            if st.session_state.last_tab != "tab5":
                with st.spinner("Loading operational efficiency data..."):
                    op_data = fetch_data("operational_efficiency")
                    st.session_state.last_tab = "tab5"
            else:
                op_data = st.session_state.data_cache.get("operational_efficiency")
            
            if op_data:
                df_waiting = pd.DataFrame(op_data["waiting_stats"])
                df_duration = pd.DataFrame(op_data["duration_stats"])
                df_check_in = pd.DataFrame(op_data["check_in_stats"])
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Average Waiting Time Trend")
                    fig = px.line(df_waiting, x='appointment_date', y='waiting_minutes',
                                title="Daily Average Waiting Time (minutes)")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    avg_wait = df_waiting['waiting_minutes'].mean()
                    st.metric("Average Waiting Time", f"{avg_wait:.1f} minutes")
                
                with col2:
                    st.subheader("Appointment Duration by Specialty")
                    fig = px.bar(df_duration, x='doctor_specialty', y='mean',
                                title="Average Appointment Duration by Specialty (minutes)")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    avg_duration = df_duration['mean'].mean()
                    st.metric("Average Duration", f"{avg_duration:.1f} minutes")
                
                st.subheader("Check-In Time Differences")
                fig = px.line(df_check_in, x='appointment_date', y='check_in_diff',
                            title="Daily Average Check-In Time Difference (minutes)")
                st.plotly_chart(fig, use_container_width=True)

        # Tab 6: Slot Availability
        with tab6:
            st.header("Slot Availability")
            
            # Only fetch data when this tab is selected
            if st.session_state.last_tab != "tab6":
                with st.spinner("Loading slot availability data..."):
                    avail_data = fetch_data("slot_availability")
                    st.session_state.last_tab = "tab6"
            else:
                avail_data = st.session_state.data_cache.get("slot_availability")
            
            if avail_data:
                df_daily = pd.DataFrame(avail_data["daily_availability"])
                df_hourly = pd.DataFrame(avail_data["hourly_availability"])
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Daily Slot Utilization")
                    fig = px.line(df_daily, x='appointment_date', y='utilization',
                                title="Daily Slot Utilization Rate")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    avg_util = df_daily['utilization'].mean()
                    st.metric("Average Utilization Rate", f"{avg_util:.1f}%")
                
                with col2:
                    st.subheader("Hourly Slot Utilization")
                    fig = px.bar(df_hourly, x='hour', y='utilization',
                                title="Slot Utilization by Hour of Day")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    peak_hour = df_hourly.loc[df_hourly['utilization'].idxmax()]
                    st.metric("Peak Utilization Hour", 
                            f"{int(peak_hour['hour'])}:00 ({peak_hour['utilization']:.1f}%)")

        # Refresh data button
        if st.button("🔄 Refresh All Data"):
            # Clear the cache
            st.session_state.data_cache = {}
            st.success("Cache cleared. Data will be refreshed on next interaction.")

# Footer
st.markdown("---")
st.markdown("**Healthcare Appointment Analytics Dashboard** - Powered by Streamlit and FastAPI")