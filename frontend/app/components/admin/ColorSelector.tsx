'use client';

interface ColorOption {
  name: string;
  value: string;
}

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

const COLORS: ColorOption[] = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Rose', value: '#FFC0CB' },
  { name: 'Violet', value: '#800080' },
  { name: 'Marron', value: '#8B4513' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Marine', value: '#000080' },
  { name: 'Bordeaux', value: '#800020' },
  { name: 'Kaki', value: '#C3B091' },
];

export default function ColorSelector({ selectedColors, onChange }: ColorSelectorProps) {
  const handleColorToggle = (colorValue: string) => {
    if (selectedColors.includes(colorValue)) {
      // Remove color
      onChange(selectedColors.filter((c) => c !== colorValue));
    } else {
      // Add color
      onChange([...selectedColors, colorValue]);
    }
  };

  const isSelected = (colorValue: string) => selectedColors.includes(colorValue);

  return (
    <div>
      <div className="grid grid-cols-5 md:grid-cols-8 gap-3">
        {COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handleColorToggle(color.value)}
            className={`group relative aspect-square rounded-lg transition-all hover:scale-110 ${
              isSelected(color.value)
                ? 'ring-4 ring-accent ring-offset-2 ring-offset-neutral-800'
                : 'ring-2 ring-neutral-600 hover:ring-neutral-500'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`${color.name}${isSelected(color.value) ? ' (sélectionné)' : ''}`}
          >
            {/* Checkmark for selected colors */}
            {isSelected(color.value) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 drop-shadow-lg"
                  fill="none"
                  stroke={color.value === '#FFFFFF' || color.value === '#FFFF00' || color.value === '#F5F5DC' ? '#000000' : '#FFFFFF'}
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Tooltip on hover */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {color.name}
            </span>

            {/* Special border for white color */}
            {color.value === '#FFFFFF' && (
              <div className="absolute inset-0 rounded-lg border-2 border-neutral-300"></div>
            )}
          </button>
        ))}
      </div>

      {/* Selected colors summary */}
      {selectedColors.length > 0 && (
        <div className="mt-4 p-3 bg-neutral-900 rounded-lg">
          <p className="text-sm text-neutral-400 mb-2">
            {selectedColors.length} couleur{selectedColors.length > 1 ? 's' : ''} sélectionnée{selectedColors.length > 1 ? 's' : ''} :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((colorValue) => {
              const color = COLORS.find((c) => c.value === colorValue);
              return (
                <span
                  key={colorValue}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full text-sm text-neutral-300"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-600"
                    style={{ backgroundColor: colorValue }}
                  ></span>
                  {color?.name || colorValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
