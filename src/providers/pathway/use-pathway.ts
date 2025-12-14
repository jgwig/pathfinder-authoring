import { useContext } from "react";
import { PathwayContext } from "./pathway-context";

export const usePathway = () => useContext(PathwayContext);
