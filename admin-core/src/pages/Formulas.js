import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Table, Input, Toggle } from '../fields';

const Formulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFormula, setCurrentFormula] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch formulas
    const fetchFormulas = async () => {
      try {
        // In a real implementation, this would be an API call
        // const response = await fetch('/wp-json/product-kpi-tracker/v1/formulas');
        // const data = await response.json();
        
        // Simulated data
        setTimeout(() => {
          setFormulas([
            {
              id: 1,
              name: 'Gross Profit Margin',
              formula: '(Revenue - COGS) / Revenue * 100',
              description: 'Measures the profitability after accounting for cost of goods sold',
              isActive: true,
              variables: [
                { name: 'Revenue', source: 'wc_order_stats.net_total' },
                { name: 'COGS', source: 'product_meta.cost' }
              ]
            },
            {
              id: 2,
              name: 'Return on Investment (ROI)',
              formula: '(Revenue - Cost) / Cost * 100',
              description: 'Measures the return on investment for marketing campaigns',
              isActive: true,
              variables: [
                { name: 'Revenue', source: 'wc_order_stats.net_total' },
                { name: 'Cost', source: 'marketing_costs.total' }
              ]
            },
            {
              id: 3,
              name: 'Customer Lifetime Value',
              formula: 'Average Order Value * Purchase Frequency * Customer Lifespan',
              description: 'Estimates the total revenue a business can expect from a single customer',
              isActive: false,
              variables: [
                { name: 'Average Order Value', source: 'wc_order_stats.avg_order_value' },
                { name: 'Purchase Frequency', source: 'custom.purchase_frequency' },
                { name: 'Customer Lifespan', source: 'custom.customer_lifespan' }
              ]
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching formulas:', error);
        setIsLoading(false);
      }
    };

    fetchFormulas();
  }, []);

  const handleAddFormula = () => {
    setCurrentFormula({
      id: null,
      name: '',
      formula: '',
      description: '',
      isActive: true,
      variables: [{ name: '', source: '' }]
    });
    setIsEditing(true);
  };

  const handleEditFormula = (formula) => {
    setCurrentFormula({ ...formula });
    setIsEditing(true);
  };

  const handleDeleteFormula = (id) => {
    if (window.confirm('Are you sure you want to delete this formula?')) {
      // In a real implementation, this would be an API call
      // await fetch(`/wp-json/product-kpi-tracker/v1/formulas/${id}`, { method: 'DELETE' });
      
      setFormulas(formulas.filter(formula => formula.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    setFormulas(formulas.map(formula => 
      formula.id === id ? { ...formula, isActive: !formula.isActive } : formula
    ));
  };

  const handleSaveFormula = () => {
    if (!currentFormula.name || !currentFormula.formula) {
      alert('Formula name and expression are required');
      return;
    }

    if (currentFormula.id) {
      // Update existing formula
      setFormulas(formulas.map(formula => 
        formula.id === currentFormula.id ? currentFormula : formula
      ));
    } else {
      // Add new formula
      const newFormula = {
        ...currentFormula,
        id: Math.max(0, ...formulas.map(f => f.id)) + 1
      };
      setFormulas([...formulas, newFormula]);
    }

    setIsEditing(false);
    setCurrentFormula(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentFormula(null);
  };

  const handleFormulaChange = (field, value) => {
    setCurrentFormula({
      ...currentFormula,
      [field]: value
    });
  };

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = [...currentFormula.variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value
    };
    
    setCurrentFormula({
      ...currentFormula,
      variables: updatedVariables
    });
  };

  const addVariable = () => {
    setCurrentFormula({
      ...currentFormula,
      variables: [...currentFormula.variables, { name: '', source: '' }]
    });
  };

  const removeVariable = (index) => {
    const updatedVariables = [...currentFormula.variables];
    updatedVariables.splice(index, 1);
    
    setCurrentFormula({
      ...currentFormula,
      variables: updatedVariables
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading formulas...</div>;
  }

  if (isEditing) {
    return (
      <div className="pkt-admin-container">
        <Title text={currentFormula.id ? 'Edit Formula' : 'Add New Formula'} />
        
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="pkt-label">Formula Name</label>
              <Input 
                value={currentFormula.name} 
                onChange={(e) => handleFormulaChange('name', e.target.value)} 
                placeholder="e.g., Gross Profit Margin"
              />
            </div>
            
            <div>
              <label className="pkt-label">Formula Expression</label>
              <Input 
                value={currentFormula.formula} 
                onChange={(e) => handleFormulaChange('formula', e.target.value)} 
                placeholder="e.g., (Revenue - COGS) / Revenue * 100"
              />
            </div>
            
            <div>
              <label className="pkt-label">Description</label>
              <Input 
                value={currentFormula.description} 
                onChange={(e) => handleFormulaChange('description', e.target.value)} 
                placeholder="Describe what this formula calculates"
              />
            </div>
            
            <div className="flex items-center">
              <Toggle 
                checked={currentFormula.isActive} 
                onChange={(e) => handleFormulaChange('isActive', e.target.checked)} 
              />
              <span className="ml-2">Active</span>
            </div>
          </div>
        </Card>
        
        <Title text="Variables" level="h3" />
        
        <Card className="mb-6">
          {currentFormula.variables.map((variable, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200 last:border-0">
              <div>
                <label className="pkt-label">Variable Name</label>
                <Input 
                  value={variable.name} 
                  onChange={(e) => handleVariableChange(index, 'name', e.target.value)} 
                  placeholder="e.g., Revenue"
                />
              </div>
              
              <div>
                <label className="pkt-label">Data Source</label>
                <Input 
                  value={variable.source} 
                  onChange={(e) => handleVariableChange(index, 'source', e.target.value)} 
                  placeholder="e.g., wc_order_stats.net_total"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  text="Remove" 
                  variant="secondary" 
                  onClick={() => removeVariable(index)} 
                  disabled={currentFormula.variables.length <= 1}
                />
              </div>
            </div>
          ))}
          
          <div className="mt-4">
            <Button text="Add Variable" variant="secondary" onClick={addVariable} />
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button text="Cancel" variant="secondary" onClick={handleCancelEdit} className="mr-2" />
          <Button text="Save Formula" onClick={handleSaveFormula} />
        </div>
      </div>
    );
  }

  return (
    <div className="pkt-admin-container">
      <div className="flex justify-between items-center mb-6">
        <Title text="KPI Formulas" />
        <Button text="Add New Formula" onClick={handleAddFormula} />
      </div>
      
      {formulas.length === 0 ? (
        <Card>
          <p className="text-center py-6">No formulas found. Click "Add New Formula" to create one.</p>
        </Card>
      ) : (
        formulas.map(formula => (
          <Card key={formula.id} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{formula.name}</h3>
                <div className="text-sm text-gray-500 mb-2">{formula.description}</div>
              </div>
              <Toggle 
                checked={formula.isActive} 
                onChange={() => handleToggleActive(formula.id)} 
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded mb-4 font-mono text-sm">
              {formula.formula}
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Variables:</h4>
              <ul className="text-sm">
                {formula.variables.map((variable, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{variable.name}:</span> {variable.source}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button 
                text="Edit" 
                variant="secondary" 
                onClick={() => handleEditFormula(formula)} 
                className="mr-2"
              />
              <Button 
                text="Delete" 
                variant="secondary" 
                onClick={() => handleDeleteFormula(formula.id)} 
              />
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default Formulas;
