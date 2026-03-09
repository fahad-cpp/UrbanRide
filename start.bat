@echo off
start "" npm run dev

pushd backend
start "" npm start
popd

start "" "http://localhost:5173"