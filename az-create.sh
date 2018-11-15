 az vm create \
   -n gemtc \
   -g addis-resources \
   --image Canonical:UbuntuServer:18.04-LTS:18.04.201811010 \
   --custom-data cloud-init.yaml \
   --ssh-key-value @/home/daan/.ssh/id_rsa.pub \
   --public-ip-address-dns-name gemtc \
   --generate-ssh-keys \
   --admin-username azureuser 

az vm open-port -g addis-resources -n gemtc --port 80 --port 443 --port 3000
