import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import DynamicFormField from './DynamicFormField';
import { fetchConfigSchema } from '../utils/apiFunctions';
import { getDisplayFields } from '../utils/formUtils';

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

interface ModalConfig {
  title: string;
  breadcrumbs: string[];
  schema?: {
    fields: FieldSchema[];
  };
  formData: Record<string, any>;
  showAdvanced: boolean;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

interface FormGeneratorProps {
  isOpen: boolean;
  config: ModalConfig | null;
  onClose: () => void;
}

export default function FormGenerator({ isOpen, config, onClose }: FormGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<{ fields: FieldSchema[] } | null>(null);
  const [childModalStack, setChildModalStack] = useState<ModalConfig[]>([]);

  // Load schema when config changes
  useEffect(() => {
    if (config) {
      setFormData(config.formData || {});
      setShowAdvanced(config.showAdvanced || false);

      if (config.schema) {
        setSchema(config.schema);
      } else if (config.breadcrumbs) {
        loadSchema(config.breadcrumbs);
      }
    }
  }, [config]);

  const loadSchema = async (breadcrumbs: string[]) => {
    setLoading(true);
    try {
      const result = await fetchConfigSchema(breadcrumbs);
      if (result.success && result.schema) {
        setSchema(result.schema);
      }
    } catch (error) {
      console.error('Failed to load schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenChildModal = (field: FieldSchema) => {
    // Create a child modal configuration
    const childConfig: ModalConfig = {
      title: `Configure ${field.childNode || field.name}`,
      breadcrumbs: [...(config?.breadcrumbs || []), field.name],
      formData: formData[field.name] || {},
      showAdvanced: false,
      onSubmit: (childData) => {
        handleFieldChange(field.name, childData);
        handleCloseChildModal();
      },
      onCancel: handleCloseChildModal,
    };

    setChildModalStack((prev) => [...prev, childConfig]);
  };

  const handleCloseChildModal = () => {
    setChildModalStack((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (config?.onSubmit) {
      config.onSubmit(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (config?.onCancel) {
      config.onCancel();
    }
    onClose();
  };

  if (!config) return null;

  const currentModal = childModalStack.length > 0 ? childModalStack[childModalStack.length - 1] : {
    ...config,
    formData,
    showAdvanced,
  };

  const displayFields = getDisplayFields(currentModal);
  const hasAdvancedFields = displayFields.some((field: FieldSchema) => field.advance);

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen && childModalStack.length === 0} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading schema...</div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Advanced Settings Toggle */}
              {hasAdvancedFields && (
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Checkbox
                    id="show-advanced"
                    checked={showAdvanced}
                    onCheckedChange={(checked) => setShowAdvanced(checked === true)}
                  />
                  <Label htmlFor="show-advanced" className="cursor-pointer font-medium">
                    Show Advanced Settings
                  </Label>
                </div>
              )}

              {/* Form Fields */}
              {displayFields.map((field: FieldSchema) => (
                <DynamicFormField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  modal={{ formData, showAdvanced }}
                  onOpenChildModal={handleOpenChildModal}
                />
              ))}

              {displayFields.length === 0 && (
                <div className="py-8 text-center text-gray-500">No fields to display</div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Child Modals (Nested) */}
      {childModalStack.map((childConfig, index) => (
        <FormGenerator
          key={index}
          isOpen={true}
          config={childConfig}
          onClose={handleCloseChildModal}
        />
      ))}
    </>
  );
}
