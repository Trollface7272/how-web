import { createContext } from "react";
import { IUserContext } from "../models/user.model";


export const UserContext = createContext<IUserContext | null>(null)