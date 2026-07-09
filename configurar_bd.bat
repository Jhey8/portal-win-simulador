@echo off
title Configuracion de Base de Datos - Portal WIN Internet
color 0e

echo =================================================================
echo   Configuracion inicial de la base de datos (MySQL / MariaDB)
echo =================================================================
echo.
echo   Este script crea las tablas y carga los datos de demostracion.
echo   Ejecutalo UNA SOLA VEZ (o cuando quieras reiniciar los datos).
echo.
echo   Requiere que MySQL de XAMPP este ENCENDIDO en el panel de control.
echo.
pause

REM --- Localizar el cliente mysql de XAMPP (ajusta la ruta si tu XAMPP esta en otra unidad) ---
set "MYSQL_EXE="
if exist "D:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=D:\xampp\mysql\bin\mysql.exe"
if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"

if "%MYSQL_EXE%"=="" (
    echo [x] No se encontro mysql.exe de XAMPP en C:\xampp ni D:\xampp.
    echo     Edita este archivo y ajusta la variable MYSQL_EXE con la ruta correcta.
    pause
    exit /b 1
)

echo.
echo [+] Creando la base de datos y las tablas desde esquema.sql...
"%MYSQL_EXE%" -u root < esquema.sql
if %errorlevel% neq 0 (
    echo [x] Error al ejecutar esquema.sql. Verifica que MySQL este encendido.
    pause
    exit /b %errorlevel%
)

echo.
echo [+] Instalando dependencias (si faltan)...
call npm install

echo.
echo [+] Cargando datos de demostracion con contrasenas cifradas (bcrypt)...
call npm run sembrar
if %errorlevel% neq 0 (
    echo [x] Error al sembrar los datos.
    pause
    exit /b %errorlevel%
)

echo.
echo =================================================================
echo   Base de datos lista. Ya puedes ejecutar "iniciar.bat".
echo =================================================================
pause
