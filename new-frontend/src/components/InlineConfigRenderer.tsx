import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import DynamicFormField from './DynamicFormField';
import { getDisplayFields, isInlineConfigField } from '../utils/formUtils';

interface FieldSchema {
  name: string;
  type?: string;
  label?: string;
  description?: string;
  required?: boolean;
  advance?: boolean;
  enum?: string[];
  default?: any;
  childNode?: string;
  childRoutes?: any[];
}

interface Modal {
  schema?: {
    fields: FieldSchema[];
  };
  formData?: Record<string, any>;
  showAdvanced?: boolean;
}

interface InlineConfigRendererProps {
  field: FieldSchema;
  value: Record<string, any>;
  onChange: (name: string, value: any) => void;
  modal: Modal;
  depth?: number;
}

export default function InlineConfigRenderer({
  field,
  value,
  onChange,
  modal,
  depth = 0,
}: InlineConfigRendererProps) {
  const [showAdvanced, setShowAdvanced] = useState(modal.showAdvanced || false);

  if (!isInlineConfigField(field)) {
    return null;
  }

  const inlineData = value || {};
  const inlineFields = field.childRoutes?.[0]?.schema?.fields || [];
  const hasAdvancedFields = inlineFields.some((f) => f.advance);

  const handleInlineChange = (fieldName: string, fieldValue: any) => {
    onChange(field.name, {
      ...inlineData,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div
      className="inline-config-container"
      style={{
        marginLeft: `${depth * 20}px`,
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: depth % 2 === 0 ? '#f9f9f9' : '#ffffff',
      }}
    >
      <div className="space-y-4">
        {/* Advanced Toggle for nested config */}
        {hasAdvancedFields && (
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox
              id={`${field.name}-advanced`}
              checked={showAdvanced}
              onCheckedChange={(checked) => setShowAdvanced(checked === true)}
            />
            <Label htmlFor={`${field.name}-advanced`} className="cursor-pointer text-sm font-medium">
              Show Advanced Settings for {field.label || field.name}
            </Label>
          </div>
        )}

        {/* Render nested fields */}
        {inlineFields.map((nestedField: FieldSchema) => {
          // Check visibility
          if (nestedField.advance && !showAdvanced) {
            return null;
          }

          // If nested field is also inline config, recursively render
          if (isInlineConfigField(nestedField)) {
            return (
              <InlineConfigRenderer
                key={nestedField.name}
                field={nestedField}
                value={inlineData[nestedField.name] || {}}
                onChange={handleInlineChange}
                modal={{ ...modal, showAdvanced }}
                depth={depth + 1}
              />
            );
          }

          // Otherwise, render as regular field
          return (
            <DynamicFormField
              key={nestedField.name}
              field={nestedField}
              value={inlineData[nestedField.name]}
              onChange={handleInlineChange}
              modal={{ ...modal, formData: inlineData, showAdvanced }}
            />
          );
        })}
      </div>
    </div>
  );
}
