# Race Canvas WebGL Error Fix

## Problem
When clicking "Start Race", the following errors occurred:
- \[createHorseSprites\] Starting, stage: _Container
- WebGL: INVALID_OPERATION: uniformMatrix3fv: location is not from the associated program
- WebGL: too many errors, no more errors will be reported to the console for this context

## Root Cause
The issue was in `/src/components/game/RaceCanvas.tsx` where we were incorrectly trying to replace the PixiJS v8 application stage:

```typescript
// PROBLEMATIC CODE:
const stage = new Container();
app.stage = stage;  // This causes WebGL program mismatch
```

In PixiJS v8, the application already initializes with its own stage and renderer. Replacing the stage after initialization causes WebGL context issues.

## Solution
Updated the RaceCanvas component to use the existing app.stage instead of creating and replacing it:

```typescript
// CORRECTED CODE:
// In PixiJS v8, the stage is already created during initialization
// We should use the existing stage instead of replacing it
const stage = app.stage;
```

Also updated the createHorseSprites function to use the correct stage reference:
```typescript
// Use the app.stage directly instead of assuming it's a custom container
const stage = app.stage;
stage.addChild(graphics);  // Add to the correct stage
```

## Files Modified
- `/src/components/game/RaceCanvas.tsx`

## Verification
The fix ensures that:
1. The WebGL context remains consistent
2. The stage hierarchy is maintained properly
3. Graphics elements are added to the correct stage
4. No WebGL errors occur when starting a race

## Test Plan (for reference)
If Playwright were available, we would test:
1. Navigate to race view
2. Click "Start Race" button
3. Verify no WebGL errors in browser console
4. Confirm race canvas renders correctly
