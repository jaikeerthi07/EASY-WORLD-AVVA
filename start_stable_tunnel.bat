@echo off
color 0b
echo ========================================================
echo        EHS AVVA INVENTORY - 24hr STABLE TUNNEL
echo ========================================================
echo.
echo Please choose your tunnel provider:
echo.
echo 1. Cloudflare (Recommended since it's already installed)
echo 2. Ngrok (Requires downloading ngrok)
echo.
set /p choice="Enter 1 or 2: "

if "%choice%"=="1" goto cloudflare
if "%choice%"=="2" goto ngrok
goto end

:cloudflare
echo.
echo [1] Authenticating Cloudflare...
echo A browser window will open. Please login to your Cloudflare account and authorize.
cloudflared tunnel login
echo.
echo [2] Starting Stable 24hr Tunnel...
cloudflared tunnel --url http://127.0.0.1:5000
goto end

:ngrok
echo.
echo [1] Please download ngrok from https://ngrok.com/download
echo [2] Install it and get your Auth Token from the dashboard.
echo.
set /p authtoken="Paste your Ngrok Auth Token here: "
ngrok config add-authtoken %authtoken%
echo.
echo [3] Starting Ngrok Tunnel...
ngrok http 5000
goto end

:end
pause
