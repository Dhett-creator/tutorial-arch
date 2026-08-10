---
title: Gerenciamento do cache do pacman
---

O gerenciador de pacotes do Arch Linux, o `pacman`, mantém um cache de todos os pacotes baixados e instalados no sistema. Com o tempo, esse cache pode ocupar uma quantidade significativa de espaço em disco. Para evitar que isso aconteça, é recomendado configurar uma rotina de limpeza automática do cache. Para isso, exite uma ferramenta chamada `paccache` que está presente no pacote `pacman-contrib`:

```bash showLineNumbers=false
$ sudo pacman -S pacman-contrib
```

Para usar essa ferramenta, basta executar:

```bash showLineNumbers=false
$ sudo paccache -r
```

Por padrão, o `paccache` remove todos os pacotes do cache que não estão instalados no sistema e mantem até duas versões diferentes do _Kernel_.

Para não ter que se preocupar em ter que rodar esse comando eventualmente no futuro, você pode ativar um serviço do `systemd`:

```bash showLineNumbers=false
$ sudo systemctl enable --now paccache.timer
```

Isso vai rodar a limpeza uma vez por semana de forma silenciosa. Para ter certeza de que o comando está configurado para rodar semanalmente, você pode usar o comando de listagem de _timers_:

```bash showLineNumbers=false
$ systemctl list-timers paccache.timer
```

