start "vite server" npm run dev

pushd backend
start "node server" npm start
popd

start "" "http://localhost:5173"