@echo off
cd /d "C:\Windows\IFN"
powershell -WindowStyle Hidden -Command "Start-Process 'npm' -ArgumentList 'start' -WindowStyle Hidden"
