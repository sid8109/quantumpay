"use client"

export const TextInput = ({
    placeholder,
    onChange,
    label,
    type,
    error,
    value
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    type: "text" | "password" | "number" | "email";
    error?: string;
    value?: string
}) => {
    return <div className="pt-2">
        <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type={type} value={value} className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${error ? 'border-red-500' : 'border-gray-300'}`} placeholder={placeholder} />
        {error && <p className="text-red-500 text-xs mt-0.5 font-bold">{error}</p>}
    </div>
}