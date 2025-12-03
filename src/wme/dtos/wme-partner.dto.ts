import { WmeWorkpointDto } from './wme-workpoint.dto';

export interface WmePartnerDto {
  Cod: string;
  ID: string;
  Denumire: string;
  CodExtern: string;
  CodIntern: string;
  CodFiscal: string;
  RegistruComert: string;
  Blocat: string;
  PersoanaFizica: string;
  CategoriePretImplicita: string;
  SimbolCategoriePret: string;
  ScadentaLaVanzare: string;
  ScadentaLaCumparare: string;
  CreditClient: string;
  DiscountFix: string;
  ModAplicareDiscount: string;
  Moneda: string;
  TVALaIncasare: string;
  Observatii: string;
  DataAdaugarii: string;
  DataNastere: string;
  Clasa: string;
  SimbolClasa: string;
  CodClasa: string;
  TipPartener: string;
  Inactiv: string;
  CaracterizareContabila: {
    Denumire: string;
    Simbol: string;
  };
  Sedii?: WmeWorkpointDto[];
}

export interface WmePartnerResponseDto {
  InfoParteneri: WmePartnerDto[];
  Paginare: {
    Pagina: string;
    TotalPagini: string;
  };
}
