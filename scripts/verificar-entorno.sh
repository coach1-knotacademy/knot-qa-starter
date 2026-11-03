#!/usr/bin/env bash
# Verifica el entorno para el Bootcamp QA (macOS / Linux). No instala nada.
ok=0; warn=0
check() { # nombre, comando, versión mínima (major)
  local name="$1" cmd="$2" min="$3" out ver
  if out=$(eval "$cmd" 2>&1); then
    ver=$(echo "$out" | grep -Eo '[0-9]+(\.[0-9]+)+' | head -1)
    if [ -n "$min" ] && [ "${ver%%.*}" -lt "$min" ] 2>/dev/null; then
      echo "🟡 $name $ver (se necesita $min+)"; warn=$((warn+1))
    else
      echo "🟢 $name $ver"; ok=$((ok+1))
    fi
  else
    echo "🔴 $name no encontrado"; warn=$((warn+1))
  fi
}
echo "== Común =="
check "Git" "git --version" ""
echo "== Track A · Java + Selenium =="
check "Java" "java -version" 17
check "Maven" "mvn -v" 3
if [ -d "/Applications/Google Chrome.app" ] || command -v google-chrome >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1; then
  echo "🟢 Chrome"; else echo "🟡 Chrome no encontrado (Selenium Manager intentará descargarlo)"; fi
echo "== Track B · TypeScript + Playwright =="
check "Node" "node -v" 20
check "npm" "npm -v" ""
echo "== Red =="
for u in https://repo.maven.apache.org/maven2/ https://registry.npmjs.org/ https://www.saucedemo.com https://dummyjson.com/products/1; do
  if curl -s -m 8 -o /dev/null "$u"; then echo "🟢 $u"; else echo "🔴 $u (¿proxy?)"; fi
done
[ -n "$HTTPS_PROXY$https_proxy" ] && echo "ℹ️  Proxy detectado: ${HTTPS_PROXY:-$https_proxy}"
echo
echo "Con que uno de los dos tracks esté en 🟢 es suficiente. Pega este resultado en el chat si ves 🔴."
