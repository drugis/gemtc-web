#! /bin/bash

function checkSuccess {
rc=$?
 if [[ $rc != 0 ]] ; then
   echo 'Could not perform' $1;
   echo "Gemtc has not been deployed, Could not perform" $1 | sendxmpp -t -u addistestuser1 -o gmail.com osmosisch;
   exit $rc
 fi
}

echo "pull latest from drugis"
ssh deploy@box009.drugis.org 'cd gemtc-web && git pull'
checkSuccess 'pull latest from drugis'
wait
echo "build docker container in test server, using ssh "
ssh deploy@box009.drugis.org 'cd gemtc-web && docker build --tag gemtc-web .'
checkSuccess 'build docker image'
wait
echo "stop docker container"
ssh deploy@box009.drugis.org 'docker stop gemtc'
checkSuccess 'stop docker container'
wait
echo "delete docker container"
ssh deploy@box009.drugis.org 'docker rm gemtc'
checkSuccess 'remove docker container'
wait
ssh deploy@box009.drugis.org 'gemtc-web/run-gemtc.sh'
checkSuccess 'run gemtc'
wait
echo "deployment completed"
wait
echo "Gemtc-web has been deployed to https://gemtc.drugis.org" | sendxmpp -t -u addistestuser1 -o gmail.com osmosisch
