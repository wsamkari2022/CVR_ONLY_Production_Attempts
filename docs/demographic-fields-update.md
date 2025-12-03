# User Sessions Table - Demographic Fields Update

## Overview

The `user_sessions` table has been updated to capture demographic data as explicit columns instead of only storing them in a JSONB field. This makes queries easier, provides better data validation, and improves analysis capabilities.

---

## New Demographic Columns

### Columns Added to user_sessions

1. **age** (integer)
   - User's age
   - Valid range: 18-120
   - CHECK constraint ensures valid range
   - Nullable for backward compatibility

2. **gender** (text)
   - User's gender
   - Valid values: 'Male', 'Female', 'Other'
   - CHECK constraint ensures valid values
   - Nullable for backward compatibility

3. **ai_experience** (text)
   - Experience with AI systems
   - Valid values: 'Never', 'Rarely', 'Often', 'Very Often', 'Most of the Time'
   - CHECK constraint ensures valid values
   - Nullable for backward compatibility

4. **moral_reasoning_experience** (text)
   - Experience with moral reasoning (e.g., Philosophy Class, Moral Machine)
   - Valid values: 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
   - CHECK constraint ensures valid values
   - Nullable for backward compatibility

---

## Data Validation

All demographic fields have CHECK constraints to ensure data quality:

```sql
-- Age validation
CHECK (age >= 18 AND age <= 120)

-- Gender validation
CHECK (gender IN ('Male', 'Female', 'Other'))

-- AI Experience validation
CHECK (ai_experience IN ('Never', 'Rarely', 'Often', 'Very Often', 'Most of the Time'))

-- Moral Reasoning Experience validation
CHECK (moral_reasoning_experience IN ('Poor', 'Fair', 'Good', 'Very Good', 'Excellent'))
```

---

## Backward Compatibility

- The original `demographics` JSONB field is **kept intact**
- Existing records without explicit demographic values will continue to work
- New inserts populate **both** the JSONB field and the explicit columns
- This dual storage ensures compatibility with existing code while enabling better queries

---

## Migration Details

**Migration File:** `supabase/migrations/20251105000004_add_demographic_fields_to_user_sessions.sql`

**Migration Strategy:**
1. Uses `ALTER TABLE` to add new columns
2. Uses `DO $$ BEGIN ... END $$;` blocks with conditional checks
3. Prevents duplicate columns if migration is run multiple times
4. Adds CHECK constraints for data validation
5. Creates composite index on all demographic fields for analysis queries
6. Adds helpful column comments for documentation

---

## Query Examples

### Simple Demographic Queries

```sql
-- Get all sessions with their demographics
SELECT session_id, age, gender, ai_experience, moral_reasoning_experience
FROM user_sessions;

-- Count users by gender
SELECT gender, COUNT(*) as user_count
FROM user_sessions
WHERE gender IS NOT NULL
GROUP BY gender;

-- Count users by age group
SELECT
  CASE
    WHEN age BETWEEN 18 AND 25 THEN '18-25'
    WHEN age BETWEEN 26 AND 35 THEN '26-35'
    WHEN age BETWEEN 36 AND 45 THEN '36-45'
    WHEN age BETWEEN 46 AND 60 THEN '46-60'
    ELSE '60+'
  END as age_group,
  COUNT(*) as user_count
FROM user_sessions
WHERE age IS NOT NULL
GROUP BY age_group
ORDER BY age_group;

-- Count users by AI experience level
SELECT ai_experience, COUNT(*) as user_count
FROM user_sessions
WHERE ai_experience IS NOT NULL
GROUP BY ai_experience
ORDER BY
  CASE ai_experience
    WHEN 'Never' THEN 1
    WHEN 'Rarely' THEN 2
    WHEN 'Often' THEN 3
    WHEN 'Very Often' THEN 4
    WHEN 'Most of the Time' THEN 5
  END;

-- Count users by moral reasoning experience
SELECT moral_reasoning_experience, COUNT(*) as user_count
FROM user_sessions
WHERE moral_reasoning_experience IS NOT NULL
GROUP BY moral_reasoning_experience
ORDER BY
  CASE moral_reasoning_experience
    WHEN 'Poor' THEN 1
    WHEN 'Fair' THEN 2
    WHEN 'Good' THEN 3
    WHEN 'Very Good' THEN 4
    WHEN 'Excellent' THEN 5
  END;
```

### Advanced Analysis Queries

```sql
-- Average age by gender
SELECT gender, AVG(age) as avg_age, COUNT(*) as count
FROM user_sessions
WHERE age IS NOT NULL AND gender IS NOT NULL
GROUP BY gender;

-- AI experience distribution by age group
SELECT
  CASE
    WHEN age BETWEEN 18 AND 25 THEN '18-25'
    WHEN age BETWEEN 26 AND 35 THEN '26-35'
    WHEN age BETWEEN 36 AND 45 THEN '36-45'
    WHEN age BETWEEN 46 AND 60 THEN '46-60'
    ELSE '60+'
  END as age_group,
  ai_experience,
  COUNT(*) as user_count
FROM user_sessions
WHERE age IS NOT NULL AND ai_experience IS NOT NULL
GROUP BY age_group, ai_experience
ORDER BY age_group, ai_experience;

-- Moral reasoning experience by AI experience
SELECT
  ai_experience,
  moral_reasoning_experience,
  COUNT(*) as user_count
FROM user_sessions
WHERE ai_experience IS NOT NULL AND moral_reasoning_experience IS NOT NULL
GROUP BY ai_experience, moral_reasoning_experience
ORDER BY ai_experience, moral_reasoning_experience;

-- Complete demographic profile
SELECT
  age,
  gender,
  ai_experience,
  moral_reasoning_experience,
  COUNT(*) as user_count
FROM user_sessions
WHERE age IS NOT NULL
  AND gender IS NOT NULL
  AND ai_experience IS NOT NULL
  AND moral_reasoning_experience IS NOT NULL
GROUP BY age, gender, ai_experience, moral_reasoning_experience
ORDER BY user_count DESC;
```

---

## TypeScript/Supabase Query Examples

### Get User Demographics

```typescript
// Get demographics for a specific session
const { data, error } = await supabase
  .from('user_sessions')
  .select('session_id, age, gender, ai_experience, moral_reasoning_experience')
  .eq('session_id', sessionId)
  .maybeSingle();

// Get all sessions with demographics
const { data, error } = await supabase
  .from('user_sessions')
  .select('session_id, age, gender, ai_experience, moral_reasoning_experience, started_at')
  .not('age', 'is', null)
  .order('started_at', { ascending: false });
```

### Demographic Filtering

```typescript
// Find sessions with specific demographic criteria
const { data, error } = await supabase
  .from('user_sessions')
  .select('*')
  .gte('age', 25)
  .lte('age', 35)
  .eq('gender', 'Female')
  .eq('ai_experience', 'Often');

// Count sessions by AI experience
const { data, error } = await supabase
  .from('user_sessions')
  .select('ai_experience, count()', { count: 'exact' })
  .not('ai_experience', 'is', null);
```

---

## DatabaseService Updates

The `DatabaseService.createUserSession()` method has been updated to populate both the JSONB demographics field and the explicit columns:

```typescript
// Old behavior (still works)
await DatabaseService.createUserSession({
  session_id: sessionId,
  demographics: {
    age: '25',
    gender: 'Female',
    aiExperience: 'Often',
    moralReasoningExperience: 'Good'
  }
});

// What happens internally now:
// 1. Stores the full object in demographics (JSONB)
// 2. Also populates: age=25, gender='Female',
//    ai_experience='Often', moral_reasoning_experience='Good'
```

**Key Points:**
- No changes needed to existing code
- Demographics are now stored in both formats automatically
- Explicit columns enable easier querying and analysis
- JSONB field maintained for backward compatibility

---

## Benefits of Explicit Columns

### 1. **Easier Queries**
```sql
-- Before (JSONB query - more complex)
SELECT * FROM user_sessions
WHERE demographics->>'age' = '25';

-- After (direct column - simpler)
SELECT * FROM user_sessions
WHERE age = 25;
```

### 2. **Better Performance**
- Indexed columns query faster than JSONB fields
- Composite index on all demographic fields enables efficient filtering

### 3. **Data Validation**
- CHECK constraints prevent invalid data
- Database-level validation ensures data quality
- Type safety (integer for age vs text in JSONB)

### 4. **Improved Analysis**
- Standard SQL aggregation functions work directly
- No JSON parsing required
- Compatible with BI tools and analysis software

### 5. **Clear Schema**
- Explicit columns self-document the data structure
- Column comments provide inline documentation
- IDE autocomplete and type checking

---

## Index Created

A composite index has been added for efficient demographic queries:

```sql
CREATE INDEX idx_user_sessions_demographics
  ON user_sessions(age, gender, ai_experience, moral_reasoning_experience);
```

This index speeds up queries that filter or group by demographic fields.

---

## Column Comments

Each column includes helpful documentation:

```sql
COMMENT ON COLUMN user_sessions.age IS 'User age (18-120)';
COMMENT ON COLUMN user_sessions.gender IS 'User gender: Male, Female, or Other';
COMMENT ON COLUMN user_sessions.ai_experience IS 'Experience with AI systems: Never, Rarely, Often, Very Often, or Most of the Time';
COMMENT ON COLUMN user_sessions.moral_reasoning_experience IS 'Experience with moral reasoning: Poor, Fair, Good, Very Good, or Excellent';
```

---

## Testing the Update

### Verify Migration Applied

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_sessions'
  AND column_name IN ('age', 'gender', 'ai_experience', 'moral_reasoning_experience');

-- Verify CHECK constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%user_sessions%';
```

### Test Insert

```typescript
// Test creating a session with demographics
const sessionId = DatabaseService.generateSessionId();
await DatabaseService.createUserSession({
  session_id: sessionId,
  demographics: {
    age: '28',
    gender: 'Male',
    aiExperience: 'Very Often',
    moralReasoningExperience: 'Very Good'
  }
});

// Verify both storage methods
const { data } = await supabase
  .from('user_sessions')
  .select('demographics, age, gender, ai_experience, moral_reasoning_experience')
  .eq('session_id', sessionId)
  .maybeSingle();

console.log(data);
// Should show:
// {
//   demographics: { age: '28', gender: 'Male', ... },
//   age: 28,
//   gender: 'Male',
//   ai_experience: 'Very Often',
//   moral_reasoning_experience: 'Very Good'
// }
```

---

## Summary

✅ **Added 4 new explicit demographic columns** to user_sessions table
✅ **Data validation** with CHECK constraints
✅ **Backward compatible** - keeps JSONB demographics field
✅ **Improved performance** with composite index
✅ **Better queries** - no JSON parsing needed
✅ **DatabaseService updated** to populate both formats automatically
✅ **Documentation** with column comments
✅ **Build verified** - no compilation errors

The user_sessions table now provides clean, efficient access to demographic data while maintaining full backward compatibility with existing code.
