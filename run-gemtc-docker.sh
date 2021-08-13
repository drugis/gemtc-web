ATHENTICATION_METHOD="$1"
docker run -d \
 --link postgres \
 --link patavi-server:localdocker \
 -p 3001:3001 \
 --name gemtc \
 -e DB_HOST=postgres \
 -e GEMTC_GOOGLE_KEY=221368301791-7ark4468l8p2tt9sc5dvr9bb36si181h.apps.googleusercontent.com \
 -e GEMTC_GOOGLE_SECRET=Ju9grxy6LU72NlyHUUZ1xjDd \
 -e GEMTC_COOKIE_SECRET=GDFBDF#$%*asdfg098 \
 -e GEMTC_DB=gemtc \
 -e GEMTC_HOST=http://localhost:3001 \
 -e GEMTC_DB_USERNAME=gemtc \
 -e GEMTC_DB_PASSWORD=develop \
 -e GEMTC_AUTHENTICATION_METHOD=$ATHENTICATION_METHOD \
 -e PATAVI_HOST=localdocker \
 -e SECURE_TRAFFIC=false \ 
 -e PATAVI_API_KEY=someToken \
  addis/gemtc
