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

export interface CreditoPessoa {
  nome?: string;
  instagram?: string;
}

export interface CreditoGrupo {
  titulo: string;
  pessoas: CreditoPessoa[];
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

export const creditos: CreditoGrupo[] = [
  {
    titulo: "Elenco",
    pessoas: [
      { instagram: "@travamazonica" },
      { instagram: "@art.delly" },
      { instagram: "@biolly.shantelly" },
      { instagram: "@viquizando" },
      { instagram: "@subprodut0" },
      { instagram: "@oadriel_castro" },
      { instagram: "@dona_navra" },
      { instagram: "@ariskaderi" },
      { instagram: "@dacotamc" },
      { instagram: "@manucarihuazari" },
      { instagram: "@anlyds" },
      { instagram: "@krait_mandaca" },
      { instagram: "@nataliapovoass" },
      { instagram: "@larinha_numbb" },
      { instagram: "@menormc1" },
    ],
  },
  {
    titulo: "Equipe voluntária",
    pessoas: [
      { instagram: "@eumayaalves" },
      { instagram: "@_sou_hi" },
      { instagram: "@lylleabreu" },
      { instagram: "@modatbmpensa" },
      { instagram: "@dione.maciel.90" },
      { instagram: "@holandapaulo" },
      { instagram: "@sharp.freestyle" },
      { nome: "Daina Viana" },
    ],
  },
  {
    titulo: "Fotógrafos",
    pessoas: [
      { instagram: "@cavalcantte" },
      { instagram: "@henrifotografo" },
    ],
  },
  {
    titulo: "Apoio institucional",
    pessoas: [
      { instagram: "@manauscult_" },
      { instagram: "@semjelmanaus" },
    ],
  },
  {
    titulo: "Parceiros oficiais",
    pessoas: [{ instagram: "@prestigehotelmanaus" }],
  },
];
