# 🔧 Page Builder - Developer Guide

## Adding New Components

### Step-by-Step Guide

#### 1. Define Component in ComponentLibrary.tsx

```typescript
// Add to availableComponents array
{
  type: "card",                    // Unique type identifier
  label: "Card",                   // Display name
  category: "Layout",              // Category grouping
  icon: <YourIcon />,             // React icon component
  defaultProps: {                  // Default properties
    title: "Card Title",
    description: "Card description",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    shadow: true,
  },
}
```

#### 2. Add Renderer in PageCanvas.tsx

```typescript
case "card":
  return (
    <div
      style={{
        backgroundColor: component.props.backgroundColor,
        padding: component.props.padding,
        borderRadius: component.props.borderRadius,
        boxShadow: component.props.shadow 
          ? "0 4px 6px rgba(0,0,0,0.1)" 
          : "none",
      }}
      className="border border-gray-200"
    >
      <h3 style={{ margin: 0, marginBottom: "8px" }}>
        {component.props.title}
      </h3>
      <p style={{ margin: 0, color: "#666" }}>
        {component.props.description}
      </p>
    </div>
  );
```

#### 3. Add Settings in ComponentSettings.tsx

```typescript
case "card":
  return (
    <>
      <SettingField
        label="Title"
        type="text"
        value={selectedComponent.props.title}
        onChange={(value) => handleChange("title", value)}
      />
      <SettingField
        label="Description"
        type="textarea"
        value={selectedComponent.props.description}
        onChange={(value) => handleChange("description", value)}
      />
      <SettingField
        label="Background Color"
        type="color"
        value={selectedComponent.props.backgroundColor}
        onChange={(value) => handleChange("backgroundColor", value)}
      />
      <SettingField
        label="Padding"
        type="text"
        value={selectedComponent.props.padding}
        onChange={(value) => handleChange("padding", value)}
        placeholder="e.g., 20px"
      />
      <SettingField
        label="Border Radius"
        type="text"
        value={selectedComponent.props.borderRadius}
        onChange={(value) => handleChange("borderRadius", value)}
        placeholder="e.g., 8px"
      />
      <SettingField
        label="Shadow"
        type="select"
        value={selectedComponent.props.shadow}
        onChange={(value) => handleChange("shadow", value === "true")}
        options={[
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
      />
    </>
  );
```

---

## Component Types

### Simple Components
No children, standalone elements.

**Examples:** Text, Image, Button, Divider

```typescript
{
  id: "comp-1",
  type: "text",
  props: {
    text: "Hello World",
    fontSize: "16px",
  }
}
```

### Container Components
Can have children components.

**Examples:** Section, Row, Column

```typescript
{
  id: "comp-1",
  type: "section",
  props: {
    backgroundColor: "#fff",
    padding: "40px",
  },
  children: [
    {
      id: "comp-2",
      type: "heading",
      props: { text: "Title" }
    }
  ]
}
```

---

## Advanced Components Examples

### Video Component

```typescript
// ComponentLibrary.tsx
{
  type: "video",
  label: "Video",
  category: "Media",
  icon: <VideoIcon />,
  defaultProps: {
    url: "https://www.youtube.com/embed/...",
    width: "100%",
    height: "400px",
  },
}

// PageCanvas.tsx
case "video":
  return (
    <iframe
      src={component.props.url}
      width={component.props.width}
      height={component.props.height}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );

// ComponentSettings.tsx
case "video":
  return (
    <>
      <SettingField
        label="Video URL"
        type="text"
        value={selectedComponent.props.url}
        onChange={(value) => handleChange("url", value)}
        placeholder="YouTube embed URL"
      />
      <SettingField
        label="Width"
        type="text"
        value={selectedComponent.props.width}
        onChange={(value) => handleChange("width", value)}
      />
      <SettingField
        label="Height"
        type="text"
        value={selectedComponent.props.height}
        onChange={(value) => handleChange("height", value)}
      />
    </>
  );
```

### Accordion Component

```typescript
// ComponentLibrary.tsx
{
  type: "accordion",
  label: "Accordion",
  category: "Interactive",
  icon: <AccordionIcon />,
  defaultProps: {
    items: [
      { title: "Item 1", content: "Content 1" },
      { title: "Item 2", content: "Content 2" },
    ],
  },
}

// PageCanvas.tsx
case "accordion":
  return (
    <div className="space-y-2">
      {component.props.items.map((item: any, index: number) => (
        <details key={index} className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">
            {item.title}
          </summary>
          <p className="mt-2 text-gray-600">
            {item.content}
          </p>
        </details>
      ))}
    </div>
  );

// ComponentSettings.tsx
case "accordion":
  return (
    <>
      {selectedComponent.props.items.map((item: any, index: number) => (
        <div key={index} className="mb-4 p-3 border rounded">
          <input
            type="text"
            value={item.title}
            onChange={(e) => {
              const newItems = [...selectedComponent.props.items];
              newItems[index].title = e.target.value;
              handleChange("items", newItems);
            }}
            className="w-full mb-2 px-3 py-2 border rounded"
            placeholder="Title"
          />
          <textarea
            value={item.content}
            onChange={(e) => {
              const newItems = [...selectedComponent.props.items];
              newItems[index].content = e.target.value;
              handleChange("items", newItems);
            }}
            className="w-full px-3 py-2 border rounded"
            placeholder="Content"
          />
        </div>
      ))}
      <button
        onClick={() => {
          const newItems = [
            ...selectedComponent.props.items,
            { title: "New Item", content: "New Content" }
          ];
          handleChange("items", newItems);
        }}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Item
      </button>
    </>
  );
```

### Grid Component

```typescript
// ComponentLibrary.tsx
{
  type: "grid",
  label: "Grid",
  category: "Layout",
  icon: <GridIcon />,
  defaultProps: {
    columns: 3,
    gap: "20px",
  },
}

// PageCanvas.tsx
case "grid":
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${component.props.columns}, 1fr)`,
        gap: component.props.gap,
      }}
    >
      {component.children && component.children.length > 0 ? (
        component.children.map((child) => (
          <ComponentRenderer
            key={child.id}
            component={child}
            isSelected={false}
            onSelect={() => {}}
            onDelete={() => {}}
          />
        ))
      ) : (
        <div className="col-span-full text-center text-gray-400 p-8 border-2 border-dashed">
          Drop components here
        </div>
      )}
    </div>
  );

// ComponentSettings.tsx
case "grid":
  return (
    <>
      <SettingField
        label="Columns"
        type="select"
        value={selectedComponent.props.columns}
        onChange={(value) => handleChange("columns", parseInt(value))}
        options={[
          { value: "1", label: "1 Column" },
          { value: "2", label: "2 Columns" },
          { value: "3", label: "3 Columns" },
          { value: "4", label: "4 Columns" },
        ]}
      />
      <SettingField
        label="Gap"
        type="text"
        value={selectedComponent.props.gap}
        onChange={(value) => handleChange("gap", value)}
        placeholder="e.g., 20px"
      />
    </>
  );
```

---

## Custom Setting Field Types

### Toggle Switch

```typescript
// Add to ComponentSettings.tsx
interface SettingFieldProps {
  // ... existing props
  type: "text" | "color" | "select" | "textarea" | "toggle";
}

function SettingField({ label, type, value, onChange }: SettingFieldProps) {
  // ... existing code
  
  if (type === "toggle") {
    return (
      <div>
        <label className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>
    );
  }
  
  // ... rest of code
}
```

### Number Slider

```typescript
if (type === "slider") {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
```

### File Upload (Image Picker)

```typescript
if (type === "image-upload") {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Handle file upload
              // You can use FileManager API here
              const reader = new FileReader();
              reader.onload = (e) => {
                onChange(e.target?.result);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="text-sm"
        />
        {value && (
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded border"
          />
        )}
      </div>
    </div>
  );
}
```

---

## State Management

### Context Structure

```typescript
interface PageBuilderContextType {
  components: ComponentSchema[];
  selectedComponent: ComponentSchema | null;
  loading: boolean;
  addComponent: (component, parentId?) => void;
  updateComponent: (id, props) => void;
  deleteComponent: (id) => void;
  selectComponent: (id) => void;
  reorderComponents: (startIndex, endIndex) => void;
  saveComponents: () => Promise<void>;
}
```

### Custom Hooks

```typescript
// useComponentHistory.ts - Undo/Redo
export function useComponentHistory() {
  const [history, setHistory] = useState<ComponentSchema[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
  };

  const addToHistory = (components: ComponentSchema[]) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, components]);
    setCurrentIndex(newHistory.length);
  };

  return { undo, redo, addToHistory, canUndo: currentIndex > 0, canRedo: currentIndex < history.length - 1 };
}
```

---

## Drag & Drop Integration

### Using react-beautiful-dnd

```bash
npm install react-beautiful-dnd
npm install --save-dev @types/react-beautiful-dnd
```

```typescript
// PageCanvas.tsx
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function PageCanvas() {
  const { components, reorderComponents } = usePageBuilder();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderComponents(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="page-canvas">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {components.map((component, index) => (
              <Draggable
                key={component.id}
                draggableId={component.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ComponentRenderer component={component} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

---

## Performance Optimization

### 1. Memoization

```typescript
import { memo, useMemo } from "react";

const ComponentRenderer = memo(({ component }: Props) => {
  const renderedComponent = useMemo(() => {
    return renderComponent(component);
  }, [component]);

  return renderedComponent;
});
```

### 2. Virtual Scrolling

```typescript
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={components.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ComponentRenderer component={components[index]} />
    </div>
  )}
</FixedSizeList>
```

### 3. Debounced Updates

```typescript
import { useDebouncedCallback } from "use-debounce";

const debouncedUpdate = useDebouncedCallback(
  (id: string, props: any) => {
    updateComponent(id, props);
  },
  300
);
```

---

## Backend Integration

### Save Components

```typescript
// PageBuilderContext.tsx
const saveComponents = useCallback(async () => {
  try {
    setLoading(true);
    
    // Transform components to backend format
    const payload = {
      components: components.map((comp, index) => ({
        type: comp.type,
        data: comp.props,
        order: index,
        isVisible: true,
      })),
    };
    
    await pagesService.savePageComponents(pageId, payload.components);
    toast.success("Page content saved successfully");
  } catch (error: any) {
    toast.error(error.message || "Failed to save components");
    throw error;
  } finally {
    setLoading(false);
  }
}, [components, pageId, toast]);
```

### Load Components

```typescript
useEffect(() => {
  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await pagesService.getPageById(pageId);
      
      // Transform backend data to component schema
      const loadedComponents = response.data.components?.map((comp: any) => ({
        id: comp.id,
        type: comp.type,
        props: comp.data,
      })) || [];
      
      setComponents(loadedComponents);
    } catch (error: any) {
      toast.error(error.message || "Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  if (pageId) {
    loadComponents();
  }
}, [pageId]);
```

---

## Testing

### Unit Tests

```typescript
// ComponentLibrary.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ComponentLibrary from "./ComponentLibrary";

describe("ComponentLibrary", () => {
  it("renders all component categories", () => {
    render(<ComponentLibrary />);
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
  });

  it("adds component on click", () => {
    const mockAddComponent = jest.fn();
    render(<ComponentLibrary addComponent={mockAddComponent} />);
    
    fireEvent.click(screen.getByText("Heading"));
    expect(mockAddComponent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "heading" })
    );
  });
});
```

### Integration Tests

```typescript
// PageBuilder.test.tsx
describe("Page Builder Integration", () => {
  it("complete workflow: add, edit, delete", async () => {
    const { container } = render(<PageBuilderModal pageId="test" />);
    
    // Add component
    fireEvent.click(screen.getByText("Heading"));
    expect(screen.getByText("Heading Text")).toBeInTheDocument();
    
    // Select component
    fireEvent.click(screen.getByText("Heading Text"));
    expect(screen.getByText("Component Settings")).toBeInTheDocument();
    
    // Edit component
    const input = screen.getByLabelText("Text");
    fireEvent.change(input, { target: { value: "New Title" } });
    expect(screen.getByText("New Title")).toBeInTheDocument();
    
    // Delete component
    fireEvent.click(screen.getByLabelText("Delete"));
    expect(screen.queryByText("New Title")).not.toBeInTheDocument();
  });
});
```

---

## Best Practices

### 1. Component Design
- Keep components simple and focused
- Use meaningful prop names
- Provide sensible defaults
- Support nested children when needed

### 2. Performance
- Memoize expensive renders
- Debounce frequent updates
- Use virtual scrolling for large lists
- Lazy load heavy components

### 3. UX
- Provide visual feedback
- Clear error messages
- Loading states
- Undo/redo support

### 4. Code Quality
- Type-safe with TypeScript
- Unit test coverage
- Document complex logic
- Follow naming conventions

---

## Resources

### Libraries to Consider:
- **react-beautiful-dnd** - Drag & drop
- **react-window** - Virtual scrolling
- **use-debounce** - Debouncing
- **react-hook-form** - Form handling
- **zod** - Schema validation

### Inspiration:
- Webflow
- Wix Editor
- WordPress Gutenberg
- Notion Blocks

---

**Happy coding! 🚀**
