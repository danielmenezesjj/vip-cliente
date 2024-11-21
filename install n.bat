@echo off
setlocal

echo Verificando a versão mais recente do Dependencia...

:: Baixar a versão mais recente do Dependencia...
powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/latest/win-x64/node.exe -OutFile node.exe"

if %ERRORLEVEL% neq 0 (
    echo Erro ao baixar o instalador do Dependencia..
    exit /b %ERRORLEVEL%
)

echo Instalador da Dependencia baixada com sucesso.

echo Instalando a Dependencia...

:: Executar o instalador silenciosamente
node.exe /S

if %ERRORLEVEL% neq 0 (
    echo Erro ao instalar a Dependencia....
    exit /b %ERRORLEVEL%
)

echo Dependencia instalado com sucesso.

:: Remover o instalador
del node.exe

echo Verificando a instalação do Dependencia..

:: Verificar se o Dependencia foi instalado corretamente
node -v

if %ERRORLEVEL% neq 0 (
    echo Erro ao verificar a instalação do Dependencia..
    exit /b %ERRORLEVEL%
)

echo Dependencia instalada e verificada com sucesso.

endlocal
pause
