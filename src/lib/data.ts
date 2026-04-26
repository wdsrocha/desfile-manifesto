export type Papel = "Marca / Estilista" | "Modelo" | "Produção Executiva";

export interface Pessoa {
  id: string;
  nomeCompleto: string;
  papel: Papel;
  nomeArtisticoOuMarca: string;
  imagemUrl: string;
  instagram: string;
}

export interface MarcaOuCriativo extends Pessoa {
  segmento: string;
}

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

export const marcasECriativos: MarcaOuCriativo[] = [
  {
    id: "marca-eu-tupana",
    nomeCompleto: "Eu tupana",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Eu tupana",
    segmento: "Roupas em geral",
    imagemUrl: "",
    instagram: "@eutupana",
  },
  {
    id: "marca-sup-aspecto",
    nomeCompleto: "Sup Aspecto",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Sup Aspecto",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@sup.aspecto",
  },
  {
    id: "marca-eztrelado",
    nomeCompleto: "Eztrelado",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Eztrelado",
    segmento: "Brechó e upcycling",
    imagemUrl: "",
    instagram: "@eztrelado",
  },
  {
    id: "marca-ariskaland",
    nomeCompleto: "Ariskaland",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ariskaland",
    segmento: "Criativa de moda",
    imagemUrl: "",
    instagram: "@ariskaland",
  },
  {
    id: "marca-biolly",
    nomeCompleto: "Biolly",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Biolly",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@biolly.shantelly",
  },
  {
    id: "marca-fernanda-menezes",
    nomeCompleto: "Ateliê Fernanda Menezes",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê Fernanda Menezes",
    segmento: "Crochê",
    imagemUrl: "",
    instagram: "@ateliefernandamenezes",
  },
  {
    id: "marca-dispiei",
    nomeCompleto: "Dispiei Brechó",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Dispiei Brechó",
    segmento: "Brechó",
    imagemUrl: "",
    instagram: "@brchdispiei",
  },
  {
    id: "marca-hebrom",
    nomeCompleto: "Hebrom",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Hebrom",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@h.e.b.r.o.m",
  },
  {
    id: "marca-paulo-henrique",
    nomeCompleto: "Paulo Henrique",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Paulo Henrique",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@_paulo_henryk",
  },
  {
    id: "marca-auza-dos-santos",
    nomeCompleto: "Auza dos Santos",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Auza dos Santos",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@auzadosantos",
  },
  {
    id: "marca-renata-sampaio",
    nomeCompleto: "Renata Sampaio",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Renata Sampaio",
    segmento: "Biojóias",
    imagemUrl: "",
    instagram: "@design_renatasampaio",
  },
  {
    id: "marca-melanina-am",
    nomeCompleto: "Melanina AM",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Melanina AM",
    segmento: "Afrowear e acessórios",
    imagemUrl: "",
    instagram: "@melanina.am",
  },
  {
    id: "marca-1970",
    nomeCompleto: "Ateliê 1970",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê 1970",
    segmento: "Streetwear",
    imagemUrl: "",
    instagram: "@1970.atelier",
  },
  {
    id: "marca-sapopema",
    nomeCompleto: "Sapopema Biojóias",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Sapopema Biojóias",
    segmento: "Roupas e acessórios com biomateriais",
    imagemUrl: "",
    instagram: "@sapopemabiojoia",
  },
  {
    id: "marca-pacova",
    nomeCompleto: "Pacovã",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Pacovã",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@usepacova",
  },
  {
    id: "marca-badu",
    nomeCompleto: "Badu Brechó",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Badu Brechó",
    segmento: "Brechó e upcycling",
    imagemUrl: "",
    instagram: "@kbaduh",
  },
  {
    id: "marca-derequine",
    nomeCompleto: "Ateliê Derequine",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê Derequine",
    segmento: "Moda indígena",
    imagemUrl: "",
    instagram: "@ateliederequine",
  },
  {
    id: "marca-artsflorlinda",
    nomeCompleto: "Artsflorlinda",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Artsflorlinda",
    segmento: "Crochê",
    imagemUrl: "",
    instagram: "@artsflorlinda",
  },
  {
    id: "marca-rita-prossi",
    nomeCompleto: "Rita Prossi",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Rita Prossi",
    segmento: "Acessórios",
    imagemUrl: "",
    instagram: "@ritaprossi",
  },
  {
    id: "marca-goodstrap",
    nomeCompleto: "Goodstrap",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Goodstrap",
    segmento: "Bolsas e acessórios em couro",
    imagemUrl: "",
    instagram: "@goodstrap.br",
  },
  {
    id: "marca-inaru-eyawa",
    nomeCompleto: "Inaru Eyawa",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Inaru Eyawa",
    segmento: "Acessórios",
    imagemUrl: "",
    instagram: "@inaru.eyawa",
  },
  {
    id: "marca-kurupira",
    nomeCompleto: "Kurupira",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Kurupira",
    segmento: "Acessórios e biojóias",
    imagemUrl: "",
    instagram: "@kurupirabiojoias",
  },
  {
    id: "marca-samba-e-amor",
    nomeCompleto: "Samba e amor camisetaria",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Samba e amor camisetaria",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@sambaeamor.camisetaria",
  },
];

export const modelos: Pessoa[] = [];

export const equipeProducao: Pessoa[] = [
  {
    id: "prod-glicia",
    nomeCompleto: "Glícia Cáuper",
    papel: "Produção Executiva",
    nomeArtisticoOuMarca: "Glícia Cáuper",
    imagemUrl: "",
    instagram: "@gliciacauper",
  },
];

export const produtoraExecutiva = equipeProducao.find(
  (p) => p.id === "prod-glicia",
)!;

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
      { instagram: "@cavalcantte" },
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
