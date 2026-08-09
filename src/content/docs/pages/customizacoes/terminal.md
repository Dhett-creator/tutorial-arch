---
title: Personalização do terminal
---

Para personalizar o terminal no Arch Linux, serão utilizados três pacotes. O primeiro é o `fish`, um _shell_ voltado à interatividade que oferece, de forma nativa, recursos como sugestões automáticas de comandos e destaque de sintaxe. O segundo é o `starship`, responsável por fornecer um _prompt_ minimalista e exibir informações contextuais, como o diretório atual e o estado de repositórios _Git_. Por fim, o `eza`, uma alternativa moderna ao comando `ls`, que adiciona cores de acordo com o tipo de arquivo e permite uma visualização hierárquica organizada em forma de árvore.

Instalação dos pacotes:

```bash showLineNumbers=false
$ sudo pacman -S fish starship eza ttf-hack-nerd
```

Incluí o pacote `ttf-hack-nerd`, necessário para a exibição correta dos ícones. Após a instalação dos pacotes, acesse as configurações do terminal e escolha a fonte **Hack Nerd Font Mono** como padrão.

## Fish

O comando a seguir, torna o `fish` o seu _shell_ padrão:

```bash showLineNumbers=false
$ chsh -s /usr/bin/fish
```

Para que esse comando tenha efeito, é necessário encerrar a sessão (_log out_) e entrar novamente, mas isso pode ser feito após concluir todo o processo de customização.

Para configuração do `fish`, crie o diretório:

```bash showLineNumbers=false
$ mkdir -p ~/.config/fish
```

Crie e edite o arquivo:

```bash showLineNumbers=false
$ nano ~/.config/fish/config.fish
```

Adicione o seguinte conteúdo:

```bash title='~/.config/fish/config.fish'
starship init fish | source

# Silencia a mensagem de boas vindas do fish
set -g fish_greeting ""

# Atalho para a sessão Tmux do rTorrent (Opcional)
# Leia a seção do rTorrent para entender
alias rt='/usr/bin/tmux a -t rtorrent'

# Substituir o ls pelo eza com cores inteligentes
alias ls='eza --icons --group-directories-first --color=always --no-quotes'
alias ll='eza -lh --icons --group-directories-first --no-quotes'
alias la='eza -a --icons --group-directories-first --no-quotes'
alias lt='eza --tree --level=2 --icons --no-quotes'
```

## Starship

Para configuração do `Starship` abra ou crie, se não existir, o seguinte arquivo:

```bash showLineNumbers=false
$ nano ~/.config/starship.toml
```

Dentro dele, cole:

```bash title='~/.config/starship.toml'
"$schema" = 'https://starship.rs/config-schema.json'

format = """
[](color_orange)\
$os\
$username\
[](bg:color_yellow fg:color_orange)\
$directory\
[](fg:color_yellow bg:color_aqua)\
$git_branch\
$git_status\
[](fg:color_aqua bg:color_blue)\
$c\
$cpp\
$rust\
$golang\
$nodejs\
$php\
$java\
$kotlin\
$haskell\
$python\
[](fg:color_blue bg:color_bg3)\
$docker_context\
$conda\
$pixi\
[](fg:color_bg3 bg:color_bg1)\
$time\
[ ](fg:color_bg1)\
$line_break$character"""

palette = 'gruvbox_dark'

[palettes.gruvbox_dark]
color_fg0 = '#fbf1c7'
color_bg1 = '#3c3836'
color_bg3 = '#665c54'
color_blue = '#458588'
color_aqua = '#689d6a'
color_green = '#98971a'
color_orange = '#d65d0e'
color_purple = '#b16286'
color_red = '#cc241d'
color_yellow = '#d79921'

[os]
disabled = false
style = "bg:color_orange fg:color_fg0"

[os.symbols]
Windows = "󰍲"
Ubuntu = "󰕈"
SUSE = ""
Raspbian = "󰐿"
Mint = "󰣭"
Macos = "󰀵"
Manjaro = ""
Linux = "󰌽"
Gentoo = "󰣨"
Fedora = "󰣛"
Alpine = ""
Amazon = ""
Android = ""
AOSC = ""
Arch = "󰣇"
Artix = "󰣇"
EndeavourOS = ""
CentOS = ""
Debian = "󰣚"
Redhat = "󱄛"
RedHatEnterprise = "󱄛"
Pop = ""

[username]
show_always = true
style_user = "bg:color_orange fg:color_fg0"
style_root = "bg:color_orange fg:color_fg0"
format = '[ $user ]($style)'

[directory]
style = "fg:color_fg0 bg:color_yellow"
format = "[ $path ]($style)"
truncation_length = 3
truncation_symbol = "…/"

[directory.substitutions]
"Documentos" = "󰈙 "
"Downloads" = " "
"Músicas" = "󰝚 "
"Imagens" = " "
"Developer" = "󰲋 "
"Vídeos" = "󰿎 "

[git_branch]
symbol = ""
style = "bg:color_aqua"
format = '[[ $symbol $branch ](fg:color_fg0 bg:color_aqua)]($style)'

[git_status]
style = "bg:color_aqua"
format = '[[($all_status$ahead_behind )](fg:color_fg0 bg:color_aqua)]($style)'

[nodejs]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[c]
symbol = " "
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[cpp]
symbol = " "
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[rust]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[golang]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[php]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[java]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[kotlin]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[haskell]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[python]
symbol = ""
style = "bg:color_blue"
format = '[[ $symbol( $version) ](fg:color_fg0 bg:color_blue)]($style)'

[docker_context]
symbol = ""
style = "bg:color_bg3"
format = '[[ $symbol( $context) ](fg:#83a598 bg:color_bg3)]($style)'

[conda]
style = "bg:color_bg3"
format = '[[ $symbol( $environment) ](fg:#83a598 bg:color_bg3)]($style)'

[pixi]
style = "bg:color_bg3"
format = '[[ $symbol( $version)( $environment) ](fg:color_fg0 bg:color_bg3)]($style)'

[time]
disabled = false
time_format = "%R"
style = "bg:color_bg1"
format = '[[  $time ](fg:color_fg0 bg:color_bg1)]($style)'

[line_break]
disabled = false

[character]
disabled = false
success_symbol = '[❯](bold fg:color_green)'
error_symbol = '[❯](bold fg:color_red)'
vimcmd_symbol = '[❮](bold fg:color_green)'
vimcmd_replace_one_symbol = '[❮](bold fg:color_purple)'
vimcmd_replace_symbol = '[❮](bold fg:color_purple)'
vimcmd_visual_symbol = '[❮](bold fg:color_yellow)'
```

Depois de salvar e fechar o arquivo, reinicie a seção.

:::tip[DICA]
Se você utiliza pacotes _Flatpak_ e do AUR por meio do gerenciador de pacotes `yay`, além de ter o `fish` configurado como _shell_ padrão, pode criar um atalho — como `up`, por exemplo — para atualizar todos os pacotes do sistema com um único comando. Para isso, basta copiar o comando abaixo, colá-lo no terminal e executá-lo:

```bash showLineNumbers=false
$ echo 'function up
  sudo -v

  echo -e "\n"(set_color --bold brblue)"🚀 Atualizando Flatpaks..."(set_color normal)"\n"
  flatpak update -y

  echo -e "\n"(set_color --bold brblue)"📦 Atualizando Pacotes dos Repositórios e do AUR..."(set_color normal)"\n"
  yay -Syu
end' > ~/.config/fish/functions/up.fish
```
:::
