"use client"
export const Select = ({ options, onSelect }: {
    onSelect: (value: string) => void;
    options: {
        key: string;
        value: string;
    }[];
}) => {
    return <select onChange={(e) => {
        onSelect(e.target.value)
    }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm cursor-pointer rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3">
        {options.map(option => <option value={option.key}>{option.value}</option>)}
  </select>
}