export interface SoftoneLoginSuccessResponseDto {
  success: true;
  clientID: string;
  objs: {
    COMPANY: string;
    COMPANYNAME: string;
    BRANCH: string;
    BRANCHNAME: string;
    MODULE: string;
    MODULENAME: string;
    REFID: string;
    REFIDNAME: string;
    USERID: string;
    FINALDATE: string;
    ROLES: string;
  }[];
  ver: string;
  sn: string;
  error?: string;
  errorcode?: number;
}
