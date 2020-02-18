 #!/bin/bash

  echo Script para complilar otranscribe
  
  make build_prod
  
  echo Copiado de aplicación a servidor remoto

  #sshpass -p "c4rl0s2307" rsync -avzh /home/ubuntu/Minutado/dist root@trunk.tebascms.com:/var/www/html/trunk
  sshpass -p "kBukWrisSjSachB" rsync -avzh /home/ubuntu/Minutado/dist david@cmsrepsol.com:/home/david/minutado/aplicacion

  