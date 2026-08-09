---
title: Transferência de arquivos via terminal
---

O `rsync` é uma ferramenta amplamente utilizada para transferência e sincronização de arquivos em sistemas Linux. Seu principal diferencial é copiar apenas os dados que foram alterados desde a última sincronização, tornando as transferências mais rápidas e eficientes. Além de permitir a cópia de arquivos entre diretórios e discos locais, o `rsync` também possibilita transferências seguras entre computadores por meio da rede, sendo uma solução bastante utilizada para migração de dados, sincronização de arquivos e backups.

No momento, iremos focar apenas na transferência de arquivos locais, entre dispositivos conectados em um mesmo computador.

O `rsync` possui uma sintaxe simples e bastante flexível:

```bash showLineNumbers=false
$ rsync [opções] origem destino
```

Algumas das opções mais utilizadas são:

- `-a`: ativa o modo de arquivamento, preservando permissões, datas de modificação, links simbólicos e outros atributos dos arquivos.
- `-v`: exibe informações detalhadas sobre a transferência.
- `-h`: apresenta os tamanhos dos arquivos em um formato legível (KB, MB, GB etc.).
- `--progress`: exibe o progresso da transferência de cada arquivo.
- `--partial`: mantém arquivos parcialmente transferidos caso a operação seja interrompida, permitindo retomá-la sem reiniciar a cópia do zero.
- `-P`: equivale à combinação de `--partial` e `--progress`, sendo uma opção bastante utilizada para transferências de arquivos grandes.
- `--info=progress2`: exibe o progresso global da transferência, mostrando a quantidade total de dados já copiados, a velocidade de transferência, o tempo decorrido e a estimativa de conclusão.
- `--no-i-r`: obriga que o `rsync` escaneie toda a árvore de diretórios antes de começar a cópia, tonando a estimativa da porcentagem e do tempo de transferência mais precisos.

Para copiar todo o conteúdo de um diretório para outro:

```bash showLineNumbers=false
$ rsync -avh --partiall --info=progress2 /origem/ /destino/
```

:::tip[DICA]
O caractere `/` ao final do diretório de origem indica que apenas o conteúdo será copiado. <u>Se ele for omitido</u>, o diretório de origem também será criado dentro do destino.
:::
