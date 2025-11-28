export interface WmeAccountsReceivableDto {
  IDPartener: string;
  CodFiscal: string;
  Denumire: string;
  TipDocument: string;
  Subunitatea: string;
  CodSubunitate: string;
  CodSIUI: string;
  CodDocument: string;
  Serie: string;
  Numar: string;
  Data: string;
  Valoare: string;
  Rest: string;
  Termen: string;
  Moneda: string;
  Sediu: string;
  IDSediu: string;
  Curs: string;
  Observatii: string;
  CodObligatie: string;
  MarcaAgent: string;
}

export interface WmeAccountsReceivableResponseDto {
  InfoSolduri: WmeAccountsReceivableDto[];
}
