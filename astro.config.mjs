// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// https://astro.build/config
export default defineConfig({
    // site: 'https://Dhett-creator.github.io',
    // base: '/tutorial-arch',
    integrations: [
        starlight({
            title: 'My Docs',
            locales: {
				      root: {
					      label: 'Português do Brasil',
					      lang: 'pt-BR',
				      },
			      },
            customCss: ['./src/styles/custom.css'],
            expressiveCode: {
				      plugins: [pluginLineNumbers()],
			      },
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
            sidebar: [
                {
                    label: 'Pós instalação',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: 'Example Guide', slug: 'guides/example' },
                        { label: 'Procedimentos Essenciais', slug: 'pages/pos-instalacao/procedimentos' },
                        { label: 'Downgrade de Pacotes', slug: 'pages/pos-instalacao/downgrade' },
                    ],
                },
                {
                    label: 'Customizações',
                    items: [
                        { label: 'Interface Gnome', slug: 'pages/customizacoes/gnome' },
                        { label: 'Customização do Terminal', slug: 'pages/customizacoes/terminal' },
                        { label: 'Terminal Ghostty', slug: 'pages/customizacoes/ghostty' },
                    ],
                },
                {
                    label: 'Gerenciamento de discos',
                    items: [
                        { label: 'Formatação de Dispositivos', slug: 'pages/gerenciamento-de-discos/formatacao' },
                        { label: 'Transferencia de Arquivos via Terminal', slug: 'pages/gerenciamento-de-discos/rsync' },
                        { label: 'RAID0', slug: 'pages/gerenciamento-de-discos/raid0' },
                    ],
                },
                {
                    label: 'Clientes Bitorrent',
                    items: [
                        { label: 'qBittorrent', slug: 'pages/clientes-bitorrent/qbittorrent' },
                        { label: 'rTorrent', slug: 'pages/clientes-bitorrent/rtorrent' },
                    ],
                },
                {
                    label: 'Reference',
                    // Correção 2: 'autogenerate' encapsulado dentro de 'items'
                    items: [{ autogenerate: { directory: 'reference' } }],
                },
            ],
        }),
    ],
});
