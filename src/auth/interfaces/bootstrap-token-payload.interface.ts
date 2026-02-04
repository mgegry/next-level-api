export type BootstrapTokenPayload = {
  typ: 'bootstrap';
  sub: number;
  email: string;
  sid: number;
};
