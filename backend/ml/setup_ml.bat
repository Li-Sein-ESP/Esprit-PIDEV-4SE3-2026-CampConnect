@echo off
echo ==========================================
echo CampConnect ML Environment Setup
echo ==========================================

cd /d "%~dp0"

echo [1/3] Creating virtual environment...
set PYTHON_CMD=C:\Users\lenovo\anaconda3\python.exe

if not exist "%PYTHON_CMD%" (
    set PYTHON_CMD=python
)

"%PYTHON_CMD%" -m venv .venv

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment. 
    echo Python was not found in PATH and Anaconda was not found at default location.
    echo Please install Python or update the path in this script.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Activating virtual environment and installing dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Verification...
python moderation\predict_moderation.py --help

echo.
echo ==========================================
echo SUCCESS! ML environment is ready.
echo.
echo IMPORTANT: In your IDE (IntelliJ/WebStorm):
echo 1. Go to Settings > Languages > Python
echo 2. Set the interpreter to:
echo    %~dp0.venv\Scripts\python.exe
echo ==========================================
pause
