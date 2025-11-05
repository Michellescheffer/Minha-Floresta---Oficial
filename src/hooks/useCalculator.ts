import { useState } from 'react';

export interface Calculation {
  id: string;
  userEmail?: string;
  carbonFootprint: number;
  transport: number;
  energy: number;
  consumption: number;
  treesNeeded: number;
  offsetCost: number;
  recommendations: string[];
  createdAt: string;
}

export function useCalculator() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFootprint = async (data: {
    transport: {
      car: number;
      publicTransport: number;
      flights: number;
    };
    energy: {
      electricity: number;
      gas: number;
    };
    consumption: {
      meat: number;
      shopping: number;
      waste: number;
    };
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate carbon footprint based on input data
      const transportFootprint = 
        (data.transport.car * 0.21) + // kg CO2 per km
        (data.transport.publicTransport * 0.05) + // kg CO2 per km
        (data.transport.flights * 0.255); // kg CO2 per km

      const energyFootprint = 
        (data.energy.electricity * 0.5) + // kg CO2 per kWh
        (data.energy.gas * 2.3); // kg CO2 per m³

      const consumptionFootprint = 
        (data.consumption.meat * 6.61) + // kg CO2 per kg meat
        (data.consumption.shopping * 0.5) + // kg CO2 per € spent
        (data.consumption.waste * 0.8); // kg CO2 per kg waste

      const totalFootprint = transportFootprint + energyFootprint + consumptionFootprint;
      
      // Calculate trees needed (1 tree absorbs ~22kg CO2/year)
      const treesNeeded = Math.ceil(totalFootprint / 22);
      
      // Calculate offset cost (R$ 25 per tree/m²)
      const offsetCost = treesNeeded * 25;

      // Generate recommendations
      const recommendations = [];
      if (data.transport.car > 10000) {
        recommendations.push('Considere usar mais transporte público ou bicicleta');
      }
      if (data.energy.electricity > 300) {
        recommendations.push('Invista em equipamentos mais eficientes energeticamente');
      }
      if (data.consumption.meat > 50) {
        recommendations.push('Reduza o consumo de carne vermelha algumas vezes por semana');
      }
      if (data.transport.flights > 5000) {
        recommendations.push('Considere compensar suas viagens aéreas');
      }
      if (recommendations.length === 0) {
        recommendations.push('Parabéns! Você já tem uma pegada de carbono relativamente baixa');
      }

      const calculation: Calculation = {
        id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        carbonFootprint: Math.round(totalFootprint * 100) / 100,
        transport: Math.round(transportFootprint * 100) / 100,
        energy: Math.round(energyFootprint * 100) / 100,
        consumption: Math.round(consumptionFootprint * 100) / 100,
        treesNeeded,
        offsetCost,
        recommendations,
        createdAt: new Date().toISOString()
      };

      setCalculations(prev => [calculation, ...prev]);
      
      return calculation;
    } catch (err) {
      console.error('Error calculating footprint:', err);
      setError('Erro ao calcular pegada de carbono');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveCalculation = async (calculation: Calculation, userEmail?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedCalculation = {
        ...calculation,
        userEmail,
        id: userEmail ? `calc_${userEmail}_${Date.now()}` : calculation.id
      };

      // Save to localStorage for persistence
      const savedCalculations = localStorage.getItem('minha_floresta_calculations');
      const parsedCalculations = savedCalculations ? JSON.parse(savedCalculations) : [];
      parsedCalculations.unshift(updatedCalculation);
      localStorage.setItem('minha_floresta_calculations', JSON.stringify(parsedCalculations.slice(0, 10))); // Keep only last 10

      setCalculations(prev => {
        const updated = [updatedCalculation, ...prev.filter(c => c.id !== calculation.id)];
        return updated.slice(0, 10); // Keep only last 10 in memory
      });

      return updatedCalculation;
    } catch (err) {
      console.error('Error saving calculation:', err);
      setError('Erro ao salvar cálculo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCalculations = async (userEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate fetch delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load from localStorage
      const savedCalculations = localStorage.getItem('minha_floresta_calculations');
      const parsedCalculations = savedCalculations ? JSON.parse(savedCalculations) : [];
      
      const userCalculations = parsedCalculations.filter((calc: Calculation) => calc.userEmail === userEmail);
      
      return userCalculations;
    } catch (err) {
      console.error('Error fetching user calculations:', err);
      setError('Erro ao buscar cálculos do usuário');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calculations,
    isLoading,
    error,
    calculateFootprint,
    saveCalculation,
    getUserCalculations
  };
}