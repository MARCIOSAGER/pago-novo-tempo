// ─── P.A.G.O. Corporativo — 40 Perguntas de Diagnóstico ─────────────────────
// Linguagem business, sem referências espirituais.
// Pontuação: A=4 (Sólido), B=3 (Em Construção), C=2 (Frágil), D=1 (Colapso)

export type AnswerOption = {
  value: 1 | 2 | 3 | 4;
  label: string;
};

export type Question = {
  id: string;
  pillar: "P" | "A" | "G" | "O";
  subgroup: string | null;
  text: string;
  options: [AnswerOption, AnswerOption, AnswerOption, AnswerOption];
};

export const corporateQuestions: Question[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // P — PRINCÍPIO (10 perguntas, subgroup: null)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "P1",
    pillar: "P",
    subgroup: null,
    text: "Quando enfrento uma decisão difícil e ninguém está observando:",
    options: [
      { value: 4, label: "Ajo de acordo com meus valores independentemente do custo — não preciso deliberar, é automático." },
      { value: 3, label: "Na maioria das vezes mantenho meus valores, mas reconheço situações em que a conveniência vence." },
      { value: 2, label: "Sei o que seria correto, mas frequentemente escolho o caminho mais conveniente quando o custo é alto." },
      { value: 1, label: "Minhas decisões são guiadas principalmente pelo que traz menos atrito no momento." },
    ],
  },
  {
    id: "P2",
    pillar: "P",
    subgroup: null,
    text: "As pessoas ao meu redor conseguem prever como vou agir em situações de pressão:",
    options: [
      { value: 4, label: "Sim, de forma consistente. Meu comportamento sob pressão é o mesmo que em situações normais — as pessoas confiam nisso." },
      { value: 3, label: "Na maioria das vezes sou previsível, mas há situações específicas em que minha reação surpreende até a mim mesmo." },
      { value: 2, label: "Reconheço que sou inconsistente — as pessoas ao meu redor não sabem bem o que esperar de mim sob pressão." },
      { value: 1, label: "Meu comportamento sob pressão é significativamente diferente do meu comportamento normal — e isso já gerou problemas." },
    ],
  },
  {
    id: "P3",
    pillar: "P",
    subgroup: null,
    text: "Quando a empresa ou a liderança toma uma decisão com a qual discordo eticamente:",
    options: [
      { value: 4, label: "Expresso meu ponto de vista claramente nos canais adequados e, se necessário, recuso-me a executar — sem drama, mas sem abrir mão." },
      { value: 3, label: "Expresso minha discordância, mas acabo cedendo se a pressão for suficiente." },
      { value: 2, label: "Reclamo internamente ou com colegas, mas raramente enfrento a situação diretamente." },
      { value: 1, label: "Aceito e executo sem questionar — prefiro não me expor." },
    ],
  },
  {
    id: "P4",
    pillar: "P",
    subgroup: null,
    text: "Consigo nomear com clareza dois ou três critérios profissionais que não estou disposto a negociar em nenhuma circunstância:",
    options: [
      { value: 4, label: "Sim, e já os comuniquei claramente — minha equipa e liderança os conhecem." },
      { value: 3, label: "Sei quais são, mas raramente os articulo para outros — ficam mais como convicções internas." },
      { value: 2, label: "Tenho uma ideia vaga, mas na prática já os negociei mais vezes do que gostaria de admitir." },
      { value: 1, label: "Não consigo nomeá-los com clareza — minhas decisões dependem muito do contexto." },
    ],
  },
  {
    id: "P5",
    pillar: "P",
    subgroup: null,
    text: "Quando cometo um erro profissional:",
    options: [
      { value: 4, label: "Assumo a responsabilidade diretamente, comunico aos envolvidos e corrijo sem rodeios." },
      { value: 3, label: "Assumo quando questionado, mas tenho dificuldade de tomar a iniciativa de reconhecer sem ser cobrado." },
      { value: 2, label: "Busco justificativas ou distribuo a responsabilidade antes de reconhecer minha parte." },
      { value: 1, label: "Evito assumir responsabilidade — isso me coloca em posição vulnerável." },
    ],
  },
  {
    id: "P6",
    pillar: "P",
    subgroup: null,
    text: "Meu comportamento em ambientes informais — almoços, conversas de corredor, grupos de mensagens — é consistente com meu comportamento em reuniões formais:",
    options: [
      { value: 4, label: "Sim, completamente. Sou o mesmo independentemente do contexto ou da audiência." },
      { value: 3, label: "Quase sempre, mas reconheço que em ambientes informais algumas inconsistências aparecem." },
      { value: 2, label: "Há diferença significativa — no informal sou mais propenso a agir fora dos valores que declaro." },
      { value: 1, label: "São contextos muito diferentes na prática — não vejo problema nisso." },
    ],
  },
  {
    id: "P7",
    pillar: "P",
    subgroup: null,
    text: "Quando percebo que um colega ou parceiro está agindo de forma antiética:",
    options: [
      { value: 4, label: "Endereço diretamente ou pelos canais adequados — independentemente do custo relacional ou político." },
      { value: 3, label: "Depende de quanto isso me afeta diretamente. Se não for meu problema imediato, geralmente fico em silêncio." },
      { value: 2, label: "Prefiro não me envolver — cada um é responsável por suas próprias escolhas." },
      { value: 1, label: "Normalizo ou ignoro — esse tipo de coisa é comum em ambientes corporativos." },
    ],
  },
  {
    id: "P8",
    pillar: "P",
    subgroup: null,
    text: "A consistência entre o que declaro como valores profissionais e o que efetivamente pratico no dia a dia:",
    options: [
      { value: 4, label: "É alta. Quem me observa por tempo suficiente consegue identificar claramente o que não negocio." },
      { value: 3, label: "É razoável na maioria dos contextos, mas há áreas específicas onde a lacuna entre discurso e prática é visível." },
      { value: 2, label: "É baixa. Reconheço que há distância significativa entre o que digo valorizar e o que de fato pratico." },
      { value: 1, label: "Não reflito muito sobre isso — ajo conforme o que cada situação exige." },
    ],
  },
  {
    id: "P9",
    pillar: "P",
    subgroup: null,
    text: "Quando um atalho antiético me traria vantagem real sem risco aparente de ser descoberto:",
    options: [
      { value: 4, label: "Não considero. Não é uma questão de risco — é uma questão de princípio." },
      { value: 3, label: "Reconheço a tentação, mas na maioria das vezes não cedo — embora já tenha cedido em algumas situações." },
      { value: 2, label: "Avalio caso a caso. Se o benefício for significativo e o risco baixo, já tomei esse caminho." },
      { value: 1, label: "O risco de ser descoberto é o principal fator que me impede — não o princípio em si." },
    ],
  },
  {
    id: "P10",
    pillar: "P",
    subgroup: null,
    text: "Minha capacidade de transmitir e modelar valores para a equipa ou colegas ao meu redor:",
    options: [
      { value: 4, label: "É forte e intencional — as pessoas ao meu redor conseguem nomear o que representa minha forma de trabalhar." },
      { value: 3, label: "Acontece mais por exemplo do que por intenção — mas reconheço que poderia ser mais deliberado nisso." },
      { value: 2, label: "Raramente penso nisso — foco no meu trabalho e deixo cada um desenvolver seus próprios critérios." },
      { value: 1, label: "Não me vejo nesse papel — transmitir valores não é minha responsabilidade profissional." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A — ALINHAMENTO (10 perguntas)
  // vertical: A1-A3 | horizontal: A4-A6 | internal: A7-A10
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "A1",
    pillar: "A",
    subgroup: "vertical",
    text: "Minha compreensão da direção estratégica da organização e do que a liderança espera de mim:",
    options: [
      { value: 4, label: "É clara e atualizada — consigo traduzir a estratégia em prioridades concretas no meu trabalho diário." },
      { value: 3, label: "É razoável, mas há lacunas — nem sempre tenho clareza sobre como meu trabalho conecta à visão maior." },
      { value: 2, label: "É limitada — trabalho focado nas minhas tarefas sem visão clara do contexto estratégico mais amplo." },
      { value: 1, label: "É praticamente inexistente — não sei bem para onde a organização está indo ou o que a liderança prioriza." },
    ],
  },
  {
    id: "A2",
    pillar: "A",
    subgroup: "vertical",
    text: "Quando recebo uma diretriz da liderança com a qual não concordo:",
    options: [
      { value: 4, label: "Expresso minha perspectiva de forma construtiva nos canais adequados e, após ouvido, executo com comprometimento." },
      { value: 3, label: "Expresso discordância, mas o faço de forma que às vezes gera mais ruído do que resolução." },
      { value: 2, label: "Concordo na superfície mas executo com resistência passiva — faço, mas sem comprometimento real." },
      { value: 1, label: "Questiono abertamente ou ignoro — não consigo executar bem algo com que não concordo." },
    ],
  },
  {
    id: "A3",
    pillar: "A",
    subgroup: "vertical",
    text: "Minha relação com a liderança direta em termos de transparência e comunicação:",
    options: [
      { value: 4, label: "É sólida e genuína — comunico proativamente, incluindo más notícias, e confio na relação." },
      { value: 3, label: "É funcional, mas superficial — cumpro o que é pedido mas raramente vou além do necessário na comunicação." },
      { value: 2, label: "É tensa ou distante — há desconforto em ser transparente com minha liderança direta." },
      { value: 1, label: "É comprometida — há falta de confiança real de um ou ambos os lados." },
    ],
  },
  {
    id: "A4",
    pillar: "A",
    subgroup: "horizontal",
    text: "Meus relacionamentos profissionais com colegas e pares:",
    options: [
      { value: 4, label: "São sólidos e produtivos — há confiança mútua, comunicação clara e capacidade de resolver conflitos diretamente." },
      { value: 3, label: "São funcionais na maioria dos casos, mas há relacionamentos específicos com tensão não resolvida." },
      { value: 2, label: "São superficiais ou fragmentados — coopero quando necessário, mas não há profundidade real." },
      { value: 1, label: "São problemáticos — há conflitos ativos, distâncias significativas ou dinâmicas que estão prejudicando o trabalho." },
    ],
  },
  {
    id: "A5",
    pillar: "A",
    subgroup: "horizontal",
    text: "Quando há conflito ou tensão com um colega ou par:",
    options: [
      { value: 4, label: "Endereço diretamente e com celeridade — prefiro uma conversa difícil a deixar a situação se deteriorar." },
      { value: 3, label: "Endereço eventualmente, mas costumo adiar mais do que seria ideal." },
      { value: 2, label: "Evito o confronto direto — prefiro contornar ou esperar que o tempo resolva." },
      { value: 1, label: "O conflito tende a escalar ou se cristalizar — raramente consigo resolver bem essas situações." },
    ],
  },
  {
    id: "A6",
    pillar: "A",
    subgroup: "horizontal",
    text: "Minha presença e disponibilidade para a equipa e colegas que dependem de mim:",
    options: [
      { value: 4, label: "Sou genuinamente presente — as pessoas ao meu redor sentem que podem contar comigo além do operacional." },
      { value: 3, label: "Estou disponível para o trabalho, mas reconheço que minha presença relacional poderia ser mais profunda." },
      { value: 2, label: "Sou presente quando conveniente — minha disponibilidade depende muito da minha carga e estado de ânimo." },
      { value: 1, label: "Sou percebido como distante ou inacessível — já recebi esse feedback direta ou indiretamente." },
    ],
  },
  {
    id: "A7",
    pillar: "A",
    subgroup: "internal",
    text: "Meu comportamento profissional é consistente independentemente da audiência:",
    options: [
      { value: 4, label: "Sim — sou o mesmo com a liderança, com os pares, com a equipa e quando estou sozinho." },
      { value: 3, label: "Quase sempre, mas reconheço que ajusto meu comportamento em função de quem está presente." },
      { value: 2, label: "Há diferença visível — sou significativamente diferente dependendo de quem está observando." },
      { value: 1, label: "Minha postura muda bastante conforme o contexto social — adoto o que parece mais adequado a cada situação." },
    ],
  },
  {
    id: "A8",
    pillar: "A",
    subgroup: "internal",
    text: "Minhas decisões profissionais são guiadas principalmente por:",
    options: [
      { value: 4, label: "Meus valores e convicções — mesmo quando isso implica custo político ou relacional." },
      { value: 3, label: "Uma combinação de valores e busca de aprovação — nem sempre consigo separar os dois." },
      { value: 2, label: "Principalmente pelo que vai gerar aceitação ou evitar conflito — reconheço que a busca por aprovação pesa muito." },
      { value: 1, label: "Pelo que a situação exige no momento — não tenho um conjunto claro de valores que oriente minhas decisões." },
    ],
  },
  {
    id: "A9",
    pillar: "A",
    subgroup: "internal",
    text: "A coerência entre quem me apresento ser profissionalmente e quem sei que sou na prática:",
    options: [
      { value: 4, label: "É alta — não carrego contradições significativas entre minha imagem projetada e minha realidade interna." },
      { value: 3, label: "É razoável, mas há áreas onde sei que há distância entre o que projeto e o que de fato pratico." },
      { value: 2, label: "É baixa — há uma lacuna considerável entre a imagem que apresento e quem sei que sou." },
      { value: 1, label: "É muito baixa — mantenho uma fachada profissional que não reflete minha realidade interna." },
    ],
  },
  {
    id: "A10",
    pillar: "A",
    subgroup: "internal",
    text: "Quando recebo feedback crítico sobre meu trabalho ou comportamento:",
    options: [
      { value: 4, label: "Recebo com abertura genuína — consigo separar o feedback da minha identidade e usar como dado para crescimento." },
      { value: 3, label: "Recebo razoavelmente bem, mas reconheço que meu ego entra em cena mais do que gostaria." },
      { value: 2, label: "Tenho dificuldade real — feedback crítico me coloca na defensiva ou afeta meu desempenho por um período." },
      { value: 1, label: "Evito situações onde receberia feedback crítico — ou não consigo processá-lo de forma produtiva." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // G — GOVERNO (10 perguntas)
  // disciplinar: G1-G2 | emocional: G3-G5 | financeiro: G6-G7 | temporal: G8-G10
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "G1",
    pillar: "G",
    subgroup: "disciplinar",
    text: "Minhas rotinas de desenvolvimento profissional e manutenção pessoal:",
    options: [
      { value: 4, label: "São consistentes e estruturadas — tenho práticas estabelecidas que sustentam minha performance a longo prazo." },
      { value: 3, label: "Existem com alguma regularidade, mas são inconsistentes — dependem do meu estado de ânimo ou disponibilidade." },
      { value: 2, label: "São esporádicas — acontecem quando sobra tempo, o que raramente ocorre." },
      { value: 1, label: "Praticamente inexistentes — opero em modo reativo e não invisto em manutenção deliberada." },
    ],
  },
  {
    id: "G2",
    pillar: "G",
    subgroup: "disciplinar",
    text: "Minha capacidade de manter performance consistente independentemente do meu estado emocional ou motivacional:",
    options: [
      { value: 4, label: "É alta — tenho estrutura e rotinas que funcionam mesmo quando não estou motivado ou as condições são adversas." },
      { value: 3, label: "É razoável — funciono bem quando estou bem, mas minha performance oscila com meu estado interno." },
      { value: 2, label: "É baixa — minha produtividade depende muito de como estou me sentindo no dia." },
      { value: 1, label: "É muito baixa — sem motivação externa ou estado emocional favorável, minha performance cai significativamente." },
    ],
  },
  {
    id: "G3",
    pillar: "G",
    subgroup: "emocional",
    text: "Em situações de pressão, conflito ou crise no trabalho:",
    options: [
      { value: 4, label: "Mantenho lucidez e respondo de forma deliberada — a emoção informa, mas não comanda minha reação." },
      { value: 3, label: "Na maioria das vezes me mantenho, mas há situações específicas em que reajo antes de pensar." },
      { value: 2, label: "Frequentemente minhas reações emocionais precedem minhas decisões — e isso já gerou problemas concretos." },
      { value: 1, label: "Perco o controle com alguma frequência — minhas reações em situações de pressão são um problema reconhecido." },
    ],
  },
  {
    id: "G4",
    pillar: "G",
    subgroup: "emocional",
    text: "Ressentimentos ou mágoas profissionais não resolvidos que ainda influenciam meu comportamento:",
    options: [
      { value: 4, label: "Não carrego — processo situações difíceis e sigo em frente sem deixar resíduo que afete meu julgamento." },
      { value: 3, label: "Tenho alguns, mas consigo identificá-los e gerenciá-los de forma que não comprometam muito minhas decisões." },
      { value: 2, label: "Carrego alguns ressentimentos que sei que influenciam como me relaciono com certas pessoas ou situações." },
      { value: 1, label: "Carrego ressentimentos significativos que afetam visivelmente meu comportamento profissional." },
    ],
  },
  {
    id: "G5",
    pillar: "G",
    subgroup: "emocional",
    text: "Minha capacidade de tomar decisões de qualidade sob pressão de tempo e informação incompleta:",
    options: [
      { value: 4, label: "É boa — consigo decidir com o que tenho, assumir a responsabilidade e ajustar conforme necessário." },
      { value: 3, label: "É razoável — decido, mas não sem antes acumular mais ansiedade do que seria ideal." },
      { value: 2, label: "É limitada — sob pressão real, tendo a paralisar, delegar ou decidir impulsivamente." },
      { value: 1, label: "É muito limitada — situações de alta pressão comprometem significativamente minha capacidade decisória." },
    ],
  },
  {
    id: "G6",
    pillar: "G",
    subgroup: "financeiro",
    text: "Minha estrutura financeira pessoal — orçamento, dívidas, reserva de emergência:",
    options: [
      { value: 4, label: "É sólida e organizada — tenho orçamento claro, dívidas sob controle com plano definido e reserva consolidada." },
      { value: 3, label: "É razoável mas inconsistente — tenho alguma estrutura, mas há meses que funciona e meses que não." },
      { value: 2, label: "É frágil — não tenho orçamento consistente, há dívidas sem plano claro ou reserva inexistente." },
      { value: 1, label: "É crítica — há instabilidade financeira real que gera ansiedade crônica e afeta minha concentração no trabalho." },
    ],
  },
  {
    id: "G7",
    pillar: "G",
    subgroup: "financeiro",
    text: "Minha tomada de decisões financeiras — gastos, investimentos, compromissos:",
    options: [
      { value: 4, label: "É estruturada e consciente — decido com base em critérios claros, não por impulso ou pressão externa." },
      { value: 3, label: "É razoável na maioria das vezes, mas reconheço decisões impulsivas ou mal planejadas com alguma frequência." },
      { value: 2, label: "É frequentemente reativa — gasto quando tenho, comprometo sem planejar e lido com as consequências depois." },
      { value: 1, label: "É desorganizada — não tenho visibilidade real sobre minha situação financeira e evito olhar para isso." },
    ],
  },
  {
    id: "G8",
    pillar: "G",
    subgroup: "temporal",
    text: "Minha agenda semanal reflete minhas prioridades reais:",
    options: [
      { value: 4, label: "Sim — planejo deliberadamente e protejo tempo para o que é importante antes que o urgente tome tudo." },
      { value: 3, label: "Parcialmente — tenho intenção, mas a agenda acaba sendo dominada por demandas externas na maioria das semanas." },
      { value: 2, label: "Pouco — minha semana é majoritariamente reativa, respondendo ao que chega primeiro." },
      { value: 1, label: "Não — minha agenda é completamente controlada por demandas externas e urgências." },
    ],
  },
  {
    id: "G9",
    pillar: "G",
    subgroup: "temporal",
    text: "Minha capacidade de dizer não a demandas, reuniões ou compromissos que não se alinham com minhas prioridades:",
    options: [
      { value: 4, label: "É boa — consigo recusar com clareza e sem culpa quando algo não é prioridade real." },
      { value: 3, label: "É razoável, mas ainda aceito compromissos por culpa ou pressão com mais frequência do que gostaria." },
      { value: 2, label: "É limitada — tenho dificuldade real de dizer não, o que faz meu tempo ser parcialmente governado pelas expectativas dos outros." },
      { value: 1, label: "É muito limitada — raramente recuso demandas, independentemente de serem prioridade ou não." },
    ],
  },
  {
    id: "G10",
    pillar: "G",
    subgroup: "temporal",
    text: "A relação entre o tempo que invisto e o impacto que gero:",
    options: [
      { value: 4, label: "É clara e intencional — sei onde meu tempo gera mais valor e protejo esse espaço deliberadamente." },
      { value: 3, label: "É razoável, mas reconheço que desperdício tempo significativo em atividades de baixo impacto." },
      { value: 2, label: "É nebulosa — trabalho muito mas nem sempre sei se estou investindo tempo no que realmente move o resultado." },
      { value: 1, label: "É preocupante — estou ocupado quase todo o tempo, mas sinto que avanço pouco no que realmente importa." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O — OBEDIÊNCIA (10 perguntas)
  // basica: O1-O3 | radical: O4-O6 | fruto: O7-O10
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "O1",
    pillar: "O",
    subgroup: "basica",
    text: "Meu cumprimento de prazos e compromissos assumidos:",
    options: [
      { value: 4, label: "É consistente e confiável — quando assumo algo, entrego. As pessoas ao meu redor sabem disso." },
      { value: 3, label: "É razoável na maioria dos casos, mas há compromissos específicos que não honro com a consistência que deveria." },
      { value: 2, label: "É irregular — cumpro quando conveniente ou quando há cobrança, mas não de forma sistemática." },
      { value: 1, label: "É problemático — o descumprimento de prazos e compromissos é um padrão reconhecido por mim e pelos outros." },
    ],
  },
  {
    id: "O2",
    pillar: "O",
    subgroup: "basica",
    text: "Minha aderência aos processos e protocolos estabelecidos pela organização:",
    options: [
      { value: 4, label: "É alta — sigo os processos mesmo quando acho que poderia fazer diferente, e sugiro melhorias pelos canais adequados." },
      { value: 3, label: "É razoável, mas adapto processos conforme meu julgamento com mais frequência do que seria ideal." },
      { value: 2, label: "É seletiva — sigo os processos que concordo e contorno os que considero desnecessários." },
      { value: 1, label: "É baixa — vejo processos como burocracia e frequentemente os ignoro quando não me parecem úteis." },
    ],
  },
  {
    id: "O3",
    pillar: "O",
    subgroup: "basica",
    text: "Minha fidelidade às pequenas responsabilidades do dia a dia — emails respondidos, tarefas concluídas, detalhes cumpridos:",
    options: [
      { value: 4, label: "É alta — sou confiável no detalhe, não apenas nos grandes projetos." },
      { value: 3, label: "É razoável nos itens de alta visibilidade, mas tenho lacunas nos compromissos menores ou de menor urgência." },
      { value: 2, label: "É inconsistente — frequentemente coisas pequenas ficam abertas ou são esquecidas." },
      { value: 1, label: "É baixa — há um rastro visível de itens incompletos, pendências não resolvidas e detalhes negligenciados." },
    ],
  },
  {
    id: "O4",
    pillar: "O",
    subgroup: "radical",
    text: "Quando recebo uma diretriz estratégica que considero equivocada mas que vem com respaldo da liderança:",
    options: [
      { value: 4, label: "Expresso minha perspectiva com dados e argumentos, e após ouvido, executo com total comprometimento." },
      { value: 3, label: "Executo, mas com reservas internas que às vezes comprometem a qualidade ou a velocidade da minha entrega." },
      { value: 2, label: "Executo parcialmente — adapto ao que considero correto sem comunicar formalmente minha discordância." },
      { value: 1, label: "Resisto ativamente ou ignoro — tenho dificuldade real em executar algo com que discordo profundamente." },
    ],
  },
  {
    id: "O5",
    pillar: "O",
    subgroup: "radical",
    text: "Quando a execução de uma decisão exige sair da minha zona de conforto ou assumir riscos reais:",
    options: [
      { value: 4, label: "Avanço — a confiança na direção e no processo é suficiente para me mover mesmo sem garantias." },
      { value: 3, label: "Avanço com mais lentidão do que seria ideal — preciso de mais confirmações antes de me comprometer." },
      { value: 2, label: "Costumo resistir ou adiar até que o cenário pareça mais seguro ou claro." },
      { value: 1, label: "Evito — prefiro não me comprometer com situações de alto risco ou alta incerteza." },
    ],
  },
  {
    id: "O6",
    pillar: "O",
    subgroup: "radical",
    text: "Há decisões ou diretrizes que já foram comunicadas claramente e que ainda não executei:",
    options: [
      { value: 4, label: "Não — quando algo é decidido, executo. Não carrego pendências de execução por resistência." },
      { value: 3, label: "Talvez uma ou duas situações onde estou procrastinando mais do que deveria." },
      { value: 2, label: "Sim — reconheço que há itens claros na minha lista que estou evitando executar sem justificativa real." },
      { value: 1, label: "Sim, vários — há um padrão de adiar execuções difíceis ou desconfortáveis que já foi notado." },
    ],
  },
  {
    id: "O7",
    pillar: "O",
    subgroup: "fruto",
    text: "Os resultados concretos e mensuráveis que gero no meu trabalho:",
    options: [
      { value: 4, label: "São consistentes e reconhecidos — tenho histórico claro de entregas que impactam resultados reais." },
      { value: 3, label: "São razoáveis, mas reconheço que meu impacto poderia ser mais consistente e mensurável." },
      { value: 2, label: "São abaixo do meu potencial — trabalho muito, mas o fruto concreto é menos do que deveria ser." },
      { value: 1, label: "São difíceis de mensurar ou são claramente insuficientes — tenho atividade, mas pouco resultado real." },
    ],
  },
  {
    id: "O8",
    pillar: "O",
    subgroup: "fruto",
    text: "Minha motivação para executar e entregar bem:",
    options: [
      { value: 4, label: "É principalmente intrínseca — entrego bem porque me importo com o resultado, não para ser reconhecido." },
      { value: 3, label: "É uma combinação de convicção e busca de reconhecimento — funciona, mas reconheço que o reconhecimento pesa muito." },
      { value: 2, label: "É principalmente externa — minha qualidade de execução depende fortemente de reconhecimento ou cobrança." },
      { value: 1, label: "É baixa — tenho dificuldade de manter motivação para executar com qualidade de forma consistente." },
    ],
  },
  {
    id: "O9",
    pillar: "O",
    subgroup: "fruto",
    text: "O impacto do meu trabalho nas pessoas ao meu redor — equipa, colegas, clientes:",
    options: [
      { value: 4, label: "É visível e positivo — minha presença e entregas elevam o resultado coletivo de forma reconhecida." },
      { value: 3, label: "É razoável, mas reconheço que poderia gerar mais impacto nas pessoas ao meu redor do que gero atualmente." },
      { value: 2, label: "É limitado — meu foco tende a ser no meu próprio trabalho, com pouca atenção ao impacto nos outros." },
      { value: 1, label: "É negativo ou neutro — não percebo que minha presença eleva o resultado da equipa ou dos colegas." },
    ],
  },
  {
    id: "O10",
    pillar: "O",
    subgroup: "fruto",
    text: "A consistência entre o esforço que invisto e o resultado que entrego:",
    options: [
      { value: 4, label: "É boa — trabalho de forma inteligente e o resultado reflete o esforço de forma proporcional e mensurável." },
      { value: 3, label: "É razoável, mas reconheço desperdício de esforço em atividades que geram pouco resultado real." },
      { value: 2, label: "É baixa — invisto muito esforço mas o retorno em resultado concreto é frustrante." },
      { value: 1, label: "É muito baixa — há uma desconexão clara entre quanto me esforço e o que de fato entrego." },
    ],
  },
];

// ─── Helpers de Pontuação ────────────────────────────────────────────────────

export function calcPillarScore(
  answers: Record<string, 1 | 2 | 3 | 4>,
  pillar: "P" | "A" | "G" | "O",
): number {
  const pillarQuestions = corporateQuestions.filter((q) => q.pillar === pillar);
  const sum = pillarQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const max = pillarQuestions.length * 4;
  return parseFloat(((sum / max) * 10).toFixed(2));
}

export function getWeakestSubgroup(
  answers: Record<string, 1 | 2 | 3 | 4>,
  pillar: "A" | "G" | "O",
): string {
  const subgroups = Array.from(
    new Set(
      corporateQuestions
        .filter((q) => q.pillar === pillar && q.subgroup)
        .map((q) => q.subgroup as string),
    ),
  );

  return subgroups.reduce((weakest, sg) => {
    const sgQuestions = corporateQuestions.filter((q) => q.subgroup === sg);
    const sgAvg =
      sgQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0) /
      sgQuestions.length;
    const weakestQuestions = corporateQuestions.filter(
      (q) => q.subgroup === weakest,
    );
    const weakestAvg =
      weakestQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0) /
      weakestQuestions.length;
    return sgAvg < weakestAvg ? sg : weakest;
  }, subgroups[0]);
}

export function calcSubgroupScore(
  answers: Record<string, 1 | 2 | 3 | 4>,
  subgroup: string,
): number {
  const sgQuestions = corporateQuestions.filter((q) => q.subgroup === subgroup);
  if (sgQuestions.length === 0) return 0;
  const sum = sgQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const max = sgQuestions.length * 4;
  return parseFloat(((sum / max) * 10).toFixed(2));
}
