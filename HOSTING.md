# Zynara Hosting Guide

Este guia resume as opções mais práticas para hospedar a Zynara, com foco na parte de IA/LLM e no `voice-assistant`.

## Objetivo

Você tem hoje três caminhos principais:

1. Rodar tudo localmente no seu computador.
2. Rodar a LLM em um servidor próprio barato.
3. Usar um provedor de API/LLM e deixar a hospedagem só para o frontend e backend.

## O que não vale a pena

- Não tente rodar o Ollama dentro da Vercel.
- Vercel é ótima para frontend e funções curtas, mas não para processo longo como servidor de modelo.

Referência:

- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [Ollama API](https://docs.ollama.com/api)

## Opções em ordem de custo

### 1. Local no seu PC

Melhor para:

- testar sem pagar nada
- desenvolver e ajustar prompts
- rodar o `voice-assistant` com menor atrito

Vantagens:

- custo zero
- fácil de depurar
- ótimo para modelos menores com Ollama

Desvantagens:

- precisa deixar seu computador ligado
- não serve para acesso público estável

### 2. VPS barato com CPU

Melhor para:

- manter a Zynara online
- hospedar API e um modelo pequeno/quantizado
- ter URL pública para testes

Opções baratas:

- [Hetzner Cloud](https://www.hetzner.com/cloud/)
- [DigitalOcean Droplets](https://www.digitalocean.com/pricing/droplets)

Observação:

- VPS CPU barata funciona melhor com modelos pequenos.
- Para algo mais pesado, o desempenho pode cair bastante.

### 3. GPU sob demanda

Melhor para:

- modelos mais fortes
- uso eventual
- pagar só quando estiver rodando

Opção útil:

- [Runpod](https://docs.runpod.io/)

Observação:

- costuma sair mais barato que manter GPU ligada o tempo todo
- bom se você quer subir a máquina só quando for usar

### 4. API externa

Melhor para:

- simplicidade
- não gerenciar servidor de modelo
- usar um backend leve

Exemplo:

- Gemini free tier, se a quota permitir
- Ollama Cloud ou outro provedor com API

## Recomendação para a Zynara

Se o seu foco é custo baixo e controle, eu sugiro esta ordem:

1. Comece localmente com Ollama.
2. Se quiser acesso público, suba para uma VPS barata.
3. Se precisar mais qualidade, use GPU sob demanda.
4. Se quiser só rapidez de integração, use uma API externa.

## Melhor cenário por necessidade

### Desenvolvimento

- `voice-assistant` local
- backend local
- frontend local

### Produção barata

- frontend na Vercel
- backend em VPS
- LLM em Ollama na mesma VPS ou em outra máquina

### Produção mais simples

- frontend na Vercel
- backend na VPS
- LLM via API externa

## O que você precisa configurar

### Se for usar o Ollama

Você vai precisar de:

- uma máquina com CPU razoável ou GPU
- o serviço `ollama serve` rodando
- um modelo baixado, como `llama3.2`, `qwen2.5` ou outro leve

### Se for usar API externa

Você vai precisar de:

- `API_KEY`
- `BASE_URL`
- nome do modelo

## Como a Zynara se encaixa nisso

- O frontend pode ficar na Vercel.
- O backend pode ficar em uma VPS.
- O `voice-assistant` pode apontar para a mesma LLM via `.env`.
- Se a LLM mudar, normalmente você só troca a URL e a chave no ambiente.

## Checklist rápido

Antes de subir:

- [ ] escolher onde a LLM vai rodar
- [ ] definir se o frontend vai ficar na Vercel
- [ ] definir se o backend vai ficar separado
- [ ] ajustar `.env`
- [ ] testar o `voice-assistant` localmente
- [ ] confirmar custo mensal antes de ligar produção

## Nota importante

Preços e quotas mudam com frequência. Antes de contratar, confira sempre a página oficial do provedor.

