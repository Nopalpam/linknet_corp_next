'use client';

import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaPlus, FaTrash, FaUpload } from 'react-icons/fa';

interface Schema {
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  items?: any;
  enum?: any[];
  format?: string;
  contentMediaType?: string;
}

interface ComponentFormGeneratorProps {
  schema: Schema;
  data: any;
  onChange: (data: any) => void;
}

export default function ComponentFormGenerator({
  schema,
  data,
  onChange,
}: ComponentFormGeneratorProps) {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayAdd = (field: string) => {
    const currentArray = formData[field] || [];
    handleChange(field, [...currentArray, {}]);
  };

  const handleArrayRemove = (field: string, index: number) => {
    const currentArray = [...(formData[field] || [])];
    currentArray.splice(index, 1);
    handleChange(field, currentArray);
  };

  const renderField = (fieldName: string, fieldSchema: any, value: any, path: string = '') => {
    const fullPath = path ? `${path}.${fieldName}` : fieldName;
    const isRequired = schema.required?.includes(fieldName);

    // String field
    if (fieldSchema.type === 'string') {
      // Enum - render as select
      if (fieldSchema.enum) {
        return (
          <Form.Group key={fullPath} className="mb-3">
            <Form.Label>
              {fieldSchema.title || fieldName}
              {isRequired && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Select
              value={value || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              isInvalid={!!errors[fullPath]}
            >
              <option value="">Select {fieldSchema.title || fieldName}</option>
              {fieldSchema.enum.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
            {fieldSchema.description && (
              <Form.Text className="text-muted">{fieldSchema.description}</Form.Text>
            )}
            <Form.Control.Feedback type="invalid">{errors[fullPath]}</Form.Control.Feedback>
          </Form.Group>
        );
      }

      // URI format - render with file picker
      if (fieldSchema.format === 'uri') {
        return (
          <Form.Group key={fullPath} className="mb-3">
            <Form.Label>
              {fieldSchema.title || fieldName}
              {isRequired && <span className="text-danger">*</span>}
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                value={value || ''}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={fieldSchema.description}
                isInvalid={!!errors[fullPath]}
              />
              <Button variant="outline-secondary" size="sm">
                <FaUpload /> Browse
              </Button>
            </div>
            {fieldSchema.description && (
              <Form.Text className="text-muted">{fieldSchema.description}</Form.Text>
            )}
            <Form.Control.Feedback type="invalid">{errors[fullPath]}</Form.Control.Feedback>
          </Form.Group>
        );
      }

      // HTML content - render as textarea
      if (fieldSchema.contentMediaType === 'text/html') {
        return (
          <Form.Group key={fullPath} className="mb-3">
            <Form.Label>
              {fieldSchema.title || fieldName}
              {isRequired && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={value || ''}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.description}
              isInvalid={!!errors[fullPath]}
            />
            {fieldSchema.description && (
              <Form.Text className="text-muted">{fieldSchema.description}</Form.Text>
            )}
            <Form.Control.Feedback type="invalid">{errors[fullPath]}</Form.Control.Feedback>
          </Form.Group>
        );
      }

      // Regular text input
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>
            {fieldSchema.title || fieldName}
            {isRequired && <span className="text-danger">*</span>}
          </Form.Label>
          <Form.Control
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.description}
            isInvalid={!!errors[fullPath]}
          />
          {fieldSchema.description && (
            <Form.Text className="text-muted">{fieldSchema.description}</Form.Text>
          )}
          <Form.Control.Feedback type="invalid">{errors[fullPath]}</Form.Control.Feedback>
        </Form.Group>
      );
    }

    // Number field
    if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>
            {fieldSchema.title || fieldName}
            {isRequired && <span className="text-danger">*</span>}
          </Form.Label>
          <Form.Control
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(fieldName, Number(e.target.value))}
            placeholder={fieldSchema.description}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            isInvalid={!!errors[fullPath]}
          />
          {fieldSchema.description && (
            <Form.Text className="text-muted">{fieldSchema.description}</Form.Text>
          )}
          <Form.Control.Feedback type="invalid">{errors[fullPath]}</Form.Control.Feedback>
        </Form.Group>
      );
    }

    // Boolean field
    if (fieldSchema.type === 'boolean') {
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Check
            type="checkbox"
            label={fieldSchema.title || fieldName}
            checked={value || false}
            onChange={(e) => handleChange(fieldName, e.target.checked)}
          />
          {fieldSchema.description && (
            <Form.Text className="text-muted d-block">{fieldSchema.description}</Form.Text>
          )}
        </Form.Group>
      );
    }

    // Array field
    if (fieldSchema.type === 'array') {
      const arrayValue = value || [];
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>
            {fieldSchema.title || fieldName}
            {isRequired && <span className="text-danger">*</span>}
          </Form.Label>
          {fieldSchema.description && (
            <Form.Text className="text-muted d-block mb-2">{fieldSchema.description}</Form.Text>
          )}
          
          {arrayValue.map((item: any, index: number) => (
            <div key={index} className="card mb-2 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Item {index + 1}</strong>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleArrayRemove(fieldName, index)}
                >
                  <FaTrash /> Remove
                </Button>
              </div>
              
              {fieldSchema.items.type === 'object' && fieldSchema.items.properties && (
                <div>
                  {Object.entries(fieldSchema.items.properties).map(([propName, propSchema]: [string, any]) =>
                    renderField(
                      propName,
                      propSchema,
                      item[propName],
                      `${fullPath}[${index}]`
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleArrayAdd(fieldName)}
          >
            <FaPlus /> Add {fieldSchema.title || fieldName}
          </Button>
        </Form.Group>
      );
    }

    // Object field
    if (fieldSchema.type === 'object' && fieldSchema.properties) {
      return (
        <fieldset key={fullPath} className="border p-3 mb-3">
          <legend className="h6">{fieldSchema.title || fieldName}</legend>
          {fieldSchema.description && (
            <Form.Text className="text-muted d-block mb-2">{fieldSchema.description}</Form.Text>
          )}
          {Object.entries(fieldSchema.properties).map(([propName, propSchema]: [string, any]) =>
            renderField(propName, propSchema, value?.[propName], fullPath)
          )}
        </fieldset>
      );
    }

    return null;
  };

  if (!schema.properties) {
    return <div className="alert alert-warning">No schema properties defined</div>;
  }

  return (
    <div className="component-form-generator">
      {Object.entries(schema.properties).map(([fieldName, fieldSchema]: [string, any]) =>
        renderField(fieldName, fieldSchema, formData[fieldName])
      )}
    </div>
  );
}
