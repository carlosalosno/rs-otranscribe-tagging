 #!/bin/bash

  echo Script para complilar otranscribe
  
  make build_prod

  sshpass -p "c4rl0s2307" rsync -rva /home/ubuntu/oTranscribe-master/dist root@145.239.198.68:/var/www/html/
  
  