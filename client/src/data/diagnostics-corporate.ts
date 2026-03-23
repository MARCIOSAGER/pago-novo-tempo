// ─── P.A.G.O. Corporativo — 44 Textos de Diagnóstico Personalizado ──────────
// Cada texto: title, summary (card), analysis (detalhe), recommendation

export interface DiagnosticText {
  title: string;
  summary: string;
  analysis: string;
  recommendation: string;
}

type StatusKey = "solid" | "building" | "fragile" | "collapse";
type SubgroupKey = string;

// P has no subgroups — indexed by status only
// A, G, O indexed by status then subgroup

export const diagnosticTexts: {
  P: Record<StatusKey, DiagnosticText>;
  A: Record<StatusKey, Record<SubgroupKey, DiagnosticText>>;
  G: Record<StatusKey, Record<SubgroupKey, DiagnosticText>>;
  O: Record<StatusKey, Record<SubgroupKey, DiagnosticText>>;
} = {
  // ═══════════════════════════════════════════════════════════════════════════
  // P — PRINCÍPIO (4 textos)
  // ═══════════════════════════════════════════════════════════════════════════
  P: {
    solid: {
      title: "Princípio: Pilar Sólido",
      summary: "Base estabelecida. Princípios claros geram decisões claras — e isso é visível na performance.",
      analysis: "Profissional com base ética sólida e consistência decisória comprovada. Mantém o mesmo padrão de comportamento independentemente da pressão, da audiência ou do custo. Os colegas sabem o que esperar — e essa previsibilidade é um activo organizacional. O desafio não é construir — é transmitir. Princípios que não são comunicados e modelados para a equipa transformam-se em silêncio — e silêncio é interpretado como aprovação do que quer que aconteça.",
      recommendation: "Ideal para liderança, operações estratégicas e alta autonomia. Investir em mentoria onde possa transmitir princípios à equipa. Reavaliação: 12 meses.",
    },
    building: {
      title: "Princípio: Em Construção",
      summary: "Sabe o que acredita e na maioria das situações mantém-se íntegro. Mas há lacunas sob pressão.",
      analysis: "Tem clareza de valores e reconhece quando age fora deles. Na maioria das situações, mantém-se íntegro. Mas há momentos onde a pressão, o cansaço ou a conveniência empurram para fora dos próprios princípios. A diferença entre 'Em Construção' e 'Sólido' não é conhecimento — é automatismo. Um princípio está sólido quando não é preciso decidir se vai segui-lo: ele já tomou a decisão. O trabalho é identificar em qual contexto específico cede.",
      recommendation: "Ambientes estruturados com supervisão moderada. Coaching de consistência decisória. Prazo: 6 meses para reavaliação.",
    },
    fragile: {
      title: "Princípio: Pilar Frágil",
      summary: "Fractura entre o que professa e o que pratica. Princípios declarados cedem quando testados.",
      analysis: "Fractura entre discurso e prática. Princípios frágeis geralmente têm uma de duas origens: ou nunca foram claramente definidos — e o que existe são valores vagos que cedem quando testados — ou foram definidos mas nunca foram reforçados através de decisões com custo real. Princípio que nunca custou nada ainda não foi testado. Gera inconsistência, exaustão e perda de confiança por parte da liderança e dos pares.",
      recommendation: "Risco em posições de confiança ou autonomia. Supervisão próxima e programa de desenvolvimento de base ética. Não indicado para liderança. Prazo: 9 meses com acompanhamento mensal.",
    },
    collapse: {
      title: "Princípio: Em Colapso",
      summary: "Decisões guiadas pela conveniência, não por princípios. Fundamento ausente.",
      analysis: "Colapso silencioso — acontece aos poucos, uma concessão de cada vez. Sem princípios claros, cada decisão precisa de ser tomada do zero — o que gera exaustão, inconsistência e perda de confiança própria. Quando o profissional não confia em si mesmo para ser consistente, começa a evitar decisões difíceis. O ciclo aprofunda-se: quanto mais evita, menos confia, menos decide, menos produz.",
      recommendation: "Acompanhamento intensivo e reestruturação de base decisória. Não deve ocupar posições de confiança ou liderança. Avaliar compatibilidade funcional. Prazo: 3 meses com follow-up semanal.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A — ALINHAMENTO (12 textos)
  // ═══════════════════════════════════════════════════════════════════════════
  A: {
    solid: {
      vertical: {
        title: "Alinhamento Sólido | Subdimensão mais fraca: Vertical",
        summary: "Alinhamento sólido com pares e consigo mesmo, mas a relação com a liderança pode beneficiar de maior profundidade.",
        analysis: "Altamente alinhado que compreende a estratégia e gera coesão. Contudo, a relação com a liderança directa — embora funcional — pode beneficiar de mais transparência, profundidade e comunicação proactiva. Comum em profissionais orientados para resultados que inconscientemente negligenciam a conexão ascendente. A relação com a cadeia de comando não é apenas hierárquica — é estratégica.",
        recommendation: "Funções estratégicas e de interface interdepartamental. Sessões regulares de alinhamento com a liderança — não apenas operacionais, mas estratégicas.",
      },
      horizontal: {
        title: "Alinhamento Sólido | Subdimensão mais fraca: Horizontal",
        summary: "Alinhamento sólido com a liderança e consigo mesmo, mas há tensão relacional com pares.",
        analysis: "Forte aderência à visão e coerência interna, mas com fricção relacional com os pares que drena energia sem que perceba plenamente. Pode ser distância com colegas, um conflito pendente, ou a sensação de que os outros não caminham na mesma direcção. Alinhamento horizontal exige coragem relacional — conversas difíceis, presença real.",
        recommendation: "Identificar o relacionamento profissional que mais drena energia e dar um passo concreto — uma conversa, uma clarificação de expectativas.",
      },
      internal: {
        title: "Alinhamento Sólido | Subdimensão mais fraca: Interno",
        summary: "Alinhamento sólido com a liderança e pares, mas fractura sutil entre quem é e como decide sob pressão.",
        analysis: "Forte alinhamento externo — relação sólida com liderança e pares. Mas existe uma fractura sutil entre quem o profissional é e como toma decisões sob pressão. Pode reflectir busca de aprovação em vez de convicção, ou adaptação excessiva ao contexto. A coerência interna é a dimensão mais difícil de construir porque exige honestidade consigo mesmo.",
        recommendation: "Coaching individual focado em autenticidade decisória. Exercícios de identificação de padrões de adaptação contextual.",
      },
    },
    building: {
      vertical: {
        title: "Alinhamento Em Construção | Subdimensão mais fraca: Vertical",
        summary: "Relação com a liderança inconsistente — dias de conexão real e dias de comunicação mecânica.",
        analysis: "Compreende a direcção mas nem sempre a prioriza. A relação com a liderança é inconsistente — oscila com o estado emocional ou contexto. A liderança percebe isso como falta de compromisso, mesmo quando não é — é falta de consistência relacional. A comunicação ascendente precisa de se tornar uma disciplina, não uma reacção ao momento.",
        recommendation: "Coordenação com suporte. Agenda de check-ins regulares com a liderança. Programa de comunicação estratégica ascendente.",
      },
      horizontal: {
        title: "Alinhamento Em Construção | Subdimensão mais fraca: Horizontal",
        summary: "Relacionamentos profissionais próximos têm atritos não resolvidos que agem como âncora.",
        analysis: "Tem direcção e intenção, mas os relacionamentos profissionais mais próximos apresentam atritos não resolvidos — distâncias subtis, conversas adiadas, expectativas não comunicadas. Esse peso relacional age como âncora: avança, mas carrega algo que diminui o ritmo. É mais fácil estar alinhado com a liderança e consigo mesmo do que com os pares.",
        recommendation: "Programa de desenvolvimento relacional. Identificar o principal atrito relacional e trabalhar com mediação ou coaching de equipa.",
      },
      internal: {
        title: "Alinhamento Em Construção | Subdimensão mais fraca: Interno",
        summary: "Sabe quem quer ser profissionalmente, mas há distância entre essa visão e as escolhas concretas.",
        analysis: "Sabe quem quer ser, mas há distância entre essa visão e as escolhas concretas do quotidiano. A pressão do momento vence a convicção. Comporta-se de forma diferente dependendo da audiência — não por malícia, mas por insegurança ou busca de aprovação. A coerência interna constrói-se em micro-decisões.",
        recommendation: "Coaching de identidade profissional. Exercícios de tomada de decisão baseada em valores, não em contexto.",
      },
    },
    fragile: {
      vertical: {
        title: "Alinhamento Frágil | Subdimensão mais fraca: Vertical",
        summary: "Relação com a liderança comprometida. Falta conexão real, transparência e confiança.",
        analysis: "Desalinhamento significativo com a cadeia de comando. Pode haver actividade profissional visível, mas falta a conexão real, a transparência e a confiança. Resulta em execução mecânica sem compromisso estratégico, ou em resistência passiva. A origem pode ser experiências anteriores negativas com liderança, desconfiança institucional, ou simplesmente nunca ter aprendido a construir relações ascendentes saudáveis.",
        recommendation: "Risco em funções de alinhamento estratégico. Mediação e reconstrução de confiança com a liderança directa. Se desalinhamento cultural: avaliar reposicionamento.",
      },
      horizontal: {
        title: "Alinhamento Frágil | Subdimensão mais fraca: Horizontal",
        summary: "Feridas relacionais abertas ou distância significativa dos pares.",
        analysis: "Conflitos não resolvidos ou distância significativa dos pares. Coexiste frequentemente com alta performance individual — porque é mais fácil relacionar-se com tarefas do que com pessoas. O custo não aparece no curto prazo, mas acumula-se: equipas que não têm coesão relacional quebram sob pressão.",
        recommendation: "Não indicado para liderança de equipas. Funções individuais de alto impacto ou reposicionamento. Programa de reconstrução relacional.",
      },
      internal: {
        title: "Alinhamento Frágil | Subdimensão mais fraca: Interno",
        summary: "Distância considerável entre valores declarados e escolhas concretas.",
        analysis: "As raízes frequentemente estão em busca de aprovação, medo de rejeição ou identidade construída sobre validação externa. O profissional pode ser muito adaptável — mas a adaptabilidade excessiva é falta de ancoragem. Decide conforme o contexto exige, não conforme o que acredita. Gera inconsistência que corrói a confiança ao longo do tempo.",
        recommendation: "Coaching intensivo de identidade e valores. Avaliar se desalinhamento interno é situacional ou estrutural. Não indicado para funções de posicionamento firme.",
      },
    },
    collapse: {
      vertical: {
        title: "Alinhamento Em Colapso | Subdimensão mais fraca: Vertical",
        summary: "Desconexão severa com a liderança. Isolamento estratégico.",
        analysis: "Desalinhamento severo com a cadeia de comando. Pode estar fisicamente presente mas estrategicamente ausente — ou em resistência activa que compromete a execução de directrizes. Frequentemente indica incompatibilidade cultural profunda ou ruptura de confiança não endereçada. Cada dia que o desalinhamento persiste aprofunda o custo organizacional.",
        recommendation: "Intervenção urgente. Avaliar viabilidade de continuidade na função. Mediação estruturada ou reposicionamento funcional imediato.",
      },
      horizontal: {
        title: "Alinhamento Em Colapso | Subdimensão mais fraca: Horizontal",
        summary: "Relacionamentos profissionais severamente comprometidos. Isolamento crescente.",
        analysis: "Relações profissionais mais importantes severamente comprometidas. Isolamento crescente e contradição profunda entre imagem projectada e realidade relacional. Pode estar funcional individualmente mas é tóxico para a dinâmica de equipa. Cada interacção negativa não resolvida amplia o raio de impacto.",
        recommendation: "Avaliação de impacto na equipa. Pode necessitar de separação imediata do grupo actual. Programa de reconstrução relacional intensivo como condição de continuidade.",
      },
      internal: {
        title: "Alinhamento Em Colapso | Subdimensão mais fraca: Interno",
        summary: "Crise de identidade profissional. Contradição profunda entre imagem e realidade.",
        analysis: "Crise de identidade profissional profunda. Não sabe quem é no contexto de trabalho — opera por reacção, adaptação ou sobrevivência. A distância entre o que projecta e o que vive gera exaustão crónica e potencial descompensação. Este não é apenas um problema profissional — é um problema humano que se manifesta no trabalho.",
        recommendation: "Acompanhamento psicológico recomendado antes de qualquer intervenção profissional. Reduzir exposição e responsabilidade. Abordagem humana, não punitiva.",
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // G — GOVERNO (16 textos)
  // ═══════════════════════════════════════════════════════════════════════════
  G: {
    solid: {
      disciplinar: {
        title: "Governo Sólido | Subdimensão mais fraca: Disciplinar",
        summary: "Governa bem em todos os domínios, mas disciplinas de manutenção precisam de mais intenção.",
        analysis: "Governa bem em todos os domínios práticos — emoções reguladas, finanças estruturadas, tempo gerido. Mas as disciplinas pessoais de manutenção (rotina, desenvolvimento contínuo, reflexão) precisam de mais intenção. Governo sem manutenção opera por inércia — e inércia tem prazo de validade. O profissional que não investe em desenvolvimento contínuo está a viver de capital acumulado.",
        recommendation: "Escolher uma disciplina de manutenção para solidificar nos próximos 30 dias. Consistência em uma vale mais que esforço em várias.",
      },
      emocional: {
        title: "Governo Sólido | Subdimensão mais fraca: Emocional",
        summary: "Governa bem em geral, mas em situações específicas as emoções assumem o controlo.",
        analysis: "Governo real e efectivo — finanças, tempo, disciplinas. Mas em situações específicas, as emoções assumem o controlo. Ressentimentos não completamente resolvidos influenciam o julgamento. A emoção é um dado, não um comando — e essa distinção precisa de ser praticada. Cria momentos de imprevisibilidade que afectam a confiança da equipa.",
        recommendation: "Identificar as 3 situações ou pessoas que mais activam reacções emocionais. Para cada uma, definir com antecedência como quer responder. Coaching de inteligência emocional.",
      },
      financeiro: {
        title: "Governo Sólido | Subdimensão mais fraca: Financeiro",
        summary: "Governo real em vários domínios, mas o financeiro apresenta inconsistências.",
        analysis: "Governo real em disciplinas, emoções e tempo. Mas o domínio financeiro — pessoal ou de recursos sob responsabilidade — ainda apresenta inconsistências. Governo financeiro não é sobre quanto ganha — é sobre quanto governa do que ganha. Quem governa mal as próprias finanças tende a governar mal os recursos da organização.",
        recommendation: "Estruturar orçamento pessoal e/ou departamental com métricas claras. Se gere orçamento organizacional, revisão financeira mensal com indicadores.",
      },
      temporal: {
        title: "Governo Sólido | Subdimensão mais fraca: Temporal",
        summary: "Governa bem nos outros domínios, mas a agenda reflecte mais as demandas dos outros.",
        analysis: "Governo efectivo em disciplinas, emoções e finanças. Mas a agenda ainda reflecte mais as demandas dos outros do que as próprias prioridades. A agenda não mente — mostra o que realmente se prioriza, não o que se diz priorizar. Se olhar para a agenda da semana passada, quanto tempo foi dedicado ao que realmente importa?",
        recommendation: "Implementar blocos de tempo protegidos para trabalho estratégico. Praticar a disciplina de dizer não. Rever agenda semanalmente.",
      },
    },
    building: {
      disciplinar: {
        title: "Governo Em Construção | Subdimensão mais fraca: Disciplinar",
        summary: "Disciplinas de manutenção inconsistentes — dias com rotina, dias sem.",
        analysis: "Há intenção e esforço em várias áreas de governo. Mas as disciplinas pessoais são inconsistentes — dias com rotina, dias sem. Desenvolvimento que acontece quando há tempo, não por decisão. Cria um governo que oscila — sólido quando está 'carregado', instável quando não está. Governo que depende do estado emocional não é governo — é gestão de humor.",
        recommendation: "Escolher uma disciplina para solidificar nos próximos 30 dias — apenas uma. Construir essa antes de adicionar outras. Prazo: 6 meses.",
      },
      emocional: {
        title: "Governo Em Construção | Subdimensão mais fraca: Emocional",
        summary: "Em situações de pressão, reacções precedem decisões. Ressentimentos reaparecem.",
        analysis: "Está a construir governo — há estrutura em várias áreas. Mas o governo emocional é inconsistente. Em situações de pressão, as reacções precedem as decisões. Há ressentimentos que acredita ter resolvido mas que reaparecem em conflitos. O cérebro emocional é mais rápido que o racional, e sem treino deliberado, a reacção sempre chega antes da decisão. Regulação emocional é uma competência que se constrói.",
        recommendation: "Programa de desenvolvimento de inteligência emocional. Mapear padrões reactivos e construir respostas predefinidas. Prazo: 9 meses.",
      },
      financeiro: {
        title: "Governo Em Construção | Subdimensão mais fraca: Financeiro",
        summary: "Orçamento que funciona às vezes, dívidas com plano mas sem disciplina.",
        analysis: "Há intenção financeira, talvez um orçamento que funciona às vezes. Mas ainda há inconsistência: meses onde o plano é seguido e meses onde não é, gastos sem decisão consciente, reserva que começa e pára. O inimigo específico: a excepção. 'Este mês foi diferente.' Cada excepção sem consequência real enfraquece o sistema.",
        recommendation: "Identificar o maior vazamento financeiro — onde o dinheiro ou recursos escapam sem decisão consciente. Se gere orçamento organizacional, implementar regra de excepções documentadas.",
      },
      temporal: {
        title: "Governo Em Construção | Subdimensão mais fraca: Temporal",
        summary: "O dia começa com intenção e termina a responder urgências.",
        analysis: "O dia começa com intenção e termina a responder a urgências. As prioridades importantes ficam para depois porque o urgente sempre chega primeiro. Não é um problema de disciplina pessoal — é um problema de sistema. O profissional não precisa de mais vontade — precisa de protecção estrutural do tempo.",
        recommendation: "Implementar sistema de triagem de urgências. Bloquear tempo na agenda para trabalho estratégico como compromisso inamovível. Rever semanalmente.",
      },
    },
    fragile: {
      disciplinar: {
        title: "Governo Frágil | Subdimensão mais fraca: Disciplinar",
        summary: "Disciplinas praticamente inexistentes. Governo opera por reacção.",
        analysis: "As disciplinas pessoais que deveriam sustentar o governo estão ausentes ou são tão inconsistentes que não geram efeito. Sem rotina de manutenção, opera por reacção — resolve o que aparece mas nunca se prepara para o que vem. Padrão de apagar incêndios insustentável a médio prazo.",
        recommendation: "Não indicado para posições de autonomia. Requer supervisão e programa estruturado de construção de hábitos profissionais básicos.",
      },
      emocional: {
        title: "Governo Frágil | Subdimensão mais fraca: Emocional",
        summary: "Emoções no comando em múltiplas situações. Reacções imprevisíveis.",
        analysis: "As emoções assumem o controlo em múltiplas situações — reacções desproporcionais, ressentimentos crónicos, ansiedade que paralisa ou impulsividade que precipita. A equipa ajusta-se ao estado emocional deste profissional em vez de se focar no trabalho. Distinção crítica: pode ser falta de desenvolvimento ou sinal de ferida emocional que precisa de atenção profissional.",
        recommendation: "Avaliar se é problema de desenvolvimento ou de saúde mental. No primeiro caso, programa intensivo de regulação emocional. No segundo, encaminhar para acompanhamento especializado.",
      },
      financeiro: {
        title: "Governo Frágil | Subdimensão mais fraca: Financeiro",
        summary: "Estrutura financeira ausente ou severamente comprometida.",
        analysis: "Sem estrutura financeira real — gastos sem controlo, dívidas sem plano, ausência de planeamento. Se gere orçamento organizacional, este padrão representa risco directo. Mesmo que não gira orçamento, a fragilidade financeira pessoal gera distracção, ansiedade e vulnerabilidade a decisões motivadas por necessidade financeira.",
        recommendation: "Se gere recursos organizacionais: supervisão financeira imediata. Programas de literacia financeira. Não indicado para funções com responsabilidade orçamental significativa.",
      },
      temporal: {
        title: "Governo Frágil | Subdimensão mais fraca: Temporal",
        summary: "Tempo completamente fora de controlo. Agenda dominada por urgências.",
        analysis: "A gestão do tempo está comprometida a um nível que afecta todas as outras dimensões de governo. O tempo é o recurso mais democrático — todos têm o mesmo. A diferença está no governo. Quando o governo temporal é frágil, a energia vai toda para sobreviver ao dia — não sobra para construir.",
        recommendation: "Sistema de gestão de tarefas com supervisão. Reduzir responsabilidades até que consiga governar o que tem. Simplicidade primeiro.",
      },
    },
    collapse: {
      disciplinar: {
        title: "Governo Em Colapso | Subdimensão mais fraca: Disciplinar",
        summary: "Disciplinas inexistentes. Modo de sobrevivência.",
        analysis: "Ausência total de disciplinas de manutenção. Opera em modo de sobrevivência — sem rotina, sem investimento em desenvolvimento, sem momentos de reflexão. Gera deterioração progressiva que afecta todas as outras dimensões. Necessita de reestruturação fundamental, não de optimização.",
        recommendation: "Acompanhamento intensivo com metas semanais mínimas. Avaliar se a causa é circunstancial (crise pessoal) ou estrutural. Abordagem de reconstrução, não de performance.",
      },
      emocional: {
        title: "Governo Em Colapso | Subdimensão mais fraca: Emocional",
        summary: "Emoções completamente no comando. Potencial risco.",
        analysis: "Emoções completamente desreguladas — reacções imprevisíveis, possível agressividade ou retraimento extremo, incapacidade de manter relações profissionais estáveis. Pode indicar situação de saúde mental que requer intervenção profissional. O bem-estar do profissional e a segurança da equipa são prioridade.",
        recommendation: "Encaminhamento para apoio especializado. Reduzir exposição e responsabilidade até estabilização. Abordagem humana e protectora — não punitiva.",
      },
      financeiro: {
        title: "Governo Em Colapso | Subdimensão mais fraca: Financeiro",
        summary: "Finanças sem qualquer estrutura. Risco directo se gere recursos.",
        analysis: "Ausência completa de governo financeiro. Dívidas descontroladas, gastos sem consciência, sem qualquer planeamento. Se gere recursos organizacionais, o risco é imediato e real. A pressão financeira pessoal pode gerar vulnerabilidade a decisões éticas comprometidas.",
        recommendation: "Remover responsabilidade orçamental imediata se aplicável. Programa de reestruturação financeira com acompanhamento profissional. Monitorizar decisões que envolvam recursos.",
      },
      temporal: {
        title: "Governo Em Colapso | Subdimensão mais fraca: Temporal",
        summary: "Tempo completamente fora de controlo. Entregas comprometidas sistematicamente.",
        analysis: "Colapso na gestão do tempo com impacto sistémico. Prazos perdidos sistematicamente, compromissos não cumpridos, incapacidade de gerir até o mínimo necessário. O caos temporal reflecte-se em todas as outras dimensões. Pode indicar sobrecarga, incompatibilidade funcional, ou problema de saúde.",
        recommendation: "Reduzir carga de trabalho drasticamente. Avaliar causa: capacidade, contexto ou saúde. Supervisão directa de entregas com metas diárias simplificadas.",
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O — OBEDIÊNCIA (12 textos)
  // ═══════════════════════════════════════════════════════════════════════════
  O: {
    solid: {
      basica: {
        title: "Obediência Sólida | Subdimensão mais fraca: Básica",
        summary: "Executa em grandes momentos, mas fidelidade no quotidiano tem lacunas.",
        analysis: "Obedece em grandes momentos e tem histórico de execução radical e fruto visível. Mas a fidelidade no quotidiano — cumprimento de compromissos simples, pontualidade nos detalhes — tem lacunas. O radical tem emoção, urgência, impacto. O básico é repetitivo, invisível e não gera aplauso. A grandeza dos actos de execução não compensa a inconsistência no básico.",
        recommendation: "Identificar os 3 processos básicos mais negligenciados e transformá-los em disciplinas inegociáveis. Excelência sustentável constrói-se sobre fundamentos fiéis.",
      },
      radical: {
        title: "Obediência Sólida | Subdimensão mais fraca: Radical",
        summary: "Executa bem no básico e tem resultados, mas resiste quando custo é alto.",
        analysis: "Execução básica sólida e fruto visível. Mas quando a liderança pede algo que não faz sentido imediato ou que tem custo real, ainda há resistência ou atraso. Obediência radical não é cega — é confiança fundamentada. Confiança na liderança que já provou merecer confiança. Se a resistência é a directrizes específicas, avaliar se é problema de confiança ou de discordância legítima.",
        recommendation: "Identificar directrizes pendentes não executadas. Distinguir resistência legítima de resistência por conforto. Diálogo aberto com a liderança.",
      },
      fruto: {
        title: "Obediência Sólida | Subdimensão mais fraca: Fruto",
        summary: "Executa no básico e radical, mas fruto ainda não reflecte plenamente o nível de execução.",
        analysis: "Execução disciplinada e obediente — no básico e no radical. Mas o fruto — resultados mensuráveis e impacto sustentável — ainda não reflecte plenamente o nível de execução. Pode indicar execução recente, motivação por performance em vez de convicção, ou execução em áreas erradas enquanto as áreas de maior impacto ficam sem atenção.",
        recommendation: "Avaliar se execução está focada nas áreas de maior impacto estratégico. Implementar métricas de resultado — não de actividade. Paciência se recente; ajuste de foco se não.",
      },
    },
    building: {
      basica: {
        title: "Obediência Em Construção | Subdimensão mais fraca: Básica",
        summary: "Pratica processos às vezes. Compromissos pendentes.",
        analysis: "Executa em condições favoráveis mas perde consistência nos fundamentos. Há compromissos assumidos que não estão a ser honrados. Estado traiçoeiro: executa o suficiente para se sentir produtivo, mas não o suficiente para libertar o fluxo completo. Um profissional com obediência básica inconsistente cria gargalos que afectam toda a cadeia — porque as pessoas deixam de confiar nos seus prazos.",
        recommendation: "Fazer inventário dos compromissos pendentes. Cumprir cada um antes de assumir novos. Sistema de follow-up semanal. Prazo: 6 meses.",
      },
      radical: {
        title: "Obediência Em Construção | Subdimensão mais fraca: Radical",
        summary: "Executa no básico, mas resiste quando pedido algo difícil.",
        analysis: "Execução básica funcional. Mas quando a liderança pede algo difícil ou com custo concreto, resiste ou adia. Distância entre o que diz acreditar sobre a liderança e a velocidade com que executa quando é difícil. A obediência radical no contexto corporativo não é submissão — é maturidade profissional. É confiar que a liderança tem perspectiva mais ampla.",
        recommendation: "Identificar o que impede o próximo passo de execução. É medo do custo? É necessidade de mais confirmação? Nomear o obstáculo. Diálogo com a liderança.",
      },
      fruto: {
        title: "Obediência Em Construção | Subdimensão mais fraca: Fruto",
        summary: "Está a executar, mas fruto não é consistente.",
        analysis: "Há execução — no básico e, em parte, no radical. Mas o fruto ainda não é consistente. Os resultados oscilam, o impacto na equipa é intermitente. Pode ser execução recente, motivação misturada, ou execução em áreas erradas. A pergunta-chave: os resultados estão a crescer ao longo do tempo ou a oscilar sem direcção?",
        recommendation: "Implementar métricas simples de resultado e acompanhar tendência em 90 dias. Se crescente: questão de tempo. Se oscila: questão de foco.",
      },
    },
    fragile: {
      basica: {
        title: "Obediência Frágil | Subdimensão mais fraca: Básica",
        summary: "Fundamentos comprometidos. Processos básicos não cumpridos.",
        analysis: "Os processos claramente estabelecidos não estão a ser praticados de forma consistente. Pode haver busca por crescimento, interesse em projectos maiores — mas o fundamento básico está comprometido. Sem o básico sólido, o resto não se sustenta. A organização não confia projectos maiores a quem não cumpriu os menores.",
        recommendation: "Supervisão próxima de cumprimento de processos. Accountability. Não delegar responsabilidade adicional até estabilização.",
      },
      radical: {
        title: "Obediência Frágil | Subdimensão mais fraca: Radical",
        summary: "Questiona directrizes sem alternativas. Resistência à autoridade.",
        analysis: "Questiona directrizes de forma não construtiva — resiste, adia ou sabota passivamente. Não se trata de espírito crítico saudável, mas de resistência que bloqueia execução. Pode ter raízes em experiências passadas com liderança abusiva, desconfiança institucional, ou imaturidade profissional. Impacto: perda de velocidade e coesão.",
        recommendation: "Avaliar origem da resistência. Coaching de maturidade executiva. Se persistente: avaliar reposicionamento.",
      },
      fruto: {
        title: "Obediência Frágil | Subdimensão mais fraca: Fruto",
        summary: "Entrega oscilante. Resultados não justificam manutenção na função.",
        analysis: "Resultados não consistentes para justificar a posição actual. Há actividade mas pouco fruto mensurável. Fruto frágil pode indicar: incompatibilidade funcional (pessoa certa no lugar errado), falta de motivação profunda, ou deficiência técnica que nenhum assessment de valores resolve. O P.A.G.O. identifica o padrão — a solução pode exigir intervenção técnica ou decisões difíceis.",
        recommendation: "Avaliar fit funcional. Se sim: programa de performance com metas claras a 90 dias. Se não: reposicionamento estratégico.",
      },
    },
    collapse: {
      basica: {
        title: "Obediência Em Colapso | Subdimensão mais fraca: Básica",
        summary: "Processos ignorados sistematicamente. Compromissos não cumpridos.",
        analysis: "Processos ignorados de forma consistente, directrizes não executadas. Cada dia sem executar o que foi decidido aprofunda o custo organizacional — não apenas em resultados perdidos, mas em confiança destruída. A equipa ajusta-se: para de confiar, para de delegar, para de incluir. O isolamento operacional que resulta é tanto causa como consequência do colapso.",
        recommendation: "Acompanhamento intensivo com metas diárias mínimas. Avaliar viabilidade de continuidade na função. Se crónico e resistente: considerar desvinculação.",
      },
      radical: {
        title: "Obediência Em Colapso | Subdimensão mais fraca: Radical",
        summary: "Resistência activa a directrizes.",
        analysis: "Recusa activa de executar directrizes da liderança. Pode manifestar-se como insubordinação aberta ou sabotagem passiva — ambas com impacto severo. Indica ruptura de confiança institucional que provavelmente não é recuperável sem intervenção drástica. A pergunta organizacional: o custo de manter é inferior ao custo de substituir?",
        recommendation: "Intervenção imediata. Se há causa legítima (liderança abusiva): tratar a causa. Se é padrão pessoal: avaliar desvinculação. Manter compromete toda a equipa.",
      },
      fruto: {
        title: "Obediência Em Colapso | Subdimensão mais fraca: Fruto",
        summary: "Ausência de resultados mensuráveis.",
        analysis: "Ausência total ou quase total de resultados mensuráveis. Presente mas não gera impacto — nem negativo nem positivo, apenas neutro. Essa neutralidade tem custo: ocupa posição que poderia gerar valor, consome recursos sem retorno, e envia mensagem à equipa de que a performance não importa. Ausência de fruto sustentada não se resolve com mais tempo — resolve-se com decisão.",
        recommendation: "Última oportunidade com metas claras a 30 dias, mensuráveis e específicas. Se não houver evolução concreta: reposicionamento ou desvinculação. A organização deve honestidade, não permanência sem propósito.",
      },
    },
  },
};

// ─── Helper para buscar texto de diagnóstico ─────────────────────────────────

export function getDiagnosticText(
  pillar: "P" | "A" | "G" | "O",
  score: number,
  weakestSubgroup: string | null,
): DiagnosticText {
  const status: StatusKey =
    score >= 8 ? "solid" : score >= 5.5 ? "building" : score >= 3 ? "fragile" : "collapse";

  if (pillar === "P") {
    return diagnosticTexts.P[status];
  }

  const pillarTexts = diagnosticTexts[pillar][status] as Record<string, DiagnosticText>;
  const subKey = weakestSubgroup || Object.keys(pillarTexts)[0];
  return pillarTexts[subKey] || Object.values(pillarTexts)[0];
}
