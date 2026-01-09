import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { isListField, isFieldVisible } from '../utils/formUtils';

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
  formData?: Record<string, any>;
  showAdvanced?: boolean;
}

interface DynamicFormFieldProps {
  field: FieldSchema;
  value: any;
  onChange: (name: string, value: any) => void;
  modal?: Modal;
  onOpenChildModal?: (field: FieldSchema) => void;
}

export default function DynamicFormField({
  field,
  value,
  onChange,
  modal = {},
  onOpenChildModal,
}: DynamicFormFieldProps) {
  // Check if field should be visible
  if (!isFieldVisible(modal, field)) {
    return null;
  }

  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  const renderField = () => {
    const fieldType = field.type || 'text';

    // Boolean field (checkbox)
    if (fieldType === 'bool' || fieldType === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={value === true}
            onCheckedChange={(checked) => handleChange(checked)}
          />
          <Label htmlFor={field.name} className="cursor-pointer">
            {field.label || field.name}
          </Label>
        </div>
      );
    }

    // Enum field (select dropdown)
    if (field.enum && Array.isArray(field.enum) && field.enum.length > 0) {
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={value || ''} onValueChange={handleChange}>
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={`Select ${field.label || field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.enum.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
        </div>
      );
    }

    // List field
    if (isListField(field)) {
      const listValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          <Label>
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-2">
            {listValues.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={typeof item === 'object' ? JSON.stringify(item) : item}
                  onChange={(e) => {
                    const newList = [...listValues];
                    newList[index] = e.target.value;
                    handleChange(newList);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newList = listValues.filter((_: any, i: number) => i !== index);
                    handleChange(newList);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleChange([...listValues, '']);
              }}
            >
              Add Entry
            </Button>
          </div>
          {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
        </div>
      );
    }

    // Child node configuration
    if (field.childNode && onOpenChildModal) {
      return (
        <div className="space-y-2">
          <Label>
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Button type="button" variant="outline" onClick={() => onOpenChildModal(field)}>
            {value ? `Edit ${field.childNode}` : `Configure ${field.childNode}`}
          </Button>
          {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
        </div>
      );
    }

    // Textarea for long text
    if (fieldType.includes('text') && fieldType !== 'text') {
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label || field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.description || `Enter ${field.label || field.name}`}
            rows={4}
          />
          {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
        </div>
      );
    }

    // Default: text input
    return (
      <div className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label || field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={field.name}
          type={fieldType === 'int' || fieldType === 'float' ? 'number' : 'text'}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.description || `Enter ${field.label || field.name}`}
        />
        {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
      </div>
    );
  };

  return <div className="dynamic-form-field">{renderField()}</div>;
}
