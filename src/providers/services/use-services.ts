import { useContext } from "react";
import { ServicesContext } from "./services-context";

export const useServices = () => useContext(ServicesContext);
