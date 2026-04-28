export interface LookModelo {
  nome: string;
  instagram?: string;
}

export interface Look {
  id: string;
  modelo?: LookModelo;
  styling?: string[];
}

export interface DesfileFollowUp {
  edicao: string;
  data: string;
  local: string;
}

export interface EventoInfo {
  nome: string;
  edicao: string;
  dataLegivel: string;
  dataPtBr: string;
  dataISO: string;
  local: string;
  conceito: string;
  intro: string;
  descricaoLonga: string;
}

export const evento: EventoInfo = {
  nome: "Desfile Manifesto Amazonense",
  edicao: "Semana Fashion Revolution",
  dataLegivel: "26 de Abril de 2026",
  dataPtBr: "26/04/2026",
  dataISO: "2026-04-26",
  local: "Manaus, AM",
  conceito:
    "Um desfile-manifesto da moda autoral amazonense, aberto e na rua.",
  intro:
    "Manaus veste muitas histórias ao mesmo tempo — indígena, afro e urbana — e raramente as coloca lado a lado. O Manifesto é um gesto coletivo para juntar essa pluralidade na mesma passarela, dentro da Semana Fashion Revolution, semana em que o mundo se pergunta quem faz a moda que vestimos.",
  descricaoLonga:
    "A estreia é em Manaus, no dia 26 de abril, na Faixa Liberada da Av. Getúlio Vargas, dentro da programação da Semana Fashion Revolution. Aprovado em edital do Ministério da Cultura, entre 19 e 24 de maio o Manifesto segue para Aracruz (ES), levando a moda amazonense para a 6ª Teia de Cultura Nacional.",
};

export const proximoDesfile: DesfileFollowUp = {
  edicao: "6ª Teia de Cultura Nacional",
  data: "Entre 19 e 24 de maio",
  local: "Aracruz, ES",
};

export const looks: Look[] = [];

