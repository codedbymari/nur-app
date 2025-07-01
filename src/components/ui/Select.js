export function Select({ label, options, error, required, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-nur-burgundy focus:border-nur-burgundy
          ${error ? 'border-red-500' : ''}
          bg-white
        `}
        {...props}
      >
        <option value="">Velg...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Add this line to support both import styles
export default Select;