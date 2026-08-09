---
title: RAID0
---

O `RAID0` é uma técnica de armazenamento que combina dois ou mais discos físicos em um único volume lógico, distribuindo os dados entre eles para aumentar o desempenho de leitura e escrita. Embora ofereça um ganho significativo de velocidade, ele não fornece redundância: caso qualquer um dos discos apresente falha, todos os dados armazenados no conjunto serão perdidos. Por esse motivo, o `RAID0` é recomendado apenas para cenários em que o desempenho é prioritário e os dados possuam cópias de segurança.

Para a criação do `RAID0` é necessário a instalação do pacote:

```bash showLineNumbers=false
$ sudo pacman -S mdadm
```

Verifique os discos disponíveis:

```bash showLineNumbers=false
$ lsblk -o NAME,SIZE,TYPE
```

Vamos supor que os discos sejam:

```bash showLineNumbers=false
/dev/sdb
/dev/sdc
```

O próximo passo apagará todos os dados armazenados nos discos. Portanto, certifique-se de que qualquer informação importante tenha sido salva:

```bash showLineNumbers=false
$ sudo wipefs -a /dev/sdb
```
```bash showLineNumbers=false
$ sudo wipefs -a /dev/sdc
```

Criação do `RAID0`:

```bash showLineNumbers=false
$ sudo mdadm --create --verbose /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc
```

Isso irá criar o dispositivo `/dev/md0`, o qual pode ser verificado com:

```bash showLineNumbers=false
$ watch cat /proc/mdstat
```

Em seguida, crie o sistema de arquivos com `ext4` e crie o ponto de montagem:

```bash showLineNumbers=false
$ sudo mkfs.ext4 /dev/md0
```
```bash showLineNumbers=false
$ sudo mkdir -p /mnt/raid0
```
```bash showLineNumbers=false
$ sudo mount /dev/md0 /mnt/raid0
```

Feito isso, o `RAID0` já estará criado. Para que ele seja montado automaticamente durante a inicialização do sistema, costumo configurá-lo utilizando o *Gnome Disks* — ou Discos, caso o sistema esteja em português. Ao abrir o aplicativo, clique no dispositivo `/dev/md0` na coluna à esquerda e, em seguida, no ícone de engrenagem localizado logo abaixo do gráfico que exibe o uso de armazenamento. Depois disso, selecione a opção **Editar opções de montagem**. Na janela que se abrir, desmarque a opção **Padrões de sessão de usuário** e mantenha marcada a opção **Montar ao inicializar o sistema**.

Nessa mesma janela, recomendo alterar o identificador do dispositivo em **Identificar como**, selecionando a opção `/dev/md0`. Isso ajuda a identificar o dispositivo em situações futuras.

Após concluir essas etapas, basta reiniciar o sistema para que o dispositivo passe a ser montado automaticamente. Vale ressaltar que será necessário ajustar o proprietário do dispositivo para garantir permissão de escrita; para isso, use o comando `sudo chown user:user /mnt/md0/`, alterando apenas o `user` para o seu usuário.

