// Static mock data for the Manifesto landing page. Swap image paths & handles before the show.

export type Papel =
  | "Marca / Estilista"
  | "Direção Criativa"
  | "Modelo"
  | "Produção Executiva"
  | "Direção de Arte"
  | "Beleza"
  | "Cabelo"
  | "Maquiagem"
  | "Styling"
  | "Iluminação"
  | "Sonoplastia"
  | "Fotografia"
  | "Backstage";

export interface Pessoa {
  id: string;
  nomeCompleto: string;
  papel: Papel;
  nomeArtisticoOuMarca: string;
  imagemUrl: string;
  instagram: string;
  whatsappUrl: string;
}

export interface MarcaOuCriativo extends Pessoa {
  segmento: string;
}

export interface LookCreditos {
  marca: string;
  styling: string;
  modelo: string;
}

export interface Look {
  id: string;
  imagemUrl: string;
  title: string;
  creditos: LookCreditos;
}

export interface EventoInfo {
  nome: string;
  edicao: string;
  dataLegivel: string;
  dataPtBr: string;
  dataISO: string;
  local: string;
  conceito: string;
  descricaoLonga: string;
}

export const evento: EventoInfo = {
  nome: "Desfile Manifesto Amazonense",
  edicao: "Semana Fashion Revolution",
  dataLegivel: "26 de Abril de 2026",
  dataPtBr: "26/04/2026",
  dataISO: "2026-04-26",
  local: "Manaus - AM",
  conceito:
    "Um desfile-celebração da moda autoral Amazonense. Roupa como gesto, passarela como discurso.",
  descricaoLonga:
    "Manifesto reúne marcas independentes, modelos e profissionais de bastidores em uma noite editorial única. Cada look é uma frase. Juntos, formam um manifesto sobre o que vestimos — e o que isso diz sobre quem somos.",
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
    whatsappUrl: "",
  },
  {
    id: "marca-sup-aspecto",
    nomeCompleto: "Sup Aspecto",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Sup Aspecto",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@sup.aspecto",
    whatsappUrl: "",
  },
  {
    id: "marca-eztrelado",
    nomeCompleto: "Eztrelado",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Eztrelado",
    segmento: "Brechó e upcycling",
    imagemUrl: "",
    instagram: "@eztrelado",
    whatsappUrl: "",
  },
  {
    id: "marca-ariskaland",
    nomeCompleto: "Ariskaland",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ariskaland",
    segmento: "Criativa de moda",
    imagemUrl: "",
    instagram: "@ariskaland",
    whatsappUrl: "",
  },
  {
    id: "marca-biolly",
    nomeCompleto: "Biolly",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Biolly",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@biolly.shantelly",
    whatsappUrl: "",
  },
  {
    id: "marca-fernanda-menezes",
    nomeCompleto: "Ateliê Fernanda Menezes",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê Fernanda Menezes",
    segmento: "Crochê",
    imagemUrl: "",
    instagram: "@ateliefernandamenezes",
    whatsappUrl: "",
  },
  {
    id: "marca-dispiei",
    nomeCompleto: "Dispiei Brechó",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Dispiei Brechó",
    segmento: "Brechó",
    imagemUrl: "",
    instagram: "@brchdispiei",
    whatsappUrl: "",
  },
  {
    id: "marca-hebrom",
    nomeCompleto: "Hebrom",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Hebrom",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@h.e.b.r.o.m",
    whatsappUrl: "",
  },
  {
    id: "marca-paulo-henrique",
    nomeCompleto: "Paulo Henrique - Sou Manaus",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Paulo Henrique - Sou Manaus",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@_paulo_henryk",
    whatsappUrl: "",
  },
  {
    id: "marca-auza-dos-santos",
    nomeCompleto: "Auza dos Santos",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Auza dos Santos",
    segmento: "Criativo de moda",
    imagemUrl: "",
    instagram: "@auzadosantos",
    whatsappUrl: "",
  },
  {
    id: "marca-renata-sampaio",
    nomeCompleto: "Renata Sampaio",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Renata Sampaio",
    segmento: "Biojóias",
    imagemUrl: "",
    instagram: "@design_renatasampaio",
    whatsappUrl: "",
  },
  {
    id: "marca-melanina-am",
    nomeCompleto: "Melanina AM",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Melanina AM",
    segmento: "Afrowear e acessórios",
    imagemUrl: "",
    instagram: "@melanina.am",
    whatsappUrl: "",
  },
  {
    id: "marca-1970",
    nomeCompleto: "Ateliê 1970",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê 1970",
    segmento: "Streetwear",
    imagemUrl: "",
    instagram: "@1970.atelier",
    whatsappUrl: "",
  },
  {
    id: "marca-sapopema",
    nomeCompleto: "Sapopema Biojóias",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Sapopema Biojóias",
    segmento: "Roupas e acessórios com biomateriais",
    imagemUrl: "",
    instagram: "@sapopemabiojoia",
    whatsappUrl: "",
  },
  {
    id: "marca-pacova",
    nomeCompleto: "Pacovã",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Pacovã",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@usepacova",
    whatsappUrl: "",
  },
  {
    id: "marca-badu",
    nomeCompleto: "Badu Brechó",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Badu Brechó",
    segmento: "Brechó e upcycling",
    imagemUrl: "",
    instagram: "@kbaduh",
    whatsappUrl: "",
  },
  {
    id: "marca-derequine",
    nomeCompleto: "Ateliê Derequine",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Ateliê Derequine",
    segmento: "Moda indígena",
    imagemUrl: "",
    instagram: "@ateliederequine",
    whatsappUrl: "",
  },
  {
    id: "marca-artsflorlinda",
    nomeCompleto: "Artsflorlinda",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Artsflorlinda",
    segmento: "Crochê",
    imagemUrl: "",
    instagram: "@artsflorlinda",
    whatsappUrl: "",
  },
  {
    id: "marca-rita-prossi",
    nomeCompleto: "Rita Prossi",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Rita Prossi",
    segmento: "Acessórios (colares, brincos, bolsas)",
    imagemUrl: "",
    instagram: "@ritaprossi",
    whatsappUrl: "",
  },
  {
    id: "marca-goodstrap",
    nomeCompleto: "Goodstrap",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Goodstrap",
    segmento: "Bolsas e acessórios em couro",
    imagemUrl: "",
    instagram: "@goodstrap.br",
    whatsappUrl: "",
  },
  {
    id: "marca-inaru-eyawa",
    nomeCompleto: "Inaru Eyawa",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Inaru Eyawa",
    segmento: "Acessórios (colares, brincos, bolsas)",
    imagemUrl: "",
    instagram: "@inaru.eyawa",
    whatsappUrl: "",
  },
  {
    id: "marca-kurupira",
    nomeCompleto: "Kurupira",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Kurupira",
    segmento: "Acessórios e biojóias",
    imagemUrl: "",
    instagram: "@kurupirabiojoias",
    whatsappUrl: "",
  },
  {
    id: "marca-samba-e-amor",
    nomeCompleto: "Samba e amor camisetaria",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Samba e amor camisetaria",
    segmento: "Camisetaria",
    imagemUrl: "",
    instagram: "@sambaeamor.camisetaria",
    whatsappUrl: "",
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
    whatsappUrl: "",
  },
];

export const produtoraExecutiva = equipeProducao.find(
  (p) => p.id === "prod-glicia",
)!;
