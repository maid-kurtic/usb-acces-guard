@echo off
cd C:\Users\Administrator\Desktop\usb-access-guard
powershell -Command "Start-Process 'C:\Program Files\nodejs\node.exe' -ArgumentList 'server.js' -Verb RunAs"
