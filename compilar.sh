 #!/bin/bash

  echo Script para complilar otranscribe
  
  make build_prod

  sshpass -p "c4rl0s2307" rsync -avzh /home/ubuntu/minutado/dist root@trunk.tebascms.com:/var/www/html/
  
  