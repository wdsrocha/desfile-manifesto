export interface LookModelo {
  nome: string;
  instagram?: string;
}

export interface Look {
  id: string;
  modelo?: LookModelo;
  styling?: string[];
}

export const looks: Look[] = [];
