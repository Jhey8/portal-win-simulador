@echo off
title Servidor - Portal de Autogestion WIN Internet
color 0a

echo =================================================================
echo   Iniciando el Portal de Autogestion de WIN Internet
echo =================================================================
echo.
echo   IMPORTANTE:
echo   - Asegurate de que MySQL de XAMPP este ENCENDIDO.
echo   - Si es la primera vez, ejecuta antes "configurar_bd.bat".
echo.

echo [+] Verificando e instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [x] Error al instalar las dependencias de Node.js.
    pause
    exit /b %errorlevel%
)

echo.
echo [+] Levantando el servidor local en el puerto 3005...
set PUERTO=3005
start "" "http://localhost:3005"
call npm start
if %errorlevel% neq 0 (
    echo.
    echo [x] El servidor se ha detenido inesperadamente.
    pause
)
