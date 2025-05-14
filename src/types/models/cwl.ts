interface CwlWorkflowInput {
  doc: string;
  label: string;
  type: string;
}

interface CwlWorkflowOutput {
  id: string;
  outputSource: string[];
  type: string;
}

interface CwlWorkflowStep {
  run: string;
  in: {
    [inputKey: string]: string | { source: string };
  };
  out: string[];
}

export interface CwlWorkflow {
  class: string;
  id: string;
  label: string;
  doc: string;
  requirements: Record<string, unknown>;
  inputs: {
    [key: string]: CwlWorkflowInput;
  };
  outputs: CwlWorkflowOutput[];
  steps: {
    [stepId: string]: CwlWorkflowStep;
  };
}
