import React from 'react';
import { Users, Skull, Droplets, Building, Trees as Tree, Factory } from 'lucide-react';
import { DecisionOption as DecisionOptionType } from '../types';

interface DecisionOptionProps {
  option: DecisionOptionType;
  onSelect: (option: DecisionOptionType) => void;
}

const DecisionOption: React.FC<DecisionOptionProps> = ({ option, onSelect }) => {
  const formatImpactValue = (value: number, isLivesSaved: boolean = false, isCasualties: boolean = false) => {
    if (isLivesSaved) {
      return `+${value}`;
    }
    if (isCasualties) {
      return `+${value}`;
    }
    return `${value}%`;
  };

  return (
    <button
      onClick={() => onSelect(option)}
      className={`bg-white border ${option.isAlternative ? 'border-blue-300 hover:bg-blue-50' : 'border-gray-300 hover:bg-gray-50'} 
        text-left p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col h-full`}
    >
      <h4 className={`font-medium ${option.isAlternative ? 'text-blue-800' : 'text-gray-800'} mb-1`}>
        {option.title}
        {option.isAlternative && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Alternative</span>
        )}
      </h4>
      <p className="text-gray-600 text-xs mb-2">{option.description}</p>
      
      {/* Risk Information */}
      <div className="mb-2">
        {option.riskInfo.map((risk, index) => (
          <div key={index} className="flex items-start mb-1">
            <span className="text-red-500 mr-1 mt-0.5">•</span>
            <p className="text-xs text-gray-700">{risk}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs mt-auto">
        <div className="flex items-center text-green-600">
          <Users size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.livesSaved, true)}</span>
        </div>
        <div className="flex items-center text-red-600">
          <Skull size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.humanCasualties, false, true)}</span>
        </div>
        <div className="flex items-center text-blue-600">
          <Droplets size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.firefightingResource)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Building size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.infrastructureCondition)}</span>
        </div>
        <div className="flex items-center text-green-600">
          <Tree size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.biodiversityCondition)}</span>
        </div>
        <div className="flex items-center text-blue-600">
          <Building size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.propertiesCondition)}</span>
        </div>
        <div className="flex items-center text-purple-600">
          <Factory size={12} className="mr-1" />
          <span>{formatImpactValue(option.impact.nuclearPowerStation)}</span>
        </div>
      </div>
    </button>
  );
};

export default DecisionOption;