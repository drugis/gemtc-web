# rancher kubectl create -f k8s/namespace.yaml #namespace creation works only through GUI for now

rancher kubectl delete secret gemtc-secrets -n drugis
rancher kubectl create secret generic gemtc-secrets \
  -n drugis \
  --from-literal=GEMTC_COOKIE_SECRET=GDFBDF#$%*asdfg098 \
  --from-literal=GEMTC_GOOGLE_SECRET=WFU_VvlxrsyNLVUDkkTVgvfQ \
  --from-literal=GEMTC_GOOGLE_KEY=290619536014-abnf3o5knc423o0n25939ql4ga0m0809.apps.googleusercontent.com

rancher kubectl delete secret db-credentials -n drugis
rancher kubectl create secret generic db-credentials \
  -n drugis \
  --from-literal=POSTGRES_PASSWORD=develop \
  --from-literal=PATAVI_DB_PASSWORD=develop \
  --from-literal=GEMTC_DB_PASSWORD=develop

rancher kubectl delete configmap gemtc-settings -n drugis
rancher kubectl create configmap gemtc-settings \
  -n drugis \
  --from-literal=GEMTC_AUTHENTICATION_METHOD=GOOGLE \
  --from-literal=GEMTC_DB_USERNAME=gemtc \
  --from-literal=GEMTC_DB=gemtc \
  --from-literal=GEMTC_HOST=https://gemtc.edge.molgenis.org \
  --from-literal=DB_HOST=postgres \
  --from-literal=PATAVI_HOST=patavi.edge.molgenis.org \
  --from-literal=SECURE_TRAFFIC=true

rancher kubectl delete secret passwords -n drugis
rancher kubectl create secret generic passwords \
 -n drugis \
 --from-literal=rabbit-password=develop \
 --from-literal=PATAVI_API_KEY=coolkeybro

rancher kubectl delete configmap patavi-settings -n drugis
rancher kubectl create configmap patavi-settings \
  -n drugis \
  --from-literal=PATAVI_DB_HOST=postgres \
  --from-literal=PATAVI_DB_NAME=patavi \
  --from-literal=PATAVI_DB_USER=patavi \
  --from-literal=PATAVI_PORT=3000 \
  --from-literal=PATAVI_HOST=patavi.edge.molgenis.org \
  --from-literal=PATAVI_BROKER_HOST=guest:develop@rabbitmq \
  --from-literal=PATAVI_BROKER_USER=guest \
  --from-literal=PATAVI_BROKER_PASSWORD=develop \
  --from-literal=SECURE_TRAFFIC=true \
  --from-literal=PATAVI_PROXY_HOST=patavi.edge.molgenis.org 

rancher kubectl apply -f postgres.yaml #not 100%, does not include pv and pv claim, those were done manually
rancher kubectl apply -f rabbitmq.yaml
rancher kubectl apply -f patavi-server.yaml
rancher kubectl apply -f patavi-db-init.yaml
rancher kubectl apply -f patavi-smaa-worker.yaml
rancher kubectl apply -f patavi-gemtc-worker.yaml
rancher kubectl apply -f gemtc-db-init.yaml
rancher kubectl apply -f gemtc.yaml
