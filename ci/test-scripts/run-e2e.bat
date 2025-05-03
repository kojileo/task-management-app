@echo off
echo Running E2E tests...

cd %~dp0..\..
cd e2e

echo Installing dependencies...
call npm install

echo Running tests...
call npm test

echo Test execution completed with exit code %ERRORLEVEL%

cd ..
exit /b %ERRORLEVEL% 