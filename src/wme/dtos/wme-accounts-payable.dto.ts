export interface WmeAccountsPaybleDto {
  IDPartener: string;
  CodFiscal: string;
  Denumire: string;
  TipDocument: string;
}

export interface WmeAccountsPayableResponseDto {
  InfoSolduri: WmeAccountsPaybleDto[];
}
