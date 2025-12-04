export interface WmePurchaseInvoiceResponseDto {
  InfoFacturi: WmePurchaseInvoiceDto[];
}

export interface WmePurchaseInvoiceDto {
  TipDocument: string;
  CodIntr: string;
  Numar: string;
  Serie: string;
  Data: string;
  Furnizor: string;
  SediuLivrare: string;
  Email: string;
  CodSubunitate: string;
  Subunitate: string;
  Telefon: string;
  IDFurnizor: string;
  Valoare: string;
  Moneda: string;

  StadiuWMS: string;
  DataRefScad: string;
  Curs: string;
  Sold: string;
  UltimaPlata: string;
  Observatii: string;
  Operat: string;
  Anulat: string;
  ExclusLaPlata: string;
  IDDescarcare: string;
  TipTVA: string;
  TipTranzactie: string;

  'Termene plata': TermenPlata[];

  ConditiiIntrastat: {
    SimbolNaturaTranz: string;
    SimbolTipLivrare: string;
    SimbolModTransport: string;
  };

  EXTENSIEFACTURA: string;

  Items: Item[];
}

export interface TermenPlata {
  Termen: string;
  Suma: string;
  ModPlata: string;
  Sold: string;
}

export interface Item {
  CodLinieDocument: string;
  IndexLocal: string;
  ID: string;
  CodExtern: string;
  CodIntern: string;
  Denumire: string;
  TipArticol: string;
  UM: string;
  Cant: string;
  Pret: string;
  ProcTVA: string;
  Masa: string;
  AdDim: string;
  Observatii: string;
  CodCNAS: string;
  RestInAsteptare: string;
  RestDeFacturat: string;
  Impozabil: string;
  EXTENSIELINIE: string;

  Comanda: {
    Numar: string;
    Data: string;
  };

  NIR: NIR[];
}

export interface NIR {
  SimbolGestiune: string;
  Cont: string;
  Cant: string;
  Serii: Serie[];
}

export interface Serie {
  Serie: string;
  Cant: string;
  DataExpirare: string;
}
