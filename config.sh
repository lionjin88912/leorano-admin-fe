#!/bin/bash

set -x
echo  ${1}
json=$(cat "./config-example.js")


declare -a replaceKeys=(
  "api_url"

)

declare -a replaceValues=(
  "$1"

)




for ((i=0; i<${#replaceKeys[@]}; i++)); do
  rekey=${replaceKeys[$i]}
  value=${replaceValues[$i]}
  json=$(echo "$json" | sed -e "s/@${rekey}@/$(echo "${value//\//\\/}")/g")
done


echo "$json" > "./src/config/index.js"
#

cat "./src/config/index.js"
