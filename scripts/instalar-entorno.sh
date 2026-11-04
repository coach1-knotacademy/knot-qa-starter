#!/usr/bin/env bash
# Instala el entorno del Bootcamp QA en macOS con Homebrew. Solo instala lo que falta.
# Uso, desde la raíz del repo:
#   ./scripts/instalar-entorno.sh [playwright|java|ambos] [--sin-proyecto] [--simular]
# En Windows usa scripts\instalar-entorno.ps1. En Linux, sigue docs/instalacion.md.
set -u

track=""; sin_proyecto=0; simular=0; pendientes=0
for arg in "$@"; do
  case "$arg" in
    java|playwright|ambos) track="$arg" ;;
    --sin-proyecto) sin_proyecto=1 ;;
    --simular) simular=1 ;;
    *) echo "Opción desconocida: $arg"; exit 2 ;;
  esac
done

if [ "$(uname -s)" != "Darwin" ]; then
  echo "Este instalador es para macOS. En Linux sigue docs/instalacion.md o usa Codespaces."
  exit 1
fi
if ! command -v brew >/dev/null 2>&1; then
  echo "🔴 Falta Homebrew. Instálalo desde https://brew.sh y corre este script de nuevo."
  exit 1
fi

if [ -z "$track" ]; then
  printf '¿Qué track vas a usar?\n  1) TypeScript + Playwright (recomendado)\n  2) Java + Selenium\n  3) Los dos\n'
  read -r -p 'Escribe 1, 2 o 3 (Enter = 1): ' opcion
  case "$opcion" in
    ""|1) track=playwright ;; 2) track=java ;; 3) track=ambos ;;
    *) echo "Opción no válida."; exit 2 ;;
  esac
fi

instalar() { # descripción, argumentos de brew
  local nombre="$1"; shift
  if [ "$simular" = 1 ]; then echo "   (simulado) brew install $*"; return 0; fi
  echo "   Instalando $nombre..."
  brew install "$@" || { echo "🔴 No se pudo instalar $nombre"; pendientes=$((pendientes+1)); return 1; }
}

version_major() { # comando; vacío si no está disponible
  local salida
  salida=$(eval "$1" 2>&1) || return 0
  echo "$salida" | grep -Eo '[0-9]+(\.[0-9]+)+' | head -1 | cut -d. -f1
}

asegurar() { # nombre, comando de versión, mínimo, argumentos de brew
  local nombre="$1" cmd="$2" min="$3"; shift 3
  local v; v=$(version_major "$cmd")
  if [ -n "$v" ] && { [ -z "$min" ] || [ "$v" -ge "$min" ]; }; then
    echo "🟢 $nombre ya está instalado (versión $v)"; return 0
  fi
  [ -n "$v" ] && echo "🟡 $nombre $v es muy antiguo: se necesita $min o superior"
  instalar "$nombre" "$@"
}

echo "== Comunes =="
asegurar "Git" "git --version" "" git
if command -v code >/dev/null 2>&1 || [ -d "/Applications/Visual Studio Code.app" ]; then
  echo "🟢 VS Code ya está instalado"
else
  instalar "VS Code" --cask visual-studio-code
fi

if [ "$track" != "java" ]; then
  echo "== Track Playwright =="
  v=$(version_major "node -v")
  if [ -n "$v" ] && [ "$v" -ge 20 ]; then
    echo "🟢 Node.js ya está instalado (versión $v)"
  elif instalar "Node.js 22" node@22 && [ "$simular" = 0 ]; then
    # node@22 es keg-only: sin este enlace, el comando node no queda en el PATH.
    brew link --overwrite --force node@22 || { echo "🔴 No se pudo enlazar node@22"; pendientes=$((pendientes+1)); }
  fi
fi

if [ "$track" != "playwright" ]; then
  echo "== Track Java + Selenium =="
  asegurar "Java" "java -version" 17 --cask temurin@21
  asegurar "Maven" "mvn -v" 3 maven
  if [ -d "/Applications/Google Chrome.app" ]; then
    echo "🟢 Google Chrome ya está instalado"
  else
    instalar "Google Chrome" --cask google-chrome
  fi
fi

if [ "$simular" = 1 ]; then echo; echo "Simulación terminada: no se instaló nada."; exit 0; fi

if ! git config --global user.name >/dev/null 2>&1; then
  echo "== Identidad de Git (se usa en cada commit) =="
  read -r -p 'Tu nombre: ' nombre && [ -n "$nombre" ] && git config --global user.name "$nombre"
  read -r -p 'Tu correo: ' correo && [ -n "$correo" ] && git config --global user.email "$correo"
fi

raiz="$(cd "$(dirname "$0")/.." && pwd)"
if [ "$sin_proyecto" = 0 ] && [ "$pendientes" = 0 ]; then
  if [ "$track" != "java" ]; then
    echo "== Prueba de humo: Playwright =="
    (cd "$raiz/ts-playwright" && npm ci --no-audit --no-fund && npx playwright install chromium && npm run test:unit) \
      && echo "🟢 npm run test:unit" \
      || { echo "🔴 Falló la prueba de humo de Playwright"; pendientes=$((pendientes+1)); }
  fi
  if [ "$track" != "playwright" ]; then
    echo "== Prueba de humo: Java (la primera vez tarda de 2 a 5 minutos) =="
    (cd "$raiz/java-selenium" && mvn -q test -Dgroups=unit) && echo "🟢 mvn test -Dgroups=unit" \
      || { echo "🔴 Falló mvn test -Dgroups=unit"; pendientes=$((pendientes+1)); }
  fi
fi

echo
if [ "$pendientes" -gt 0 ]; then
  echo "Quedaron $pendientes pendientes. Pega este resultado en el chat del curso. Si no se resuelve en 5 minutos, usa Codespaces."
  exit 1
fi
echo "Listo. Abre una terminal nueva y corre ./scripts/verificar-entorno.sh"
