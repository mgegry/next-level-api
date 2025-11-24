export interface RefreshResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
  accessExpires: string;
}
