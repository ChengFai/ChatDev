import yaml from 'js-yaml';

interface VarItem {
  key: string;
  value: any;
}

interface FormData {
  id: string;
  description?: string;
  initial_instruction?: string;
  memories?: any[];
  vars?: VarItem[];
}

/**
 * Converts form data to YAML string of graph
 */
export function convertFormDataToYAML(formData: FormData): string {
  const yamlObject = {
    version: '0.4.0',
    graph: {
      id: formData.id.trim(),
      description: formData.description?.trim() || null,
      initial_instruction: formData.initial_instruction?.trim() || null,
      log_level: 'INFO',
      is_majority_voting: false,
      end: [],
      memories: [],
      nodes: [],
      edges: [],
      vars: {} as Record<string, any>
    }
  };

  yamlObject.graph.memories = formData.memories || [];

  // Data exists as [{key, value}] in form, convert to {key: value} in YAML
  if (formData.vars && formData.vars.length > 0) {
    yamlObject.graph.vars = {};
    formData.vars.forEach((varItem) => {
      yamlObject.graph.vars[varItem.key] = varItem.value;
    });
  }

  return yaml.dump(yamlObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
}
