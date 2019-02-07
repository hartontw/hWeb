#!/bin/bash
cd /
cd home
cd harton
cd projects
cd hWeb
clear
echo "------------------------"
echo "||||||||| hWeb |||||||||"
echo "------------------------"
echo ""
echo "> Stopping process..."
echo ""
pm2 stop index.js
echo ""
echo "------------------------"
echo ""
echo "> Pulling changes..."
echo ""
git pull
echo ""
echo "------------------------"
echo ""
echo "> Building modules..."
echo ""
npm install
echo "------------------------"
echo ""
echo "> Starting process..."
echo ""
PORT=3000 PASS="production" pm2 start index.js
echo ""
echo "------------------------"
echo ""