# Value Matching System Documentation

## Overview
The value matching system determines which decision options to present initially in the simulation based on the user's top 2 matched stable values from their assessment.

## Key Components

### 1. Value Assessment (ValuesPage.tsx)
- Calculates match percentages for each value based on explicit and implicit responses
- Stores values with their match percentages in localStorage
- Sorts stable values by match percentage
- Saves top matched values for use in simulation

```typescript
// Example of how match percentages are calculated and stored
const matchedValues = uniqueStableValues.map(value => ({
  name: value,
  matchPercentage: calculateMatchPercentage(value),
  type: 'Stable'
}));

// Store in localStorage with match percentages
localStorage.setItem('finalValues', JSON.stringify(matchedValues));
```

### 2. Simulation Page (SimulationMainPage.tsx)
- Loads top 2 matched stable values
- Filters initial options based on matching labels
- Moves non-matching options to alternatives

```typescript
// Example of how initial options are selected
const getInitialOptions = useCallback(() => {
  if (!currentScenario || !topStableValues.length) return currentScenario.options.slice(0, 2);
  
  // Find options that match top stable values based on their labels
  const matchingOptions = currentScenario.options.filter(option => 
    topStableValues.includes(option.label.toLowerCase())
  );

  return matchingOptions.length >= 2 ? matchingOptions.slice(0, 2) : currentScenario.options.slice(0, 2);
}, [currentScenario, topStableValues]);
```

### 3. Decision Options (types/index.ts)
Each option must have:
- A `label` property indicating its primary value
- Expert opinions for additional context
- Impact metrics and risk information

## Implementation Steps

1. In ValuesPage.tsx:
   - Calculate value match percentages
   - Sort stable values by match percentage
   - Store top 2 matches with percentages

2. In SimulationMainPage.tsx:
   - Load top stable values on mount
   - Use labels to filter initial options
   - Move remaining options to alternatives

3. In scenarios.ts:
   - Ensure each option has correct value label
   - Verify expert opinions align with option's primary value

## Example Flow

1. User completes value assessment
2. System identifies top 2 stable values (e.g., "efficiency" and "nonmaleficence")
3. Simulation loads and filters options matching these values
4. Remaining options become available as alternatives

## Debugging

If initial options aren't matching correctly:
1. Check localStorage for correct value storage
2. Verify option labels match value names exactly
3. Confirm topStableValues are being loaded correctly