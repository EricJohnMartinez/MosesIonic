# Temperature Table Component

## Overview
The Temperature Table component displays hourly temperature data from 12 midnight to 11 PM in a structured table format. It's designed to match the existing app's dark theme and provides comprehensive temperature monitoring capabilities.

## Features

### Visual Design
- **Dark Theme**: Matches the app's existing design with glass morphism effects
- **Responsive**: Adapts to different screen sizes (mobile, tablet, desktop)
- **Interactive**: Click the Temperature card to toggle the table visibility
- **Status Indicators**: Color-coded temperature status (Cool, Comfortable, Warm, Hot, Very Hot)
- **Visual Progress Bars**: Each temperature reading shows a colored bar indicating intensity

### Data Display
- **24-Hour Format**: Shows all hours from 12mn to 11pm
- **Current Hour Highlighting**: The current hour is highlighted in blue
- **Real-time Updates**: Fetches data from Firebase and updates automatically
- **Statistics**: Shows current temperature, daily average, min/max values
- **Status Classification**: 
  - Cool (≤20°C) - Blue
  - Comfortable (21-25°C) - Green  
  - Warm (26-30°C) - Yellow
  - Hot (31-35°C) - Orange
  - Very Hot (>35°C) - Red

### Data Sources
- Fetches temperature data from Firebase at path: `{stationId}/data/sensors/TEM`
- Calculates hourly averages for more stable readings
- Shows "No Data" for hours without readings

## Usage

### In HomePage.vue
The component is integrated into the main weather dashboard:

1. **Toggle Display**: Click the Temperature card in the metrics grid
2. **Automatic Refresh**: Updates when switching stations or using pull-to-refresh
3. **Real-time Data**: Connects to Firebase for live temperature readings

### Component Props
- `stationId`: The ID of the weather station to fetch data from
- `currentTemperature`: (optional) Current temperature value for display

### Component Methods
- `fetchTemperatureData(stationId)`: Fetches and processes temperature data
- Component auto-exposes this method for parent components to trigger refreshes

## Integration Notes

### Firebase Structure
The component expects temperature data at:
```
{stationId}/
  data/
    sensors/
      TEM/
        {timestamp}: {
          val: temperature_value
        }
```

### Responsive Behavior
- **Mobile**: Stacked layout, simplified display
- **Tablet**: Optimized spacing and font sizes
- **Desktop**: Full table with all features

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly structure
- High contrast colors for visibility

## Technical Details

### Performance
- Lazy loading: Only fetches data when component is displayed
- Efficient Firebase queries using date ranges
- Optimized re-renders with Vue's reactivity system

### Error Handling
- Graceful fallbacks for missing data
- Loading states during data fetch
- Error logging for debugging

### Styling
- Uses Tailwind CSS classes for consistency
- Custom CSS for advanced styling (scrollbars, animations)
- Matches existing component design patterns

## Future Enhancements
- Export data functionality
- Temperature trend indicators
- Historical data comparison
- Alert thresholds configuration
- Data interpolation for missing readings
