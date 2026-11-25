# Defensor Espacial

Jogo web arcade 2D desenvolvido em HTML5, CSS3 e JavaScript puro. Controle uma nave, destrua meteoros, acumule pontos e registre sua melhor pontuação no ranking local do navegador.

## Prévia

O projeto possui três telas:

1. **Tela inicial** — título, instruções e ranking.
2. **Tela de jogo** — HUD, nave, meteoros, lasers e controles touch.
3. **Game Over** — pontuação final, nome do jogador e ranking atualizado.

## Funcionalidades

- Movimento horizontal da nave.
- Disparos de laser.
- Meteoros gerados aleatoriamente com tamanhos e velocidades diferentes.
- Colisões entre lasers e meteoros.
- Colisões entre meteoros e nave.
- Sistema de pontuação e três vidas.
- Dificuldade progressiva.
- Explosões com partículas.
- Fundo espacial com estrelas animadas.
- Controles por teclado, mouse e toque.
- Disparo automático opcional, ideal para celular.
- Movimento da nave seguindo o mouse no computador.
- Ranking local com as 10 melhores pontuações.
- Opção para limpar o ranking.
- Layout responsivo para computador e celular.

## Controles

### Teclado

| Ação | Teclas |
|---|---|
| Movimentar para a esquerda | `←` ou `A` |
| Movimentar para a direita | `→` ou `D` |
| Atirar | `Espaço` |

### Celular

Use os três botões na parte inferior da tela:

- `←` para mover para a esquerda.
- `●` para atirar.
- `→` para mover para a direita.

### Mouse

| Ação | Controle |
|---|---|
| Movimentar horizontalmente | Mover o cursor sobre o campo do jogo |
| Atirar | Segurar o botão esquerdo do mouse |

Na tela inicial, a opção **Disparo automático** pode ser ativada. Nesse modo, a nave continua atirando sem precisar pressionar Espaço, tocar no botão de tiro ou segurar o botão do mouse. A escolha é salva no navegador.

## Como executar

Não é necessário instalar dependências ou utilizar frameworks.

### Opção 1: Servidor local com Python

Dentro da pasta do projeto, execute:

```bash
python3 -m http.server 4173
```

Depois, abra:

http://127.0.0.1:4173

### Opção 2: Extensão Live Server

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**, caso ainda não esteja instalada.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

## Estrutura do projeto

```text
SpaceWar/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Arquivos

### `index.html`

Contém a estrutura das três telas, o `<canvas>`, o HUD, os controles virtuais, o formulário do Game Over e as listas de ranking.

### `style.css`

Responsável por:

- Tema espacial retrô.
- Cores neon.
- Fundo estrelado.
- Ranking e HUD.
- Responsividade.
- Controles touch.
- Ajustes para telas menores e orientação horizontal.

### `script.js`

Contém toda a lógica do jogo:

- Inicialização e alteração das telas.
- Loop de animação com `requestAnimationFrame`.
- Movimento da nave.
- Disparos e meteoros.
- Física e colisões.
- Pontuação e vidas.
- Explosões com partículas.
- Ranking com `localStorage`.

## Como o loop do jogo funciona

O loop principal é executado pelo método `requestAnimationFrame`.

A cada frame, o programa:

1. Calcula o tempo passado desde o frame anterior.
2. Atualiza a posição da nave, meteoros, lasers e partículas.
3. Verifica colisões.
4. Atualiza pontuação e vidas.
5. Desenha novamente todo o cenário no `<canvas>`.

Isso cria uma animação suave sem alterar a velocidade das ações em diferentes computadores.

## Como as colisões funcionam

Os meteoros possuem uma posição e um raio circular.

Para verificar colisão com a nave ou com um laser, o sistema calcula a distância entre os objetos. Quando essa distância é menor que o tamanho combinado dos objetos, uma colisão é considerada.

Exemplo simples:

```javascript
const dx = objetoA.x - objetoB.x;
const dy = objetoA.y - objetoB.y;
const colidiu = dx * dx + dy * dy < objetoB.radius * objetoB.radius;
```

## Ranking local

O ranking utiliza o `localStorage` do navegador, que permite armazenar dados sem banco de dados ou servidor.

Os registros são armazenados em uma única chave:

```text
astroDefenderRanking
```

Os dados possuem este formato:

```json
[
  { "name": "Piloto", "score": 120 },
  { "name": "Ana", "score": 95 }
]
```

Antes de renderizar o ranking, o JavaScript:

1. Lê os dados salvos.
2. Ordena pela maior pontuação.
3. Mantém somente os 10 primeiros resultados.
4. Atualiza as tabelas das telas inicial e final.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript Vanilla
- HTML5 Canvas
- `requestAnimationFrame`
- `LocalStorage`
- Controles por teclado e ponteiro/touch

## Paleta principal

| Elemento | Cor |
|---|---|
| Fundo espacial | `#0B0C10` |
| Destaque/ciano | `#00F0FF` |
| Texto branco | `#FFFFFF` |
| Meteoro/alerta | `#FF4D4D` |
| Pontuação | `#FFD700` |
| Vida e status positivo | `#00FF88` |

## Possíveis melhorias futuras

- Sons e trilha sonora.
- Pausar e retomar a partida.
- Power-ups temporários.
- Meteoros com tipos diferentes.
- Dificuldade baseada no tempo.
- Modo de tela cheia.
- Animação de entrada no ranking.
- Compartilhamento das pontuações.

## Autoria

Projeto desenvolvido como atividade prática para estudo de desenvolvimento web, jogos 2D no navegador e armazenamento local.
