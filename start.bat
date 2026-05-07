@echo off
echo Construyendo Frontend...
cd frontend
call npm run build
cd ..

echo.
echo Iniciando Servidor Backend y Tunel Publico...
cd backend
node server.js
pause
