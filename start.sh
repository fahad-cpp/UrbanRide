alacritty -e bash -i -c 'npm run dev' &

cd backend

alacritty -e bash -i -c 'npm start' &

cd ..

librewolf "http://localhost:5173/"
