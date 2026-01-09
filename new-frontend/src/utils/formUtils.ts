interface Field {
  name: string;
  type?: string;
  childRoutes?: ChildRoute[];
  childNode?: string;
  advance?: boolean;
  childKey?: { value: any };
  enum?: any[];
}

interface ChildRoute {
  childKey?: { value: any };
}

interface Modal {
  schema?: {
    fields: Field[];
  };
  formData?: Record<string, any>;
  showAdvanced?: boolean;
}

export const isListField = (field: Field): boolean => {
  return Boolean(field.type && field.type.includes('list['));
};

export const hasChildRoutes = (field?: Field): boolean => {
  return Array.isArray(field?.childRoutes) && field.childRoutes.length > 0;
};

export const isInlineConfigField = (field: Field): boolean => {
  return hasChildRoutes(field) && !isListField(field);
};

export const getSchemaFields = (modal?: Modal): Field[] => {
  return modal?.schema?.fields || [];
};

export const getDisplayFields = (modal?: Modal): Field[] => {
  return getSchemaFields(modal);
};

export const determineRouteControllerField = (modal: Modal, field: Field): string | null => {
  if (!hasChildRoutes(field)) {
    return null;
  }
  const schemaFields = getSchemaFields(modal);
  const preferredTypeField = schemaFields.find((entry) => entry.name === 'type');
  if (preferredTypeField) {
    return preferredTypeField.name;
  }
  const routeValues = field.childRoutes!
    .map((route) => route?.childKey?.value)
    .filter((value) => value !== undefined && value !== null);
  if (!routeValues.length) {
    const fallbackField = schemaFields.find((entry) => Array.isArray(entry.enum) && entry.enum.length);
    return fallbackField ? fallbackField.name : null;
  }
  const matchingEnumField = schemaFields.find(
    (entry) => Array.isArray(entry.enum) && routeValues.every((value) => entry.enum!.includes(value))
  );
  return matchingEnumField ? matchingEnumField.name : null;
};

export const getActiveChildRoute = (modal: Modal, field: Field): ChildRoute | null => {
  if (!hasChildRoutes(field)) {
    return null;
  }
  const routes = field.childRoutes || [];
  if (!routes.length) {
    return null;
  }
  const controllerFieldName = determineRouteControllerField(modal, field);
  if (!controllerFieldName) {
    return routes[0];
  }
  const controllerValue = modal.formData?.[controllerFieldName];
  return (
    routes.find((route) => {
      const keyValue = route?.childKey?.value;
      if (keyValue === undefined || keyValue === null) {
        return controllerValue === undefined || controllerValue === null || controllerValue === '';
      }
      return keyValue === controllerValue;
    }) || null
  );
};

export const canOpenConditionalChildModal = (modal: Modal, field: Field): boolean => {
  return Boolean(getActiveChildRoute(modal, field));
};

export const getConditionalChildKeyValue = (modal: Modal, field: Field): any => {
  const route = getActiveChildRoute(modal, field);
  if (route?.childKey?.value) {
    return route.childKey.value;
  }
  if (field.childKey?.value) {
    return field.childKey.value;
  }
  return null;
};

export const isFieldVisible = (modal: Modal, field: Field): boolean => {
  if (!field?.advance) {
    return true;
  }
  return Boolean(modal?.showAdvanced);
};

export const childNodeButtonLabel = (modal: Modal, field: Field): string => {
  if (isListField(field)) {
    return `Add Entry`;
  }
  return modal.formData?.[field.name] ? `Edit ${field.childNode}` : `Configure ${field.childNode}`;
};

export const conditionalChildButtonLabel = (modal: Modal, field: Field): string => {
  if (!canOpenConditionalChildModal(modal, field)) {
    return 'Configure';
  }
  const childNodeName = getConditionalChildKeyValue(modal, field);
  return modal.formData?.[field.name] ? `Edit ${childNodeName}` : `Configure ${childNodeName}`;
};
