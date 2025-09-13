import React from 'react';
import CityCard from './CityCard';

export default function WeatherList({ result, unit = 'C', onSelect = () => {}, onRemove = () => {} }) {
  const successes = result.successes || [];
  return (
    <div className="weather-list-grid fade-in">
      {successes.map((item) => (
        <CityCard
          key={item.id}
          item={item}
          unit={unit}
          onClick={() => onSelect(item)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </div>
  );
}
