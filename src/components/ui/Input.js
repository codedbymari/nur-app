export function Input({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  error,
  className = ''
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-nur-burgundy mb-2">
          {label} {required && <span className="text-nur-red">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nur-burgundy focus:border-transparent ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Add this line to support both import styles
export default Input;