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

const wa = (numero: string, msg = "Oi! Vi seu trabalho no Desfile Manifesto Amazonense") =>
  `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

// 19 looks — ordem da passarela.
export const looks: Look[] = [
  {
    id: "look-01",
    imagemUrl: "/looks/look-01.jpg",
    title: "Look 01 — Abertura",
    creditos: {
      marca: "Vestido fluido em seda — Atelier Norte",
      styling: "Helena Vidal",
      modelo: "Júlia Marques",
    },
  },
  {
    id: "look-02",
    imagemUrl: "/looks/look-02.jpg",
    title: "Look 02 — Pedra",
    creditos: {
      marca: "Conjunto alfaiataria desconstruída — Casa Mura",
      styling: "Helena Vidal",
      modelo: "Beatriz Aoki",
    },
  },
  {
    id: "look-03",
    imagemUrl: "/looks/look-03.jpg",
    title: "Look 03 — Cinza Concreto",
    creditos: {
      marca: "Trench oversized em lã — Liame",
      styling: "Rafael Penha",
      modelo: "Ian Costa",
    },
  },
  {
    id: "look-04",
    imagemUrl: "/looks/look-04.jpg",
    title: "Look 04 — Pólen",
    creditos: {
      marca: "Vestido midi em viscose — Florbela",
      styling: "Helena Vidal",
      modelo: "Ana Lúcia Reis",
    },
  },
  {
    id: "look-05",
    imagemUrl: "/looks/look-05.jpg",
    title: "Look 05 — Maré",
    creditos: {
      marca: "Conjunto crochê artesanal — Maré Atelier",
      styling: "Rafael Penha",
      modelo: "Dandara Nogueira",
    },
  },
  {
    id: "look-06",
    imagemUrl: "/looks/look-06.jpg",
    title: "Look 06 — Brasa",
    creditos: {
      marca: "Vestido com bordado manual — Casa Mura",
      styling: "Helena Vidal",
      modelo: "Sofia Andrade",
    },
  },
  {
    id: "look-07",
    imagemUrl: "/looks/look-07.jpg",
    title: "Look 07 — Esqueleto",
    creditos: {
      marca: "Alfaiataria estruturada — Liame",
      styling: "Rafael Penha",
      modelo: "Gabriel Tavares",
    },
  },
  {
    id: "look-08",
    imagemUrl: "/looks/look-08.jpg",
    title: "Look 08 — Salina",
    creditos: {
      marca: "Vestido drapeado em jersey — Atelier Norte",
      styling: "Helena Vidal",
      modelo: "Yara Mendes",
    },
  },
  {
    id: "look-09",
    imagemUrl: "/looks/look-09.jpg",
    title: "Look 09 — Lavoura",
    creditos: {
      marca: "Macacão em linho cru — Florbela",
      styling: "Rafael Penha",
      modelo: "Pedro Itamar",
    },
  },
  {
    id: "look-10",
    imagemUrl: "/looks/look-10.jpg",
    title: "Look 10 — Meio do Caminho",
    creditos: {
      marca: "Camisa e saia em algodão pima — Liame",
      styling: "Helena Vidal",
      modelo: "Júlia Marques",
    },
  },
  {
    id: "look-11",
    imagemUrl: "/looks/look-11.jpg",
    title: "Look 11 — Vento Sul",
    creditos: {
      marca: "Sobreposição em tricô leve — Maré Atelier",
      styling: "Rafael Penha",
      modelo: "Beatriz Aoki",
    },
  },
  {
    id: "look-12",
    imagemUrl: "/looks/look-12.jpg",
    title: "Look 12 — Cobre",
    creditos: {
      marca: "Vestido com aplicação metálica — Atelier Norte",
      styling: "Helena Vidal",
      modelo: "Sofia Andrade",
    },
  },
  {
    id: "look-13",
    imagemUrl: "/looks/look-13.jpg",
    title: "Look 13 — Madrugada",
    creditos: {
      marca: "Conjunto preto de alfaiataria — Casa Mura",
      styling: "Rafael Penha",
      modelo: "Ian Costa",
    },
  },
  {
    id: "look-14",
    imagemUrl: "/looks/look-14.jpg",
    title: "Look 14 — Veludo",
    creditos: {
      marca: "Blazer em veludo cotelê — Liame",
      styling: "Helena Vidal",
      modelo: "Dandara Nogueira",
    },
  },
  {
    id: "look-15",
    imagemUrl: "/looks/look-15.jpg",
    title: "Look 15 — Paisagem",
    creditos: {
      marca: "Vestido estampado à mão — Florbela",
      styling: "Helena Vidal",
      modelo: "Ana Lúcia Reis",
    },
  },
  {
    id: "look-16",
    imagemUrl: "/looks/look-16.jpg",
    title: "Look 16 — Sal",
    creditos: {
      marca: "Trench branco em algodão — Atelier Norte",
      styling: "Rafael Penha",
      modelo: "Yara Mendes",
    },
  },
  {
    id: "look-17",
    imagemUrl: "/looks/look-17.jpg",
    title: "Look 17 — Ferro",
    creditos: {
      marca: "Casaco estruturado em lã — Casa Mura",
      styling: "Helena Vidal",
      modelo: "Gabriel Tavares",
    },
  },
  {
    id: "look-18",
    imagemUrl: "/looks/look-18.jpg",
    title: "Look 18 — Casa",
    creditos: {
      marca: "Vestido patchwork artesanal — Maré Atelier",
      styling: "Rafael Penha",
      modelo: "Dandara Nogueira",
    },
  },
  {
    id: "look-19",
    imagemUrl: "/looks/look-19.jpg",
    title: "Look 19 — Encerramento",
    creditos: {
      marca: "Vestido-noiva conceitual — Atelier Norte",
      styling: "Helena Vidal",
      modelo: "Júlia Marques",
    },
  },
];

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

export const modelos: Pessoa[] = [
  {
    id: "modelo-julia",
    nomeCompleto: "Júlia Marques de Souza",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Júlia Marques",
    imagemUrl: "/modelos/julia-marques.jpg",
    instagram: "@juliamarques",
    whatsappUrl: wa("5511988880001"),
  },
  {
    id: "modelo-beatriz",
    nomeCompleto: "Beatriz Aoki",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Beatriz Aoki",
    imagemUrl: "/modelos/beatriz-aoki.jpg",
    instagram: "@bia.aoki",
    whatsappUrl: wa("5511988880002"),
  },
  {
    id: "modelo-ian",
    nomeCompleto: "Ian Costa Ferreira",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Ian Costa",
    imagemUrl: "/modelos/ian-costa.jpg",
    instagram: "@iancosta",
    whatsappUrl: wa("5511988880003"),
  },
  {
    id: "modelo-ana",
    nomeCompleto: "Ana Lúcia Reis",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Ana Lúcia Reis",
    imagemUrl: "/modelos/ana-lucia-reis.jpg",
    instagram: "@analuciareis",
    whatsappUrl: wa("5511988880004"),
  },
  {
    id: "modelo-dandara",
    nomeCompleto: "Dandara Nogueira",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Dandara Nogueira",
    imagemUrl: "/modelos/dandara-nogueira.jpg",
    instagram: "@dandaranogueira",
    whatsappUrl: wa("5511988880005"),
  },
  {
    id: "modelo-sofia",
    nomeCompleto: "Sofia Andrade Lima",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Sofia Andrade",
    imagemUrl: "/modelos/sofia-andrade.jpg",
    instagram: "@sofia.andrade",
    whatsappUrl: wa("5511988880006"),
  },
  {
    id: "modelo-gabriel",
    nomeCompleto: "Gabriel Tavares",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Gabriel Tavares",
    imagemUrl: "/modelos/gabriel-tavares.jpg",
    instagram: "@gabrieltavares",
    whatsappUrl: wa("5511988880007"),
  },
  {
    id: "modelo-yara",
    nomeCompleto: "Yara Mendes Pinheiro",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Yara Mendes",
    imagemUrl: "/modelos/yara-mendes.jpg",
    instagram: "@yaramendes",
    whatsappUrl: wa("5511988880008"),
  },
  {
    id: "modelo-pedro",
    nomeCompleto: "Pedro Itamar",
    papel: "Modelo",
    nomeArtisticoOuMarca: "Pedro Itamar",
    imagemUrl: "/modelos/pedro-itamar.jpg",
    instagram: "@pedroitamar",
    whatsappUrl: wa("5511988880009"),
  },
];

export const equipeProducao: Pessoa[] = [
  {
    id: "prod-glicia",
    nomeCompleto: "Glícia Cáuper",
    papel: "Produção Executiva",
    nomeArtisticoOuMarca: "Glícia Cáuper",
    imagemUrl: "/producao/glicia-cauper.jpg",
    instagram: "@gliciacauper",
    whatsappUrl: wa("5511977770001"),
  },
  {
    id: "prod-direcao-arte",
    nomeCompleto: "Lívia Tonelli",
    papel: "Direção de Arte",
    nomeArtisticoOuMarca: "Lívia Tonelli",
    imagemUrl: "/producao/livia-tonelli.jpg",
    instagram: "@liviatonelli",
    whatsappUrl: wa("5511977770002"),
  },
  {
    id: "prod-beleza",
    nomeCompleto: "Marina Sales",
    papel: "Beleza",
    nomeArtisticoOuMarca: "Marina Sales",
    imagemUrl: "/producao/marina-sales.jpg",
    instagram: "@marinasales.beauty",
    whatsappUrl: wa("5511977770003"),
  },
  {
    id: "prod-cabelo",
    nomeCompleto: "Diego Faro",
    papel: "Cabelo",
    nomeArtisticoOuMarca: "Diego Faro",
    imagemUrl: "/producao/diego-faro.jpg",
    instagram: "@diegofaro.hair",
    whatsappUrl: wa("5511977770004"),
  },
  {
    id: "prod-make",
    nomeCompleto: "Bruna Yuki",
    papel: "Maquiagem",
    nomeArtisticoOuMarca: "Bruna Yuki",
    imagemUrl: "/producao/bruna-yuki.jpg",
    instagram: "@brunayuki.mua",
    whatsappUrl: wa("5511977770005"),
  },
  {
    id: "prod-luz",
    nomeCompleto: "Eduardo Bahia",
    papel: "Iluminação",
    nomeArtisticoOuMarca: "Eduardo Bahia",
    imagemUrl: "/producao/eduardo-bahia.jpg",
    instagram: "@edubahia.light",
    whatsappUrl: wa("5511977770006"),
  },
  {
    id: "prod-som",
    nomeCompleto: "Talita Veras",
    papel: "Sonoplastia",
    nomeArtisticoOuMarca: "Talita Veras",
    imagemUrl: "/producao/talita-veras.jpg",
    instagram: "@talitaveras",
    whatsappUrl: wa("5511977770007"),
  },
  {
    id: "prod-foto",
    nomeCompleto: "Henrique Alvim",
    papel: "Fotografia",
    nomeArtisticoOuMarca: "Henrique Alvim",
    imagemUrl: "/producao/henrique-alvim.jpg",
    instagram: "@henriquealvim",
    whatsappUrl: wa("5511977770008"),
  },
];

export const produtoraExecutiva = equipeProducao.find(
  (p) => p.id === "prod-glicia",
)!;
