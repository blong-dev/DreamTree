@echo off
REM Nightly code documentation rebuild
REM Runs at 3AM Eastern via Task Scheduler

cd /d C:\dreamtree\dreamtree
python -m team.toolbox.rebuild --quiet >> "%~dp0rebuild.log" 2>&1
