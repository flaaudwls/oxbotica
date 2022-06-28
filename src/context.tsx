import { createContext, useCallback, useContext, useState } from "react";

interface StateProps {
  vehicles: {
    id: string;
    name: string;
    color: string;
    plate_number: string;
  }[];
  targetVehicleId: string;
}

interface ContextProps {
  state: StateProps;
  updateState: (s: Partial<StateProps>) => void;
}

const ProjectContext = createContext({} as ContextProps);
export const ProjectContextProvider = ProjectContext.Provider;

export function useProjectState() {
  const [state, setState] = useState<StateProps>({
    vehicles: null!,
    targetVehicleId: null!
  });
  const updateState = useCallback((newItem: Partial<StateProps>) => {
    setState((prev) => ({ ...prev, ...newItem }));
  }, []);
  return { state, updateState };
}

export function useProjectContext() {
  const all = useContext(ProjectContext);
  return all;
}
