import { DefaultUser } from 'next-auth'

declare module 'next-auth'{
  export interface User extends DefaultUser{
    role?: string;
  }
}