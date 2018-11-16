export RESOURCE_GROUP=addis-resources
export VM_NAME=gemtc

az group create --location westeurope --name $RESOURCE_GROUP

 az vm create \
   -n $VM_NAME \
   -g $RESOURCE_GROUP \
   --image Canonical:UbuntuServer:18.04-LTS:18.04.201811010 \
   --custom-data cloud-init.yaml \
   --ssh-key-value @/home/daan/.ssh/id_rsa.pub \
   --public-ip-address-dns-name $VM_NAME \
   --generate-ssh-keys \
   --admin-username azureuser 

az vm open-port -g $RESOURCE_GROUP -n $VM_NAME --port 80 
az vm open-port -g $RESOURCE_GROUP -n $VM_NAME --port 443  --priority 901
az vm open-port -g $RESOURCE_GROUP -n $VM_NAME --port 3000 --priority 902
