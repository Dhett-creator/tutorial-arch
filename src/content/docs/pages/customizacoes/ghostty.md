---
title: Terminal Ghostty
---

O _Ghostty_ é um emulador de terminal excelente, escrito em _Zig_, incrivelmente rápido e com renderização via GPU. Para instalá-lo:

```bash showLineNumbers=false
$ sudo pacman -S ghostty ghostty-nautilus ttf-hack-nerd ttf-jetbrains-mono-nerd
```

O pacote `ghostty-nautilus` integra o _Ghostty_ ao gerenciador de arquivos do GNOME, o _Nautilus_, permitindo abri-lo diretamente a partir do explorador de arquivos. Além disso, a instalação inclui os pacotes `ttf-hack-nerd` e `ttf-jetbrains-mono-nerd`, recomendados devido a compatibilidade com ícones utilizados pelo _prompt_ e por outras ferramentas de terminal.

Supondo que utilize a interface Gnome e opte por manter apenas um emulador de terminal no sistema, o `gnome-console` pode ser removido com o seguinte comando:

```bash showLineNumbers=false
$ sudo pacman -R gnome-console
```

Diferente de outros emuladores de terminal, o _Ghostty_ não possui uma interface de configurações embutida. Suas configurações são realizadas em um arquivo de texto separado, `~/.config/ghostty/config.ghostty`. Para acessá-lo:

```bash showLineNumbers=false
$ nano ~/.config/ghostty/config.ghostty
```

:::caution[ATENÇÃO]
O arquivo de configuração `config.ghostty` é criado automaticamente na primeira execução do _Ghostty_. Portanto, é necessário abrir o programa pelo menos uma vez antes de editá-lo.
:::

Adicione o seguinte conteúdo:

```bash title='~/.config/ghostty/config.ghostty'
# ~/.config/ghostty/config.ghostty

# --- Fonte ---
# (Ex.: "Hack Nerd Font Mono", "JetBrainsMono Nerd Font", etc.)
font-family = "Hack Nerd Font Mono"
font-size = 12

# --- Tema e Aparência ---
# (Ex.: Gnome Adwaita, Gruvbox Material, etc.)
#theme =

# --- Comportamento ---
# Garante que o ghostty inicie no shell de sua preferência (Ex.: bash, fish, etc.)
shell-integration = fish

# Copiar automaticamente ao selecionar o texto
copy-on-select = clipboard

# --- Tamanho da Janela ---
# O Ghostty usa colunas e linhas como medida de tamanho.
# Ajuste os valores abaixo até encontrar o tamanho ideal para o seu monitor.
window-width = 150
window-height = 50

# --- Velocidade do scroll ---
# O valor padrão é 1. Reduzir esse valor (ex: 0.5 ou 0.3) fará com que o
# touchpad ou o scroll do mouse desçam menos linhas por movimento.
#mouse-scroll-multiplier = 0.5
```

:::tip[DICA]
Para visualizar a lista de temas compatíveis com o _Ghostty_, utilize o comando `ghostty +list-themes`. Ao navegar pela lista com as teclas de direção, o tema selecionado é aplicado temporariamente, permitindo uma prévia de sua aparência no terminal.

Para aplicar um tema de forma permanente, é necessário defini-lo em `theme =` no arquivo de configuração do _Ghostty_.
:::
