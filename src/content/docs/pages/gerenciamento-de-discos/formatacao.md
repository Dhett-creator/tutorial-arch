---
title: Formatação de dispositivos
---

Formatar um pendrive ou HD pelo terminal do Arch Linux é um procedimento relativamente simples, mas que exige bastante atenção. Como a operação é realizada por meio da linha de comando, um erro na identificação do dispositivo ou na digitação de um comando pode resultar na formatação do disco incorreto. Portanto, os passos a seguir devem ser realizados com extrema cautela.

:::danger[AVISO]
Este procedimento apagará todos os dados do disco selecionado. Certifique-se de que você tem backups de todos os arquivos importantes e verifique mais de uma vez se selecionou a unidade correta.
:::

O primeiro passo consiste em listar os dispositivos de armazenamento conectados ao sistema para identificar corretamente aquele que será formatado:

```bash showLineNumbers=false
$ lsblk
```

Você verá uma lista de todos os discos e partições conectados. Procure pelo disco que deseja formatar se baseando no tamanho dele.

Para os próximos passos, vou usar `/dev/sdX` para representar o disco e `/dev/sdX1` para a partição. Substitua o "X" pela letra correspondente ao dispositivo (ex: `sdc`).

O Linux não permite formatar uma partição que está em uso (montada). Se o seu sistema montou o disco automaticamente quando você o conectou, você precisa desmontá-lo:

```bash showLineNumbers=false
$ sudo umount /dev/sdX1
```

Se o disco tiver mais de uma partição, repita o comando para `sdX2`, `sdX3`, etc.

Para uma formatação limpa do zero, é recomendado recriar a tabela de partições usando o `fdisk`: 

```bash showLineNumbers=false
$ sudo fdisk /dev/sdX
```

Digite `g` e pressione **Enter** para criar uma nova tabela de partições GPT (padrão moderno), ou `o` para uma tabela MBR (DOS) se o disco for antigo ou precisar de compatibilidade com sistemas legados.

:::caution[ATENÇÃO]
Em alguns casos, pode ser que o `fdisk` exiba uma mensagem, após o comando `g`, informando que foi encontrado vestígios de uma tabela de partições antiga e recomende usar o comando `wipefs` para limpar assinaturas antigas. Para isso, no *prompt* `Comando (m para ajuda):`, digite a letra `q` e aperte **Enter**. Isso vai cancelar a operação atual e nos devolver ao terminal normal. Após isso, usamos: `sudo wipefs -a /dev/sdX` para apagar qualquer vestígio de formatações anteriores. Uma vez que o disco esteja completamente "zerado", vamos voltar para o plano original digitando novamente: `sudo fdisk /dev/sdX` e, em seguida digitando `g` para criar a tabela de partições.
:::

Depois, digite `n` e pressione **Enter** para criar uma nova partição. Você pode apenas pressionar **Enter** em todas as perguntas seguintes para aceitar os valores padrão (isso criará uma única partição ocupando todo o disco).

Por ultimo, digite `w` e pressione **Enter** para salvar as alterações e sair.

Agora precisamos escolher o formato (sistema de arquivos) que melhor atende às nossas necessidades. Para isso vou deixar três comandos para sistemas de arquivos diferentes (`ext4`, `exFat` e `NTFS`).

- **ext4 (Padrão Linux):** 

```bash showLineNumbers=false
$ sudo mkfs.ext4 /dev/sdX1
```
Excelente se for usar o disco apenas em sistemas Linux.

- **exFAT (Recomendado para uso misto):** 

```bash showLineNumbers=false
$ sudo mkfs.exfat /dev/sdX1
```
A melhor opção se planeja usar o disco em computadores com Windows, macOS e Linux, pois possui suporte nativo de leitura e escrita em todos eles sem limite de tamanho de arquivo. Antes, é importante garantir que o pacote `exfatprogs` está instalado no sistema: `sudo pacman -S exfatprogs`.

- **NTFS (Padrão Windows):**:

```bash showLineNumbers=false
$ sudo mkfs.ntfs -f /dev/sdX1
```
Escolha se o foco principal for o uso em Windows. Para utilizar esse comando, é necessário que o pacote `ntfs-3g` esteja instalado: `sudo pacman -S ntfs-3g`.

Caso deseje, é possível atribuir ou alterar o nome (rótulo) do dispositivo posteriormente, sem a necessidade de formatá-lo novamente. Para isso, utilize o utilitário correspondente ao sistema de arquivos:

- **Se o dispositivo foi formatado em `ext4`:**

```bash showLineNumbers=false
$ sudo e2label /dev/sdX1 "MEU_HD"
```

- **Se o dispositivo foi formatado em `exFAT`:**

```bash showLineNumbers=false
$ sudo exfatlabel /dev/sdX1 "MEU_HD"
```

- **Se o dispositivo foi formatado em `NTFS`:**

```bash showLineNumbers=false
$ sudo ntfslabel /dev/sdX1 "MEU_HD"
```

:::tip[DICA]
O rótulo também pode ser definido durante a formatação. Para isso, utilize um dos comandos abaixo de acordo com o sistema de arquivos desejado, alterando apenas o nome do dispositivo:

```bash showLineNumbers=false
$ sudo mkfs.ext4 -L "MEU_HD" /dev/sdX1
```

```bash showLineNumbers=false
$ sudo mkfs.exfat -L "MEU_HD" /dev/sdX1
```

```bash showLineNumbers=false
$ sudo mkfs.ntfs -f -L "MEU_HD" /dev/sdX1
```
:::

Para garantir que todas as operações foram concluídas e que é seguro remover o disco fisicamente:

```bash showLineNumbers=false
$ sync
```

Pronto! Seu dispositivo está formatado e pronto para uso.

