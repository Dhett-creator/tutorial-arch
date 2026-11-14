---
title: Mouse ATK F1 V3
---

O **ATK F1 V3** é um mouse sem fio voltado para o público _gamer_ que disponibiliza um _software_ baseado na web para gerenciamento e personalização de suas configurações.

Diferentemente de outros mouses e periféricos que já testei, o **ATK F1 V3** não necessita da instalação de drivers específicos para funcionar. Ao conectá-lo ao computador pela primeira vez, seja por meio do cabo USB ou do próprio _dongle_ (receptor sem fio), o dispositivo já estará pronto para uso. No entanto, para acessar e modificar suas configurações por meio do _software_ web, será necessário criar uma regra `udev` no Linux, permitindo que o navegador se comunique corretamente com o dispositivo.

Ao acessar o [ATK Web Hub](https://hub.atk.pro/) pela primeira vez, utilizando um navegador, é possível que o mouse apareça com o status `Sleep`. Nesse estado, não será possível acessar suas configurações. Para solucionar esse problema, primeiro é necessário identificar o **ID do fabricante (Vendor ID)** do receptor USB (_dongle_). Esse identificador geralmente corresponde ao valor `373b`.

```bash showLineNumbers=false
$ lsusb
```

**Verificação:** Procure na saída a linha referente ao receptor sem fio/_dongle_ (geralmente aparece como `Compx`, `ATK`, `VXE` ou `2.4G Wireless Receiver`) e anote os 4 primeiros caracteres após ID (por exemplo, em `ID 373b:1049`, o Vendor ID é `373b`).

Agora crie a regra do `udev` com permissão de leitura e escrita, substituindo `373b` abaixo caso o comando `lsusb` tenha mostrado outro código:

```bash showLineNumbers=false
$ echo 'SUBSYSTEM=="hidraw", ATTRS{idVendor}=="373b", MODE="0666"' | sudo tee /etc/udev/rules.d/99-atk-webhid.rules > /dev/null
```

Recarregue as regras do `udev` e aplique ao dispositivo conectado executando os seguintes comando em sequência:

```bash showLineNumbers=false
$ sudo udevadm control --reload-rules
$ sudo udevadm trigger
```

Após isso, desconecte o _dongle_ USB da porta, aguarde 2 segundos e conecte novamente. Em seguida, recarregue a página do _software web_ e verifique se é possível acessar as configurações do mouse clicando em sua imagem.
