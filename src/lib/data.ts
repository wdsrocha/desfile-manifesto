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
  miniBio: string;
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
  dataISO: string;
  local: string;
  enderecoCurto: string;
  conceito: string;
  descricaoLonga: string;
}

export const evento: EventoInfo = {
  nome: "Manifesto",
  edicao: "Edição I",
  dataLegivel: "26 de Abril de 2026",
  dataISO: "2026-04-26",
  local: "Galpão Central",
  enderecoCurto: "São Paulo — SP",
  conceito:
    "Um desfile-celebração da moda autoral brasileira. Roupa como gesto, passarela como discurso.",
  descricaoLonga:
    "Manifesto reúne marcas independentes, modelos e profissionais de bastidores em uma noite editorial única. Cada look é uma frase. Juntos, formam um manifesto sobre o que vestimos — e o que isso diz sobre quem somos.",
};

const wa = (numero: string, msg = "Olá! Vi seu trabalho no Manifesto.") =>
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
    id: "marca-atelier-norte",
    nomeCompleto: "Camila Verdi",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Atelier Norte",
    imagemUrl: "/marcas/atelier-norte.jpg",
    instagram: "@ateliernorte",
    whatsappUrl: wa("5511999990001"),
    miniBio:
      "Slow couture com alfaiataria fluida em sedas e lãs naturais. Peças únicas costuradas em São Paulo.",
  },
  {
    id: "marca-casa-mura",
    nomeCompleto: "Tomás Mura",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Casa Mura",
    imagemUrl: "/marcas/casa-mura.jpg",
    instagram: "@casa.mura",
    whatsappUrl: wa("5511999990002"),
    miniBio:
      "Alfaiataria desconstruída e bordados manuais em peças de inspiração arquitetônica.",
  },
  {
    id: "marca-liame",
    nomeCompleto: "Renata Liame",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Liame",
    imagemUrl: "/marcas/liame.jpg",
    instagram: "@liame.estudio",
    whatsappUrl: wa("5511999990003"),
    miniBio:
      "Estúdio de alfaiataria contemporânea. Lãs, algodões pima e modelagens de gênero fluido.",
  },
  {
    id: "marca-florbela",
    nomeCompleto: "Florbela Aragão",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Florbela",
    imagemUrl: "/marcas/florbela.jpg",
    instagram: "@florbela.atelier",
    whatsappUrl: wa("5511999990004"),
    miniBio:
      "Estampas pintadas à mão sobre viscose e linho. Roupa como diário botânico.",
  },
  {
    id: "marca-mare",
    nomeCompleto: "Coletivo Maré",
    papel: "Marca / Estilista",
    nomeArtisticoOuMarca: "Maré Atelier",
    imagemUrl: "/marcas/mare.jpg",
    instagram: "@mare.atelier",
    whatsappUrl: wa("5511999990005"),
    miniBio:
      "Coletivo de artesãs do litoral norte: crochê, patchwork e tingimento natural.",
  },
  {
    id: "criativo-helena",
    nomeCompleto: "Helena Vidal",
    papel: "Direção Criativa",
    nomeArtisticoOuMarca: "Helena Vidal",
    imagemUrl: "/criativos/helena-vidal.jpg",
    instagram: "@helenavidal",
    whatsappUrl: wa("5511999990010"),
    miniBio:
      "Stylist e diretora criativa. Conduz a narrativa visual da metade dos looks do Manifesto.",
  },
  {
    id: "criativo-rafael",
    nomeCompleto: "Rafael Penha",
    papel: "Styling",
    nomeArtisticoOuMarca: "Rafael Penha",
    imagemUrl: "/criativos/rafael-penha.jpg",
    instagram: "@rafa.penha",
    whatsappUrl: wa("5511999990011"),
    miniBio:
      "Stylist com olhar editorial. Traduz alfaiataria e tricô em personagem.",
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
