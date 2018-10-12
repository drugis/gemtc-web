ATHENTICATION_METHOD="$1"
docker run -d \
 --link postgres:postgres \
 --link patavi-server:localdocker \
 -p 3001:3001 \
 --name gemtc \
 -e DB_HOST=postgres \
 -e GEMTC_GOOGLE_KEY=100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com \
 -e GEMTC_GOOGLE_SECRET=9ROcvzLDuRbITbqj-m-W5C0I \
 -e GEMTC_COOKIE_SECRET=GDFBDF#$%*asdfg098 \
 -e GEMTC_DB=gemtc \
 -e GEMTC_HOST=http://localhost:3001 \
 -e GEMTC_DB_USERNAME=gemtc \
 -e GEMTC_DB_PASSWORD=develop \
 -e GEMTC_AUTHENTICATION_METHOD=$ATHENTICATION_METHOD \
 -e PATAVI_CLIENT_CRT=ssl/crt.pem \
 -e PATAVI_CLIENT_KEY=ssl/key.pem \
 -e PATAVI_CA=ssl/ca-crt.pem \
 -e PATAVI_HOST=localdocker \
  addis/gemtc
