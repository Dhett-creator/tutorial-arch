---
title: qBittorrent
---

Por motivos pessoais, costumo utilizar a versão do qBittorrent sem interface gráfica, pois ela permite gerenciar os torrents pela interface web — que, para mim, possui um visual muito mais agradável. Além disso, essa versão pode operar em segundo plano no sistema.

## Instalação e configuração 

Para instalar o `qbitorrent-nox`:

```bash showLineNumbers=false
$ sudo pacman -S qbittorrent-nox
```

Após a instalação, é necessário iniciar o `qbittorrent-nox` pelo terminal pela primeira vez para definir o nome de usuário e a senha que serão utilizados para acessar a interface Web do aplicativo. Para isso, execute o comando abaixo:

```bash showLineNumbers=false
$ qbittorrent-nox
```

Realizadas as configurações, feche o aplicativo utilizando apenas o atalho `Ctrl + c` no terminal e siga os passos abaixo para criar um serviço que permita ao `qbittorrent-nox` iniciar com o sistema.

Primeiro, crie o arquivo de serviço:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/qbittorrent-nox.service
```

Em seguida, copie e cole o conteúdo abaixo dentro de `qbittorrent-nox.service`:

```bash title='/etc/systemd/system/qbittorrent-nox.service' {6, 7, 11-13}
[Unit]
Description=qBittorrent Command Line Client
Wants=network-online.target
# O serviço irá iniciar apenas quando a rede estiver online e o
# disco /mnt/sdb1 estiver montado (Ajuste para o disco de sua preferência)
BindsTo=mnt-sdb1.mount
After=network-online.target mnt-sdb1.mount

[Service]
Type=exec
# IMPORTANTE: Definir o usuário e o grupo aqui
User=user
Group=group
UMask=007
# Aguarda 10 segundos para iniciar o serviço após a inicialização do sistema
ExecStartPre=/bin/sleep 10
ExecStart=/usr/bin/qbittorrent-nox -webui-port=8080
Restart=on-failure

KillSignal=SIGTERM
TimeoutStopSec=60

[Install]
WantedBy=multi-user.target
```
:::caution[ATENÇÃO]
As linhas destacadas requerem adaptação por parte do usuário. Esse mesmo padrão de destaque será utilizado ao longo deste guia para indicar as linhas de código que necessitem de alguma adaptação.
:::

Por último é necessário ativar o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```
```bash showLineNumbers=false
$ sudo systemctl enable --now qbittorrent-nox.service
```
## Automação de downloads

O qBittorrent permite o monitoramento de pastas para a adição automática de arquivos `.torrent`. No entanto, essa funcionalidade limita o monitoramento a apenas uma única pasta. Uma forma de contornar essa limitação é por meio de `scripts`, que podem ser configurados para monitorar múltiplas pastas simultaneamente.

Neste exemplo, serão monitoradas três pastas distintas. Para cada uma delas, será definido um diretório de salvamento padrão, diferente para cada categoria de conteúdo.

Primeiramente, é necessário instalar o pacote `inotify-tools`, responsável por permitir o monitoramento de múltiplas pastas no sistema:

```bash showLineNumbers=false
$ sudo pacman -S inotify-tools curl
```

Vamos supor que queremos realizar o monitoramento das seguintes pastas:

```bash showLineNumbers=false
/mnt/sdb1/Torrents/Pasta1-.torrents
/mnt/sdb1/Torrents/Pasta2-.torrents
/mnt/sdb1/Torrents/Pasta3-.torrents
```

:::caution[ATENÇÃO]
Essas pastas devem ser criadas antes de prosseguir com os passos adiante.
:::

Agora, vamos criar o `script` responsável por fazer o monitoramento dessas pastas:

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/qbit-scan.sh
```

Adicione o seguinte conteúdo ao arquivo:

```bash title='/usr/local/bin/qbit-scan.sh' {7-9, 17, 20, 21}
#!/bin/bash

# --- CONFIGURAÇÃO DE DIRETÓRIOS E CATEGORIAS ---
# Define a relação entre a pasta monitorada,
# a etiqueta (tag) e a pasta de destino
declare -A MONITOR
MONITOR["Pasta1"]="Pasta1:/mnt/sdb1/Pasta1"
MONITOR["Pasta2"]="Pasta2:/mnt/sdb1/Pasta2"
MONITOR["Pasta3"]="Pasta3:/mnt/sdb1/Pasta3"

# --- OPÇÃO DE PULAR VERIFICAÇÃO ---
# Se descomentada, o qBittorrent não checará
# o hash de arquivos que já estão no disco
#SKIP_CHECK="-F skip_checking=true"

# --- VARIÁVEIS DE CONEXÃO E AMBIENTE ---
BASE_WATCH="/mnt/sdb1/Torrents"
QBIT_HOST="http://localhost:8080"
# Coloque o usuário e a senha do qBittorrent
USERNAME="SEU_USUÁRIO"
PASSWORD="SUA_SENHA"

COOKIE_FILE="/tmp/qbit-combined.cookies"

# --- FUNÇÃO DE AUTENTICAÇÃO ---
login() {
  curl -s -i -c "$COOKIE_FILE" \
    --header "Referer: $QBIT_HOST" \
    -d "username=$USERNAME&password=$PASSWORD" \
    "$QBIT_HOST/api/v2/auth/login" > /dev/null
}

# Realiza o login inicial
login

# --- MONITORAMENTO EM TEMPO REAL ---
# MODIFICAÇÃO: Adicionado o evento 'moved_to' para suportar recortar/colar e mover arquivos
inotifywait -m -r "$BASE_WATCH" -e close_write -e moved_to |
while read path action file; do
  if [[ "$file" == *.torrent ]]; then
    # Garante que o caminho tenha a barra no final
    [[ "$path" != */ ]] && path="${path}/"
    TORRENT_PATH="${path}${file}"

    for pasta in "${!MONITOR[@]}"; do
      if [[ "$path" == *"$pasta"* ]]; then
        DADOS="${MONITOR[$pasta]}"
        TAG="${DADOS%%:*}"
        SAVE_PATH="${DADOS#*:}"

        # --- ENVIO PARA O QBITTORRENT ---
        RESPONSE=$(curl -s -b "$COOKIE_FILE" \
          --header "Referer: $QBIT_HOST" \
          -F "torrents=@$TORRENT_PATH" \
          -F "savepath=$SAVE_PATH" \
          -F "tags=$TAG" \
          ${SKIP_CHECK:-} \
          "$QBIT_HOST/api/v2/torrents/add")

        if [[ "$RESPONSE" != *"Ok"* ]]; then
          echo "Erro na resposta: $RESPONSE. Tentando re-login..."
          login
          # Segunda tentativa após re-login
          curl -s -b "$COOKIE_FILE" --header "Referer: $QBIT_HOST" \
            -F "torrents=@$TORRENT_PATH" \
            -F "savepath=$SAVE_PATH" \
            -F "tags=$TAG" \
            ${SKIP_CHECK:-} \
            "$QBIT_HOST/api/v2/torrents/add" > /dev/null
        fi

        echo "Sucesso: $file adicionado em $SAVE_PATH (Evento: $action)"
        break
      fi
    done
  fi
done
```
Conceda permissão de execução para o `script`:

```bash showLineNumbers=false
$ sudo chmod +x /usr/local/bin/qbit-scan.sh
```

Agora, crie o serviço responsável por executar o `script` na inicialização do sistema:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/qbit-scan.service
```

Adicione o seguinte conteúdo:

```bash title='/etc/systemd/system/qbit-scan.service' {8, 9}
[Unit]
Description=Monitoramento de torrents
After=qbittorrent-nox.service
Requires=qbittorrent-nox.service

[Service]
Type=simple
User=user
Group=group
ExecStart=/usr/local/bin/qbit-scan.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```
```bash showLineNumbers=false
$ sudo systemctl enable --now qbit-scan.service
```

Para checar o *status* do serviço:

```bash showLineNumbers=false
$ sudo systemctl status qbit-scan.service
```

A partir desse momento, todos os arquivos `.torrent` adicionados às pastas `Pasta1-.torrents`, `Pasta2-.torrents` e `Pasta3-.torrents` serão automaticamente importados pelo qBittorrent e terão seus downloads iniciados nos diretórios `Pasta1`, `Pasta2` e `Pasta3`, respectivamente.

:::caution[ATENÇÃO]
Com relação ao script que acabamos de criar, observe que no início há a seguinte linha comentada: `SKIP_CHECK="-F skip_checking=true"`. Essa linha é responsável por instruir o qBittorrent a pular a verificação de *hash*, sendo especialmente útil em situações em que há inúmeros arquivos já baixados e armazenados em disco e se deseja apenas retomar a atividade de *seed*. Assim, caso deseje utilizar essa funcionalidade, basta descomentar essa linha. 

Após o uso, entretanto, é fundamental comentá-la novamente, pois, caso permaneça descomentada, novos arquivos poderão passar a ser exibidos com o status `Arquivos ausentes`. Portanto, após a utilização dessa funcionalidade, comente novamente a linha e reinicie o serviço do *script*: `sudo systemctl restart qbit-scan.service`
:::

## Sistema de notificações

Por padrão, o `qbittorrent-nox` não emite notificações quando um *download* é finalizado. Para contornar essa limitação, podemos criar um *script* responsável por exibir uma notificação na área de trabalho sempre que um *download* for concluído. Aproveitando essa funcionalidade, também será criado um segundo *script* para notificar sempre que um novo *torrent* for adicionado.

Embora o `qbittorrent-nox` não disponibilize uma opção nativa de notificações, ele oferece dois campos que permitem a execução de *scripts* externos tanto após a adição de *torrents* quanto após a conclusão dos *downloads*.

Primeiramente, será criado o script responsável pela notificação de "**Download finalizado**":

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/qbit-downloaded.sh
```

Dentro do arquivo, adicione o seguinte conteúdo:

```bash title='/usr/local/bin/qbit-downloaded.sh'
#!/bin/bash

TORRENT_NAME="$1"

export DISPLAY=:0
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

/usr/bin/gdbus call --session \
  --dest org.freedesktop.Notifications \
  --object-path /org/freedesktop/Notifications \
  --method org.freedesktop.Notifications.Notify \
  "qBittorrent" \
  0 \
  "folder-download-symbolic" \
  "Download finalizado:" \
  "$TORRENT_NAME" \
  "[]" \
  "{}" \
  5000 > /dev/null
```

Em seguida, crie o script responsável pela notificação de "**Torrent adicionado**":

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/qbit-added.sh
```

Dentro do arquivo, adicione:

```bash title='/usr/local/bin/qbit-added.sh' showLineNumbers=false
#!/bin/bash

TORRENT_NAME="$1"

export DISPLAY=:0
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

/usr/bin/gdbus call --session \
  --dest org.freedesktop.Notifications \
  --object-path /org/freedesktop/Notifications \
  --method org.freedesktop.Notifications.Notify \
  "qBittorrent" \
  0 \
  "dialog-information" \
  "Torrent adicionado:" \
  "$TORRENT_NAME" \
  "[]" \
  "{}" \
  5000 > /dev/null
```

Após a criação dos arquivos, conceda permissão de execução aos *scripts* utilizando o comando:

```bash showLineNumbers=false
$ sudo chmod +x /usr/local/bin/qbit-*.sh
```

Os *scripts* podem ser testados manualmente com os comandos:

```bash showLineNumbers=false
$ /usr/local/bin/qbit-added.sh "Teste 1"
```
```bash showLineNumbers=false
$ /usr/local/bin/qbit-downloaded.sh "Teste 2"
```

Se as notificações forem exibidas corretamente, abra a *interface web* do qBittorrent e navegue até `Opções > Downloads`. Nessa janela, role até o final, onde se encontra a seção `Executar programa externo`, e marque as opções `Executar ao adicionar o torrent` e `Executar ao concluir o torrent`.

No campo logo abaixo da opção `Executar ao adicionar o torrent`, insira:

```bash showLineNumbers=false
/usr/local/bin/qbit-added.sh "%N"
```

Já no campo abaixo de `Executar ao concluir o torrent`, adicione:

```bash showLineNumbers=false
/usr/local/bin/qbit-downloaded.sh "%N"
```

Por fim, salve as alterações e teste a configuração adicionando arquivos *torrent* às pastas monitoradas. As notificações deverão ser exibidas conforme os eventos configurados.

## Exclusão automática de arquivos *.torrent*

Quando se possui múltiplos diretórios configurados para se monitorar a adição de arquivos `.torrent`, torna-se conveniente dispor de um *script* responsável por remover automaticamente aqueles arquivos `.torrent` que já não estão mais presentes no cliente *torrent*.

A proposta consiste em realizar uma varredura periódica nos *torrents* atualmente carregados no qBittorrent e compará-los com os arquivos `.torrent` existentes nos diretórios monitorados. Caso um arquivo `.torrent` não corresponda a nenhum *torrent* ativo no cliente, ele será automaticamente movido para a lixeira.

Inicialmente, instale os pacotes necessários para o funcionamento do *script*:

```bash showLineNumbers=false
$ sudo pacman -S transmission-cli trash-cli python-requests
```

Desta vez, por conveniência, iremos criar o *script* em *Python*:

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/qbit-clean.py
```

Cole o conteúdo:

```python title='/usr/local/bin/qbit-clean.py' {8-10, 16, 17}
#!/usr/bin/env python3
import os
import requests
import subprocess

# Pastas com os arquivos .torrent
TORRENT_DIRS = [
    "/mnt/md0/Torrents/Pasta1-.torrents",
    "/mnt/md0/Torrents/Pasta2-.torrents",
    "/mnt/md0/Torrents/Pasta3-.torrents",
]

API_URL = "http://localhost:8080/api/v2"

# Coloque o usuário e a senha do qBittorrent
API_USER = "SEU_USUÁRIO"
API_PASS = "SUA_SENHA"

def get_active_hashes():
    s = requests.Session()
    s.post(
        f"{API_URL}/auth/login",
        data={
            "username": API_USER,
            "password": API_PASS,
        },
    )
    torrents = s.get(f"{API_URL}/torrents/info").json()
    return {t["hash"].lower() for t in torrents}

def get_torrent_hash(filepath):
    result = subprocess.run(
        ["transmission-show", filepath],
        capture_output=True,
        text=True,
        check=True
    )
    for line in result.stdout.splitlines():
        if line.strip().startswith("Hash v1:"):
            return line.split()[2].strip().lower()
    return None

def move_to_trash(filepath):
    subprocess.run(["trash-put", filepath], check=False)

def main():
    active_hashes = get_active_hashes()
    for directory in TORRENT_DIRS:
        for file in os.listdir(directory):
            if file.endswith(".torrent"):
                path = os.path.join(directory, file)
                thash = get_torrent_hash(path)
                if thash and thash not in active_hashes:
                    move_to_trash(path)

if __name__ == "__main__":
    main()
```

Conceda permissão de execução:

```bash showLineNumbers=false
$ sudo chmod +x /usr/local/bin/qbit-clean.py
```

Crie o arquivo de serviço:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/qbit-clean.service
```

Cole o seguinte conteúdo:

```bash title='/etc/systemd/system/qbit-clean.service' {7, 8}
[Unit]
Description=Limpeza de .torrent removidos do qBittorrent (Python)
After=qbittorrent-nox.service

[Service]
Type=oneshot
User=user
Group=group
ExecStart=/usr/bin/python3 /usr/local/bin/qbit-clean.py

[Install]
WantedBy=multi-user.target
```

Para execução periódica, crie o `timer systemd`:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/qbit-clean.timer
```

Dentro desse arquivo, cole:

```bash title='/etc/systemd/system/qbit-clean.timer'
[Unit]
Description=Executa limpeza periódica de .torrent removidos (Python)

[Timer]
OnBootSec=2min
OnUnitActiveSec=60min
Unit=qbit-clean.service

[Install]
WantedBy=timers.target
```

Os parâmetros `OnBootSec` e `OnUnitActiveSec` estabelecem, respectivamente, o tempo de espera até a primeira execução do script, após o início da sessão do usuário, e a periodicidade das execuções subsequentes.

Agora que os arquivos já estão prontos, podemos ativar o `qbit-clean.timer`:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl enable --now qbit-clean.timer
```

O *script* pode ser testado imediatamente com:

```bash showLineNumbers=false
$ /usr/local/bin/qbit-clean.py
```

## Ordem de desmontagem no *systemd*

No meu caso, durante o desligamento do sistema, o `systemd` tenta desmontar a partição que armazena os arquivos do qBittorrent antes de encerrar o próprio serviço. Como a partição ainda está em uso, a desmontagem falha, gerando uma mensagem de erro durante o processo de desligamento.

Embora esse comportamento não cause problemas práticos no funcionamento do sistema, optei por ajustar a ordem de encerramento dos serviços para evitar esse aviso e garantir um desligamento mais organizado.

A solução consiste em criar uma dependência explícita entre o serviço do qBittorrent e a partição onde os arquivos são armazenados. Assim, o `systemd` somente desmontará a partição após a finalização completa do serviço, eliminando a mensagem de erro durante o desligamento.

Para isso, vamos criar a seguinte pasta e arquivo de configuração, respectivamente:

```bash showLineNumbers=false
$ sudo mkdir -p /etc/systemd/system/qbittorrent.service.d/
```

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/qbittorrent.service.d/override.conf
```

Dentro do arquivo, cole o seguinte conteúdo:

```bash title='/etc/systemd/system/qbittorrent.service.d/override.conf'
[Unit]
After=mnt-sdb1.mount
Requires=mnt-sdb1.mount

[Service]
# O qBittorrent precisa de um tempo para fechar os arquivos 
KillSignal=SIGTERM
TimeoutStopSec=60
```

:::caution[ATENÇÃO]
O identificador `sdb1` foi utilizado apenas como exemplo. No seu caso, substitua-o pelo identificador correspondente à partição que deseja utilizar, como `sda1`, `sdb1`, `sdc1` ou outro, conforme a configuração do seu sistema.
:::

Para finalizar, recarregue o `daemon`:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```
