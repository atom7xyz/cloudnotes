import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Tos from './components/pages/Tos';

// Save current content for Tablet page
const TabletPage = () => {
  const colorClasses = [
    { name: 'background', class: 'bg-background' },
    { name: 'foreground', class: 'text-foreground' },
    { name: 'card', class: 'bg-card' },
    { name: 'card foreground', class: 'text-card-foreground' },
    { name: 'popover', class: 'bg-popover' },
    { name: 'popover foreground', class: 'text-popover-foreground' },
    { name: 'primary', class: 'bg-primary' },
    { name: 'primary foreground', class: 'text-primary-foreground' },
    { name: 'secondary', class: 'bg-secondary' },
    { name: 'secondary foreground', class: 'text-secondary-foreground' },
    { name: 'muted', class: 'bg-muted' },
    { name: 'muted foreground', class: 'text-muted-foreground' },
    { name: 'accent', class: 'bg-accent' },
    { name: 'accent foreground', class: 'text-accent-foreground' },
    { name: 'destructive', class: 'bg-destructive' },
    { name: 'destructive foreground', class: 'text-destructive-foreground' },
    { name: 'border', class: 'border border-border' },
    { name: 'input', class: 'bg-input' },
    { name: 'ring', class: 'ring ring-ring' }
  ];

  return (
    <div className="p-8 bg-white text-foreground min-h-screen">
      <h1 className="text-3xl font-bold mb-6">shadcn/ui Colors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorClasses.map((color) => (
          <div 
            key={color.name}
            className="rounded-lg overflow-hidden border border-border"
          >
            <div 
              className={`h-16 w-full ${color.class} flex items-center justify-center`}
            >
              {color.class.includes('text-') && (
                <div className="bg-background px-2 py-1 rounded">Sample Text</div>
              )}
            </div>
            <div className="p-3 bg-card">
              <p className="font-mono text-sm">{color.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{color.class}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">UI Components with Theme Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
            <h3 className="font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Primary</button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md">Secondary</button>
              <button className="bg-accent text-accent-foreground px-4 py-2 rounded-md">Accent</button>
              <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">Destructive</button>
              <button className="bg-muted text-muted-foreground px-4 py-2 rounded-md">Muted</button>
            </div>
          </div>
          
          <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
            <h3 className="font-medium">Text Styles</h3>
            <div className="space-y-2">
              <p className="text-foreground">Default text</p>
              <p className="text-muted-foreground">Muted text</p>
              <p className="text-primary">Primary text</p>
              <p className="text-secondary">Secondary text</p>
              <p className="text-accent">Accent text</p>
              <p className="text-destructive">Destructive text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tos" element={<Tos />} />
        <Route path="/tablet" element={<TabletPage />} />
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;