import { createContext } from "react";
import { IClientUser } from "../models/user.model";


export const UserContext = createContext<IClientUser | null>(null)