import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  currentFilters: any;
}

export function CMSAdvancedFilters({ onApplyFilters, onClearFilters, currentFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: currentFilters.dateFrom || '',
    dateTo: currentFilters.dateTo || '',
    minValue: currentFilters.minValue || '',
    maxValue: currentFilters.maxValue || '',
    status: currentFilters.status || 'all',
    type: currentFilters.type || 'all',
    location: currentFilters.location || '',
    ...currentFilters
  });

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      status: 'all',
      type: 'all',
      location: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`bg-white/10 backdrop-blur-md border-white/20 relative ${
            hasActiveFilters ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Configure filtros personalizados para refinar sua busca
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="text-sm text-gray-600">Data Inicial</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="bg-white/10 backdrop-blur-md border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm text-gray-600">Data Final</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="bg-white/10 backdrop-blur-md border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label>Faixa de Valor (R$)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minValue" className="text-sm text-gray-600">Valor Mínimo</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={filters.minValue}
                  onChange={(e) => setFilters({...filters, minValue: e.target.value})}
                  className="bg-white/10 backdrop-blur-md border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="maxValue" className="text-sm text-gray-600">Valor Máximo</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="10000"
                  value={filters.maxValue}
                  onChange={(e) => setFilters({...filters, maxValue: e.target.value})}
                  className="bg-white/10 backdrop-blur-md border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Status e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="reforestation">Reflorestamento</SelectItem>
                  <SelectItem value="restoration">Restauração</SelectItem>
                  <SelectItem value="conservation">Conservação</SelectItem>
                  <SelectItem value="blue-carbon">Carbono Azul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Localização */}
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              placeholder="Digite uma localização..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="bg-white/10 backdrop-blur-md border-white/20"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}