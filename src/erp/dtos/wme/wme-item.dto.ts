export interface WmeItemDto {
  CodObiect: string;
  Denumire: string;
  UM: string;
  PretVanzare: string;
  PretCuTVA: string;
  PretValuta: string;
  CategoriePretImplicita: string;

  PretModAmbalare: {
    DenUM: string;
    PretVanzare?: string;
    PretCuTVA?: string;
    Pret?: string;
  }[];

  Clasa: string;
  SimbolClasa: string;
  CodClasa: string;
  Producator: string;
  IDProducator: string;
  GestiuneImplicita: string;
  CodLocatieImplicita: string;
  CodExtLocatieImplicita: string;
  DenLocatieImplicita: string;
  SimbolContImplicit: string;
  CodExtern: string;
  CodIntern: string;
  ProcentTVA: string;
  UMImplicita: string;
  ParitateUMImplicita: string;
  Masa: string;
  Volum: string;
  GreutateSpecifica: string;
  Serviciu: string;
  AreDataExpirare: string;
  CodVamal: string;
  CodD394: string;
  PretMinim: string;
  DataAdaugarii: string;
  VizibilComenziOnline: string;
  CodCatalog: string;
  Promotie: string;
  DiscountPromo: string;
  ZilePlata: string;
  ClasaWEB: string;
  SimbolClasaWEB: string;
  CodClasaWEB: string;
  ClasaStat: string;
  SimbolClasaStat: string;
  CodClasaStat: string;
  Inactiv: string;
  StocMinim: string;
  LuniGarantie: string;
  Descriere: string;
  DCI: string;
  CAMP_EXTENSIE: string;
  TipSerie: string;
  InactivComenziOnline: string;
  CodCNAS: string;
  CoefCNAS: string;
  CheckAutenticitate: string;
  D1: string;
  D2: string;
  D3: string;
  PretReferinta: string;
  UmSpecifica: string;
  UmAlternativa: string;
  RelatieUMSpec: string;
  SimbolCentruCost: string;
  CodCPV: string;
  ConstructieNoua: string;
  RiscFiscal: string;
  CaractSuplim: string;
  ZileValabil: string;
  AdaosExceptie: string;
  Nefacturabil: string;
  SimbolContServ: string;
  FaraStoc: string;
  Blocat: string;
  VoucherCadou: string;
  CodArticol: string;

  Atribute: {
    Denumire: string;
    Valoare: string;
  }[];

  GrupaEchiv: {
    Denumire: string;
    Cod: string;
    Paritate: string;
  };

  ModuriAmbalare: {
    UM: string;
    CodExtern: string;
    CodIntern: string;
    Paritate: string;
    Masa: string;
    Lungime: string;
    Latime: string;
    Inaltime: string;
  }[];

  CodExternAlternativ: string[];
  CodInternAlternativ: string[];

  Discounturi: {
    Denumire: string;
    Procent: string;
  }[];

  Traduceri: {
    CodLimba: string;
    Denumire: string;
    Traducere: string;
    Descriere: string;
  }[];

  StocPeSubunitati: {
    CodSubunitate: string;
    Subunitate: string;
    StocMinim: string;
    StocMaxim: string;
    StocOptim: string;
  }[];

  AlteCategoriiPret: {
    CategoriePret: string;
    Pret: string;
    TVAInclus: string;
    Subunitatea: string;
    PretModAmbalare: {
      DenUM: string;
      Pret: string;
    }[];
  }[];

  TaxeAccize: string[];

  // duplicate GrupaEchiv from original data structure
  GrupaEchiv2?: {
    Denumire: string;
    Cod: string;
    Paritate: string;
  };

  Ambalaje: {
    IdAmbalaj: string;
    Denumire: string;
    CantMin: string;
    Tip: string;
    Returnabil: string;
  }[];

  InfoLaParteneri: {
    Partener: string;
    Clasa: string;
    SimbolClasa: string;
    IDPartener: string;
    DenumireLaPartener: string;
    CodLaPartener: string;
    CodExternLaPartener: string;
    IDSpecific: string;
    DenUMPreferata: string;
    Gama: string;
    Observatii: string;
    Observatii2: string;
    GLN: string;
    ZileStoc: string;
  }[];

  InfoImplicite: {
    CodSubunitate: string;
    GestiuneImplicita: string;
    SimbolTipContImplicit: string;
    CodLocatieImplicita: string;
    CodExtLocatieImplicita: string;
    DenLocatieImplicita: string;
  }[];
}

export interface WmeItemResponseDto {
  InfoArticole: WmeItemDto[];
  Paginare: {
    Pagina: string;
    TotalPagini: string;
  };
}
