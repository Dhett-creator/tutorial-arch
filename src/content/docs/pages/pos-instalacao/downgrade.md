---
title: Downgrade de pacotes
---

No Arch Linux, manter um pacote em uma versão antiga exige dois passos: instalar a versão desejada (fazer o *downgrade*) e dizer ao gerenciador de pacotes (*pacman*) para parar de atualizá-lo.

A maneira mais segura e fácil de fazer isso é usando um utilitário chamado `downgrade`, disponível no AUR:

```bash showLineNumbers=false
$ yay -S downgrade
```

Como exemplo irei realizar o *downgrade* do `rtorrent`, que também depende do pacote `libtorrent`. Execute o comando abaixo com privilégios de superusuário, chamando os dois pacotes ao mesmo tempo: 

```bash showLineNumbers=false
$ sudo downgrade rtorrent libtorrent
```

O terminal vai listar todas as versões antigas disponíveis no _cache_ local da sua máquina e no *Arch Linux Archive* (ALA). Digite o número correspondente à versão que você deseja para cada um. Após instalar a versão antiga, o próprio comando *downgrade* perguntará se deseja manter os pacotes congelados nessa versão. Se assim desejar, confirme com `y`.

Caso deseje remover essa regra e permitir que os pacotes atualizem para as próximas versões, abra o arquivo `/etc/pacman.conf` e procure pela linha `IgnorePkg`. Ela deve estar descomentada (sem o `#` na frente) e com os dois pacotes listados: 

```bash title='/etc/pacman.conf'
IgnorePkg = rtorrent libtorrent
```

Basta comentar a linha inteira ou apagar os pacotes que os mesmos voltaram a atualizar.

:::note[NOTA]
Enquanto a regra para ignorar as atualizações desses pacotes estiver ativa, o `pacman` informará, a cada atualização do sistema, que os pacotes correspondentes foram ignorados.
:::

