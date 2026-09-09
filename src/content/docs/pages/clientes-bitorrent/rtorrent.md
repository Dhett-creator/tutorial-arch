---
title: rTorrent
---

O rTorrent é um cliente BitTorrent leve e baseado em terminal, projetado para oferecer alto desempenho com baixo consumo de recursos. Ele opera inteiramente em modo texto e é amplamente utilizado em servidores e sistemas Linux devido à sua eficiência, estabilidade e flexibilidade. Além disso, pode ser facilmente integrado a ferramentas como `tmux`, _scripts_ de automação e interfaces web, possibilitando tanto o gerenciamento local quanto remoto. Essas características tornam o rTorrent uma ferramenta versátil e poderosa para diferentes cenários de atuação.

## Instalação e configuração

Vamos a instalação do rTorrent. Primeiro, instale os seguintes pacotes:

```bash showLineNumbers=false
$ sudo pacman -S rtorrent tmux trash-cli
```

Em seguida, crie o arquivo de configuração do rTorrent, denominado `.rtorrent.rc`, no diretório do usuário:

```bash showLineNumbers=false
$ nano ~/.rtorrent.rc
```

Dentro desse arquivo, cole o seguinte conteúdo:

```bash title='~/.rtorrent.rc' {11,34-36,122,128,174-177,180-183,186-189}
#############################################################################
# Uma configuração mínima do rTorrent que fornece os recursos básicos
# que você deseja ter além dos padrões integrados.
#############################################################################

#############################################################################
## 1. ESTRUTURA DA INSTÂNCIA (DIRETÓRIOS BASE)
#############################################################################

## Diretório base da instância do rTorrent
method.insert = cfg.basedir, private|const|string, (cat,"/home/USER/.rtorrent/")

## Diretório onde os logs serão armazenados
method.insert = cfg.logs, private|const|string, (cat,(cfg.basedir),"log/")

## Arquivo de log principal (Nome fixo para não criar arquivos novos a cada boot)
method.insert = cfg.logfile, private|const|string, (cat,(cfg.logs),"rtorrent.log")

## Diretório de sessão (estado dos torrents, essencial para retomada)
method.insert = cfg.session, private|const|string, (cat,(cfg.basedir),".session/")

## Diretório monitorado para arquivos .torrent
method.insert = cfg.watch, private|const|string, (cat,(cfg.basedir),"Torrents/")

#############################################################################
## 2. CRIAÇÃO AUTOMÁTICA DOS DIRETÓRIOS NECESSÁRIOS
#############################################################################

## Cria os diretórios da instância caso não existam
execute.throw = sh, -c, (cat,\
    "mkdir -p ",\
    "\"",(cfg.logs),"\" ",\
    "\"",(cfg.session),"\" ",\
    "\"",(cfg.watch),"/Pasta1-.torrents\" ",\
    "\"",(cfg.watch),"/Pasta2-.torrents\" ",\
    "\"",(cfg.watch),"/Pasta3-.torrents\" ")

#############################################################################
## 3. CONFIGURAÇÃO DE REDE E PORTA
#############################################################################

## Porta fixa para conexões de entrada (evita problemas com firewall)
network.port_range.set = 50000

#############################################################################
## 4. DHT, PEX E TRACKERS UDP (ATIVADOS PARA REDE PÚBLICA)
#############################################################################

## Ativa o DHT (essencial para torrents públicos e magnet links)
dht.mode.set = disable

## Define a porta que o DHT vai usar (pode ser a mesma do torrent ou uma específica)
## Escolhi 6881 seguindo as instruções da documentação do rtorrent
# dht.override_port.set = 6881

## Adiciona servidores "raiz" para ajudar o rTorrent a encontrar a rede DHT
## na primeira vez que ele iniciar
# dht.add_node = router.bittorrent.com:6881
# dht.add_node = router.utorrent.com:6881

## Ativa a troca de Peers (PEX)
# protocol.pex.set = yes

#############################################################################
## 5. CONFIGURAÇÕES DE PEERS E UPLOAD
#############################################################################

## Número máximo de uploads simultâneos
throttle.max_uploads.set = 100
throttle.max_uploads.global.set = 250

## Limites de peers durante seed
throttle.min_peers.normal.set = 20
throttle.max_peers.normal.set = 60

## Limites de peers durante seed
throttle.min_peers.seed.set = 30
throttle.max_peers.seed.set = 80

## Quantidade de peers solicitados aos trackers
trackers.numwant.set = 80

## Configuração de criptografia de protocolo
protocol.encryption.set = prefer

#############################################################################
## 6. LIMITES DE RECURSOS DO SISTEMA
#############################################################################

## Limite de arquivos físicos abertos simultaneamente
system.sockets.files.max_alloc.set = 600

## Limite de sockets exclusivos para a interface web Flood (RPC)
system.sockets.rpc.max_alloc.set = 32

## Aplica as regras de alocação acima e reequilibra os recursos (Obrigatório)
system.sockets.adjust_alloc =

#############################################################################
## 7. USO DE MEMÓRIA
#############################################################################

## Cache máximo para peças em memória
pieces.memory.max.set = 1800M

## Limite de tamanho para chamadas XMLRPC (Flood, scripts, etc)
network.xmlrpc.size_limit.set = 4M

#############################################################################
## 8. GERENCIAMENTO DE ARQUIVOS
#############################################################################

## Pré-aloca o espaço total do arquivo no início do download
## Evita fragmentação em disco
system.file.allocate.set = 1

#############################################################################
## 9. CONFIGURAÇÕES OPERACIONAIS BÁSICAS
#############################################################################

## Diretório de sessão
session.path.set = /home/USER/.rtorrent/.session/

## Salva o estado da sessão periodicamente (a cada 5 minutos)
schedule = session_save, 300, 300, session.save=

## Diretório padrão para downloads manuais
directory.default.set = /home/USER/Downloads

## Log de comandos executados
log.execute = (cat, (cfg.logs), "execute.log")

## Salva o PID do rTorrent na sessão
execute.nothrow = sh, -c, (cat, "echo >",\
    (session.path), "rtorrent.pid", " ",(system.pid))

#############################################################################
## 10. CONFIGURAÇÕES GERAIS DO SISTEMA
#############################################################################

## Umask padrão para permissões de arquivos
system.umask.set = 0027

## Diretório de trabalho inicial
system.cwd.set = (directory.default)

## Tempo de cache DNS
network.http.dns_cache_timeout.set = 25

## Monitoramento de espaço em disco (fecha torrents se < 1GB livre)
schedule = monitor_diskspace, 15, 60, ((close_low_diskspace, 1000M))

#############################################################################
## 11. MÉTODOS AUXILIARES INTERNOS
#############################################################################

## Timestamp de inicialização
method.insert = system.startup_time, value|const, (system.time)

## Caminho real dos dados do torrent (single ou multi-file)
method.insert = d.data_path, simple,\
    "if=(d.is_multi_file),\
        (cat, (d.directory), /),\
        (cat, (d.directory), /, (d.name))"

## Caminho do arquivo .torrent salvo na sessão
method.insert = d.session_file, simple, "cat=(session.path), (d.hash), .torrent"

#############################################################################
## 12. DIRETÓRIOS MONITORADOS (WATCH FOLDERS)
#############################################################################

## Animes
schedule = watch_pasta1, 10, 10, ((load.start_verbose, \
    (cat,(cfg.watch),"Pasta1-.torrents/*.torrent"), \
    d.directory.set=/home/USER/Pasta1/, \
    d.custom1.set=Pasta1))

## Séries
schedule = watch_pasta2, 10, 10, ((load.start_verbose, \
    (cat,(cfg.watch),"Pasta2-.torrents/*.torrent"), \
    d.directory.set=/home/USER/Pasta2/, \
    d.custom1.set=Pasta2))

## Filmes
schedule = watch_pasta3, 10, 10, ((load.start_verbose, \
    (cat,(cfg.watch),"Pasta3-.torrents/*.torrent"), \
    d.directory.set=/home/USER/Pasta3/, \
    d.custom1.set=Pasta3))

#############################################################################
## 13. NOTIFICAÇÕES VIA SCRIPTS
#############################################################################

## Notifica quando um download termina
method.set_key = event.download.finished,notify_me,"execute=/usr/local/bin/rtorrent-downloaded.sh,$d.name=,$d.base_path.realpath.or_empty="

## Notifica quando um torrent é adicionado
method.set_key = event.download.inserted_new,notify_added,"execute=/usr/local/bin/rtorrent-added.sh,$d.name=,$d.base_path.realpath.or_empty="

#############################################################################
## 14. EXCLUSÃO DE ARQUIVOS (LIXEIRA)
#############################################################################

## ATENÇÃO:
## Se usar Flood como interface web, mantenha comentado
## para evitar conflitos na exclusão de arquivos

#method.set_key = event.download.erased,delete_files,"execute=trash-put,$d.base_path="

#############################################################################
## 15. SISTEMA DE LOG (Baseado na documentação 0.16.x)
#############################################################################

## Abre o arquivo de log principal (Com nome fixo rtorrent.log)
log.open_file = "log_file", (cfg.logfile)

## Registra apenas o necessário: Erros, Avisos e Críticos
log.add_output = "error", "log_file"
log.add_output = "critical", "log_file"
log.add_output = "warn", "log_file"

## Mantém o foco no problema de travamento, mas apenas em caso de ERRO (Em análise no momento!)
log.add_output = "protocol_storage_errors", "log_file"
log.add_output = "storage_error", "log_file"

#############################################################################
## 16. VIEWS
#############################################################################

## View automática para torrents ativos (upload ou download)
schedule = filter_active,30,30,"view.filter = active,\"or={d.up.rate=,d.down.rate=}\""

#############################################################################
## 17. COMPORTAMENTO DE HASH
#############################################################################
## Se ativado, atrasa a notificação ao tracker após conclusão
## causando atraso no tempo de seed contabilizado

pieces.hash.on_completion.set = no

#############################################################################
## 18. INTEGRAÇÃO COM A INTERFACE WEB FLOOD (SCGI)
#############################################################################

## Conexão via socket Unix (mais seguro)
network.scgi.open_local = ~/.rtorrent/rpc.socket

## Permissões do socket para o Flood
schedule = scgi_permission, 0, 0, "execute.nothrow=chmod, 770, ~/.rtorrent/rpc.socket"

## Alternativa de conexão via TCP (desativada - menos segura)
#network.scgi.open_port = 127.0.0.1:5000

#############################################################################
## 19. COMPATIBILIDADE COM A INTERFACE WEB FLOOD (rTorrent 0.15.1+)
#############################################################################

method.redirect = load.throw,load.normal
method.redirect = load.start_throw,load.start
method.insert = d.down.sequential, value|const, 0
method.insert = d.down.sequential.set, value|const, 0

#############################################################################
## 20. INTERFACE DE TERMINAL (CORES E VISUAL)
#############################################################################

## Título e rodapé
# ui.color.title.set = "bold black on bright blue"
# ui.color.footer.set = "bold black on blue"

## Torrent em foco
# ui.color.focus.set = "reverse"

## Etiquetas
# ui.color.label.set = "grey"

## Estados dos torrents
# ui.color.complete.set = "green"
# ui.color.seeding.set = "blue"
# ui.color.stopped.set = "red"
# ui.color.queued.set = "magenta"
# ui.color.leeching.set = "yellow"
# ui.color.incomplete.set = "cyan"

## Estilo das linhas
# ui.color.odd.set = "bold"
# ui.color.even.set = "bold"

#############################################################################
### END OF rtorrent.rc ###
#############################################################################
```

:::caution[ATENÇÃO]
As linhas destacadas requerem adaptação por parte do usuário.
:::

:::note[NOTA]
Essa configuração foi criada e ajustada para a versão <u>0.16.20</u> do rTorrent. Ela oferece uma automação básica para a adição e remoção de arquivos, exigindo apenas que o usuário ajuste corretamente os diretórios de criação de pastas e de armazenamento dos arquivos baixados. Foram definidos três diretórios `watch` para o monitoramento de arquivos `.torrent`. Basta que o usuário adicione um ou mais arquivos `.torrent` em qualquer um desses diretórios para que o _download_ seja iniciado automaticamente no diretório correspondente.
:::

Para verificar rapidamente se a configuração está correta, inicie o rTorrent via terminal:

```bash showLineNumbers=false
$ rtorrent
```

Se o programa iniciar normalmente, já é possível prosseguir com a criação de um serviço para inicialização automática via `systemd`:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/rtorrent.service
```

Dentro do arquivo, cole o seguinte conteúdo:

```bash title='/etc/systemd/system/rtorrent.service' {7,8}
[Unit]
Description=rtorrent (in tmux)
After=network.target

[Service]
Type=forking
User=user
WorkingDirectory=/home/user
ExecStartPre=/usr/bin/bash -c "if test -e ~/.session/rtorrent.lock && test -z `pidof rtorrent`; then rm -f ~/.session/rtorrent.lock; fi"
ExecStart=/usr/bin/tmux -2 new-session -d -s rtorrent rtorrent
ExecStop=/usr/bin/bash -c "/usr/bin/tmux send-keys -t rtorrent C-q && while pidof rtorrent > /dev/null; do sleep 0.5; done"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Para acessar o rTorrent através de uma seção `tmux`, utiliza-se: `/usr/bin/tmux a -t rtorrent`. Porém, para facilitar o acesso, iremos criar um `alias` para esse comando:

```bash showLineNumbers=false
$ nano ~/.bashrc
```

Adicione essa linha ao final do arquivo:

```bash title='~/.bash'
alias rt='/usr/bin/tmux a -t rtorrent'
```

Atualize o terminal atual:

```bash showLineNumbers=false
$ source ~/.bashrc
```

Agora, podemos usar o atalho `rt` para acessar a interface do rTorrent. Porém, **não teste esse comando ainda**, não ativamos o serviço do rTorrent para que haja uma seção ativa do `tmux` para ser acessada.

Para ativar o serviço do rTorrent:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl enable --now rtorrent
```

Os status do serviço pode ser consultado utilizando:

```bash showLineNumbers=false
$ systemctl status rtorrent
```

Caso esteja funcionando corretamente, teste o atalho de acesso a interface digitando `rt` no terminal.

## Notificações no rTorrent

Assim como o qBittorrent-nox, o rTorrent também não possui um sistema de notificações nativo. Porém, podemos seguir os mesmos passos realizados para o qBittorrent-nox e criar um sistema de notificações para o rTorrent.

Primeiro, vamos criar os dois _scripts_ responsáveis por notificar quando um _torrent_ é adicionado e quando um _download_ é finalizado:

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/rtorrent-added.sh
```

Adicione o seguinte conteúdo ao arquivo:

```bash title='/usr/local/bin/rtorrent-added.sh'
#!/bin/bash

TORRENT_NAME="$1"

export DISPLAY=:0
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

/usr/bin/gdbus call --session \
  --dest org.freedesktop.Notifications \
  --object-path /org/freedesktop/Notifications \
  --method org.freedesktop.Notifications.Notify \
  "rTorrent" \
  0 \
  "dialog-information" \
  "Torrent adicionado:" \
  "$TORRENT_NAME" \
  "[]" \
  "{}" \
  5000 > /dev/null
```

Agora, vamos criar o _script_ para notificar quando um _download_ for finalizado:

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/rtorrent-downloaded.sh
```

Dentro do arquivo, adicione:

```bash title='/usr/local/bin/rtorrent-downloaded.sh'
#!/bin/bash

TORRENT_NAME="$1"

export DISPLAY=:0
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

/usr/bin/gdbus call --session \
  --dest org.freedesktop.Notifications \
  --object-path /org/freedesktop/Notifications \
  --method org.freedesktop.Notifications.Notify \
  "rTorrent" \
  0 \
  "folder-download-symbolic" \
  "Download finalizado:" \
  "$TORRENT_NAME" \
  "[]" \
  "{}" \
  5000 > /dev/null
```

Agora, conceda permissão de execução para os _scripts_:

```bash showLineNumbers=false
$ sudo chmod +x /usr/local/bin/rtorrent-*.sh
```

Importante, para que esses _scripts_ sejam executados pelo rTorrent, as seguintes linhas precisam fazer parte do seu arquivo de configurações `.rtorrent.rc`:

```bash title='~/.rtorrent.rc'
method.set_key = event.download.finished,notify_me,"execute=/usr/local/bin/rtorrent-downloaded.sh,$d.name="
method.set_key = event.download.inserted_new,notify_added,"execute=/usr/local/bin/rtorrent-added.sh,$d.name="
```

Caso seu arquivo ainda não às possua, basta adicioná-las ao final do arquivo e reiniciar o serviço do rTorrent:

```bash showLineNumbers=false
$ sudo systemctl restart rtorrent
```

## Flood + rTorrent

O Flood é uma interface web moderna para gerenciamento de clientes BitTorrent, desenvolvida para oferecer uma experiência de uso intuitiva e responsiva. Compatível com o rTorrent, ele permite acompanhar _downloads_, adicionar e gerenciar _torrents_, configurar o cliente e monitorar seu funcionamento diretamente pelo navegador, sem a necessidade de acessar o terminal.

O Flood está disponível no AUR e pode ser instalado com o seguinte comando:

```bash showLineNumbers=false
$ yay -S flood-bin
```

Após a instalação, é necessário configurar o rTorrent para criar o arquivo de comunicação (_socket_) utilizado pelo Flood. Também é preciso garantir que esse arquivo possua as permissões adequadas para que a interface consiga acessá-lo. Para isso, garanta que as seguintes linhas estão presentes no arquivo de configuração `.rtorrent.rc:`

```bash title='~/.rtorrent.rc'
# Configuração de comunicação via Socket Unix
network.scgi.open_local = ~/.rtorrent/rpc.socket

# Define as permissões do socket (770) para que o Flood possa ler/escrever
schedule2 = scgi_permission, 0, 0, "execute.nothrow=chmod, 770, ~/.rtorrent/rpc.socket"

# Linhas de compatibilidade para rTorrent 0.15.1+
method.redirect = load.throw,load.normal
method.redirect = load.start_throw,load.start
method.insert = d.down.sequential, value|const, 0
method.insert = d.down.sequential.set, value|const, 0
```

:::note[NOTA]
Caso tenha utilizado a configuração fornecida anteriormente, esses parâmetros já estarão presentes no arquivo `.rtorrent.rc`. Se optou por outra configuração, adicione esses parâmetros e reinicie o serviço do rtorrent: `sudo systemctl restart rtorrent`.
:::

Uma vez que se tenha esses parâmetros presentes no arquivo de configurações do rTorrent, precisamos criar um serviço para que o Flood inicie junto com o sistema:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/flood.service
```

Dentro do arquivo, adicione:

```bash title='/etc/systemd/system/flood.service' {7-9}
[Unit]
Description=Flood rTorrent Web Interface
# Garante que o Flood só inicie após a rede e o rTorrent estarem prontos
After=network.target rtorrent.service

[Service]
User=user
Group=group
WorkingDirectory=/home/user
ExecStart=/usr/bin/flood --port 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

Para habilitar e iniciar o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl enable --now flood
```

O status do serviço pode ser verificado com:

```bash showLineNumbers=false
$ systemctl status flood
```

Para configuração inicial acesse:

```bash showLineNumbers=false
http://localhost:3000
```

Escolha um nome de usuário e senha para proteger o acesso à interface. Em seguida, escolha o cliente, que nesse caso pode ser `Torrent`. Em `Connection Type`, selecione `Socket`. Em `Socket Path`, adicione o caminho `~/.rtorrent/rpc.socket`. Por ultimo, clique em `Access`.

## _Script_ para apagar arquivos _.torrent_ legados

Ao excluir vários *torrents* simultaneamente pela interface do Flood, é comum que nem todos os arquivos `.torrent` correspondentes sejam removidos das pastas monitoradas. Como resultado, esses arquivos permanecem disponíveis para o rTorrent que, ao ser reiniciado, interpreta sua presença como novos *torrents* a serem adicionados à sessão, iniciando novamente seus respectivos downloads.

Para evitar esse comportamento, podemos criar um *script* que execute verificações periódicas, comparando os *torrents* atualmente presentes na sessão do rTorrent com os arquivos `.torrent` existentes nas pastas monitoradas. Caso sejam encontrados arquivos `.torrent` que não possuam uma sessão correspondente no rTorrent, eles poderão ser removidos automaticamente.

Primeiro, crie o arquivo do _script_:

```bash showLineNumbers=false
$ sudo nano /usr/local/bin/rtorrent-clean.py
```

Adicione o seguinte conteúdo dentro do arquivo:

```python title='/usr/local/bin/rtorrent-clean.py' {9-11,14}
#!/usr/bin/env python3
import os
import xmlrpc.client
import subprocess
import socket

# --- CONFIGURAÇÃO ---
WATCH_DIRS = [
    "/home/user/.rtorrent/Torrents/Pasta1-.torrents",
    "/home/user/.rtorrent/Torrents/Pasta2-.torrents",
    "/home/user/.rtorrent/Torrents/Pasta3-.torrents",
]

SOCKET_PATH = "/home/user/.rtorrent/rpc.socket"

class SCGITransport(xmlrpc.client.Transport):
    def request(self, host, handler, request_body, verbose=False):
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        try:
            sock.connect(SOCKET_PATH)

            # Cabeçalhos SCGI
            headers = {
                'CONTENT_LENGTH': str(len(request_body)),
                'SCGI': '1',
            }
            header_str = "".join([f"{k}\x00{v}\x00" for k, v in headers.items()])
            scgi_header = f"{len(header_str)}:{header_str},".encode('utf-8')

            # Envia cabeçalho + corpo
            sock.sendall(scgi_header + request_body)

            # Recebe a resposta completa
            response = b""
            while True:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                response += chunk

            # O rTorrent envia cabeçalhos HTTP antes do XML.
            # Precisamos extrair apenas o conteúdo XML.
            if b"\r\n\r\n" in response:
                xml_content = response.split(b"\r\n\r\n", 1)[1]
            else:
                xml_content = response

            # xmlrpc.client.loads retorna uma tupla (dados, nome_do_metodo)
            return xmlrpc.client.loads(xml_content)[0]

        except Exception as e:
            print(f"Erro na comunicação SCGI: {e}")
            raise
        finally:
            sock.close()

def get_active_hashes():
    try:
        transport = SCGITransport()
        server = xmlrpc.client.ServerProxy("http://localhost", transport=transport)
        # Retorna a lista de hashes
        return {h.lower() for h in server.download_list()}
    except Exception as e:
        print(f"Erro ao obter hashes: {e}")
        return set()

def get_torrent_hash(filepath):
    try:
        result = subprocess.run(
            ["transmission-show", filepath],
            capture_output=True, text=True, check=True
        )
        for line in result.stdout.splitlines():
            if "Hash:" in line or "Hash v1:" in line:
                return line.split(":")[1].strip().lower()
    except:
        return None

def main():
    active_hashes = get_active_hashes()

    if not active_hashes:
        print(f"Erro: Não foi possível obter hashes ativos.")
        return

    print(f"Conectado ao rTorrent. {len(active_hashes)} torrents ativos.")

    for directory in WATCH_DIRS:
        if not os.path.exists(directory):
            continue
        for file in os.listdir(directory):
            if file.endswith(".torrent"):
                path = os.path.join(directory, file)
                thash = get_torrent_hash(path)
                if thash and thash not in active_hashes:
                    print(f"Movendo para lixeira: {file}")
                    subprocess.run(["trash-put", path], check=False)

if __name__ == "__main__":
    main()
```

Agora, crie o arquivo de serviço para o _script_:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/rtorrent-clean.service
```

Dentro do arquivo, adicione:

```bash title='/etc/systemd/system/rtorrent-clean.service' {7,8}
[Unit]
Description=Limpeza de .torrent removidos do rTorrent (Python)
After=network.target

[Service]
Type=oneshot
User=user
Group=group
ExecStart=/usr/bin/python3 /usr/local/bin/rtorrent-clean.py

[Install]
WantedBy=multi-user.target
```

Em seguida, vamos criar um arquivo de `timer` para que o _script_ seja executado periodicamente:

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/rtorrent-clean.timer
```

Dentro do arquivo, adicione:

```bash title='/etc/systemd/system/rtorrent-clean.timer'
[Unit]
Description=Executa limpeza periódica de .torrent removidos do rTorrent

[Timer]
OnBootSec=2min
OnUnitActiveSec=60min
Unit=rtorrent-clean.service

[Install]
WantedBy=timers.target
```

Conceda permissão de execução para o _script_:

```bash showLineNumbers=false
$ sudo chmod +x /usr/local/bin/rtorrent-clean.py
```

Por ultimo, recarregue e inicie o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl enable --now rtorrent-clean.timer
```

## Tornar a interface Flood visível na rede

Para permitir que o Flood seja acessado por outros computadores na rede de forma segura, é necessário ajustar a linha `ExecStart` no seu arquivo `/etc/systemd/system/flood.service`, adicionando `--host 0.0.0.0` ao final:

```bash title='/etc/systemd/system/flood.service' {2-4}
[Service]
User=user
Group=user
WorkingDirectory=/home/user
# Alterado para aceitar conexões externas na rede local
ExecStart=/usr/bin/flood --port 3000 --host 0.0.0.0
Restart=always
```

Após salvar o arquivo, você deve recarregar as configurações do `systemd` e reiniciar o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl restart flood
```

O parâmetro `0.0.0.0` concede acesso ao Flood para qualquer dispositivo conectado em sua rede.

Após isso, para acessar a interface do Flood a partir de outro computador, basta utilizar o endereço `http://IP_DA_MAQUINA:3000/overview`, colocando apenas o IP da maquina onde o rTorrent e o Flood estão rodando.

Caso deseje reverter essas mudanças, edite o arquivo de serviço do Flood novamente e apague `--host 0.0.0.0`. Depois, reinicie o serviço:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

```bash showLineNumbers=false
$ sudo systemctl restart flood
```

## Ordem de desmontagem no _systemd_

Semelhante ao que foi relatado no caso do qBittorrent-nox, ao desligar o sistema, o `systemd` costuma tentar desmontar a partição que armazena os arquivos do rTorrent antes de encerrar o próprio serviço. Isso resulta em um erro, pois o disco ainda está em uso, gerando uma mensagem informando a falha na desmontagem da partição correspondente.

Embora esse comportamento não cause problemas práticos no uso cotidiano, considerei mais adequado ajustar a ordem de finalização do rTorrent, de modo a evitar esse aviso e garantir um desligamento mais limpo do sistema.

A solução adotada foi criar uma dependência explícita entre o serviço do rTorrent e a partição onde os arquivos baixados estão armazenados. Dessa forma, o sistema passa a desmontar a partição apenas após a finalização completa do serviço do rTorrent.

Para isso, vamos criar a seguinte pasta e arquivo de configuração, respectivamente:

```bash showLineNumbers=false
$ sudo mkdir -p /etc/systemd/system/rtorrent.service.d/
```

```bash showLineNumbers=false
$ sudo nano /etc/systemd/system/rtorrent.service.d/dependencia.conf
```

Dentro do arquivo, cole exatamente este conteúdo:

```bash title='/etc/systemd/system/rtorrent.service.d/dependencia.conf' {3,4}
[Unit]
# Isso força a ordem no desligamento
After=mnt-sdb1.mount
Requires=mnt-sdb1.mount

[Service]
# Garante que o systemd espere os comandos ExecStop terminarem
# antes de considerar o serviço "parado"
KillSignal=SIGINT
```

:::caution[ATENÇÃO]
Mais uma vez estou utilizando o disco `sdb1` como exemplo. Portanto, adapte de acordo com a sua configuração.
:::

Após salvar e fechar o arquivo, recarregue o `daemon`:

```bash showLineNumbers=false
$ sudo systemctl daemon-reload
```

Agora, ao reiniciar o sistema é esperado que a mensagem de falha não apareça.
