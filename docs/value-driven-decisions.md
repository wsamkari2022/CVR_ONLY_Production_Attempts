# Value-Driven Decision Making System

## Overview

This documentation explains how the simulation matches user values to decision options and manages the presentation of alternatives. The system integrates explicit value assessments, implicit preferences, and dynamic decision options to create a personalized crisis management experience.

## Value Assessment Process

### 1. Explicit Value Assessment
- Users complete scenario-based questionnaires
- Each scenario presents ethical dilemmas with multiple value-based choices
- Responses are stored as `ExplicitValue` objects:
  ```typescript
  interface ExplicitValue {
    question_id: number;
    value_selected: string;
    timestamp: string;
  }
  ```

### 2. Implicit Value Assessment
- Users navigate through complex scenarios with follow-up questions
- System identifies stable and context-dependent values
- Values are categorized and stored as `DeepValue` objects:
  ```typescript
  interface DeepValue {
    name: string;
    type: 'Stable' | 'Context-Dependent';
    matchPercentage?: string;
  }
  ```

### 3. Value Matching Process
1. System calculates match percentages between explicit and implicit values
2. Values are ranked by match percentage
3. Top 2 stable values are selected for initial decision matching
4. Results are stored in localStorage as 'finalValues'

## Decision Option Selection

### Initial Options Selection
```typescript
const getInitialOptions = () => {
  if (!currentScenario || !topStableValues.length) 
    return currentScenario.options.slice(0, 2);
  
  const matchingOptions = currentScenario.options.filter(option => 
    topStableValues.includes(option.label.toLowerCase())
  );

  return matchingOptions.length >= 2 ? 
    matchingOptions.slice(0, 2) : 
    currentScenario.options.slice(0, 2);
};
```

### Alternative Options
```typescript
const getAlternativeOptions = () => {
  const initialOptionIds = getInitialOptions().map(opt => opt.id);
  const addedOptionIds = addedAlternatives.map(opt => opt.id);
  
  return currentScenario.options
    .filter(option => !initialOptionIds.includes(option.id) && 
                     !addedOptionIds.includes(option.id))
    .map(option => ({ ...option, isAlternative: true }));
};
```

## Decision Impact System

### Impact Metrics
```typescript
interface SimulationMetrics {
  livesSaved: number;
  humanCasualties: number;
  firefightingResource: number;
  infrastructureCondition: number;
  biodiversityCondition: number;
  propertiesCondition: number;
  nuclearPowerStation: number;
}
```

### Decision Processing
When a decision is confirmed:
1. Impact calculations are performed
2. Metrics are updated with animation
3. Scenario transition is triggered if applicable

## Use Cases

### Case 1: User Selects Initial Option
```typescript
// Example: Safety-focused user with matching initial options
const userValues = ['safety', 'efficiency'];
const initialOptions = [
  {
    id: "safety-first",
    label: "safety",
    impact: {
      livesSaved: 1600,
      humanCasualties: 400,
      firefightingResource: -40
      // ... other metrics
    }
  }
];
```

**Outcome:**
- Direct alignment with user's primary values
- Immediate feedback through expert opinions
- Impact reflects value-aligned decision making

### Case 2: User Explores Alternatives
```typescript
// Example: User explores sustainability alternative
const alternative = {
  id: "eco-conscious",
  label: "sustainability",
  isAlternative: true,
  impact: {
    livesSaved: 800,
    biodiversityCondition: -15
    // ... other metrics
  }
};
```

**Outcome:**
- Different value perspective explored
- Trade-offs clearly presented
- Distinct visual styling for alternative options

## Visual Differentiation

### Initial Options
```typescript
className={`bg-white border border-gray-300 hover:bg-gray-50`}
```

### Alternative Options
```typescript
className={`bg-white border border-blue-300 
  shadow-[0_0_0_1px_rgba(59,130,246,0.1)] 
  bg-gradient-to-b from-blue-50/50 to-transparent 
  hover:bg-blue-50/80`}
```

## Expert Analysis System

Each decision option includes expert opinions from multiple perspectives:
- Safety Expert
- Efficiency Expert
- Sustainability Expert
- Fairness Expert
- Nonmaleficence Expert

```typescript
interface ExpertOpinion {
  summary: string;
  recommendation: "Accept" | "Reject";
  comparison: string;
}
```

## Trade-off Visualization

The system provides multiple views for comparing options:
1. Radar Chart: Multi-dimensional comparison
2. Bar Chart: Single metric deep-dive
3. Differences View: Direct option comparison

## Implementation Guidelines

1. Value Loading
```typescript
useEffect(() => {
  const savedValues = localStorage.getItem('finalValues');
  if (savedValues) {
    const values = JSON.parse(savedValues);
    const stableValues = values
      .slice(0, 2)
      .map(v => v.name.toLowerCase());
    setTopStableValues(stableValues);
  }
}, []);
```

2. Alternative Management
```typescript
const handleAddAlternative = (option: DecisionOptionType) => {
  setAddedAlternatives(prev => [...prev, { 
    ...option, 
    isAlternative: true 
  }]);
};
```

## Best Practices

1. Value Matching
- Always prioritize stable values for initial options
- Maintain alternative availability for exploration
- Provide clear visual distinction between initial and alternative options

2. Impact Calculation
- Update metrics immediately after decision confirmation
- Animate changes for better user feedback
- Validate metric boundaries (0-100 range)

3. User Interface
- Clearly mark alternative options
- Provide comprehensive expert analysis
- Enable easy comparison between options

## Error Handling

1. Value Loading
```typescript
try {
  const values = JSON.parse(savedValues);
  // Process values
} catch (error) {
  console.error('Error parsing matched stable values:', error);
  // Fallback to default options
}
```

2. Metric Updates
```typescript
const newMetrics = {
  ...metrics,
  firefightingResource: Math.max(0, metrics.firefightingResource + impact)
};
```

## Conclusion

This value-driven decision system creates a personalized experience by:
- Matching user values to initial options
- Providing clearly marked alternatives
- Maintaining distinct visual hierarchy
- Offering comprehensive impact analysis
- Supporting informed decision-making through multiple visualization options